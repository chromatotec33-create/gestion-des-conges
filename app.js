const REQUESTS_KEY = 'gdc_requests_v2';
const SESSION_KEY = 'gdc_session_v1';

export const storage = {
  getRequests() {
    try {
      const data = JSON.parse(localStorage.getItem(REQUESTS_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
  setRequests(requests) {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  },
  getSession() {
    try {
      const data = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
      return data && typeof data === 'object' ? data : null;
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
  { email: 'admin@entreprise.fr', password: 'Admin123!', name: 'Admin RH' },
  { email: 'manager@entreprise.fr', password: 'Manager123!', name: 'Manager Equipe' },
  { email: 'employee@entreprise.fr', password: 'Employee123!', name: 'Collaborateur' }
];

export const formatDate = (isoDate) => {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Date invalide';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(date);
};

export const computeDays = (start, end) => {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  return Math.floor((endDate - startDate) / 86400000) + 1;
};

export const requireAuth = () => {
  const session = storage.getSession();
  if (!session) {
    window.location.href = './connexion.html';
    return null;
  }
  return session;
};

export const mountHeader = (activePath) => {
  const header = document.querySelector('[data-app-header]');
  if (!header) return;

  const session = storage.getSession();

  header.innerHTML = '';
  const nav = document.createElement('nav');
  nav.className = 'nav';

  const links = [
    { href: './index.html', label: 'Accueil' },
    { href: './demande.html', label: 'Demande' },
    { href: './suivi.html', label: 'Suivi' }
  ];

  links.forEach((link) => {
    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.label;
    if (activePath.endsWith(link.href.replace('./', ''))) a.className = 'active';
    nav.appendChild(a);
  });

  const right = document.createElement('div');
  right.className = 'nav-right';

  if (session) {
    const user = document.createElement('span');
    user.textContent = `Connecté: ${session.name}`;

    const logout = document.createElement('button');
    logout.type = 'button';
    logout.className = 'secondary';
    logout.textContent = 'Déconnexion';
    logout.addEventListener('click', () => {
      storage.clearSession();
      window.location.href = './connexion.html';
    });

    right.append(user, logout);
  } else {
    const login = document.createElement('a');
    login.href = './connexion.html';
    login.textContent = 'Connexion';
    right.appendChild(login);
  }

  header.append(nav, right);
};
