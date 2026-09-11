// Same permissive email check internal-admin uses
// (internal-admin/frontend/app/admin/actions.ts) — good enough to catch
// typos without rejecting valid addresses Supabase itself would accept.
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

// Free-text fields (candidate name, role) have no format to validate, just a
// sane upper bound so a pasted document can't bloat a row indefinitely.
export const MAX_FREE_TEXT_LENGTH = 200;

export function isValidFreeText(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_FREE_TEXT_LENGTH;
}
