import type { LeaveRequest } from "@/domain/entities/leave-request";
import type { UUID } from "@/types/common";

export interface LeaveRequestRepository {
  create(request: LeaveRequest): Promise<LeaveRequest>;
  findById(companyId: UUID, requestId: UUID): Promise<LeaveRequest | null>;
  findByEmployeeId(companyId: UUID, employeeId: UUID, limit?: number): Promise<LeaveRequest[]>;
  updateStatus(companyId: UUID, requestId: UUID, status: "pending" | "cancelled" | "approved" | "rejected"): Promise<void>;
}
