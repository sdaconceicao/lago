import type { Plugin } from "vite";

/**
 * Puts every stylesheet Lago ships into a cascade layer.
 *
 * Why a build step rather than `@layer` blocks in the source: there are ~100
 * component stylesheets, and wrapping each by hand would mean an extra level of
 * indentation in every one of them, a rule that new components could silently
 * forget, and no single place that states the order. Here the order is declared
 * once, and a stylesheet's layer follows from where it lives.
 *
 * Lowest priority first, each layer building on the one before it — the same
 * arrangement as Tailwind's `theme, base, components`:
 *
 *   tokens      the `:root` custom properties. Lowest, so a consumer can
 *               restate any of them and win without thinking about specificity
 *               or about which stylesheet the bundler happened to emit first.
 *   base        the shared treatments in base.module.css (buttonBase,
 *               indicator, inset). Below components because component
 *               stylesheets are written expecting to override them — Tag
 *               restates `--button-color` to be grey rather than tinted, for
 *               one — and a few tune their specificity against that. Inverting
 *               the two would silently undo every such specialisation, and
 *               being a layer apart, no specificity could win them back.
 *   components  the per-component stylesheets.
 *
 * Renamed from `utilities`, which said the opposite of what it did: a utilities
 * layer conventionally sits highest, and this one sits lowest.
 *
 * Everything Lago ships sits in one of the three, so **consumer CSS is
 * unlayered and therefore always wins**, at any specificity. That is the point:
 * re-theming should never be a specificity fight. The trade-off is that it wins
 * against Lago's state rules too — see the theming docs on scoping a variant
 * override with `:not([data-disabled])`.
 */

/** Declared before any layer is used, so the order never depends on emit order. */
export const LAYER_ORDER = "@layer lago.tokens, lago.base, lago.components;";

/** `@import` must stay at the top of a sheet and is invalid inside `@layer`. */
const IMPORT_RULE = /^[ \t]*@import\s[^;]+;[ \t]*$/gm;

function layerFor(id: string): string | null {
  const file = id.split("?")[0];
  if (!file.endsWith(".css")) return null;
  if (file.endsWith("/styles/theme.css")) return "lago.tokens";
  // base.module.css declares its own layer, and is skipped below.
  if (file.includes("/src/components/")) return "lago.components";
  return null;
}

export function cssLayers(): Plugin {
  return {
    name: "lago-css-layers",
    // Ahead of Vite's own CSS plugin, so this sees the stylesheet as authored —
    // before CSS-module class hashing rewrites it.
    enforce: "pre",
    transform(code, id) {
      const layer = layerFor(id);
      // A sheet that already names its own `lago.*` layer is left alone.
      if (!layer || code.includes("@layer lago.")) return null;

      const imports = code.match(IMPORT_RULE) ?? [];
      const body = imports.length ? code.replace(IMPORT_RULE, "") : code;
      const preamble =
        layer === "lago.tokens"
          ? `${LAYER_ORDER}\n${imports.join("\n")}\n`
          : "";

      return { code: `${preamble}@layer ${layer} {\n${body}\n}\n`, map: null };
    },
  };
}
