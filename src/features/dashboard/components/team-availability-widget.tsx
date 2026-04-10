import { Card, CardTitle } from "@/components/ui/card";
import { useTeamAvailability } from "@/features/dashboard/hooks/use-dashboard-data";

export function TeamAvailabilityWidget() {
  const { data: teams = [], isLoading } = useTeamAvailability();

  return (
    <Card>
      <CardTitle>Team availability</CardTitle>
      <div className="mt-4 space-y-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, idx) => (
              <div key={`team-skeleton-${idx}`} className="h-8 animate-pulse rounded bg-muted" />
            ))
          : teams.map((team) => (
              <div key={team.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{team.name}</span>
                  <span className="font-medium">{team.availability}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${team.availability}%` }} />
                </div>
              </div>
            ))}
        {!isLoading && teams.length === 0 ? (
          <p className="text-xs text-muted-foreground">Aucune donnée de disponibilité.</p>
        ) : null}
      </div>
    </Card>
  );
}
