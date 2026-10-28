// Serverless Function: proxy seguro entre el frontend y Gemini.
// La API key vive solo en process.env (servidor): nunca llega al navegador.
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSystemPrompt } from '../lib/characterPrompts.js';
import { repairEncoding, toGeminiContents, validateChatRequest } from '../lib/chatRequest.js';

// gemini-2.5-flash (recomendado por el curso) ya no está disponible en AI Studio:
// se usa el Flash económico vigente. Ver README.
const MODEL = 'gemini-3.5-flash-lite';

const GENERATION_CONFIG = {
  temperature: 0.8,       // algo de creatividad para que suene a personaje, sin desbordarse
  maxOutputTokens: 1024,  // margen amplio; la brevedad la controla el system prompt
};

export default async function handler(req, res) {
  // 1. Solo aceptamos POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // 2. Validar el body (nunca confiar en el cliente)
  const validationError = validateChatRequest(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { characterId, messages } = req.body;
  const systemPrompt = getSystemPrompt(characterId);
  if (!systemPrompt) {
    return res.status(400).json({ error: 'Personaje desconocido' });
  }

  // 3. La key se lee del entorno del servidor
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Falta la variable de entorno GEMINI_API_KEY');
    return res.status(500).json({ error: 'El servidor no está configurado correctamente' });
  }

  try {
    // 4. Llamar a Gemini con el system prompt y el historial completo
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: systemPrompt,
      generationConfig: GENERATION_CONFIG,
    });

    const result = await model.generateContent({ contents: toGeminiContents(messages) });
    // repairEncoding: corrige tildes "rotas" que el modelo devuelve muy de vez en cuando
    const reply = repairEncoding(result.response.text()).trim();

    if (!reply) {
      return res.status(502).json({ error: 'El personaje no generó una respuesta' });
    }

    // 5. Devolver solo el texto (el frontend no necesita el resto de la respuesta de Gemini)
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Error llamando a Gemini:', error.message);

    // Límite de uso de Gemini (rate limit / cuota): se lo informamos al frontend como 429
    if (error.status === 429) {
      return res.status(429).json({ error: 'Demasiadas solicitudes, esperá unos segundos' });
    }
    return res.status(500).json({ error: 'Error al generar la respuesta' });
  }
}
