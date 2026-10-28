import { getCharacterById, DEFAULT_CHARACTER_ID } from '../characters.js';
import {
  clearHistory,
  getHistory,
  getLastCharacterId,
  hasStoredHistory,
  rememberCharacter,
  requestReply,
  saveHistory,
} from '../chat.js';
import {
  appendMessage,
  createMessage,
  formatTime,
  getErrorMessage,
  isValidMessage,
  MAX_MESSAGE_LENGTH,
} from '../utils.js';

export function renderChat(container) {
  // El personaje viaja en la URL: /chat?personaje=vegeta (si no hay o no existe, el último elegido o Goku)
  const requestedId = new URLSearchParams(window.location.search).get('personaje') ?? getLastCharacterId();
  const character = getCharacterById(requestedId) ?? getCharacterById(DEFAULT_CHARACTER_ID);
  rememberCharacter(character.id);

  // Estado de la vista: única fuente de verdad para render()
  const state = {
    messages: getHistory(character.id),
    status: 'idle', // 'idle' | 'loading' | 'error'
    error: null,
  };

  container.innerHTML = `
    <section class="chat" aria-labelledby="chat-title">
      <header class="chat__header">
        <div class="character-frame chat__avatar">
          <img src="${character.image}" alt="">
        </div>
        <div class="chat__info">
          <h1 id="chat-title" class="chat__name">${character.name}</h1>
          <p class="chat__subtitle">${character.title}</p>
          <span class="history-badge" hidden><span aria-hidden="true">💾</span> Historial guardado</span>
        </div>
        <div class="chat__actions">
          <a class="button button--secondary button--small" href="/personajes" aria-label="Cambiar personaje">Cambiar</a>
          <button class="button button--secondary button--small" type="button" data-action="clear">Borrar historial</button>
        </div>
      </header>

      <div class="chat__messages" role="log" aria-label="Conversación con ${character.name}"></div>

      <form class="chat__composer">
        <label class="visually-hidden" for="chat-input">Escribí tu mensaje</label>
        <input id="chat-input" class="chat__input" type="text" maxlength="${MAX_MESSAGE_LENGTH}"
          autocomplete="off" placeholder="Escribile a ${character.name}…">
        <button class="button button--primary" type="submit">Enviar</button>
      </form>
    </section>
  `;

  const log = container.querySelector('.chat__messages');
  const form = container.querySelector('.chat__composer');
  const input = container.querySelector('#chat-input');
  const sendButton = form.querySelector('button[type="submit"]');
  const clearButton = container.querySelector('[data-action="clear"]');
  const badge = container.querySelector('.history-badge');

  function render() {
    if (!log.isConnected) return; // el usuario ya navegó a otra vista

    log.replaceChildren();

    if (state.messages.length === 0 && state.status === 'idle') {
      log.append(createEmptyState(character));
    } else {
      const list = document.createElement('ol');
      list.className = 'chat__list';
      state.messages.forEach((message, index) => {
        list.append(createMessageElement(message, character, index));
      });
      if (state.status === 'loading') {
        list.append(createTypingElement(character));
      }
      log.append(list);
    }

    if (state.status === 'error') {
      log.append(createErrorElement(state.error));
    }

    const isLoading = state.status === 'loading';
    sendButton.disabled = isLoading || input.value.trim() === '';
    clearButton.disabled = isLoading || state.messages.length === 0;
    badge.hidden = !hasStoredHistory(character.id);

    log.scrollTop = log.scrollHeight; // scroll automático al último mensaje
  }

  async function requestCharacterReply() {
    state.status = 'loading';
    state.error = null;
    render();

    try {
      const reply = await requestReply(character.id, state.messages);
      state.messages = appendMessage(state.messages, createMessage('model', reply));
      saveHistory(character.id, state.messages);
      state.status = 'idle';
    } catch (error) {
      state.status = 'error';
      state.error = getErrorMessage(error);
    }

    render();
  }

  // Enviar: botón o Enter (el form los maneja a los dos con el evento submit)
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (state.status === 'loading' || !isValidMessage(text)) return; // lock: sin doble envío ni mensajes vacíos

    state.messages = appendMessage(state.messages, createMessage('user', text));
    saveHistory(character.id, state.messages);
    input.value = '';
    requestCharacterReply();
  });

  input.addEventListener('input', () => {
    sendButton.disabled = state.status === 'loading' || input.value.trim() === '';
  });

  // Delegación de eventos: botones "Reintentar" y "Copiar" que se crean dinámicamente
  log.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    if (button.dataset.action === 'retry') {
      requestCharacterReply();
    } else if (button.dataset.action === 'copy') {
      const message = state.messages[Number(button.dataset.index)];
      if (message) copyToClipboard(button, message.text);
    }
  });

  clearButton.addEventListener('click', () => {
    if (state.status === 'loading' || state.messages.length === 0) return;
    if (!window.confirm(`¿Borrar toda la conversación con ${character.name}?`)) return;

    clearHistory(character.id);
    state.messages = [];
    state.status = 'idle';
    state.error = null;
    render();
  });

  render();
}

// ---------- Elementos de la UI (textContent para todo texto del usuario o de la IA) ----------

function createMessageElement(message, character, index) {
  const isUser = message.role === 'user';

  const item = document.createElement('li');
  item.className = `message ${isUser ? 'message--user' : 'message--character'}`;

  const author = document.createElement('p');
  author.className = isUser ? 'visually-hidden' : 'message__author';
  author.textContent = isUser ? 'Vos:' : character.name;

  const text = document.createElement('p');
  text.className = 'message__text';
  text.textContent = message.text; // nunca innerHTML: evita inyección de HTML (XSS)

  const meta = document.createElement('div');
  meta.className = 'message__meta';

  const time = document.createElement('time');
  time.dateTime = new Date(message.timestamp).toISOString();
  time.textContent = formatTime(message.timestamp);
  meta.append(time);

  if (!isUser) {
    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.className = 'message__copy';
    copyButton.dataset.action = 'copy';
    copyButton.dataset.index = String(index);
    copyButton.textContent = 'Copiar';
    meta.append(copyButton);
  }

  item.append(author, text, meta);
  return item;
}

function createTypingElement(character) {
  const item = document.createElement('li');
  item.className = 'message message--character message--typing';
  item.innerHTML = `
    <span class="typing" aria-hidden="true">
      <span class="typing__dot"></span><span class="typing__dot"></span><span class="typing__dot"></span>
    </span>
    <span class="typing__label"></span>
  `;
  item.querySelector('.typing__label').textContent = `${character.name} está escribiendo…`;
  return item;
}

function createEmptyState(character) {
  const box = document.createElement('div');
  box.className = 'chat__empty';
  box.innerHTML = `
    <div class="character-frame chat__empty-avatar">
      <img src="${character.image}" alt="">
    </div>
    <h2>Empezá la conversación</h2>
    <p class="chat__greeting"></p>
    <p>Escribí tu primer mensaje abajo.</p>
  `;
  box.querySelector('.chat__greeting').textContent = `“${character.greeting}”`;
  return box;
}

function createErrorElement(message) {
  const box = document.createElement('div');
  box.className = 'chat__error';
  box.setAttribute('role', 'alert');

  const text = document.createElement('p');
  text.textContent = message;

  const retryButton = document.createElement('button');
  retryButton.type = 'button';
  retryButton.className = 'button button--secondary button--small';
  retryButton.dataset.action = 'retry';
  retryButton.textContent = 'Reintentar';

  box.append(text, retryButton);
  return box;
}

async function copyToClipboard(button, text) {
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = '¡Copiado!';
  } catch {
    button.textContent = 'No se pudo copiar';
  }
  setTimeout(() => {
    button.textContent = 'Copiar';
  }, 2000);
}
