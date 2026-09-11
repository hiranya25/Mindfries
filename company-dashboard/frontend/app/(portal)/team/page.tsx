import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { canManageTeam } from "@/lib/permissions";
import { getCurrentSession } from "@/lib/session";
import { TeamRoster } from "@/components/TeamRoster";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  return (
    <div className="space-y-8">
      <PageHeader eyebrow={session.company.name} title="Team">
        Who on your side can see candidates and review results.
      </PageHeader>
      <TeamRoster
        team={session.company.team}
        canManage={canManageTeam(session.role)}
        currentEmail={session.email}
      />
    </div>
  );
}
