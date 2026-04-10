import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const adminEmail = "admin@admin.com";
const adminPassword = "admin";
const companyNames = ["Chromatotec", "Airmotec", "JPA Technologies"];

async function ensureCompanies() {
  const companyIds = [];

  for (const name of companyNames) {
    const { data: existing } = await supabase.from("companies").select("id").eq("name", name).maybeSingle();

    if (existing?.id) {
      companyIds.push(existing.id);
      continue;
    }

    const { data: created, error } = await supabase
      .from("companies")
      .insert({ name, country_code: "FR", timezone: "Europe/Paris", idcc_code: "3248" })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    companyIds.push(created.id);
  }

  return companyIds;
}

async function ensureAdminAuthUser() {
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;

  const existing = users.users.find((user) => user.email === adminEmail);
  if (existing) return existing.id;

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { seeded: true, role: "super_admin" }
  });

  if (createError || !created.user) throw createError ?? new Error("Failed to create admin user");
  return created.user.id;
}

async function ensurePublicUser(userId) {
  const { data: existing } = await supabase.from("users").select("id").eq("id", userId).maybeSingle();
  if (existing) return;

  const { error } = await supabase.from("users").insert({
    id: userId,
    email: adminEmail,
    first_name: "Super",
    last_name: "Admin",
    is_active: true
  });

  if (error) throw error;
}

async function ensureRoles(companyIds, userId) {
  for (const companyId of companyIds) {
    const { data: existing } = await supabase
      .from("user_company_roles")
      .select("id")
      .eq("company_id", companyId)
      .eq("user_id", userId)
      .eq("role", "super_admin")
      .maybeSingle();

    if (existing) continue;

    const { error } = await supabase.from("user_company_roles").insert({
      company_id: companyId,
      user_id: userId,
      role: "super_admin",
      is_default_company: false
    });

    if (error) throw error;
  }
}

(async () => {
  const companyIds = await ensureCompanies();
  const userId = await ensureAdminAuthUser();
  await ensurePublicUser(userId);
  await ensureRoles(companyIds, userId);

  console.log("✅ Admin seed completed");
  console.log(`email: ${adminEmail}`);
  console.log(`password: ${adminPassword}`);
})();
