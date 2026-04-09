"use client";

import { useQuery } from "@tanstack/react-query";
import type { DashboardMetrics, PendingApprovalItem } from "@/features/dashboard/types/dashboard.types";

async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  return {
    pendingApprovals: 7,
    upcomingAbsences: 14,
    teamAbsenceRate: 8.6,
    employeesOnLeaveToday: 5
  };
}

async function fetchPendingApprovals(): Promise<PendingApprovalItem[]> {
  return [
    {
      id: "REQ-2026-0182",
      employeeName: "Nadia Lemaitre",
      leaveType: "Congés payés N",
      fromDate: "2026-04-18",
      toDate: "2026-04-22",
      days: 3.5,
      status: "pending"
    },
    {
      id: "REQ-2026-0183",
      employeeName: "Thomas Rey",
      leaveType: "RTT",
      fromDate: "2026-04-25",
      toDate: "2026-04-25",
      days: 1,
      status: "pending"
    }
  ];
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ["dashboard", "metrics"],
    queryFn: fetchDashboardMetrics
  });
}

export function usePendingApprovals() {
  return useQuery({
    queryKey: ["dashboard", "pending-approvals"],
    queryFn: fetchPendingApprovals
  });
}
