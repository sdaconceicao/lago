"use client";
import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_TIMEOUT = 2000;

type UseClipboardReturnType = {
  /**
   * The state indicating whether the text has been copied.
   * If a string is provided, it will be used as the identifier for the copied state.
   */
  copied: string | boolean;
  /**
   * Function to copy text to the clipboard using the modern clipboard API.
   * Falls back to the fallback function if the modern API fails.
   *
   * @param {string} text - The text to be copied.
   * @param {string} [id] - Optional identifier to set the copied state.
   * @returns {Promise<Object>} - A promise that resolves to an object containing:
   *  - `success` (boolean): Whether the copy operation was successful.
   *  - `error` (Error | undefined): The error object if the copy operation failed.
   */
  copy: (
    text: string,
    id?: string
  ) => Promise<{ success: boolean; error?: Error }>;
};

/**
 * Custom hook to copy text to the clipboard.
 *
 * @returns {UseClipboardReturnType} - An object containing the copied state and the copy function.
 */
export const useClipboard = (): UseClipboardReturnType => {
  const [copied, setCopied] = useState<string | boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearResetTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => clearResetTimer, [clearResetTimer]);

  const markCopied = useCallback(
    (id?: string) => {
      clearResetTimer();
      setCopied(id || true);
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        setCopied(false);
      }, DEFAULT_TIMEOUT);
    },
    [clearResetTimer]
  );

  // Fallback function for older browsers
  const fallback = useCallback(
    (text: string, id?: string) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "absolute";
      textArea.style.left = "-99999px";
      document.body.appendChild(textArea);

      try {
        textArea.select();
        const success = document.execCommand("copy");

        if (!success) {
          return {
            success: false,
            error: new Error("execCommand returned false"),
          };
        }

        markCopied(id);
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err : new Error("Fallback copy failed"),
        };
      } finally {
        textArea.remove();
      }
    },
    [markCopied]
  );

  const copy = useCallback(
    async (text: string, id?: string) => {
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          markCopied(id);
          return { success: true };
        } catch {
          // If modern method fails, try fallback
          return fallback(text, id);
        }
      }

      return fallback(text, id);
    },
    [fallback, markCopied]
  );

  return { copied, copy };
};
