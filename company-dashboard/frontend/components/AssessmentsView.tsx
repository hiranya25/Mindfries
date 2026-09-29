"use client";

import { Chip } from "@/components/ui";
import { taskVariantLabel } from "@/lib/format";
import { InviteCandidateForm } from "@/components/InviteCandidateForm";
import type { GameTemplate, Role } from "@/lib/types";

export interface TemplateCounts {
  inProgress: number;
  readyForReview: number;
  completed: number;
  total: number;
}

export function AssessmentsView({
  templates,
  counts,
  roles,
  canInvite,
}: {
  templates: GameTemplate[];
  counts: Record<string, TemplateCounts>;
  roles: Role[];
  canInvite: boolean;
}) {
  if (templates.length === 0) {
    return (
      <div className="hair-card p-10 text-center text-sm text-dim">
        No published assessment templates yet — these are authored by the Mindfries team from a shared library.
        Check back once one is published.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {templates.map((t) => {
        const c = counts[t.id] ?? { inProgress: 0, readyForReview: 0, completed: 0, total: 0 };
        return (
          <div key={t.id} className="hair-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold tracking-tight">{t.name}</h3>
                  <span className="text-sm text-dim">
                    {taskVariantLabel[t.taskVariant]} · {t.durationMin}min
                  </span>
                </div>
                {t.techStack.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {t.techStack.map((s) => (
                      <Chip key={s}>{s}</Chip>
                    ))}
                  </div>
                )}
              </div>
              <InviteCandidateForm
                templates={templates}
                roles={roles}
                canInvite={canInvite}
                defaultTemplateId={t.id}
                triggerLabel="Invite candidate"
              />
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
  );
}
