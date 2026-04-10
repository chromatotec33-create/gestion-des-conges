import { DomainError } from "@/domain/errors/domain-error";
import { getAuthenticatedUserFromBearerToken } from "@/infrastructure/auth/authenticated-user";
import { createLeaveServices } from "@/features/leave/service-factory";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";
import { resolveDefaultCompanyId } from "@/lib/default-company";
import { NextResponse } from "next/server";

async function findEmployeeIdForUser(userId: string): Promise<{ companyId: string; employeeId: string } | null> {
  const supabase = createServiceRoleClient();
  const companyId = await resolveDefaultCompanyId();

  const { data, error } = await supabase
    .from("employees")
    .select("id")
    .eq("company_id", companyId)
    .eq("user_id", userId)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new DomainError("Failed to resolve employee for user", "EMPLOYEE_RESOLUTION_FAILED", { cause: error.message });
  }

  return data?.id ? { companyId, employeeId: data.id } : null;
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthenticatedUserFromBearerToken(request.headers.get("authorization"));
    const payload = (await request.json()) as {
      leaveTypeId: string;
      reason?: string;
      days: Array<{ leaveDate: string; dayPart: "FULL_DAY" | "AM" | "PM"; durationDays: number }>;
    };

    const employee = await findEmployeeIdForUser(authUser.userId);

    if (!employee) {
      throw new DomainError("Authenticated user is not linked to an employee", "EMPLOYEE_NOT_LINKED");
    }

    const { submitLeaveRequestService } = createLeaveServices();
    const leaveRequest = await submitLeaveRequestService.execute({
      companyId: employee.companyId,
      employeeId: employee.employeeId,
      leaveTypeId: payload.leaveTypeId,
      reason: payload.reason,
      days: payload.days,
      createdByUserId: authUser.userId
    });

    return NextResponse.json({ id: leaveRequest.id, status: leaveRequest.props.status, requestedDays: leaveRequest.props.requestedDays }, { status: 201 });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ code: error.code, message: error.message, details: error.details }, { status: 400 });
    }

    return NextResponse.json({ code: "UNEXPECTED_ERROR", message: "Unexpected server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const authUser = await getAuthenticatedUserFromBearerToken(request.headers.get("authorization"));
    const { searchParams } = new URL(request.url);
    const limitValue = searchParams.get("limit");

    const parsedLimit = limitValue ? Number.parseInt(limitValue, 10) : 20;
    const limit = Number.isNaN(parsedLimit) || parsedLimit <= 0 ? 20 : Math.min(parsedLimit, 100);

    const employee = await findEmployeeIdForUser(authUser.userId);

    if (!employee) {
      throw new DomainError("Authenticated user is not linked to an employee", "EMPLOYEE_NOT_LINKED");
    }

    const { leaveRequestRepository } = createLeaveServices();
    const requests = await leaveRequestRepository.findByEmployeeId(employee.companyId, employee.employeeId, limit);

    return NextResponse.json({
      items: requests.map((leaveRequest) => ({
        id: leaveRequest.id,
        employeeId: leaveRequest.props.employeeId,
        leaveTypeId: leaveRequest.props.leaveTypeId,
        status: leaveRequest.props.status,
        reason: leaveRequest.props.reason,
        requestedDays: leaveRequest.props.requestedDays,
        createdAt: leaveRequest.props.createdAt.toISOString(),
        days: leaveRequest.props.days.map((day) => ({ leaveDate: day.leaveDate.toISOString().slice(0, 10), durationDays: day.durationDays, dayPart: day.dayPart }))
      }))
    });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ code: error.code, message: error.message, details: error.details }, { status: 400 });
    }

    return NextResponse.json({ code: "UNEXPECTED_ERROR", message: "Unexpected server error" }, { status: 500 });
  }
}
