import type { ReactNode } from "react";
import { createElement, useEffect } from "react";
import type { Preview } from "@storybook/react-vite";
import { ThemeProvider, useTheme } from "../src/providers/theme-provider";
import "./storybook-utilities.css";

const StorybookThemeSync = ({
  theme,
  children,
}: {
  theme: "light" | "dark";
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
    description: "Global theme for all stories",
    toolbar: {
      icon: "mirror",
      dynamicTitle: true,
      items: [
        { value: "light", title: "Light" },
        { value: "dark", title: "Dark" },
      ],
    },
  },
};

const preview: Preview = {
  initialGlobals: {
    theme: "light",
  },
  decorators: [
    (Story, context) => {
      const storybookTheme =
        context.globals.theme === "dark" ? "dark" : "light";
      const isDarkMode = storybookTheme === "dark";

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
        defaultTheme: "light",
        children: createElement(StorybookThemeSync, {
          theme: storybookTheme,
          children: createElement(Story),
        }),
      });
    },
  ],
  parameters: {
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
