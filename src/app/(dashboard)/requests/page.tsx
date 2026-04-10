import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";

type RequestSearchParams = {
  companyId?: string | string[];
  employeeId?: string | string[];
};

type LeaveRequestRow = {
  id: string;
  leave_type_id: string;
  status: string;
  created_at: string;
  leave_request_days: Array<{
    leave_date: string;
  }>;
};

function formatPeriod(days: Array<{ leave_date: string }>): string {
  if (!days.length) {
    return "-";
  }

  const sorted = [...days].sort((a, b) => a.leave_date.localeCompare(b.leave_date));
  const start = sorted[0]?.leave_date ?? "";
  const end = sorted[sorted.length - 1]?.leave_date ?? "";

  if (!start) {
    return "-";
  }

  if (start === end) {
    return start;
  }

  return `${start} -> ${end}`;
}

async function fetchRequests(companyId: string, employeeId: string): Promise<LeaveRequestRow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("leave_requests")
    .select("id, leave_type_id, status, created_at, leave_request_days(leave_date)")
    .eq("company_id", companyId)
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false })
    .limit(30)
    .returns<LeaveRequestRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export default async function RequestsPage({ searchParams = {} }: { searchParams?: RequestSearchParams }) {
  const companyId = Array.isArray(searchParams.companyId) ? searchParams.companyId[0] : searchParams.companyId;
  const employeeId = Array.isArray(searchParams.employeeId) ? searchParams.employeeId[0] : searchParams.employeeId;

  let requests: LeaveRequestRow[] = [];
  let errorMessage: string | null = null;

  if (companyId && employeeId) {
    try {
      requests = await fetchRequests(companyId, employeeId);
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Erreur de chargement";
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Mes demandes</h2>
          <p className="page-subtitle">Historique et suivi de vos demandes de congé (données Supabase).</p>
        </div>
        <Link href="/requests/new">
          <Button>Nouvelle demande</Button>
        </Link>
      </div>

      {!companyId || !employeeId ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            Renseignez <code>companyId</code> et <code>employeeId</code> dans l’URL pour charger les demandes réelles.
          </p>
        </Card>
      ) : null}

      {errorMessage ? (
        <Card>
          <p className="text-sm text-red-600">Erreur: {errorMessage}</p>
        </Card>
      ) : null}

      <Card>
        <CardTitle>Demandes récentes</CardTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2">ID</th>
                <th className="py-2">Type (leave_type_id)</th>
                <th className="py-2">Période</th>
                <th className="py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="border-t">
                  <td className="py-3">{request.id}</td>
                  <td>{request.leave_type_id}</td>
                  <td>{formatPeriod(request.leave_request_days ?? [])}</td>
                  <td>{request.status}</td>
                </tr>
              ))}
              {companyId && employeeId && requests.length === 0 ? (
                <tr className="border-t">
                  <td colSpan={4} className="py-4 text-sm text-muted-foreground">
                    Aucune demande trouvée pour cet employé.
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
