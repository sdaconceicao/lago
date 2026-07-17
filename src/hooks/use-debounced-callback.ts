import { useCallback, useEffect, useMemo, useRef } from "react";

export interface DebouncedCallback<Args extends unknown[]> {
  /** Schedules the callback, replacing any pending invocation. */
  schedule: (...args: Args) => void;
  /** Cancels the pending invocation, if any. */
  cancel: () => void;
}

/**
 * Debounces `callback`: `schedule` waits `delay` ms after its most recent
 * call before invoking it. The scheduled invocation always uses the latest
 * `callback`, `schedule` and `cancel` keep stable identities unless `delay`
 * changes, and any pending invocation is cancelled on unmount or via
 * `cancel()`.
 *
 * @param {Function} callback - The function to debounce.
 * @param {number} delay - Milliseconds to wait after the last call.
 * @returns {DebouncedCallback} - The `schedule` and `cancel` functions.
 */
export const useDebouncedCallback = <Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number
): DebouncedCallback<Args> => {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Clear any pending invocation when the component unmounts.
  useEffect(() => cancel, [cancel]);

  const schedule = useCallback(
    (...args: Args) => {
      cancel();
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        callbackRef.current(...args);
      }, delay);
    },
    [cancel, delay]
  );

  return useMemo(() => ({ schedule, cancel }), [schedule, cancel]);
};
