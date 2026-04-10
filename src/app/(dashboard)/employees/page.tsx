import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";
import { resolveDefaultCompanyId } from "@/lib/default-company";

type EmployeeRow = {
  id: string;
  employee_number: string;
  contract_type: string | null;
  is_active: boolean;
  users: { email: string; first_name: string | null; last_name: string | null } | null;
  teams: { name: string } | null;
  companies: { name: string } | null;
};

function fullName(user: EmployeeRow["users"]): string {
  if (!user) return "Utilisateur inconnu";
  const value = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
  return value || user.email;
}

async function fetchEmployees(): Promise<EmployeeRow[]> {
  const supabase = createServiceRoleClient();
  const companyId = await resolveDefaultCompanyId();

  const { data, error } = await supabase
    .from("employees")
    .select("id, employee_number, contract_type, is_active, users(email, first_name, last_name), teams(name), companies(name)")
    .eq("company_id", companyId)
    .order("employee_number", { ascending: true })
    .returns<EmployeeRow[]>();

  if (error) throw new Error(error.message);
  return data ?? [];
}

export default async function EmployeesPage() {
  let employees: EmployeeRow[] = [];
  let errorMessage: string | null = null;

  try {
    employees = await fetchEmployees();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Erreur de chargement";
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Collaborateurs</h2>
        <p className="page-subtitle">Référentiel unifié: règles globales + société affichée à titre informatif.</p>
      </div>

      {errorMessage ? (
        <Card>
          <p className="text-sm text-red-600">Erreur: {errorMessage}</p>
        </Card>
      ) : null}

      <Card>
        <CardTitle>Annuaire RH</CardTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Matricule</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Équipe</th>
                <th>Contrat</th>
                <th>Société</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <Link href={`/employees/${employee.id}`} className="text-primary hover:underline">
                      {employee.employee_number}
                    </Link>
                  </td>
                  <td>{fullName(employee.users)}</td>
                  <td>{employee.users?.email ?? "-"}</td>
                  <td>{employee.teams?.name ?? "-"}</td>
                  <td>{employee.contract_type ?? "-"}</td>
                  <td>{employee.companies?.name ?? "Chromatotec"}</td>
                  <td>{employee.is_active ? "Actif" : "Inactif"}</td>
                </tr>
              ))}
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-sm text-muted-foreground">
                    Aucun collaborateur trouvé.
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
