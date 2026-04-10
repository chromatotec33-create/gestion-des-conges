import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const env = window.__APP_ENV || {};
const LS = { drafts: 'drafts_v1', banner: 'global_banner_v1', settings: 'direction_settings_v1', holidays: 'holidays_v1', redDays: 'red_days_v1' };
const state = { supabase: null, session: null, profile: null, conges: [], soldes: null, view: 'dashboard' };

const el = {
  authCard: document.querySelector('#auth-card'), banner: document.querySelector('#global-banner'),
  dashboard: document.querySelector('#dashboard-view'), demande: document.querySelector('#demande-view'), suivi: document.querySelector('#suivi-view'), validation: document.querySelector('#validation-view'), calendar: document.querySelector('#calendar-view'), gestion: document.querySelector('#gestion-view'),
  userLabel: document.querySelector('#user-label'), envLabel: document.querySelector('#env-label'), pageTitle: document.querySelector('#page-title'),
  loginForm: document.querySelector('#login-form'), logoutBtn: document.querySelector('#logout-btn')
};

const parse = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(d)); } catch { return d; } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const fDate = (d) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(`${d}T00:00:00`));
const workdays = (s, e) => { let n=0; const c=new Date(`${s}T00:00:00`); const l=new Date(`${e}T00:00:00`); while(c<=l){const d=c.getDay(); if(d!==0&&d!==6)n++; c.setDate(c.getDate()+1);} return n; };
const roleName = (r) => ({ employe:'Salarié', chef_service:'Chef de service', direction:'Direction', admin:'RH / Admin' }[r] || r);

function statusProgress(status){
  const order=['en_attente','valide_chef','valide_direction'];
  const idx=status==='refuse_chef'||status==='refuse_direction'?-1:order.indexOf(status);
  const labels=['Demandé','En cours étude','Validé chef','Validé direction','VALIDÉ'];
  return labels.map((l,i)=>`<div class="step ${idx<0&&i===1?'current':''} ${idx>=0&&i<=idx+1?'done':''}">${l}</div>`).join('');
}

function initClient(){
  if(!env.NEXT_PUBLIC_SUPABASE_URL||!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
  state.supabase=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.NEXT_PUBLIC_SUPABASE_ANON_KEY); return state.supabase;
}

async function refreshData(){
  if(!state.supabase||!state.session) return;
  const uid=state.session.user.id;
  const [{data:profile},{data:conges},{data:soldes}] = await Promise.all([
    state.supabase.from('profiles').select('*').eq('id',uid).single(),
    state.supabase.from('conges').select('*').order('created_at',{ascending:false}),
    state.supabase.from('soldes').select('*').eq('user_id',uid).single()
  ]);
  state.profile=profile; state.soldes=soldes;
  state.conges=(conges||[]).filter((c)=>{
    if(['direction','admin'].includes(profile?.role)) return true;
    if(profile?.role==='chef_service') return c.user_id===uid || c.team_id===profile.team_id;
    return c.user_id===uid;
  });
}

function setView(v){
  state.view=v; document.querySelectorAll('.nav-btn').forEach((b)=>b.classList.toggle('active',b.dataset.view===v));
  el.pageTitle.textContent=v[0].toUpperCase()+v.slice(1);
  ['dashboard','demande','suivi','validation','calendar','gestion'].forEach((k)=>el[k].classList.toggle('hidden',k!==v));
}

function applyRoleUi(){
  const role=state.profile?.role;
  document.querySelectorAll('[data-view="gestion"]').forEach((b)=>b.style.display=['direction','admin'].includes(role)?'block':'none');
  document.querySelectorAll('[data-view="validation"]').forEach((b)=>b.style.display=['chef_service','direction','admin'].includes(role)?'block':'none');
}

function renderBanner(){
  const text=parse(LS.banner,'');
  if(text){ el.banner.classList.remove('hidden'); el.banner.textContent=text; } else el.banner.classList.add('hidden');
}

function renderDashboard(){
  const approved=state.conges.filter((c)=>['valide_chef','valide_direction'].includes(c.statut)).length;
  const pending=state.conges.filter((c)=>['en_attente','valide_chef'].includes(c.statut)).length;
  el.dashboard.innerHTML=`<h3>Bienvenue <span class="role-chip">${roleName(state.profile?.role)}</span></h3><div class="kpis"><div class="kpi"><h4>Solde CP</h4><p>${(state.soldes?.cp_restant??0).toFixed(2)} j</p></div><div class="kpi"><h4>Demandes</h4><p>${state.conges.length}</p></div><div class="kpi"><h4>En cours</h4><p>${pending}</p></div><div class="kpi"><h4>Validées</h4><p>${approved}</p></div></div>`;
}

function myDrafts(){ return parse(LS.drafts,[]).filter((d)=>d.user_id===state.session.user.id); }
function saveDrafts(list){ save(LS.drafts,list); }

function renderDemande(){
  const drafts=myDrafts();
  el.demande.innerHTML=`<h3>Demande salarié</h3><form id="req-form"><div class="grid-3"><label>Motif<select name="type"><option value="cp">Congés payés</option><option value="sans_solde">Congés sans solde</option><option value="autre">Autre</option></select></label><label>Autre (précisez)<input name="other" placeholder="facultatif" /></label><label>Durée<select name="duree"><option value="1">Journée entière</option><option value="0.5">Demi-journée</option></select></label><label>Début<input name="start" type="date" required/></label><label>Fin<input name="end" type="date" required/></label><label>Jours calculés<input name="days" readonly /></label></div><label>Commentaire public<textarea name="commentaire_public" rows="2"></textarea></label><div class="actions"><button type="button" id="save-draft">Sauver brouillon</button><button type="submit">Soumettre</button><span id="req-status" class="muted"></span></div></form><h4>Brouillons</h4><div class="table-wrap"><table><thead><tr><th>Période</th><th>Type</th><th>Action</th></tr></thead><tbody>${drafts.map((d,i)=>`<tr><td>${d.start} → ${d.end}</td><td>${d.type}</td><td><button data-send="${i}">Envoyer</button></td></tr>`).join('')||'<tr><td colspan="3">Aucun brouillon</td></tr>'}</tbody></table></div>`;
  const form=document.querySelector('#req-form'); const status=document.querySelector('#req-status');
  const recalc=()=>{ const s=form.elements.start.value,e=form.elements.end.value,f=Number(form.elements.duree.value||1); form.elements.days.value=s&&e&&new Date(e)>=new Date(s)?(workdays(s,e)*f).toFixed(1):'0'; };
  form.elements.start.addEventListener('change',recalc); form.elements.end.addEventListener('change',recalc); form.elements.duree.addEventListener('change',recalc);

  const submitReq=async(payload)=>{
    const overlap=state.conges.some((c)=>c.user_id===state.session.user.id && !['refuse_chef','refuse_direction'].includes(c.statut) && !(c.date_fin<payload.date_debut||c.date_debut>payload.date_fin));
    if(overlap) throw new Error('Chevauchement détecté');
    if(payload.type==='cp' && payload.nb_jours>(state.soldes?.cp_restant??0)) throw new Error('Solde insuffisant');
    const {error}=await state.supabase.from('conges').insert(payload); if(error) throw new Error(error.message);
  };

  document.querySelector('#save-draft').addEventListener('click',()=>{
    const all=parse(LS.drafts,[]); all.push({user_id:state.session.user.id,type:form.elements.type.value,start:form.elements.start.value,end:form.elements.end.value,duree:form.elements.duree.value,other:form.elements.other.value,comment:form.elements.commentaire_public.value}); saveDrafts(all); status.textContent='Brouillon enregistré'; renderDemande();
  });

  form.addEventListener('submit',async(e)=>{ e.preventDefault(); try{ const type=form.elements.type.value==='autre'?'autre:'+form.elements.other.value:form.elements.type.value; const nb=Number(form.elements.days.value||0); await submitReq({user_id:state.session.user.id,type,date_debut:form.elements.start.value,date_fin:form.elements.end.value,nb_jours:nb,statut:'en_attente',commentaire_public:form.elements.commentaire_public.value||null}); status.textContent='Demande soumise'; await refreshData(); renderDashboard(); renderSuivi(); }catch(err){ status.textContent=err.message; }});

  el.demande.querySelectorAll('[data-send]').forEach((b)=>b.addEventListener('click',async()=>{ const idx=Number(b.dataset.send); const all=parse(LS.drafts,[]); const mine=myDrafts(); const d=mine[idx]; try{ const nb=(workdays(d.start,d.end)*Number(d.duree||1)); await submitReq({user_id:state.session.user.id,type:d.type==='autre'?'autre:'+d.other:d.type,date_debut:d.start,date_fin:d.end,nb_jours:nb,statut:'en_attente',commentaire_public:d.comment||null}); const filtered=all.filter((x)=>!(x.user_id===state.session.user.id&&x.start===d.start&&x.end===d.end&&x.type===d.type)); saveDrafts(filtered); await refreshData(); renderDemande(); renderDashboard(); renderSuivi(); }catch(err){ status.textContent=err.message; }}));
}

function renderSuivi(){
  const mine=state.conges.filter((c)=>c.user_id===state.session.user.id);
  el.suivi.innerHTML=`<h3>Suivi salarié</h3><div class="table-wrap"><table><thead><tr><th>Période</th><th>Motif</th><th>Progression</th><th>Action</th></tr></thead><tbody>${mine.map((c)=>`<tr><td>${fDate(c.date_debut)} → ${fDate(c.date_fin)}</td><td>${c.type}</td><td><div class="progress">${statusProgress(c.statut)}</div></td><td><button data-cancel="${c.id}" class="danger">Demander annulation</button></td></tr>`).join('')||'<tr><td colspan="4">Aucune demande</td></tr>'}</tbody></table></div><p class="muted">⚠️ Une annulation peut entraîner la non-restitution des jours selon la réglementation.</p>`;
  el.suivi.querySelectorAll('[data-cancel]').forEach((b)=>b.addEventListener('click',async()=>{ if(!confirm('Confirmer la demande d\'annulation ? Risque légal de non-récupération des jours.')) return; const {error}=await state.supabase.from('conges').update({commentaire_public:'Demande annulation salarié',statut:'refuse_direction'}).eq('id',b.dataset.cancel); if(!error){ await refreshData(); renderSuivi(); renderDashboard(); }}));
}

function renderValidation(){
  const role=state.profile?.role; if(!['chef_service','direction','admin'].includes(role||'')){ el.validation.innerHTML='<p>Accès réservé.</p>'; return; }
  const base=state.conges.filter((c)=>role==='chef_service'?c.statut==='en_attente':c.statut==='valide_chef');
  el.validation.innerHTML=`<h3>Validation ${roleName(role)}</h3><div class="actions">${role==='chef_service'?'<button id="bulk-prevalidate">Pré-valider tout</button>':''}</div><div class="table-wrap"><table><thead><tr><th><input type="checkbox" id="all-check"/></th><th>Période</th><th>Motif public</th><th>Note privée Chef↔Direction</th><th>Action</th></tr></thead><tbody>${base.map((r)=>`<tr><td><input type="checkbox" data-id="${r.id}"/></td><td>${fDate(r.date_debut)} → ${fDate(r.date_fin)}</td><td>${r.commentaire_public||'—'}</td><td><textarea data-note="${r.id}" rows="2">${r.commentaire_prive||''}</textarea></td><td><button data-ok="${r.id}">Valider</button> <button class="danger" data-ko="${r.id}">Refuser</button> <button class="secondary" data-cancel-role="${r.id}">Annuler congé</button></td></tr>`).join('')||'<tr><td colspan="5">Aucune demande à traiter</td></tr>'}</tbody></table></div>`;
  const update=async(id,kind)=>{ const note=el.validation.querySelector(`[data-note="${id}"]`)?.value||null; const statut=role==='chef_service'?(kind==='ok'?'valide_chef':'refuse_chef'):(kind==='ok'?'valide_direction':'refuse_direction'); const {error}=await state.supabase.from('conges').update({statut,commentaire_prive:note}).eq('id',id); if(!error){ await state.supabase.from('historiques').insert({conge_id:id,action:kind==='ok'?'validation':'refus',auteur_id:state.session.user.id,commentaire:note}); await refreshData(); renderValidation(); renderDashboard(); renderSuivi(); }};
  el.validation.querySelectorAll('[data-ok]').forEach((b)=>b.addEventListener('click',()=>update(b.dataset.ok,'ok')));
  el.validation.querySelectorAll('[data-ko]').forEach((b)=>b.addEventListener('click',()=>update(b.dataset.ko,'ko')));
  el.validation.querySelectorAll('[data-cancel-role]').forEach((b)=>b.addEventListener('click',async()=>{ const reason=prompt('Motif légitime obligatoire si < 1 mois avant la date. Motif:'); if(!reason) return; const {error}=await state.supabase.from('conges').update({statut:'refuse_direction',commentaire_prive:`ANNULATION SERVICE: ${reason}`}).eq('id',b.dataset.cancelRole); if(!error){ await refreshData(); renderValidation(); }}));
  if(role==='chef_service') document.querySelector('#bulk-prevalidate')?.addEventListener('click',async()=>{ const ids=[...el.validation.querySelectorAll('[data-id]:checked')].map((i)=>i.dataset.id); for(const id of ids) await update(id,'ok'); });
}

function renderCalendar(){
  const role=state.profile?.role; const settings=parse(LS.settings,{showTeamToEmployees:false,maxAbsPerDay:2}); const red=parse(LS.redDays,[]); const holidays=parse(LS.holidays,[]);
  const visible=state.conges.filter((c)=>role==='employe'?!settings.showTeamToEmployees?c.user_id===state.session.user.id:true:true);
  const today=new Date(); const y=today.getFullYear(), m=today.getMonth();
  const first=new Date(y,m,1); const last=new Date(y,m+1,0); const cells=[];
  for(let i=1;i<=last.getDate();i++){ const d=`${y}-${String(m+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`; const count=visible.filter((c)=>d>=c.date_debut&&d<=c.date_fin&&['en_attente','valide_chef','valide_direction'].includes(c.statut)).length; const isRed=red.includes(d)||count>settings.maxAbsPerDay; const isHol=holidays.includes(d); cells.push(`<div class="day ${isRed?'red':''} ${isHol?'holiday':''}"><strong>${i}</strong><br/><small>${count} abs.</small></div>`); }
  el.calendar.innerHTML=`<h3>Calendrier (${today.toLocaleString('fr-FR',{month:'long',year:'numeric'})})</h3><p class="muted">Jours fériés et jours rouges affichés.</p><div class="calendar">${cells.join('')}</div>`;
}

function renderGestion(){
  if(!['direction','admin'].includes(state.profile?.role||'')){ el.gestion.innerHTML='<p>Accès réservé direction/RH.</p>'; return; }
  const settings=parse(LS.settings,{showTeamToEmployees:false,maxAbsPerDay:2}); const holidays=parse(LS.holidays,[]).join(','); const red=parse(LS.redDays,[]).join(',');
  el.gestion.innerHTML=`<h3>Pilotage Direction / RH</h3><form id="dir-form"><div class="grid-2"><label>Message global<input name="banner" value="${parse(LS.banner,'')}"/></label><label>Max absences / jour<input name="max" type="number" value="${settings.maxAbsPerDay}"/></label><label>Jours fériés (YYYY-MM-DD, séparés par ,)<textarea name="holidays" rows="2">${holidays}</textarea></label><label>Jours rouges (YYYY-MM-DD, séparés par ,)<textarea name="red" rows="2">${red}</textarea></label></div><label><input type="checkbox" name="showTeam" ${settings.showTeamToEmployees?'checked':''}/> Autoriser les salariés à voir les absences des collègues</label><div class="actions"><button type="submit">Enregistrer paramètres</button></div></form><h4>Ajustement soldes</h4><form id="solde-form" class="grid-2"><label>User ID<input name="uid" required/></label><label>Nouveau solde CP restant<input name="cp" type="number" step="0.1" required/></label><label>Justification<textarea name="why" rows="2" required></textarea></label><div class="actions"><button type="submit">Ajuster</button><span id="solde-status" class="muted"></span></div></form><p class="muted">Historique mensuel: 2.0833/mois ou 25 après 1 an (voir migration Supabase).</p>`;
  document.querySelector('#dir-form').addEventListener('submit',(e)=>{ e.preventDefault(); const f=e.target; save(LS.banner,f.banner.value.trim()); save(LS.settings,{showTeamToEmployees:f.showTeam.checked,maxAbsPerDay:Number(f.max.value||2)}); save(LS.holidays,f.holidays.value.split(',').map((x)=>x.trim()).filter(Boolean)); save(LS.redDays,f.red.value.split(',').map((x)=>x.trim()).filter(Boolean)); renderBanner(); renderCalendar(); });
  document.querySelector('#solde-form').addEventListener('submit',async(e)=>{ e.preventDefault(); const f=e.target; const {error}=await state.supabase.from('soldes').upsert({user_id:f.uid.value,cp_restant:Number(f.cp.value)}); const s=document.querySelector('#solde-status'); if(error) s.textContent=error.message; else s.textContent='Solde ajusté'; });
}

async function loadSession(){
  const client=initClient(); el.envLabel.textContent=client?`Env: ${env.APP_BASE_URL||'Vercel OK'}`:'Variables Vercel manquantes'; if(!client)return;
  const {data}=await client.auth.getSession(); state.session=data.session;
  if(state.session){ await refreshData(); el.authCard.classList.add('hidden'); el.userLabel.textContent=`${state.profile?.prenom??''} ${state.profile?.nom??''} (${roleName(state.profile?.role)})`; applyRoleUi(); renderBanner(); renderDashboard(); renderDemande(); renderSuivi(); renderValidation(); renderCalendar(); renderGestion(); }
}

el.loginForm.addEventListener('submit',async(e)=>{ e.preventDefault(); const status=document.querySelector('#login-status'); initClient(); if(!state.supabase) return void(status.textContent='Variables Vercel manquantes'); const fd=new FormData(el.loginForm); const {error,data}=await state.supabase.auth.signInWithPassword({email:String(fd.get('email')),password:String(fd.get('password'))}); if(error) return void(status.textContent=error.message); state.session=data.session; await refreshData(); el.authCard.classList.add('hidden'); el.userLabel.textContent=`${state.profile?.prenom??''} ${state.profile?.nom??''} (${roleName(state.profile?.role)})`; applyRoleUi(); renderBanner(); renderDashboard(); renderDemande(); renderSuivi(); renderValidation(); renderCalendar(); renderGestion(); setView('dashboard'); });
el.logoutBtn.addEventListener('click',async()=>{ if(state.supabase) await state.supabase.auth.signOut(); state.session=null; state.profile=null; state.conges=[]; state.soldes=null; el.userLabel.textContent='Non connecté'; el.authCard.classList.remove('hidden'); });
document.querySelectorAll('.nav-btn').forEach((b)=>b.addEventListener('click',()=>setView(b.dataset.view)));
setView('dashboard'); loadSession();
