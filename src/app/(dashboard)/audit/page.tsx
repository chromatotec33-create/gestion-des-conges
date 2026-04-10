import { Card, CardTitle } from "@/components/ui/card";

const logs = [
  { date: "2026-04-10 09:10", action: "leave_request.submitted", actor: "admin@admin.com" },
  { date: "2026-04-10 09:25", action: "leave_request.cancellation_requested", actor: "hr@chromatotec.fr" }
];

export default function AuditPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Audit logs</h2>
        <p className="page-subtitle">Traçabilité juridique des actions métier.</p>
      </div>
      <Card>
        <CardTitle>Événements</CardTitle>
        <ul className="mt-4 space-y-2 text-sm">
          {logs.map((log) => (
            <li key={`${log.date}-${log.action}`} className="rounded-md border bg-muted/30 px-3 py-2">
              <span className="font-medium">{log.date}</span> — {log.action} — {log.actor}
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
