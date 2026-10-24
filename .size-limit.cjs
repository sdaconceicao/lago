module.exports = [
  {
    name: "Core exports",
    path: "dist/index.mjs",
    import: "*",
    gzip: true,
    ignore: ["react", "react-dom", "react-aria-components"],
    modifyEsbuildConfig: (config) => ({
      ...config,
      format: "esm",
      platform: "browser",
      target: "es2022",
      legalComments: "none",
      logOverride: { "ignored-bare-import": "silent" },
    }),
  },
];
