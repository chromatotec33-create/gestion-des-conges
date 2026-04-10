-- Phase finalization: group configuration inheritance & propagation

create table if not exists public.group_configurations (
  id uuid primary key default gen_random_uuid(),
  config_key text not null,
  company_id uuid references public.companies(id) on delete cascade,
  value jsonb not null,
  inheritance_mode text not null default 'local' check (inheritance_mode in ('group_default', 'local_override', 'local')),
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (config_key, company_id)
);

create index if not exists group_configurations_company_idx on public.group_configurations (company_id, config_key);
create index if not exists group_configurations_group_defaults_idx on public.group_configurations (config_key) where company_id is null;

create table if not exists public.group_configuration_propagations (
  id uuid primary key default gen_random_uuid(),
  source_company_id uuid not null references public.companies(id) on delete cascade,
  config_key text not null,
  old_value jsonb,
  new_value jsonb not null,
  apply_mode text not null check (apply_mode in ('current_only', 'all', 'selected')),
  target_company_ids uuid[] not null,
  initiated_by_user_id uuid not null references public.users(id) on delete restrict,
  initiated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.propagate_group_configuration(
  p_source_company_id uuid,
  p_config_key text,
  p_new_value jsonb,
  p_apply_mode text,
  p_target_company_ids uuid[],
  p_initiated_by_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_propagation_id uuid;
  v_old_value jsonb;
  v_targets uuid[];
  v_company_id uuid;
begin
  if p_apply_mode not in ('current_only', 'all', 'selected') then
    raise exception 'Invalid apply mode: %', p_apply_mode;
  end if;

  select value into v_old_value
  from public.group_configurations
  where company_id = p_source_company_id
    and config_key = p_config_key;

  if p_apply_mode = 'current_only' then
    v_targets := array[p_source_company_id];
  elsif p_apply_mode = 'all' then
    select array_agg(id)::uuid[]
    into v_targets
    from public.companies;
  else
    v_targets := p_target_company_ids;
  end if;

  if v_targets is null or array_length(v_targets, 1) is null then
    raise exception 'No target companies provided';
  end if;

  foreach v_company_id in array v_targets loop
    insert into public.group_configurations (config_key, company_id, value, inheritance_mode, updated_by)
    values (p_config_key, v_company_id, p_new_value, case when v_company_id = p_source_company_id then 'local' else 'group_default' end, p_initiated_by_user_id)
    on conflict (config_key, company_id)
    do update
      set value = excluded.value,
          inheritance_mode = excluded.inheritance_mode,
          updated_by = excluded.updated_by,
          updated_at = timezone('utc', now());

    insert into public.audit_logs (
      company_id,
      actor_user_id,
      action,
      entity_name,
      entity_id,
      before_data,
      after_data,
      reason,
      metadata
    )
    values (
      v_company_id,
      p_initiated_by_user_id,
      'group_config.propagated',
      'group_configurations',
      p_config_key,
      jsonb_build_object('value', v_old_value),
      jsonb_build_object('value', p_new_value),
      'Propagation inter-sociétés',
      jsonb_build_object('apply_mode', p_apply_mode, 'source_company_id', p_source_company_id)
    );
  end loop;

  insert into public.group_configuration_propagations (
    source_company_id,
    config_key,
    old_value,
    new_value,
    apply_mode,
    target_company_ids,
    initiated_by_user_id
  )
  values (
    p_source_company_id,
    p_config_key,
    v_old_value,
    p_new_value,
    p_apply_mode,
    v_targets,
    p_initiated_by_user_id
  )
  returning id into v_propagation_id;

  return v_propagation_id;
end;
$$;

alter table public.group_configurations enable row level security;
alter table public.group_configuration_propagations enable row level security;

create policy group_configurations_select_member
on public.group_configurations
for select
using (company_id is null or public.is_company_member(company_id));

create policy group_configurations_write_admin
on public.group_configurations
for all
using (company_id is null or public.has_company_role(company_id, array['hr','direction','super_admin']::public.app_role[]) or public.is_super_admin_global())
with check (company_id is null or public.has_company_role(company_id, array['hr','direction','super_admin']::public.app_role[]) or public.is_super_admin_global());

create policy group_configuration_propagations_select_admin
on public.group_configuration_propagations
for select
using (public.is_super_admin_global() or public.has_company_role(source_company_id, array['hr','direction']::public.app_role[]));

create policy group_configuration_propagations_insert_admin
on public.group_configuration_propagations
for insert
with check (public.is_super_admin_global() or public.has_company_role(source_company_id, array['hr','direction']::public.app_role[]));

create trigger trg_group_configurations_updated_at
before update on public.group_configurations
for each row execute function public.set_updated_at();
