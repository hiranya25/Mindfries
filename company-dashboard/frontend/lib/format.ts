import type { AssessmentStatus, CompanyStatus, Plan, ReportStatus, RoleStatus, SessionStatus, TaskVariant, TemplateStatus } from "./types";

export type Tone = "violet" | "coral" | "green" | "amber" | "gray";

export const planLabel: Record<Plan, string> = {
  trial: "Trial",
  starter: "Starter",
  growth: "Growth",
  enterprise: "Enterprise",
};

export const companyTone: Record<CompanyStatus, Tone> = {
  onboarding: "amber",
  active: "green",
  paused: "gray",
};

export const taskVariantLabel: Record<TaskVariant, string> = {
  bug_fix: "Bug Fix",
  feature: "Feature",
  refactor: "Refactor",
  debug: "Debug",
};

export const templateTone: Record<TemplateStatus, Tone> = {
  draft: "gray",
  published: "green",
};

export const assessmentStatusLabel: Record<AssessmentStatus, string> = {
  invited: "Invited",
  in_progress: "In progress",
  submitted: "Submitted",
  closed: "Closed",
};

export const assessmentStatusTone: Record<AssessmentStatus, Tone> = {
  invited: "gray",
  in_progress: "violet",
  submitted: "amber",
  closed: "green",
};

export const roleStatusLabel: Record<RoleStatus, string> = {
  open: "Open",
  closed: "Closed",
};

export const roleStatusTone: Record<RoleStatus, Tone> = {
  open: "green",
  closed: "gray",
};

export const sessionTone: Record<SessionStatus, Tone> = {
  live: "violet",
  submitted: "gray",
  evaluating: "amber",
  completed: "green",
  stuck: "coral",
  failed: "coral",
};

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// "none" = no session/report yet — not a real assessment_reports.status value,
// added here so the Reports list can show one consistent pill per candidate.
export type ReportStatusDisplay = ReportStatus | "none";

export const reportStatusLabel: Record<ReportStatusDisplay, string> = {
  none: "Not started",
  pending: "Queued",
  generating: "In review",
  ready: "Ready",
  failed: "Failed",
};

export const reportStatusTone: Record<ReportStatusDisplay, Tone> = {
  none: "gray",
  pending: "gray",
  generating: "violet",
  ready: "green",
  failed: "coral",
};

// Matches candidate/frontend's assessments/[sessionId]/report/page.tsx labels
// so a candidate and their company see the same wording for the same report.
export const recommendationLabel: Record<string, string> = {
  strong_hire: "Strong hire",
  hire: "Hire",
  lean_no: "Leaning no",
  no_hire: "No hire",
};

export const recommendationTone: Record<string, Tone> = {
  strong_hire: "green",
  hire: "green",
  lean_no: "amber",
  no_hire: "coral",
};

export const evidenceCategoryLabel: Record<string, string> = {
  code_evaluation: "Code evaluation",
  reasoning: "Reasoning",
  workflow: "Workflow",
  interview: "Interview",
  ai_usage: "AI assistant usage",
  integrity: "Integrity",
  rubric: "Rubric scores",
  interview_status: "Interview",
  provenance: "Where the work came from",
  incomplete: "Missing from this report",
};
