import { execFileSync } from "node:child_process";
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import migrationBaseline from "../.github/bundle-size-baseline.json" with {
  type: "json",
};
import checks from "../.size-limit.cjs";
import policy from "./bundle-size-policy.cjs";

if (process.env.LAGO_SIZE_CHECKS !== undefined) {
  throw new Error(
    "LAGO_SIZE_CHECKS is reserved for internal measurement batches."
  );
}

export const MAX_CORE_COMPONENT_BYTES = 10_000;
export const MAX_GROWTH_PERCENT = policy.maxGrowthPercent;
const MEASUREMENT_BATCH_SIZE = 6;
export const MEASUREMENT = policy.measurement;
export const MEASUREMENT_NAMES = checks.map(({ name }) => name);
const root = fileURLToPath(new URL("../", import.meta.url));
const bootstrapPath = path.join(root, ".github/bundle-size-baseline.json");
const isSize = (value) => Number.isSafeInteger(value) && value > 0;
const isVersion = (value) =>
  typeof value === "string" && /^\d+\.\d+\.\d+$/.test(value);

export function validatePolicy(
  definitions = checks,
  settings = policy,
  publishedSizes = migrationBaseline.sizes
) {
  const legacy =
    settings?.legacyComponentBudgets === undefined
      ? {}
      : settings.legacyComponentBudgets;
  const names = Array.isArray(definitions)
    ? definitions.map((entry) => entry?.name)
    : [];
  if (
    names.length === 0 ||
    names.some((name) => typeof name !== "string" || !name.trim()) ||
    new Set(names).size !== names.length ||
    !Number.isFinite(settings?.maxGrowthPercent) ||
    settings.maxGrowthPercent < 0 ||
    typeof settings.measurement !== "string" ||
    !settings.measurement.trim() ||
    !Array.isArray(settings.reportOnly) ||
    new Set(settings.reportOnly).size !== settings.reportOnly.length ||
    settings.reportOnly.some((name) => !names.includes(name)) ||
    !legacy ||
    typeof legacy !== "object" ||
    Array.isArray(legacy) ||
    Object.entries(legacy).some(
      ([name, budget]) =>
        !Object.hasOwn(publishedSizes, name) ||
        !isSize(publishedSizes[name]) ||
        publishedSizes[name] <= MAX_CORE_COMPONENT_BYTES ||
        !Object.hasOwn(settings.componentBudgets ?? {}, name) ||
        !isSize(budget)
    ) ||
    !settings.componentBudgets ||
    typeof settings.componentBudgets !== "object" ||
    Array.isArray(settings.componentBudgets) ||
    Object.entries(settings.componentBudgets).some(
      ([name, budget]) =>
        !names.includes(name) ||
        !isSize(budget) ||
        (budget > MAX_CORE_COMPONENT_BYTES &&
          (!Object.hasOwn(legacy, name) || budget > legacy[name])) ||
        settings.reportOnly.includes(name)
    )
  ) {
    throw new Error(
      `Invalid bundle measurement policy. Core budgets must be at most ${MAX_CORE_COMPONENT_BYTES} B unless covered by an audited legacy exception.`
    );
  }
  return settings;
}

validatePolicy();

export function validateCoreExports(
  exportNames,
  definitions = checks,
  settings = policy
) {
  if (
    !Array.isArray(exportNames) ||
    exportNames.length === 0 ||
    exportNames.some((name) => typeof name !== "string") ||
    new Set(exportNames).size !== exportNames.length
  ) {
    throw new Error("Cannot discover the public core runtime exports.");
  }
  const missing = exportNames.filter(
    (name) =>
      !Object.hasOwn(settings.componentBudgets, name) ||
      !definitions.some(
        (entry) =>
          entry.name === name &&
          entry.path === "dist/index.mjs" &&
          entry.import === `{ ${name} }`
      )
  );
  if (missing.length) {
    throw new Error(
      `Core exports require explicit budgets of at most ${MAX_CORE_COMPONENT_BYTES} B: ${missing.join(", ")}. Add a budget or move them to a separate public entry.`
    );
  }
  const stale = Object.keys(settings.componentBudgets).filter(
    (name) => !exportNames.includes(name)
  );
  if (stale.length) {
    throw new Error(
      `Budgets reference exports outside core: ${stale.join(", ")}.`
    );
  }
  return exportNames;
}

export function validateBaseline(
  baseline,
  expectedVersion = baseline?.version
) {
  if (
    baseline?.schemaVersion !== 2 ||
    baseline.measurement !== MEASUREMENT ||
    !isVersion(baseline.version) ||
    baseline.version !== expectedVersion ||
    !baseline.sizes ||
    typeof baseline.sizes !== "object" ||
    Array.isArray(baseline.sizes) ||
    !Object.values(baseline.sizes).every(isSize) ||
    MEASUREMENT_NAMES.some(
      (name) =>
        !Object.hasOwn(baseline.sizes, name) &&
        !Object.hasOwn(policy.componentBudgets, name)
    )
  ) {
    throw new Error("Invalid or incompatible consumer bundle baseline.");
  }
  return baseline;
}

export function parseMeasurement(output, expectedNames = MEASUREMENT_NAMES) {
  const results = JSON.parse(output);
  if (
    !Array.isArray(results) ||
    results.length !== expectedNames.length ||
    new Set(results.map((result) => result?.name)).size !== results.length ||
    results.some(
      (result) => !expectedNames.includes(result?.name) || !isSize(result?.size)
    )
  ) {
    throw new Error(
      "Size Limit did not return every named bundle measurement."
    );
  }
  return Object.fromEntries(results.map(({ name, size }) => [name, size]));
}

export function compareSizes(baselineBytes, currentBytes, budgetBytes) {
  if (
    !isSize(currentBytes) ||
    (baselineBytes !== undefined && !isSize(baselineBytes)) ||
    (budgetBytes !== undefined && !isSize(budgetBytes)) ||
    (baselineBytes === undefined && budgetBytes === undefined)
  ) {
    throw new Error("Bundle sizes and budgets must be positive integers.");
  }
  const growthLimit =
    baselineBytes === undefined
      ? Infinity
      : Math.floor((baselineBytes * (100 + MAX_GROWTH_PERCENT)) / 100);
  const limitBytes = Math.min(growthLimit, budgetBytes ?? Infinity);
  return {
    baselineBytes,
    currentBytes,
    limitBytes,
    deltaBytes:
      baselineBytes === undefined ? undefined : currentBytes - baselineBytes,
    growthPercent:
      baselineBytes === undefined
        ? undefined
        : ((currentBytes - baselineBytes) / baselineBytes) * 100,
    passed: currentBytes <= limitBytes,
  };
}

export function compareMeasurements(baseline, current) {
  validateBaseline(baseline);
  // Reuse output validation so callers cannot accidentally skip a measurement.
  parseMeasurement(
    JSON.stringify(
      Object.entries(current).map(([name, size]) => ({ name, size }))
    )
  );
  return MEASUREMENT_NAMES.map((name) => {
    const comparison = compareSizes(
      baseline.sizes[name],
      current[name],
      policy.componentBudgets[name]
    );
    const reportOnly = policy.reportOnly.includes(name);
    return {
      name,
      ...comparison,
      reportOnly,
      limitBytes: reportOnly ? undefined : comparison.limitBytes,
      passed: reportOnly || comparison.passed,
    };
  });
}

export async function getReleaseBaseline(bootstrap, fetchImpl = fetch) {
  validateBaseline(bootstrap);
  const registryUrl = "https://registry.npmjs.org/@code-x%2Flago/latest";
  const published = await fetchImpl(registryUrl, {
    signal: AbortSignal.timeout(30_000),
  });
  if (!published.ok) {
    throw new Error(
      `Cannot resolve the latest npm release: ${published.status}`
    );
  }
  const { version } = await published.json();
  if (!isVersion(version)) {
    throw new Error("npm did not return a stable release version.");
  }
  const releaseUrl = `https://github.com/sdaconceicao/lago/releases/download/lago-v${version}/bundle-size.json`;
  const response = await fetchImpl(releaseUrl, {
    signal: AbortSignal.timeout(30_000),
  });
  if (response.status === 404 && version === bootstrap.version) {
    return {
      ...bootstrap,
      source: `${version} consumer-measurement migration`,
    };
  }
  if (!response.ok) {
    throw new Error(
      `Cannot load bundle-size.json for release ${version}: ${response.status}`
    );
  }
  const baseline = await response.json();
  if (
    version === bootstrap.version &&
    baseline?.schemaVersion === 1 &&
    baseline.measurement === "core-exports-gzip-v1" &&
    baseline.version === version &&
    baseline.sizeBytes === bootstrap.sizes["Core exports"]
  ) {
    return {
      ...bootstrap,
      source: `${version} consumer-measurement migration`,
    };
  }
  return {
    ...validateBaseline(baseline, version),
    source: `release ${version}`,
  };
}

async function measureBundles() {
  const core = await import(pathToFileURL(path.join(root, "dist/index.mjs")));
  validateCoreExports(Object.keys(core));
  const cli = path.join(root, "node_modules/size-limit/bin.js");
  const results = [];
  for (
    let offset = 0;
    offset < MEASUREMENT_NAMES.length;
    offset += MEASUREMENT_BATCH_SIZE
  ) {
    const names = MEASUREMENT_NAMES.slice(
      offset,
      offset + MEASUREMENT_BATCH_SIZE
    );
    let output;
    try {
      output = execFileSync(process.execPath, [cli, "--json"], {
        cwd: root,
        encoding: "utf8",
        env: { ...process.env, LAGO_SIZE_CHECKS: JSON.stringify(names) },
        stdio: ["ignore", "pipe", "inherit"],
      });
    } catch (error) {
      // Size Limit emits configuration/build errors as JSON on stdout.
      if (error.stdout) process.stderr.write(error.stdout);
      throw error;
    }
    const batch = parseMeasurement(output, names);
    results.push(
      ...Object.entries(batch).map(([name, size]) => ({ name, size }))
    );
  }
  return parseMeasurement(JSON.stringify(results));
}

export function formatReport(comparisons, source) {
  const bytes = (value) => (value === undefined ? "—" : `${value} B`);
  const rows = comparisons.map((comparison) => {
    const growth =
      comparison.growthPercent === undefined
        ? "—"
        : `${comparison.growthPercent.toFixed(3)}%`;
    const result = comparison.reportOnly
      ? "REPORT"
      : comparison.passed
        ? "PASS"
        : "FAIL";
    return `| ${comparison.name} | ${bytes(comparison.baselineBytes)} | ${bytes(comparison.currentBytes)} | ${bytes(comparison.deltaBytes)} | ${growth} | ${bytes(comparison.limitBytes)} | ${result} |`;
  });
  return [
    "### Consumer bundle sizes (minified JavaScript / shared CSS + gzip)",
    "",
    `Baseline: ${source}`,
    "",
    `Every core runtime export has an explicit budget. New exports are capped at ${MAX_CORE_COMPONENT_BYTES} B gzip; listed legacy exceptions retain their budgets. Existing cases also allow at most +${MAX_GROWTH_PERCENT}% cumulative growth. Core exports reports catalog growth only.`,
    "",
    "| Measurement | Baseline | Current | Change | Growth | Maximum | Result |",
    "| :--- | ---: | ---: | ---: | ---: | ---: | :--- |",
    ...rows,
    "",
  ].join("\n");
}

async function main() {
  const [command = "check", filename] = process.argv.slice(2);
  if (command === "record" && filename) {
    const { version } = JSON.parse(
      await readFile(path.join(root, "package.json"), "utf8")
    );
    const baseline = validateBaseline({
      schemaVersion: 2,
      measurement: MEASUREMENT,
      version,
      sizes: await measureBundles(),
    });
    await mkdir(path.dirname(filename), { recursive: true });
    await writeFile(filename, `${JSON.stringify(baseline, null, 2)}\n`);
    process.stdout.write(
      `Recorded ${MEASUREMENT_NAMES.length} bundle measurements.\n`
    );
    return;
  }
  if (command !== "check") {
    throw new Error(
      "Usage: bundle-size.mjs check [baseline] | record <output>"
    );
  }
  const baseline = filename
    ? validateBaseline(JSON.parse(await readFile(filename, "utf8")))
    : await getReleaseBaseline(
        JSON.parse(await readFile(bootstrapPath, "utf8"))
      );
  const comparisons = compareMeasurements(baseline, await measureBundles());
  const report = formatReport(comparisons, baseline.source ?? filename);
  process.stdout.write(report);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, report);
  }
  const failures = comparisons.filter(({ passed }) => !passed);
  if (failures.length) {
    throw new Error(
      `Bundle size budgets exceeded: ${failures.map(({ name }) => name).join(", ")}.`
    );
  }
}

if (import.meta.main) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
