"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Field, Input, Modal, Select } from "@/components/ui";
import { taskVariantLabel } from "@/lib/format";
import { inviteCandidate } from "@/app/(portal)/actions";
import type { GameTemplate, Role } from "@/lib/types";

export function InviteCandidateForm({
  templates,
  roles,
  canInvite,
}: {
  templates: GameTemplate[];
  roles: Role[];
  canInvite: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [roleId, setRoleId] = useState(roles[0]?.id ?? "");
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setCandidateName("");
    setCandidateEmail("");
    setDueDate("");
    setError(null);
  }

  async function submit() {
    setLoading(true);
    setError(null);
    const res = await inviteCandidate({
      templateId,
      candidateName,
      candidateEmail,
      roleId,
      dueDate: dueDate || null,
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    reset();
    setOpen(false);
    setNotice(res.warning ?? "Invite sent.");
    router.refresh();
  }

  if (!canInvite) return null;

  const blocked = templates.length === 0 ? "templates" : roles.length === 0 ? "roles" : null;

  return (
    <>
      {notice && (
        <div className="mb-4 rounded-lg border border-hair bg-accent-soft px-4 py-3 text-sm text-dim">{notice}</div>
      )}
      <Button onClick={() => setOpen(true)} disabled={!!blocked}>
        + Invite candidate
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Invite a candidate"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={loading || !candidateEmail.trim() || !templateId || !roleId}>
              {loading ? "Sending…" : "Send invite"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {blocked === "roles" ? (
            <p className="text-sm text-dim">
              No open roles yet — create one on the{" "}
              <Link href="/roles" className="text-accent hover:underline">
                Roles
              </Link>{" "}
              page, then come back to invite a candidate against it.
            </p>
          ) : blocked === "templates" ? (
            <p className="text-sm text-dim">
              No published assessment templates yet — these are authored by the Mindfries team. Check back once one
              is published.
            </p>
          ) : (
            <>
              <Field label="Role">
                <Select value={roleId} onChange={(e) => setRoleId(e.target.value)}>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Assessment template">
                <Select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({taskVariantLabel[t.taskVariant]}, {t.durationMin}min)
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Candidate name">
                  <Input value={candidateName} onChange={(e) => setCandidateName(e.target.value)} placeholder="Jordan Lee" />
                </Field>
                <Field label="Candidate email">
                  <Input
                    type="email"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    placeholder="jordan@example.com"
                  />
                </Field>
              </div>
              <Field label="Due date" hint="Optional">
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </Field>
              {error && <p className="text-sm font-semibold text-[#f4502f]">{error}</p>}
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
