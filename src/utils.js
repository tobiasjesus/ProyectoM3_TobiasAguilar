// Funciones PURAS de transformación y validación de datos.
// No tocan el DOM, ni la red, ni localStorage: por eso se pueden testear con Vitest.

export const MAX_MESSAGE_LENGTH = 500;
export const MAX_HISTORY_MESSAGES = 20;

const VALID_ROLES = ['user', 'model'];

// Crea un mensaje del chat. role: 'user' (persona) o 'model' (personaje, como lo llama Gemini)
export function createMessage(role, text, timestamp = Date.now()) {
  return { role, text, timestamp };
}

// Devuelve un array NUEVO con el mensaje agregado (no modifica el original)
export function appendMessage(messages, message) {
  return [...messages, message];
}

// Un mensaje es válido si tiene texto (sin contar espacios) y no supera el máximo
export function isValidMessage(text, maxLength = MAX_MESSAGE_LENGTH) {
  if (typeof text !== 'string') return false;
  const trimmed = text.trim();
  return trimmed.length > 0 && trimmed.length <= maxLength;
}

// Timestamp → "HH:MM" (hora local)
export function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Historial de la UI → mensajes para la API:
// 1) se queda con los últimos N (controla tokens y costo),
// 2) quita datos que la IA no necesita (timestamp),
// 3) la conversación debe empezar con un mensaje del usuario,
// 4) une mensajes consecutivos del mismo rol (p. ej. dos envíos seguidos tras un error).
export function toApiMessages(messages, maxMessages = MAX_HISTORY_MESSAGES) {
  const recent = messages.slice(-maxMessages).map(({ role, text }) => ({ role, text }));

  while (recent.length > 0 && recent[0].role !== 'user') {
    recent.shift();
  }

  return recent.reduce((result, message) => {
    const last = result[result.length - 1];
    if (last && last.role === message.role) {
      last.text = `${last.text}\n${message.text}`;
    } else {
      result.push({ ...message });
    }
    return result;
  }, []);
}

// Clave de localStorage: un historial separado por personaje (no se mezclan personalidades)
export function getStorageKey(characterId) {
  return `dbchat:historial:${characterId}`;
}

// Convierte lo guardado en localStorage en un historial seguro.
// Si el dato está vacío, corrupto o tiene otro formato, devuelve [] en vez de romper la app.
export function parseStoredHistory(raw) {
  if (!raw) return [];

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(data)) return [];

  return data.filter((message) =>
    message !== null &&
    typeof message === 'object' &&
    VALID_ROLES.includes(message.role) &&
    typeof message.text === 'string' &&
    typeof message.timestamp === 'number'
  );
}

// Traduce un error técnico a un mensaje claro para el usuario (nunca se muestra el error crudo)
export function getErrorMessage(error) {
  if (error?.code === 'EMPTY_REPLY') {
    return 'El personaje no supo qué responder. Probá reformular tu mensaje.';
  }
  if (error?.status === 429) {
    return 'Enviaste muchos mensajes seguidos. Esperá unos segundos y volvé a intentar.';
  }
  if (error?.status === 503) {
    return 'El personaje está muy ocupado ahora (alta demanda del servicio de IA). Probá de nuevo en unos segundos.';
  }
  if (error?.status >= 500) {
    return 'El personaje no pudo responder por un problema del servidor. Intentá de nuevo en un momento.';
  }
  if (error?.status >= 400) {
    return 'No se pudo procesar el mensaje. Intentá de nuevo.';
  }
  return 'No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.';
}
