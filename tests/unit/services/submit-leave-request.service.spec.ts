import { describe, expect, it, vi } from "vitest";
import { Employee } from "@/domain/entities/employee";
import { SubmitLeaveRequestService } from "@/services/leave-request/submit-leave-request.service";
import type { EmployeeRepository } from "@/repositories/interfaces/employee.repository";
import type { LeaveRequestRepository } from "@/repositories/interfaces/leave-request.repository";
import type { LeaveBalanceService } from "@/services/leave-balance/leave-balance.service";
import type { AuditLogService } from "@/services/audit/audit-log.service";

function buildEmployee(): Employee {
  return new Employee({
    id: "dc0d7ab1-e44b-44af-b9f2-c7507e333053",
    companyId: "bd1f5167-0318-47eb-836f-bfc38b2e09a0",
    userId: "da3588c6-7d3c-4a40-a802-926fd602e693",
    employeeNumber: "E-001",
    managerEmployeeId: null,
    hiredAt: new Date("2020-01-01"),
    seniorityReferenceDate: new Date("2020-01-01"),
    isActive: true
  });
}

describe("SubmitLeaveRequestService", () => {
  it("should create a pending leave request and write audit log", async () => {
    const employeeRepository: EmployeeRepository = {
      findById: vi.fn().mockResolvedValue(buildEmployee()),
      findManager: vi.fn(),
      findDirectReports: vi.fn()
    };

    const leaveRequestRepository: LeaveRequestRepository = {
      create: vi.fn().mockImplementation(async (request) => request),
      findById: vi.fn(),
      findByEmployeeId: vi.fn().mockResolvedValue([]),
      updateStatus: vi.fn()
    };

    const leaveBalanceService: LeaveBalanceService = {
      assertAndReserve: vi.fn(),
      restoreReservation: vi.fn()
    } as unknown as LeaveBalanceService;

    const auditLogService: AuditLogService = {
      log: vi.fn()
    } as unknown as AuditLogService;

    const service = new SubmitLeaveRequestService(
      employeeRepository,
      leaveRequestRepository,
      leaveBalanceService,
      auditLogService
    );

    const result = await service.execute({
      companyId: "bd1f5167-0318-47eb-836f-bfc38b2e09a0",
      employeeId: "dc0d7ab1-e44b-44af-b9f2-c7507e333053",
      leaveTypeId: "f826a3bb-8877-4f09-960c-f5ca90fdf860",
      reason: "Congé familial",
      days: [{ leaveDate: "2026-05-12", dayPart: "FULL_DAY", durationDays: 1 }],
      createdByUserId: "da3588c6-7d3c-4a40-a802-926fd602e693"
    });

    expect(result.props.status).toBe("pending");
    expect(leaveBalanceService.assertAndReserve).toHaveBeenCalledTimes(1);
    expect(auditLogService.log).toHaveBeenCalledTimes(1);
  });
});
