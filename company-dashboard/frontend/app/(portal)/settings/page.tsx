import { redirect } from "next/navigation";
import { PageHeader, Pill, StatCard } from "@/components/ui";
import { companyTone, planLabel } from "@/lib/format";
import { canEditSettings } from "@/lib/permissions";
import { getCurrentSession } from "@/lib/session";
import { SettingsForm } from "@/components/SettingsForm";

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

      <SettingsForm name={company.name} website={company.website} canEdit={canEditSettings(session.role)} />
    </div>
  );
}
