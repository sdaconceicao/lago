import { describe, expect, it } from "vitest";
import { cssLayers, LAYER_ORDER } from "../../vite.css-layers.ts";

// The plugin's `transform` is the only thing standing between a new stylesheet
// and the unlayered cascade, where it would silently outrank every other
// component. These assert the contract the theming docs promise consumers.

type Transform = (code: string, id: string) => { code: string } | null;

const transform = (code: string, id: string) => {
  const plugin = cssLayers();
  const handler = (
    typeof plugin.transform === "function"
      ? plugin.transform
      : plugin.transform?.handler
  ) as Transform;
  return handler.call(null as never, code, id);
};

const ROOT = "/repo/src";

describe("cssLayers", () => {
  it("puts a component stylesheet in lago.components", () => {
    const out = transform(
      ".button { color: red; }",
      `${ROOT}/components/Actions/Button/Button.module.css`
    );
    expect(out?.code).toContain("@layer lago.components {");
    expect(out?.code).toContain(".button { color: red; }");
  });

  it("puts the token sheet in lago.tokens and declares the order", () => {
    const out = transform(":root { --tint: red; }", `${ROOT}/styles/theme.css`);
    expect(out?.code).toContain(LAYER_ORDER);
    expect(out?.code).toContain("@layer lago.tokens {");
    // The order has to be declared before the first layer is opened, otherwise
    // it is established by emit order instead.
    expect(out?.code.indexOf(LAYER_ORDER)).toBeLessThan(
      out?.code.indexOf("@layer lago.tokens {") ?? -1
    );
  });

  it("lifts @import out of the layer, where it would be invalid", () => {
    const out = transform(
      '@import url("https://fonts.example/x.css");\n:root { --tint: red; }',
      `${ROOT}/styles/theme.css`
    );
    const code = out?.code ?? "";
    expect(code.indexOf("@import")).toBeLessThan(
      code.indexOf("@layer lago.tokens {")
    );
    expect(code.slice(code.indexOf("@layer lago.tokens {"))).not.toContain(
      "@import"
    );
  });

  it("leaves a sheet that names its own lago layer alone", () => {
    const source = "@layer lago.base {\n.buttonBase { color: red; }\n}";
    expect(transform(source, `${ROOT}/styles/base.module.css`)).toBeNull();
  });

  it("ignores stylesheets it does not own, such as Storybook's own chrome", () => {
    expect(
      transform("body { margin: 0; }", "/repo/.storybook/preview.css")
    ).toBeNull();
    expect(
      transform("const x = 1;", `${ROOT}/components/Actions/Button/Button.tsx`)
    ).toBeNull();
  });

  it("still matches when Vite appends a query to the id", () => {
    const out = transform(
      ".x{color:red}",
      `${ROOT}/components/Media/Avatar/Avatar.module.css?used`
    );
    expect(out?.code).toContain("@layer lago.components {");
  });
});
