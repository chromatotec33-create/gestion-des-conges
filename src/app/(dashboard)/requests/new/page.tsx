import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { Card, CardTitle } from "@/components/ui/card";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";

type SearchParams = { companyId?: string | string[] };

type LeaveTypeRow = {
  id: string;
  code: string;
  label: string;
};

async function fetchLeaveTypes(companyId: string): Promise<LeaveTypeRow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("leave_types")
    .select("id, code, label")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("label", { ascending: true })
    .returns<LeaveTypeRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export default async function NewRequestPage({ searchParams = {} }: { searchParams?: SearchParams }) {
  const companyId = Array.isArray(searchParams.companyId) ? searchParams.companyId[0] : searchParams.companyId;

  let leaveTypes: LeaveTypeRow[] = [];
  let errorMessage: string | null = null;

  if (companyId) {
    try {
      leaveTypes = await fetchLeaveTypes(companyId);
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Erreur de chargement";
    }
  }

  async function submitRequest(formData: FormData) {
    "use server";

    const companyIdValue = formData.get("companyId");
    const employeeId = formData.get("employeeId");
    const leaveTypeId = formData.get("leaveTypeId");
    const leaveDate = formData.get("leaveDate");
    const reason = formData.get("reason");

    if (
      typeof companyIdValue !== "string" ||
      typeof employeeId !== "string" ||
      typeof leaveTypeId !== "string" ||
      typeof leaveDate !== "string"
    ) {
      return;
    }

    const supabase = createServiceRoleClient();
    const requestId = randomUUID();

    await supabase.from("leave_requests").insert({
      id: requestId,
      company_id: companyIdValue,
      employee_id: employeeId,
      leave_type_id: leaveTypeId,
      status: "pending",
      reason: typeof reason === "string" && reason.trim() ? reason.trim() : null,
      requested_days: 1,
      created_by: employeeId,
      submitted_at: new Date().toISOString()
    });

    await supabase.from("leave_request_days").insert({
      company_id: companyIdValue,
      leave_request_id: requestId,
      leave_date: leaveDate,
      duration_days: 1,
      day_part: "FULL_DAY"
    });

    revalidatePath("/requests");
    revalidatePath("/approvals");
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Nouvelle demande de congé</h2>
        <p className="page-subtitle">Création réelle en base Supabase (mode opérationnel).</p>
      </div>

      {!companyId ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            Renseignez <code>companyId</code> dans l’URL pour créer une demande réelle.
          </p>
        </Card>
      ) : null}

      {errorMessage ? (
        <Card>
          <p className="text-sm text-red-600">Erreur: {errorMessage}</p>
        </Card>
      ) : null}

      <Card>
        <CardTitle>Formulaire de demande</CardTitle>

        <form action={submitRequest} className="mt-4 grid gap-3">
          <input type="hidden" name="companyId" value={companyId ?? ""} />

          <label className="grid gap-1 text-sm">
            Employee ID
            <input name="employeeId" required className="rounded-md border bg-card px-3 py-2" placeholder="UUID employé" />
          </label>

          <label className="grid gap-1 text-sm">
            Type de congé
            <select name="leaveTypeId" required className="rounded-md border bg-card px-3 py-2">
              <option value="">Sélectionner</option>
              {leaveTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label} ({type.code})
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            Date
            <input type="date" name="leaveDate" required className="rounded-md border bg-card px-3 py-2" />
          </label>

          <label className="grid gap-1 text-sm">
            Motif
            <textarea name="reason" className="rounded-md border bg-card px-3 py-2" rows={3} />
          </label>

          <button type="submit" className="w-fit rounded-md border px-4 py-2 text-sm font-medium">
            Envoyer la demande
          </button>
        </form>
      </Card>
    </section>
  );
}
