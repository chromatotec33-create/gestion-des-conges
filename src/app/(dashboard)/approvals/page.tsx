import { Card, CardTitle } from "@/components/ui/card";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";
import { revalidatePath } from "next/cache";

type ApprovalSearchParams = {
  companyId?: string | string[];
};

type PendingApprovalRow = {
  id: string;
  leave_type_id: string;
  status: string;
  employees: {
    first_name: string | null;
    last_name: string | null;
  } | null;
  leave_request_days: Array<{
    leave_date: string;
  }>;
};

function periodFromDays(days: Array<{ leave_date: string }>): string {
  if (!days.length) {
    return "-";
  }

  const sorted = [...days].sort((a, b) => a.leave_date.localeCompare(b.leave_date));
  const start = sorted[0]?.leave_date ?? "";
  const end = sorted[sorted.length - 1]?.leave_date ?? "";

  if (!start) {
    return "-";
  }

  return start === end ? start : `${start} -> ${end}`;
}

function employeeLabel(employee: PendingApprovalRow["employees"]): string {
  const first = employee?.first_name ?? "";
  const last = employee?.last_name ?? "";
  const full = `${first} ${last}`.trim();
  return full || "Employé inconnu";
}

async function fetchPendingApprovals(companyId: string): Promise<PendingApprovalRow[]> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("leave_requests")
    .select(
      "id, leave_type_id, status, employees(first_name, last_name), leave_request_days(leave_date)"
    )
    .eq("company_id", companyId)
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(50)
    .returns<PendingApprovalRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export default async function ApprovalsPage({ searchParams = {} }: { searchParams?: ApprovalSearchParams }) {
  const companyId = Array.isArray(searchParams.companyId) ? searchParams.companyId[0] : searchParams.companyId;
  let approvals: PendingApprovalRow[] = [];
  let errorMessage: string | null = null;

  if (companyId) {
    try {
      approvals = await fetchPendingApprovals(companyId);
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Erreur de chargement";
    }
  }

  async function decideLeaveRequest(formData: FormData) {
    "use server";

    const requestId = formData.get("requestId");
    const companyIdFromForm = formData.get("companyId");
    const decision = formData.get("decision");

    if (
      typeof requestId !== "string" ||
      typeof companyIdFromForm !== "string" ||
      (decision !== "approved" && decision !== "rejected")
    ) {
      return;
    }

    const supabase = createServiceRoleClient();
    await supabase
      .from("leave_requests")
      .update({ status: decision, updated_at: new Date().toISOString() })
      .eq("company_id", companyIdFromForm)
      .eq("id", requestId);

    revalidatePath("/approvals");
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Validation manager</h2>
        <p className="page-subtitle">Pipeline d’approbation des demandes en attente (données Supabase).</p>
      </div>

      {!companyId ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            Renseignez <code>companyId</code> dans l’URL pour charger les demandes en attente réelles.
          </p>
        </Card>
      ) : null}

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
              {companyId ? (
                <div className="mt-3 flex gap-2">
                  <form action={decideLeaveRequest}>
                    <input type="hidden" name="requestId" value={approval.id} />
                    <input type="hidden" name="companyId" value={companyId} />
                    <input type="hidden" name="decision" value="approved" />
                    <button type="submit" className="rounded-md border px-3 py-1.5 text-xs font-medium">
                      Approuver
                    </button>
                  </form>
                  <form action={decideLeaveRequest}>
                    <input type="hidden" name="requestId" value={approval.id} />
                    <input type="hidden" name="companyId" value={companyId} />
                    <input type="hidden" name="decision" value="rejected" />
                    <button type="submit" className="rounded-md border px-3 py-1.5 text-xs font-medium">
                      Refuser
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          </Card>
        ))}

        {companyId && approvals.length === 0 ? (
          <Card>
            <p className="text-sm text-muted-foreground">Aucune demande en attente pour cette société.</p>
          </Card>
        ) : null}
      </div>
    </section>
  );
}
