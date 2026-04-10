import { Card, CardTitle } from "@/components/ui/card";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";
import { resolveDefaultCompanyId } from "@/lib/default-company";

type PendingApprovalRow = {
  id: string;
  leave_type_id: string;
  status: string;
  employees: { first_name: string | null; last_name: string | null } | null;
  leave_request_days: Array<{ leave_date: string }>;
};

function periodFromDays(days: Array<{ leave_date: string }>): string {
  if (!days.length) return "-";
  const sorted = [...days].sort((a, b) => a.leave_date.localeCompare(b.leave_date));
  const start = sorted[0]?.leave_date ?? "";
  const end = sorted[sorted.length - 1]?.leave_date ?? "";
  return start && end ? (start === end ? start : `${start} → ${end}`) : "-";
}

function employeeLabel(employee: PendingApprovalRow["employees"]): string {
  const first = employee?.first_name ?? "";
  const last = employee?.last_name ?? "";
  return `${first} ${last}`.trim() || "Employé inconnu";
}

async function fetchPendingApprovals(): Promise<PendingApprovalRow[]> {
  const supabase = createServiceRoleClient();
  const companyId = await resolveDefaultCompanyId();
  const { data, error } = await supabase
    .from("leave_requests")
    .select("id, leave_type_id, status, employees(first_name, last_name), leave_request_days(leave_date)")
    .eq("company_id", companyId)
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(50)
    .returns<PendingApprovalRow[]>();

  if (error) throw new Error(error.message);
  return data ?? [];
}

export default async function ApprovalsPage() {
  let approvals: PendingApprovalRow[] = [];
  let errorMessage: string | null = null;

  try {
    approvals = await fetchPendingApprovals();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Erreur de chargement";
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Validation manager</h2>
        <p className="page-subtitle">Pipeline global des demandes en attente.</p>
      </div>

      {errorMessage ? (
        <Card>
          <p className="text-sm text-red-600">Erreur: {errorMessage}</p>
        </Card>
      ) : null}

      <div className="grid gap-4">
        {approvals.map((approval) => (
          <Card key={approval.id}>
            <div className="space-y-1">
              <CardTitle>{employeeLabel(approval.employees)}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {approval.leave_type_id} — {periodFromDays(approval.leave_request_days ?? [])}
              </p>
              <p className="text-xs text-muted-foreground">Statut: {approval.status}</p>
            </div>
          </Card>
        ))}

        {approvals.length === 0 ? (
          <Card>
            <p className="text-sm text-muted-foreground">Aucune demande en attente.</p>
          </Card>
        ) : null}
      </div>
    </section>
  );
}
