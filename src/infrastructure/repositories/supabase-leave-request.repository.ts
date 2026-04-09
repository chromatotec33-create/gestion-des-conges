import { LeaveRequest } from "@/domain/entities/leave-request";
import { DomainError } from "@/domain/errors/domain-error";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";
import type { LeaveRequestRepository } from "@/repositories/interfaces/leave-request.repository";
import type { UUID } from "@/types/common";

type LeaveRequestRow = {
  id: string;
  company_id: string;
  employee_id: string;
  leave_type_id: string;
  status: "draft" | "pending" | "approved" | "rejected" | "cancelled" | "withdrawn";
  reason: string | null;
  requested_days: number;
  created_by: string;
  created_at: string;
  leave_request_days: Array<{
    leave_date: string;
    duration_days: number;
    day_part: "FULL_DAY" | "AM" | "PM";
  }>;
};

function mapLeaveRequest(row: LeaveRequestRow): LeaveRequest {
  return new LeaveRequest({
    id: row.id,
    companyId: row.company_id,
    employeeId: row.employee_id,
    leaveTypeId: row.leave_type_id,
    status: row.status,
    reason: row.reason,
    requestedDays: row.requested_days,
    days: (row.leave_request_days ?? []).map((d) => ({
      leaveDate: new Date(d.leave_date),
      durationDays: d.duration_days,
      dayPart: d.day_part
    })),
    createdBy: row.created_by,
    createdAt: new Date(row.created_at)
  });
}

export class SupabaseLeaveRequestRepository implements LeaveRequestRepository {
  async create(request: LeaveRequest): Promise<LeaveRequest> {
    const supabase = createServiceRoleClient();

    const { error: requestError } = await supabase.from("leave_requests").insert({
      id: request.id,
      company_id: request.props.companyId,
      employee_id: request.props.employeeId,
      leave_type_id: request.props.leaveTypeId,
      status: request.props.status,
      reason: request.props.reason,
      requested_days: request.props.requestedDays,
      created_by: request.props.createdBy,
      submitted_at: new Date().toISOString()
    });

    if (requestError) {
      throw new DomainError("Failed to create leave request", "REPOSITORY_LEAVE_REQUEST_CREATE_FAILED", {
        cause: requestError.message
      });
    }

    const { error: daysError } = await supabase.from("leave_request_days").insert(
      request.props.days.map((day) => ({
        company_id: request.props.companyId,
        leave_request_id: request.id,
        leave_date: day.leaveDate.toISOString().slice(0, 10),
        duration_days: day.durationDays,
        day_part: day.dayPart
      }))
    );

    if (daysError) {
      throw new DomainError("Failed to create leave request days", "REPOSITORY_LEAVE_REQUEST_DAYS_CREATE_FAILED", {
        cause: daysError.message
      });
    }

    return request;
  }

  async findById(companyId: UUID, requestId: UUID): Promise<LeaveRequest | null> {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("leave_requests")
      .select(
        "id, company_id, employee_id, leave_type_id, status, reason, requested_days, created_by, created_at, leave_request_days(leave_date, duration_days, day_part)"
      )
      .eq("company_id", companyId)
      .eq("id", requestId)
      .maybeSingle<LeaveRequestRow>();

    if (error) {
      throw new DomainError("Failed to fetch leave request", "REPOSITORY_LEAVE_REQUEST_FETCH_FAILED", {
        cause: error.message
      });
    }

    return data ? mapLeaveRequest(data) : null;
  }

  async updateStatus(
    companyId: UUID,
    requestId: UUID,
    status: "pending" | "cancelled" | "approved" | "rejected"
  ): Promise<void> {
    const supabase = createServiceRoleClient();
    const { error } = await supabase
      .from("leave_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("company_id", companyId)
      .eq("id", requestId);

    if (error) {
      throw new DomainError("Failed to update leave request status", "REPOSITORY_LEAVE_REQUEST_STATUS_UPDATE_FAILED", {
        cause: error.message
      });
    }
  }
}
