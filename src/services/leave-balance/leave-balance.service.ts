import { DomainError } from "@/domain/errors/domain-error";
import type { LeaveBalance } from "@/domain/entities/leave-balance";
import type { LeaveBalanceRepository } from "@/repositories/interfaces/leave-balance.repository";
import type { UUID } from "@/types/common";

export class LeaveBalanceService {
  constructor(private readonly leaveBalanceRepository: LeaveBalanceRepository) {}

  async assertAndReserve(companyId: UUID, employeeId: UUID, leaveTypeId: UUID, requestedDays: number): Promise<LeaveBalance> {
    const balance = await this.leaveBalanceRepository.findCurrent(companyId, employeeId, leaveTypeId);

    if (!balance) {
      throw new DomainError("Leave balance not found", "LEAVE_BALANCE_NOT_FOUND", {
        companyId,
        employeeId,
        leaveTypeId
      });
    }

    balance.assertCanReserve(requestedDays);
    await this.leaveBalanceRepository.reserveDays(balance.props.id, requestedDays);

    return balance;
  }

  async restoreReservation(balanceId: UUID, days: number): Promise<void> {
    if (days <= 0) {
      throw new DomainError("Days to restore must be positive", "INVALID_RESTORATION_DAYS", { days });
    }

    await this.leaveBalanceRepository.restoreReservedDays(balanceId, days);
  }
}
