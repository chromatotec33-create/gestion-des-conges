import type { LeaveCancellation } from "@/domain/entities/leave-cancellation";

export interface CancellationRepository {
  create(cancellation: LeaveCancellation): Promise<void>;
}
