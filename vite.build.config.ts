import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react-swc";
import { readFileSync } from "fs";
import path from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

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
    react(),
    // NOTE: We intentionally do NOT use vite-plugin-lib-inject-css here.
    // It injects a side-effect `import './index.css'` into the JS entry, which
    // breaks SSR consumers (Node's ESM loader can't handle .css). Instead we
    // emit the stylesheet as dist/index.css and expose it via the "./styles"
    // package export, so consumers opt in with `import "@code-x/lago/styles"`.
    dts({
      tsconfigPath: "./tsconfig.declarations.json",
      insertTypesEntry: true,
      outDir: "dist",
      include: ["src/**/*"],
      exclude: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.stories.tsx",
        "**/stories/**",
        "**/pages/**",
      ],
      rollupTypes: true,
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
