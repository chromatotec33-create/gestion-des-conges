import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

const approvals = [
  { employee: "Nadia Lemaitre", type: "CP N", dates: "18/04 - 22/04" },
  { employee: "Thomas Rey", type: "RTT", dates: "25/04" }
];

export default function ApprovalsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Validation manager</h2>
        <p className="page-subtitle">Pipeline d’approbation des demandes en attente.</p>
      </div>
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
                <Button variant="outline">Refuser</Button>
                <Button>Approuver</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
