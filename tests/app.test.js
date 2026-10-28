import { describe, it, expect } from 'vitest';
import { normalizePath } from '../src/router.js';
import { getCharacterById, characters } from '../src/characters.js';

describe('normalizePath (router)', () => {
  it('redirige la raíz a /home', () => {
    expect(normalizePath('/')).toBe('/home');
  });

  it('quita la barra final', () => {
    expect(normalizePath('/chat/')).toBe('/chat');
  });

  it('deja intactas las rutas ya normalizadas', () => {
    expect(normalizePath('/about')).toBe('/about');
    expect(normalizePath('/ruta-inexistente')).toBe('/ruta-inexistente');
  });
});

describe('personajes', () => {
  it('hay al menos 3 personajes con id único', () => {
    const ids = characters.map((character) => character.id);
    expect(ids.length).toBeGreaterThanOrEqual(3);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('getCharacterById devuelve el personaje o null si no existe', () => {
    expect(getCharacterById('vegeta').name).toBe('Vegeta');
    expect(getCharacterById('krillin')).toBeNull();
  });
});
