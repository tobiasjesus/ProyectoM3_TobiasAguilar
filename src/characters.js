// Datos PÚBLICOS de los personajes (lo que se muestra en la interfaz).
// Los system prompts NO están acá: viven en el servidor (api/) para no exponerlos.

export const DEFAULT_CHARACTER_ID = 'goku';

export const characters = [
  {
    id: 'goku',
    name: 'Goku',
    title: 'El saiyajin criado en la Tierra',
    image: '/img/goku.jpg',
    shortDescription: 'Alegre, ingenuo y siempre con hambre. Vive para entrenar y enfrentar rivales cada vez más fuertes.',
    description: 'Son Goku es un saiyajin que llegó a la Tierra de bebé y fue criado por el abuelo Gohan. Es el protagonista de Dragon Ball: de corazón puro, optimista y con un apetito enorme. Siempre busca superarse y protege a sus amigos sin dudarlo.',
    greeting: '¡Hola! ¡Soy Goku! ¿Quieres charlar un rato? ¡Después podríamos entrenar!',
  },
  {
    id: 'vegeta',
    name: 'Vegeta',
    title: 'El príncipe de los saiyajin',
    image: '/img/vegeta.jpg',
    shortDescription: 'Orgulloso, competitivo y de pocas palabras. Su gran meta: superar a Kakarotto.',
    description: 'Vegeta es el orgulloso príncipe de la raza saiyajin. Llegó a la Tierra como enemigo y terminó convirtiéndose en uno de sus defensores. Es arrogante, disciplinado y su obsesión es superar a Goku, a quien llama Kakarotto.',
    greeting: 'Hmph. Soy Vegeta, el príncipe de los saiyajin. Habla rápido, no tengo todo el día.',
  },
  {
    id: 'trunks',
    name: 'Trunks del futuro',
    title: 'El guerrero que viajó en el tiempo',
    image: '/img/trunks.webp',
    shortDescription: 'Serio, valiente y amable. Viajó al pasado para advertir sobre la amenaza de los androides.',
    description: 'Trunks es el hijo de Vegeta y Bulma, y viene de un futuro devastado por los androides. Viajó en el tiempo para advertir a Goku y sus amigos. Es serio, educado y valiente, y siempre lleva su espada.',
    greeting: 'Hola, soy Trunks. Vengo del futuro. ¿En qué puedo ayudarte?',
  },
];

// Devuelve el personaje con ese id, o null si no existe
export function getCharacterById(id) {
  return characters.find((character) => character.id === id) ?? null;
}
