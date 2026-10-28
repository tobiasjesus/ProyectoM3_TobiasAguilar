// Lógica del chat: historial por personaje (memoria + localStorage) y pedido de respuestas.
// No dibuja nada: eso lo hace la vista (views/chat.js).
import { sendChatMessage } from './api.js';
import { DEFAULT_CHARACTER_ID } from './characters.js';
import { getStorageKey, parseStoredHistory, toApiMessages } from './utils.js';

// Respaldo en memoria: si localStorage no está disponible, el historial igual dura toda la sesión
const sessionHistories = new Map();
let lastCharacterId = DEFAULT_CHARACTER_ID;

export function getLastCharacterId() {
  return lastCharacterId;
}

export function rememberCharacter(characterId) {
  lastCharacterId = characterId;
}

export function getHistory(characterId) {
  if (sessionHistories.has(characterId)) {
    return sessionHistories.get(characterId);
  }

  let stored = [];
  try {
    stored = parseStoredHistory(localStorage.getItem(getStorageKey(characterId)));
  } catch {
    stored = []; // localStorage bloqueado (p. ej. modo privado estricto)
  }

  sessionHistories.set(characterId, stored);
  return stored;
}

export function saveHistory(characterId, messages) {
  sessionHistories.set(characterId, messages);
  try {
    localStorage.setItem(getStorageKey(characterId), JSON.stringify(messages));
  } catch {
    // Sin localStorage: el historial sigue en memoria durante la sesión
  }
}

export function clearHistory(characterId) {
  sessionHistories.set(characterId, []);
  try {
    localStorage.removeItem(getStorageKey(characterId));
  } catch {
    // Nada que borrar si localStorage no está disponible
  }
}

export function hasStoredHistory(characterId) {
  try {
    return parseStoredHistory(localStorage.getItem(getStorageKey(characterId))).length > 0;
  } catch {
    return false;
  }
}

// Envía el historial (recortado y limpio) y devuelve el texto de la respuesta
export function requestReply(characterId, messages) {
  return sendChatMessage(characterId, toApiMessages(messages));
}
