import { Card } from "@/components/ui/card";
import { NewRequestForm } from "@/features/leave/components/new-request-form";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";
import { resolveDefaultCompanyId } from "@/lib/default-company";

type LeaveTypeOption = {
  id: string;
  code: string;
  label: string;
};

async function fetchLeaveTypes(): Promise<LeaveTypeOption[]> {
  const supabase = createServiceRoleClient();
  const companyId = await resolveDefaultCompanyId();

  const { data, error } = await supabase
    .from("leave_types")
    .select("id, code, label")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("code", { ascending: true })
    .returns<LeaveTypeOption[]>();

  if (error) throw new Error(error.message);
  return data ?? [];
}

export default async function NewRequestPage() {
  let leaveTypes: LeaveTypeOption[] = [];
  let errorMessage: string | null = null;

  try {
    leaveTypes = await fetchLeaveTypes();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Erreur de chargement";
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Poser un congé</h2>
        <p className="page-subtitle">Formulaire opérationnel connecté à Supabase.</p>
      </div>

      {errorMessage ? (
        <Card>
          <p className="text-sm text-red-600">Erreur: {errorMessage}</p>
        </Card>
      ) : (
        <NewRequestForm leaveTypes={leaveTypes} />
      )}
    </section>
  );
}
