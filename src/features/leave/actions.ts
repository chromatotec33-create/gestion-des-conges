"use server";

import { DomainError } from "@/domain/errors/domain-error";
import { createLeaveServices } from "@/features/leave/service-factory";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";
import { cancelLeaveRequestSchema, createLeaveRequestSchema } from "@/validators/leave-request.validator";

async function findEmployeeId(companyId: string, userId: string): Promise<string | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("employees")
    .select("id")
    .eq("company_id", companyId)
    .eq("user_id", userId)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new DomainError("Unable to resolve employee", "ACTION_EMPLOYEE_RESOLUTION_FAILED", { cause: error.message });
  }

  return data?.id ?? null;
}

export async function submitLeaveRequestAction(input: {
  readonly companyId: string;
  readonly leaveTypeId: string;
  readonly reason?: string;
  readonly days: Array<{ leaveDate: string; dayPart: "FULL_DAY" | "AM" | "PM"; durationDays: number }>;
  readonly userId: string;
}) {
  const employeeId = await findEmployeeId(input.companyId, input.userId);

  if (!employeeId) {
    throw new DomainError("No employee linked to the authenticated user for this company", "ACTION_EMPLOYEE_NOT_FOUND");
  }

  const payload = createLeaveRequestSchema.parse({
    companyId: input.companyId,
    employeeId,
    leaveTypeId: input.leaveTypeId,
    reason: input.reason,
    days: input.days,
    createdByUserId: input.userId
  });

  const { submitLeaveRequestService } = createLeaveServices();

  return submitLeaveRequestService.execute(payload);
}

export async function cancelLeaveRequestAction(input: {
  readonly companyId: string;
  readonly leaveRequestId: string;
  readonly reason: string;
  readonly restoreDays: boolean;
  readonly initiatedByRole: "employee" | "manager" | "hr" | "direction" | "super_admin";
  readonly userId: string;
  readonly reinforcedJustification?: string;
}) {
  const payload = cancelLeaveRequestSchema.parse({
    companyId: input.companyId,
    leaveRequestId: input.leaveRequestId,
    initiatedByUserId: input.userId,
    initiatedByRole: input.initiatedByRole,
    reason: input.reason,
    restoreDays: input.restoreDays,
    reinforcedJustification: input.reinforcedJustification
  });

  const { cancelLeaveRequestService } = createLeaveServices();
  await cancelLeaveRequestService.execute({ ...payload, reinforcedJustification: input.reinforcedJustification });
}
