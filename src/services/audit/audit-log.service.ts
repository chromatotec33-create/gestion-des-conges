import type { AuditLogCreateInput, AuditLogRepository } from "@/repositories/interfaces/audit-log.repository";

export class AuditLogService {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async log(input: AuditLogCreateInput): Promise<void> {
    await this.auditLogRepository.append({
      ...input,
      metadata: {
        source: "service-layer",
        ...(input.metadata ?? {})
      }
    });
  }
}
