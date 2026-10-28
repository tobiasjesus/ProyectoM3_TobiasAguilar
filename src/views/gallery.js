import { characters } from '../characters.js';

export function renderGallery(container) {
  const cards = characters
    .map((character) => `
      <li>
        <article class="character-card">
          <div class="character-frame">
            <img src="${character.image}" alt="${character.name}" loading="lazy">
          </div>
          <div class="character-card__body">
            <h2>${character.name}</h2>
            <p class="character-card__title">${character.title}</p>
            <p>${character.shortDescription}</p>
            <a class="button button--primary" href="/chat?personaje=${character.id}">Chatear con ${character.name}</a>
          </div>
        </article>
      </li>
    `)
    .join('');

  container.innerHTML = `
    <section class="view">
      <h1>Personajes</h1>
      <p class="view__intro">Elegí con quién querés chatear. Cada personaje tiene su propia personalidad.</p>
      <ul class="gallery">${cards}</ul>
    </section>
  `;
}
