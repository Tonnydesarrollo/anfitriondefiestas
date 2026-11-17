/**
 * Single source of truth for the 7 Jackbox-inspired Party Games,
 * Sculpted Cast Roster, Audiences, and Host Personalities.
 */

export const GAME_CATALOG = [
  {
    id: 'duelo-ocurrencias',
    title: 'Duelo de Ocurrencias',
    shortTag: 'CHISTES 1V1',
    tagline: 'Respuestas absurdas cara a cara. Todo el salón vota por la mejor.',
    poster: '/assets/posters/duelo-ocurrencias.jpg',
    minPlayers: 2,
    recommended: '3-8 jug.',
    accent: '#FF6B1A',
    accentAlt: '#00B4D8',
    stageClass: 'theme-duelo'
  },
  {
    id: 'impostor-silicio',
    title: 'El Impostor de Silicio',
    shortTag: 'DEDUCCIÓN',
    tagline: 'Todos conocen la palabra secreta menos uno. Pistas crípticas y juicio.',
    poster: '/assets/posters/impostor-silicio.jpg',
    minPlayers: 3,
    recommended: '3-10 jug.',
    accent: '#C1121F',
    accentAlt: '#F4A261',
    stageClass: 'theme-impostor'
  },
  {
    id: 'dilemas-extremos',
    title: 'Dilemas Extremos',
    shortTag: 'CONSENSOS',
    tagline: 'Decisiones imposibles, apuestas secretas y el implacable Votómetro.',
    poster: '/assets/posters/dilemas-extremos.jpg',
    minPlayers: 2,
    recommended: '2-10 jug.',
    accent: '#FF5400',
    accentAlt: '#0096C7',
    stageClass: 'theme-dilemas'
  },
  {
    id: 'bomba-palabras',
    title: 'Bomba de Palabras',
    shortTag: 'CONTRARRELOJ',
    tagline: 'Completa una palabra con la sílaba activa antes de que estalle en tus manos.',
    poster: '/assets/posters/bomba-palabras.jpg',
    minPlayers: 2,
    recommended: '2-10 jug.',
    accent: '#FFBE0B',
    accentAlt: '#FB5607',
    stageClass: 'theme-bomba'
  },
  {
    id: 'falso-sabio',
    title: 'Falso Sabio',
    shortTag: 'ENGAÑOS',
    tagline: 'Inventa mentiras tan creíbles como una enciclopedia y cobra por cada víctima.',
    poster: '/assets/posters/falso-sabio.jpg',
    minPlayers: 2,
    recommended: '3-10 jug.',
    accent: '#D62828',
    accentAlt: '#F5EFE0',
    stageClass: 'theme-falso'
  },
  {
    id: 'trivia-caotica',
    title: 'Trivia Caótica',
    shortTag: 'TERROR POP',
    tagline: 'Trivia macabra de cultura pop con bonos relámpago y ronda final doble.',
    poster: '/assets/posters/trivia-caotica.jpg',
    minPlayers: 2,
    recommended: '2-10 jug.',
    accent: '#9B1D20',
    accentAlt: '#00E5FF',
    stageClass: 'theme-trivia'
  },
  {
    id: 'telepatia-fiesta',
    title: 'Telepatía de Fiesta',
    shortTag: 'MENTE COLMENA',
    tagline: 'Calibra el dial secreto de 0% a 100% para sintonizar con todo el grupo.',
    poster: '/assets/posters/telepatia-fiesta.jpg',
    minPlayers: 2,
    recommended: '2-10 jug.',
    accent: '#06D6A0',
    accentAlt: '#FF2E93',
    stageClass: 'theme-telepatia'
  }
];

export const CAST_ROSTER = [
  { id: 'crimson', image: '/assets/cast/crimson.png', color: '#E63946', accentDark: '#9E1C26', label: 'Brutus Arcilla' },
  { id: 'tangerine', image: '/assets/cast/tangerine.png', color: '#FF7B1C', accentDark: '#B34400', label: 'Chispita Naranja' },
  { id: 'lemon', image: '/assets/cast/lemon.png', color: '#FFD60A', accentDark: '#9E7E00', label: 'Ojo Limón' },
  { id: 'mint', image: '/assets/cast/mint.png', color: '#06D6A0', accentDark: '#047A5B', label: 'Rex Menta' },
  { id: 'cyan', image: '/assets/cast/cyan.png', color: '#00D4FF', accentDark: '#007799', label: 'Cubo Pop' },
  { id: 'cobalt', image: '/assets/cast/cobalt.png', color: '#3B82F6', accentDark: '#1D4ED8', label: 'Dino Azul' },
  { id: 'violet', image: '/assets/cast/violet.png', color: '#9B5DE5', accentDark: '#5B21B6', label: 'Mora Imp' },
  { id: 'magenta', image: '/assets/cast/magenta.png', color: '#FF2E93', accentDark: '#9D174D', label: 'Lila Spark' }
];

export const AUDIENCE_MODES = [
  { id: 'familia', label: 'Familia (Todos)', short: 'FAMILIA' },
  { id: 'amigos', label: 'Amigos (Fiesta)', short: 'AMIGOS' },
  { id: 'parejas', label: 'Parejas (Salseo)', short: 'PAREJAS' },
  { id: 'cerebritos', label: 'Cerebritos (Ingenio)', short: 'INGENIO' }
];

export const PERSONALITIES = [
  { id: 'FIESTA_PICANTE', label: 'Showman Sarcástico' },
  { id: 'CAOS_ABSURDO', label: 'Comediante Absurdo' },
  { id: 'DETECTOR_MENTIRAS', label: 'Presentador Dramático' }
];

export function getGameMeta(gameId) {
  return GAME_CATALOG.find(g => g.id === gameId) || GAME_CATALOG[0];
}

export function resolveCast(avatar) {
  if (avatar && avatar.image) return avatar;
  if (avatar && avatar.id) {
    const match = CAST_ROSTER.find(c => c.id === avatar.id);
    if (match) return match;
  }
  return CAST_ROSTER[0];
}

export function renderCastImg(avatar, className = 'jb-cast-img') {
  const c = resolveCast(avatar);
  return `<img src="${escapeAttr(c.image)}" alt="${escapeAttr(c.label || 'Jugador')}" class="${escapeAttr(className)}" draggable="false" />`;
}

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function escapeAttr(str) {
  return escapeHtml(str);
}
