"use client";

import { Card, CardMetric, CardTitle } from "@/components/ui/card";
import { useDashboardMetrics } from "@/features/dashboard/hooks/use-dashboard-data";

export function KpiCards() {
  const { data, isLoading } = useDashboardMetrics();

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`kpi-skeleton-${i}`} className="h-28 animate-pulse rounded-xl border border-border bg-slate-100 dark:bg-slate-900" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardTitle>Approbations en attente</CardTitle>
        <CardMetric>{data.pendingApprovals}</CardMetric>
      </Card>
      <Card>
        <CardTitle>Absences à venir (30j)</CardTitle>
        <CardMetric>{data.upcomingAbsences}</CardMetric>
      </Card>
      <Card>
        <CardTitle>Taux d’absentéisme équipe</CardTitle>
        <CardMetric>{data.teamAbsenceRate}%</CardMetric>
      </Card>
      <Card>
        <CardTitle>Employés absents aujourd’hui</CardTitle>
        <CardMetric>{data.employeesOnLeaveToday}</CardMetric>
      </Card>
    </div>
  );
}
