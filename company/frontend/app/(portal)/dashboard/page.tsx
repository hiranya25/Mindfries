import { currentCompanyUser } from "@/lib/auth/company-users";
import { listApplicationsForCompany, listJobRoles, type CandidateApplicationWithRole } from "@/lib/db";
import { supabaseReady } from "@/lib/supabase";
import { EmptyState, LinkButton, PageHeader, StatCard } from "@/components/ui";
import type { JobRole } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Overview — the four stat cards from PRD §1.4's Overview section (O1–O4); Recent Activity (O5) is still outstanding. */
export default async function OverviewPage() {
  const user = await currentCompanyUser();
  let roles: JobRole[] = [];
  let applications: CandidateApplicationWithRole[] = [];
  if (supabaseReady() && user) {
    [roles, applications] = await Promise.all([listJobRoles(user.companyId), listApplicationsForCompany(user.companyId)]);
  }

  const openRoles = roles.filter((r) => r.status === "open");
  const inProgress = applications.filter((a) => a.stage === "invited" || a.stage === "in_progress");
  const completed = applications.filter((a) => a.stage !== "invited" && a.stage !== "in_progress");
  const readyForReview = applications.filter((a) => a.stage === "completed");

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={user?.companyName || "Company Portal"} title="Overview">
        Active roles, candidates in your pipeline, and what needs your review.
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Roles" value={openRoles.length} />
        <StatCard label="Candidates in Progress" value={inProgress.length} />
        <StatCard label="Completed Assessments" value={completed.length} />
        <StatCard label="Ready for Review" value={readyForReview.length} hint="Completed but not yet shortlisted or rejected" />
      </div>

      {roles.length === 0 && (
        <EmptyState
          title="No roles yet"
          hint="Create your first role to start building a pipeline."
          action={<LinkButton href="/roles/new" size="sm">New role</LinkButton>}
        />
      )}
    </div>
  );
}
