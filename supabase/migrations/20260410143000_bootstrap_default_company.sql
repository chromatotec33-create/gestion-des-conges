-- Bootstrap default company for mono-tenant business mode.
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
where not exists (select 1 from public.companies);
