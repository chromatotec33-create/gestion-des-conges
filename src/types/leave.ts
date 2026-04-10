import type { UUID } from "@/types/common";

export type LeaveRequestStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "withdrawn";

export type ApprovalDecision = "pending" | "approved" | "rejected" | "skipped";

export type DayPart = "FULL_DAY" | "AM" | "PM";

export type LeaveRequestDay = {
  readonly leaveDate: string;
  readonly dayPart: DayPart;
  readonly durationDays: number;
};

export type CreateLeaveRequestInput = {
  readonly companyId: UUID;
  readonly employeeId: UUID;
  readonly leaveTypeId: UUID;
  readonly reason?: string;
  readonly days: LeaveRequestDay[];
  readonly createdByUserId: UUID;
};

export type CancelLeaveRequestInput = {
  readonly companyId: UUID;
  readonly leaveRequestId: UUID;
  readonly initiatedByUserId: UUID;
  readonly initiatedByRole: "employee" | "manager" | "hr" | "direction" | "super_admin";
  readonly reason: string;
  readonly restoreDays: boolean;
};
