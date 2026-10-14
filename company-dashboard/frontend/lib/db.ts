import "server-only";
import { db } from "./supabaseAdmin";
import type {
  Assessment,
  AssessmentReport,
  AssessmentSession,
  GameTemplate,
  ReportSummary,
  Role,
  RoleStatus,
  TeamMember,
} from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

function toTemplate(r: any): GameTemplate {
  return {
    id: r.id,
    name: r.name,
    taskVariant: r.task_variant,
    techStack: r.tech_stack ?? [],
    durationMin: r.duration_min ?? 60,
    status: r.status,
  };
}

// Only published templates — this portal picks from the shared library,
// it doesn't author rubrics/repo config (that stays in internal-admin).
export async function listPublishedTemplates(): Promise<GameTemplate[]> {
  const c = db();
  if (!c) return [];
  const { data } = await c
    .from("game_templates")
    .select("*")
    .eq("status", "published")
    .order("name", { ascending: true });
  return (data ?? []).map(toTemplate);
}

function toRole(r: any): Role {
  return {
    id: r.id,
    companyId: r.company_id,
    title: r.title,
    status: r.status,
    requirements: r.requirements,
    techStack: r.tech_stack ?? [],
    templateId: r.template_id,
    templateName: r.game_templates?.name ?? null,
    createdAt: r.created_at,
  };
}

export async function listRoles(companyId: string): Promise<Role[]> {
  const c = db();
  if (!c) return [];
  const { data } = await c
    .from("roles")
    .select("*, game_templates(name)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  return (data ?? []).map(toRole);
}

export async function getRole(companyId: string, id: string): Promise<Role | null> {
  const c = db();
  if (!c) return null;
  const { data } = await c
    .from("roles")
    .select("*, game_templates(name)")
    .eq("company_id", companyId)
    .eq("id", id)
    .single();
  return data ? toRole(data) : null;
}

export async function createRole(input: {
  companyId: string;
  title: string;
  requirements: string | null;
  techStack: string[];
  templateId: string | null;
}): Promise<string> {
  const c = db();
  if (!c) throw new Error("Supabase not configured");
  const { data, error } = await c
    .from("roles")
    .insert({
      company_id: input.companyId,
      title: input.title,
      requirements: input.requirements,
      tech_stack: input.techStack,
      template_id: input.templateId,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function setRoleStatus(companyId: string, id: string, status: RoleStatus): Promise<void> {
  const c = db();
  if (!c) throw new Error("Supabase not configured");
  const { error } = await c.from("roles").update({ status }).eq("company_id", companyId).eq("id", id);
  if (error) throw error;
}

// R4 Assessment Configuration — sets/clears a role's preferred template.
export async function setRoleTemplate(companyId: string, id: string, templateId: string | null): Promise<void> {
  const c = db();
  if (!c) throw new Error("Supabase not configured");
  const { error } = await c
    .from("roles")
    .update({ template_id: templateId })
    .eq("company_id", companyId)
    .eq("id", id);
  if (error) throw error;
}

function toAssessment(r: any): Assessment {
  return {
    id: r.id,
    companyId: r.company_id,
    templateId: r.template_id,
    templateName: r.game_templates?.name ?? null,
    roleId: r.role_id,
    // Prefer the live role title (renames stay reflected); fall back to the
    // legacy free-text column for rows written before roles existed.
    role: r.roles?.title ?? r.role,
    candidateName: r.candidate_name,
    candidateEmail: r.candidate_email,
    status: r.status,
    dueDate: r.due_date,
    matchScore: r.match_score,
    createdAt: r.created_at,
  };
}

export async function listAssessments(companyId: string): Promise<Assessment[]> {
  const c = db();
  if (!c) return [];
  const { data } = await c
    .from("assessments")
    .select("*, game_templates(name), roles(title, status)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  return (data ?? []).map(toAssessment);
}

export async function getAssessment(companyId: string, id: string): Promise<Assessment | null> {
  const c = db();
  if (!c) return null;
  const { data } = await c
    .from("assessments")
    .select("*, game_templates(name), roles(title, status)")
    .eq("company_id", companyId)
    .eq("id", id)
    .single();
  return data ? toAssessment(data) : null;
}

export async function createAssessment(input: {
  companyId: string;
  templateId: string;
  candidateName: string;
  candidateEmail: string;
  roleId: string;
  roleTitle: string;
  dueDate: string | null;
}): Promise<void> {
  const c = db();
  if (!c) throw new Error("Supabase not configured");
  const { error } = await c.from("assessments").insert({
    company_id: input.companyId,
    template_id: input.templateId,
    candidate_name: input.candidateName,
    candidate_email: input.candidateEmail,
    role_id: input.roleId,
    // Denormalized copy of the role's title at invite time, so
    // candidate/frontend's display (which reads this column directly) keeps
    // working even if the role is later renamed or closed.
    role: input.roleTitle,
    due_date: input.dueDate,
  });
  if (error) throw error;
}

function toSession(r: any): AssessmentSession {
  return {
    id: r.id,
    assessmentId: r.assessment_id,
    status: r.status,
    progressPct: r.progress_pct ?? 0,
    durationMin: r.duration_min ?? 60,
    elapsedMin: r.elapsed_min ?? 0,
    startedAt: r.started_at,
  };
}

// Read-only from this portal — the candidate app is the one writing these.
export async function listSessionsForCompany(companyId: string): Promise<AssessmentSession[]> {
  const c = db();
  if (!c) return [];
  const { data } = await c
    .from("sessions")
    .select("*")
    .eq("company_id", companyId)
    .order("started_at", { ascending: false });
  return (data ?? []).map(toSession);
}

function toReportSummary(r: any): ReportSummary {
  // assessment_reports is a reverse (child) relation off sessions — PostgREST
  // returns it as an object when it infers one-to-one (the unique session_id
  // FK makes it so), but as a one-element array in some embed shapes. Same
  // normalization candidate/frontend's notifications/actions.ts uses.
  const report = Array.isArray(r.assessment_reports) ? r.assessment_reports[0] : r.assessment_reports;
  return {
    assessmentId: r.assessment_id,
    candidateName: r.assessments?.candidate_name ?? null,
    candidateEmail: r.assessments?.candidate_email ?? "",
    role: r.assessments?.roles?.title ?? r.assessments?.role ?? null,
    reportStatus: report?.status ?? null,
    recommendation: report?.recommendation ?? null,
    updatedAt: report?.updated_at ?? null,
  };
}

// One row per candidate with a session — the company-wide Reports list.
// Sessions are read-only here (the candidate app writes them), same as
// listSessionsForCompany; a candidate can restart, so only the latest
// session per assessment is kept.
export async function listReportsForCompany(companyId: string): Promise<ReportSummary[]> {
  const c = db();
  if (!c) return [];
  const { data } = await c
    .from("sessions")
    .select(
      "assessment_id, started_at, assessment_reports(status, recommendation, updated_at), assessments(candidate_name, candidate_email, role, roles(title))"
    )
    .eq("company_id", companyId)
    .not("assessment_id", "is", null)
    .order("started_at", { ascending: false });
  const seen = new Set<string>();
  const latestPerAssessment = (data ?? []).filter((r: any) => {
    if (seen.has(r.assessment_id)) return false;
    seen.add(r.assessment_id);
    return true;
  });
  return latestPerAssessment.map(toReportSummary);
}

function toReport(r: any): AssessmentReport {
  return {
    id: r.id,
    status: r.status,
    recommendation: r.recommendation,
    summary: r.summary,
    error: r.error,
    evidence: (r.evidence_items ?? []).map((e: any) => ({ category: e.category, observation: e.observation })),
    updatedAt: r.updated_at,
  };
}

// Tenant-scoped: only returns a report if its session belongs to this
// company's assessment. Null means no session has started yet, not that the
// report failed to load — the caller distinguishes those honestly.
export async function getReportForAssessment(companyId: string, assessmentId: string): Promise<AssessmentReport | null> {
  const c = db();
  if (!c) return null;
  const { data: session } = await c
    .from("sessions")
    .select("id")
    .eq("company_id", companyId)
    .eq("assessment_id", assessmentId)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!session) return null;
  const { data } = await c
    .from("assessment_reports")
    .select("*, evidence_items(category, observation, created_at)")
    .eq("session_id", session.id)
    .order("created_at", { referencedTable: "evidence_items", ascending: true })
    .maybeSingle();
  return data ? toReport(data) : null;
}

export async function updateCompanyTeam(companyId: string, team: TeamMember[]): Promise<void> {
  const c = db();
  if (!c) throw new Error("Supabase not configured");
  const { error } = await c.from("companies").update({ team }).eq("id", companyId);
  if (error) throw error;
}

export async function updateCompanyProfile(
  companyId: string,
  input: { name: string; website: string | null }
): Promise<void> {
  const c = db();
  if (!c) throw new Error("Supabase not configured");
  const { error } = await c
    .from("companies")
    .update({ name: input.name, website: input.website })
    .eq("id", companyId);
  if (error) throw error;
}

// Provision a real per-teammate login, mirroring internal-admin's
// createCompanyAccount (internal-admin/frontend/lib/db.ts) — same temp-
// password + app_metadata pattern, same non-transactional caveat (if the
// auth call fails after this returns, the caller hasn't touched the roster
// yet, so there's nothing to roll back). company_id/role live in
// app_metadata, never user_metadata, so the teammate can't repoint their own
// company via the client SDK.
export async function createTeammateAccount(
  companyId: string,
  email: string,
  role: TeamMember["role"],
  tempPassword: string
): Promise<string> {
  const c = db();
  if (!c) throw new Error("Supabase not configured");
  const { data, error } = await c.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    app_metadata: { company_id: companyId, role },
  });
  if (error) throw error;
  return data.user.id;
}

// Best-effort: an entry written before authUserId existed (e.g. the founding
// admin, created by internal-admin's onboardCompany) has no known auth user
// here, so there's nothing to delete — the caller still removes it from the
// roster.
export async function deleteTeammateAccount(authUserId: string): Promise<void> {
  const c = db();
  if (!c) throw new Error("Supabase not configured");
  const { error } = await c.auth.admin.deleteUser(authUserId);
  if (error) throw error;
}
