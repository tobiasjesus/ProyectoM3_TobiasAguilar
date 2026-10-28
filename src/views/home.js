import { getCharacterById, DEFAULT_CHARACTER_ID } from '../characters.js';

export function renderHome(container) {
  const goku = getCharacterById(DEFAULT_CHARACTER_ID);

  // innerHTML con datos propios (constantes de characters.js), no con datos externos
  container.innerHTML = `
    <section class="view">
      <div class="hero">
        <div class="character-frame hero__image">
          <img src="${goku.image}" alt="${goku.name}, ${goku.title}">
        </div>
        <div class="hero__content">
          <p class="hero__eyebrow">Dragon Ball · Chat con IA</p>
          <h1>Chateá con ${goku.name}</h1>
          <p class="hero__lead">${goku.description}</p>
          <div class="hero__actions">
            <a class="button button--primary" href="/chat?personaje=${goku.id}">Empezar a chatear</a>
            <a class="button button--secondary" href="/personajes">Ver todos los personajes</a>
          </div>
        </div>
      </div>
    </section>
  `;
}
