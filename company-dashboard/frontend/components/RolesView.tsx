"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Chip, Field, Input, Modal, Pill, Select, Textarea } from "@/components/ui";
import { createRoleAction, setRoleStatusAction, setRoleTemplateAction } from "@/app/(portal)/actions";
import { roleStatusLabel, roleStatusTone } from "@/lib/format";
import type { GameTemplate, Role } from "@/lib/types";

export interface RoleCounts {
  inProgress: number;
  readyForReview: number;
  completed: number;
  total: number;
}

export function RolesView({
  roles,
  counts,
  templates,
  canManage,
}: {
  roles: Role[];
  counts: Record<string, RoleCounts>;
  templates: GameTemplate[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [requirements, setRequirements] = useState("");
  const [techStack, setTechStack] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    const res = await createRoleAction({ title, requirements, techStack, templateId });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setTitle("");
    setRequirements("");
    setTechStack("");
    setTemplateId("");
    setOpen(false);
    router.refresh();
  }

  async function toggleStatus(role: Role) {
    setPendingId(role.id);
    await setRoleStatusAction(role.id, role.status === "open" ? "closed" : "open");
    setPendingId(null);
    router.refresh();
  }

  async function changeTemplate(role: Role, newTemplateId: string) {
    setPendingId(role.id);
    await setRoleTemplateAction(role.id, newTemplateId);
    setPendingId(null);
    router.refresh();
  }

  const openRoles = roles.filter((r) => r.status === "open");
  const closedRoles = roles.filter((r) => r.status === "closed");

  return (
    <>
      <div className="space-y-6">
        {roles.length === 0 && (
          <div className="hair-card p-10 text-center text-sm text-dim">
            No roles yet. Create one to start inviting candidates against it.
          </div>
        )}

        {[...openRoles, ...closedRoles].map((role) => {
          const c = counts[role.id] ?? { inProgress: 0, readyForReview: 0, completed: 0, total: 0 };
          return (
            <div key={role.id} className="hair-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold tracking-tight">{role.title}</h3>
                    <Pill tone={roleStatusTone[role.status]}>{roleStatusLabel[role.status]}</Pill>
                  </div>
                  {role.techStack.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {role.techStack.map((t) => (
                        <Chip key={t}>{t}</Chip>
                      ))}
                    </div>
                  )}
                  {role.requirements && <p className="mt-2 max-w-2xl text-sm text-dim">{role.requirements}</p>}
                </div>
                {canManage && (
                  <Button variant="ghost" onClick={() => toggleStatus(role)} disabled={pendingId === role.id}>
                    {role.status === "open" ? "Close role" : "Reopen"}
                  </Button>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-faint">Default assessment</span>
                {canManage ? (
                  <Select
                    value={role.templateId ?? ""}
                    onChange={(e) => changeTemplate(role, e.target.value)}
                    disabled={pendingId === role.id}
                    className="w-auto max-w-xs py-1 text-xs"
                  >
                    <option value="">None — pick at invite time</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <span className="text-sm text-dim">{role.templateName ?? "None — pick at invite time"}</span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-dim">
                <span>{c.total} invited</span>
                <span>{c.inProgress} in progress</span>
                <span>{c.readyForReview} ready for review</span>
                <span>{c.completed} completed</span>
              </div>
            </div>
          );
        })}
      </div>

      {canManage && (
        <div className="fixed bottom-8 right-8">
          <Button onClick={() => setOpen(true)}>+ New role</Button>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New role"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={loading || !title.trim()}>
              {loading ? "Creating…" : "Create role"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Backend Engineer" />
          </Field>
          <Field label="Requirements" hint="Optional">
            <Textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={3}
              placeholder="3+ years with distributed systems…"
            />
          </Field>
          <Field label="Tech stack" hint="Comma-separated, optional">
            <Input value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="Python, PostgreSQL, Kafka" />
          </Field>
          <Field label="Default assessment" hint="Optional — pre-selects this template when inviting against the role">
            <Select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
              <option value="">None — pick at invite time</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>
          {error && <p className="text-sm font-semibold text-[#f4502f]">{error}</p>}
        </div>
      </Modal>
    </>
  );
}
