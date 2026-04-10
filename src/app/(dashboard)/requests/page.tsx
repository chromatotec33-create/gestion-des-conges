import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

const requests = [
  { id: "REQ-1001", type: "CP N", period: "14/04 - 18/04", status: "Approuvé" },
  { id: "REQ-1002", type: "RTT", period: "25/04", status: "En attente" }
];

export default function RequestsPage() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Mes demandes</h2>
          <p className="page-subtitle">Historique et suivi de vos demandes de congé.</p>
        </div>
        <Button>Nouvelle demande</Button>
      </div>
      <Card>
        <CardTitle>Demandes récentes</CardTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2">ID</th>
                <th className="py-2">Type</th>
                <th className="py-2">Période</th>
                <th className="py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="border-t">
                  <td className="py-3">{request.id}</td>
                  <td>{request.type}</td>
                  <td>{request.period}</td>
                  <td>{request.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
