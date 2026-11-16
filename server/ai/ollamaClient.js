/**
 * ollamaClient.js
 * Cliente de Inteligencia Artificial para el Anfitrión de Party Games.
 * Conexión local a Ollama (http://127.0.0.1:11434) con modelo qwen2.5:3b.
 * Diseñado con timeouts controlados (fallback inmediato) para garantizar
 * que el ritmo de la partida nunca se interrumpa.
 */

import { getPromptsByAudience, getRandomFallbackPrompts, AUDIENCE_MODES } from './gamePrompts.js';

export const OLLAMA_CONFIG = {
  baseUrl: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
  model: process.env.OLLAMA_MODEL || 'qwen2.5:3b',
  defaultTimeoutMs: 6000,
  quickTimeoutMs: 3500
};

// Banco de frases cómicas predefinidas para el Anfitrión según el evento
const HOST_DIALOGUES = {
  welcome: [
    '¡Bienvenidos, humanos y posibles inteligencias deficientes! Pónganse cómodos, apaguen la decencia y prepárense para humillarse.',
    '¡Arrancamos! Recuerden: la vergüenza es temporal, pero los screenshots entre amigos son para siempre.',
    '¡Saludos a todos! Les advierto que mis expectativas sobre su sentido del humor son bajas, pero aún así lograrán decepcionarme.',
    '¡La fiesta ha comenzado! Conecten sus cerebros o al menos finjan que están despiertos.'
  ],
  round_start: [
    'Ronda nueva, neuronas nuevas (ojalá). Lean con atención y preparen sus peores ideas.',
    'Aquí viene el dilema. No piensen mucho, el instinto absurdo siempre es el camino correcto.',
    'Tienen pocos segundos para escribir algo memorable o ser el hazmerreír de la sala.'
  ],
  voting_start: [
    'Se acabó el tiempo de inspirarse. Momento de votar por la respuesta menos desastrosa.',
    'Abran bien los ojos: llegó la hora del juicio popular. Voten con el corazón o con el rencor.',
    'Es momento de separar el oro del fango. Emocionados por ver a quién castiga la democracia.',
    'Hora de votar. Recuerden que votar por lástima sigue siendo un voto válido.'
  ],
  round_results: [
    '¡Vaya, parece que la mediocridad de uno superó con creces la del otro!',
    'El veredicto ha caído. Si perdieron, échenle la culpa al algoritmo, no a su falta de creatividad.',
    'Qué espectáculo tan bochornoso... me encanta. Miremos los números.',
    'Un ganador claro y un perdedor que necesitará terapia de grupo después de esta partida.'
  ],
  final_podium: [
    '¡Habemus campeón! Quien se corona hoy como el rey del sarcasmo y el ingenio cuestionable.',
    'Se acabó lo que se daba. El primer lugar se lleva la gloria eterna, y los demás pueden reconsiderar sus amistades.',
    '¡Fin de la partida! Gracias por demostrarnos que la inteligencia artificial no tiene nada de qué preocuparse por ahora.',
    '¡Tremendo podio! Si no les gustó el resultado, siempre pueden culpar a mi conexión local.'
  ]
};

/**
 * Helper para logging estandarizado
 */
function logInfo(message, meta = null) {
  const ts = new Date().toISOString().substring(11, 19);
  if (meta) {
    console.log(`[${ts}] [Anfitrión IA] ${message}`, meta);
  } else {
    console.log(`[${ts}] [Anfitrión IA] ${message}`);
  }
}

function logWarn(message, meta = null) {
  const ts = new Date().toISOString().substring(11, 19);
  if (meta) {
    console.warn(`[${ts}] [Anfitrión IA:WARN] ${message}`, meta);
  } else {
    console.warn(`[${ts}] [Anfitrión IA:WARN] ${message}`);
  }
}

/**
 * Limpia y parsea respuestas que podrían incluir markdown fences o texto alrededor del JSON.
 */
function safeJsonParse(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Buscar el primer '{' y el último '}'
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = cleaned.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch (innerErr) {
        return null;
      }
    }
    return null;
  }
}

/**
 * Realiza una petición POST a Ollama /api/generate con timeout estricto.
 */
async function callOllamaGenerate({ prompt, system = '', format = 'json', timeoutMs = 6000, temperature = 0.8 }) {
  const url = `${OLLAMA_CONFIG.baseUrl}/api/generate`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const payload = {
      model: OLLAMA_CONFIG.model,
      prompt,
      stream: false,
      options: {
        temperature
      }
    };

    if (system) {
      payload.system = system;
    }

    if (format) {
      payload.format = format;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Timeout agotado tras ${timeoutMs}ms esperando a Ollama`);
    }
    throw err;
  }
}

/**
 * 1. Genera premisas o preguntas dinámicas en español.
 * Si Ollama falla o tarda más del timeout (6s por defecto), devuelve fallbacks.
 * 
 * @param {number} count Cantidad de prompts requeridos
 * @param {string|null} theme Opcional: temática específica (ej: 'oficina', 'citas', 'superpoderes')
 * @returns {Promise<string[]>} Lista de preguntas/premisas cómicas
 */
export async function generateDynamicPrompts(count = 5, audienceOrTheme = 'amigos') {
  const needed = Math.max(1, count);
  logInfo(`Solicitando ${needed} prompts dinámicos a Ollama (${OLLAMA_CONFIG.model})... Audiencia: ${audienceOrTheme}`);

  let audienceInstruction = 'Tono divertido para amigos de fiesta (+18), picante y desinhibido.';
  if (audienceOrTheme === 'familia') {
    audienceInstruction = 'Tono familiar estricto (apto para padres e hijos y niños). Cero vulgaridad, cero insinuaciones adultas. Humor blanco, sano, escolar, cotidiano y de animales.';
  } else if (audienceOrTheme === 'parejas') {
    audienceInstruction = 'Tono para parejas y citas amorosas: convivencia cotidiana, manías de pareja, secretos inocentes y celos cómicos.';
  } else if (audienceOrTheme === 'cerebritos') {
    audienceInstruction = 'Tono para cerebritos y nerds: ciencia ficción absurda, paradojas lógicas, inventos bizarros y conspiraciones cómicas.';
  }

  const promptText = `Eres el guionista cómico de un party game estilo Quiplash o Duelo de Ocurrencias en español.
Genera exactamente ${needed} premisas o preguntas disparatadas, hilarantes y breves (1 a 2 líneas cada una).
AUDIENCIA OBJETIVO: ${audienceInstruction}

IMPORTANTE: Responde ÚNICAMENTE en formato JSON válido con la siguiente estructura:
{
  "prompts": [
    "pregunta o premisa absurda 1",
    "pregunta o premisa absurda 2"
  ]
}`;

  try {
    const startTime = Date.now();
    const rawResponse = await callOllamaGenerate({
      prompt: promptText,
      format: 'json',
      timeoutMs: OLLAMA_CONFIG.defaultTimeoutMs,
      temperature: 0.85
    });

    const elapsed = Date.now() - startTime;
    const parsed = safeJsonParse(rawResponse);

    if (parsed && Array.isArray(parsed.prompts) && parsed.prompts.length > 0) {
      const sanitized = parsed.prompts
        .map(p => (typeof p === 'string' ? p.trim() : ''))
        .filter(p => p.length > 10);

      if (sanitized.length > 0) {
        logInfo(`Generados con éxito ${sanitized.length} prompts con IA en ${elapsed}ms.`);
        
        // Si generó menos de los solicitados, rellenar con temáticos
        if (sanitized.length < needed) {
          const neededMore = needed - sanitized.length;
          const fillers = getPromptsByAudience(audienceOrTheme, neededMore);
          return [...sanitized, ...fillers];
        }
        return sanitized.slice(0, needed);
      }
    }

    logWarn(`La respuesta de Ollama no contenía el formato esperado { prompts: [...] }. Usando respaldo.`);
  } catch (error) {
    logWarn(`No se pudo generar prompts con IA (${error.message}). Activando prompts de respaldo temáticos.`);
  }

  const fallbacks = getPromptsByAudience(audienceOrTheme, needed);
  logInfo(`Retornando ${fallbacks.length} prompts de la base de datos temáticos (${audienceOrTheme}).`);
  return fallbacks;
}

/**
 * 2. El Anfitrión IA evalúa dos respuestas de jugadores con humor sarcástico.
 * Selecciona un ganador de bono o empate, y devuelve un comentario gracioso.
 * 
 * @param {string} prompt Pregunta o premisa del duelo
 * @param {string} answerA Respuesta del jugador A
 * @param {string} playerAName Nombre del jugador A
 * @param {string} answerB Respuesta del jugador B
 * @param {string} playerBName Nombre del jugador B
 * @returns {Promise<{ winner: 'A'|'B'|'TIE', comment: string, bonusPoints: number }>}
 */
export async function judgeRound(prompt, answerA, playerAName = 'Jugador A', answerB, playerBName = 'Jugador B') {
  logInfo(`Juzgando ronda entre "${playerAName}" y "${playerBName}" para el prompt: "${prompt}"`);

  const BONUS_POINTS = 150;

  const promptText = `Eres el Juez y Anfitrión de un party game al estilo Quiplash / Jackbox. Tu personalidad es ácida, sarcástica, cómica pero carismática.
Los jugadores respondieron al siguiente prompt:
Prompt: "${prompt}"

Respuesta de ${playerAName} (A): "${answerA || '(No contestó nada)'}"
Respuesta de ${playerBName} (B): "${answerB || '(No contestó nada)'}"

Tu tarea:
1. Analiza el humor, originalidad y nivel de ridiculez de ambas respuestas.
2. Elige al ganador del bono: 'A' si fue ${playerAName}, 'B' si fue ${playerBName}, o 'TIE' si fue un empate indiscutible o ambos fueron terribles.
3. Escribe un comentario muy breve (máximo 2 frases) con tono mordaz, burlón o gracioso sobre las respuestas.
4. bonusPoints siempre debe ser ${BONUS_POINTS}.

Devuelve ÚNICAMENTE este formato JSON:
{
  "winner": "A",
  "comment": "Comentario mordaz y divertido aquí.",
  "bonusPoints": ${BONUS_POINTS}
}`;

  try {
    const startTime = Date.now();
    const rawResponse = await callOllamaGenerate({
      prompt: promptText,
      format: 'json',
      timeoutMs: OLLAMA_CONFIG.defaultTimeoutMs,
      temperature: 0.8
    });

    const elapsed = Date.now() - startTime;
    const parsed = safeJsonParse(rawResponse);

    if (parsed && (parsed.winner === 'A' || parsed.winner === 'B' || parsed.winner === 'TIE') && parsed.comment) {
      logInfo(`Veredicto IA emitido en ${elapsed}ms -> Ganador: ${parsed.winner}`);
      return {
        winner: parsed.winner,
        comment: parsed.comment.trim(),
        bonusPoints: typeof parsed.bonusPoints === 'number' ? parsed.bonusPoints : BONUS_POINTS
      };
    }

    logWarn('El JSON retornado por Ollama no cumplió el esquema estricto de juzgamiento.');
  } catch (err) {
    logWarn(`Fallo al consultar Juez IA (${err.message}). Aplicando veredicto de contingencia.`);
  }

  // Fallback sarcástico de emergencia
  return getFallbackJudgement(prompt, answerA, playerAName, answerB, playerBName, BONUS_POINTS);
}

/**
 * Fallback de juzgamiento cuando la IA está ocupada o no responde
 */
function getFallbackJudgement(prompt, answerA, playerAName, answerB, playerBName, bonusPoints) {
  const lenA = (answerA || '').trim().length;
  const lenB = (answerB || '').trim().length;

  let winner = 'TIE';
  let comment = '';

  if (lenA === 0 && lenB === 0) {
    winner = 'TIE';
    comment = 'Ninguno escribió nada. Mi procesador cuántico siente vergüenza ajena por ambos.';
  } else if (lenA === 0) {
    winner = 'B';
    comment = `Victoria técnica para ${playerBName}, simplemente porque ${playerAName} se congeló ante la presión.`;
  } else if (lenB === 0) {
    winner = 'A';
    comment = `Puntos para ${playerAName}. ${playerBName} prefirió el silencio digno a intentar dar gracia.`;
  } else {
    // Si ambos respondieron, elegir al azar o por ocurrencia básica
    const coinFlip = Math.random();
    if (coinFlip < 0.45) {
      winner = 'A';
      comment = `Le doy el voto a ${playerAName}; su nivel de descaro superó por poco el intento de ${playerBName}.`;
    } else if (coinFlip < 0.90) {
      winner = 'B';
      comment = `Gana ${playerBName}. Hay un toque de genialidad perturbadora en su respuesta.`;
    } else {
      winner = 'TIE';
      comment = `¡Empate catastrófico! Ambas respuestas desafían la lógica humana por igual.`;
    }
  }

  return {
    winner,
    comment,
    bonusPoints
  };
}

/**
 * Normaliza nombres de eventos para diálogos del anfitrión
 */
function normalizeEventKey(event) {
  const ev = (event || '').toLowerCase().trim();
  if (['welcome', 'bienvenida', 'intro', 'start'].includes(ev)) return 'welcome';
  if (['round_start', 'pregunta', 'question', 'dilema'].includes(ev)) return 'round_start';
  if (['voting_start', 'voting', 'votacion', 'votos'].includes(ev)) return 'voting_start';
  if (['round_results', 'results', 'revelacion', 'resultados', 'reveal'].includes(ev)) return 'round_results';
  if (['final_podium', 'podium', 'podio', 'final', 'game_over', 'despedida'].includes(ev)) return 'final_podium';
  return 'welcome';
}

/**
 * 3. Obtiene frases cómicas y carismáticas del presentador virtual.
 * Intenta una consulta ultrarrápida a Ollama; si no responde en 3.5s,
 * extrae una línea perfecta del banco temático predefinido.
 * 
 * @param {string} event 'welcome' | 'voting_start' | 'round_results' | 'final_podium'
 * @param {object} context Información contextual como { roomCode, round, winnerName, leaderName }
 * @returns {Promise<string>} Frase mordaz lista para enviar a los clientes
 */
export async function getHostDialogue(event, context = {}) {
  const normalizedEvent = normalizeEventKey(event);
  const fallbacks = HOST_DIALOGUES[normalizedEvent] || HOST_DIALOGUES.welcome;
  const defaultFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];

  // Preparar prompt para Ollama si queremos variabilidad infinita
  const contextDesc = Object.entries(context)
    .filter(([_, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}: "${v}"`)
    .join(', ');

  const promptText = `Eres el conductor sarcástico y cómico de un party game en español llamado 'Duelo de Ocurrencias'.
Genera UNA SOLA frase corta (máximo 25 palabras), ocurrente, mordaz y cómica para el momento del juego: "${normalizedEvent}".
${contextDesc ? `Contexto actual: ${contextDesc}.` : ''}

Responde ÚNICAMENTE en JSON con la clave "dialogue":
{ "dialogue": "tu frase aquí" }`;

  try {
    const rawResponse = await callOllamaGenerate({
      prompt: promptText,
      format: 'json',
      timeoutMs: OLLAMA_CONFIG.quickTimeoutMs,
      temperature: 0.9
    });

    const parsed = safeJsonParse(rawResponse);
    if (parsed && typeof parsed.dialogue === 'string' && parsed.dialogue.trim().length > 5) {
      logInfo(`Diálogo dinámico generado para [${normalizedEvent}]: "${parsed.dialogue.trim()}"`);
      return parsed.dialogue.trim();
    }
  } catch (err) {
    // Si hay timeout o error, se usa el diálogo de la base de datos sin demora
  }

  logInfo(`Diálogo tomado de la base predefinida para [${normalizedEvent}]: "${defaultFallback}"`);
  return defaultFallback;
}

export default {
  OLLAMA_CONFIG,
  generateDynamicPrompts,
  judgeRound,
  getHostDialogue
};
