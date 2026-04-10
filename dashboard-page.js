import { mountAppShell, statusLabel, storage } from './app.js';

mountAppShell('dashboard');
const root = document.querySelector('[data-app-content]');
const requests = storage.getRequests();
const pending = requests.filter((r) => r.status === 'pending').length;
const approved = requests.filter((r) => r.status === 'approved').length;

root.innerHTML = `
  <h2 class="page-title">Tableau de bord RH</h2>
  <p class="muted">Pilotage des absences, approbations et conformité en temps réel.</p>
  <section class="kpis">
    <article class="panel"><h3>Total demandes</h3><p class="kpi">${requests.length}</p></article>
    <article class="panel"><h3>En attente</h3><p class="kpi">${pending}</p></article>
    <article class="panel"><h3>Approuvées</h3><p class="kpi">${approved}</p></article>
  </section>
  <section class="panel">
    <h3>Dernières demandes</h3>
    <ul class="timeline">${requests.slice(0, 5).map((r) => `<li>${r.employeeName} — ${r.type} — ${statusLabel(r.status)}</li>`).join('') || '<li>Aucune demande.</li>'}</ul>
  </section>
`;
