// Capa de red: único lugar que habla con la Serverless Function.
// No sabe nada del DOM: recibe datos y devuelve datos (o lanza un error con status).

const API_URL = '/api/functions';

export async function sendChatMessage(characterId, messages) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ characterId, messages }),
  });

  // Si el servidor no devolvió JSON (p. ej. una página de error), usamos un objeto vacío
  const data = await response.json().catch(() => ({}));

  // fetch NO rechaza con 4xx/5xx: hay que revisar response.ok a mano
  if (!response.ok) {
    const error = new Error(data.error ?? `Error HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  if (typeof data.reply !== 'string' || data.reply.trim() === '') {
    const error = new Error('La respuesta del personaje llegó vacía');
    error.code = 'EMPTY_REPLY';
    throw error;
  }

  return data.reply.trim();
}
