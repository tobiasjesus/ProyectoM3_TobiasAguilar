// Modo claro/oscuro: el CSS cambia con el atributo data-theme del <html>
const THEME_KEY = 'dbchat:tema';

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // Sin localStorage: usamos la preferencia del sistema
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  const button = document.querySelector('.theme-toggle');
  const isDark = theme === 'dark';
  button.textContent = isDark ? '☀️' : '🌙';
  button.setAttribute('aria-label', isDark ? 'Activar modo claro' : 'Activar modo oscuro');
}

export function setupThemeToggle() {
  applyTheme(getInitialTheme());

  document.querySelector('.theme-toggle').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Si no se puede guardar, el tema igual cambia en esta sesión
    }
  });
}
