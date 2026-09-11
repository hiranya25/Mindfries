"use server";

import { revalidatePath } from "next/cache";
import { createAssessment, updateCompanyTeam } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import type { MemberRole } from "@/lib/types";

type Result = { ok: true } | { ok: false; error: string };
const fail = (e: unknown): Result => ({ ok: false, error: e instanceof Error ? e.message : String(e) });

export async function inviteCandidate(input: {
  templateId: string;
  candidateName: string;
  candidateEmail: string;
  role: string;
  dueDate: string | null;
}): Promise<Result> {
  try {
    const session = await getCurrentSession();
    if (!session) throw new Error("Not signed in");
    if (!input.candidateEmail.trim()) throw new Error("Candidate email is required");
    if (!input.templateId) throw new Error("Pick an assessment template");
    await createAssessment({ companyId: session.company.id, ...input });
    revalidatePath("/candidates");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function addTeamMember(input: { email: string; role: MemberRole }): Promise<Result> {
  try {
    const session = await getCurrentSession();
    if (!session) throw new Error("Not signed in");
    if (!input.email.trim()) throw new Error("Email is required");
    if (session.company.team.some((m) => m.email.toLowerCase() === input.email.trim().toLowerCase())) {
      throw new Error("That person is already on the team");
    }
    const team = [...session.company.team, { email: input.email.trim(), role: input.role }];
    await updateCompanyTeam(session.company.id, team);
    revalidatePath("/team");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function removeTeamMember(email: string): Promise<Result> {
  try {
    const session = await getCurrentSession();
    if (!session) throw new Error("Not signed in");
    const team = session.company.team.filter((m) => m.email !== email);
    await updateCompanyTeam(session.company.id, team);
    revalidatePath("/team");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
