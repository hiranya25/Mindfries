import type { Assessment, Role } from "./types";

export interface AssessmentGroup {
  key: string;
  label: string;
  role?: Role;
  assessments: Assessment[];
}

// Groups assessments by their role, in this order: known roles (in the
// order `roles` was passed — see roles/page.tsx, open before closed), then
// legacy free-text `role` strings and "Unassigned" for anything without a
// roleId, busiest group first. A role a group's assessments point at via
// roleId but that isn't in `roles` (e.g. since deleted) falls back to the
// legacy text/Unassigned bucket too.
export function groupAssessmentsByRole(assessments: Assessment[], roles: Role[]): AssessmentGroup[] {
  const byId = new Map(roles.map((r) => [r.id, r] as const));
  const map = new Map<string, AssessmentGroup>();

  for (const a of assessments) {
    const role = a.roleId ? byId.get(a.roleId) : undefined;
    const key = role ? role.id : a.role ? `legacy:${a.role}` : "unassigned";
    const label = role ? role.title : a.role ?? "Unassigned";
    if (!map.has(key)) map.set(key, { key, label, role, assessments: [] });
    map.get(key)!.assessments.push(a);
  }

  const roleGroups = roles.map((r) => map.get(r.id)).filter((g): g is AssessmentGroup => !!g);
  const otherGroups = [...map.values()]
    .filter((g) => !g.role)
    .sort((a, b) => b.assessments.length - a.assessments.length);
  return [...roleGroups, ...otherGroups];
}
