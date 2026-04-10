import { Card, CardTitle } from "@/components/ui/card";
import { useUpcomingAbsences } from "@/features/dashboard/hooks/use-dashboard-data";

export function UpcomingAbsencesTimeline() {
  const { data: items = [], isLoading } = useUpcomingAbsences();

  return (
    <Card>
      <CardTitle>Upcoming absences</CardTitle>
      <ul className="mt-4 space-y-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <li key={`upcoming-skeleton-${index}`} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))
          : items.map((item) => (
              <li key={`${item.employee}-${item.period}`} className="rounded-lg border bg-muted/40 p-3">
                <p className="text-sm font-medium">{item.employee}</p>
                <p className="text-xs text-muted-foreground">{item.period}</p>
                <p className="mt-1 text-xs font-semibold text-primary">{item.type}</p>
              </li>
            ))}
        {!isLoading && items.length === 0 ? (
          <li className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">Aucune absence à venir.</li>
        ) : null}
      </ul>
    </Card>
  );
}
