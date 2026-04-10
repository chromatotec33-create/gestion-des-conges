import { Card, CardTitle } from "@/components/ui/card";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";
import { resolveDefaultCompanyId } from "@/lib/default-company";

type AuditRow = {
  id: number;
  occurred_at: string;
  action: string;
  entity_name: string;
  entity_id: string | null;
  actor_user_id: string | null;
  users: { email: string } | null;
};

async function fetchAuditLogs(): Promise<AuditRow[]> {
  const supabase = createServiceRoleClient();
  const companyId = await resolveDefaultCompanyId();

  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, occurred_at, action, entity_name, entity_id, actor_user_id, users:actor_user_id(email)")
    .eq("company_id", companyId)
    .order("occurred_at", { ascending: false })
    .limit(100)
    .returns<AuditRow[]>();

  if (error) throw new Error(error.message);
  return data ?? [];
}

export default async function AuditPage() {
  let logs: AuditRow[] = [];
  let errorMessage: string | null = null;

  try {
    logs = await fetchAuditLogs();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Erreur de chargement";
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Audit logs</h2>
        <p className="page-subtitle">Traçabilité juridique des actions métier.</p>
      </div>

      {errorMessage ? (
        <Card>
          <p className="text-sm text-red-600">Erreur: {errorMessage}</p>
        </Card>
      ) : null}

      <Card>
        <CardTitle>Événements</CardTitle>
        <ul className="mt-4 space-y-2 text-sm">
          {logs.map((log) => (
            <li key={log.id} className="rounded-md border bg-muted/30 px-3 py-2">
              <span className="font-medium">{log.occurred_at}</span> — {log.action} ({log.entity_name}
              {log.entity_id ? `#${log.entity_id}` : ""}) — {log.users?.email ?? log.actor_user_id ?? "système"}
            </li>
          ))}
          {logs.length === 0 ? <li className="rounded-md border bg-muted/30 px-3 py-2 text-muted-foreground">Aucun événement d’audit trouvé.</li> : null}
        </ul>
      </Card>
    </section>
  );
}
