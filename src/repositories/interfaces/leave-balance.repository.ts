import type { LeaveBalance } from "@/domain/entities/leave-balance";
import type { UUID } from "@/types/common";

export interface LeaveBalanceRepository {
  findCurrent(companyId: UUID, employeeId: UUID, leaveTypeId: UUID): Promise<LeaveBalance | null>;
  reserveDays(balanceId: UUID, days: number): Promise<void>;
  restoreReservedDays(balanceId: UUID, days: number): Promise<void>;
}
