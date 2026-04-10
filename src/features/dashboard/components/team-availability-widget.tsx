import { Card, CardTitle } from "@/components/ui/card";

const teams = [
  { name: "Production", availability: 82 },
  { name: "R&D", availability: 91 },
  { name: "Support", availability: 76 }
];

export function TeamAvailabilityWidget() {
  return (
    <Card>
      <CardTitle>Team availability</CardTitle>
      <div className="mt-4 space-y-3">
        {teams.map((team) => (
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
      </div>
    </Card>
  );
}
