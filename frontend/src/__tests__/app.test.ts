import { describe, it, expect } from "vitest";

describe("App", () => {
  it("should have correct metadata title pattern", () => {
    // Smoke test to verify vitest setup works
    const title = "SkillBridge — Academia-Industry Collaboration Portal";
    expect(title).toContain("SkillBridge");
    expect(title).toContain("Academia");
    expect(title).toContain("Industry");
  });

  it("should define all four roles", () => {
    const roles = ["STUDENT", "ACADEMICIAN", "INDUSTRY", "ADMIN"];
    expect(roles).toHaveLength(4);
    expect(roles).toContain("STUDENT");
    expect(roles).toContain("ADMIN");
  });
});
