"use client";

import { motion } from "framer-motion";
import { Card, CardTitle } from "@/components/ui/card";

const data = [32, 28, 34, 29, 25, 31, 26, 24, 27, 30, 33, 29];

export function AbsenceChart() {
  const max = Math.max(...data);

  return (
    <Card>
      <CardTitle>Absentéisme mensuel (%)</CardTitle>
      <div className="mt-4 flex h-48 items-end gap-2">
        {data.map((value, index) => (
          <motion.div
            key={`chart-${index}`}
            initial={{ height: 0 }}
            animate={{ height: `${(value / max) * 100}%` }}
            transition={{ delay: index * 0.03 }}
            className="flex-1 rounded-t-md bg-primary/70"
            title={`M${index + 1}: ${value}`}
          />
        ))}
      </div>
    </Card>
  );
}
