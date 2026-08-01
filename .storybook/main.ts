import type { StorybookConfig } from "@storybook/react-vite";
import type { Plugin } from "vite";

/**
 * `@storybook/builder-vite` generates this line into the preview entry:
 *
 *   import.meta.hot.accept(STORIES_FILE, (newModule) => {
 *     window.__STORYBOOK_PREVIEW__.onStoriesChanged({ importFn: newModule.importFn });
 *   });
 *
 * It has no failure path, and there are two common ones:
 *
 *  1. Vite passes `undefined` when the updated module could not be loaded —
 *     which happens whenever a story file is momentarily unparseable, i.e. any
 *     save mid-edit. `newModule.importFn` then throws
 *     `Cannot read properties of undefined (reading 'importFn')`.
 *  2. `importFn` itself rejects when a story imports a component that has just
 *     added or removed an export, because Fast Refresh re-imports the module
 *     and the old dynamic import 404s or fails its named import.
 *
 * Either way the preview is left holding a dead `importFn` and a story index it
 * can no longer fetch, so every docs page renders blank — and fixing the
 * offending file does not bring it back, because Storybook never re-runs the
 * failed step. That is the "docs page needs a full reload" symptom.
 *
 * So: remember that the preview went stale, and when the next *successful*
 * stories update arrives (i.e. the moment the code is valid again), reload
 * once. While the code is still broken nothing reloads, so Vite's error
 * overlay stays on screen.
 *
 * Still unfixed upstream as of @storybook/builder-vite 10.6.0-alpha.3; drop
 * this plugin once the generated callback handles these cases itself.
 */
const PREVIEW_ENTRY = "virtual:/@storybook/builder-vite/vite-app.js";
const UNGUARDED_HMR_CALLBACK =
  "window.__STORYBOOK_PREVIEW__.onStoriesChanged({ importFn: newModule.importFn });";
const GUARDED_HMR_CALLBACK = `
      if (!newModule) {
        window.__LAGO_PREVIEW_STALE__ = true;
        return;
      }

      if (window.__LAGO_PREVIEW_STALE__) {
        window.location.reload();
        return;
      }

      const lagoImportFn = newModule.importFn;

      window.__STORYBOOK_PREVIEW__.onStoriesChanged({
        importFn: (path) =>
          Promise.resolve(lagoImportFn(path)).catch((error) => {
            window.__LAGO_PREVIEW_STALE__ = true;
            throw error;
          }),
      });`.trim();

const storiesHmrGuard = (): Plugin => ({
  name: "lago:stories-hmr-guard",
  enforce: "pre",
  apply: "serve",
  transform(code, id) {
    if (!id.includes(PREVIEW_ENTRY)) return null;

    if (!code.includes(UNGUARDED_HMR_CALLBACK)) {
      this.warn(
        "Storybook's stories HMR callback no longer matches the patched " +
          "snippet — check whether the upstream fix landed and remove this plugin."
      );
      return null;
    }

    return code.replace(UNGUARDED_HMR_CALLBACK, GUARDED_HMR_CALLBACK);
  },
});

/**
 * `withThemeByClassName` applies the theme class from an effect, i.e. after the
 * first paint, so every load flashes the light theme for a few hundred
 * milliseconds before settling. This runs first and gets it right up front:
 * from the URL globals when the toolbar put a theme there, otherwise from the
 * OS — the same default `preview.tsx` hands the decorator.
 *
 * The two colours mirror `--background-color` in `src/styles/theme.css`. They
 * have to be literals: the stylesheet that defines the token is injected by the
 * bundle, which is exactly what this script runs ahead of.
 */
const themeBootScript = `
<style>
  html { background-color: #f8f8f8; }
  html.dark-mode { background-color: #1b1b1b; }
</style>
<script>
  (function () {
    try {
      var fromUrl = /(?:^|[&?])globals=[^&]*theme:(light|dark)/.exec(
        window.location.search
      );
      var isDark = fromUrl
        ? fromUrl[1] === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;

      document.documentElement.classList.toggle("dark-mode", isDark);
    } catch (e) {}
  })();
</script>`;

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-designs",
    "@storybook/addon-mcp",
    "@storybook/addon-themes",
  ],
  framework: "@storybook/react-vite",
  previewHead: (head) => `${head}${themeBootScript}`,
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      compilerOptions: {
        allowSyntheticDefaultImports: false,
        esModuleInterop: false,
      },
      propFilter: (prop) => !/^aria-|on[A-Z]/.test(prop.name),
    },
  },
  features: {
    experimentalReactComponentMeta: true,
  },
  viteFinal: (viteConfig) => {
    viteConfig.plugins = [...(viteConfig.plugins ?? []), storiesHmrGuard()];
    return viteConfig;
  },
};
export default config;
