import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Cleanup after each test, and leave real timers for the next file.
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
