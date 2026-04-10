import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardMetric, CardTitle } from "@/components/ui/card";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";
import { resolveDefaultCompanyId } from "@/lib/default-company";

type EmployeeDetails = {
  id: string;
  employee_number: string;
  hired_at: string;
  contract_type: string | null;
  fte: number | null;
  is_active: boolean;
  manager_employee_id: string | null;
  users: { email: string; first_name: string | null; last_name: string | null } | null;
  teams: { name: string } | null;
  companies: { name: string; legal_name: string | null } | null;
};

type ManagerRow = {
  users: { first_name: string | null; last_name: string | null; email: string } | null;
};

type BalanceRow = {
  leave_type_id: string;
  acquired_days: number;
  consumed_days: number;
  current_balance_days: number;
};

type RequestRow = {
  id: string;
  leave_type_id: string;
  status: string;
  created_at: string;
  leave_request_days: Array<{ leave_date: string }>;
};

type AuditRow = {
  id: number;
  occurred_at: string;
  action: string;
  entity_name: string;
  reason: string | null;
};

function fullName(user: EmployeeDetails["users"]): string {
  if (!user) return "-";
  const value = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
  return value || user.email;
}

function managerName(manager: ManagerRow | null): string {
  const user = manager?.users;
  if (!user) return "-";
  return `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.email;
}

function formatPeriod(days: Array<{ leave_date: string }>): string {
  if (!days.length) return "-";
  const sorted = [...days].sort((a, b) => a.leave_date.localeCompare(b.leave_date));
  const start = sorted[0]?.leave_date;
  const end = sorted[sorted.length - 1]?.leave_date;
  return start && end ? (start === end ? start : `${start} → ${end}`) : "-";
}

async function getEmployeeSnapshot(employeeId: string) {
  const supabase = createServiceRoleClient();
  const companyId = await resolveDefaultCompanyId();

  const [{ data: employee, error: employeeError }, { data: balances, error: balancesError }, { data: requests, error: requestsError }, { data: audits, error: auditsError }] =
    await Promise.all([
      supabase
        .from("employees")
        .select("id, employee_number, hired_at, contract_type, fte, is_active, manager_employee_id, users(email, first_name, last_name), teams(name), companies(name, legal_name)")
        .eq("company_id", companyId)
        .eq("id", employeeId)
        .maybeSingle<EmployeeDetails>(),
      supabase
        .from("leave_balances")
        .select("leave_type_id, acquired_days, consumed_days, current_balance_days")
        .eq("company_id", companyId)
        .eq("employee_id", employeeId)
        .returns<BalanceRow[]>(),
      supabase
        .from("leave_requests")
        .select("id, leave_type_id, status, created_at, leave_request_days(leave_date)")
        .eq("company_id", companyId)
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false })
        .limit(50)
        .returns<RequestRow[]>(),
      supabase
        .from("audit_logs")
        .select("id, occurred_at, action, entity_name, reason")
        .eq("company_id", companyId)
        .eq("actor_employee_id", employeeId)
        .order("occurred_at", { ascending: false })
        .limit(50)
        .returns<AuditRow[]>()
    ]);

  if (employeeError || balancesError || requestsError || auditsError) {
    throw new Error(employeeError?.message ?? balancesError?.message ?? requestsError?.message ?? auditsError?.message ?? "Erreur de chargement");
  }

  let manager: ManagerRow | null = null;
  if (employee?.manager_employee_id) {
    const { data } = await supabase
      .from("employees")
      .select("users(first_name, last_name, email)")
      .eq("company_id", companyId)
      .eq("id", employee.manager_employee_id)
      .maybeSingle<ManagerRow>();
    manager = data ?? null;
  }

  return {
    employee,
    manager,
    balances: balances ?? [],
    requests: requests ?? [],
    audits: audits ?? []
  };
}

export default async function EmployeeDetailPage({ params, searchParams }: { params: { id: string }; searchParams: { year?: string; status?: string } }) {
  const snapshot = await getEmployeeSnapshot(params.id);
  if (!snapshot.employee) notFound();

  const employee = snapshot.employee;
  const yearFilter = searchParams.year;
  const statusFilter = searchParams.status;

  const filteredRequests = snapshot.requests.filter((request) => {
    const matchesStatus = statusFilter ? request.status === statusFilter : true;
    const matchesYear = yearFilter ? request.created_at.startsWith(yearFilter) : true;
    return matchesStatus && matchesYear;
  });

  const totalAcquired = snapshot.balances.reduce((acc, item) => acc + Number(item.acquired_days ?? 0), 0);
  const totalUsed = snapshot.balances.reduce((acc, item) => acc + Number(item.consumed_days ?? 0), 0);
  const totalRemaining = snapshot.balances.reduce((acc, item) => acc + Number(item.current_balance_days ?? 0), 0);

  return (
    <section className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="page-title">{fullName(employee.users)}</h2>
            <p className="page-subtitle">{employee.teams?.name ?? "Équipe non renseignée"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge>{employee.companies?.name ?? "Chromatotec"}</Badge>
            <Badge>{employee.is_active ? "Actif" : "Inactif"}</Badge>
          </div>
        </div>
      </Card>

      <details open className="glass-panel p-5">
        <summary className="cursor-pointer text-sm font-semibold">Informations légales</summary>
        <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <p>Date d’arrivée: {employee.hired_at}</p>
          <p>Type de contrat: {employee.contract_type ?? "Non renseigné"}</p>
          <p>Temps de travail: {employee.fte ? `${Math.round(employee.fte * 100)}%` : "100%"}</p>
          <p>Manager: {managerName(snapshot.manager)}</p>
          <p>ID RH interne: {employee.employee_number}</p>
          <p>Entité juridique: {employee.companies?.legal_name ?? employee.companies?.name ?? "Chromatotec"}</p>
        </div>
      </details>

      <details open className="glass-panel p-5">
        <summary className="cursor-pointer text-sm font-semibold">Compteurs de congés</summary>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Card>
            <CardTitle>Acquis</CardTitle>
            <CardMetric>{totalAcquired.toFixed(1)} j</CardMetric>
          </Card>
          <Card>
            <CardTitle>Pris</CardTitle>
            <CardMetric>{totalUsed.toFixed(1)} j</CardMetric>
          </Card>
          <Card>
            <CardTitle>Restant</CardTitle>
            <CardMetric>{totalRemaining.toFixed(1)} j</CardMetric>
          </Card>
        </div>
      </details>

      <details open className="glass-panel p-5">
        <summary className="cursor-pointer text-sm font-semibold">Demandes de congés</summary>
        <p className="mt-2 text-xs text-muted-foreground">
          Filtres disponibles via URL: <code>?year=2026</code> et/ou <code>&status=pending</code>
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Période</th>
                <th>Statut</th>
                <th>Création</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.leave_type_id}</td>
                  <td>{formatPeriod(request.leave_request_days ?? [])}</td>
                  <td>{request.status}</td>
                  <td>{request.created_at}</td>
                </tr>
              ))}
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-sm text-muted-foreground">
                    Aucune demande pour ces filtres.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </details>

      <details className="glass-panel p-5">
        <summary className="cursor-pointer text-sm font-semibold">Historique / audit</summary>
        <ul className="mt-4 space-y-2 text-sm">
          {snapshot.audits.map((audit) => (
            <li key={audit.id} className="rounded-xl border bg-muted/20 px-3 py-2">
              <span className="font-medium">{audit.occurred_at}</span> — {audit.action} ({audit.entity_name}) {audit.reason ? `· ${audit.reason}` : ""}
            </li>
          ))}
          {snapshot.audits.length === 0 ? <li className="rounded-xl border bg-muted/20 px-3 py-2 text-muted-foreground">Aucun audit disponible.</li> : null}
        </ul>
      </details>

      <details className="glass-panel p-5">
        <summary className="cursor-pointer text-sm font-semibold">Validation / workflow</summary>
        <p className="mt-3 text-sm text-muted-foreground">Chaîne globale: Manager → RH. Aucune variation par société.</p>
      </details>

      <details className="glass-panel p-5">
        <summary className="cursor-pointer text-sm font-semibold">Paramètres spécifiques</summary>
        <p className="mt-3 text-sm text-muted-foreground">Aucun override exceptionnel appliqué pour ce collaborateur.</p>
      </details>
    </section>
  );
}
