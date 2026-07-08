import react from "@vitejs/plugin-react-swc";
import { readFileSync } from "fs";
import { fileURLToPath } from "node:url";
import path from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { libInjectCss } from "vite-plugin-lib-inject-css";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// Read package.json to get peerDependencies for externals
const packageJson = JSON.parse(
  readFileSync(path.resolve(dirname, "package.json"), "utf-8")
);
const peerDependencies = Object.keys(packageJson.peerDependencies || {});

export default defineConfig({
  plugins: [
    react(),
    libInjectCss(),
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
      external: [
        // Externalize all peer dependencies
        ...peerDependencies,
        // Also externalize react/jsx-runtime (part of React)
        "react/jsx-runtime",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    cssCodeSplit: true,
    sourcemap: true,
    emptyOutDir: true,
  },
});
