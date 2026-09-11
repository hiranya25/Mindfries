import { redirect } from "next/navigation";
import { PageHeader, Pill, StatCard } from "@/components/ui";
import { companyTone, planLabel } from "@/lib/format";
import { getCurrentSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  const { company } = session;

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Company" title="Settings">
        Your workspace details.
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Plan" value={planLabel[company.plan]} />
        <StatCard label="Status" value={<Pill tone={companyTone[company.status]}>{company.status}</Pill>} />
        <StatCard label="Seats" value={company.seats} />
        <StatCard label="Team size" value={company.team.length} />
      </div>

      <div className="hair-card p-5">
        <h2 className="mb-4 text-lg font-extrabold tracking-tight">Company profile</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs font-semibold text-dim">Name</dt>
            <dd className="mt-1">{company.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-dim">Website</dt>
            <dd className="mt-1">{company.website ?? "—"}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-faint">
          Plan is shown for reference only — no billing or plan-gating logic is wired up yet.
        </p>
      </div>
    </div>
  );
}
