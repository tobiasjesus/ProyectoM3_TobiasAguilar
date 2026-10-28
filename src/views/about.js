import { characters } from '../characters.js';

export function renderAbout(container) {
  const characterItems = characters
    .map((character) => `<li><strong>${character.name}:</strong> ${character.description}</li>`)
    .join('');

  container.innerHTML = `
    <section class="view about">
      <h1>Acerca de</h1>

      <h2>El proyecto</h2>
      <p>
        Dragon Ball Chat es una prueba de concepto del Proyecto Integrador del Módulo 3 de Henry:
        una Single Page Application para conversar con personajes de Dragon Ball usando
        inteligencia artificial (Google Gemini).
      </p>

      <h2>Los personajes</h2>
      <ul class="about__list">${characterItems}</ul>

      <h2>Cómo funciona</h2>
      <ol class="about__list">
        <li>Escribís un mensaje en el chat.</li>
        <li>La app envía la conversación a una función serverless de Vercel.</li>
        <li>La función suma la personalidad del personaje (system prompt) y consulta a Gemini con una API key que solo existe en el servidor.</li>
        <li>La respuesta vuelve al chat y la conversación queda guardada en tu navegador.</li>
      </ol>

      <h2>Tecnologías</h2>
      <p>
        HTML, CSS y JavaScript sin frameworks (módulos ES, History API y Fetch),
        Vercel Serverless Functions, Google Gemini y Vitest.
      </p>

      <h2>Créditos</h2>
      <p>Desarrollado por Tobias Aguilar.</p>
      <p>
        Imágenes de los personajes obtenidas de
        <a href="https://dokkaninfo.com/" target="_blank" rel="noopener noreferrer">dokkaninfo.com</a>.
        Dragon Ball y sus personajes pertenecen a sus respectivos dueños; se usan solo con fines educativos.
      </p>

      <p class="about__cta"><a class="button button--primary" href="/personajes">Elegir personaje</a></p>
    </section>
  `;
}
