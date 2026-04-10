-- Full leave management schema (profiles/conges/soldes/historiques) with RLS
create extension if not exists pgcrypto;

create type public.user_role as enum ('employe', 'chef_service', 'direction', 'admin');
create type public.type_conges_mode as enum ('mensuel', 'annuel');
create type public.type_conge as enum ('cp', 'sans_solde', 'rtt');
create type public.statut_conge as enum ('en_attente', 'valide_chef', 'refuse_chef', 'valide_direction', 'refuse_direction');
create type public.historique_action as enum ('creation', 'validation', 'refus');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role public.user_role not null default 'employe',
  nom text not null,
  prenom text not null,
  date_embauche date not null,
  type_conges public.type_conges_mode not null default 'mensuel',
  team_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.type_conge not null,
  date_debut date not null,
  date_fin date not null,
  nb_jours numeric(6,2) not null check (nb_jours > 0),
  statut public.statut_conge not null default 'en_attente',
  commentaire_public text,
  commentaire_prive text,
  bon_acceptation_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conges_date_range_check check (date_fin >= date_debut)
);

create table if not exists public.soldes (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  cp_acquis numeric(6,2) not null default 0,
  cp_pris numeric(6,2) not null default 0,
  cp_restant numeric(6,2) not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.historiques (
  id uuid primary key default gen_random_uuid(),
  conge_id uuid not null references public.conges(id) on delete cascade,
  action public.historique_action not null,
  auteur_id uuid not null references public.profiles(id) on delete cascade,
  commentaire text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_profile_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, nom, prenom, date_embauche, type_conges)
  values (
    new.id,
    coalesce(new.email, ''),
    'employe',
    coalesce(new.raw_user_meta_data ->> 'nom', 'N/A'),
    coalesce(new.raw_user_meta_data ->> 'prenom', 'N/A'),
    coalesce((new.raw_user_meta_data ->> 'date_embauche')::date, current_date),
    coalesce((new.raw_user_meta_data ->> 'type_conges')::public.type_conges_mode, 'mensuel')
  )
  on conflict (id) do nothing;

  insert into public.soldes (user_id, cp_acquis, cp_pris, cp_restant)
  values (new.id, 0, 0, 0)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_profile_created();

create or replace function public.business_days_between(start_date date, end_date date)
returns numeric
language sql
immutable
as $$
  select count(*)::numeric
  from generate_series(start_date, end_date, interval '1 day') as d
  where extract(isodow from d) < 6;
$$;

create or replace function public.compute_cp_acquis(p_user_id uuid)
returns numeric
language plpgsql
stable
as $$
declare
  profile_row public.profiles;
  months_worked numeric;
  years_worked numeric;
begin
  select * into profile_row from public.profiles where id = p_user_id;
  if not found then return 0; end if;

  if profile_row.type_conges = 'mensuel' then
    months_worked := greatest(0, (date_part('year', age(current_date, profile_row.date_embauche)) * 12) + date_part('month', age(current_date, profile_row.date_embauche)));
    return round(months_worked * 2.0833, 2);
  end if;

  years_worked := date_part('year', age(current_date, profile_row.date_embauche));
  if years_worked < 1 then return 0; end if;
  return 25;
end;
$$;

create or replace function public.refresh_solde(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_acquis numeric;
  v_pris numeric;
begin
  v_acquis := public.compute_cp_acquis(p_user_id);
  select coalesce(sum(nb_jours), 0)
  into v_pris
  from public.conges
  where user_id = p_user_id
    and type = 'cp'
    and statut in ('valide_chef', 'valide_direction');

  insert into public.soldes(user_id, cp_acquis, cp_pris, cp_restant, updated_at)
  values (p_user_id, v_acquis, v_pris, greatest(v_acquis - v_pris, 0), now())
  on conflict (user_id)
  do update set
    cp_acquis = excluded.cp_acquis,
    cp_pris = excluded.cp_pris,
    cp_restant = excluded.cp_restant,
    updated_at = excluded.updated_at;
end;
$$;

create or replace function public.is_request_overlapping(p_user_id uuid, p_start date, p_end date)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.conges c
    where c.user_id = p_user_id
      and c.statut not in ('refuse_chef', 'refuse_direction')
      and daterange(c.date_debut, c.date_fin, '[]') && daterange(p_start, p_end, '[]')
  );
$$;

create or replace function public.before_insert_conges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_solde numeric;
begin
  new.nb_jours := public.business_days_between(new.date_debut, new.date_fin);
  if new.nb_jours <= 0 then
    raise exception 'La période ne contient aucun jour ouvré';
  end if;

  if public.is_request_overlapping(new.user_id, new.date_debut, new.date_fin) then
    raise exception 'Chevauchement détecté avec une autre demande';
  end if;

  perform public.refresh_solde(new.user_id);
  select cp_restant into v_solde from public.soldes where user_id = new.user_id;

  if new.type = 'cp' and coalesce(v_solde, 0) < new.nb_jours then
    raise exception 'Solde insuffisant';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_before_insert_conges on public.conges;
create trigger trg_before_insert_conges
before insert on public.conges
for each row execute function public.before_insert_conges();

create or replace function public.after_conges_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_solde(coalesce(new.user_id, old.user_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_after_conges_mutation on public.conges;
create trigger trg_after_conges_mutation
after insert or update or delete on public.conges
for each row execute function public.after_conges_mutation();

alter table public.profiles enable row level security;
alter table public.conges enable row level security;
alter table public.soldes enable row level security;
alter table public.historiques enable row level security;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create policy "profiles_self_or_admin"
on public.profiles
for select
using (id = auth.uid() or public.current_user_role() in ('admin', 'direction'));

create policy "profiles_admin_update"
on public.profiles
for update
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "conges_insert_own"
on public.conges
for insert
with check (user_id = auth.uid());

create policy "conges_select_own_team_all"
on public.conges
for select
using (
  user_id = auth.uid()
  or (
    public.current_user_role() = 'chef_service'
    and exists (
      select 1
      from public.profiles me
      join public.profiles u on u.id = conges.user_id
      where me.id = auth.uid() and me.team_id is not null and me.team_id = u.team_id
    )
  )
  or public.current_user_role() in ('direction', 'admin')
);

create policy "conges_update_workflow"
on public.conges
for update
using (
  user_id = auth.uid()
  or public.current_user_role() in ('chef_service', 'direction', 'admin')
)
with check (
  user_id = auth.uid()
  or public.current_user_role() in ('chef_service', 'direction', 'admin')
);

create policy "soldes_select_own_team_all"
on public.soldes
for select
using (
  user_id = auth.uid()
  or (
    public.current_user_role() = 'chef_service'
    and exists (
      select 1
      from public.profiles me
      join public.profiles u on u.id = soldes.user_id
      where me.id = auth.uid() and me.team_id is not null and me.team_id = u.team_id
    )
  )
  or public.current_user_role() in ('direction', 'admin')
);

create policy "historiques_select_own_team_all"
on public.historiques
for select
using (
  exists (
    select 1
    from public.conges c
    where c.id = historiques.conge_id
      and (
        c.user_id = auth.uid()
        or public.current_user_role() in ('direction', 'admin')
        or (
          public.current_user_role() = 'chef_service'
          and exists (
            select 1 from public.profiles me
            join public.profiles u on u.id = c.user_id
            where me.id = auth.uid() and me.team_id is not null and me.team_id = u.team_id
          )
        )
      )
  )
);

create policy "historiques_insert_by_authenticated"
on public.historiques
for insert
with check (auteur_id = auth.uid());

create or replace function public.log_conges_creation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.historiques(conge_id, action, auteur_id, commentaire)
  values (new.id, 'creation', new.user_id, coalesce(new.commentaire_public, 'Demande créée'));
  return new;
end;
$$;

drop trigger if exists trg_log_conges_creation on public.conges;
create trigger trg_log_conges_creation
after insert on public.conges
for each row execute function public.log_conges_creation();
