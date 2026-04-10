-- Seed fake accounts + demo data for leave-management testing
-- Password for all demo users: DemoPass123!

create extension if not exists pgcrypto;

do $$
declare
  v_employee_id uuid;
  v_chef_id uuid;
  v_direction_id uuid;
  v_admin_id uuid;
  v_company_team uuid := gen_random_uuid();
  v_conge_1 uuid;
  v_conge_2 uuid;
  v_conge_3 uuid;
begin
  -- 1) Create demo auth users if missing
  insert into auth.users (
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
  )
  values
    (
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'salarie.demo@company.test',
      crypt('DemoPass123!', gen_salt('bf')),
      now(), now(), now(), now(),
      jsonb_build_object('provider','email','providers', jsonb_build_array('email')),
      jsonb_build_object('nom','Dupont','prenom','Alice','role','employe','date_embauche','2023-02-15','type_conges','mensuel')
    ),
    (
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'chef.demo@company.test',
      crypt('DemoPass123!', gen_salt('bf')),
      now(), now(), now(), now(),
      jsonb_build_object('provider','email','providers', jsonb_build_array('email')),
      jsonb_build_object('nom','Martin','prenom','Karim','role','chef_service','date_embauche','2021-09-01','type_conges','mensuel')
    ),
    (
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'direction.demo@company.test',
      crypt('DemoPass123!', gen_salt('bf')),
      now(), now(), now(), now(),
      jsonb_build_object('provider','email','providers', jsonb_build_array('email')),
      jsonb_build_object('nom','Bernard','prenom','Sophie','role','direction','date_embauche','2018-01-10','type_conges','annuel')
    ),
    (
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin.demo@company.test',
      crypt('DemoPass123!', gen_salt('bf')),
      now(), now(), now(), now(),
      jsonb_build_object('provider','email','providers', jsonb_build_array('email')),
      jsonb_build_object('nom','Nguyen','prenom','Paul','role','admin','date_embauche','2017-04-20','type_conges','annuel')
    )
  on conflict (email) do nothing;

  select id into v_employee_id from auth.users where email = 'salarie.demo@company.test';
  select id into v_chef_id from auth.users where email = 'chef.demo@company.test';
  select id into v_direction_id from auth.users where email = 'direction.demo@company.test';
  select id into v_admin_id from auth.users where email = 'admin.demo@company.test';

  -- 2) Upsert profiles with roles + same team for employee/chef
  insert into public.profiles (id, email, role, nom, prenom, date_embauche, type_conges, team_id, created_at, updated_at)
  values
    (v_employee_id, 'salarie.demo@company.test', 'employe', 'Dupont', 'Alice', '2023-02-15', 'mensuel', v_company_team, now(), now()),
    (v_chef_id, 'chef.demo@company.test', 'chef_service', 'Martin', 'Karim', '2021-09-01', 'mensuel', v_company_team, now(), now()),
    (v_direction_id, 'direction.demo@company.test', 'direction', 'Bernard', 'Sophie', '2018-01-10', 'annuel', gen_random_uuid(), now(), now()),
    (v_admin_id, 'admin.demo@company.test', 'admin', 'Nguyen', 'Paul', '2017-04-20', 'annuel', gen_random_uuid(), now(), now())
  on conflict (id) do update set
    role = excluded.role,
    nom = excluded.nom,
    prenom = excluded.prenom,
    date_embauche = excluded.date_embauche,
    type_conges = excluded.type_conges,
    team_id = excluded.team_id,
    updated_at = now();

  -- 3) Demo soldes
  insert into public.soldes(user_id, cp_acquis, cp_pris, cp_restant, updated_at)
  values
    (v_employee_id, 25, 8, 17, now()),
    (v_chef_id, 25, 10, 15, now()),
    (v_direction_id, 25, 5, 20, now()),
    (v_admin_id, 25, 3, 22, now())
  on conflict (user_id) do update set
    cp_acquis = excluded.cp_acquis,
    cp_pris = excluded.cp_pris,
    cp_restant = excluded.cp_restant,
    updated_at = now();

  -- 4) Demo conges
  insert into public.conges(user_id, type, date_debut, date_fin, nb_jours, statut, commentaire_public, commentaire_prive, created_at, updated_at)
  values
    (v_employee_id, 'cp', current_date + 12, current_date + 16, 5, 'en_attente', 'Vacances scolaires', 'Pré-check manager demandé', now(), now()),
    (v_employee_id, 'rtt', current_date + 20, current_date + 20, 1, 'valide_chef', 'RTT ponctuel', 'Ok chef, attente direction', now(), now()),
    (v_employee_id, 'sans_solde', current_date - 25, current_date - 22, 4, 'valide_direction', 'Déplacement personnel', 'Validé final', now(), now())
  on conflict do nothing;

  -- fetch created conges ids
  select id into v_conge_1 from public.conges where user_id = v_employee_id and statut = 'en_attente' order by created_at desc limit 1;
  select id into v_conge_2 from public.conges where user_id = v_employee_id and statut = 'valide_chef' order by created_at desc limit 1;
  select id into v_conge_3 from public.conges where user_id = v_employee_id and statut = 'valide_direction' order by created_at desc limit 1;

  -- 5) Demo historiques
  insert into public.historiques(conge_id, action, auteur_id, commentaire, created_at)
  values
    (v_conge_1, 'creation', v_employee_id, 'Demande initiale déposée', now() - interval '2 day'),
    (v_conge_2, 'creation', v_employee_id, 'Demande RTT', now() - interval '7 day'),
    (v_conge_2, 'validation', v_chef_id, 'Pré-validation chef', now() - interval '6 day'),
    (v_conge_3, 'creation', v_employee_id, 'Sans solde', now() - interval '30 day'),
    (v_conge_3, 'validation', v_chef_id, 'Validation chef', now() - interval '29 day'),
    (v_conge_3, 'validation', v_direction_id, 'Validation direction finale', now() - interval '28 day')
  on conflict do nothing;
end $$;
