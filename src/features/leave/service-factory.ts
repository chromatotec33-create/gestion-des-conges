import { SupabaseAuditLogRepository } from "@/infrastructure/repositories/supabase-audit-log.repository";
import { SupabaseCancellationRepository } from "@/infrastructure/repositories/supabase-cancellation.repository";
import { SupabaseEmployeeRepository } from "@/infrastructure/repositories/supabase-employee.repository";
import { SupabaseLeaveBalanceRepository } from "@/infrastructure/repositories/supabase-leave-balance.repository";
import { SupabaseLeaveRequestRepository } from "@/infrastructure/repositories/supabase-leave-request.repository";
import { AuditLogService } from "@/services/audit/audit-log.service";
import { LeaveBalanceService } from "@/services/leave-balance/leave-balance.service";
import { CancelLeaveRequestService } from "@/services/leave-request/cancel-leave-request.service";
import { SubmitLeaveRequestService } from "@/services/leave-request/submit-leave-request.service";

export function createLeaveServices() {
  const employeeRepository = new SupabaseEmployeeRepository();
  const leaveRequestRepository = new SupabaseLeaveRequestRepository();
  const leaveBalanceRepository = new SupabaseLeaveBalanceRepository();
  const cancellationRepository = new SupabaseCancellationRepository();
  const auditLogRepository = new SupabaseAuditLogRepository();

  const auditLogService = new AuditLogService(auditLogRepository);
  const leaveBalanceService = new LeaveBalanceService(leaveBalanceRepository);

  const submitLeaveRequestService = new SubmitLeaveRequestService(
    employeeRepository,
    leaveRequestRepository,
    leaveBalanceService,
    auditLogService
  );

  const cancelLeaveRequestService = new CancelLeaveRequestService(
    leaveRequestRepository,
    cancellationRepository,
    auditLogService
  );

  return {
    submitLeaveRequestService,
    cancelLeaveRequestService
  };
}
