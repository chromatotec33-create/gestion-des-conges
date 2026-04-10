import { Card, CardTitle } from "@/components/ui/card";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";

type TeamsSearchParams = {
  companyId?: string;
};

type TeamRow = {
  id: string;
  name: string;
  code: string;
};

type TeamMemberRow = {
  team_id: string | null;
};

type TeamManagerRow = {
  team_id: string | null;
  manager_employee_id: string | null;
  manager: {
    users: {
      first_name: string | null;
      last_name: string | null;
      email: string;
    } | null;
  } | null;
};

async function fetchTeamsOverview(companyId: string) {
  const supabase = createServiceRoleClient();

  const [{ data: teams, error: teamsError }, { data: members, error: membersError }, { data: managers, error: managersError }] =
    await Promise.all([
      supabase.from("teams").select("id, name, code").eq("company_id", companyId).order("name", { ascending: true }).returns<TeamRow[]>(),
      supabase
        .from("employees")
        .select("team_id")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .not("team_id", "is", null)
        .limit(5000)
        .returns<TeamMemberRow[]>(),
      supabase
        .from("employees")
        .select("team_id, manager_employee_id, manager:manager_employee_id(users(first_name, last_name, email))")
        .eq("company_id", companyId)
        .not("team_id", "is", null)
        .not("manager_employee_id", "is", null)
        .limit(200)
        .returns<TeamManagerRow[]>()
    ]);

  if (teamsError) throw new Error(teamsError.message);
  if (membersError) throw new Error(membersError.message);
  if (managersError) throw new Error(managersError.message);

  const memberCountByTeam = new Map<string, number>();
  for (const row of members ?? []) {
    if (!row.team_id) continue;
    memberCountByTeam.set(row.team_id, (memberCountByTeam.get(row.team_id) ?? 0) + 1);
  }
  const managerByTeam = new Map<string, string>();

  for (const row of managers ?? []) {
    if (!row.team_id || managerByTeam.has(row.team_id)) continue;
    const manager = row.manager?.users;
    const label = `${manager?.first_name ?? ""} ${manager?.last_name ?? ""}`.trim() || manager?.email || "-";
    managerByTeam.set(row.team_id, label);
  }

  return (teams ?? []).map((team) => ({
    ...team,
    activeMembers: memberCountByTeam.get(team.id) ?? 0,
    manager: managerByTeam.get(team.id) ?? "-"
  }));
}

export default async function TeamsPage({ searchParams }: { searchParams: TeamsSearchParams }) {
  const companyId = searchParams.companyId;
  let teams: Array<TeamRow & { activeMembers: number; manager: string }> = [];
  let errorMessage: string | null = null;

  if (companyId) {
    try {
      teams = await fetchTeamsOverview(companyId);
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Erreur de chargement";
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Gestion équipes</h2>
        <p className="page-subtitle">Capacité, managers et composition des équipes.</p>
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
            <p className="mt-1 text-sm text-muted-foreground">Manager: {team.manager}</p>
            <p className="mt-2 text-sm font-semibold">Membres actifs: {team.activeMembers}</p>
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
