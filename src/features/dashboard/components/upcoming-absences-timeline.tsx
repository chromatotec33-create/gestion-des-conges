import { Card, CardTitle } from "@/components/ui/card";

const items = [
  { employee: "Sophie Martin", period: "14 avr. - 18 avr.", type: "CP N" },
  { employee: "Adrien Rossi", period: "20 avr.", type: "RTT" },
  { employee: "Nina Delcourt", period: "22 avr. - 24 avr.", type: "Exceptionnel" }
];

export function UpcomingAbsencesTimeline() {
  return (
    <Card>
      <CardTitle>Upcoming absences</CardTitle>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={`${item.employee}-${item.period}`} className="rounded-lg border bg-muted/40 p-3">
            <p className="text-sm font-medium">{item.employee}</p>
            <p className="text-xs text-muted-foreground">{item.period}</p>
            <p className="mt-1 text-xs font-semibold text-primary">{item.type}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
