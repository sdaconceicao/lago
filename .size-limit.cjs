const sharedPeers = ["react", "react-dom", "react-aria-components"];

module.exports = [
  {
    name: "Core exports",
    path: "dist/index.mjs",
    import: "*",
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
  },
];
