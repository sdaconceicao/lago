import { type ReactNode, useEffect, useState } from "react";
// The token components import no component CSS, so ensure the token
// definitions are present in the preview iframe even when a Design Tokens
// story is loaded directly (before any component story has injected them).
import "../../styles/theme.css";
import "../../styles/utilities.css";

const readVar = (name: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/**
 * Re-render whenever the active theme changes. The theme is driven by the
 * `dark-mode` class on <html> (toggled by ThemeProvider), so observing that
 * class — plus the OS preference — keeps the displayed tokens in sync without
 * requiring this component to live inside a ThemeProvider.
 */
const useThemeChange = () => {
  const [, force] = useState(0);

  useEffect(() => {
    const rerender = () => force((n) => n + 1);
    const observer = new MutationObserver(rerender);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", rerender);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", rerender);
    };
  }, []);
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(220px, 1fr) minmax(140px, 1fr) 64px",
  gap: "8px 16px",
  alignItems: "center",
  fontFamily: "system-ui, sans-serif",
  fontSize: 14,
};

const nameStyle: React.CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  color: "var(--text-color)",
};

const descriptionStyle: React.CSSProperties = {
  fontFamily: "system-ui, sans-serif",
  fontSize: 14,
  lineHeight: 1.6,
  color: "var(--text-color)",
  maxWidth: 640,
  marginBottom: 20,
};

const codeStyle: React.CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: "0.9em",
};

/**
 * The font family Lago's components render in. Lago intentionally does not ship
 * a `--font-family` token; components inherit the native `system-ui` stack so
 * the UI matches the host OS (San Francisco on macOS/iOS, Segoe UI on Windows,
 * Roboto on Android). Consumers override it by setting `font-family` on `:root`
 * or `body`.
 */
const FONT_FAMILY = "system-ui";

const valueStyle: React.CSSProperties = {
  color: "var(--text-color)",
  opacity: 0.7,
};

const TokenRow = ({ name }: { name: string }) => {
  const value = readVar(name);

  return (
    <>
      <span style={nameStyle}>{name}</span>
      <span style={valueStyle}>{value || "—"}</span>
      <span
        style={{
          width: 48,
          height: 24,
          borderRadius: 6,
          border: "1px solid var(--border-color)",
          background: value || "transparent",
        }}
      />
    </>
  );
};

const TokenGrid = ({ names }: { names: string[] }) => (
  <div style={gridStyle}>
    {names.map((name) => (
      <TokenRow key={name} name={name} />
    ))}
  </div>
);

const FragmentRow = ({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) => (
  <>
    <span style={nameStyle}>{name}</span>
    <span style={valueStyle}>{readVar(name) || "—"}</span>
    <span>{children}</span>
  </>
);

const ValueGrid = ({
  names,
  render,
}: {
  names: string[];
  render: (name: string) => ReactNode;
}) => (
  <div style={{ ...gridStyle, gridTemplateColumns: "200px 120px 1fr" }}>
    {names.map((name) => (
      <FragmentRow key={name} name={name}>
        {render(name)}
      </FragmentRow>
    ))}
  </div>
);

const GRAY_SCALE = [
  "--gray-50",
  ...Array.from({ length: 16 }, (_, i) => `--gray-${100 * (i + 1)}`),
];

const TINT_SCALE = Array.from(
  { length: 16 },
  (_, i) => `--tint-${100 * (i + 1)}`
);

const SEMANTIC_COLORS = [
  "--background-color",
  "--text-color",
  "--text-color-hover",
  "--text-color-disabled",
  "--text-color-placeholder",
  "--link-color",
  "--link-color-secondary",
  "--link-color-pressed",
  "--border-color",
  "--border-color-hover",
  "--border-color-disabled",
  "--field-text-color",
  "--field-background",
  "--button-background",
  "--button-background-pressed",
  "--highlight-background",
  "--highlight-background-pressed",
  "--highlight-background-invalid",
  "--highlight-foreground",
  "--highlight-overlay",
  "--invalid-color",
  "--focus-ring-color",
  "--overlay-background",
  "--overlay-border",
  "--popover-shadow",
];

const TEXT_TOKENS = ["--font-size", "--font-size-sm", "--font-size-lg"];

const SPACING_TOKENS = [
  "--spacing",
  ...Array.from({ length: 10 }, (_, i) => `--spacing-${i + 1}`),
];

export const ColorTokens = () => {
  useThemeChange();

  return (
    <>
      <TokenGrid names={SEMANTIC_COLORS} />
      <h3>Gray scale</h3>
      <TokenGrid names={GRAY_SCALE} />
      <h3>Tint scale</h3>
      <TokenGrid names={TINT_SCALE} />
    </>
  );
};

export const TextTokens = () => {
  useThemeChange();

  return (
    <>
      <p style={descriptionStyle}>
        Lago inherits the native <code style={codeStyle}>{FONT_FAMILY}</code>{" "}
        font stack rather than shipping a{" "}
        <code style={codeStyle}>--font-family</code> token, so the UI matches
        the host operating system (San Francisco on macOS/iOS, Segoe UI on
        Windows, Roboto on Android). To use a custom typeface, set{" "}
        <code style={codeStyle}>font-family</code> on your{" "}
        <code style={codeStyle}>:root</code> or{" "}
        <code style={codeStyle}>body</code> and every component picks it up.
      </p>
      <div
        style={{
          ...gridStyle,
          gridTemplateColumns: "200px 120px 1fr",
          marginBottom: 28,
        }}
      >
        <span style={nameStyle}>font-family</span>
        <span style={valueStyle}>{FONT_FAMILY}</span>
        <span style={{ fontFamily: FONT_FAMILY, color: "var(--text-color)" }}>
          The quick brown fox
        </span>
      </div>
      <ValueGrid
        names={TEXT_TOKENS}
        render={(name) => (
          <span
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: readVar(name),
              color: "var(--text-color)",
            }}
          >
            The quick brown fox
          </span>
        )}
      />
    </>
  );
};

export const SpacingTokens = () => {
  useThemeChange();

  return (
    <ValueGrid
      names={SPACING_TOKENS}
      render={(name) => (
        <span
          style={{
            display: "inline-block",
            height: 16,
            width: readVar(name),
            background: "var(--tint-900)",
            borderRadius: 3,
          }}
        />
      )}
    />
  );
};
