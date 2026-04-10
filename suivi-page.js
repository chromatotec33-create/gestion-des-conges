import { formatDate, mountAppShell, requireAuth, statusClass, statusLabel, storage } from './app.js';

const session = requireAuth();
mountAppShell('suivi');
const root = document.querySelector('[data-app-content]');

const render = () => {
  const mine = storage.getRequests().filter((r) => r.owner === session.email);
  root.innerHTML = `
    <h2 class="page-title">Mes demandes</h2>
    <section class="panel table-wrap">
      <table>
        <thead><tr><th>Type</th><th>Période</th><th>Jours</th><th>Motif</th><th>Statut</th><th>Action</th></tr></thead>
        <tbody>${mine.map((r) => `
          <tr>
            <td>${r.type}</td>
            <td>${formatDate(r.startDate)} → ${formatDate(r.endDate)}</td>
            <td>${r.days}</td>
            <td>${r.reason || '—'}</td>
            <td><span class="${statusClass(r.status)}">${statusLabel(r.status)}</span></td>
            <td>${r.status === 'pending' ? `<button data-id="${r.id}" class="danger">Annuler</button>` : '—'}</td>
          </tr>`).join('') || '<tr><td colspan="6">Aucune demande</td></tr>'}</tbody>
      </table>
    </section>`;

  root.querySelectorAll('[data-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      storage.setRequests(storage.getRequests().map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r)));
      render();
    });
  });
};

render();
