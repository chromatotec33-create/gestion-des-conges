-- PHASE 2: Core database schema for leave management SaaS
-- PostgreSQL / Supabase migration

create extension if not exists pgcrypto;
create extension if not exists citext;

-- =========================================================
-- Enums
-- =========================================================
create type public.app_role as enum (
  'employee',
  'manager',
  'hr',
  'direction',
  'super_admin'
);

create type public.leave_request_status as enum (
  'draft',
  'pending',
  'approved',
  'rejected',
  'cancelled',
  'withdrawn'
);

create type public.approval_decision as enum (
  'pending',
  'approved',
  'rejected',
  'skipped'
);

create type public.leave_unit as enum ('day', 'half_day', 'hour');

create type public.leave_balance_txn_type as enum (
  'accrual',
  'adjustment',
  'consumption',
  'restoration',
  'expiration',
  'carry_over'
);

create type public.notification_channel as enum ('email', 'in_app');
create type public.notification_status as enum ('queued', 'sent', 'failed', 'read');

-- =========================================================
-- Utility functions and triggers
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.prevent_update_or_delete_audit_logs()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_logs is append-only';
end;
$$;

-- =========================================================
-- Core tenant / org structure
-- =========================================================
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  siret varchar(14),
  idcc_code varchar(16),
  country_code char(2) not null default 'FR',
  timezone text not null default 'Europe/Paris',
  reference_period_start_month smallint not null default 6 check (reference_period_start_month between 1 and 12),
  leave_accrual_mode char(1) not null default 'A' check (leave_accrual_mode in ('A', 'B')),
  default_rounding_mode text not null default 'HALF_UP',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create unique index companies_siret_uidx on public.companies (siret) where siret is not null;

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext not null,
  first_name text,
  last_name text,
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create unique index users_email_uidx on public.users(email);

create table public.user_company_roles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role public.app_role not null,
  is_default_company boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (company_id, user_id, role)
);
create unique index user_company_roles_default_company_uidx
  on public.user_company_roles (user_id)
  where is_default_company;

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  code text not null,
  name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (company_id, code)
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  code text not null,
  name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (company_id, code)
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete restrict,
  employee_number text not null,
  team_id uuid references public.teams(id) on delete set null,
  department_id uuid references public.departments(id) on delete set null,
  manager_employee_id uuid references public.employees(id) on delete set null,
  hired_at date not null,
  contract_type text,
  fte numeric(4,3) not null default 1.0 check (fte > 0 and fte <= 1.5),
  is_active boolean not null default true,
  seniority_reference_date date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (company_id, employee_number),
  unique (company_id, user_id)
);

create table public.manager_delegations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  manager_employee_id uuid not null references public.employees(id) on delete cascade,
  delegate_employee_id uuid not null references public.employees(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  is_active boolean not null default true,
  created_by uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (ends_at > starts_at),
  check (manager_employee_id <> delegate_employee_id)
);
create index manager_delegations_active_idx
  on public.manager_delegations (company_id, manager_employee_id, starts_at, ends_at)
  where is_active;

-- =========================================================
-- Leave configuration and accounting
-- =========================================================
create table public.leave_types (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  code text not null,
  label text not null,
  unit public.leave_unit not null default 'day',
  is_paid boolean not null default true,
  requires_medical_certificate boolean not null default false,
  track_in_planning boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (company_id, code)
);

create table public.leave_policies (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  leave_type_id uuid not null references public.leave_types(id) on delete cascade,
  effective_from date not null,
  effective_to date,
  accrual_rate_per_month numeric(8,4),
  annual_credit_days numeric(8,2),
  prorata_enabled boolean not null default true,
  max_carry_over_days numeric(8,2),
  carry_over_expiration_months smallint,
  consumption_priority smallint not null default 100,
  max_consecutive_days integer,
  min_notice_days integer not null default 0,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (effective_to is null or effective_to >= effective_from),
  check (
    (accrual_rate_per_month is not null and annual_credit_days is null)
    or (accrual_rate_per_month is null and annual_credit_days is not null)
  )
);
create index leave_policies_effective_idx on public.leave_policies (company_id, leave_type_id, effective_from desc);

create table public.leave_balances (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  leave_type_id uuid not null references public.leave_types(id) on delete cascade,
  reference_period_start date not null,
  reference_period_end date not null,
  acquired_days numeric(10,3) not null default 0,
  consumed_days numeric(10,3) not null default 0,
  reserved_days numeric(10,3) not null default 0,
  expired_days numeric(10,3) not null default 0,
  carry_over_days numeric(10,3) not null default 0,
  current_balance_days numeric(10,3) not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (reference_period_end >= reference_period_start),
  unique (company_id, employee_id, leave_type_id, reference_period_start, reference_period_end)
);
create index leave_balances_lookup_idx on public.leave_balances (company_id, employee_id, leave_type_id);

create table public.leave_balance_transactions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  leave_balance_id uuid not null references public.leave_balances(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  leave_type_id uuid not null references public.leave_types(id) on delete cascade,
  transaction_type public.leave_balance_txn_type not null,
  amount_days numeric(10,3) not null,
  occurred_at timestamptz not null default timezone('utc', now()),
  request_id uuid,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);
create index leave_balance_transactions_ledger_idx
  on public.leave_balance_transactions (company_id, employee_id, leave_type_id, occurred_at desc);

-- =========================================================
-- Leave workflow
-- =========================================================
create table public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  leave_type_id uuid not null references public.leave_types(id) on delete restrict,
  status public.leave_request_status not null default 'draft',
  submitted_at timestamptz,
  requested_days numeric(10,3) not null default 0,
  approved_days numeric(10,3),
  reason text,
  manager_comment text,
  hr_comment text,
  cancellation_policy_snapshot jsonb not null default '{}'::jsonb,
  created_by uuid not null references public.users(id) on delete restrict,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index leave_requests_company_status_idx on public.leave_requests (company_id, status, created_at desc);
create index leave_requests_employee_idx on public.leave_requests (company_id, employee_id, created_at desc);

create table public.leave_request_days (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  leave_request_id uuid not null references public.leave_requests(id) on delete cascade,
  leave_date date not null,
  day_part text not null default 'FULL_DAY' check (day_part in ('FULL_DAY', 'AM', 'PM')),
  duration_days numeric(6,3) not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (leave_request_id, leave_date, day_part)
);
create index leave_request_days_date_idx on public.leave_request_days (company_id, leave_date);

create table public.leave_approvals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  leave_request_id uuid not null references public.leave_requests(id) on delete cascade,
  step_order smallint not null,
  approver_user_id uuid references public.users(id) on delete set null,
  approver_employee_id uuid references public.employees(id) on delete set null,
  approver_role public.app_role not null,
  decision public.approval_decision not null default 'pending',
  decision_at timestamptz,
  comment text,
  delegated_from_employee_id uuid references public.employees(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (leave_request_id, step_order)
);
create index leave_approvals_queue_idx on public.leave_approvals (company_id, decision, step_order);

create table public.leave_cancellations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  leave_request_id uuid not null references public.leave_requests(id) on delete cascade,
  initiated_by_user_id uuid not null references public.users(id) on delete restrict,
  initiated_by_role public.app_role not null,
  requested_at timestamptz not null default timezone('utc', now()),
  cancelled_at timestamptz,
  reason text not null,
  employer_initiated boolean not null default false,
  less_than_30_days_warning boolean not null default false,
  reinforced_justification text,
  restore_days boolean not null default true,
  status public.leave_request_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index leave_cancellations_status_idx on public.leave_cancellations (company_id, status, requested_at desc);

alter table public.leave_balance_transactions
  add constraint leave_balance_transactions_request_fk
  foreign key (request_id) references public.leave_requests(id) on delete set null;

-- =========================================================
-- Operational constraints / calendars
-- =========================================================
create table public.holidays_calendar (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  holiday_date date not null,
  label text not null,
  site_code text,
  is_working_day_override boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create unique index holidays_calendar_unique_scope_uidx
  on public.holidays_calendar (company_id, holiday_date, coalesce(site_code, 'GLOBAL'));

create table public.blackout_periods (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  starts_on date not null,
  ends_on date not null,
  reason text not null,
  can_override boolean not null default false,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (ends_on >= starts_on)
);
create index blackout_periods_range_idx on public.blackout_periods (company_id, starts_on, ends_on);

create table public.staffing_rules (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  department_id uuid references public.departments(id) on delete cascade,
  rule_name text not null,
  min_staffing_count integer,
  max_absent_count integer,
  priority_mode text not null default 'FCFS' check (priority_mode in ('FCFS', 'SENIORITY', 'HYBRID')),
  applies_from date not null,
  applies_to date,
  weekdays_mask bit(7) not null default B'1111100',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (applies_to is null or applies_to >= applies_from),
  check (min_staffing_count is null or min_staffing_count >= 0),
  check (max_absent_count is null or max_absent_count >= 0)
);
create index staffing_rules_scope_idx on public.staffing_rules (company_id, team_id, department_id, applies_from);

-- =========================================================
-- Notifications and audit
-- =========================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  channel public.notification_channel not null,
  template_key text not null,
  payload jsonb not null default '{}'::jsonb,
  status public.notification_status not null default 'queued',
  scheduled_for timestamptz,
  sent_at timestamptz,
  read_at timestamptz,
  provider_message_id text,
  failure_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index notifications_delivery_idx on public.notifications (company_id, status, scheduled_for);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  company_id uuid references public.companies(id) on delete set null,
  actor_user_id uuid references public.users(id) on delete set null,
  actor_employee_id uuid references public.employees(id) on delete set null,
  action text not null,
  entity_name text not null,
  entity_id text,
  occurred_at timestamptz not null default timezone('utc', now()),
  reason text,
  ip_address inet,
  user_agent text,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb not null default '{}'::jsonb
);
create index audit_logs_company_occurred_idx on public.audit_logs (company_id, occurred_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_name, entity_id, occurred_at desc);

create trigger trg_audit_logs_append_only
  before update or delete on public.audit_logs
  for each row
  execute function public.prevent_update_or_delete_audit_logs();

-- =========================================================
-- updated_at triggers
-- =========================================================
create trigger trg_companies_updated_at before update on public.companies for each row execute function public.set_updated_at();
create trigger trg_users_updated_at before update on public.users for each row execute function public.set_updated_at();
create trigger trg_user_company_roles_updated_at before update on public.user_company_roles for each row execute function public.set_updated_at();
create trigger trg_departments_updated_at before update on public.departments for each row execute function public.set_updated_at();
create trigger trg_teams_updated_at before update on public.teams for each row execute function public.set_updated_at();
create trigger trg_employees_updated_at before update on public.employees for each row execute function public.set_updated_at();
create trigger trg_manager_delegations_updated_at before update on public.manager_delegations for each row execute function public.set_updated_at();
create trigger trg_leave_types_updated_at before update on public.leave_types for each row execute function public.set_updated_at();
create trigger trg_leave_policies_updated_at before update on public.leave_policies for each row execute function public.set_updated_at();
create trigger trg_leave_balances_updated_at before update on public.leave_balances for each row execute function public.set_updated_at();
create trigger trg_leave_requests_updated_at before update on public.leave_requests for each row execute function public.set_updated_at();
create trigger trg_leave_approvals_updated_at before update on public.leave_approvals for each row execute function public.set_updated_at();
create trigger trg_leave_cancellations_updated_at before update on public.leave_cancellations for each row execute function public.set_updated_at();
create trigger trg_holidays_calendar_updated_at before update on public.holidays_calendar for each row execute function public.set_updated_at();
create trigger trg_blackout_periods_updated_at before update on public.blackout_periods for each row execute function public.set_updated_at();
create trigger trg_staffing_rules_updated_at before update on public.staffing_rules for each row execute function public.set_updated_at();
create trigger trg_notifications_updated_at before update on public.notifications for each row execute function public.set_updated_at();
