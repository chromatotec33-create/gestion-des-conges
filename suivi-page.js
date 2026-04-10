import { computeDays, formatDate, mountHeader, requireAuth, storage } from './app.js';

const session = requireAuth();
mountHeader(window.location.pathname);

if (!session) {
  throw new Error('User not authenticated');
}

const tbody = document.querySelector('#requests-body');

const render = () => {
  const requests = storage.getRequests().filter((item) => item.owner === session.email);
  tbody.textContent = '';

  if (requests.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.textContent = 'Aucune demande trouvée.';
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  requests.forEach((request) => {
    const row = document.createElement('tr');

    const type = document.createElement('td');
    type.textContent = request.type;

    const period = document.createElement('td');
    period.textContent = `${formatDate(request.startDate)} → ${formatDate(request.endDate)}`;

    const days = document.createElement('td');
    days.textContent = String(computeDays(request.startDate, request.endDate));

    const reason = document.createElement('td');
    reason.textContent = request.reason || '—';

    const status = document.createElement('td');
    status.textContent = request.status;

    const actionCell = document.createElement('td');
    if (request.status === 'En attente') {
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className = 'danger';
      cancel.textContent = 'Annuler';
      cancel.addEventListener('click', () => {
        const all = storage.getRequests();
        const updated = all.map((entry) => (
          entry.id === request.id
            ? { ...entry, status: 'Annulée' }
            : entry
        ));
        storage.setRequests(updated);
        render();
      });
      actionCell.appendChild(cancel);
    } else {
      actionCell.textContent = '—';
    }

    row.append(type, period, days, reason, status, actionCell);
    tbody.appendChild(row);
  });
};

render();
