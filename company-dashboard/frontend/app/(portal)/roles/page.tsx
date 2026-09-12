import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { listAssessments, listRoles } from "@/lib/db";
import { canManageRoles } from "@/lib/permissions";
import { getCurrentSession } from "@/lib/session";
import { RolesView, type RoleCounts } from "@/components/RolesView";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const [roles, assessments] = await Promise.all([
    listRoles(session.company.id),
    listAssessments(session.company.id),
  ]);

  const counts: Record<string, RoleCounts> = {};
  for (const role of roles) {
    counts[role.id] = { inProgress: 0, readyForReview: 0, completed: 0, total: 0 };
  }
  for (const a of assessments) {
    if (!a.roleId || !counts[a.roleId]) continue;
    counts[a.roleId].total += 1;
    if (a.status === "in_progress") counts[a.roleId].inProgress += 1;
    if (a.status === "submitted") counts[a.roleId].readyForReview += 1;
    if (a.status === "closed") counts[a.roleId].completed += 1;
  }

  return (
    <div className="space-y-8">
      <PageHeader eyebrow={session.company.name} title="Roles">
        What you&apos;re hiring for right now — create a role, then invite candidates against it.
      </PageHeader>

      <RolesView roles={roles} counts={counts} canManage={canManageRoles(session.role)} />
    </div>
  );
}
