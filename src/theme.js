// Modo claro/oscuro: el CSS cambia con el atributo data-theme del <html>
const THEME_KEY = 'dbchat:tema';

// Íconos SVG en línea: toman el color del texto (currentColor), así se adaptan a cada tema
const SVG_ATTRS = 'class="theme-toggle__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"';

const MOON_ICON = `<svg ${SVG_ATTRS}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>`;

const SUN_ICON = `<svg ${SVG_ATTRS}>
  <circle cx="12" cy="12" r="4"/>
  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
</svg>`;

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
  button.innerHTML = isDark ? SUN_ICON : MOON_ICON; // ícono propio (constante), no dato externo
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
