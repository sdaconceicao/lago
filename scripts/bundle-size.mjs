import { execFileSync } from "node:child_process";
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const MAX_GROWTH_PERCENT = 5;
export const MEASUREMENT = "core-exports-gzip-v1";
const root = fileURLToPath(new URL("../", import.meta.url));
const bootstrapPath = path.join(root, ".github/bundle-size-baseline.json");

export function validateBaseline(
  baseline,
  expectedVersion = baseline?.version
) {
  if (
    baseline?.schemaVersion !== 1 ||
    baseline.measurement !== MEASUREMENT ||
    !/^\d+\.\d+\.\d+$/.test(baseline.version) ||
    baseline.version !== expectedVersion ||
    !Number.isSafeInteger(baseline.sizeBytes) ||
    baseline.sizeBytes <= 0
  ) {
    throw new Error("Invalid or incompatible core bundle baseline.");
  }
  return baseline;
}

export function parseMeasurement(output) {
  const results = JSON.parse(output);
  if (
    !Array.isArray(results) ||
    results.length !== 1 ||
    results[0]?.name !== "Core exports" ||
    !Number.isSafeInteger(results[0].size) ||
    results[0].size <= 0
  ) {
    throw new Error("Size Limit did not return one valid core measurement.");
  }
  return results[0].size;
}

export function compareSizes(baselineBytes, currentBytes) {
  for (const size of [baselineBytes, currentBytes]) {
    if (!Number.isSafeInteger(size) || size <= 0) {
      throw new Error("Bundle sizes must be positive integers.");
    }
  }
  const limitBytes = Math.floor(
    (baselineBytes * (100 + MAX_GROWTH_PERCENT)) / 100
  );
  return {
    baselineBytes,
    currentBytes,
    limitBytes,
    deltaBytes: currentBytes - baselineBytes,
    growthPercent: ((currentBytes - baselineBytes) / baselineBytes) * 100,
    passed: currentBytes <= limitBytes,
  };
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
  if (typeof version !== "string" || !/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error("npm did not return a stable release version.");
  }
  const releaseUrl = `https://github.com/sdaconceicao/lago/releases/download/lago-v${version}/bundle-size.json`;
  const response = await fetchImpl(releaseUrl, {
    signal: AbortSignal.timeout(30_000),
  });
  if (response.status === 404 && version === bootstrap.version) {
    return { ...bootstrap, source: `${version} core-split bootstrap` };
  }
  if (!response.ok) {
    throw new Error(
      `Cannot load bundle-size.json for release ${version}: ${response.status}`
    );
  }
  return {
    ...validateBaseline(await response.json(), version),
    source: `release ${version}`,
  };
}

function measureCore() {
  const cli = path.join(root, "node_modules/size-limit/bin.js");
  return parseMeasurement(
    execFileSync(process.execPath, [cli, "--json"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "inherit"],
    })
  );
}

export function formatReport(comparison, source) {
  return [
    "### Core bundle size (minified + gzip)",
    "",
    `Baseline: ${source}`,
    "",
    `| Baseline | Current | Change | Growth | Maximum (+${MAX_GROWTH_PERCENT}%) | Result |`,
    "| ---: | ---: | ---: | ---: | ---: | :--- |",
    `| ${comparison.baselineBytes} B | ${comparison.currentBytes} B | ${comparison.deltaBytes} B | ${comparison.growthPercent.toFixed(3)}% | ${comparison.limitBytes} B | ${comparison.passed ? "PASS" : "FAIL"} |`,
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
      schemaVersion: 1,
      measurement: MEASUREMENT,
      version,
      sizeBytes: measureCore(),
    });
    await mkdir(path.dirname(filename), { recursive: true });
    await writeFile(filename, `${JSON.stringify(baseline, null, 2)}\n`);
    process.stdout.write(`Recorded core baseline: ${baseline.sizeBytes} B\n`);
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
  const comparison = compareSizes(baseline.sizeBytes, measureCore());
  const report = formatReport(comparison, baseline.source ?? filename);
  process.stdout.write(report);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, report);
  }
  if (!comparison.passed) {
    throw new Error(`Core bundle growth exceeds ${MAX_GROWTH_PERCENT}%.`);
  }
}

if (import.meta.main) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
