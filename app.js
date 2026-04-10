import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cfgKey = 'supabase_config_v1';
const readConfig = () => JSON.parse(localStorage.getItem(cfgKey) || 'null');
const saveConfig = (cfg) => localStorage.setItem(cfgKey, JSON.stringify(cfg));

const state = { supabase: null, session: null, profile: null, conges: [], soldes: null, view: 'dashboard' };

const el = {
  authCard: document.querySelector('#auth-card'),
  dashboard: document.querySelector('#dashboard-view'),
  demande: document.querySelector('#demande-view'),
  validation: document.querySelector('#validation-view'),
  config: document.querySelector('#config-view'),
  userLabel: document.querySelector('#user-label'),
  pageTitle: document.querySelector('#page-title'),
  loginForm: document.querySelector('#login-form'),
  logoutBtn: document.querySelector('#logout-btn'),
  configForm: document.querySelector('#config-form')
};

const format = (d) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(`${d}T00:00:00`));
const workdays = (start, end) => {
  let n = 0; const cur = new Date(`${start}T00:00:00`); const last = new Date(`${end}T00:00:00`);
  while (cur <= last) { const day = cur.getDay(); if (day !== 0 && day !== 6) n += 1; cur.setDate(cur.getDate() + 1); }
  return n;
};
const statusBadge = (s) => ({ en_attente:'<span class="badge b-pending">En attente</span>', valide_chef:'<span class="badge b-ok">Validé chef</span>', valide_direction:'<span class="badge b-ok">Validé direction</span>', refuse_chef:'<span class="badge b-ko">Refusé chef</span>', refuse_direction:'<span class="badge b-ko">Refusé direction</span>' }[s] || s);

function initClient() {
  const cfg = readConfig();
  if (!cfg?.url || !cfg?.anonKey) return null;
  state.supabase = createClient(cfg.url, cfg.anonKey);
  return state.supabase;
}

async function refreshData() {
  if (!state.supabase || !state.session) return;
  const userId = state.session.user.id;
  const [{ data: profile }, { data: conges }, { data: soldes }] = await Promise.all([
    state.supabase.from('profiles').select('*').eq('id', userId).single(),
    state.supabase.from('conges').select('*').order('created_at', { ascending: false }),
    state.supabase.from('soldes').select('*').eq('user_id', userId).single()
  ]);

  state.profile = profile;
  state.conges = (conges || []).filter((c) => {
    if (!profile) return false;
    if (['direction', 'admin'].includes(profile.role)) return true;
    if (profile.role === 'chef_service') return c.user_id === userId || c.team_id === profile.team_id;
    return c.user_id === userId;
  });
  state.soldes = soldes;
}

function setView(view) {
  state.view = view;
  document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  el.pageTitle.textContent = view[0].toUpperCase() + view.slice(1);
  el.dashboard.classList.toggle('hidden', view !== 'dashboard');
  el.demande.classList.toggle('hidden', view !== 'demande');
  el.validation.classList.toggle('hidden', view !== 'validation');
  el.config.classList.toggle('hidden', view !== 'config');
}

function renderDashboard() {
  const total = state.conges.length;
  const pending = state.conges.filter((c) => c.statut === 'en_attente' || c.statut === 'valide_chef').length;
  const remain = state.soldes?.cp_restant ?? 0;
  el.dashboard.innerHTML = `<h3>Vue globale</h3><div class="kpis"><div class="kpi"><strong>Solde restant</strong><p>${remain.toFixed(2)} jours</p></div><div class="kpi"><strong>Demandes</strong><p>${total}</p></div><div class="kpi"><strong>En cours</strong><p>${pending}</p></div></div><div class="table-wrap"><table><thead><tr><th>Type</th><th>Période</th><th>Jours</th><th>Statut</th></tr></thead><tbody>${state.conges.slice(0,8).map((c)=>`<tr><td>${c.type}</td><td>${format(c.date_debut)} → ${format(c.date_fin)}</td><td>${c.nb_jours}</td><td>${statusBadge(c.statut)}</td></tr>`).join('') || '<tr><td colspan="4">Aucune donnée</td></tr>'}</tbody></table></div>`;
}

function renderDemande() {
  el.demande.innerHTML = `<h3>Nouvelle demande</h3><form id="req-form"><div class="grid-2"><label>Type<select name="type"><option value="cp">Congés payés</option><option value="rtt">RTT</option><option value="sans_solde">Sans solde</option></select></label><label>Date début<input type="date" name="start" required /></label><label>Date fin<input type="date" name="end" required /></label><label>Jours calculés<input name="days" readonly /></label></div><label>Commentaire public<textarea name="commentaire_public" rows="2"></textarea></label><label>Commentaire privé (chef/direction)<textarea name="commentaire_prive" rows="2"></textarea></label><div class="actions"><button type="submit">Déposer la demande</button><span id="req-status" class="muted"></span></div></form>`;
  const form = document.querySelector('#req-form');
  const daysInput = form.elements.days;
  const recalc = () => {
    const s = form.elements.start.value; const e = form.elements.end.value;
    daysInput.value = s && e && new Date(e) >= new Date(s) ? String(workdays(s, e)) : '0';
  };
  form.elements.start.addEventListener('change', recalc); form.elements.end.addEventListener('change', recalc);

  form.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    const start = form.elements.start.value; const end = form.elements.end.value; const type = form.elements.type.value;
    const nb = workdays(start, end); const status = document.querySelector('#req-status');
    if (!start || !end || new Date(end) < new Date(start)) return void (status.textContent = 'Dates invalides');
    if (type === 'cp' && nb > (state.soldes?.cp_restant ?? 0)) return void (status.textContent = 'Solde insuffisant');
    const overlap = state.conges.some((c) => c.user_id === state.session.user.id && !['refuse_chef','refuse_direction'].includes(c.statut) && !(c.date_fin < start || c.date_debut > end));
    if (overlap) return void (status.textContent = 'Chevauchement détecté');

    const { error } = await state.supabase.from('conges').insert({
      user_id: state.session.user.id,
      type,
      date_debut: start,
      date_fin: end,
      nb_jours: nb,
      statut: 'en_attente',
      commentaire_public: form.elements.commentaire_public.value || null,
      commentaire_prive: form.elements.commentaire_prive.value || null
    });
    if (error) return void (status.textContent = error.message);
    status.textContent = 'Demande créée';
    await refreshData(); renderDashboard(); renderValidation();
  });
}

function renderValidation() {
  const role = state.profile?.role;
  if (!['chef_service', 'direction', 'admin'].includes(role || '')) {
    el.validation.innerHTML = '<p>Vous n\'avez pas les droits de validation.</p>';
    return;
  }

  const rows = state.conges.filter((c) => (role === 'chef_service' ? c.statut === 'en_attente' : c.statut === 'valide_chef'));
  el.validation.innerHTML = `<h3>Validation des demandes</h3><div class="table-wrap"><table><thead><tr><th>Période</th><th>Type</th><th>Jours</th><th>Statut</th><th>Commentaire</th><th>Action</th></tr></thead><tbody>${rows.map((r)=>`<tr><td>${format(r.date_debut)} → ${format(r.date_fin)}</td><td>${r.type}</td><td>${r.nb_jours}</td><td>${statusBadge(r.statut)}</td><td><input data-com="${r.id}" placeholder="Commentaire" /></td><td><button data-ok="${r.id}">Valider</button> <button class="danger" data-ko="${r.id}">Refuser</button></td></tr>`).join('') || '<tr><td colspan="6">Aucune demande à traiter</td></tr>'}</tbody></table></div>`;

  const update = async (id, decision) => {
    const comment = document.querySelector(`[data-com="${id}"]`)?.value || null;
    const next = role === 'chef_service' ? (decision === 'ok' ? 'valide_chef' : 'refuse_chef') : (decision === 'ok' ? 'valide_direction' : 'refuse_direction');
    const { error } = await state.supabase.from('conges').update({ statut: next, commentaire_prive: comment }).eq('id', id);
    if (!error) {
      await state.supabase.from('historiques').insert({ conge_id: id, action: decision === 'ok' ? 'validation' : 'refus', auteur_id: state.session.user.id, commentaire: comment });
      await refreshData(); renderDashboard(); renderValidation();
    }
  };

  el.validation.querySelectorAll('[data-ok]').forEach((b) => b.addEventListener('click', () => update(b.dataset.ok, 'ok')));
  el.validation.querySelectorAll('[data-ko]').forEach((b) => b.addEventListener('click', () => update(b.dataset.ko, 'ko')));
}

async function loadSession() {
  const client = initClient();
  if (!client) return;
  const { data } = await client.auth.getSession();
  state.session = data.session;
  if (state.session) {
    await refreshData();
    el.authCard.classList.add('hidden');
    el.userLabel.textContent = `${state.profile?.prenom ?? ''} ${state.profile?.nom ?? ''} (${state.profile?.role ?? ''})`;
    renderDashboard(); renderDemande(); renderValidation();
  }
}

el.loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = document.querySelector('#login-status');
  initClient();
  if (!state.supabase) return void (status.textContent = 'Configurez Supabase d\'abord');
  const fd = new FormData(el.loginForm);
  const { error, data } = await state.supabase.auth.signInWithPassword({ email: String(fd.get('email')), password: String(fd.get('password')) });
  if (error) return void (status.textContent = error.message);
  state.session = data.session; await refreshData();
  el.authCard.classList.add('hidden');
  el.userLabel.textContent = `${state.profile?.prenom ?? ''} ${state.profile?.nom ?? ''} (${state.profile?.role ?? ''})`;
  renderDashboard(); renderDemande(); renderValidation(); setView('dashboard');
});

el.logoutBtn.addEventListener('click', async () => {
  if (state.supabase) await state.supabase.auth.signOut();
  state.session = null; state.profile = null; state.conges = []; state.soldes = null;
  el.userLabel.textContent = 'Non connecté';
  el.authCard.classList.remove('hidden');
});

el.configForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(el.configForm);
  saveConfig({ url: String(fd.get('url')).trim(), anonKey: String(fd.get('anonKey')).trim() });
  document.querySelector('#config-status').textContent = 'Configuration enregistrée.';
  initClient();
});

document.querySelectorAll('.nav-btn').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));

const cfg = readConfig();
if (cfg) {
  el.configForm.elements.url.value = cfg.url;
  el.configForm.elements.anonKey.value = cfg.anonKey;
}
setView('dashboard');
loadSession();
