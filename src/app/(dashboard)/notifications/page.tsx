import { Card, CardTitle } from "@/components/ui/card";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";

type SearchParams = { companyId?: string | string[] };

type NotificationRow = {
  id: string;
  channel: string;
  template_key: string;
  status: string;
  created_at: string;
};

async function fetchNotifications(companyId: string): Promise<NotificationRow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, channel, template_key, status, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(30)
    .returns<NotificationRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export default async function NotificationsPage({ searchParams = {} }: { searchParams?: SearchParams }) {
  const companyId = Array.isArray(searchParams.companyId) ? searchParams.companyId[0] : searchParams.companyId;
  let notifications: NotificationRow[] = [];
  let errorMessage: string | null = null;

  if (companyId) {
    try {
      notifications = await fetchNotifications(companyId);
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Erreur de chargement";
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Notifications</h2>
        <p className="page-subtitle">Historique des notifications transactionnelles (données Supabase).</p>
      </div>

      {!companyId ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            Renseignez <code>companyId</code> dans l’URL pour charger les notifications réelles.
          </p>
        </Card>
      ) : null}

      {errorMessage ? (
        <Card>
          <p className="text-sm text-red-600">Erreur: {errorMessage}</p>
        </Card>
      ) : null}

      <Card>
        <CardTitle>Dernières notifications</CardTitle>
        <ul className="mt-4 space-y-3">
          {notifications.map((notification) => (
            <li key={notification.id} className="rounded-md border bg-muted/20 px-3 py-2 text-sm">
              <p className="font-medium">{notification.template_key}</p>
              <p className="text-xs text-muted-foreground">
                {notification.channel} · {notification.status} · {notification.created_at}
              </p>
            </li>
          ))}
          {companyId && notifications.length === 0 ? (
            <li className="rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
              Aucune notification trouvée pour cette société.
            </li>
          ) : null}
        </ul>
      </Card>
    </section>
  );
}
