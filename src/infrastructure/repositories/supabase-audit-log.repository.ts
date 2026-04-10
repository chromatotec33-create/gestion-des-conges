import { DomainError } from "@/domain/errors/domain-error";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";
import type { AuditLogCreateInput, AuditLogRepository } from "@/repositories/interfaces/audit-log.repository";

export class SupabaseAuditLogRepository implements AuditLogRepository {
  async append(input: AuditLogCreateInput): Promise<void> {
    const supabase = createServiceRoleClient();

    const { error } = await supabase.from("audit_logs").insert({
      company_id: input.companyId,
      actor_user_id: input.actorUserId,
      actor_employee_id: input.actorEmployeeId,
      action: input.action,
      entity_name: input.entityName,
      entity_id: input.entityId,
      reason: input.reason,
      before_data: input.beforeData,
      after_data: input.afterData,
      metadata: input.metadata ?? {}
    });

    if (error) {
      throw new DomainError("Failed to append audit log", "REPOSITORY_AUDIT_LOG_APPEND_FAILED", {
        cause: error.message
      });
    }
  }
}
