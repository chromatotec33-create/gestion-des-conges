"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

type ApprovalRow = {
  readonly employee: string;
  readonly type: string;
  readonly dates: string;
};

const initialApprovals: ApprovalRow[] = [
  { employee: "Nadia Lemaitre", type: "CP N", dates: "18/04 - 22/04" },
  { employee: "Thomas Rey", type: "RTT", dates: "25/04" }
];

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalRow[]>(initialApprovals);
  const [feedback, setFeedback] = useState<string | null>(null);

  const decide = (employee: string, decision: "approuvée" | "refusée") => {
    setApprovals((prev) => prev.filter((approval) => approval.employee !== employee));
    setFeedback(`Demande ${decision} pour ${employee}.`);
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Validation manager</h2>
        <p className="page-subtitle">Pipeline d’approbation des demandes en attente.</p>
      </div>

      {feedback ? <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm">{feedback}</p> : null}

      <div className="grid gap-4">
        {approvals.map((approval) => (
          <Card key={`${approval.employee}-${approval.dates}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>{approval.employee}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {approval.type} — {approval.dates}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => decide(approval.employee, "refusée")}>
                  Refuser
                </Button>
                <Button onClick={() => decide(approval.employee, "approuvée")}>Approuver</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
