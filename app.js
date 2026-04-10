const REQUESTS_KEY = 'gdc_requests_v3';
const SESSION_KEY = 'gdc_session_v1';

export const storage = {
  getRequests() {
    try {
      const value = JSON.parse(localStorage.getItem(REQUESTS_KEY) || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  },
  setRequests(items) {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(items));
  },
  getSession() {
    try {
      const value = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
      return value && typeof value === 'object' ? value : null;
    } catch {
      return null;
    }
  },
  setSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },
  clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }
};

export const users = [
  { email: 'admin@entreprise.fr', password: 'Admin123!', name: 'Admin RH', role: 'admin' },
  { email: 'manager@entreprise.fr', password: 'Manager123!', name: 'Manager Equipe', role: 'manager' },
  { email: 'employee@entreprise.fr', password: 'Employee123!', name: 'Collaborateur', role: 'employee' }
];

export const formatDate = (isoDate) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(`${isoDate}T00:00:00`));

export const computeDays = (start, end) => Math.floor((new Date(`${end}T00:00:00`) - new Date(`${start}T00:00:00`)) / 86400000) + 1;

export const requireAuth = () => {
  const session = storage.getSession();
  if (!session) {
    window.location.href = './connexion.html';
    return null;
  }
  return session;
};

export const statusLabel = (status) => ({
  pending: 'En attente',
  approved: 'Approuvée',
  rejected: 'Refusée',
  cancelled: 'Annulée'
}[status] || 'Inconnu');

export const statusClass = (status) => ({
  pending: 'badge pending',
  approved: 'badge approved',
  rejected: 'badge rejected',
  cancelled: 'badge cancelled'
}[status] || 'badge');

export const mountPublicHeader = () => {
  const holder = document.querySelector('[data-public-header]');
  if (!holder) return;
  const session = storage.getSession();
  holder.innerHTML = '';

  const nav = document.createElement('nav');
  nav.className = 'public-nav';
  nav.innerHTML = '<a href="./index.html">Accueil</a>';

  const right = document.createElement('div');
  if (session) {
    const a = document.createElement('a');
    a.href = './dashboard.html';
    a.className = 'button-link';
    a.textContent = 'Ouvrir le portail RH';
    right.appendChild(a);
  } else {
    const a = document.createElement('a');
    a.href = './connexion.html';
    a.className = 'button-link';
    a.textContent = 'Connexion sécurisée';
    right.appendChild(a);
  }

  holder.append(nav, right);
};

export const mountAppShell = (activePage) => {
  const shell = document.querySelector('[data-app-shell]');
  if (!shell) return;
  const session = requireAuth();
  if (!session) return;

  const links = [
    { key: 'dashboard', href: './dashboard.html', label: 'Tableau de bord RH' },
    { key: 'demande', href: './demande.html', label: 'Nouvelle demande' },
    { key: 'suivi', href: './suivi.html', label: 'Mes demandes' },
    { key: 'approvals', href: './approvals.html', label: 'Validation manager' }
  ];

  shell.innerHTML = '';

  const aside = document.createElement('aside');
  aside.className = 'sidebar';
  const title = document.createElement('h1');
  title.textContent = 'Portail RH';
  const role = document.createElement('p');
  role.className = 'muted';
  role.textContent = `${session.name} • ${session.role}`;

  const nav = document.createElement('nav');
  nav.className = 'side-nav';
  links.forEach((link) => {
    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.label;
    if (link.key === activePage) a.className = 'active';
    nav.appendChild(a);
  });

  const logout = document.createElement('button');
  logout.type = 'button';
  logout.className = 'secondary';
  logout.textContent = 'Déconnexion';
  logout.addEventListener('click', () => {
    storage.clearSession();
    window.location.href = './connexion.html';
  });

  aside.append(title, role, nav, logout);

  const main = document.createElement('section');
  main.className = 'app-content';
  main.innerHTML = '<div data-app-content></div>';

  shell.append(aside, main);
};
