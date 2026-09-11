"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Input, Modal, Pill, Select } from "@/components/ui";
import { addTeamMember, removeTeamMember } from "@/app/(portal)/actions";
import type { MemberRole, TeamMember } from "@/lib/types";

const roleTone: Record<MemberRole, "violet" | "gray"> = {
  admin: "violet",
  hiring_manager: "gray",
  reviewer: "gray",
};
const roleLabel: Record<MemberRole, string> = {
  admin: "Admin",
  hiring_manager: "Hiring manager",
  reviewer: "Reviewer",
};

export function TeamRoster({ team }: { team: TeamMember[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("reviewer");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError(null);
    const res = await addTeamMember({ email, role });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setEmail("");
    setRole("reviewer");
    setOpen(false);
    router.refresh();
  }

  async function remove(memberEmail: string) {
    await removeTeamMember(memberEmail);
    router.refresh();
  }

  return (
    <>
      <div className="hair-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-hair px-5 py-4">
          <h2 className="text-lg font-extrabold tracking-tight">Team</h2>
          <Button onClick={() => setOpen(true)}>+ Invite teammate</Button>
        </div>
        <ul className="divide-y divide-hair">
          {team.map((m) => (
            <li key={m.email} className="flex items-center justify-between px-5 py-4">
              <div>
                <div className="text-sm font-semibold">{m.email}</div>
              </div>
              <div className="flex items-center gap-3">
                <Pill tone={roleTone[m.role]}>{roleLabel[m.role]}</Pill>
                {m.role !== "admin" && (
                  <button
                    onClick={() => remove(m.email)}
                    className="text-xs font-semibold text-dim hover:text-[#f4502f]"
                  >
                    Remove
                  </button>
                )}
              </div>
            </li>
          ))}
          {team.length === 0 && <li className="px-5 py-8 text-center text-sm text-dim">No team members yet.</li>}
        </ul>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Invite teammate"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={loading || !email.trim()}>
              {loading ? "Adding…" : "Add to team"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@company.com" />
          </Field>
          <Field label="Role">
            <Select value={role} onChange={(e) => setRole(e.target.value as MemberRole)}>
              <option value="reviewer">Reviewer</option>
              <option value="hiring_manager">Hiring manager</option>
              <option value="admin">Admin</option>
            </Select>
          </Field>
          {error && <p className="text-sm font-semibold text-[#f4502f]">{error}</p>}
          <p className="text-xs text-faint">
            This adds them to the roster shown here. It doesn&apos;t yet create a separate login for them — every
            teammate currently signs in with the workspace&apos;s admin credentials.
          </p>
        </div>
      </Modal>
    </>
  );
}
