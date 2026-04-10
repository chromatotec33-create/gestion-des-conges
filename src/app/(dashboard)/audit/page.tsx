import { Card, CardTitle } from "@/components/ui/card";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";

type SearchParams = { companyId?: string };

type AuditRow = {
  id: number;
  occurred_at: string;
  action: string;
  entity_name: string;
  entity_id: string | null;
};

async function fetchAuditLogs(companyId: string): Promise<AuditRow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, occurred_at, action, entity_name, entity_id")
    .eq("company_id", companyId)
    .order("occurred_at", { ascending: false })
    .limit(50)
    .returns<AuditRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export default async function AuditPage({ searchParams }: { searchParams: SearchParams }) {
  const companyId = searchParams.companyId;
  let logs: AuditRow[] = [];
  let errorMessage: string | null = null;

  if (companyId) {
    try {
      logs = await fetchAuditLogs(companyId);
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Erreur de chargement";
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Audit logs</h2>
        <p className="page-subtitle">Traçabilité juridique des actions métier (données Supabase).</p>
      </div>

      {!companyId ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            Renseignez <code>companyId</code> dans l’URL pour charger les logs d’audit réels.
          </p>
        </Card>
      ) : null}

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
              <span className="font-medium">{log.occurred_at}</span> — {log.action} — {log.entity_name}
              {log.entity_id ? ` (${log.entity_id})` : ""}
            </li>
          ))}
          {companyId && logs.length === 0 ? (
            <li className="rounded-md border bg-muted/30 px-3 py-2 text-muted-foreground">
              Aucun événement d'audit pour cette société.
            </li>
          ) : null}
        </ul>
      </Card>
    </section>
  );
}
