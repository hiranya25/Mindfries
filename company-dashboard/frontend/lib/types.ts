// Domain model for the Company Portal (PRD §1.4). Shared tables with
// internal-admin and candidate — see /ARCHITECTURE.md and
// supabase/migrations/0002_product.sql. Trimmed to what this portal needs;
// internal-admin/frontend/lib/types.ts additionally carries the Lead Tracker
// types (leads, waitlist, onboarded_companies) that don't belong here.

export type Plan = "trial" | "starter" | "growth" | "enterprise";
export type CompanyStatus = "onboarding" | "active" | "paused";
export type MemberRole = "admin" | "hiring_manager" | "reviewer";

export interface TeamMember {
  email: string;
  role: MemberRole;
  // The Supabase Auth user this roster entry's real login lives in — lets
  // removeTeamMember delete the matching auth account without scanning every
  // user. Optional only because entries written before this field existed
  // (e.g. the founding admin, created by internal-admin's onboardCompany)
  // may not carry it.
  authUserId?: string;
}

export interface Company {
  id: string;
  name: string;
  website: string | null;
  plan: Plan;
  status: CompanyStatus;
  seats: number;
  team: TeamMember[];
  defaultTemplateIds: string[];
  createdAt: string;
}

export type TaskVariant = "bug_fix" | "feature" | "refactor" | "debug";
export type TemplateStatus = "draft" | "published";

export type RoleStatus = "open" | "closed";

// PRD §1.4 Role Management — a company can be hiring for several of these at
// once. Assessments reference one via roleId; see ARCHITECTURE.md for how
// this stays additive to the pre-existing assessments.role text column.
export interface Role {
  id: string;
  companyId: string;
  title: string;
  status: RoleStatus;
  requirements: string | null;
  techStack: string[];
  // R4 Assessment Configuration — a preferred published template, joined by
  // name for display; the invite form pre-selects it but doesn't require it.
  templateId: string | null;
  templateName: string | null;
  createdAt: string;
}

export interface RubricCriterion {
  id: string;
  label: string;
  weight: number;
}

// The shared Assessment/Game Library — authored by Mindfries ops in
// internal-admin, only published ones are selectable here.
export interface GameTemplate {
  id: string;
  name: string;
  taskVariant: TaskVariant;
  techStack: string[];
  durationMin: number;
  status: TemplateStatus;
}

export type AssessmentStatus = "invited" | "in_progress" | "submitted" | "closed";

// A candidate invited to run a template for this company, against a Role.
export interface Assessment {
  id: string;
  companyId: string;
  templateId: string | null;
  templateName: string | null;
  roleId: string | null;
  // Display name for the role: the live roles.title when roleId is set,
  // falling back to the legacy free-text assessments.role column for rows
  // written before Role existed as its own entity.
  role: string | null;
  candidateName: string | null;
  candidateEmail: string;
  status: AssessmentStatus;
  dueDate: string | null;
  matchScore: number | null;
  createdAt: string;
}

export type SessionStatus = "live" | "submitted" | "evaluating" | "completed" | "stuck" | "failed";

// Live/past technical run detail — written by the candidate app, read-only here.
export interface AssessmentSession {
  id: string;
  assessmentId: string | null;
  status: SessionStatus;
  progressPct: number;
  durationMin: number;
  elapsedMin: number;
  startedAt: string;
}
