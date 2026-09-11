import type { AssessmentStatus, CompanyStatus, Plan, SessionStatus, TaskVariant, TemplateStatus } from "./types";

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
