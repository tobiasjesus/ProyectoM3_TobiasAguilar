export function renderNotFound(container) {
  container.innerHTML = `
    <section class="view">
      <h1>404 · Página no encontrada</h1>
      <p>La ruta <code></code> no existe.</p>
      <p><a href="/home">Volver al inicio</a></p>
    </section>
  `;
  // La ruta viene de la URL (dato externo): se inserta con textContent, nunca con innerHTML
  container.querySelector('code').textContent = window.location.pathname;
}