import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { listAssessments, listPublishedTemplates } from "@/lib/db";
import { canInviteCandidate } from "@/lib/permissions";
import { getCurrentSession } from "@/lib/session";
import { InviteCandidateForm } from "@/components/InviteCandidateForm";
import { CandidatesTable } from "@/components/CandidatesTable";

export const dynamic = "force-dynamic";

export default async function CandidatesPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const [assessments, templates] = await Promise.all([
    listAssessments(session.company.id),
    listPublishedTemplates(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Roles & candidates"
        title="Candidates"
        action={<InviteCandidateForm templates={templates} canInvite={canInviteCandidate(session.role)} />}
      >
        Invite a candidate to run a published assessment for a role. This is where &ldquo;create a role&rdquo; and &ldquo;invite a
        candidate&rdquo; happen in one step.
      </PageHeader>

      <CandidatesTable assessments={assessments} />
    </div>
  );
}
