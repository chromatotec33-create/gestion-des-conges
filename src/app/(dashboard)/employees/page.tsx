import { Card, CardTitle } from "@/components/ui/card";

const employees = [
  { name: "Sophie Martin", role: "Manager", team: "Production", active: "Oui" },
  { name: "Luc Durand", role: "Employee", team: "R&D", active: "Oui" },
  { name: "Claire Petit", role: "HR", team: "RH", active: "Oui" }
];

export default function EmployeesPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Gestion employés</h2>
        <p className="page-subtitle">Annuaire RH et état des comptes utilisateurs.</p>
      </div>
      <Card>
        <CardTitle>Liste des employés</CardTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2">Nom</th>
                <th>Rôle</th>
                <th>Équipe</th>
                <th>Actif</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.name} className="border-t">
                  <td className="py-3">{employee.name}</td>
                  <td>{employee.role}</td>
                  <td>{employee.team}</td>
                  <td>{employee.active}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
