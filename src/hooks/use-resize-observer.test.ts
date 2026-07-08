import type { RefObject } from "@react-types/shared";
import { renderHook } from "@testing-library/react";
import { useResizeObserver } from "./use-resize-observer";

let observeCallback: ResizeObserverCallback;
const observeMock = vi.fn();
const unobserveMock = vi.fn();

class FakeResizeObserver {
  constructor(cb: ResizeObserverCallback) {
    observeCallback = cb;
  }
  observe = observeMock;
  unobserve = unobserveMock;
  disconnect = vi.fn();
}

describe("useResizeObserver", () => {
  let originalResizeObserver: typeof window.ResizeObserver;

  beforeEach(() => {
    originalResizeObserver = window.ResizeObserver;
    window.ResizeObserver =
      FakeResizeObserver as unknown as typeof ResizeObserver;
    observeMock.mockClear();
    unobserveMock.mockClear();
  });

  afterEach(() => {
    window.ResizeObserver = originalResizeObserver;
  });

  it("observes the element when ref has a current value", () => {
    const element = document.createElement("div");
    const ref = { current: element } as RefObject<HTMLDivElement>;
    const onResize = vi.fn();

    renderHook(() => useResizeObserver({ ref, onResize }));

    expect(observeMock).toHaveBeenCalledWith(element, { box: undefined });
  });

  it("passes the box option to ResizeObserver.observe", () => {
    const element = document.createElement("div");
    const ref = { current: element } as RefObject<HTMLDivElement>;
    const onResize = vi.fn();

    renderHook(() => useResizeObserver({ ref, onResize, box: "border-box" }));

    expect(observeMock).toHaveBeenCalledWith(element, { box: "border-box" });
  });

  it("calls onResize when entries are reported", () => {
    const element = document.createElement("div");
    const ref = { current: element } as RefObject<HTMLDivElement>;
    const onResize = vi.fn();

    renderHook(() => useResizeObserver({ ref, onResize }));

    observeCallback([{} as ResizeObserverEntry], {} as ResizeObserver);

    expect(onResize).toHaveBeenCalledTimes(1);
  });

  it("does not call onResize when entries array is empty", () => {
    const element = document.createElement("div");
    const ref = { current: element } as RefObject<HTMLDivElement>;
    const onResize = vi.fn();

    renderHook(() => useResizeObserver({ ref, onResize }));

    observeCallback([], {} as ResizeObserver);

    expect(onResize).not.toHaveBeenCalled();
  });

  it("unobserves the element on unmount", () => {
    const element = document.createElement("div");
    const ref = { current: element } as RefObject<HTMLDivElement>;
    const onResize = vi.fn();

    const { unmount } = renderHook(() => useResizeObserver({ ref, onResize }));
    unmount();

    expect(unobserveMock).toHaveBeenCalledWith(element);
  });

  it("falls back to window resize listener when ResizeObserver is unavailable", () => {
    // @ts-expect-error -- intentionally removing ResizeObserver
    delete window.ResizeObserver;

    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const element = document.createElement("div");
    const ref = { current: element } as RefObject<HTMLDivElement>;
    const onResize = vi.fn();

    const { unmount } = renderHook(() => useResizeObserver({ ref, onResize }));

    expect(addSpy).toHaveBeenCalledWith("resize", onResize, false);

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("resize", onResize, false);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("does nothing when ref is undefined", () => {
    const onResize = vi.fn();

    renderHook(() => useResizeObserver({ ref: undefined, onResize }));

    expect(observeMock).not.toHaveBeenCalled();
  });
});
