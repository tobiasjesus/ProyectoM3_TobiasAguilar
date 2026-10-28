import { describe, it, expect } from 'vitest';
import {
  appendMessage,
  createMessage,
  formatTime,
  getErrorMessage,
  getStorageKey,
  isValidMessage,
  parseStoredHistory,
  toApiMessages,
} from '../src/utils.js';

describe('createMessage y appendMessage', () => {
  it('crea un mensaje con rol, texto y timestamp', () => {
    expect(createMessage('user', 'Hola', 1000)).toEqual({ role: 'user', text: 'Hola', timestamp: 1000 });
  });

  it('agrega el mensaje sin modificar el array original', () => {
    const original = [createMessage('user', 'Hola', 1)];
    const result = appendMessage(original, createMessage('model', '¡Hola!', 2));

    expect(result).toHaveLength(2);
    expect(original).toHaveLength(1);
  });
});

describe('isValidMessage', () => {
  it('acepta un mensaje con texto', () => {
    expect(isValidMessage('¿Quién es tu rival?')).toBe(true);
  });

  it('rechaza vacíos, solo espacios y valores que no son texto', () => {
    expect(isValidMessage('')).toBe(false);
    expect(isValidMessage('    ')).toBe(false);
    expect(isValidMessage(null)).toBe(false);
  });

  it('rechaza mensajes que superan el máximo de caracteres', () => {
    expect(isValidMessage('a'.repeat(501))).toBe(false);
    expect(isValidMessage('a'.repeat(500))).toBe(true);
  });
});

describe('formatTime', () => {
  it('formatea la hora como HH:MM con ceros a la izquierda', () => {
    const timestamp = new Date(2026, 9, 28, 9, 5).getTime();
    expect(formatTime(timestamp)).toBe('09:05');
  });
});

describe('toApiMessages', () => {
  it('quita el timestamp y deja solo rol y texto', () => {
    const messages = [createMessage('user', 'Hola', 1), createMessage('model', '¡Hola!', 2)];

    expect(toApiMessages(messages)).toEqual([
      { role: 'user', text: 'Hola' },
      { role: 'model', text: '¡Hola!' },
    ]);
  });

  it('se queda solo con los últimos mensajes según el máximo', () => {
    const messages = Array.from({ length: 30 }, (_, i) =>
      createMessage(i % 2 === 0 ? 'user' : 'model', `mensaje ${i}`, i)
    );
    const result = toApiMessages(messages, 10);

    expect(result).toHaveLength(10);
    expect(result[0].text).toBe('mensaje 20');
  });

  it('descarta mensajes iniciales del personaje: la conversación empieza con el usuario', () => {
    const messages = [createMessage('model', 'Saludo', 1), createMessage('user', 'Hola', 2)];
    expect(toApiMessages(messages)).toEqual([{ role: 'user', text: 'Hola' }]);
  });

  it('une mensajes consecutivos del mismo rol', () => {
    const messages = [createMessage('user', 'Hola', 1), createMessage('user', '¿Estás?', 2)];
    expect(toApiMessages(messages)).toEqual([{ role: 'user', text: 'Hola\n¿Estás?' }]);
  });
});

describe('parseStoredHistory', () => {
  it('devuelve [] si no hay nada guardado o el JSON está corrupto', () => {
    expect(parseStoredHistory(null)).toEqual([]);
    expect(parseStoredHistory('{esto no es json')).toEqual([]);
    expect(parseStoredHistory('{"role":"user"}')).toEqual([]);
  });

  it('conserva solo los mensajes con el formato correcto', () => {
    const raw = JSON.stringify([
      { role: 'user', text: 'Hola', timestamp: 1 },
      { role: 'system', text: 'rol inválido', timestamp: 2 },
      { role: 'model', text: 'Sin timestamp' },
      null,
    ]);

    expect(parseStoredHistory(raw)).toEqual([{ role: 'user', text: 'Hola', timestamp: 1 }]);
  });
});

describe('getStorageKey', () => {
  it('usa una clave distinta por personaje', () => {
    expect(getStorageKey('goku')).not.toBe(getStorageKey('vegeta'));
  });
});

describe('getErrorMessage', () => {
  it('traduce el error 429 a un mensaje de esperar', () => {
    expect(getErrorMessage({ status: 429 })).toContain('Esperá unos segundos');
  });

  it('traduce errores 5xx a un problema del servidor', () => {
    expect(getErrorMessage({ status: 500 })).toContain('problema del servidor');
  });

  it('sin status (fallo de red) indica problema de conexión', () => {
    expect(getErrorMessage(new TypeError('Failed to fetch'))).toContain('conectar');
  });
});
