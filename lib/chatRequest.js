// Funciones PURAS del lado del servidor: validar lo que manda el navegador
// y transformarlo al formato que espera Gemini. Se testean con Vitest.

export const MAX_MESSAGES = 20;
export const MAX_TEXT_LENGTH = 2000;

const VALID_ROLES = ['user', 'model'];

// Valida el body del request. Nunca confiamos en lo que llega del cliente.
// Devuelve un mensaje de error (string) o null si todo está bien.
export function validateChatRequest(body) {
  const messages = body?.messages;

  if (typeof body?.characterId !== 'string') {
    return 'Falta el personaje';
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return 'Faltan los mensajes de la conversación';
  }
  if (messages.length > MAX_MESSAGES) {
    return 'La conversación enviada es demasiado larga';
  }

  const allValid = messages.every((message) =>
    VALID_ROLES.includes(message?.role) &&
    typeof message.text === 'string' &&
    message.text.trim().length > 0 &&
    message.text.length <= MAX_TEXT_LENGTH
  );
  if (!allValid) {
    return 'Hay mensajes con un formato inválido';
  }

  if (messages[messages.length - 1].role !== 'user') {
    return 'El último mensaje debe ser del usuario';
  }

  return null;
}

// Repara texto "mal codificado" (mojibake): caracteres UTF-8 leídos como Latin-1,
// p. ej. "DespuÃ©s" → "Después". Solo reemplaza secuencias que forman UTF-8 válido;
// el texto correcto queda intacto.
const MOJIBAKE_PATTERN = /[Â-ß][\u0080-¿]|[à-ï][\u0080-¿]{2}|[ð-ô][\u0080-¿]{3}/g;

export function repairEncoding(text) {
  return text.replace(MOJIBAKE_PATTERN, (match) => {
    const bytes = Uint8Array.from(match, (char) => char.charCodeAt(0));
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {
      return match;
    }
  });
}

// [{ role, text }] → formato "contents" de Gemini: [{ role, parts: [{ text }] }]
export function toGeminiContents(messages) {
  return messages.map(({ role, text }) => ({
    role,
    parts: [{ text }],
  }));
}
