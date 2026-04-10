import { DomainError } from "@/domain/errors/domain-error";
import { getAuthenticatedUserFromBearerToken } from "@/infrastructure/auth/authenticated-user";
import { createLeaveServices } from "@/features/leave/service-factory";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";
import { NextResponse } from "next/server";

async function findEmployeeIdForUser(companyId: string, userId: string): Promise<string | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("employees")
    .select("id")
    .eq("company_id", companyId)
    .eq("user_id", userId)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new DomainError("Failed to resolve employee for user", "EMPLOYEE_RESOLUTION_FAILED", { cause: error.message });
  }

  return data?.id ?? null;
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthenticatedUserFromBearerToken(request.headers.get("authorization"));
    const payload = (await request.json()) as {
      companyId: string;
      leaveTypeId: string;
      reason?: string;
      days: Array<{ leaveDate: string; dayPart: "FULL_DAY" | "AM" | "PM"; durationDays: number }>;
    };

    const employeeId = await findEmployeeIdForUser(payload.companyId, authUser.userId);

    if (!employeeId) {
      throw new DomainError("Authenticated user is not linked to an employee for this company", "EMPLOYEE_NOT_LINKED");
    }

    const { submitLeaveRequestService } = createLeaveServices();
    const leaveRequest = await submitLeaveRequestService.execute({
      companyId: payload.companyId,
      employeeId,
      leaveTypeId: payload.leaveTypeId,
      reason: payload.reason,
      days: payload.days,
      createdByUserId: authUser.userId
    });

    return NextResponse.json(
      {
        id: leaveRequest.id,
        status: leaveRequest.props.status,
        requestedDays: leaveRequest.props.requestedDays
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json(
        {
          code: error.code,
          message: error.message,
          details: error.details
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ code: "UNEXPECTED_ERROR", message: "Unexpected server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const authUser = await getAuthenticatedUserFromBearerToken(request.headers.get("authorization"));
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const limitValue = searchParams.get("limit");

    if (!companyId) {
      throw new DomainError("Missing companyId query parameter", "COMPANY_ID_REQUIRED");
    }

    const parsedLimit = limitValue ? Number.parseInt(limitValue, 10) : 20;
    const limit = Number.isNaN(parsedLimit) || parsedLimit <= 0 ? 20 : Math.min(parsedLimit, 100);

    const employeeId = await findEmployeeIdForUser(companyId, authUser.userId);

    if (!employeeId) {
      throw new DomainError("Authenticated user is not linked to an employee for this company", "EMPLOYEE_NOT_LINKED");
    }

    const { leaveRequestRepository } = createLeaveServices();
    const requests = await leaveRequestRepository.findByEmployeeId(companyId, employeeId, limit);

    return NextResponse.json({
      items: requests.map((leaveRequest) => ({
        id: leaveRequest.id,
        companyId: leaveRequest.props.companyId,
        employeeId: leaveRequest.props.employeeId,
        leaveTypeId: leaveRequest.props.leaveTypeId,
        status: leaveRequest.props.status,
        reason: leaveRequest.props.reason,
        requestedDays: leaveRequest.props.requestedDays,
        createdAt: leaveRequest.props.createdAt.toISOString(),
        days: leaveRequest.props.days.map((day) => ({
          leaveDate: day.leaveDate.toISOString().slice(0, 10),
          durationDays: day.durationDays,
          dayPart: day.dayPart
        }))
      }))
    });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json(
        {
          code: error.code,
          message: error.message,
          details: error.details
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ code: "UNEXPECTED_ERROR", message: "Unexpected server error" }, { status: 500 });
  }
}
