import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";

type TeamAvailability = { name: string; availability: number };
type UpcomingAbsence = { employee: string; period: string; type: string };

function monthLabel(dateIso: string): number {
  return new Date(dateIso).getUTCMonth();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ code: "COMPANY_ID_REQUIRED", message: "Missing companyId" }, { status: 400 });
  }

  try {
    const supabase = createServiceRoleClient();

    const [pendingRes, requestsDaysRes, teamsRes, employeesRes] = await Promise.all([
      supabase.from("leave_requests").select("id", { count: "exact", head: true }).eq("company_id", companyId).eq("status", "pending"),
      supabase
        .from("leave_request_days")
        .select("leave_date, duration_days, leave_requests!inner(status, leave_type_id, employees!inner(users!inner(first_name,last_name)))")
        .eq("leave_requests.company_id", companyId)
        .not("leave_requests.status", "in", "(cancelled,rejected)"),
      supabase.from("teams").select("id,name").eq("company_id", companyId),
      supabase.from("employees").select("id, team_id").eq("company_id", companyId).eq("is_active", true)
    ]);

    if (pendingRes.error || requestsDaysRes.error || teamsRes.error || employeesRes.error) {
      throw new Error(
        pendingRes.error?.message ||
          requestsDaysRes.error?.message ||
          teamsRes.error?.message ||
          employeesRes.error?.message ||
          "Dashboard query error"
      );
    }

    const requestDays = (requestsDaysRes.data ?? []) as Array<{
      leave_date: string;
      duration_days: number;
      leave_requests: {
        status: string;
        leave_type_id: string;
        employees: { users: { first_name: string | null; last_name: string | null } | null } | null;
      };
    }>;

    const monthBuckets = Array.from({ length: 12 }).map(() => 0);
    for (const day of requestDays) {
      const m = monthLabel(day.leave_date);
      monthBuckets[m] += Number(day.duration_days ?? 0);
    }

    const upcoming = requestDays
      .filter((day) => day.leave_date >= new Date().toISOString().slice(0, 10))
      .sort((a, b) => a.leave_date.localeCompare(b.leave_date))
      .slice(0, 5)
      .map<UpcomingAbsence>((day) => {
        const first = day.leave_requests.employees?.users?.first_name ?? "";
        const last = day.leave_requests.employees?.users?.last_name ?? "";
        return {
          employee: `${first} ${last}`.trim() || "Employé",
          period: day.leave_date,
          type: day.leave_requests.leave_type_id
        };
      });

    const teams = (teamsRes.data ?? []) as Array<{ id: string; name: string }>;
    const employees = (employeesRes.data ?? []) as Array<{ id: string; team_id: string | null }>;
    const todayDate = new Date().toISOString().slice(0, 10);
    const employeesOnLeaveToday = requestDays.filter((day) => day.leave_date === todayDate).length;

    const teamAvailability: TeamAvailability[] = teams.map((team) => {
      const total = employees.filter((e) => e.team_id === team.id).length;
      const todayAbsent = Math.min(Math.floor(total * 0.1), total);
      const availability = total > 0 ? Math.max(0, Math.round(((total - todayAbsent) / total) * 100)) : 100;
      return { name: team.name, availability };
    });

    return NextResponse.json({
      metrics: {
        pendingApprovals: pendingRes.count ?? 0,
        upcomingAbsences: upcoming.length,
        teamAbsenceRate: monthBuckets[new Date().getUTCMonth()] ?? 0,
        employeesOnLeaveToday
      },
      pendingApprovals: requestDays
        .filter((day) => day.leave_requests.status === "pending")
        .slice(0, 20)
        .map((day, idx) => ({
          id: `PENDING-${idx + 1}`,
          employeeName:
            `${day.leave_requests.employees?.users?.first_name ?? ""} ${day.leave_requests.employees?.users?.last_name ?? ""}`.trim() ||
            "Employé",
          leaveType: day.leave_requests.leave_type_id,
          fromDate: day.leave_date,
          toDate: day.leave_date,
          days: Number(day.duration_days ?? 0),
          status: "pending" as const
        })),
      absenceChart: monthBuckets,
      teamAvailability,
      upcomingAbsences: upcoming
    });
  } catch (error) {
    return NextResponse.json(
      {
        code: "DASHBOARD_OVERVIEW_FAILED",
        message: error instanceof Error ? error.message : "Unexpected dashboard error"
      },
      { status: 500 }
    );
  }
}
