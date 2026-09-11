import { describe, expect, it } from "vitest";
import { isValidEmail, isValidFreeText, MAX_FREE_TEXT_LENGTH } from "./validate";

describe("isValidEmail", () => {
  it("accepts ordinary addresses", () => {
    expect(isValidEmail("jordan@example.com")).toBe(true);
    expect(isValidEmail("  jordan@example.com  ")).toBe(true);
  });

  it("rejects addresses missing an @ or a domain dot", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("jordan@example")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("isValidFreeText", () => {
  it("rejects empty/whitespace-only input", () => {
    expect(isValidFreeText("")).toBe(false);
    expect(isValidFreeText("   ")).toBe(false);
  });

  it("accepts text within the length cap and rejects text over it", () => {
    expect(isValidFreeText("Backend Engineer")).toBe(true);
    expect(isValidFreeText("a".repeat(MAX_FREE_TEXT_LENGTH))).toBe(true);
    expect(isValidFreeText("a".repeat(MAX_FREE_TEXT_LENGTH + 1))).toBe(false);
  });
});
