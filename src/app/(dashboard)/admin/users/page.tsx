import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

const users = [
  { email: "admin@admin.com", role: "super_admin", company: "Global", active: "Oui" },
  { email: "hr@chromatotec.fr", role: "hr", company: "Chromatotec", active: "Oui" },
  { email: "manager@airmotec.fr", role: "manager", company: "Airmotec", active: "Oui" }
];

export default function AdminUsersPage() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Rôles & permissions</h2>
          <p className="page-subtitle">Administration des accès, sociétés et activation comptes.</p>
        </div>
        <Button>Inviter un utilisateur</Button>
      </div>

      <Card>
        <CardTitle>Utilisateurs</CardTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2">Email</th>
                <th>Rôle</th>
                <th>Société</th>
                <th>Actif</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.email} className="border-t">
                  <td className="py-3">{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.company}</td>
                  <td>{user.active}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
