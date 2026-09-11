import "server-only";
import { createClient } from "./supabase/server";
import { db } from "./supabaseAdmin";
import type { Company, MemberRole } from "./types";

function toCompany(r: Record<string, unknown>): Company {
  return {
    id: r.id as string,
    name: r.name as string,
    website: (r.website as string | null) ?? null,
    plan: r.plan as Company["plan"],
    status: r.status as Company["status"],
    seats: (r.seats as number) ?? 0,
    team: (r.team as Company["team"]) ?? [],
    defaultTemplateIds: (r.default_template_ids as string[]) ?? [],
    createdAt: r.created_at as string,
  };
}

export interface CurrentSession {
  company: Company;
  email: string;
  role: MemberRole;
}

// Resolves the signed-in Supabase Auth user to their company account.
// `company_id`/`role` live in `app_metadata` (server-settable only — see
// the note on onboardCompany in internal-admin/frontend/app/admin/actions.ts)
// so a signed-in user can't tamper with which company they're scoped to by
// calling auth.updateUser() themselves (that only touches user_metadata).
export async function getCurrentSession(): Promise<CurrentSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const companyId = user.app_metadata?.company_id as string | undefined;
  if (!companyId) return null;

  const admin = db();
  if (!admin) return null;

  const { data } = await admin.from("companies").select("*").eq("id", companyId).single();
  if (!data) return null;

  return {
    company: toCompany(data),
    email: user.email ?? "",
    role: (user.app_metadata?.role as MemberRole) ?? "admin",
  };
}
