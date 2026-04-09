import { DomainError } from "@/domain/errors/domain-error";
import type { LeaveRequestStatus } from "@/types/leave";
import type { UUID } from "@/types/common";

export type LeaveRequestDayDetail = {
  readonly leaveDate: Date;
  readonly durationDays: number;
  readonly dayPart: "FULL_DAY" | "AM" | "PM";
};

export type LeaveRequestProps = {
  readonly id: UUID;
  readonly companyId: UUID;
  readonly employeeId: UUID;
  readonly leaveTypeId: UUID;
  readonly status: LeaveRequestStatus;
  readonly reason: string | null;
  readonly requestedDays: number;
  readonly days: LeaveRequestDayDetail[];
  readonly createdBy: UUID;
  readonly createdAt: Date;
};

export class LeaveRequest {
  constructor(readonly props: LeaveRequestProps) {
    if (props.days.length === 0) {
      throw new DomainError("At least one day must be provided", "EMPTY_LEAVE_REQUEST_DAYS");
    }
  }

  get id(): UUID {
    return this.props.id;
  }

  canBeSubmitted(): boolean {
    return this.props.status === "draft";
  }

  submit(): LeaveRequest {
    if (!this.canBeSubmitted()) {
      throw new DomainError("Leave request cannot be submitted from current status", "INVALID_STATUS_TRANSITION", {
        from: this.props.status,
        to: "pending"
      });
    }

    return new LeaveRequest({
      ...this.props,
      status: "pending"
    });
  }

  canBeCancelledByEmployer(now: Date): { allowed: boolean; warningLessThan30Days: boolean; reason?: string } {
    const sortedDates = this.props.days.map((d) => d.leaveDate).sort((a, b) => a.getTime() - b.getTime());
    const firstDate = sortedDates[0];

    if (!firstDate) {
      return {
        allowed: false,
        warningLessThan30Days: false,
        reason: "Aucune date de congé trouvée"
      };
    }

    const daysUntilStart = Math.ceil((firstDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      allowed: this.props.status === "approved" || this.props.status === "pending",
      warningLessThan30Days: daysUntilStart < 30
    };
  }
}
