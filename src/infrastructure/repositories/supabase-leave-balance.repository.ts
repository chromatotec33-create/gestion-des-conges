import { LeaveBalance } from "@/domain/entities/leave-balance";
import { DomainError } from "@/domain/errors/domain-error";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";
import type { LeaveBalanceRepository } from "@/repositories/interfaces/leave-balance.repository";
import type { UUID } from "@/types/common";

type LeaveBalanceRow = {
  id: string;
  company_id: string;
  employee_id: string;
  leave_type_id: string;
  acquired_days: number;
  consumed_days: number;
  reserved_days: number;
  expired_days: number;
  carry_over_days: number;
  current_balance_days: number;
};

function mapLeaveBalance(row: LeaveBalanceRow): LeaveBalance {
  return new LeaveBalance({
    id: row.id,
    companyId: row.company_id,
    employeeId: row.employee_id,
    leaveTypeId: row.leave_type_id,
    acquiredDays: row.acquired_days,
    consumedDays: row.consumed_days,
    reservedDays: row.reserved_days,
    expiredDays: row.expired_days,
    carryOverDays: row.carry_over_days,
    currentBalanceDays: row.current_balance_days
  });
}

export class SupabaseLeaveBalanceRepository implements LeaveBalanceRepository {
  async findCurrent(companyId: UUID, employeeId: UUID, leaveTypeId: UUID): Promise<LeaveBalance | null> {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("leave_balances")
      .select(
        "id, company_id, employee_id, leave_type_id, acquired_days, consumed_days, reserved_days, expired_days, carry_over_days, current_balance_days"
      )
      .eq("company_id", companyId)
      .eq("employee_id", employeeId)
      .eq("leave_type_id", leaveTypeId)
      .order("reference_period_end", { ascending: false })
      .limit(1)
      .maybeSingle<LeaveBalanceRow>();

    if (error) {
      throw new DomainError("Failed to fetch leave balance", "REPOSITORY_LEAVE_BALANCE_FETCH_FAILED", {
        cause: error.message
      });
    }

    return data ? mapLeaveBalance(data) : null;
  }

  async reserveDays(balanceId: UUID, days: number): Promise<void> {
    const supabase = createServiceRoleClient();

    const { data: current, error: fetchError } = await supabase
      .from("leave_balances")
      .select("reserved_days")
      .eq("id", balanceId)
      .single<{ reserved_days: number }>();

    if (fetchError) {
      throw new DomainError("Failed to fetch leave balance before reserve", "REPOSITORY_LEAVE_BALANCE_FETCH_BEFORE_RESERVE_FAILED", {
        cause: fetchError.message
      });
    }

    const { error } = await supabase
      .from("leave_balances")
      .update({ reserved_days: current.reserved_days + days })
      .eq("id", balanceId);

    if (error) {
      throw new DomainError("Failed to reserve leave balance days", "REPOSITORY_LEAVE_BALANCE_RESERVE_FAILED", {
        cause: error.message
      });
    }
  }

  async restoreReservedDays(balanceId: UUID, days: number): Promise<void> {
    const supabase = createServiceRoleClient();

    const { data: current, error: fetchError } = await supabase
      .from("leave_balances")
      .select("reserved_days")
      .eq("id", balanceId)
      .single<{ reserved_days: number }>();

    if (fetchError) {
      throw new DomainError(
        "Failed to fetch leave balance before reservation restoration",
        "REPOSITORY_LEAVE_BALANCE_FETCH_BEFORE_RESTORE_FAILED",
        { cause: fetchError.message }
      );
    }

    const nextReserved = Math.max(0, current.reserved_days - days);
    const { error } = await supabase.from("leave_balances").update({ reserved_days: nextReserved }).eq("id", balanceId);

    if (error) {
      throw new DomainError("Failed to restore reserved leave balance days", "REPOSITORY_LEAVE_BALANCE_RESTORE_FAILED", {
        cause: error.message
      });
    }
  }
}
