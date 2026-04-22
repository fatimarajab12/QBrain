/**
 * Silence console methods during a test to keep Jest output clean.
 * Returns a restore() function.
 */
import { jest } from "@jest/globals";

export function silenceConsole(
  methods = ["log", "warn", "error", "info", "debug"]
) {
  const spies = methods
    .filter((m) => typeof console[m] === "function")
    .map((m) => ({ m, spy: jest.spyOn(console, m).mockImplementation(() => {}) }));

  return function restore() {
    spies.forEach(({ spy }) => spy.mockRestore());
  };
}


