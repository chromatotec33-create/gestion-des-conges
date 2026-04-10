import { mountHeader, storage, users } from './app.js';

mountHeader(window.location.pathname);

const form = document.querySelector('#login-form');
const status = document.querySelector('#login-status');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '').trim();

  const user = users.find((entry) => entry.email === email && entry.password === password);

  if (!user) {
    status.textContent = 'Identifiants invalides.';
    return;
  }

  storage.setSession({ email: user.email, name: user.name });
  status.textContent = 'Connexion réussie. Redirection...';
  window.setTimeout(() => {
    window.location.href = './demande.html';
  }, 350);
});
