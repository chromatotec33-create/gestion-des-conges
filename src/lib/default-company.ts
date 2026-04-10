import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";
import { DomainError } from "@/domain/errors/domain-error";

const DEFAULT_COMPANY_NAME = "Chromatotec";

async function findExistingCompanyId() {
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

  const fallback = await supabase
    .from("companies")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (fallback.error) {
    throw new DomainError("Failed to resolve fallback company", "DEFAULT_COMPANY_FALLBACK_FAILED", {
      cause: fallback.error.message
    });
  }

  return fallback.data?.id ?? null;
}

async function createDefaultCompany() {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("companies")
    .insert({
      name: DEFAULT_COMPANY_NAME,
      legal_name: "Chromatotec",
      country_code: "FR",
      timezone: "Europe/Paris",
      reference_period_start_month: 6,
      leave_accrual_mode: "A",
      default_rounding_mode: "HALF_UP"
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !data?.id) {
    throw new DomainError("Failed to create default company", "DEFAULT_COMPANY_CREATE_FAILED", {
      cause: error?.message
    });
  }

  return data.id;
}

export async function resolveDefaultCompanyId(): Promise<string> {
  const existing = await findExistingCompanyId();
  if (existing) return existing;

  return createDefaultCompany();
}
