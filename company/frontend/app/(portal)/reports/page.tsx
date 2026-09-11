import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { getCurrentSession } from "@/lib/session";

export const dynamic = "force-dynamic";

// Deliberately a stub, not a fake report. Evidence capture (PRD §1.7 — code
// changes, terminal commands, tests, debugging, AI usage) and the evaluation
// pipeline that turns it into a report are both unbuilt (see task.md). This
// page says so honestly instead of inventing report data, per this repo's
// "real, or an honest failure" principle.
export default async function ReportsPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  return (
    <div className="space-y-8">
      <PageHeader eyebrow={session.company.name} title="Reports">
        Per-candidate evidence and evaluation.
      </PageHeader>

      <div className="hair-card p-10 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-accent-soft text-accent">◉</div>
        <h2 className="text-lg font-extrabold tracking-tight">Not available yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-dim">
          Reports depend on two things that don&apos;t exist yet: evidence telemetry in the candidate workspace
          (navigation, code changes, commands, tests, AI usage) and the evaluation pipeline that turns that evidence
          into a summary. Until those are built, this page won&apos;t show fabricated evidence — candidate status and
          session progress are visible on each candidate&apos;s page in the meantime.
        </p>
      </div>
    </div>
  );
}
