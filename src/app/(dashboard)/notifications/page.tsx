import { Card, CardTitle } from "@/components/ui/card";

const notifications = [
  { title: "Demande en attente", channel: "In-app", date: "10/04/2026" },
  { title: "Validation manager requise", channel: "Email", date: "09/04/2026" }
];

export default function NotificationsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Notifications</h2>
        <p className="page-subtitle">Paramètres et historique des notifications transactionnelles.</p>
      </div>
      <Card>
        <CardTitle>Dernières notifications</CardTitle>
        <ul className="mt-4 space-y-3">
          {notifications.map((notification) => (
            <li key={`${notification.title}-${notification.date}`} className="rounded-md border bg-muted/20 px-3 py-2 text-sm">
              <p className="font-medium">{notification.title}</p>
              <p className="text-xs text-muted-foreground">
                {notification.channel} · {notification.date}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
