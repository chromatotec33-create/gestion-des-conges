import { DomainError } from "@/domain/errors/domain-error";
import { createLeaveServices } from "@/features/leave/service-factory";
import { getAuthenticatedUserFromBearerToken } from "@/infrastructure/auth/authenticated-user";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";
import { NextResponse } from "next/server";

async function resolveRoleForUser(companyId: string, userId: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("user_company_roles")
    .select("role")
    .eq("company_id", companyId)
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle<{ role: "employee" | "manager" | "hr" | "direction" | "super_admin" }>();

  if (error) {
    throw new DomainError("Failed to resolve role for user", "ROLE_RESOLUTION_FAILED", {
      cause: error.message
    });
  }

  return data?.role ?? "employee";
}

export async function POST(request: Request, context: { params: { id: string } }) {
  try {
    const authUser = await getAuthenticatedUserFromBearerToken(request.headers.get("authorization"));
    const body = (await request.json()) as {
      companyId: string;
      reason: string;
      restoreDays?: boolean;
      reinforcedJustification?: string;
    };

    const role = await resolveRoleForUser(body.companyId, authUser.userId);
    const { cancelLeaveRequestService } = createLeaveServices();

    await cancelLeaveRequestService.execute({
      companyId: body.companyId,
      leaveRequestId: context.params.id,
      initiatedByUserId: authUser.userId,
      initiatedByRole: role,
      reason: body.reason,
      restoreDays: body.restoreDays ?? true,
      reinforcedJustification: body.reinforcedJustification
    });

    return NextResponse.json({ success: true }, { status: 200 });
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
