// Serverless Function: proxy entre el frontend y Gemini.
// Por ahora devuelve una respuesta SIMULADA para probar el flujo sin gastar tokens.

export default async function handler(req, res) {
  // 1. Solo aceptamos POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // 2. Leer y validar el body
    const { characterId, messages } = req.body ?? {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Faltan los mensajes de la conversación' });
    }

    // 3. Simular la demora de la IA
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 4. Responder con el mismo formato que usaremos con Gemini
    const lastMessage = messages[messages.length - 1];
    const reply = `(Respuesta simulada de ${characterId ?? 'personaje'}) Recibí: "${lastMessage.text}"`;
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Error en la función:', error);
    return res.status(500).json({ error: 'Error al generar la respuesta' });
  }
}