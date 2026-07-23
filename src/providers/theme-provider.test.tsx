import { act, render, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider, useTheme } from "./theme-provider";

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

describe("useTheme", () => {
  it("throws when used outside of ThemeProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useTheme())).toThrow(
      "useTheme must be used within a ThemeProvider"
    );
    spy.mockRestore();
  });
});

describe("ThemeProvider", () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    localStorage.clear();
    document.documentElement.classList.remove("dark-mode");
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("defaults to system theme", () => {
    const { mock } = createMatchMedia(false);
    window.matchMedia = mock as unknown as typeof window.matchMedia;

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe("system");
  });

  it("reads saved theme from localStorage", () => {
    localStorage.setItem("ui-theme", "dark");
    const { mock } = createMatchMedia(false);
    window.matchMedia = mock as unknown as typeof window.matchMedia;

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe("dark");
  });

  it("applies dark-mode class when system prefers dark", () => {
    const { mock } = createMatchMedia(true);
    window.matchMedia = mock as unknown as typeof window.matchMedia;

    renderHook(() => useTheme(), { wrapper });

    expect(document.documentElement.classList.contains("dark-mode")).toBe(true);
  });

  it("does not apply dark-mode class for system light preference", () => {
    const { mock } = createMatchMedia(false);
    window.matchMedia = mock as unknown as typeof window.matchMedia;

    renderHook(() => useTheme(), { wrapper });

    expect(document.documentElement.classList.contains("dark-mode")).toBe(
      false
    );
  });

  it("applies dark-mode class and persists when theme is dark", () => {
    const { mock } = createMatchMedia(false);
    window.matchMedia = mock as unknown as typeof window.matchMedia;

    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme("dark");
    });

    expect(document.documentElement.classList.contains("dark-mode")).toBe(true);
    expect(localStorage.getItem("ui-theme")).toBe("dark");
  });

  it("removes dark-mode class when theme is light", () => {
    document.documentElement.classList.add("dark-mode");
    const { mock } = createMatchMedia(false);
    window.matchMedia = mock as unknown as typeof window.matchMedia;

    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme("light");
    });

    expect(document.documentElement.classList.contains("dark-mode")).toBe(
      false
    );
    expect(localStorage.getItem("ui-theme")).toBe("light");
  });

  it("supports custom storageKey and darkModeClass", () => {
    localStorage.setItem("my-key", "dark");
    const { mock } = createMatchMedia(false);
    window.matchMedia = mock as unknown as typeof window.matchMedia;

    const customWrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider storageKey="my-key" darkModeClass="night">
        {children}
      </ThemeProvider>
    );

    renderHook(() => useTheme(), { wrapper: customWrapper });

    expect(document.documentElement.classList.contains("night")).toBe(true);
  });

  it("renders children", () => {
    const { mock } = createMatchMedia(false);
    window.matchMedia = mock as unknown as typeof window.matchMedia;

    render(
      <ThemeProvider>
        <span data-testid="child">Hello</span>
      </ThemeProvider>
    );

    expect(screen.getByTestId("child")).toHaveTextContent("Hello");
  });

  it("re-applies theme when system preference changes", () => {
    const { mock, listeners } = createMatchMedia(false);
    window.matchMedia = mock as unknown as typeof window.matchMedia;

    renderHook(() => useTheme(), { wrapper });

    expect(document.documentElement.classList.contains("dark-mode")).toBe(
      false
    );

    act(() => {
      mock.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      listeners.forEach((cb) => cb({} as MediaQueryListEvent));
    });

    expect(document.documentElement.classList.contains("dark-mode")).toBe(true);
  });
});
