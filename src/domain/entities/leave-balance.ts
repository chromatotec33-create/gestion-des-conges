import { DomainError } from "@/domain/errors/domain-error";
import type { UUID } from "@/types/common";

export type LeaveBalanceProps = {
  readonly id: UUID;
  readonly companyId: UUID;
  readonly employeeId: UUID;
  readonly leaveTypeId: UUID;
  readonly acquiredDays: number;
  readonly consumedDays: number;
  readonly reservedDays: number;
  readonly expiredDays: number;
  readonly carryOverDays: number;
  readonly currentBalanceDays: number;
};

export class LeaveBalance {
  constructor(readonly props: LeaveBalanceProps) {}

  get availableDays(): number {
    return this.props.currentBalanceDays - this.props.reservedDays;
  }

  assertCanReserve(days: number): void {
    if (days <= 0) {
      throw new DomainError("Requested days must be positive", "INVALID_LEAVE_DURATION");
    }

    if (this.availableDays < days) {
      throw new DomainError("Insufficient leave balance", "INSUFFICIENT_BALANCE", {
        requested: days,
        available: this.availableDays
      });
    }
  }
}
