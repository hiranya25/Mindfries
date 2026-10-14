import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader, Pill } from "@/components/ui";
import { evidenceCategoryLabel, recommendationLabel, recommendationTone } from "@/lib/format";
import { getAssessment, getReportForAssessment } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const STATUS_COPY: Record<"pending" | "generating", { title: string; body: string }> = {
  pending: {
    title: "Waiting to start",
    body: "The candidate submitted their session, but evaluation hasn't started running yet. This page will show results once it's ready.",
  },
  generating: {
    title: "Generating this report",
    body: "The Code Evaluation, Reasoning and Workflow agents are reading the session now. This usually takes under a minute.",
  },
};

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const assessment = await getAssessment(session.company.id, id);
  if (!assessment) notFound();

  const report = await getReportForAssessment(session.company.id, id);

  return (
    <div className="space-y-8">
      <div className="text-xs">
        <Link href="/reports" className="font-semibold text-dim hover:text-accent">
          ← All reports
        </Link>
      </div>

      <PageHeader eyebrow={assessment.role ?? "Role not set"} title={assessment.candidateName ?? assessment.candidateEmail}>
        {assessment.candidateEmail}
      </PageHeader>

      {!report && (
        <div className="hair-card p-10 text-center">
          <h2 className="text-lg font-extrabold tracking-tight">No session yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-dim">
            This candidate hasn&apos;t started a workspace session, so there&apos;s no report to show.
          </p>
        </div>
      )}

      {report && report.status !== "ready" && (
        <div className="hair-card p-6">
          <h2 className="text-lg font-extrabold tracking-tight">
            {report.status === "failed" ? "Evaluation didn't complete" : STATUS_COPY[report.status].title}
          </h2>
          <p className="mt-2 text-sm text-dim">
            {report.status === "failed" ? report.error ?? "No reason was recorded." : STATUS_COPY[report.status].body}
          </p>
          {report.status === "failed" && (
            <p className="mt-3 text-xs text-faint">
              This is an honest failure, not a fabricated score — nothing here was scored because evaluation couldn&apos;t
              run.
            </p>
          )}
        </div>
      )}

      {report && report.status === "ready" && (
        <div className="space-y-4">
          <div className="hair-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-extrabold tracking-tight">Recommendation</h2>
              {report.recommendation ? (
                <Pill tone={recommendationTone[report.recommendation] ?? "gray"}>
                  {recommendationLabel[report.recommendation] ?? report.recommendation}
                </Pill>
              ) : (
                <Pill>Not given</Pill>
              )}
            </div>
            {report.summary && <p className="mt-3 text-sm leading-relaxed text-dim">{report.summary}</p>}
          </div>

          {report.evidence.length > 0 ? (
            <div className="space-y-3">
              <h2 className="eyebrow">Evidence, by agent</h2>
              {report.evidence.map((item, i) => (
                <div key={i} className="hair-card p-5">
                  <p className="eyebrow">{evidenceCategoryLabel[item.category] ?? item.category}</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">
                    {item.observation.replace(/ ?\[E\d+\]/g, "")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="hair-card p-6 text-sm text-dim">No individual observations were recorded for this session.</div>
          )}
        </div>
      )}
    </div>
  );
}
