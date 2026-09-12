"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/login/actions";

const nav = [
  { href: "/", label: "Overview", icon: "◆" },
  { href: "/roles", label: "Roles", icon: "▧" },
  { href: "/candidates", label: "Candidates", icon: "▦" },
  { href: "/team", label: "Team", icon: "◈" },
  { href: "/reports", label: "Reports", icon: "◉" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export function Sidebar({ companyName, email }: { companyName: string; email: string }) {
  const path = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-hair bg-surface">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="tile tile-violet h-9 w-9 text-lg font-black">M</div>
        <div className="min-w-0">
          <div className="truncate text-sm font-extrabold leading-none tracking-tight">{companyName}</div>
          <div className="eyebrow mt-1">Company Portal</div>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {nav.map((n) => {
          const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                active ? "bg-accent-soft text-accent" : "text-dim hover:bg-black/[0.04] hover:text-ink"
              }`}
            >
              <span className="w-4 text-center opacity-80">{n.icon}</span>
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-hair p-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-accent-soft text-xs font-bold text-accent">
            {email.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{email}</div>
          </div>
          <form action={signOut}>
            <button type="submit" title="Sign out" className="rounded-lg px-2 py-1 text-dim hover:bg-black/5">
              ⎋
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
