// Router de la SPA: tabla de rutas + navegación con History API.
import { renderHome } from './views/home.js';
import { renderGallery } from './views/gallery.js';
import { renderChat } from './views/chat.js';
import { renderAbout } from './views/about.js';
import { renderNotFound } from './views/notFound.js';

const APP_NAME = 'Dragon Ball Chat';

// Tabla de rutas: path → función que dibuja la vista + título de la pestaña
const routes = {
  '/home': { render: renderHome, title: 'Inicio' },
  '/personajes': { render: renderGallery, title: 'Personajes' },
  '/chat': { render: renderChat, title: 'Chat' },
  '/about': { render: renderAbout, title: 'Acerca de' },
};

// Función pura: "/" pasa a ser "/home" y se quita la barra final ("/chat/" → "/chat")
export function normalizePath(pathname) {
  if (pathname === '/') return '/home';
  return pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
}

// Lee la URL actual y dibuja la vista que corresponde
export function router() {
  const path = normalizePath(window.location.pathname);

  // Si la URL no estaba normalizada, la corregimos sin agregar una entrada al historial
  if (path !== window.location.pathname) {
    history.replaceState(null, '', path + window.location.search);
  }

  const route = routes[path] ?? { render: renderNotFound, title: 'Página no encontrada' };
  const app = document.querySelector('#app');

  route.render(app);
  document.title = `${route.title} · ${APP_NAME}`;
  updateActiveLink(path);
  app.scrollTop = 0;
}

// Navegación interna: cambia la URL y dibuja (pushState NO dispara popstate)
export function navigateTo(path) {
  if (path === window.location.pathname + window.location.search) return; // evita entradas duplicadas

  history.pushState(null, '', path);
  router();
  document.querySelector('#app').focus(); // accesibilidad: el foco va al contenido nuevo
}

// Intercepta clicks en links internos sin romper el comportamiento nativo del navegador
export function setupLinkInterception() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || !href.startsWith('/')) return;                                   // #anclas, mailto:, externos
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; // Ctrl+click → pestaña nueva
    if (link.target === '_blank') return;
    if (link.origin !== window.location.origin) return;

    event.preventDefault();
    navigateTo(href);
  });
}

// Marca el link de la vista actual (el CSS lo resalta con [aria-current="page"])
function updateActiveLink(path) {
  document.querySelectorAll('.site-nav__link').forEach((link) => {
    if (link.getAttribute('href') === path) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}