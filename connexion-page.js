import { storage, users } from './app.js';

const form = document.querySelector('#login-form');
const status = document.querySelector('#login-status');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '').trim();

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    status.textContent = 'Identifiants invalides.';
    return;
  }

  storage.setSession({ email: user.email, name: user.name, role: user.role });
  window.location.href = './dashboard.html';
});
