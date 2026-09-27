import { act, renderHook } from "@testing-library/react";
import { useClipboard } from "./use-clipboard";

describe("useClipboard", () => {
  const originalExecCommand = document.execCommand;
  const originalSecureContext = window.isSecureContext;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    Reflect.deleteProperty(navigator, "clipboard");
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: originalSecureContext,
      writable: true,
    });
    if (originalExecCommand) {
      document.execCommand = originalExecCommand;
    } else {
      Reflect.deleteProperty(document, "execCommand");
    }
  });

  it("starts with copied as false", () => {
    const { result } = renderHook(() => useClipboard());

    expect(result.current.copied).toBe(false);
  });

  it("copies text using the modern clipboard API", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: true,
      writable: true,
    });

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      const res = await result.current.copy("hello");
      expect(res).toEqual({ success: true });
    });

    expect(writeText).toHaveBeenCalledWith("hello");
    expect(result.current.copied).toBe(true);
  });

  it("sets copied to the provided id", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: true,
      writable: true,
    });

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy("text", "my-id");
    });

    expect(result.current.copied).toBe("my-id");
  });

  it("resets copied to false after the timeout", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: true,
      writable: true,
    });

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy("text");
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.copied).toBe(false);
  });

  it("falls back to execCommand when clipboard API is unavailable", async () => {
    Object.assign(navigator, { clipboard: undefined });
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: false,
      writable: true,
    });

    const execCommand = vi.fn().mockReturnValue(true);
    document.execCommand = execCommand;

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      const res = await result.current.copy("fallback text");
      expect(res).toEqual({ success: true });
    });

    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(result.current.copied).toBe(true);
  });

  it("returns error when execCommand returns false", async () => {
    Object.assign(navigator, { clipboard: undefined });
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: false,
      writable: true,
    });

    document.execCommand = vi.fn().mockReturnValue(false);

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      const res = await result.current.copy("text");
      expect(res.success).toBe(false);
      expect(res.error).toBeInstanceOf(Error);
    });

    expect(result.current.copied).toBe(false);
    expect(document.body.querySelector("textarea")).toBeNull();
  });

  it("returns error when fallback throws", async () => {
    Object.assign(navigator, { clipboard: undefined });
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: false,
      writable: true,
    });

    document.execCommand = vi.fn().mockImplementation(() => {
      throw new Error("execCommand not supported");
    });

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      const res = await result.current.copy("text");
      expect(res.success).toBe(false);
      expect(res.error?.message).toBe("execCommand not supported");
    });

    expect(result.current.copied).toBe(false);
    expect(document.body.querySelector("textarea")).toBeNull();
  });

  it("falls back when modern clipboard API rejects", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.assign(navigator, { clipboard: { writeText } });
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: true,
      writable: true,
    });

    document.execCommand = vi.fn().mockReturnValue(true);

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      const res = await result.current.copy("text");
      expect(res).toEqual({ success: true });
    });

    expect(document.execCommand).toHaveBeenCalledWith("copy");
  });

  it("does not forward id when falling back from missing clipboard API", async () => {
    Object.assign(navigator, { clipboard: undefined });
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: false,
      writable: true,
    });

    document.execCommand = vi.fn().mockReturnValue(true);

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy("text", "btn-1");
    });

    expect(result.current.copied).toBe("btn-1");
  });

  it("forwards id when the modern clipboard API rejects", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.assign(navigator, { clipboard: { writeText } });
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: true,
      writable: true,
    });
    document.execCommand = vi.fn().mockReturnValue(true);

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      const res = await result.current.copy("text", "btn-2");
      expect(res).toEqual({ success: true });
    });

    expect(result.current.copied).toBe("btn-2");
    expect(document.body.querySelector("textarea")).toBeNull();
  });

  it("restarts the reset timer when copy is called again", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: true,
      writable: true,
    });

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy("one", "a");
    });

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    await act(async () => {
      await result.current.copy("two", "b");
    });

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(result.current.copied).toBe("b");

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.copied).toBe(false);
  });
});
