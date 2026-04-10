"use client";

import { Card, CardTitle } from "@/components/ui/card";

const data = [32, 28, 34, 29, 25, 31, 26, 24, 27, 30, 33, 29];

export function AbsenceChart() {
  const max = Math.max(...data);

  return (
    <Card>
      <CardTitle>Absentéisme mensuel (%)</CardTitle>
      <div className="mt-4 flex h-48 items-end gap-2">
        {data.map((value, index) => (
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
