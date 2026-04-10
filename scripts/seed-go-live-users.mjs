import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const DEFAULT_PASSWORD = "2P346c97!";

const accounts = [
  {
    email: "evan.sarrazin33+admin@gmail.com",
    firstName: "Evan",
    lastName: "Admin",
    role: "super_admin",
    employeeNumber: "CHR-ADM-001",
    contractType: "CDI"
  },
  {
    email: "evan.sarrazin33+rh@gmail.com",
    firstName: "Evan",
    lastName: "RH",
    role: "hr",
    employeeNumber: "CHR-RH-001",
    contractType: "CDI"
  },
  {
    email: "evan.sarrazin33+salarie@gmail.com",
    firstName: "Evan",
    lastName: "Salarie",
    role: "employee",
    employeeNumber: "CHR-SAL-001",
    contractType: "CDI"
  }
];

async function ensureCompany() {
  const { data: existing } = await supabase.from("companies").select("id").ilike("name", "Chromatotec").maybeSingle();

  if (existing?.id) return existing.id;

  const { data: created, error } = await supabase
    .from("companies")
    .insert({
      name: "Chromatotec",
      legal_name: "Chromatotec",
      country_code: "FR",
      timezone: "Europe/Paris",
      reference_period_start_month: 6,
      leave_accrual_mode: "A",
      default_rounding_mode: "HALF_UP"
    })
    .select("id")
    .single();

  if (error || !created?.id) throw error ?? new Error("Failed to create company");
  return created.id;
}

async function ensureTeam(companyId) {
  const { data: existing } = await supabase
    .from("teams")
    .select("id")
    .eq("company_id", companyId)
    .eq("code", "TEAM-RH")
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data: created, error } = await supabase
    .from("teams")
    .insert({ company_id: companyId, code: "TEAM-RH", name: "Equipe RH" })
    .select("id")
    .single();

  if (error || !created?.id) throw error ?? new Error("Failed to create team");
  return created.id;
}

async function ensureAuthUser(account) {
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;

  const existing = users.users.find((user) => user.email === account.email);
  if (existing) {
    await supabase.auth.admin.updateUserById(existing.id, {
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: { seeded: true, role: account.role }
    });
    return existing.id;
  }

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: account.email,
    password: DEFAULT_PASSWORD,
    email_confirm: true,
    user_metadata: { seeded: true, role: account.role }
  });

  if (createError || !created.user) throw createError ?? new Error("Failed to create user");
  return created.user.id;
}

async function ensurePublicUser(userId, account) {
  const { data: existing } = await supabase.from("users").select("id").eq("id", userId).maybeSingle();

  if (existing) {
    await supabase
      .from("users")
      .update({ email: account.email, first_name: account.firstName, last_name: account.lastName, is_active: true })
      .eq("id", userId);
    return;
  }

  const { error } = await supabase.from("users").insert({
    id: userId,
    email: account.email,
    first_name: account.firstName,
    last_name: account.lastName,
    is_active: true
  });

  if (error) throw error;
}

async function ensureRole(companyId, userId, role) {
  const { data: existing } = await supabase
    .from("user_company_roles")
    .select("id")
    .eq("company_id", companyId)
    .eq("user_id", userId)
    .eq("role", role)
    .maybeSingle();

  if (existing) return;

  const { error } = await supabase.from("user_company_roles").insert({
    company_id: companyId,
    user_id: userId,
    role,
    is_default_company: true
  });

  if (error) throw error;
}

async function ensureEmployee(companyId, teamId, userId, account) {
  const { data: existing } = await supabase.from("employees").select("id").eq("company_id", companyId).eq("user_id", userId).maybeSingle();

  if (existing?.id) return existing.id;

  const { data: created, error } = await supabase
    .from("employees")
    .insert({
      company_id: companyId,
      user_id: userId,
      employee_number: account.employeeNumber,
      team_id: teamId,
      hired_at: new Date().toISOString().slice(0, 10),
      contract_type: account.contractType,
      is_active: true
    })
    .select("id")
    .single();

  if (error || !created?.id) throw error ?? new Error("Failed to create employee");
  return created.id;
}

(async () => {
  const companyId = await ensureCompany();
  const teamId = await ensureTeam(companyId);

  const createdUsers = [];

  for (const account of accounts) {
    const userId = await ensureAuthUser(account);
    await ensurePublicUser(userId, account);
    await ensureRole(companyId, userId, account.role);
    await ensureEmployee(companyId, teamId, userId, account);
    createdUsers.push({ email: account.email, role: account.role });
  }

  // Manager assignment: RH manages employee
  const { data: rhEmployee } = await supabase
    .from("employees")
    .select("id")
    .eq("company_id", companyId)
    .eq("employee_number", "CHR-RH-001")
    .maybeSingle();

  const { data: salarieEmployee } = await supabase
    .from("employees")
    .select("id")
    .eq("company_id", companyId)
    .eq("employee_number", "CHR-SAL-001")
    .maybeSingle();

  if (rhEmployee?.id && salarieEmployee?.id) {
    await supabase.from("employees").update({ manager_employee_id: rhEmployee.id }).eq("id", salarieEmployee.id);
  }

  console.log("✅ Comptes créés / mis à jour");
  console.table(createdUsers);
  console.log(`Mot de passe (tous les comptes): ${DEFAULT_PASSWORD}`);
})();
