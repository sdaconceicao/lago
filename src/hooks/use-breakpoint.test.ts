import { act, renderHook } from "@testing-library/react";
import { useBreakpoint } from "./use-breakpoint";

const createMatchMedia = (matches: boolean) => {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];

  const mql = {
    matches,
    media: "",
    addEventListener: vi.fn(
      (_event: string, cb: (e: MediaQueryListEvent) => void) => {
        listeners.push(cb);
      }
    ),
    removeEventListener: vi.fn(
      (_event: string, cb: (e: MediaQueryListEvent) => void) => {
        const idx = listeners.indexOf(cb);
        if (idx !== -1) listeners.splice(idx, 1);
      }
    ),
  };

  return {
    mql,
    listeners,
    mockFn: vi.fn(() => mql),
  };
};

describe("useBreakpoint", () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("returns true when the breakpoint matches", () => {
    const { mockFn } = createMatchMedia(true);
    window.matchMedia = mockFn as unknown as typeof window.matchMedia;

    const { result } = renderHook(() => useBreakpoint("md"));

    expect(result.current).toBe(true);
  });

  it("returns false when the breakpoint does not match", () => {
    const { mockFn } = createMatchMedia(false);
    window.matchMedia = mockFn as unknown as typeof window.matchMedia;

    const { result } = renderHook(() => useBreakpoint("lg"));

    expect(result.current).toBe(false);
  });

  it("queries the correct min-width for the given size", () => {
    const { mockFn } = createMatchMedia(true);
    window.matchMedia = mockFn as unknown as typeof window.matchMedia;

    renderHook(() => useBreakpoint("xl"));

    expect(mockFn).toHaveBeenCalledWith("(min-width: 1280px)");
  });

  it("registers and removes a change event listener", () => {
    const { mql, mockFn } = createMatchMedia(true);
    window.matchMedia = mockFn as unknown as typeof window.matchMedia;

    const { unmount } = renderHook(() => useBreakpoint("sm"));

    expect(mql.addEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    );

    unmount();

    expect(mql.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    );
  });

  it("updates when the media query change event fires", () => {
    const { listeners, mockFn } = createMatchMedia(false);
    window.matchMedia = mockFn as unknown as typeof window.matchMedia;

    const { result } = renderHook(() => useBreakpoint("md"));

    expect(result.current).toBe(false);

    act(() => {
      listeners.forEach((cb) => cb({ matches: true } as MediaQueryListEvent));
    });

    expect(result.current).toBe(true);
  });

  it("re-creates the listener when size changes", () => {
    const { mql, mockFn } = createMatchMedia(true);
    window.matchMedia = mockFn as unknown as typeof window.matchMedia;

    type BreakpointSize = "sm" | "md" | "lg" | "xl" | "2xl";
    const { rerender } = renderHook(
      ({ size }: { size: BreakpointSize }) => useBreakpoint(size),
      {
        initialProps: { size: "sm" },
      }
    );

    expect(mql.addEventListener).toHaveBeenCalledTimes(1);

    rerender({ size: "lg" });

    expect(mql.removeEventListener).toHaveBeenCalled();
    expect(mql.addEventListener).toHaveBeenCalledTimes(2);
  });
});
