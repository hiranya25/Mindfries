"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Input, Modal, Pill, Select } from "@/components/ui";
import { inviteTeammate, removeTeamMember } from "@/app/(portal)/actions";
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

export function TeamRoster({
  team,
  canManage,
  currentEmail,
}: {
  team: TeamMember[];
  canManage: boolean;
  currentEmail: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("reviewer");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  async function submit() {
    setLoading(true);
    setError(null);
    const res = await inviteTeammate({ email, role });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setEmail("");
    setRole("reviewer");
    setOpen(false);
    setNotice(res.warning ?? "Invite sent — they can sign in with the temporary password we emailed them.");
    router.refresh();
  }

  async function confirmRemove() {
    if (!removeTarget) return;
    setRemoving(true);
    setRemoveError(null);
    const res = await removeTeamMember(removeTarget);
    setRemoving(false);
    if (!res.ok) {
      setRemoveError(res.error);
      return;
    }
    setRemoveTarget(null);
    router.refresh();
  }

  return (
    <>
      {notice && (
        <div className="mb-4 rounded-lg border border-hair bg-accent-soft px-4 py-3 text-sm text-dim">{notice}</div>
      )}

      <div className="hair-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-hair px-5 py-4">
          <h2 className="text-lg font-extrabold tracking-tight">Team</h2>
          {canManage && <Button onClick={() => setOpen(true)}>+ Invite teammate</Button>}
        </div>
        <ul className="divide-y divide-hair">
          {team.map((m) => (
            <li key={m.email} className="flex items-center justify-between px-5 py-4">
              <div>
                <div className="text-sm font-semibold">
                  {m.email}
                  {m.email.toLowerCase() === currentEmail.toLowerCase() && (
                    <span className="ml-2 text-xs font-normal text-faint">(you)</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Pill tone={roleTone[m.role]}>{roleLabel[m.role]}</Pill>
                {canManage && m.email.toLowerCase() !== currentEmail.toLowerCase() && (
                  <button
                    onClick={() => {
                      setRemoveError(null);
                      setRemoveTarget(m.email);
                    }}
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
              {loading ? "Inviting…" : "Send invite"}
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
            This creates a real login for them and emails a temporary password. Reviewers can view candidates and
            reports but can&apos;t invite anyone or change settings; hiring managers can also invite candidates.
          </p>
        </div>
      </Modal>

      <Modal
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        title="Remove teammate?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmRemove} disabled={removing}>
              {removing ? "Removing…" : "Remove"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-dim">
            <span className="font-semibold">{removeTarget}</span> will lose access immediately — their login is
            disabled, not just removed from this list.
          </p>
          {removeError && <p className="text-sm font-semibold text-[#f4502f]">{removeError}</p>}
        </div>
      </Modal>
    </>
  );
}
