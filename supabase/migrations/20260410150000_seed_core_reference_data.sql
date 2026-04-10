-- Ensure Supabase has the minimum reference data for the leave-management app.
-- Idempotent: safe to run multiple times.

-- 1) Default company (mono-tenant business mode)
insert into public.companies (
  name,
  legal_name,
  country_code,
  timezone,
  reference_period_start_month,
  leave_accrual_mode,
  default_rounding_mode
)
select
  'Chromatotec',
  'Chromatotec',
  'FR',
  'Europe/Paris',
  6,
  'A',
  'HALF_UP'
where not exists (
  select 1 from public.companies where lower(name) = lower('Chromatotec')
);

-- 2) Normalize global company settings on the default company
update public.companies
set
  legal_name = coalesce(legal_name, 'Chromatotec'),
  country_code = coalesce(country_code, 'FR'),
  timezone = coalesce(timezone, 'Europe/Paris'),
  reference_period_start_month = coalesce(reference_period_start_month, 6),
  leave_accrual_mode = coalesce(leave_accrual_mode, 'A'),
  default_rounding_mode = coalesce(default_rounding_mode, 'HALF_UP')
where lower(name) = lower('Chromatotec');

-- 3) Core departments
with base_company as (
  select id from public.companies where lower(name) = lower('Chromatotec') limit 1
)
insert into public.departments (company_id, code, name)
select c.id, d.code, d.name
from base_company c
cross join (
  values
    ('RH', 'Ressources humaines'),
    ('PROD', 'Production'),
    ('RD', 'Recherche & Développement'),
    ('SUP', 'Support')
) as d(code, name)
where not exists (
  select 1
  from public.departments dep
  where dep.company_id = c.id and dep.code = d.code
);

-- 4) Core teams
with base_company as (
  select id from public.companies where lower(name) = lower('Chromatotec') limit 1
),
resolved_departments as (
  select code, id, company_id
  from public.departments
  where company_id = (select id from base_company)
)
insert into public.teams (company_id, department_id, code, name)
select
  c.id,
  dep.id,
  t.code,
  t.name
from base_company c
join (
  values
    ('TEAM-PROD', 'PROD', 'Equipe Production'),
    ('TEAM-RD', 'RD', 'Equipe R&D'),
    ('TEAM-SUP', 'SUP', 'Equipe Support'),
    ('TEAM-RH', 'RH', 'Equipe RH')
) as t(code, dep_code, name)
  on true
left join resolved_departments dep
  on dep.code = t.dep_code and dep.company_id = c.id
where not exists (
  select 1
  from public.teams team
  where team.company_id = c.id and team.code = t.code
);

-- 5) Global leave types
with base_company as (
  select id from public.companies where lower(name) = lower('Chromatotec') limit 1
)
insert into public.leave_types (
  company_id,
  code,
  label,
  unit,
  is_paid,
  requires_medical_certificate,
  track_in_planning,
  is_active
)
select
  c.id,
  lt.code,
  lt.label,
  lt.unit::public.leave_unit,
  lt.is_paid,
  lt.requires_certificate,
  true,
  true
from base_company c
cross join (
  values
    ('CP', 'Congés payés', 'day', true, false),
    ('RTT', 'RTT', 'day', true, false),
    ('MAL', 'Arrêt maladie', 'day', false, true),
    ('EXC', 'Congé exceptionnel', 'day', true, false)
) as lt(code, label, unit, is_paid, requires_certificate)
where not exists (
  select 1
  from public.leave_types t
  where t.company_id = c.id and t.code = lt.code
);

-- 6) Baseline leave policies (global rules)
with base_company as (
  select id from public.companies where lower(name) = lower('Chromatotec') limit 1
),
cp as (
  select id as leave_type_id, company_id
  from public.leave_types
  where code = 'CP' and company_id = (select id from base_company)
  limit 1
),
rtt as (
  select id as leave_type_id, company_id
  from public.leave_types
  where code = 'RTT' and company_id = (select id from base_company)
  limit 1
)
insert into public.leave_policies (
  company_id,
  leave_type_id,
  effective_from,
  annual_credit_days,
  prorata_enabled,
  max_carry_over_days,
  carry_over_expiration_months,
  consumption_priority,
  min_notice_days
)
select
  p.company_id,
  p.leave_type_id,
  date '2026-01-01',
  p.annual_credit_days,
  true,
  p.max_carry_over_days,
  p.carry_over_expiration_months,
  p.consumption_priority,
  p.min_notice_days
from (
  select company_id, leave_type_id, 25::numeric as annual_credit_days, 5::numeric as max_carry_over_days, 12::smallint as carry_over_expiration_months, 100::smallint as consumption_priority, 7::integer as min_notice_days from cp
  union all
  select company_id, leave_type_id, 10::numeric as annual_credit_days, 0::numeric as max_carry_over_days, null::smallint as carry_over_expiration_months, 90::smallint as consumption_priority, 3::integer as min_notice_days from rtt
) p
where not exists (
  select 1
  from public.leave_policies lp
  where lp.company_id = p.company_id
    and lp.leave_type_id = p.leave_type_id
    and lp.effective_from = date '2026-01-01'
);
