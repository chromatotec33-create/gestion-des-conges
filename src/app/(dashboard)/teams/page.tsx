import { Card, CardTitle } from "@/components/ui/card";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";
import { resolveDefaultCompanyId } from "@/lib/default-company";

type TeamRow = { id: string; name: string; code: string };
type TeamMemberRow = { team_id: string | null };

async function fetchTeamsOverview() {
  const supabase = createServiceRoleClient();
  const companyId = await resolveDefaultCompanyId();

  const [{ data: teams, error: teamsError }, { data: members, error: membersError }] = await Promise.all([
    supabase.from("teams").select("id, name, code").eq("company_id", companyId).order("name", { ascending: true }).returns<TeamRow[]>(),
    supabase.from("employees").select("team_id").eq("company_id", companyId).eq("is_active", true).not("team_id", "is", null).returns<TeamMemberRow[]>()
  ]);

  if (teamsError || membersError) throw new Error(teamsError?.message ?? membersError?.message ?? "Erreur de chargement");

  const memberCountByTeam = new Map<string, number>();
  for (const row of members ?? []) {
    if (!row.team_id) continue;
    memberCountByTeam.set(row.team_id, (memberCountByTeam.get(row.team_id) ?? 0) + 1);
  }

  return (teams ?? []).map((team) => ({ ...team, activeMembers: memberCountByTeam.get(team.id) ?? 0 }));
}

export default async function TeamsPage() {
  let teams: Array<TeamRow & { activeMembers: number }> = [];
  let errorMessage: string | null = null;

  try {
    teams = await fetchTeamsOverview();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Erreur de chargement";
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Gestion équipes</h2>
        <p className="page-subtitle">Capacité et composition des équipes.</p>
      </div>

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
            <p className="mt-2 text-sm font-semibold">Membres actifs: {team.activeMembers}</p>
          </Card>
        ))}

        {teams.length === 0 ? (
          <Card>
            <p className="text-sm text-muted-foreground">Aucune équipe trouvée.</p>
          </Card>
        ) : null}
      </div>
    </section>
  );
}
