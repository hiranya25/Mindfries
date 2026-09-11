import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { getCurrentSession } from "@/lib/session";

// proxy.ts already redirects unauthenticated requests to /login; this is a
// second, server-rendered check so a page never briefly flashes without a
// resolvable company (e.g. a user whose app_metadata.company_id is missing
// or stale).
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen">
      <Sidebar companyName={session.company.name} email={session.email} />
      <main className="pl-64">
        <div className="mx-auto max-w-6xl px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
