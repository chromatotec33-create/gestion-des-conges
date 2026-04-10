import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";
import { resolveDefaultCompanyId } from "@/lib/default-company";

type RequestSearchParams = {
  employeeId?: string;
};

type LeaveRequestRow = {
  id: string;
  leave_type_id: string;
  status: string;
  employee_id: string;
  leave_request_days: Array<{ leave_date: string }>;
};

function formatPeriod(days: Array<{ leave_date: string }>): string {
  if (!days.length) return "-";
  const sorted = [...days].sort((a, b) => a.leave_date.localeCompare(b.leave_date));
  const start = sorted[0]?.leave_date;
  const end = sorted[sorted.length - 1]?.leave_date;
  if (!start) return "-";
  return start === end ? start : `${start} → ${end}`;
}

async function fetchRequests(employeeId?: string): Promise<LeaveRequestRow[]> {
  const supabase = createServiceRoleClient();
  const companyId = await resolveDefaultCompanyId();

  let query = supabase
    .from("leave_requests")
    .select("id, leave_type_id, status, employee_id, leave_request_days(leave_date)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (employeeId) query = query.eq("employee_id", employeeId);

  const { data, error } = await query.returns<LeaveRequestRow[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export default async function RequestsPage({ searchParams }: { searchParams: RequestSearchParams }) {
  let requests: LeaveRequestRow[] = [];
  let errorMessage: string | null = null;

  try {
    requests = await fetchRequests(searchParams.employeeId);
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Erreur de chargement";
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Mes demandes</h2>
          <p className="page-subtitle">Historique et suivi des demandes de congé (règles globales Chromatotec).</p>
        </div>
        <Link href="/requests/new">
          <Button>Nouvelle demande</Button>
        </Link>
      </div>

      {errorMessage ? (
        <Card>
          <p className="text-sm text-red-600">Erreur: {errorMessage}</p>
        </Card>
      ) : null}

      <Card>
        <CardTitle>Demandes récentes</CardTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employé</th>
                <th>Type</th>
                <th>Période</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.id}</td>
                  <td>{request.employee_id}</td>
                  <td>{request.leave_type_id}</td>
                  <td>{formatPeriod(request.leave_request_days ?? [])}</td>
                  <td>{request.status}</td>
                </tr>
              ))}
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-sm text-muted-foreground">
                    Aucune demande trouvée.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
