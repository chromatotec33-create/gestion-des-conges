import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";
import { DomainError } from "@/domain/errors/domain-error";

const DEFAULT_COMPANY_NAME = "Chromatotec";

export async function resolveDefaultCompanyId(): Promise<string> {
  const supabase = createServiceRoleClient();

  const byName = await supabase
    .from("companies")
    .select("id")
    .ilike("name", DEFAULT_COMPANY_NAME)
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (byName.error) {
    throw new DomainError("Failed to resolve default company", "DEFAULT_COMPANY_RESOLUTION_FAILED", {
      cause: byName.error.message
    });
  }

  if (byName.data?.id) {
    return byName.data.id;
  }

  const fallback = await supabase.from("companies").select("id").order("created_at", { ascending: true }).limit(1).maybeSingle<{ id: string }>();

  if (fallback.error || !fallback.data?.id) {
    throw new DomainError("No default company found", "DEFAULT_COMPANY_NOT_FOUND", {
      cause: fallback.error?.message
    });
  }

  return fallback.data.id;
}
