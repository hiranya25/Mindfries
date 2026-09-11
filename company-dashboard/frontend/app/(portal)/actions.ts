"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import {
  createAssessment,
  createTeammateAccount,
  deleteTeammateAccount,
  updateCompanyProfile,
  updateCompanyTeam,
} from "@/lib/db";
import { mailerReady, sendMail } from "@/lib/mailer";
import { canEditSettings, canInviteCandidate, canManageTeam } from "@/lib/permissions";
import { getCurrentSession } from "@/lib/session";
import { isValidEmail, isValidFreeText } from "@/lib/validate";
import type { MemberRole } from "@/lib/types";

type Result = { ok: true; warning?: string } | { ok: false; error: string };
const fail = (e: unknown): Result => {
  const message = e instanceof Error ? e.message : String(e);
  console.error("[company-dashboard action]", message);
  return { ok: false, error: message };
};

// Best-effort: the DB write this follows already succeeded, and there's
// nothing sensible to roll back if the email provider is down or unconfigured
// — the invite still exists, it just needs to be shared out-of-band.
async function tryNotify(opts: { to: string; subject: string; text: string }): Promise<string | undefined> {
  if (!mailerReady()) return "Email isn't configured yet — share this invite with them directly.";
  try {
    await sendMail(opts);
    return undefined;
  } catch (e) {
    console.error("[company-dashboard mailer]", e instanceof Error ? e.message : e);
    return "Invite saved, but the notification email failed to send — share it with them directly.";
  }
}

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
    if (!canInviteCandidate(session.role)) throw new Error("You don't have permission to invite candidates");
    if (!isValidEmail(input.candidateEmail)) throw new Error("Enter a valid candidate email");
    if (!input.templateId) throw new Error("Pick an assessment template");
    if (input.candidateName && !isValidFreeText(input.candidateName)) throw new Error("Candidate name is too long");
    if (input.role && !isValidFreeText(input.role)) throw new Error("Role is too long");

    await createAssessment({ companyId: session.company.id, ...input });
    revalidatePath("/candidates");
    revalidatePath("/");

    const candidateAppUrl = process.env.NEXT_PUBLIC_CANDIDATE_APP_URL;
    const warning = await tryNotify({
      to: input.candidateEmail,
      subject: `${session.company.name} invited you to an assessment`,
      text: [
        `${session.company.name} invited you to complete an assessment${input.role ? ` for the ${input.role} role` : ""}.`,
        candidateAppUrl
          ? `Get started here: ${candidateAppUrl}`
          : "Ask them how to get started — a direct link isn't set up yet.",
      ].join("\n\n"),
    });
    return warning ? { ok: true, warning } : { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function inviteTeammate(input: { email: string; role: MemberRole }): Promise<Result> {
  try {
    const session = await getCurrentSession();
    if (!session) throw new Error("Not signed in");
    if (!canManageTeam(session.role)) throw new Error("You don't have permission to manage the team");
    const email = input.email.trim();
    if (!isValidEmail(email)) throw new Error("Enter a valid email");
    if (session.company.team.some((m) => m.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("That person is already on the team");
    }

    const tempPassword = randomBytes(9).toString("base64url"); // ~12 chars, emailed once, never stored
    const authUserId = await createTeammateAccount(session.company.id, email, input.role, tempPassword);

    const team = [...session.company.team, { email, role: input.role, authUserId }];
    await updateCompanyTeam(session.company.id, team);
    revalidatePath("/team");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const warning = await tryNotify({
      to: email,
      subject: `You've been added to ${session.company.name}'s Mindfries workspace`,
      text: [
        `${session.email} added you to ${session.company.name}'s Mindfries workspace as ${input.role.replace("_", " ")}.`,
        `Sign in${appUrl ? ` at ${appUrl}` : ""} with:`,
        `  Email:    ${email}`,
        `  Password: ${tempPassword}`,
        "You can change your password from the sign-in page's \"Forgot password?\" link.",
      ].join("\n"),
    });
    return warning ? { ok: true, warning } : { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function removeTeamMember(email: string): Promise<Result> {
  try {
    const session = await getCurrentSession();
    if (!session) throw new Error("Not signed in");
    if (!canManageTeam(session.role)) throw new Error("You don't have permission to manage the team");
    if (email.toLowerCase() === session.email.toLowerCase()) {
      throw new Error("You can't remove yourself");
    }

    const target = session.company.team.find((m) => m.email === email);
    if (!target) throw new Error("That person isn't on the team");

    const remainingAdmins = session.company.team.filter(
      (m) => m.role === "admin" && m.email !== email
    ).length;
    if (target.role === "admin" && remainingAdmins === 0) {
      throw new Error("Can't remove the last admin");
    }

    // Entries created before authUserId existed (e.g. the founding admin,
    // provisioned by internal-admin's onboardCompany) have no known auth
    // user here — nothing to delete, just drop the roster entry.
    if (target.authUserId) {
      await deleteTeammateAccount(target.authUserId);
    }

    const team = session.company.team.filter((m) => m.email !== email);
    await updateCompanyTeam(session.company.id, team);
    revalidatePath("/team");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function updateSettings(input: { name: string; website: string }): Promise<Result> {
  try {
    const session = await getCurrentSession();
    if (!session) throw new Error("Not signed in");
    if (!canEditSettings(session.role)) throw new Error("You don't have permission to edit settings");
    if (!isValidFreeText(input.name)) throw new Error("Company name is required");
    const website = input.website.trim() || null;

    await updateCompanyProfile(session.company.id, { name: input.name.trim(), website });
    revalidatePath("/settings");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
