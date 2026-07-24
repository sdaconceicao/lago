import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../providers/theme-provider";
import { useDarkMode } from "./use-dark-mode";

const createMatchMedia = (matches: boolean) => {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];

  return {
    listeners,
    mock: vi.fn(() => ({
      matches,
      addEventListener: vi.fn(
        (_: string, cb: (e: MediaQueryListEvent) => void) => {
          listeners.push(cb);
        }
      ),
      removeEventListener: vi.fn(
        (_: string, cb: (e: MediaQueryListEvent) => void) => {
          const idx = listeners.indexOf(cb);
          if (idx !== -1) listeners.splice(idx, 1);
        }
      ),
    })),
  };
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe("useDarkMode", () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    localStorage.clear();
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("returns false when theme is light", () => {
    const { mock } = createMatchMedia(false);
    window.matchMedia = mock as unknown as typeof window.matchMedia;

    const { result } = renderHook(() => useDarkMode(), {
      wrapper: ({ children }) => (
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      ),
    });

    expect(result.current).toBe(false);
  });

  it("returns true when theme is dark", () => {
    const { mock } = createMatchMedia(false);
    window.matchMedia = mock as unknown as typeof window.matchMedia;
    localStorage.setItem("ui-theme", "dark");

    const { result } = renderHook(() => useDarkMode(), { wrapper });

    expect(result.current).toBe(true);
  });

  it("returns false for system theme when OS prefers light", () => {
    const { mock } = createMatchMedia(false);
    window.matchMedia = mock as unknown as typeof window.matchMedia;

    const { result } = renderHook(() => useDarkMode(), { wrapper });

    expect(result.current).toBe(false);
  });

  it("returns false when used outside of ThemeProvider", () => {
    const { mock } = createMatchMedia(true);
    window.matchMedia = mock as unknown as typeof window.matchMedia;

    const { result } = renderHook(() => useDarkMode());

    expect(result.current).toBe(false);
  });

  it("returns true for system theme when OS prefers dark", () => {
    const { mock } = createMatchMedia(true);
    window.matchMedia = mock as unknown as typeof window.matchMedia;

    const { result } = renderHook(() => useDarkMode(), { wrapper });

    expect(result.current).toBe(true);
  });
});
