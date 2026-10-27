const { componentBudgets } = require("./scripts/bundle-size-policy.cjs");
const sharedPeers = ["react", "react-dom", "react-aria-components"];

const javascript = (name, imports) => ({
  name,
  path: "dist/index.mjs",
  import: imports,
  gzip: true,
  ignore: sharedPeers,
  modifyEsbuildConfig: (config) => ({
    ...config,
    external: sharedPeers,
    format: "esm",
    platform: "browser",
    target: "es2022",
    legalComments: "none",
    logOverride: { "ignored-bare-import": "silent" },
  }),
});

const checks = [
  javascript("Core exports", "*"),
  javascript("Representative form", "{ Form, Button, TextField, Checkbox }"),
  ...Object.keys(componentBudgets).map((name) =>
    javascript(name, `{ ${name} }`)
  ),
  {
    name: "Shared styles",
    path: "dist/index.css",
    disablePlugins: ["@size-limit/esbuild"],
    gzip: true,
  },
];

// The guard runs Size Limit in bounded batches to avoid bundling every export
// concurrently. It validates that every configured result is returned.
const batch = process.env.LAGO_SIZE_CHECKS;
module.exports = batch
  ? checks.filter(({ name }) => JSON.parse(batch).includes(name))
  : checks;
