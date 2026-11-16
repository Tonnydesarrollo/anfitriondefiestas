/**
 * AI Host module for "Anfitrión de Fiestas"
 * Connects to local Ollama (e.g. qwen2.5:3b) to provide witty, comedic, late-night style
 * commentary on player answers and award AI bonus points.
 * Includes graceful timeout and rich fallback responses if Ollama is unreachable.
 */

import {
  buildSystemPrompt,
  buildDuelEvaluationPrompt,
  getPersonalityFallbackVerdict,
  HOST_PERSONALITIES
} from './ai/narrativeVoice.js';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:3b';
const AI_TIMEOUT_MS = parseInt(process.env.AI_TIMEOUT_MS || '9000', 10);

// Pool of witty fallback commentaries in case Ollama is offline or slow
const FALLBACK_COMMENTARIES = [
  "¡Vaya dos joyas! Una me dio ganas de llorar de risa y la otra... de llamar a la policía.",
  "Mi algoritmo de humor casi explota con este duelo. Nivel cómico de alta alcurnia.",
  "Si estas respuestas fueran comida, una sería un banquete gourmet y la otra una pizza recalentada a las 4 AM.",
  "Como inteligencia artificial sin alma, incluso yo sentí vergüenza ajena... ¡y me encantó!",
  "El duelo estuvo tan reñido que tuve que reiniciar tres neuronas artificiales para decidirme.",
  "¡Qué nivel de ocurrencia! El ingenio humano nunca dejará de sorprenderme (ni de preocuparme).",
  "Una de las respuestas tiene futuro en el stand-up; la otra tiene futuro en terapia.",
  "Elegir aquí fue más difícil que explicarle a un boomer cómo funciona la nube."
];

/**
 * Clean and truncate string for safe AI prompting
 */
function sanitize(text) {
  if (!text) return '';
  return String(text).replace(/[\r\n\t]+/g, ' ').trim().slice(0, 150);
}

/**
 * Pick a random fallback commentary
 */
function getFallbackCommentary(answerA, answerB) {
  const randomIndex = Math.floor(Math.random() * FALLBACK_COMMENTARIES.length);
  // Simple heuristic for winner: longer or shorter, slightly randomized
  const pickA = Math.random() > 0.5;
  return {
    winner: pickA ? 'A' : 'B',
    commentary: FALLBACK_COMMENTARIES[randomIndex],
    bonusPoints: 250,
    source: 'fallback'
  };
}

/**
 * Ask Ollama AI to judge the duel between two answers
 * @param {string} promptText The question/prompt
 * @param {string} answerA First player's answer
 * @param {string} playerAName First player's name
 * @param {string} answerB Second player's answer
 * @param {string} playerBName Second player's name
 * @returns {Promise<{winner: 'A'|'B', commentary: string, bonusPoints: number, source: string}>}
 */
export async function judgeDuel(promptText, answerA, playerAName, answerB, playerBName, personality = 'FIESTA_PICANTE') {
  const cleanPrompt = sanitize(promptText);
  const cleanA = sanitize(answerA);
  const cleanB = sanitize(answerB);

  // If one didn't answer, award to the other using personality voice
  if (!cleanA || !cleanB) {
    return getPersonalityFallbackVerdict(personality, cleanA, playerAName, cleanB, playerBName);
  }

  const systemInstruction = buildSystemPrompt(personality);
  const userPrompt = buildDuelEvaluationPrompt(personality, {
    promptText: cleanPrompt,
    answerA: cleanA,
    playerAName,
    answerB: cleanB,
    playerBName
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: `<|im_start|>system\n${systemInstruction}<|im_end|>\n<|im_start|>user\n${userPrompt}<|im_end|>\n<|im_start|>assistant\n`,
        stream: false,
        format: 'json',
        options: {
          temperature: 0.75,
          num_predict: 220
        }
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[AI Host] Ollama returned HTTP ${response.status}. Using personality fallback commentary.`);
      return getPersonalityFallbackVerdict(personality, cleanA, playerAName, cleanB, playerBName);
    }

    const data = await response.json();
    const rawContent = data.response?.trim();

    // Parse JSON response
    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      // If Ollama didn't return pure JSON, attempt regex match
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON detected in Ollama response');
      }
    }

    const winner = (parsed.winner === 'B' || parsed.winner === 'b') ? 'B' : 'A';
    const commentary = parsed.commentary || parsed.comment || getPersonalityFallbackVerdict(personality, cleanA, playerAName, cleanB, playerBName).commentary;

    return {
      winner,
      commentary,
      bonusPoints: 250,
      source: 'ollama'
    };
  } catch (err) {
    console.warn(`[AI Host] Ollama call failed (${err.message}). Using personality fallback commentary.`);
    return getPersonalityFallbackVerdict(personality, cleanA, playerAName, cleanB, playerBName);
  }
}
