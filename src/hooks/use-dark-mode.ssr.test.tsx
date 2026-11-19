// @vitest-environment node
import { renderToString } from "react-dom/server";
import { ThemeProvider } from "../providers/theme-provider";
import { useDarkMode } from "./use-dark-mode";

function ThemeConsumer() {
  const isDark = useDarkMode();
  return <span>{isDark ? "dark" : "light"}</span>;
}

describe("useDarkMode server rendering", () => {
  it("renders light without a ThemeProvider or browser globals", () => {
    expect(typeof window).toBe("undefined");
    expect(renderToString(<ThemeConsumer />)).toBe("<span>light</span>");
  });

  it.each([
    ["light", "light"],
    ["dark", "dark"],
    ["system", "light"],
  ] as const)("renders %s as %s without browser globals", (theme, resolved) => {
    const markup = renderToString(
      <ThemeProvider defaultTheme={theme}>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(markup).toBe(`<span>${resolved}</span>`);
  });
});
