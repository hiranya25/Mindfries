"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Pill } from "@/components/ui";
import { fmtDate, recommendationLabel, recommendationTone, reportStatusLabel, reportStatusTone } from "@/lib/format";
import type { ReportSummary } from "@/lib/types";

const PAGE_SIZE = 20;

export function ReportsTable({ reports }: { reports: ReportSummary[] }) {
  const [page, setPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil(reports.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount - 1);
  const paged = reports.slice(clampedPage * PAGE_SIZE, clampedPage * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="space-y-3">
      <div className="hair-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hair text-left text-xs uppercase tracking-wide text-faint">
                <th className="px-5 py-3 font-semibold">Candidate</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Recommendation</th>
                <th className="px-5 py-3 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hair">
              {paged.map((r) => {
                const status = r.reportStatus ?? "none";
                return (
                  <tr key={r.assessmentId} className="hover:bg-black/[0.015]">
                    <td className="px-5 py-4">
                      <Link href={`/reports/${r.assessmentId}`} className="font-semibold hover:text-accent">
                        {r.candidateName ?? r.candidateEmail}
                      </Link>
                      <div className="text-xs text-faint">{r.candidateEmail}</div>
                    </td>
                    <td className="px-5 py-4 text-dim">{r.role ?? "—"}</td>
                    <td className="px-5 py-4">
                      <Pill tone={reportStatusTone[status]}>{reportStatusLabel[status]}</Pill>
                    </td>
                    <td className="px-5 py-4">
                      {r.recommendation ? (
                        <Pill tone={recommendationTone[r.recommendation] ?? "gray"}>
                          {recommendationLabel[r.recommendation] ?? r.recommendation}
                        </Pill>
                      ) : (
                        <span className="text-dim">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-dim">{r.updatedAt ? fmtDate(r.updatedAt) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm text-dim">
          <span>
            Page {clampedPage + 1} of {pageCount} ({reports.length} candidate{reports.length === 1 ? "" : "s"})
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
