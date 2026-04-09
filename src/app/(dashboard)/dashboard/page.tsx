import { KpiCards } from "@/features/dashboard/components/kpi-cards";
import { PendingApprovalsTable } from "@/features/dashboard/components/pending-approvals-table";

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Tableau de bord RH</h2>
        <p className="mt-1 text-sm text-slate-500">Pilotage des absences, approbations et conformité en temps réel.</p>
      </div>
      <KpiCards />
      <PendingApprovalsTable />
    </section>
  );
}
