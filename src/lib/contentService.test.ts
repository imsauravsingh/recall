import { describe, expect, it } from "vitest";
import { getLocalManifest, getLocalStudyPlan } from "./contentService";

describe("contentService", () => {
  it("loads the local manifest with expected modules", () => {
    const manifest = getLocalManifest();

    expect(manifest.version).toBe("1.0.0");
    expect(manifest.modules).toContain("system-design");
    expect(manifest.modules).toContain("dsa");
    expect(manifest.modules).toContain("ai");
  });

  it("loads the local study plan data", () => {
    const plan = getLocalStudyPlan();

    expect(plan.title).toContain("90-Day");
    expect(plan.weeks.length).toBeGreaterThan(0);
    expect(plan.weeks[0].sections.length).toBeGreaterThan(0);
    expect(plan.monthlyGoals.length).toBeGreaterThan(0);
  });
});
