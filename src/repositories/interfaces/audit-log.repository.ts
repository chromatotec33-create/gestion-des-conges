import type { UUID } from "@/types/common";

export type AuditLogCreateInput = {
  readonly companyId: UUID;
  readonly actorUserId: UUID;
  readonly actorEmployeeId?: UUID;
  readonly action: string;
  readonly entityName: string;
  readonly entityId: string;
  readonly reason?: string;
  readonly beforeData?: Record<string, unknown>;
  readonly afterData?: Record<string, unknown>;
  readonly metadata?: Record<string, unknown>;
};

export interface AuditLogRepository {
  append(input: AuditLogCreateInput): Promise<void>;
}
