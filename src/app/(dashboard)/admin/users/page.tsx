"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

type UserRow = {
  readonly email: string;
  readonly role: string;
  readonly company: string;
  readonly active: string;
};

const initialUsers: UserRow[] = [
  { email: "admin@admin.com", role: "super_admin", company: "Global", active: "Oui" },
  { email: "hr@chromatotec.fr", role: "hr", company: "Chromatotec", active: "Oui" },
  { email: "manager@airmotec.fr", role: "manager", company: "Airmotec", active: "Oui" }
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");
  const [company, setCompany] = useState("Chromatotec");
  const [feedback, setFeedback] = useState<string | null>(null);

  const invite = () => {
    if (!email.includes("@")) {
      setFeedback("Veuillez saisir un email valide.");
      return;
    }

    setUsers((prev) => [...prev, { email, role, company, active: "Oui" }]);
    setFeedback(`Invitation créée pour ${email}.`);
    setEmail("");
    setRole("employee");
    setCompany("Chromatotec");
    setOpen(false);
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Rôles & permissions</h2>
          <p className="page-subtitle">Administration des accès, sociétés et activation comptes.</p>
        </div>
        <Button onClick={() => setOpen(true)}>Inviter un utilisateur</Button>
      </div>

      {feedback ? <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm">{feedback}</p> : null}

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

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-xl border bg-card p-5">
            <CardTitle>Inviter un utilisateur</CardTitle>
            <div className="mt-4 grid gap-3">
              <input
                className="rounded-md border bg-card px-3 py-2 text-sm"
                placeholder="email@entreprise.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <select className="rounded-md border bg-card px-3 py-2 text-sm" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="employee">Salarié</option>
                <option value="manager">Manager</option>
                <option value="hr">RH</option>
                <option value="direction">Direction</option>
              </select>
              <select
                className="rounded-md border bg-card px-3 py-2 text-sm"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              >
                <option>Chromatotec</option>
                <option>Airmotec</option>
                <option>JPA Technologies</option>
              </select>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button onClick={invite}>Envoyer l’invitation</Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
