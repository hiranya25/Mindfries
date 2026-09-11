import { redirect } from "next/navigation";
import Link from "next/link";
import { PageHeader, Pill } from "@/components/ui";
import { fmtDate, assessmentStatusLabel, assessmentStatusTone } from "@/lib/format";
import { listAssessments, listPublishedTemplates } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { InviteCandidateForm } from "@/components/InviteCandidateForm";

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
        action={<InviteCandidateForm templates={templates} />}
      >
        Invite a candidate to run a published assessment for a role. This is where "create a role" and "invite a
        candidate" happen in one step.
      </PageHeader>

      <div className="hair-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hair text-left text-xs uppercase tracking-wide text-faint">
                <th className="px-5 py-3 font-semibold">Candidate</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Template</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Due</th>
                <th className="px-5 py-3 font-semibold">Invited</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hair">
              {assessments.length === 0 && (
                <tr>
                  <td className="px-5 py-12 text-center text-sm text-dim" colSpan={6}>
                    No candidates invited yet.
                  </td>
                </tr>
              )}
              {assessments.map((a) => (
                <tr key={a.id} className="hover:bg-black/[0.015]">
                  <td className="px-5 py-4">
                    <Link href={`/candidates/${a.id}`} className="font-semibold hover:text-accent">
                      {a.candidateName ?? a.candidateEmail}
                    </Link>
                    <div className="text-xs text-faint">{a.candidateEmail}</div>
                  </td>
                  <td className="px-5 py-4 text-dim">{a.role ?? "—"}</td>
                  <td className="px-5 py-4 text-dim">{a.templateName ?? "—"}</td>
                  <td className="px-5 py-4">
                    <Pill tone={assessmentStatusTone[a.status]}>{assessmentStatusLabel[a.status]}</Pill>
                  </td>
                  <td className="px-5 py-4 text-dim">{a.dueDate ? fmtDate(a.dueDate) : "—"}</td>
                  <td className="px-5 py-4 text-dim">{fmtDate(a.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
