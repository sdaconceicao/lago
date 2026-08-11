import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { cssLayers } from "./vite.css-layers.ts";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// Read package.json to get peerDependencies for externals

const packageJson = JSON.parse(
  readFileSync(path.resolve(dirname, "package.json"), "utf-8")
);
const externalDeps = Object.keys(packageJson.peerDependencies || {});

export default defineConfig({
  plugins: [
    cssLayers(),
    react(),
    // NOTE: We intentionally do NOT use vite-plugin-lib-inject-css here.
    // It injects a side-effect `import './index.css'` into the JS entry, which
    // breaks SSR consumers (Node's ESM loader can't handle .css). Instead we
    // emit the stylesheet as dist/index.css and expose it via the "./styles"
    // package export, so consumers opt in with `import "@code-x/lago/styles"`.
    dts({
      tsconfigPath: "./tsconfig.declarations.json",
      insertTypesEntry: true,
      outDirs: "dist",
      include: ["src/**/*"],
      exclude: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.stories.tsx",
        "**/stories/**",
        "**/pages/**",
      ],
      // Collapse the per-file declarations into a single dist/index.d.ts.
      // Named `rollupTypes` before vite-plugin-dts 5; under the old name it was
      // silently ignored, so the package shipped one .d.ts per source file.
      // Bundling is done by @microsoft/api-extractor, which the plugin loads at
      // build time and therefore has to be a direct devDependency — without it
      // it logs "Failed to load '@microsoft/api-extractor'" and skips bundling.
      bundleTypes: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
  build: {
    minify: "esbuild", // Options: false | "esbuild" | "terser" | true (default: "esbuild")
    lib: {
      entry: path.resolve(dirname, "src/index.ts"),
      name: "Lago",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "mjs" : "cjs"}`,
    },
    rollupOptions: {
      // (e.g. "react/jsx-runtime", "react-dom/client").
      external: (id) =>
        externalDeps.some((dep) => id === dep || id.startsWith(`${dep}/`)),
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        // Keep the emitted stylesheet named index.css so the package's
        // "./styles" export and "style" field (both -> ./dist/index.css) resolve.
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith(".css") ? "index.css" : "[name][extname]",
      },
    },
    cssCodeSplit: true,
    sourcemap: true,
    emptyOutDir: true,
  },
});
