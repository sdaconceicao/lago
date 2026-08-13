import { renderHook } from "@testing-library/react";
import { useResizeObserver } from "./use-resize-observer";

/** A ResizeObserver stand-in whose notifications the test drives by hand. */
class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];

  observed: Element[] = [];
  disconnected = false;

  constructor(private readonly callback: ResizeObserverCallback) {
    FakeResizeObserver.instances.push(this);
  }

  observe(element: Element) {
    this.observed.push(element);
  }

  unobserve() {}

  disconnect() {
    this.disconnected = true;
  }

  /** Delivers `entries` the way the browser would. */
  emit(entries: Partial<ResizeObserverEntry>[]) {
    this.callback(
      entries as ResizeObserverEntry[],
      this as unknown as ResizeObserver
    );
  }
}

const size = (inlineSize: number, blockSize: number): ResizeObserverSize => ({
  inlineSize,
  blockSize,
});

const latest = () =>
  FakeResizeObserver.instances[FakeResizeObserver.instances.length - 1];

const renderWithElement = (callback: (size: ResizeObserverSize) => void) => {
  const element = document.createElement("div");
  const utils = renderHook(({ cb }) => useResizeObserver(element, cb), {
    initialProps: { cb: callback },
  });
  return { ...utils, element };
};

describe("useResizeObserver", () => {
  beforeEach(() => {
    FakeResizeObserver.instances = [];
    vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("observes the given element", () => {
    const { element } = renderWithElement(vi.fn());

    expect(latest().observed).toEqual([element]);
  });

  // A target that only exists after mount is the common case for a subtree
  // that renders nothing until it has something to show.
  it("subscribes when a target appears after mount", () => {
    const element = document.createElement("div");
    const { rerender } = renderHook(
      ({ target }) => useResizeObserver(target, vi.fn()),
      { initialProps: { target: null as Element | null } }
    );

    expect(FakeResizeObserver.instances).toHaveLength(0);

    rerender({ target: element });

    expect(latest().observed).toEqual([element]);
  });

  it("re-subscribes when the target changes", () => {
    const first = document.createElement("div");
    const second = document.createElement("div");
    const { rerender } = renderHook(
      ({ target }) => useResizeObserver(target, vi.fn()),
      { initialProps: { target: first as Element | null } }
    );
    const firstObserver = latest();

    rerender({ target: second });

    expect(firstObserver.disconnected).toBe(true);
    expect(latest().observed).toEqual([second]);
  });

  it("reports the content-box size of a resize", () => {
    const callback = vi.fn();
    renderWithElement(callback);

    latest().emit([{ contentBoxSize: [size(320, 36)] }]);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(size(320, 36));
  });

  it("falls back to contentRect when contentBoxSize is empty", () => {
    const callback = vi.fn();
    renderWithElement(callback);

    latest().emit([
      {
        contentBoxSize: [],
        contentRect: { width: 240, height: 28 } as DOMRectReadOnly,
      },
    ]);

    expect(callback).toHaveBeenCalledWith(size(240, 28));
  });

  it("ignores a notification with no entries", () => {
    const callback = vi.fn();
    renderWithElement(callback);

    latest().emit([]);

    expect(callback).not.toHaveBeenCalled();
  });

  it("calls the latest callback without re-subscribing", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderWithElement(first);

    rerender({ cb: second });
    latest().emit([{ contentBoxSize: [size(400, 36)] }]);

    expect(FakeResizeObserver.instances).toHaveLength(1);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(size(400, 36));
  });

  it("disconnects on unmount", () => {
    const { unmount } = renderWithElement(vi.fn());
    const observer = latest();

    unmount();

    expect(observer.disconnected).toBe(true);
  });

  it("does not observe when there is no target", () => {
    renderHook(() => useResizeObserver(null, vi.fn()));

    expect(FakeResizeObserver.instances).toHaveLength(0);
  });

  it("does not observe where ResizeObserver is unavailable", () => {
    vi.stubGlobal("ResizeObserver", undefined);
    const element = document.createElement("div");

    expect(() =>
      renderHook(() => useResizeObserver(element, vi.fn()))
    ).not.toThrow();
  });
});
