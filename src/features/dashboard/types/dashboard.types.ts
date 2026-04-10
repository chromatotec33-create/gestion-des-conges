export type DashboardMetrics = {
  readonly pendingApprovals: number;
  readonly upcomingAbsences: number;
  readonly teamAbsenceRate: number;
  readonly employeesOnLeaveToday: number;
};

export type PendingApprovalItem = {
  readonly id: string;
  readonly employeeName: string;
  readonly leaveType: string;
  readonly fromDate: string;
  readonly toDate: string;
  readonly days: number;
  readonly status: "pending" | "approved" | "rejected";
};

export type TeamAvailabilityItem = {
  readonly name: string;
  readonly availability: number;
};

export type UpcomingAbsenceItem = {
  readonly employee: string;
  readonly period: string;
  readonly type: string;
};
