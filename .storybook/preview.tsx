import {
  DocsContainer,
  type DocsContainerProps,
} from "@storybook/addon-docs/blocks";
import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react-vite";
import { type PropsWithChildren, useEffect, useState } from "react";
// The docs `context.channel` is the documented low-level hook for watching
// preview events; only the event name constant lives behind `internal`.
import { GLOBALS_UPDATED } from "storybook/internal/core-events";
import { themes } from "storybook/theming";
import "../src/styles/theme.css";
import "./storybook-utilities.css";

/**
 * Follow the OS on first load, the way `ThemeProvider`'s `system` default does.
 * The toolbar itself only offers the two real themes, because the class
 * strategy maps a theme name to a fixed class and "system" has no fixed class.
 */
const defaultTheme =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

const readIsDark = () =>
  document.documentElement.classList.contains("dark-mode");

/** Follows the theme on a docs page, so the docs chrome can match the stories. */
const useDocsDarkMode = ({ channel }: DocsContainerProps["context"]) => {
  const [isDark, setIsDark] = useState(readIsDark);

  // MDX pages render no stories, so `withThemeByClassName` never runs on them
  // and nothing would otherwise apply the toolbar's choice. Write the class
  // here for that case only — on a story page the decorator writes the same
  // value, so the two cannot disagree.
  useEffect(() => {
    const onGlobalsUpdated = ({
      globals,
    }: {
      globals?: { theme?: string };
    }) => {
      if (!globals?.theme) return;

      document.documentElement.classList.toggle(
        "dark-mode",
        globals.theme === "dark"
      );
    };

    channel.on(GLOBALS_UPDATED, onGlobalsUpdated);
    return () => channel.off(GLOBALS_UPDATED, onGlobalsUpdated);
  }, [channel]);

  // Read the theme back off `<html>` rather than from the global, because
  // whichever of the two writers acted, the class is the settled answer.
  // Storybook remounts this container on a globals change, often before the
  // decorator has applied the class, so re-read on mount as well.
  useEffect(() => {
    const sync = () => setIsDark(readIsDark());
    const observer = new MutationObserver(sync);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    sync();

    return () => observer.disconnect();
  }, []);

  return isDark;
};

/** Themes the docs chrome — headings, args tables, source blocks — to match. */
const LagoDocsContainer = ({
  children,
  context,
}: PropsWithChildren<DocsContainerProps>) => {
  const isDark = useDocsDarkMode(context);

  return (
    <DocsContainer
      context={context}
      theme={isDark ? themes.dark : themes.light}
    >
      {children}
    </DocsContainer>
  );
};

const preview: Preview = {
  decorators: [
    withThemeByClassName({
      themes: { light: "", dark: "dark-mode" },
      defaultTheme,
    }),
  ],
  parameters: {
    docs: {
      container: LagoDocsContainer,
    },
    options: {
      storySort: {
        order: ["Lago", "Design Tokens", "Components", "*"],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
};

export default preview;
