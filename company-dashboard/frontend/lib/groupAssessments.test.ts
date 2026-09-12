import { describe, expect, it } from "vitest";
import { groupAssessmentsByRole } from "./groupAssessments";
import type { Assessment, Role } from "./types";

function role(overrides: Partial<Role>): Role {
  return {
    id: "role-1",
    companyId: "company-1",
    title: "Backend Engineer",
    status: "open",
    requirements: null,
    techStack: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function assessment(overrides: Partial<Assessment>): Assessment {
  return {
    id: "a1",
    companyId: "company-1",
    templateId: "template-1",
    templateName: "API Bug Hunt",
    roleId: null,
    role: null,
    candidateName: "Jordan Lee",
    candidateEmail: "jordan@example.com",
    status: "invited",
    dueDate: null,
    matchScore: null,
    createdAt: "2026-01-02T00:00:00.000Z",
    ...overrides,
  };
}

describe("groupAssessmentsByRole", () => {
  it("groups assessments under their matching role, in the order roles were passed", () => {
    const backend = role({ id: "r-backend", title: "Backend Engineer" });
    const frontend = role({ id: "r-frontend", title: "Frontend Engineer" });
    const assessments = [
      assessment({ id: "a1", roleId: "r-frontend" }),
      assessment({ id: "a2", roleId: "r-backend" }),
      assessment({ id: "a3", roleId: "r-backend" }),
    ];

    const groups = groupAssessmentsByRole(assessments, [backend, frontend]);

    expect(groups.map((g) => g.label)).toEqual(["Backend Engineer", "Frontend Engineer"]);
    expect(groups[0].assessments.map((a) => a.id)).toEqual(["a2", "a3"]);
    expect(groups[1].assessments.map((a) => a.id)).toEqual(["a1"]);
  });

  it("falls back to the legacy free-text role for rows without a roleId", () => {
    const assessments = [assessment({ id: "a1", roleId: null, role: "Contract Designer" })];
    const groups = groupAssessmentsByRole(assessments, []);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({ label: "Contract Designer", role: undefined });
  });

  it("buckets rows with neither a roleId nor legacy role text as Unassigned", () => {
    const assessments = [assessment({ id: "a1", roleId: null, role: null })];
    const groups = groupAssessmentsByRole(assessments, []);
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe("Unassigned");
  });

  it("omits roles with no matching assessments and sorts legacy/unassigned groups busiest-first", () => {
    const backend = role({ id: "r-backend", title: "Backend Engineer" });
    const assessments = [
      assessment({ id: "a1", roleId: null, role: "Solo Contractor" }),
      assessment({ id: "a2", roleId: null, role: null }),
      assessment({ id: "a3", roleId: null, role: null }),
    ];

    const groups = groupAssessmentsByRole(assessments, [backend]);

    // backend has zero assessments -> not present at all
    expect(groups.some((g) => g.label === "Backend Engineer")).toBe(false);
    // "Unassigned" (2 rows) sorts ahead of "Solo Contractor" (1 row)
    expect(groups.map((g) => g.label)).toEqual(["Unassigned", "Solo Contractor"]);
  });

  it("falls back to legacy text when roleId points at a role that's since been deleted", () => {
    const assessments = [assessment({ id: "a1", roleId: "role-deleted", role: "Backend Engineer (archived)" })];
    const groups = groupAssessmentsByRole(assessments, []);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({ label: "Backend Engineer (archived)", role: undefined });
  });
});
