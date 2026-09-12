import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { listAssessments, listPublishedTemplates, listRoles } from "@/lib/db";
import { canInviteCandidate } from "@/lib/permissions";
import { getCurrentSession } from "@/lib/session";
import { InviteCandidateForm } from "@/components/InviteCandidateForm";
import { CandidatesByRole } from "@/components/CandidatesByRole";

export const dynamic = "force-dynamic";

export default async function CandidatesPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const [assessments, templates, roles] = await Promise.all([
    listAssessments(session.company.id),
    listPublishedTemplates(),
    listRoles(session.company.id),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Roles & candidates"
        title="Candidates"
        action={
          <InviteCandidateForm
            templates={templates}
            roles={roles.filter((r) => r.status === "open")}
            canInvite={canInviteCandidate(session.role)}
          />
        }
      >
        Grouped by role — invite a candidate to run a published assessment against an open role.
      </PageHeader>

      <CandidatesByRole assessments={assessments} roles={roles} />
    </div>
  );
}
