import { beforeEach, describe, expect, it, vi } from "vitest";

// Exercises the "Supabase not configured yet" path only — no live project.
// lib/supabaseAdmin.ts's db() reads SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY
// once and memoizes the result, so make sure they're unset before the module
// is imported by resetting modules between tests.
beforeEach(() => {
  vi.resetModules();
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
});

describe("lib/db degrade-when-unconfigured behavior", () => {
  it("read functions return empty results instead of throwing", async () => {
    const db = await import("./db");
    await expect(db.listPublishedTemplates()).resolves.toEqual([]);
    await expect(db.listAssessments("company-1")).resolves.toEqual([]);
    await expect(db.getAssessment("company-1", "assessment-1")).resolves.toBeNull();
    await expect(db.listSessionsForCompany("company-1")).resolves.toEqual([]);
    await expect(db.listRoles("company-1")).resolves.toEqual([]);
    await expect(db.getRole("company-1", "role-1")).resolves.toBeNull();
  });

  it("mutations throw a clear error instead of silently no-op-ing", async () => {
    const db = await import("./db");
    await expect(
      db.createAssessment({
        companyId: "company-1",
        templateId: "template-1",
        candidateName: "Jordan",
        candidateEmail: "jordan@example.com",
        roleId: "role-1",
        roleTitle: "Backend Engineer",
        dueDate: null,
      })
    ).rejects.toThrow("Supabase not configured");
    await expect(db.updateCompanyTeam("company-1", [])).rejects.toThrow("Supabase not configured");
    await expect(db.updateCompanyProfile("company-1", { name: "Acme", website: null })).rejects.toThrow(
      "Supabase not configured"
    );
    await expect(db.createTeammateAccount("company-1", "a@b.com", "reviewer", "pw")).rejects.toThrow(
      "Supabase not configured"
    );
    await expect(db.deleteTeammateAccount("auth-user-1")).rejects.toThrow("Supabase not configured");
    await expect(
      db.createRole({
        companyId: "company-1",
        title: "Backend Engineer",
        requirements: null,
        techStack: [],
        templateId: null,
      })
    ).rejects.toThrow("Supabase not configured");
    await expect(db.setRoleStatus("company-1", "role-1", "closed")).rejects.toThrow("Supabase not configured");
    await expect(db.setRoleTemplate("company-1", "role-1", "template-1")).rejects.toThrow("Supabase not configured");
  });
});
