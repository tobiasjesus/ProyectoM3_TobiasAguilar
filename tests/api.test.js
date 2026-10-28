import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendChatMessage } from '../src/api.js';

// Mock de fetch: tests rápidos, sin red y sin gastar tokens de Gemini
const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('sendChatMessage', () => {
  const history = [{ role: 'user', text: 'Hola Goku' }];

  it('envía personaje e historial por POST y devuelve la respuesta limpia', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ reply: '  ¡Hola! Soy Goku.  ' }) });

    const reply = await sendChatMessage('goku', history);

    expect(fetchMock).toHaveBeenCalledWith('/api/functions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterId: 'goku', messages: history }),
    });
    expect(reply).toBe('¡Hola! Soy Goku.');
  });

  it('lanza un error con el status cuando la API responde 4xx/5xx', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 429, json: async () => ({ error: 'Demasiadas solicitudes' }) });

    await expect(sendChatMessage('goku', history)).rejects.toMatchObject({
      message: 'Demasiadas solicitudes',
      status: 429,
    });
  });

  it('propaga los errores de red', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(sendChatMessage('goku', history)).rejects.toThrow('Failed to fetch');
  });

  it('lanza EMPTY_REPLY si la respuesta llega vacía', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ reply: '   ' }) });

    await expect(sendChatMessage('goku', history)).rejects.toMatchObject({ code: 'EMPTY_REPLY' });
  });
});
