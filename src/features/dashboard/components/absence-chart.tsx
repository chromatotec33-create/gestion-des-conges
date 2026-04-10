"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { useAbsenceChartData } from "@/features/dashboard/hooks/use-dashboard-data";

export function AbsenceChart() {
  const { data = [], isLoading } = useAbsenceChartData();
  const max = Math.max(...data, 1);

  return (
    <Card>
      <CardTitle>Absentéisme mensuel (%)</CardTitle>
      <div className="mt-4 flex h-48 items-end gap-2">
        {isLoading
          ? Array.from({ length: 12 }).map((_, index) => (
              <div key={`chart-skeleton-${index}`} className="h-10 flex-1 animate-pulse rounded-t-md bg-muted" />
            ))
          : data.map((value, index) => (
              <div
                key={`chart-${index}`}
                className="flex-1 rounded-t-md bg-primary/70 transition-all duration-500 ease-out"
                style={{ height: `${(value / max) * 100}%` }}
                title={`M${index + 1}: ${value}`}
              />
            ))}
      </div>
    </Card>
  );
}
