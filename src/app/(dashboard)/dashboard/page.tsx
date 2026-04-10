import { AbsenceChart } from "@/features/dashboard/components/absence-chart";
import { KpiCards } from "@/features/dashboard/components/kpi-cards";
import { PendingApprovalsTable } from "@/features/dashboard/components/pending-approvals-table";
import { TeamAvailabilityWidget } from "@/features/dashboard/components/team-availability-widget";
import { UpcomingAbsencesTimeline } from "@/features/dashboard/components/upcoming-absences-timeline";

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Tableau de bord RH</h2>
        <p className="page-subtitle">Pilotage des absences, approbations et conformité en temps réel.</p>
      </div>
      <KpiCards />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AbsenceChart />
        </div>
        <TeamAvailabilityWidget />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <PendingApprovalsTable />
        </div>
        <UpcomingAbsencesTimeline />
      </div>
    </section>
  );
}
