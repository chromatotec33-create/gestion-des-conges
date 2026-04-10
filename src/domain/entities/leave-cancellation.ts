import { DomainError } from "@/domain/errors/domain-error";
import type { UUID } from "@/types/common";

export type LeaveCancellationProps = {
  readonly companyId: UUID;
  readonly leaveRequestId: UUID;
  readonly initiatedByUserId: UUID;
  readonly initiatedByRole: "employee" | "manager" | "hr" | "direction" | "super_admin";
  readonly reason: string;
  readonly restoreDays: boolean;
  readonly lessThan30DaysWarning: boolean;
  readonly reinforcedJustification: string | null;
};

export class LeaveCancellation {
  constructor(readonly props: LeaveCancellationProps) {
    const trimmedReason = props.reason.trim();

    if (trimmedReason.length < 10) {
      throw new DomainError("Cancellation reason must contain at least 10 characters", "CANCELLATION_REASON_TOO_SHORT");
    }

    if (
      props.initiatedByRole !== "employee" &&
      props.lessThan30DaysWarning &&
      (!props.reinforcedJustification || props.reinforcedJustification.trim().length < 20)
    ) {
      throw new DomainError(
        "Reinforced justification is required for employer cancellation under 30 days",
        "REINFORCED_JUSTIFICATION_REQUIRED"
      );
    }
  }
}
