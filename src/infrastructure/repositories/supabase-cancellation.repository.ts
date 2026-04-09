import type { LeaveCancellation } from "@/domain/entities/leave-cancellation";
import { DomainError } from "@/domain/errors/domain-error";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";
import type { CancellationRepository } from "@/repositories/interfaces/cancellation.repository";

export class SupabaseCancellationRepository implements CancellationRepository {
  async create(cancellation: LeaveCancellation): Promise<void> {
    const supabase = createServiceRoleClient();

    const { error } = await supabase.from("leave_cancellations").insert({
      company_id: cancellation.props.companyId,
      leave_request_id: cancellation.props.leaveRequestId,
      initiated_by_user_id: cancellation.props.initiatedByUserId,
      initiated_by_role: cancellation.props.initiatedByRole,
      reason: cancellation.props.reason,
      restore_days: cancellation.props.restoreDays,
      less_than_30_days_warning: cancellation.props.lessThan30DaysWarning,
      reinforced_justification: cancellation.props.reinforcedJustification,
      employer_initiated: cancellation.props.initiatedByRole !== "employee",
      status: "pending"
    });

    if (error) {
      throw new DomainError("Failed to create cancellation request", "REPOSITORY_CANCELLATION_CREATE_FAILED", {
        cause: error.message
      });
    }
  }
}
