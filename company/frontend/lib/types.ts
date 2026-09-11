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

// A candidate invited to run a template for this company (PRD §1.4's "Roles"
// + "Candidates" collapsed into one table — see ARCHITECTURE.md).
export interface Assessment {
  id: string;
  companyId: string;
  templateId: string | null;
  templateName: string | null;
  candidateName: string | null;
  candidateEmail: string;
  role: string | null;
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
