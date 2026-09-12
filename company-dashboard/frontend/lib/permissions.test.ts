import { describe, expect, it } from "vitest";
import { canEditSettings, canInviteCandidate, canManageRoles, canManageTeam } from "./permissions";
import type { MemberRole } from "./types";

const roles: MemberRole[] = ["admin", "hiring_manager", "reviewer"];

describe("canManageTeam", () => {
  it("only admins can manage the team", () => {
    expect(roles.filter(canManageTeam)).toEqual(["admin"]);
  });
});

describe("canEditSettings", () => {
  it("only admins can edit settings", () => {
    expect(roles.filter(canEditSettings)).toEqual(["admin"]);
  });
});

describe("canInviteCandidate", () => {
  it("admins and hiring managers can invite candidates, reviewers can't", () => {
    expect(roles.filter(canInviteCandidate)).toEqual(["admin", "hiring_manager"]);
  });
});

describe("canManageRoles", () => {
  it("admins and hiring managers can create/close roles, reviewers can't", () => {
    expect(roles.filter(canManageRoles)).toEqual(["admin", "hiring_manager"]);
  });
});
