import { LeaveCancellation } from "@/domain/entities/leave-cancellation";
import { DomainError } from "@/domain/errors/domain-error";
import type { CancellationRepository } from "@/repositories/interfaces/cancellation.repository";
import type { LeaveRequestRepository } from "@/repositories/interfaces/leave-request.repository";
import type { CancelLeaveRequestInput } from "@/types/leave";
import type { AuditLogService } from "@/services/audit/audit-log.service";
import { cancelLeaveRequestSchema } from "@/validators/leave-request.validator";

export class CancelLeaveRequestService {
  constructor(
    private readonly leaveRequestRepository: LeaveRequestRepository,
    private readonly cancellationRepository: CancellationRepository,
    private readonly auditLogService: AuditLogService
  ) {}

  async execute(input: CancelLeaveRequestInput & { readonly reinforcedJustification?: string }): Promise<void> {
    const payload = cancelLeaveRequestSchema.parse(input);

    const request = await this.leaveRequestRepository.findById(payload.companyId, payload.leaveRequestId);

    if (!request) {
      throw new DomainError("Leave request not found", "LEAVE_REQUEST_NOT_FOUND", {
        companyId: payload.companyId,
        leaveRequestId: payload.leaveRequestId
      });
    }

    const cancellationPolicy = request.canBeCancelledByEmployer(new Date());

    if (!cancellationPolicy.allowed) {
      throw new DomainError("Leave request cannot be cancelled from current status", "INVALID_CANCELLATION_STATUS", {
        currentStatus: request.props.status
      });
    }

    const cancellation = new LeaveCancellation({
      companyId: payload.companyId,
      leaveRequestId: payload.leaveRequestId,
      initiatedByUserId: payload.initiatedByUserId,
      initiatedByRole: payload.initiatedByRole,
      reason: payload.reason,
      restoreDays: payload.restoreDays,
      lessThan30DaysWarning: cancellationPolicy.warningLessThan30Days,
      reinforcedJustification: input.reinforcedJustification ?? null
    });

    await this.cancellationRepository.create(cancellation);
    await this.leaveRequestRepository.updateStatus(payload.companyId, payload.leaveRequestId, "cancelled");

    await this.auditLogService.log({
      companyId: payload.companyId,
      actorUserId: payload.initiatedByUserId,
      action: "leave_request.cancellation_requested",
      entityName: "leave_cancellations",
      entityId: payload.leaveRequestId,
      reason: payload.reason,
      afterData: {
        restoreDays: cancellation.props.restoreDays,
        lessThan30DaysWarning: cancellation.props.lessThan30DaysWarning
      }
    });
  }
}
