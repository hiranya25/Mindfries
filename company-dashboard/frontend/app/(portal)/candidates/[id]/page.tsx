import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader, Pill, StatCard } from "@/components/ui";
import {
  fmtDate,
  assessmentStatusLabel,
  assessmentStatusTone,
  recommendationLabel,
  recommendationTone,
  reportStatusLabel,
  reportStatusTone,
  sessionTone,
} from "@/lib/format";
import { getAssessment, getReportForAssessment, listSessionsForCompany } from "@/lib/db";
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
  const [sessions, report] = await Promise.all([
    listSessionsForCompany(session.company.id).then((all) => all.filter((s) => s.assessmentId === assessment.id)),
    getReportForAssessment(session.company.id, assessment.id),
  ]);

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
          <Link href={`/reports/${assessment.id}`} className="text-sm font-semibold text-accent hover:underline">
            Full report →
          </Link>
        </div>
        {report ? (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <Pill tone={reportStatusTone[report.status]}>{reportStatusLabel[report.status]}</Pill>
            {report.recommendation && (
              <Pill tone={recommendationTone[report.recommendation] ?? "gray"}>
                {recommendationLabel[report.recommendation] ?? report.recommendation}
              </Pill>
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm text-dim">No session yet — nothing to evaluate.</p>
        )}
      </div>
    </div>
  );
}
