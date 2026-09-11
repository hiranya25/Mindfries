"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button, Input, Pill } from "@/components/ui";
import { fmtDate, assessmentStatusLabel, assessmentStatusTone } from "@/lib/format";
import type { Assessment } from "@/lib/types";

const PAGE_SIZE = 20;

export function CandidatesTable({ assessments }: { assessments: Assessment[] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assessments;
    return assessments.filter((a) =>
      [a.candidateName, a.candidateEmail, a.role, a.templateName, assessmentStatusLabel[a.status]]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q))
    );
  }, [assessments, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount - 1);
  const paged = filtered.slice(clampedPage * PAGE_SIZE, clampedPage * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="space-y-3">
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(0);
        }}
        placeholder="Search by candidate, role, template, or status…"
      />

      <div className="hair-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hair text-left text-xs uppercase tracking-wide text-faint">
                <th className="px-5 py-3 font-semibold">Candidate</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Template</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Due</th>
                <th className="px-5 py-3 font-semibold">Invited</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hair">
              {paged.length === 0 && (
                <tr>
                  <td className="px-5 py-12 text-center text-sm text-dim" colSpan={6}>
                    {assessments.length === 0 ? "No candidates invited yet." : "No candidates match your search."}
                  </td>
                </tr>
              )}
              {paged.map((a) => (
                <tr key={a.id} className="hover:bg-black/[0.015]">
                  <td className="px-5 py-4">
                    <Link href={`/candidates/${a.id}`} className="font-semibold hover:text-accent">
                      {a.candidateName ?? a.candidateEmail}
                    </Link>
                    <div className="text-xs text-faint">{a.candidateEmail}</div>
                  </td>
                  <td className="px-5 py-4 text-dim">{a.role ?? "—"}</td>
                  <td className="px-5 py-4 text-dim">{a.templateName ?? "—"}</td>
                  <td className="px-5 py-4">
                    <Pill tone={assessmentStatusTone[a.status]}>{assessmentStatusLabel[a.status]}</Pill>
                  </td>
                  <td className="px-5 py-4 text-dim">{a.dueDate ? fmtDate(a.dueDate) : "—"}</td>
                  <td className="px-5 py-4 text-dim">{fmtDate(a.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm text-dim">
          <span>
            Page {clampedPage + 1} of {pageCount} ({filtered.length} candidate{filtered.length === 1 ? "" : "s"})
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={clampedPage === 0}>
              Previous
            </Button>
            <Button
              variant="ghost"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={clampedPage >= pageCount - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
