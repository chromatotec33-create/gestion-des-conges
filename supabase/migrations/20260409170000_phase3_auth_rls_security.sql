-- PHASE 3: Auth, RLS and security hardening

-- =========================================================
-- Helper functions (security definer for policy readability)
-- =========================================================
create or replace function public.auth_user_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

create or replace function public.is_super_admin_global()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_company_roles ucr
    where ucr.user_id = auth.uid()
      and ucr.role = 'super_admin'
  );
$$;

create or replace function public.has_company_role(target_company_id uuid, allowed_roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_company_roles ucr
    where ucr.user_id = auth.uid()
      and ucr.company_id = target_company_id
      and ucr.role = any(allowed_roles)
  );
$$;

create or replace function public.is_company_member(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin_global()
      or exists (
        select 1
        from public.user_company_roles ucr
        where ucr.user_id = auth.uid()
          and ucr.company_id = target_company_id
      );
$$;

create or replace function public.current_employee_id(target_company_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select e.id
  from public.employees e
  where e.company_id = target_company_id
    and e.user_id = auth.uid()
  limit 1;
$$;

create or replace function public.can_manage_employee(target_company_id uuid, target_employee_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_super_admin_global()
    or public.has_company_role(target_company_id, array['hr','direction']::public.app_role[])
    or exists (
      select 1
      from public.employees managed
      where managed.company_id = target_company_id
        and managed.id = target_employee_id
        and managed.manager_employee_id = public.current_employee_id(target_company_id)
        and public.has_company_role(target_company_id, array['manager']::public.app_role[])
    );
$$;

create or replace function public.is_self_employee(target_company_id uuid, target_employee_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_employee_id(target_company_id) = target_employee_id;
$$;

-- =========================================================
-- Baseline grants (do not expose service role; authenticated only)
-- =========================================================
revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

-- =========================================================
-- Enable RLS on business tables
-- =========================================================
alter table public.companies enable row level security;
alter table public.users enable row level security;
alter table public.user_company_roles enable row level security;
alter table public.departments enable row level security;
alter table public.teams enable row level security;
alter table public.employees enable row level security;
alter table public.manager_delegations enable row level security;
alter table public.leave_types enable row level security;
alter table public.leave_policies enable row level security;
alter table public.leave_balances enable row level security;
alter table public.leave_balance_transactions enable row level security;
alter table public.leave_requests enable row level security;
alter table public.leave_request_days enable row level security;
alter table public.leave_approvals enable row level security;
alter table public.leave_cancellations enable row level security;
alter table public.holidays_calendar enable row level security;
alter table public.blackout_periods enable row level security;
alter table public.staffing_rules enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- =========================================================
-- companies
-- =========================================================
create policy companies_select_member
on public.companies
for select
using (public.is_company_member(id));

create policy companies_insert_super_admin
on public.companies
for insert
with check (public.is_super_admin_global());

create policy companies_update_admin_roles
on public.companies
for update
using (public.has_company_role(id, array['hr','direction','super_admin']::public.app_role[]) or public.is_super_admin_global())
with check (public.has_company_role(id, array['hr','direction','super_admin']::public.app_role[]) or public.is_super_admin_global());

create policy companies_delete_super_admin
on public.companies
for delete
using (public.is_super_admin_global());

-- =========================================================
-- users
-- =========================================================
create policy users_select_self_or_admin
on public.users
for select
using (
  id = auth.uid()
  or public.is_super_admin_global()
  or exists (
    select 1
    from public.user_company_roles viewer
    join public.user_company_roles target
      on target.company_id = viewer.company_id
    where viewer.user_id = auth.uid()
      and target.user_id = users.id
      and viewer.role in ('hr','direction','super_admin')
  )
);

create policy users_insert_self_or_super_admin
on public.users
for insert
with check (id = auth.uid() or public.is_super_admin_global());

create policy users_update_self_or_admin
on public.users
for update
using (
  id = auth.uid()
  or public.is_super_admin_global()
  or exists (
    select 1
    from public.user_company_roles viewer
    join public.user_company_roles target
      on target.company_id = viewer.company_id
    where viewer.user_id = auth.uid()
      and target.user_id = users.id
      and viewer.role in ('hr','direction','super_admin')
  )
)
with check (
  id = auth.uid()
  or public.is_super_admin_global()
  or exists (
    select 1
    from public.user_company_roles viewer
    join public.user_company_roles target
      on target.company_id = viewer.company_id
    where viewer.user_id = auth.uid()
      and target.user_id = users.id
      and viewer.role in ('hr','direction','super_admin')
  )
);

-- =========================================================
-- user_company_roles (anti privilege escalation)
-- =========================================================
create policy user_company_roles_select_member
on public.user_company_roles
for select
using (
  user_id = auth.uid()
  or public.is_super_admin_global()
  or public.has_company_role(company_id, array['hr','direction','super_admin']::public.app_role[])
);

create policy user_company_roles_write_admin_only
on public.user_company_roles
for all
using (
  public.is_super_admin_global()
  or public.has_company_role(company_id, array['direction']::public.app_role[])
)
with check (
  public.is_super_admin_global()
  or (
    public.has_company_role(company_id, array['direction']::public.app_role[])
    and role <> 'super_admin'
  )
);

-- =========================================================
-- Org tables
-- =========================================================
create policy departments_select_member on public.departments
for select using (public.is_company_member(company_id));
create policy departments_write_admin on public.departments
for all
using (public.has_company_role(company_id, array['hr','direction','super_admin']::public.app_role[]) or public.is_super_admin_global())
with check (public.has_company_role(company_id, array['hr','direction','super_admin']::public.app_role[]) or public.is_super_admin_global());

create policy teams_select_member on public.teams
for select using (public.is_company_member(company_id));
create policy teams_write_admin on public.teams
for all
using (public.has_company_role(company_id, array['hr','direction','super_admin']::public.app_role[]) or public.is_super_admin_global())
with check (public.has_company_role(company_id, array['hr','direction','super_admin']::public.app_role[]) or public.is_super_admin_global());

create policy employees_select_scope on public.employees
for select
using (
  public.is_super_admin_global()
  or public.has_company_role(company_id, array['hr','direction']::public.app_role[])
  or public.is_self_employee(company_id, id)
  or public.can_manage_employee(company_id, id)
);

create policy employees_write_admin on public.employees
for all
using (
  public.is_super_admin_global()
  or public.has_company_role(company_id, array['hr','direction']::public.app_role[])
)
with check (
  public.is_super_admin_global()
  or public.has_company_role(company_id, array['hr','direction']::public.app_role[])
);

create policy manager_delegations_select_scope on public.manager_delegations
for select
using (
  public.is_super_admin_global()
  or public.has_company_role(company_id, array['hr','direction']::public.app_role[])
  or manager_employee_id = public.current_employee_id(company_id)
  or delegate_employee_id = public.current_employee_id(company_id)
);

create policy manager_delegations_write_admin_or_manager on public.manager_delegations
for all
using (
  public.is_super_admin_global()
  or public.has_company_role(company_id, array['hr','direction']::public.app_role[])
  or manager_employee_id = public.current_employee_id(company_id)
)
with check (
  public.is_super_admin_global()
  or public.has_company_role(company_id, array['hr','direction']::public.app_role[])
  or manager_employee_id = public.current_employee_id(company_id)
);

-- =========================================================
-- Leave config tables
-- =========================================================
create policy leave_types_select_member on public.leave_types
for select using (public.is_company_member(company_id));
create policy leave_types_write_admin on public.leave_types
for all
using (public.is_super_admin_global() or public.has_company_role(company_id, array['hr','direction']::public.app_role[]))
with check (public.is_super_admin_global() or public.has_company_role(company_id, array['hr','direction']::public.app_role[]));

create policy leave_policies_select_member on public.leave_policies
for select using (public.is_company_member(company_id));
create policy leave_policies_write_admin on public.leave_policies
for all
using (public.is_super_admin_global() or public.has_company_role(company_id, array['hr','direction']::public.app_role[]))
with check (public.is_super_admin_global() or public.has_company_role(company_id, array['hr','direction']::public.app_role[]));

create policy leave_balances_select_scope on public.leave_balances
for select
using (
  public.is_super_admin_global()
  or public.has_company_role(company_id, array['hr','direction']::public.app_role[])
  or public.is_self_employee(company_id, employee_id)
  or public.can_manage_employee(company_id, employee_id)
);

create policy leave_balances_write_admin on public.leave_balances
for all
using (public.is_super_admin_global() or public.has_company_role(company_id, array['hr','direction']::public.app_role[]))
with check (public.is_super_admin_global() or public.has_company_role(company_id, array['hr','direction']::public.app_role[]));

create policy leave_balance_transactions_select_scope on public.leave_balance_transactions
for select
using (
  public.is_super_admin_global()
  or public.has_company_role(company_id, array['hr','direction']::public.app_role[])
  or public.is_self_employee(company_id, employee_id)
  or public.can_manage_employee(company_id, employee_id)
);

create policy leave_balance_transactions_write_admin on public.leave_balance_transactions
for all
using (public.is_super_admin_global() or public.has_company_role(company_id, array['hr','direction']::public.app_role[]))
with check (public.is_super_admin_global() or public.has_company_role(company_id, array['hr','direction']::public.app_role[]));

-- =========================================================
-- Leave workflow tables
-- =========================================================
create policy leave_requests_select_scope on public.leave_requests
for select
using (
  public.is_super_admin_global()
  or public.has_company_role(company_id, array['hr','direction']::public.app_role[])
  or public.is_self_employee(company_id, employee_id)
  or public.can_manage_employee(company_id, employee_id)
);

create policy leave_requests_insert_scope on public.leave_requests
for insert
with check (
  public.is_super_admin_global()
  or public.has_company_role(company_id, array['hr','direction']::public.app_role[])
  or public.is_self_employee(company_id, employee_id)
);

create policy leave_requests_update_scope on public.leave_requests
for update
using (
  public.is_super_admin_global()
  or public.has_company_role(company_id, array['hr','direction']::public.app_role[])
  or public.is_self_employee(company_id, employee_id)
  or public.can_manage_employee(company_id, employee_id)
)
with check (
  public.is_super_admin_global()
  or public.has_company_role(company_id, array['hr','direction']::public.app_role[])
  or public.is_self_employee(company_id, employee_id)
  or public.can_manage_employee(company_id, employee_id)
);

create policy leave_request_days_select_scope on public.leave_request_days
for select
using (public.is_company_member(company_id));

create policy leave_request_days_write_scope on public.leave_request_days
for all
using (
  public.is_super_admin_global()
  or public.has_company_role(company_id, array['hr','direction']::public.app_role[])
  or exists (
    select 1
    from public.leave_requests lr
    where lr.id = leave_request_days.leave_request_id
      and lr.company_id = leave_request_days.company_id
      and public.is_self_employee(lr.company_id, lr.employee_id)
  )
)
with check (
  public.is_super_admin_global()
  or public.has_company_role(company_id, array['hr','direction']::public.app_role[])
  or exists (
    select 1
    from public.leave_requests lr
    where lr.id = leave_request_days.leave_request_id
      and lr.company_id = leave_request_days.company_id
      and public.is_self_employee(lr.company_id, lr.employee_id)
  )
);

create policy leave_approvals_select_scope on public.leave_approvals
for select
using (public.is_company_member(company_id));

create policy leave_approvals_update_approver_or_admin on public.leave_approvals
for update
using (
  public.is_super_admin_global()
  or public.has_company_role(company_id, array['hr','direction']::public.app_role[])
  or approver_user_id = auth.uid()
)
with check (
  public.is_super_admin_global()
  or public.has_company_role(company_id, array['hr','direction']::public.app_role[])
  or approver_user_id = auth.uid()
);

create policy leave_approvals_insert_admin on public.leave_approvals
for insert
with check (
  public.is_super_admin_global()
  or public.has_company_role(company_id, array['hr','direction','manager']::public.app_role[])
);

create policy leave_cancellations_select_scope on public.leave_cancellations
for select
using (public.is_company_member(company_id));

create policy leave_cancellations_write_scope on public.leave_cancellations
for all
using (
  public.is_super_admin_global()
  or public.has_company_role(company_id, array['hr','direction']::public.app_role[])
  or initiated_by_user_id = auth.uid()
)
with check (
  public.is_super_admin_global()
  or public.has_company_role(company_id, array['hr','direction']::public.app_role[])
  or initiated_by_user_id = auth.uid()
);

-- =========================================================
-- Support tables
-- =========================================================
create policy holidays_calendar_select_member on public.holidays_calendar
for select using (public.is_company_member(company_id));
create policy holidays_calendar_write_admin on public.holidays_calendar
for all
using (public.is_super_admin_global() or public.has_company_role(company_id, array['hr','direction']::public.app_role[]))
with check (public.is_super_admin_global() or public.has_company_role(company_id, array['hr','direction']::public.app_role[]));

create policy blackout_periods_select_member on public.blackout_periods
for select using (public.is_company_member(company_id));
create policy blackout_periods_write_admin on public.blackout_periods
for all
using (public.is_super_admin_global() or public.has_company_role(company_id, array['hr','direction']::public.app_role[]))
with check (public.is_super_admin_global() or public.has_company_role(company_id, array['hr','direction']::public.app_role[]));

create policy staffing_rules_select_member on public.staffing_rules
for select using (public.is_company_member(company_id));
create policy staffing_rules_write_admin on public.staffing_rules
for all
using (public.is_super_admin_global() or public.has_company_role(company_id, array['hr','direction']::public.app_role[]))
with check (public.is_super_admin_global() or public.has_company_role(company_id, array['hr','direction']::public.app_role[]));

create policy notifications_select_self_or_admin on public.notifications
for select
using (
  user_id = auth.uid()
  or public.is_super_admin_global()
  or public.has_company_role(company_id, array['hr','direction']::public.app_role[])
);

create policy notifications_write_admin_or_self on public.notifications
for all
using (
  user_id = auth.uid()
  or public.is_super_admin_global()
  or public.has_company_role(company_id, array['hr','direction']::public.app_role[])
)
with check (
  user_id = auth.uid()
  or public.is_super_admin_global()
  or public.has_company_role(company_id, array['hr','direction']::public.app_role[])
);

-- =========================================================
-- Audit logs (append-only + restricted visibility)
-- =========================================================
create policy audit_logs_select_admin on public.audit_logs
for select
using (
  public.is_super_admin_global()
  or (company_id is not null and public.has_company_role(company_id, array['hr','direction']::public.app_role[]))
);

create policy audit_logs_insert_member on public.audit_logs
for insert
with check (
  public.is_super_admin_global()
  or (company_id is not null and public.is_company_member(company_id))
);

-- no update/delete policies => blocked by trigger + no RLS policy path
