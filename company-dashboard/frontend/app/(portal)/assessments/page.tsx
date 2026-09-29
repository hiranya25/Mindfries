import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { listAssessments, listPublishedTemplates, listRoles } from "@/lib/db";
import { canInviteCandidate } from "@/lib/permissions";
import { getCurrentSession } from "@/lib/session";
import { AssessmentsView, type TemplateCounts } from "@/components/AssessmentsView";

export const dynamic = "force-dynamic";

export default async function AssessmentsPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const [templates, assessments, roles] = await Promise.all([
    listPublishedTemplates(),
    listAssessments(session.company.id),
    listRoles(session.company.id),
  ]);

  const counts: Record<string, TemplateCounts> = {};
  for (const t of templates) {
    counts[t.id] = { inProgress: 0, readyForReview: 0, completed: 0, total: 0 };
  }
  for (const a of assessments) {
    if (!a.templateId || !counts[a.templateId]) continue;
    counts[a.templateId].total += 1;
    if (a.status === "in_progress") counts[a.templateId].inProgress += 1;
    if (a.status === "submitted") counts[a.templateId].readyForReview += 1;
    if (a.status === "closed") counts[a.templateId].completed += 1;
  }

  return (
    <div className="space-y-8">
      <PageHeader eyebrow={session.company.name} title="Assessments">
        The assessment library, authored by the Mindfries team — pick one when inviting a candidate.
      </PageHeader>

      <AssessmentsView
        templates={templates}
        counts={counts}
        roles={roles.filter((r) => r.status === "open")}
        canInvite={canInviteCandidate(session.role)}
      />
    </div>
  );
}
