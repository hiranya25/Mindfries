import "server-only";
import { db } from "./supabaseAdmin";
import type {
  Assessment,
  AssessmentSession,
  Company,
  GameTemplate,
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

function toAssessment(r: any): Assessment {
  return {
    id: r.id,
    companyId: r.company_id,
    templateId: r.template_id,
    templateName: r.game_templates?.name ?? null,
    candidateName: r.candidate_name,
    candidateEmail: r.candidate_email,
    role: r.role,
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
    .select("*, game_templates(name)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  return (data ?? []).map(toAssessment);
}

export async function getAssessment(companyId: string, id: string): Promise<Assessment | null> {
  const c = db();
  if (!c) return null;
  const { data } = await c
    .from("assessments")
    .select("*, game_templates(name)")
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
  role: string;
  dueDate: string | null;
}): Promise<void> {
  const c = db();
  if (!c) throw new Error("Supabase not configured");
  const { error } = await c.from("assessments").insert({
    company_id: input.companyId,
    template_id: input.templateId,
    candidate_name: input.candidateName,
    candidate_email: input.candidateEmail,
    role: input.role,
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

export async function updateCompanyTeam(companyId: string, team: TeamMember[]): Promise<void> {
  const c = db();
  if (!c) throw new Error("Supabase not configured");
  const { error } = await c.from("companies").update({ team }).eq("id", companyId);
  if (error) throw error;
}
