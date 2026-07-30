import { act, renderHook } from "@testing-library/react";
import { useImageStatus } from "./ImagePlaceholder.hooks";

const SRC = "https://example.com/bell.jpg";
const OTHER_SRC = "https://example.com/other-bell.jpg";

/**
 * An `<img>` standing in for one the browser has already resolved, which is
 * what the ref reads on mount. A `naturalWidth` of zero is how a failed load
 * looks once it is complete.
 */
const resolvedImage = (naturalWidth: number) => {
  const image = document.createElement("img");
  Object.defineProperty(image, "complete", { value: true });
  Object.defineProperty(image, "naturalWidth", { value: naturalWidth });
  return image;
};

const pendingImage = () => {
  const image = document.createElement("img");
  Object.defineProperty(image, "complete", { value: false });
  return image;
};

describe("useImageStatus", () => {
  it("is empty when there is no src", () => {
    const { result } = renderHook(() => useImageStatus());

    expect(result.current.status).toBe("empty");
  });

  it("is empty for a blank src", () => {
    const { result } = renderHook(() => useImageStatus(""));

    expect(result.current.status).toBe("empty");
  });

  it("starts loading when a src is given", () => {
    const { result } = renderHook(() => useImageStatus(SRC));

    expect(result.current.status).toBe("loading");
  });

  it("reports loaded once the image loads", () => {
    const { result } = renderHook(() => useImageStatus(SRC));

    act(() => result.current.markLoaded());

    expect(result.current.status).toBe("loaded");
  });

  it("reports an error once the image fails", () => {
    const { result } = renderHook(() => useImageStatus(SRC));

    act(() => result.current.markError());

    expect(result.current.status).toBe("error");
  });

  it("records nothing when there is no src to record it against", () => {
    const { result } = renderHook(() => useImageStatus());

    act(() => result.current.markLoaded());

    expect(result.current.status).toBe("empty");
  });

  it("starts over when the src changes after a failure", () => {
    const { result, rerender } = renderHook(({ src }) => useImageStatus(src), {
      initialProps: { src: SRC },
    });

    act(() => result.current.markError());
    expect(result.current.status).toBe("error");

    rerender({ src: OTHER_SRC });

    expect(result.current.status).toBe("loading");
  });

  it("returns to the earlier result when the src changes back", () => {
    const { result, rerender } = renderHook(({ src }) => useImageStatus(src), {
      initialProps: { src: SRC },
    });

    act(() => result.current.markLoaded());
    rerender({ src: OTHER_SRC });
    rerender({ src: SRC });

    // The stored result is keyed by URL, so the original is still the one held.
    expect(result.current.status).toBe("loaded");
  });

  it("settles as loaded from an image the browser already decoded", () => {
    const { result } = renderHook(() => useImageStatus(SRC));

    act(() => result.current.settleFromNode(resolvedImage(640)));

    expect(result.current.status).toBe("loaded");
  });

  it("settles as an error from a cached image that has no pixels", () => {
    const { result } = renderHook(() => useImageStatus(SRC));

    act(() => result.current.settleFromNode(resolvedImage(0)));

    expect(result.current.status).toBe("error");
  });

  it("leaves an image that has not finished loading alone", () => {
    const { result } = renderHook(() => useImageStatus(SRC));

    act(() => result.current.settleFromNode(pendingImage()));

    expect(result.current.status).toBe("loading");
  });

  it("ignores a node that is not an image, including the unmount cleanup", () => {
    const { result } = renderHook(() => useImageStatus(SRC));

    act(() => result.current.settleFromNode(null));
    act(() => result.current.settleFromNode(document.createElement("div")));

    expect(result.current.status).toBe("loading");
  });
});
