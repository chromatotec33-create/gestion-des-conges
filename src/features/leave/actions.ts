"use server";

import { DomainError } from "@/domain/errors/domain-error";
import { createLeaveServices } from "@/features/leave/service-factory";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";
import { resolveDefaultCompanyId } from "@/lib/default-company";
import { cancelLeaveRequestSchema, createLeaveRequestSchema } from "@/validators/leave-request.validator";

async function findEmployeeId(userId: string): Promise<{ companyId: string; employeeId: string } | null> {
  const supabase = createServiceRoleClient();
  const companyId = await resolveDefaultCompanyId();

  const { data, error } = await supabase.from("employees").select("id").eq("company_id", companyId).eq("user_id", userId).maybeSingle<{ id: string }>();

  if (error) {
    throw new DomainError("Unable to resolve employee", "ACTION_EMPLOYEE_RESOLUTION_FAILED", { cause: error.message });
  }

  return data?.id ? { companyId, employeeId: data.id } : null;
}

export async function submitLeaveRequestAction(input: {
  readonly leaveTypeId: string;
  readonly reason?: string;
  readonly days: Array<{ leaveDate: string; dayPart: "FULL_DAY" | "AM" | "PM"; durationDays: number }>;
  readonly userId: string;
}) {
  const employee = await findEmployeeId(input.userId);

  if (!employee) {
    throw new DomainError("No employee linked to the authenticated user", "ACTION_EMPLOYEE_NOT_FOUND");
  }

  const payload = createLeaveRequestSchema.parse({
    companyId: employee.companyId,
    employeeId: employee.employeeId,
    leaveTypeId: input.leaveTypeId,
    reason: input.reason,
    days: input.days,
    createdByUserId: input.userId
  });

  const { submitLeaveRequestService } = createLeaveServices();
  return submitLeaveRequestService.execute(payload);
}

export async function cancelLeaveRequestAction(input: {
  readonly leaveRequestId: string;
  readonly reason: string;
  readonly restoreDays: boolean;
  readonly initiatedByRole: "employee" | "manager" | "hr" | "direction" | "super_admin";
  readonly userId: string;
  readonly reinforcedJustification?: string;
}) {
  const employee = await findEmployeeId(input.userId);

  if (!employee) {
    throw new DomainError("No employee linked to the authenticated user", "ACTION_EMPLOYEE_NOT_FOUND");
  }

  const payload = cancelLeaveRequestSchema.parse({
    companyId: employee.companyId,
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
