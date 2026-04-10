import { formatDate, mountAppShell, requireAuth, statusClass, statusLabel, storage } from './app.js';

const session = requireAuth();
mountAppShell('approvals');
const root = document.querySelector('[data-app-content]');

if (!['manager', 'admin'].includes(session.role)) {
  root.innerHTML = '<section class="panel"><p>Accès réservé manager/admin.</p></section>';
} else {
  const render = () => {
    const pending = storage.getRequests().filter((r) => r.status === 'pending');
    root.innerHTML = `
      <h2 class="page-title">Validation manager</h2>
      <p class="muted">Pipeline global des demandes en attente.</p>
      <section class="panel table-wrap">
      <table>
        <thead><tr><th>Employé</th><th>Type</th><th>Période</th><th>Statut</th><th>Actions</th></tr></thead>
        <tbody>${pending.map((r) => `<tr><td>${r.employeeName}</td><td>${r.type}</td><td>${formatDate(r.startDate)} → ${formatDate(r.endDate)}</td><td><span class="${statusClass(r.status)}">${statusLabel(r.status)}</span></td><td><button data-a="${r.id}">Approuver</button> <button class="danger" data-r="${r.id}">Refuser</button></td></tr>`).join('') || '<tr><td colspan="5">Aucune demande en attente</td></tr>'}</tbody>
      </table></section>`;

    root.querySelectorAll('[data-a]').forEach((b) => b.addEventListener('click', () => {
      const id = b.getAttribute('data-a');
      storage.setRequests(storage.getRequests().map((r) => (r.id === id ? { ...r, status: 'approved' } : r)));
      render();
    }));
    root.querySelectorAll('[data-r]').forEach((b) => b.addEventListener('click', () => {
      const id = b.getAttribute('data-r');
      storage.setRequests(storage.getRequests().map((r) => (r.id === id ? { ...r, status: 'rejected' } : r)));
      render();
    }));
  };

  render();
}
