"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  DashboardMetrics,
  PendingApprovalItem,
  TeamAvailabilityItem,
  UpcomingAbsenceItem
} from "@/features/dashboard/types/dashboard.types";

type DashboardOverviewResponse = {
  metrics: DashboardMetrics;
  pendingApprovals: PendingApprovalItem[];
  absenceChart: number[];
  teamAvailability: TeamAvailabilityItem[];
  upcomingAbsences: UpcomingAbsenceItem[];
};

function getCompanyIdFromUrl(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return new URLSearchParams(window.location.search).get("companyId");
}

async function fetchDashboardOverview(): Promise<DashboardOverviewResponse> {
  const companyId = getCompanyIdFromUrl();

  if (!companyId) {
    return {
      metrics: {
        pendingApprovals: 0,
        upcomingAbsences: 0,
        teamAbsenceRate: 0,
        employeesOnLeaveToday: 0
      },
      pendingApprovals: [],
      absenceChart: Array.from({ length: 12 }).map(() => 0),
      teamAvailability: [],
      upcomingAbsences: []
    };
  }

  const response = await fetch(`/api/dashboard/overview?companyId=${encodeURIComponent(companyId)}`, {
    method: "GET",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Dashboard API error (${response.status})`);
  }

  return (await response.json()) as DashboardOverviewResponse;
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard", "overview", typeof window === "undefined" ? "server" : window.location.search],
    queryFn: fetchDashboardOverview
  });
}

export function useDashboardMetrics() {
  const query = useDashboardOverview();

  return useMemo(
    () => ({
      ...query,
      data: query.data?.metrics
    }),
    [query]
  );
}

export function usePendingApprovals() {
  const query = useDashboardOverview();

  return useMemo(
    () => ({
      ...query,
      data: query.data?.pendingApprovals ?? []
    }),
    [query]
  );
}

export function useAbsenceChartData() {
  const query = useDashboardOverview();

  return useMemo(
    () => ({
      ...query,
      data: query.data?.absenceChart ?? []
    }),
    [query]
  );
}

export function useTeamAvailability() {
  const query = useDashboardOverview();

  return useMemo(
    () => ({
      ...query,
      data: query.data?.teamAvailability ?? []
    }),
    [query]
  );
}

export function useUpcomingAbsences() {
  const query = useDashboardOverview();

  return useMemo(
    () => ({
      ...query,
      data: query.data?.upcomingAbsences ?? []
    }),
    [query]
  );
}
