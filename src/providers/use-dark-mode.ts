import { useContext, useEffect, useMemo, useState } from "react";
import { type Theme, ThemeContext } from "./theme-provider";

type ThemeValue = Theme | undefined;

/**
 * Resolves whether the given theme setting is dark.
 * Returns `false` (light) when `theme` is undefined (e.g. no ThemeProvider).
 */
export const useResolvedDarkMode = (theme: ThemeValue): boolean => {
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (theme !== "system" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      setSystemPrefersDark(mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return useMemo(() => {
    if (theme === undefined || theme === "light") return false;
    if (theme === "dark") return true;
    return systemPrefersDark;
  }, [theme, systemPrefersDark]);
};

/**
 * Returns whether the resolved theme is dark.
 * Without a ThemeProvider, returns `false` (light mode).
 */
export const useDarkMode = (): boolean => {
  const themeContext = useContext(ThemeContext);
  return useResolvedDarkMode(themeContext?.theme);
};
