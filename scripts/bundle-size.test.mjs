import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  compareSizes,
  formatReport,
  getReleaseBaseline,
  MEASUREMENT,
  parseMeasurement,
  validateBaseline,
} from "./bundle-size.mjs";

const bootstrap = {
  schemaVersion: 1,
  measurement: MEASUREMENT,
  version: "0.10.0",
  sizeBytes: 50_000,
};
const response = (body, status = 200) =>
  new Response(JSON.stringify(body), { status });

function fetchSequence(...responses) {
  return async () => {
    const next = responses.shift();
    assert.ok(next, "Unexpected network request");
    return next;
  };
}

describe("core bundle growth", () => {
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

  it("rejects invalid measurements instead of passing a broken check", () => {
    for (const invalid of [0, -1, 1.5, NaN, Infinity, "50000", null]) {
      assert.throws(() => compareSizes(invalid, 50_000));
      assert.throws(() => compareSizes(50_000, invalid));
    }
  });

  it("reports the source, exact sizes, percentage, limit and verdict", () => {
    const report = formatReport(compareSizes(50_000, 52_501), "release 0.11.0");
    assert.match(report, /release 0\.11\.0/);
    assert.match(report, /50000 B \| 52501 B \| 2501 B \| 5\.002%/);
    assert.match(report, /52500 B \| FAIL/);
    assert.match(formatReport(compareSizes(50_000, 49_000), "seed"), /PASS/);
  });
});

describe("Size Limit output and baseline validation", () => {
  it("reads a single named core result", () => {
    assert.equal(
      parseMeasurement(
        JSON.stringify([{ name: "Core exports", size: 50_000 }])
      ),
      50_000
    );
  });

  it("rejects missing, ambiguous, renamed, or invalid results", () => {
    for (const invalid of [
      null,
      {},
      [],
      [{ name: "Editor", size: 50_000 }],
      [{ name: "Core exports", size: 0 }],
      [{ name: "Core exports", size: "50000" }],
      [{ name: "Core exports", size: 1.5 }],
      [
        { name: "Core exports", size: 50_000 },
        { name: "Editor", size: 50_000 },
      ],
    ]) {
      assert.throws(() => parseMeasurement(JSON.stringify(invalid)));
    }
    assert.throws(() => parseMeasurement("build failed"));
  });

  it("accepts the measurement contract and expected release version", () => {
    assert.deepEqual(validateBaseline(bootstrap, "0.10.0"), bootstrap);
  });

  it("rejects corrupt or incompatible baselines", () => {
    for (const invalid of [
      null,
      {},
      { ...bootstrap, schemaVersion: 2 },
      { ...bootstrap, measurement: "brotli" },
      { ...bootstrap, version: "not-a-version" },
      { ...bootstrap, sizeBytes: 0 },
      { ...bootstrap, sizeBytes: "50000" },
      { ...bootstrap, sizeBytes: 50_000.5 },
    ]) {
      assert.throws(() => validateBaseline(invalid));
    }
    assert.throws(() => validateBaseline(bootstrap, "0.11.0"));
  });
});

describe("release baseline selection", () => {
  it("uses npm latest to select the exact release asset", async () => {
    const urls = [];
    const release = { ...bootstrap, version: "0.11.0", sizeBytes: 49_000 };
    const fetchImpl = async (url) => {
      urls.push(url);
      return response(urls.length === 1 ? { version: "0.11.0" } : release);
    };
    const baseline = await getReleaseBaseline(bootstrap, fetchImpl);
    assert.equal(baseline.sizeBytes, 49_000);
    assert.equal(baseline.source, "release 0.11.0");
    assert.match(urls[0], /registry\.npmjs\.org/);
    assert.match(urls[1], /lago-v0\.11\.0\/bundle-size\.json$/);
  });

  it("uses the core-split seed only for the bootstrapped release's missing asset", async () => {
    const baseline = await getReleaseBaseline(
      bootstrap,
      fetchSequence(response({ version: "0.10.0" }), response({}, 404))
    );
    assert.equal(baseline.sizeBytes, bootstrap.sizeBytes);
    assert.match(baseline.source, /bootstrap/);
  });

  it("prefers an existing release asset over the bootstrap", async () => {
    const baseline = await getReleaseBaseline(
      bootstrap,
      fetchSequence(
        response({ version: "0.10.0" }),
        response({ ...bootstrap, sizeBytes: 48_000 })
      )
    );
    assert.equal(baseline.sizeBytes, 48_000);
    assert.equal(baseline.source, "release 0.10.0");
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

  it("does not hide registry or asset errors behind the seed", async () => {
    await assert.rejects(
      getReleaseBaseline(bootstrap, fetchSequence(response({}, 503))),
      /latest npm release: 503/
    );
    await assert.rejects(
      getReleaseBaseline(
        bootstrap,
        fetchSequence(response({ version: "0.10.0" }), response({}, 500))
      ),
      /0\.10\.0: 500/
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
  });
});

describe("command failures", () => {
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

describe("built bundle integration", () => {
  const cli = fileURLToPath(new URL("./bundle-size.mjs", import.meta.url));

  it("records actual Size Limit output and enforces growth with job summaries", async (t) => {
    const directory = await mkdtemp(path.join(tmpdir(), "lago-size-test-"));
    t.after(() => rm(directory, { recursive: true, force: true }));
    const baselineFile = path.join(directory, "baseline.json");
    const summaryFile = path.join(directory, "summary.md");
    const record = spawnSync(process.execPath, [cli, "record", baselineFile], {
      encoding: "utf8",
    });
    assert.equal(record.status, 0, record.stderr);
    const baseline = validateBaseline(
      JSON.parse(await readFile(baselineFile, "utf8"))
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

    baseline.sizeBytes = Math.floor((baseline.sizeBytes * 100) / 105);
    await writeFile(baselineFile, JSON.stringify(baseline));
    const failing = check();
    assert.equal(failing.status, 1);
    assert.match(failing.stdout, /FAIL/);
    assert.match(failing.stderr, /growth exceeds 5%/);
    assert.match(await readFile(summaryFile, "utf8"), /FAIL/);
  });

  it("fails when measurement tooling cannot run", async (t) => {
    const directory = await mkdtemp(path.join(tmpdir(), "lago-size-failure-"));
    t.after(() => rm(directory, { recursive: true, force: true }));
    const scripts = path.join(directory, "scripts");
    await mkdir(scripts);
    const copiedCli = path.join(scripts, "bundle-size.mjs");
    await copyFile(cli, copiedCli);
    const baselineFile = path.join(directory, "baseline.json");
    await writeFile(baselineFile, JSON.stringify(bootstrap));
    const result = spawnSync(
      process.execPath,
      [copiedCli, "check", baselineFile],
      { encoding: "utf8" }
    );
    assert.equal(result.status, 1);
    assert.doesNotMatch(result.stdout, /PASS/);
    assert.match(result.stderr, /MODULE_NOT_FOUND/);
  });
});
