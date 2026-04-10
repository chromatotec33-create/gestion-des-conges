import { Card, CardTitle } from "@/components/ui/card";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";

type SearchParams = { companyId?: string };

type TeamRow = {
  id: string;
  code: string;
  name: string;
  staffing_rules: Array<{ minimum_staffing_ratio: number | null }>;
};

async function fetchTeams(companyId: string): Promise<TeamRow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("teams")
    .select("id, code, name, staffing_rules(minimum_staffing_ratio)")
    .eq("company_id", companyId)
    .order("name", { ascending: true })
    .limit(100)
    .returns<TeamRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

function staffingLabel(team: TeamRow): string {
  const ratio = team.staffing_rules?.[0]?.minimum_staffing_ratio;
  if (ratio == null) {
    return "Non défini";
  }

  return `${Math.round(ratio * 100)}%`;
}

export default async function TeamsPage({ searchParams }: { searchParams: SearchParams }) {
  const companyId = searchParams.companyId;
  let teams: TeamRow[] = [];
  let errorMessage: string | null = null;

  if (companyId) {
    try {
      teams = await fetchTeams(companyId);
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Erreur de chargement";
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Gestion équipes</h2>
        <p className="page-subtitle">Capacité et règles de staffing (données Supabase).</p>
      </div>

      {!companyId ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            Renseignez <code>companyId</code> dans l’URL pour charger les équipes réelles.
          </p>
        </Card>
      ) : null}

      {errorMessage ? (
        <Card>
          <p className="text-sm text-red-600">Erreur: {errorMessage}</p>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardTitle>{team.name}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">Code: {team.code}</p>
            <p className="mt-1 text-sm font-semibold">Staffing minimum: {staffingLabel(team)}</p>
          </Card>
        ))}

        {companyId && teams.length === 0 ? (
          <Card>
            <p className="text-sm text-muted-foreground">Aucune équipe trouvée pour cette société.</p>
          </Card>
        ) : null}
      </div>
    </section>
  );
}
