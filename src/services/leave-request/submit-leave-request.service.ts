import { LeaveRequest } from "@/domain/entities/leave-request";
import { DomainError } from "@/domain/errors/domain-error";
import type { EmployeeRepository } from "@/repositories/interfaces/employee.repository";
import type { LeaveRequestRepository } from "@/repositories/interfaces/leave-request.repository";
import type { CreateLeaveRequestInput } from "@/types/leave";
import type { LeaveBalanceService } from "@/services/leave-balance/leave-balance.service";
import type { AuditLogService } from "@/services/audit/audit-log.service";
import { createLeaveRequestSchema } from "@/validators/leave-request.validator";

export class SubmitLeaveRequestService {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly leaveRequestRepository: LeaveRequestRepository,
    private readonly leaveBalanceService: LeaveBalanceService,
    private readonly auditLogService: AuditLogService
  ) {}

  async execute(input: CreateLeaveRequestInput): Promise<LeaveRequest> {
    const payload = createLeaveRequestSchema.parse(input);

    const employee = await this.employeeRepository.findById(payload.companyId, payload.employeeId);

    if (!employee) {
      throw new DomainError("Employee not found", "EMPLOYEE_NOT_FOUND", {
        companyId: payload.companyId,
        employeeId: payload.employeeId
      });
    }

    const requestedDays = payload.days.reduce((sum, day) => sum + day.durationDays, 0);

    await this.leaveBalanceService.assertAndReserve(
      payload.companyId,
      payload.employeeId,
      payload.leaveTypeId,
      requestedDays
    );

    const leaveRequest = new LeaveRequest({
      id: crypto.randomUUID(),
      companyId: payload.companyId,
      employeeId: payload.employeeId,
      leaveTypeId: payload.leaveTypeId,
      status: "draft",
      reason: payload.reason ?? null,
      requestedDays,
      days: payload.days.map((day) => ({
        leaveDate: new Date(day.leaveDate),
        durationDays: day.durationDays,
        dayPart: day.dayPart
      })),
      createdBy: payload.createdByUserId,
      createdAt: new Date()
    }).submit();

    const persisted = await this.leaveRequestRepository.create(leaveRequest);

    await this.auditLogService.log({
      companyId: payload.companyId,
      actorUserId: payload.createdByUserId,
      actorEmployeeId: payload.employeeId,
      action: "leave_request.submitted",
      entityName: "leave_requests",
      entityId: persisted.id,
      afterData: {
        status: persisted.props.status,
        requestedDays: persisted.props.requestedDays,
        leaveTypeId: persisted.props.leaveTypeId
      }
    });

    return persisted;
  }
}
