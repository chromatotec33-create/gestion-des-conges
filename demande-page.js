import { computeDays, mountHeader, requireAuth, storage } from './app.js';

const session = requireAuth();
mountHeader(window.location.pathname);

if (!session) {
  throw new Error('User not authenticated');
}

const form = document.querySelector('#request-form');
const status = document.querySelector('#request-status');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);

  const type = String(formData.get('type') || '').trim();
  const startDate = String(formData.get('startDate') || '').trim();
  const endDate = String(formData.get('endDate') || '').trim();
  const reason = String(formData.get('reason') || '').trim();

  if (!type || !startDate || !endDate) {
    status.textContent = 'Veuillez compléter les champs obligatoires.';
    return;
  }

  if (new Date(endDate) < new Date(startDate)) {
    status.textContent = 'La date de fin doit être après la date de début.';
    return;
  }

  const days = computeDays(startDate, endDate);
  if (days <= 0 || days > 365) {
    status.textContent = 'Période invalide.';
    return;
  }

  const requests = storage.getRequests();
  requests.unshift({
    id: crypto.randomUUID(),
    owner: session.email,
    type,
    startDate,
    endDate,
    reason,
    status: 'En attente',
    createdAt: new Date().toISOString()
  });

  storage.setRequests(requests);
  form.reset();
  status.textContent = 'Demande enregistrée.';
});
