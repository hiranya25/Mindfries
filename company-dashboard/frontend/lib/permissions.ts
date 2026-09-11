import type { MemberRole } from "./types";

// Server-enforced role matrix. Checked both here (actions) and in the UI
// (hide the control) — the UI check alone would just be decoration.
export function canManageTeam(role: MemberRole): boolean {
  return role === "admin";
}

export function canEditSettings(role: MemberRole): boolean {
  return role === "admin";
}

export function canInviteCandidate(role: MemberRole): boolean {
  return role === "admin" || role === "hiring_manager";
}
