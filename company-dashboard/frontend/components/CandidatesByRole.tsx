"use client";

import { useMemo, useState } from "react";
import { Input, Pill } from "@/components/ui";
import { assessmentStatusLabel, roleStatusLabel, roleStatusTone } from "@/lib/format";
import { groupAssessmentsByRole } from "@/lib/groupAssessments";
import { CandidatesTable } from "@/components/CandidatesTable";
import type { Assessment, Role } from "@/lib/types";

export function CandidatesByRole({ assessments, roles }: { assessments: Assessment[]; roles: Role[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assessments;
    return assessments.filter((a) =>
      [a.candidateName, a.candidateEmail, a.role, a.templateName, assessmentStatusLabel[a.status]]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q))
    );
  }, [assessments, query]);

  const groups = useMemo(() => groupAssessmentsByRole(filtered, roles), [filtered, roles]);

  return (
    <div className="space-y-8">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by candidate, role, template, or status…"
      />

      {groups.length === 0 && (
        <div className="hair-card p-12 text-center text-sm text-dim">
          {assessments.length === 0 ? "No candidates invited yet." : "No candidates match your search."}
        </div>
      )}

      {groups.map((g) => (
        <div key={g.key} className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold tracking-tight">{g.label}</h2>
            {g.role && <Pill tone={roleStatusTone[g.role.status]}>{roleStatusLabel[g.role.status]}</Pill>}
            <span className="text-sm text-dim">({g.assessments.length})</span>
          </div>
          <CandidatesTable assessments={g.assessments} />
        </div>
      ))}
    </div>
  );
}
