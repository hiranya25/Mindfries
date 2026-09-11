import { redirect } from "next/navigation";
import Link from "next/link";
import { PageHeader, Pill, StatCard } from "@/components/ui";
import { fmtDate } from "@/lib/format";
import { assessmentStatusTone, assessmentStatusLabel } from "@/lib/format";
import { listAssessments } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const assessments = await listAssessments(session.company.id);
  const inProgress = assessments.filter((a) => a.status === "in_progress").length;
  const readyForReview = assessments.filter((a) => a.status === "submitted").length;
  const closed = assessments.filter((a) => a.status === "closed").length;
  const recent = assessments.slice(0, 6);

  return (
    <div className="space-y-8">
      <PageHeader eyebrow={session.company.name} title="Overview">
        Every candidate you&apos;ve invited, at a glance.
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Active candidates" value={assessments.length - closed} />
        <StatCard label="In progress" value={inProgress} />
        <StatCard label="Ready for review" value={readyForReview} />
        <StatCard label="Completed" value={closed} />
      </div>

      <div className="hair-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold tracking-tight">Recent activity</h2>
          <Link href="/candidates" className="text-sm font-semibold text-accent hover:underline">
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-dim">
            No candidates invited yet. Head to{" "}
            <Link href="/candidates" className="text-accent hover:underline">
              Candidates
            </Link>{" "}
            to invite your first one.
          </p>
        ) : (
          <ul className="divide-y divide-hair">
            {recent.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-semibold">{a.candidateName ?? a.candidateEmail}</div>
                  <div className="text-xs text-faint">
                    {a.role ?? "Role not set"} · {a.templateName ?? "—"} · {fmtDate(a.createdAt)}
                  </div>
                </div>
                <Pill tone={assessmentStatusTone[a.status]}>{assessmentStatusLabel[a.status]}</Pill>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
