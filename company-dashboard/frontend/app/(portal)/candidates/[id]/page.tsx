import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader, Pill, StatCard } from "@/components/ui";
import { fmtDate, assessmentStatusLabel, assessmentStatusTone, sessionTone } from "@/lib/format";
import { getAssessment, listSessionsForCompany } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const assessment = await getAssessment(session.company.id, id);
  if (!assessment) notFound();

  // sessions.assessment_id is a real FK — a candidate can have more than one
  // run (e.g. a retry), so this filters to all of them, not just one.
  const sessions = (await listSessionsForCompany(session.company.id)).filter(
    (s) => s.assessmentId === assessment.id,
  );

  return (
    <div className="space-y-8">
      <div className="text-xs">
        <Link href="/candidates" className="font-semibold text-dim hover:text-accent">
          ← All candidates
        </Link>
      </div>

      <PageHeader eyebrow={assessment.role ?? "Role not set"} title={assessment.candidateName ?? assessment.candidateEmail}>
        {assessment.candidateEmail}
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Status" value={<Pill tone={assessmentStatusTone[assessment.status]}>{assessmentStatusLabel[assessment.status]}</Pill>} />
        <StatCard label="Template" value={assessment.templateName ?? "—"} />
        <StatCard label="Due" value={assessment.dueDate ? fmtDate(assessment.dueDate) : "—"} />
        <StatCard label="Match score" value={assessment.matchScore ?? "—"} />
      </div>

      <div className="hair-card p-5">
        <h2 className="mb-4 text-lg font-extrabold tracking-tight">Session history</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-dim">No session runs recorded yet.</p>
        ) : (
          <ul className="divide-y divide-hair">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-semibold">{fmtDate(s.startedAt)}</div>
                  <div className="text-xs text-faint">
                    {s.elapsedMin}/{s.durationMin} min · {s.progressPct}% progress
                  </div>
                </div>
                <Pill tone={sessionTone[s.status]}>{s.status}</Pill>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="hair-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold tracking-tight">Evidence summary</h2>
          <Link href="/reports" className="text-sm font-semibold text-accent hover:underline">
            Reports →
          </Link>
        </div>
        <p className="mt-2 text-sm text-dim">
          Not available yet — evidence capture and the evaluation pipeline aren&apos;t built. See Reports for why.
        </p>
      </div>
    </div>
  );
}
