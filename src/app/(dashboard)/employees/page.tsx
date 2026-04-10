import { Card, CardTitle } from "@/components/ui/card";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";

type SearchParams = { companyId?: string };

type EmployeeRow = {
  id: string;
  employee_number: string;
  is_active: boolean;
  teams: { name: string | null } | null;
  users: { first_name: string | null; last_name: string | null; email: string | null } | null;
};

function employeeName(row: EmployeeRow): string {
  const first = row.users?.first_name ?? "";
  const last = row.users?.last_name ?? "";
  const full = `${first} ${last}`.trim();
  return full || row.users?.email || row.employee_number;
}

async function fetchEmployees(companyId: string): Promise<EmployeeRow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("employees")
    .select("id, employee_number, is_active, teams(name), users(first_name, last_name, email)")
    .eq("company_id", companyId)
    .order("employee_number", { ascending: true })
    .limit(100)
    .returns<EmployeeRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export default async function EmployeesPage({ searchParams }: { searchParams: SearchParams }) {
  const companyId = searchParams.companyId;
  let employees: EmployeeRow[] = [];
  let errorMessage: string | null = null;

  if (companyId) {
    try {
      employees = await fetchEmployees(companyId);
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Erreur de chargement";
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Gestion employés</h2>
        <p className="page-subtitle">Annuaire RH et état des comptes utilisateurs (données Supabase).</p>
      </div>

      {!companyId ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            Renseignez <code>companyId</code> dans l’URL pour charger les employés réels.
          </p>
        </Card>
      ) : null}

      {errorMessage ? (
        <Card>
          <p className="text-sm text-red-600">Erreur: {errorMessage}</p>
        </Card>
      ) : null}

      <Card>
        <CardTitle>Liste des employés</CardTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2">Nom</th>
                <th>Matricule</th>
                <th>Équipe</th>
                <th>Actif</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-t">
                  <td className="py-3">{employeeName(employee)}</td>
                  <td>{employee.employee_number}</td>
                  <td>{employee.teams?.name ?? "-"}</td>
                  <td>{employee.is_active ? "Oui" : "Non"}</td>
                </tr>
              ))}
              {companyId && employees.length === 0 ? (
                <tr className="border-t">
                  <td colSpan={4} className="py-4 text-sm text-muted-foreground">
                    Aucun employé trouvé pour cette société.
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
