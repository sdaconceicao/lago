import type { ReactNode } from "react";
import { createElement, useEffect } from "react";
import type { Preview } from "@storybook/react-vite";
import {
  type Theme,
  ThemeProvider,
  useTheme,
} from "../src/providers/theme-provider";
import "../src/styles/theme.css";
import "./storybook-utilities.css";

const getResolvedTheme = (theme: Theme): "light" | "dark" => {
  if (theme === "system") {
    if (typeof window === "undefined") return "light";

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return theme;
};

const StorybookThemeSync = ({
  theme,
  children,
}: {
  theme: Theme;
  children: ReactNode;
}) => {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  return children;
};

export const globalTypes = {
  theme: {
    name: "Theme",
    description: "Global theme for all stories (defaults to system)",
    toolbar: {
      icon: "mirror",
      dynamicTitle: true,
      items: [
        { value: "system", title: "System", icon: "browser" },
        { value: "light", title: "Light", icon: "sun" },
        { value: "dark", title: "Dark", icon: "moon" },
      ],
    },
  },
};

const preview: Preview = {
  initialGlobals: {
    theme: "system",
  },
  decorators: [
    (Story, context) => {
      const storybookTheme = (context.globals.theme as Theme) ?? "system";
      const isDarkMode = getResolvedTheme(storybookTheme) === "dark";

      if (typeof document !== "undefined") {
        document.body.classList.toggle("sb-theme-dark", isDarkMode);
        document.documentElement.style.backgroundColor = isDarkMode
          ? "#000"
          : "";
        document.documentElement.style.color = isDarkMode ? "#fff" : "";
        document.body.style.backgroundColor = isDarkMode ? "#000" : "";
        document.body.style.color = isDarkMode ? "#fff" : "";
      }

      return createElement(ThemeProvider, {
        defaultTheme: "system",
        children: createElement(StorybookThemeSync, {
          theme: storybookTheme,
          children: createElement(Story),
        }),
      });
    },
  ],
  parameters: {
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
