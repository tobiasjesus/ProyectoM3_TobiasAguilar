// Punto de entrada de la aplicación
import { router, setupLinkInterception } from './router.js';
import { setupThemeToggle } from './theme.js';

// 0. Tema claro/oscuro (preferencia guardada o la del sistema)
setupThemeToggle();

// 1. Atrás/adelante del navegador → volver a dibujar según la URL
window.addEventListener('popstate', router);

// 2. Links internos → navegación SPA sin recarga
setupLinkInterception();

// 3. Render inicial según la URL con la que se abrió la página
router();
