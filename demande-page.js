import { computeDays, mountAppShell, requireAuth, storage } from './app.js';

const session = requireAuth();
mountAppShell('demande');
const root = document.querySelector('[data-app-content]');

root.innerHTML = `
  <h2 class="page-title">Nouvelle demande</h2>
  <p class="muted">Historique et suivi des demandes de congé.</p>
  <section class="panel">
    <form id="request-form" novalidate>
      <div class="field-row"><label for="type">Type</label><select id="type" name="type" required><option value="">Choisir</option><option>Congés payés</option><option>RTT</option><option>Maladie</option><option>Exceptionnel</option></select></div>
      <div class="field-grid">
        <div class="field-row"><label for="startDate">Début</label><input id="startDate" name="startDate" type="date" required /></div>
        <div class="field-row"><label for="endDate">Fin</label><input id="endDate" name="endDate" type="date" required /></div>
      </div>
      <div class="field-row"><label for="reason">Motif</label><textarea id="reason" name="reason" rows="3" maxlength="240"></textarea></div>
      <div class="actions"><button type="submit">Soumettre</button><span id="status"></span></div>
    </form>
  </section>
`;

const form = document.querySelector('#request-form');
const status = document.querySelector('#status');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const type = String(data.get('type') || '').trim();
  const startDate = String(data.get('startDate') || '').trim();
  const endDate = String(data.get('endDate') || '').trim();
  const reason = String(data.get('reason') || '').trim();

  if (!type || !startDate || !endDate) return void (status.textContent = 'Champs obligatoires manquants.');
  if (new Date(endDate) < new Date(startDate)) return void (status.textContent = 'Période invalide.');

  storage.setRequests([{ id: crypto.randomUUID(), employeeName: session.name, owner: session.email, type, startDate, endDate, days: computeDays(startDate, endDate), reason, status: 'pending' }, ...storage.getRequests()]);
  form.reset();
  status.textContent = 'Demande soumise.';
});
