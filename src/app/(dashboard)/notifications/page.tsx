import { Card, CardTitle } from "@/components/ui/card";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";

type NotificationsSearchParams = {
  companyId?: string;
  userId?: string;
};

type NotificationRow = {
  id: string;
  template_key: string;
  channel: "email" | "in_app";
  status: "queued" | "sent" | "failed" | "read";
  created_at: string;
  users: {
    email: string;
  } | null;
};

async function fetchNotifications(companyId: string, userId?: string): Promise<NotificationRow[]> {
  const supabase = createServiceRoleClient();
  let query = supabase
    .from("notifications")
    .select("id, template_key, channel, status, created_at, users(email)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.returns<NotificationRow[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export default async function NotificationsPage({ searchParams }: { searchParams: NotificationsSearchParams }) {
  const companyId = searchParams.companyId;
  const userId = searchParams.userId;

  let notifications: NotificationRow[] = [];
  let errorMessage: string | null = null;

  if (companyId) {
    try {
      notifications = await fetchNotifications(companyId, userId);
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Erreur de chargement";
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Notifications</h2>
        <p className="page-subtitle">Paramètres et historique des notifications transactionnelles.</p>
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
                {notification.channel} · {notification.status} · {notification.users?.email ?? "-"} · {notification.created_at}
              </p>
            </li>
          ))}

          {companyId && notifications.length === 0 ? (
            <li className="rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
              Aucune notification trouvée.
            </li>
          ) : null}
        </ul>
      </Card>
    </section>
  );
}
