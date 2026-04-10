const STORAGE_KEY = 'leave_requests_v1';

const form = document.querySelector('#leave-form');
const tbody = document.querySelector('#requests-body');
const statusElement = document.querySelector('#form-status');

const safeText = (value) => String(value ?? '').trim();

const readRequests = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeRequests = (requests) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
};

const formatDate = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return 'Date invalide';
  }
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(date);
};

const getDayCount = (startDate, endDate) => {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / 86400000) + 1;
};

const render = () => {
  const requests = readRequests();
  tbody.textContent = '';

  if (requests.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.textContent = 'Aucune demande enregistrée.';
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  requests.forEach((request) => {
    const row = document.createElement('tr');

    const employeeCell = document.createElement('td');
    employeeCell.textContent = request.employee;

    const typeCell = document.createElement('td');
    typeCell.textContent = request.type;

    const periodCell = document.createElement('td');
    periodCell.textContent = `${formatDate(request.startDate)} → ${formatDate(request.endDate)}`;

    const daysCell = document.createElement('td');
    daysCell.textContent = String(getDayCount(request.startDate, request.endDate));

    const reasonCell = document.createElement('td');
    reasonCell.textContent = request.reason || '—';

    const actionCell = document.createElement('td');
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'danger';
    removeBtn.textContent = 'Supprimer';
    removeBtn.addEventListener('click', () => {
      const next = readRequests().filter((item) => item.id !== request.id);
      writeRequests(next);
      render();
    });

    actionCell.appendChild(removeBtn);

    row.append(employeeCell, typeCell, periodCell, daysCell, reasonCell, actionCell);
    tbody.appendChild(row);
  });
};

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const employee = safeText(formData.get('employee'));
  const type = safeText(formData.get('type'));
  const startDate = safeText(formData.get('startDate'));
  const endDate = safeText(formData.get('endDate'));
  const reason = safeText(formData.get('reason'));

  if (!employee || !type || !startDate || !endDate) {
    statusElement.textContent = 'Veuillez compléter tous les champs obligatoires.';
    return;
  }

  if (employee.length < 2) {
    statusElement.textContent = 'Le nom du collaborateur doit contenir au moins 2 caractères.';
    return;
  }

  if (new Date(endDate) < new Date(startDate)) {
    statusElement.textContent = 'La date de fin doit être postérieure ou égale à la date de début.';
    return;
  }

  const requests = readRequests();
  requests.unshift({
    id: crypto.randomUUID(),
    employee,
    type,
    startDate,
    endDate,
    reason
  });

  writeRequests(requests);
  form.reset();
  statusElement.textContent = 'Demande enregistrée avec succès.';
  render();
});

render();
