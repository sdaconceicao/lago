import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  appendFile,
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  CORE_EXPORT_NAMES,
  compareMeasurements,
  compareSizes,
  formatReport,
  getReleaseBaseline,
  MAX_CORE_COMPONENT_BYTES,
  MEASUREMENT,
  MEASUREMENT_NAMES,
  parseMeasurement,
  validateBaseline,
  validateCoreExports,
  validatePolicy,
} from "./bundle-size.mjs";
import policy from "./bundle-size-policy.cjs";

const migrationSeed = JSON.parse(
  await readFile(
    new URL("../.github/bundle-size-baseline.json", import.meta.url),
    "utf8"
  )
);
const sizes = Object.fromEntries(
  MEASUREMENT_NAMES.map((name) => [name, migrationSeed.sizes[name] ?? 1_000])
);
const bootstrap = {
  schemaVersion: 2,
  measurement: MEASUREMENT,
  version: "0.10.1",
  sizes,
};
const output = (values = sizes) =>
  JSON.stringify(
    Object.entries(values).map(([name, size]) => ({ name, size }))
  );
const response = (body, status = 200) =>
  new Response(JSON.stringify(body), { status });

function fetchSequence(...responses) {
  return async () => {
    const next = responses.shift();
    assert.ok(next, "Unexpected network request");
    return next;
  };
}

describe("measurement policy validation", () => {
  const definitions = [{ name: "Catalog" }, { name: "Component" }];
  const settings = {
    measurement: "consumer-test-gzip",
    maxGrowthPercent: 5,
    defaultCoreBudget: 10_000,
    reportOnly: ["Catalog"],
    componentBudgets: { Component: 1_024 },
  };

  it("accepts the repo policy and explicit zero-growth policies", () => {
    assert.ok(validatePolicy());
    assert.equal(validatePolicy(definitions, settings), settings);
    const zeroGrowth = { ...settings, maxGrowthPercent: 0 };
    assert.equal(validatePolicy(definitions, zeroGrowth), zeroGrowth);
  });

  it("rejects missing, empty or duplicate measurement definitions", () => {
    for (const invalid of [
      null,
      {},
      [],
      [null],
      [{}],
      [{ name: "" }],
      [{ name: " " }],
      [{ name: 1 }],
      [definitions[0], definitions[0]],
    ]) {
      assert.throws(() => validatePolicy(invalid, settings));
    }
  });

  it("rejects invalid growth limits, identifiers and report-only lists", () => {
    const invalidSettings = [
      null,
      {},
      { ...settings, measurement: null },
      { ...settings, measurement: "" },
      { ...settings, measurement: " " },
      { ...settings, reportOnly: null },
      { ...settings, reportOnly: {} },
      { ...settings, reportOnly: ["Unknown"] },
      { ...settings, reportOnly: ["Catalog", "Catalog"] },
    ];
    for (const maxGrowthPercent of [-1, Infinity, NaN, "5", null]) {
      invalidSettings.push({ ...settings, maxGrowthPercent });
    }
    for (const invalid of invalidSettings) {
      assert.throws(() => validatePolicy(definitions, invalid));
    }
  });

  it("rejects report-only core exports even without a budget override", () => {
    const directImports = [
      { name: "Catalog", path: "dist/index.mjs", import: "*" },
      { name: "Component", path: "dist/index.mjs", import: "{ Component }" },
    ];
    const defaultBudgetSettings = { ...settings, componentBudgets: {} };
    assert.doesNotThrow(() =>
      validatePolicy(directImports, defaultBudgetSettings)
    );
    assert.throws(() =>
      validatePolicy(directImports, {
        ...defaultBudgetSettings,
        reportOnly: ["Catalog", "Component"],
      })
    );
  });

  it("rejects unknown, overlapping or malformed component budgets", () => {
    const invalidBudgets = [
      null,
      [],
      { Unknown: 1_024 },
      { Catalog: 1_024 },
      { Component: 10_001 },
    ];
    for (const budget of [
      0,
      -1,
      1.5,
      Infinity,
      "1024",
      null,
      Number.MAX_SAFE_INTEGER + 1,
    ]) {
      invalidBudgets.push({ Component: budget });
    }
    for (const componentBudgets of invalidBudgets) {
      assert.throws(() =>
        validatePolicy(definitions, { ...settings, componentBudgets })
      );
    }
    assert.ok(
      validatePolicy(definitions, { ...settings, componentBudgets: {} })
    );
  });

  it("caps the default budget at exactly 10,000 gzip bytes", () => {
    assert.equal(MAX_CORE_COMPONENT_BYTES, 10_000);
    assert.equal(policy.defaultCoreBudget, 10_000);
    assert.doesNotThrow(() =>
      validatePolicy(definitions, {
        ...settings,
        defaultCoreBudget: 10_000,
      })
    );
    for (const defaultCoreBudget of [
      undefined,
      0,
      -1,
      1.5,
      Infinity,
      NaN,
      "10000",
      null,
      10_001,
      Number.MAX_SAFE_INTEGER + 1,
    ]) {
      assert.throws(() =>
        validatePolicy(definitions, { ...settings, defaultCoreBudget })
      );
    }
  });

  it("permits audited existing exceptions but rejects forged legacy names and caps", () => {
    const legacySettings = {
      ...settings,
      componentBudgets: { Component: 12_000 },
      legacyComponentBudgets: { Component: 12_000 },
    };
    assert.doesNotThrow(() =>
      validatePolicy(definitions, legacySettings, { Component: 11_000 })
    );
    assert.throws(() => validatePolicy(definitions, legacySettings, {}));
    for (const size of [10_000, 0, -1, null, "11000"]) {
      assert.throws(() =>
        validatePolicy(definitions, legacySettings, { Component: size })
      );
    }
    assert.throws(() =>
      validatePolicy(
        definitions,
        {
          ...legacySettings,
          componentBudgets: { Component: 12_001 },
        },
        { Component: 11_000 }
      )
    );
    for (const legacyComponentBudgets of [
      null,
      [],
      { Unknown: 12_000 },
      { Catalog: 12_000 },
      { Component: 0 },
    ]) {
      assert.throws(() =>
        validatePolicy(
          definitions,
          {
            ...legacySettings,
            legacyComponentBudgets,
          },
          { Component: 11_000 }
        )
      );
    }
  });
});

describe("core runtime export coverage", () => {
  const definition = (name) => ({
    name,
    path: "dist/index.mjs",
    import: `{ ${name} }`,
  });
  const settings = (componentBudgets) => ({
    measurement: "consumer-test-gzip",
    maxGrowthPercent: 5,
    defaultCoreBudget: 10_000,
    reportOnly: [],
    componentBudgets,
  });

  it("measures every discovered core export without requiring a budget override", () => {
    assert.doesNotThrow(() => validateCoreExports(CORE_EXPORT_NAMES));
    for (const name of [
      "getTelephoneDigits",
      "CardBrandImage",
      "getCardBrandLogoUrl",
    ]) {
      assert.ok(CORE_EXPORT_NAMES.includes(name));
      assert.equal(Object.hasOwn(policy.componentBudgets, name), false);
    }
    assert.equal(CORE_EXPORT_NAMES.includes("CARD_BRAND_LOGOS"), false);
  });

  it("fails a new export without its named-import measurement", () => {
    assert.throws(
      () =>
        validateCoreExports(
          ["Component", "NewFeature"],
          [definition("Component")],
          settings({})
        ),
      (error) =>
        /NewFeature/.test(error.message) &&
        /named-import measurements/i.test(error.message)
    );
  });

  it("measures utilities, constants and lowercase aliases with the default budget", () => {
    for (const name of ["formatValue", "CARD_BRANDS", "buttonAlias"]) {
      assert.throws(() => validateCoreExports([name], [], settings({})));
      assert.doesNotThrow(() =>
        validateCoreExports([name], [definition(name)], settings({}))
      );
    }
  });

  it("rejects stale overrides and measurements that do not isolate the root named import", () => {
    assert.throws(() =>
      validateCoreExports(
        ["Component"],
        [definition("Component"), definition("Removed")],
        settings({ Component: 10_000, Removed: 10_000 })
      )
    );
    for (const invalid of [
      [],
      [{ ...definition("Component"), path: "dist/optional.mjs" }],
      [{ ...definition("Component"), import: "*" }],
      [{ ...definition("Component"), import: "{ Other }" }],
      [{ ...definition("Component"), import: "{ Component, Other }" }],
    ]) {
      assert.throws(() =>
        validateCoreExports(
          ["Component"],
          invalid,
          settings({ Component: 10_000 })
        )
      );
    }
  });
});

describe("consumer bundle growth", () => {
  it("accepts shrinkage and exactly 5% growth, but rejects one byte more", () => {
    assert.equal(compareSizes(50_000, 49_000).passed, true);
    assert.equal(compareSizes(50_000, 52_500).passed, true);
    const over = compareSizes(50_000, 52_501);
    assert.equal(over.passed, false);
    assert.equal(over.limitBytes, 52_500);
    assert.equal(over.deltaBytes, 2_501);
    assert.ok(over.growthPercent > 5);
  });

  it("does not round fractional byte allowances upward", () => {
    assert.equal(compareSizes(101, 106).passed, true);
    assert.equal(compareSizes(101, 107).passed, false);
  });

  it("enforces the tighter of release growth and an absolute component budget", () => {
    assert.equal(compareSizes(20_000, 21_000, 24_576).limitBytes, 21_000);
    assert.equal(compareSizes(24_000, 24_576, 24_576).passed, true);
    assert.equal(compareSizes(24_000, 24_577, 24_576).passed, false);
    assert.equal(compareSizes(24_000, 24_577, 24_576).limitBytes, 24_576);
  });

  it("applies the default 10,000-byte budget to CreditCardNumber", () => {
    for (const currentBytes of [10_000, 10_001]) {
      const comparison = compareMeasurements(bootstrap, {
        ...sizes,
        CreditCardNumber: currentBytes,
      }).find(({ name }) => name === "CreditCardNumber");
      assert.equal(comparison.baselineBytes, 21_060);
      assert.equal(comparison.limitBytes, 10_000);
      assert.equal(comparison.passed, currentBytes <= 10_000);
    }
  });

  it("allows a new measurement when its absolute budget is supplied", () => {
    assert.deepEqual(compareSizes(undefined, 10_000, 10_000), {
      baselineBytes: undefined,
      currentBytes: 10_000,
      limitBytes: 10_000,
      deltaBytes: undefined,
      growthPercent: undefined,
      passed: true,
    });
    assert.equal(compareSizes(undefined, 10_001, 10_000).passed, false);
    assert.throws(() => compareSizes(undefined, 100));
  });

  it("rejects invalid sizes and budgets instead of passing a broken check", () => {
    for (const invalid of [
      0,
      -1,
      1.5,
      NaN,
      Infinity,
      "50000",
      null,
      Number.MAX_SAFE_INTEGER + 1,
    ]) {
      assert.throws(() => compareSizes(invalid, 50_000));
      assert.throws(() => compareSizes(50_000, invalid));
      assert.throws(() => compareSizes(50_000, 50_000, invalid));
    }
  });

  it("reports catalog growth without weakening named-import and stylesheet checks", () => {
    const current = {
      ...sizes,
      "Core exports": 100_000,
      Button: 1_027,
      "Shared styles": 24_807,
      CreditCardNumber: 25_000,
    };
    const baselineCopy = structuredClone(bootstrap);
    const currentCopy = structuredClone(current);
    const comparisons = compareMeasurements(bootstrap, current);
    const catalog = comparisons.find(({ name }) => name === "Core exports");
    assert.equal(catalog.reportOnly, true);
    assert.equal(catalog.passed, true);
    assert.equal(catalog.limitBytes, undefined);
    assert.equal(catalog.deltaBytes, 47_413);
    for (const name of ["Button", "Shared styles", "CreditCardNumber"]) {
      const comparison = comparisons.find((entry) => entry.name === name);
      assert.equal(comparison.reportOnly, false);
      assert.equal(comparison.passed, false, name);
    }
    assert.deepEqual(bootstrap, baselineCopy);
    assert.deepEqual(current, currentCopy);
  });

  it("applies only release growth to the representative form and shared stylesheet", () => {
    const baseline = {
      ...bootstrap,
      sizes: {
        ...sizes,
        "Representative form": 20_000,
        "Shared styles": 20_000,
      },
    };
    for (const size of [21_000, 21_001]) {
      const comparisons = compareMeasurements(baseline, {
        ...sizes,
        "Representative form": size,
        "Shared styles": size,
      });
      for (const name of ["Representative form", "Shared styles"]) {
        const comparison = comparisons.find((entry) => entry.name === name);
        assert.equal(comparison.limitBytes, 21_000);
        assert.equal(comparison.passed, size === 21_000);
      }
    }
  });

  it("reports each source, exact sizes, percentage, limit and verdict", () => {
    const report = formatReport(
      compareMeasurements(bootstrap, {
        ...sizes,
        "Core exports": 100_000,
        Button: 1_027,
      }),
      "release 0.10.1"
    );
    assert.match(report, /release 0\.10\.1/);
    assert.match(
      report,
      /Button \| 978 B \| 1027 B \| 49 B \| 5\.010% \| 1026 B \| FAIL/
    );
    assert.match(report, /Core exports .*\| — \| REPORT/);
    assert.match(report, /TextField .*\| PASS/);
    const { getTelephoneDigits: _helper, ...withoutHelper } = sizes;
    const newComponentReport = formatReport(
      compareMeasurements({ ...bootstrap, sizes: withoutHelper }, sizes),
      "migration"
    );
    assert.match(
      newComponentReport,
      /getTelephoneDigits \| — \| 1000 B \| — \| — \| 10000 B \| PASS/
    );
  });
});

describe("Size Limit output and baseline validation", () => {
  it("reads every named result regardless of output ordering", () => {
    assert.deepEqual(parseMeasurement(output()), sizes);
    assert.deepEqual(
      parseMeasurement(JSON.stringify(JSON.parse(output()).reverse())),
      sizes
    );
  });

  it("rejects missing, duplicated, renamed, additional or invalid results", () => {
    const results = JSON.parse(output());
    const invalidResults = [
      null,
      {},
      [],
      results.slice(1),
      [...results, { name: "Editor", size: 50_000 }],
      results.map((result, index) => (index === 0 ? results[1] : result)),
      results.map((result, index) =>
        index === 0 ? { ...result, name: "Editor" } : result
      ),
      results.map((result, index) => (index === 0 ? null : result)),
    ];
    for (const invalid of [
      0,
      -1,
      1.5,
      "50000",
      null,
      Number.MAX_SAFE_INTEGER + 1,
    ]) {
      invalidResults.push(
        results.map((result, index) =>
          index === 0 ? { ...result, size: invalid } : result
        )
      );
    }
    for (const invalid of invalidResults) {
      assert.throws(() => parseMeasurement(JSON.stringify(invalid)));
    }
    assert.throws(() => parseMeasurement("build failed"));
  });

  it("validates each batch against only its requested measurement names", () => {
    const names = ["Button", "TextField"];
    const batch = [
      { name: "TextField", size: 1_004 },
      { name: "Button", size: 978 },
    ];
    assert.deepEqual(parseMeasurement(JSON.stringify(batch), names), {
      TextField: 1_004,
      Button: 978,
    });
    for (const invalid of [
      batch.slice(1),
      [batch[0], batch[0]],
      [...batch, { name: "Other", size: 1 }],
      [{ name: "Other", size: 1 }, batch[1]],
      [{ name: "TextField", size: null }, batch[1]],
    ]) {
      assert.throws(() => parseMeasurement(JSON.stringify(invalid), names));
    }
    assert.throws(() => parseMeasurement("not JSON", names));
  });

  it("accepts the complete contract and new core exports absent from the migration seed", () => {
    assert.deepEqual(validateBaseline(bootstrap, "0.10.1"), bootstrap);
    const {
      TelephoneField: _component,
      getTelephoneDigits: _helper,
      ...withoutNewExports
    } = sizes;
    const newComponentBaseline = { ...bootstrap, sizes: withoutNewExports };
    assert.deepEqual(
      validateBaseline(newComponentBaseline),
      newComponentBaseline
    );
  });

  it("preserves historical measurements for exports moved outside core", () => {
    assert.deepEqual(validateBaseline(migrationSeed, "0.10.1"), migrationSeed);
    assert.equal(migrationSeed.sizes.CARD_BRAND_LOGOS, 16_160);
    const comparisons = compareMeasurements(migrationSeed, sizes);
    assert.equal(
      comparisons.some(({ name }) => name === "CARD_BRAND_LOGOS"),
      false
    );
    for (const name of ["CardBrandImage", "getCardBrandLogoUrl"]) {
      const comparison = comparisons.find((entry) => entry.name === name);
      assert.equal(comparison.baselineBytes, undefined);
      assert.equal(comparison.limitBytes, 10_000);
    }
  });

  it("requires known published core measurements even when an override exists", () => {
    const { CreditCardNumber: _component, ...withoutPublishedComponent } =
      sizes;
    assert.throws(() =>
      validateBaseline({ ...bootstrap, sizes: withoutPublishedComponent })
    );
  });

  it("rejects corrupt, partial or incompatible baselines", () => {
    const invalidBaselines = [
      null,
      {},
      { ...bootstrap, schemaVersion: 1 },
      { ...bootstrap, measurement: "core-exports-gzip-v1" },
      { ...bootstrap, version: "not-a-version" },
      { ...bootstrap, version: "0.11.0-beta.1" },
      { ...bootstrap, sizes: null },
      { ...bootstrap, sizes: [] },
      { ...bootstrap, sizes: {} },
    ];
    for (const name of Object.keys(sizes).filter(
      (name) =>
        !CORE_EXPORT_NAMES.includes(name) ||
        Object.hasOwn(migrationSeed.sizes, name)
    )) {
      const incomplete = { ...sizes };
      delete incomplete[name];
      invalidBaselines.push({ ...bootstrap, sizes: incomplete });
    }
    for (const invalid of [
      0,
      -1,
      1.5,
      "50000",
      null,
      Number.MAX_SAFE_INTEGER + 1,
    ]) {
      invalidBaselines.push({
        ...bootstrap,
        sizes: { ...sizes, CreditCardNumber: invalid },
      });
      invalidBaselines.push({
        ...bootstrap,
        sizes: { ...sizes, "Retired component": invalid },
      });
    }
    for (const invalid of invalidBaselines) {
      assert.throws(() => validateBaseline(invalid));
    }
    assert.throws(() => validateBaseline(bootstrap, "0.11.0"));
  });
});

describe("release baseline selection", () => {
  it("uses npm latest to select the exact compatible release asset", async () => {
    const urls = [];
    const release = {
      ...bootstrap,
      version: "0.11.0",
      sizes: { ...sizes, Button: 900 },
    };
    const fetchImpl = async (url, options) => {
      urls.push(url);
      assert.ok(options.signal instanceof AbortSignal);
      return response(urls.length === 1 ? { version: "0.11.0" } : release);
    };
    const baseline = await getReleaseBaseline(bootstrap, fetchImpl);
    assert.equal(baseline.sizes.Button, 900);
    assert.equal(baseline.source, "release 0.11.0");
    assert.match(urls[0], /registry\.npmjs\.org/);
    assert.match(urls[1], /lago-v0\.11\.0\/bundle-size\.json$/);
  });

  it("uses the migration seed only for its exact release's missing asset", async () => {
    const baseline = await getReleaseBaseline(
      bootstrap,
      fetchSequence(response({ version: "0.10.1" }), response({}, 404))
    );
    assert.deepEqual(baseline.sizes, sizes);
    assert.equal(baseline.source, "0.10.1 consumer-measurement migration");
  });

  it("migrates the known v1 asset only when its version and core measurement match", async () => {
    const legacy = {
      schemaVersion: 1,
      measurement: "core-exports-gzip-v1",
      version: "0.10.1",
      sizeBytes: sizes["Core exports"],
    };
    const baseline = await getReleaseBaseline(
      bootstrap,
      fetchSequence(response({ version: "0.10.1" }), response(legacy))
    );
    assert.deepEqual(baseline.sizes, sizes);
    assert.equal(baseline.source, "0.10.1 consumer-measurement migration");
    for (const changed of [
      { measurement: "unknown" },
      { version: "0.10.0" },
      { sizeBytes: sizes["Core exports"] + 1 },
      { sizeBytes: String(sizes["Core exports"]) },
    ]) {
      await assert.rejects(
        getReleaseBaseline(
          bootstrap,
          fetchSequence(
            response({ version: "0.10.1" }),
            response({ ...legacy, ...changed })
          )
        ),
        /Invalid or incompatible/
      );
    }
    await assert.rejects(
      getReleaseBaseline(
        bootstrap,
        fetchSequence(
          response({ version: "0.11.0" }),
          response({ ...legacy, version: "0.11.0" })
        )
      ),
      /Invalid or incompatible/
    );
  });

  it("prefers a compatible release asset over the migration seed", async () => {
    const baseline = await getReleaseBaseline(
      bootstrap,
      fetchSequence(
        response({ version: "0.10.1" }),
        response({ ...bootstrap, sizes: { ...sizes, Button: 900 } })
      )
    );
    assert.equal(baseline.sizes.Button, 900);
    assert.equal(baseline.source, "release 0.10.1");
  });

  it("fails when a subsequent release has no baseline", async () => {
    await assert.rejects(
      getReleaseBaseline(
        bootstrap,
        fetchSequence(response({ version: "0.11.0" }), response({}, 404))
      ),
      /Cannot load bundle-size\.json.*0\.11\.0/
    );
  });

  it("does not hide registry, network or non-404 asset errors behind the seed", async () => {
    await assert.rejects(
      getReleaseBaseline(bootstrap, fetchSequence(response({}, 503))),
      /latest npm release: 503/
    );
    await assert.rejects(
      getReleaseBaseline(
        bootstrap,
        fetchSequence(response({ version: "0.10.1" }), response({}, 500))
      ),
      /0\.10\.1: 500/
    );
    await assert.rejects(
      getReleaseBaseline(bootstrap, async () => {
        throw new Error("Network unavailable");
      }),
      /Network unavailable/
    );
  });

  it("rejects malformed, prerelease and mismatched release data", async () => {
    for (const version of [undefined, "0.11.0-beta.1", "unexpected/path"]) {
      await assert.rejects(
        getReleaseBaseline(bootstrap, fetchSequence(response({ version }))),
        /stable release version/
      );
    }
    await assert.rejects(
      getReleaseBaseline(
        bootstrap,
        fetchSequence(response({ version: "0.11.0" }), response(bootstrap))
      ),
      /Invalid or incompatible/
    );
    await assert.rejects(
      getReleaseBaseline({}, async () => {
        throw new Error("Must not fetch");
      }),
      /Invalid or incompatible/
    );
  });
});

describe("command failures", () => {
  it("rejects an ambient batch filter instead of silently skipping checks", () => {
    for (const filter of ["[]", '["Button"]']) {
      const result = spawnSync(
        process.execPath,
        [fileURLToPath(new URL("./bundle-size.mjs", import.meta.url)), "check"],
        {
          encoding: "utf8",
          env: { ...process.env, LAGO_SIZE_CHECKS: filter },
        }
      );
      assert.equal(result.status, 1);
      assert.match(result.stderr, /reserved for internal measurement batches/);
      assert.doesNotMatch(result.stdout, /PASS/);
    }
  });

  it("fails invalid commands, missing record paths and missing baseline files", () => {
    for (const args of [
      ["unknown"],
      ["record"],
      ["check", "/no/baseline.json"],
    ]) {
      const result = spawnSync(
        process.execPath,
        [fileURLToPath(new URL("./bundle-size.mjs", import.meta.url)), ...args],
        { encoding: "utf8" }
      );
      assert.equal(result.status, 1);
      assert.ok(result.stderr.length > 0);
    }
  });
});

describe("Size Limit peer isolation", () => {
  it("counts optional peers in every named import while excluding shared peers and their subpaths", async (t) => {
    const directory = await mkdtemp(path.join(tmpdir(), "lago-size-peers-"));
    t.after(() => rm(directory, { recursive: true, force: true }));
    const engine = path.join(directory, "node_modules/@tiptap/core");
    await mkdir(engine, { recursive: true });
    await mkdir(path.join(directory, "dist"));
    await copyFile(
      fileURLToPath(new URL("../.size-limit.cjs", import.meta.url)),
      path.join(directory, ".size-limit.cjs")
    );
    const optionalExports = [
      "Button",
      "TextField",
      "Form",
      "Checkbox",
      "CreditCardNumber",
    ];
    const sharedModules = [
      {
        name: "react",
        files: { "index.js": "createElement", "jsx-runtime.js": "jsx" },
        exports: { ".": "./index.js", "./jsx-runtime": "./jsx-runtime.js" },
      },
      {
        name: "react-dom",
        files: { "client.js": "createRoot" },
        exports: { "./client": "./client.js" },
      },
      {
        name: "react-aria-components",
        files: { "Button.js": "AriaButton" },
        exports: { "./Button": "./Button.js" },
      },
    ];
    const sharedExports = sharedModules.flatMap(({ files }) =>
      Object.values(files)
    );
    await writeFile(
      path.join(directory, "package.json"),
      JSON.stringify({
        private: true,
        devDependencies: {
          "@size-limit/esbuild": "14.1.0",
          "@size-limit/file": "14.1.0",
        },
        peerDependencies: {
          "@tiptap/core": "*",
          react: "*",
          "react-dom": "*",
          "react-aria-components": "*",
        },
        peerDependenciesMeta: { "@tiptap/core": { optional: true } },
      })
    );
    await writeFile(
      path.join(engine, "package.json"),
      JSON.stringify({ type: "module", exports: "./index.js" })
    );
    const payload = Array.from({ length: 2048 }, (_, index) => index);
    await writeFile(
      path.join(engine, "index.js"),
      `export const payload = ${JSON.stringify(payload)};`
    );
    for (const { name, files, exports } of sharedModules) {
      const packageDirectory = path.join(directory, "node_modules", name);
      await mkdir(packageDirectory, { recursive: true });
      await writeFile(
        path.join(packageDirectory, "package.json"),
        JSON.stringify({ type: "module", exports })
      );
      for (const [file, exportedName] of Object.entries(files)) {
        await writeFile(
          path.join(packageDirectory, file),
          `export const ${exportedName} = ${JSON.stringify(payload)};`
        );
      }
    }
    await writeFile(
      path.join(directory, "dist/index.mjs"),
      [
        `export { ${optionalExports.map((name) => `payload as ${name}`).join(", ")} } from "@tiptap/core";`,
        'export { createElement } from "react";',
        'export { jsx } from "react/jsx-runtime";',
        'export { createRoot } from "react-dom/client";',
        'export { AriaButton } from "react-aria-components/Button";',
      ].join("\n")
    );
    await writeFile(
      path.join(directory, "dist/index.css"),
      ".fixture { color: rebeccapurple; }\n"
    );
    const result = spawnSync(
      process.execPath,
      [
        fileURLToPath(
          new URL("../node_modules/size-limit/bin.js", import.meta.url)
        ),
        "--json",
      ],
      { cwd: directory, encoding: "utf8" }
    );
    assert.equal(result.status, 0, result.stderr);
    const measured = parseMeasurement(result.stdout, [
      "Core exports",
      ...optionalExports,
      ...sharedExports,
      "Representative form",
      "Shared styles",
    ]);
    assert.equal(optionalExports.length + sharedExports.length, 9);
    for (const name of [
      "Core exports",
      "Representative form",
      ...optionalExports,
    ]) {
      assert.ok(
        measured[name] > 1_000,
        `${name} must include its optional peer implementation`
      );
    }
    for (const name of sharedExports) {
      assert.ok(
        measured[name] < 1_000,
        `${name} must exclude its shared peer implementation`
      );
    }
    assert.ok(measured["Shared styles"] > 0);
  });
});

async function createCliFixture(t, { withTooling = true } = {}) {
  const directory = await mkdtemp(path.join(tmpdir(), "lago-size-cli-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const scripts = path.join(directory, "scripts");
  await mkdir(scripts);
  await mkdir(path.join(directory, "dist"));
  await mkdir(path.join(directory, ".github"));
  const exports = ["Button", "TextField", "Form", "Checkbox"];
  const names = [
    "Core exports",
    ...exports,
    "Representative form",
    "Shared styles",
  ];
  const cli = path.join(scripts, "bundle-size.mjs");
  await copyFile(
    fileURLToPath(new URL("./bundle-size.mjs", import.meta.url)),
    cli
  );
  await copyFile(
    fileURLToPath(new URL("../.size-limit.cjs", import.meta.url)),
    path.join(directory, ".size-limit.cjs")
  );
  await writeFile(
    path.join(scripts, "bundle-size-policy.cjs"),
    `module.exports = ${JSON.stringify({ maxGrowthPercent: 5, measurement: MEASUREMENT, reportOnly: ["Core exports"], defaultCoreBudget: 10_000, componentBudgets: {} })};`
  );
  const baseline = {
    ...bootstrap,
    sizes: Object.fromEntries(names.map((name) => [name, 1_000])),
  };
  await writeFile(
    path.join(directory, ".github/bundle-size-baseline.json"),
    JSON.stringify(baseline)
  );
  await writeFile(
    path.join(directory, "package.json"),
    JSON.stringify({
      type: "module",
      version: "0.10.1",
      private: true,
      devDependencies: {
        "@size-limit/esbuild": "14.1.0",
        "@size-limit/file": "14.1.0",
      },
    })
  );
  const payload = Array.from({ length: 1024 }, (_, index) => index);
  await writeFile(
    path.join(directory, "dist/index.mjs"),
    [
      `const payload = ${JSON.stringify(payload)};`,
      ...exports.map((name) => `export const ${name} = payload;`),
    ].join("\n")
  );
  await writeFile(
    path.join(directory, "dist/index.css"),
    ".fixture { color: rebeccapurple; }\n"
  );
  if (withTooling) {
    await symlink(
      fileURLToPath(new URL("../node_modules", import.meta.url)),
      path.join(directory, "node_modules"),
      "dir"
    );
  }
  return { directory, cli, names, baseline };
}

describe("built payment logo entries", () => {
  const require = createRequire(import.meta.url);
  const brands = {
    amex: "Amex",
    diners: "Diners",
    discover: "Discover",
    jcb: "Jcb",
    maestro: "Maestro",
    mastercard: "Mastercard",
    unionpay: "Unionpay",
    visa: "Visa",
  };

  for (const [format, load] of [
    ["ESM", () => import("../dist/payment-logos.mjs")],
    ["CommonJS", () => require("../dist/payment-logos.cjs")],
  ]) {
    it(`renders every named SVG and map entry from ${format}`, async () => {
      const entry = await load();
      assert.deepEqual(
        Object.keys(entry.CARD_BRAND_LOGOS).sort(),
        Object.keys(brands).sort()
      );
      for (const [brand, name] of Object.entries(brands)) {
        const Logo = entry[name];
        assert.equal(typeof Logo, "function", `${format} ${name}`);
        assert.equal(entry.CARD_BRAND_LOGOS[brand], Logo);
        const markup = renderToStaticMarkup(
          createElement(Logo, { width: 78, height: 50 })
        );
        assert.match(markup, /^<svg\b/, `${format} ${name}`);
        assert.match(markup, /viewBox="0 0 780 500"/);
      }
    });
  }
});

describe("built bundle integration", () => {
  it("discovers an added helper and enforces imports and CSS while reporting catalog growth", async (t) => {
    const { directory, cli, names } = await createCliFixture(t);
    await appendFile(
      path.join(directory, "dist/index.mjs"),
      "\nexport const formatValue = (value) => String(value);\n"
    );
    const baselineFile = path.join(directory, "baseline.json");
    const summaryFile = path.join(directory, "summary.md");
    const record = spawnSync(process.execPath, [cli, "record", baselineFile], {
      encoding: "utf8",
    });
    assert.equal(record.status, 0, record.stderr);
    const baseline = JSON.parse(await readFile(baselineFile, "utf8"));
    assert.equal(baseline.schemaVersion, 2);
    assert.equal(baseline.measurement, MEASUREMENT);
    assert.deepEqual(
      Object.keys(baseline.sizes).sort(),
      [...names, "formatValue"].toSorted()
    );
    const check = () =>
      spawnSync(process.execPath, [cli, "check", baselineFile], {
        encoding: "utf8",
        env: { ...process.env, GITHUB_STEP_SUMMARY: summaryFile },
      });
    const passing = check();
    assert.equal(passing.status, 0, passing.stderr);
    assert.match(passing.stdout, /PASS/);
    assert.match(await readFile(summaryFile, "utf8"), /0\.000%/);
    const { formatValue: _helper, ...withoutHelper } = baseline.sizes;
    await writeFile(
      baselineFile,
      JSON.stringify({ ...baseline, sizes: withoutHelper })
    );
    const newHelper = check();
    assert.equal(newHelper.status, 0, newHelper.stderr);
    assert.match(
      newHelper.stdout,
      /formatValue \| — \| \d+ B \| — \| — \| 10000 B \| PASS/
    );
    await writeFile(
      baselineFile,
      JSON.stringify({
        ...baseline,
        sizes: { ...baseline.sizes, "Core exports": 1 },
      })
    );
    const catalogGrowth = check();
    assert.equal(catalogGrowth.status, 0, catalogGrowth.stderr);
    assert.match(catalogGrowth.stdout, /Core exports .*\| REPORT/);
    assert.doesNotMatch(catalogGrowth.stdout, /FAIL/);
    for (const name of ["Button", "Shared styles"]) {
      const lowerBaseline = Math.floor((baseline.sizes[name] * 100) / 105) - 1;
      await writeFile(
        baselineFile,
        JSON.stringify({
          ...baseline,
          sizes: { ...baseline.sizes, [name]: lowerBaseline },
        })
      );
      const failing = check();
      assert.equal(failing.status, 1);
      assert.match(failing.stdout, /FAIL/);
      assert.ok(
        failing.stderr.includes(`Bundle size budgets exceeded: ${name}.`),
        failing.stderr
      );
    }
    assert.match(await readFile(summaryFile, "utf8"), /FAIL/);
  });

  it("fails when measurement tooling cannot run or returns malformed batch output", async (t) => {
    const { directory, cli, baseline } = await createCliFixture(t, {
      withTooling: false,
    });
    const baselineFile = path.join(directory, "baseline.json");
    await writeFile(baselineFile, JSON.stringify(baseline));
    const check = () =>
      spawnSync(process.execPath, [cli, "check", baselineFile], {
        encoding: "utf8",
      });
    const missingTooling = check();
    assert.equal(missingTooling.status, 1);
    assert.doesNotMatch(missingTooling.stdout, /PASS/);
    assert.match(missingTooling.stderr, /MODULE_NOT_FOUND/);
    const tooling = path.join(directory, "node_modules/size-limit");
    await mkdir(tooling, { recursive: true });
    await writeFile(
      path.join(tooling, "bin.js"),
      'process.stdout.write(JSON.stringify({ error: "Cannot build consumer fixture" })); process.exitCode = 1;'
    );
    const failedMeasurement = check();
    assert.equal(failedMeasurement.status, 1);
    assert.doesNotMatch(failedMeasurement.stdout, /PASS/);
    assert.match(failedMeasurement.stderr, /Cannot build consumer fixture/);
    await writeFile(
      path.join(tooling, "bin.js"),
      'process.stdout.write(JSON.stringify([{ name: "Button", size: 1 }]));'
    );
    const missingMeasurements = check();
    assert.equal(missingMeasurements.status, 1);
    assert.doesNotMatch(missingMeasurements.stdout, /PASS/);
    assert.match(missingMeasurements.stderr, /every named bundle measurement/);
  });
});
