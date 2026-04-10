import { describe, expect, it, vi } from "vitest";
import { LeaveRequest } from "@/domain/entities/leave-request";
import { CancelLeaveRequestService } from "@/services/leave-request/cancel-leave-request.service";
import type { LeaveRequestRepository } from "@/repositories/interfaces/leave-request.repository";
import type { CancellationRepository } from "@/repositories/interfaces/cancellation.repository";
import type { AuditLogService } from "@/services/audit/audit-log.service";

describe("CancelLeaveRequestService", () => {
  it("should cancel an approved request and log audit event", async () => {
    const request = new LeaveRequest({
      id: "687f9dc1-cd0f-42b4-88c4-f1aa7094fb8d",
      companyId: "c035f618-c3ea-4d53-bcb5-22e7ff77a57f",
      employeeId: "f38ee396-7956-4cd1-a245-87500f2fc2db",
      leaveTypeId: "b9f2816f-8f12-4d49-a68c-469bb6afd72f",
      status: "approved",
      reason: "Vacances",
      requestedDays: 2,
      days: [
        { leaveDate: new Date("2026-05-10"), durationDays: 1, dayPart: "FULL_DAY" },
        { leaveDate: new Date("2026-05-11"), durationDays: 1, dayPart: "FULL_DAY" }
      ],
      createdBy: "6a44380f-e3fb-419c-9237-aae62d8b929e",
      createdAt: new Date("2026-04-01")
    });

    const leaveRequestRepository: LeaveRequestRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(request),
      findByEmployeeId: vi.fn().mockResolvedValue([]),
      updateStatus: vi.fn().mockResolvedValue(undefined)
    };

    const cancellationRepository: CancellationRepository = {
      create: vi.fn().mockResolvedValue(undefined)
    };

    const auditLogService: AuditLogService = {
      log: vi.fn().mockResolvedValue(undefined)
    } as unknown as AuditLogService;

    const service = new CancelLeaveRequestService(leaveRequestRepository, cancellationRepository, auditLogService);

    await service.execute({
      companyId: "c035f618-c3ea-4d53-bcb5-22e7ff77a57f",
      leaveRequestId: request.id,
      initiatedByUserId: "6a44380f-e3fb-419c-9237-aae62d8b929e",
      initiatedByRole: "hr",
      reason: "Annulation pour fermeture exceptionnelle du site.",
      restoreDays: true,
      reinforcedJustification: "Maintenance critique imposée sur la période et risque opérationnel majeur."
    });

    expect(cancellationRepository.create).toHaveBeenCalledTimes(1);
    expect(leaveRequestRepository.updateStatus).toHaveBeenCalledWith(
      "c035f618-c3ea-4d53-bcb5-22e7ff77a57f",
      request.id,
      "cancelled"
    );
    expect(auditLogService.log).toHaveBeenCalledTimes(1);
  });
});
