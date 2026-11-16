/**
 * test-ai.js
 * Prueba integral de gamePrompts.js y ollamaClient.js
 */

import { FALLBACK_PROMPTS, PROMPT_CATEGORIES, getRandomFallbackPrompts } from '../server/ai/gamePrompts.js';
import { generateDynamicPrompts, judgeRound, getHostDialogue, OLLAMA_CONFIG } from '../server/ai/ollamaClient.js';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 INICIANDO PRUEBAS DE INTEGRACIÓN IA Y PROMPTS');
  console.log('====================================================\n');

  // 1. Verificación de gamePrompts.js
  console.log('--- 1. Test: gamePrompts.js ---');
  console.log(`Total de prompts en la base de datos: ${FALLBACK_PROMPTS.length}`);
  if (FALLBACK_PROMPTS.length < 40) {
    throw new Error(`Se requieren al menos 40 prompts, hay ${FALLBACK_PROMPTS.length}`);
  }
  console.log('✅ Cantidad de prompts supera los 40 requeridos (hay ' + FALLBACK_PROMPTS.length + ').');

  const categories = Object.values(PROMPT_CATEGORIES);
  console.log(`Categorías encontradas (${categories.length}):`, categories);

  const sampleFallback = getRandomFallbackPrompts(4);
  console.log('Muestra de 4 prompts aleatorios de respaldo:');
  sampleFallback.forEach((p, idx) => console.log(`   ${idx + 1}. ${p}`));
  if (new Set(sampleFallback).size !== 4) {
    throw new Error('Los prompts aleatorios no deben repetirse');
  }
  console.log('✅ getRandomFallbackPrompts devuelve elementos únicos correctamente.\n');

  // 2. Verificación de ollamaClient.js - generateDynamicPrompts
  console.log('--- 2. Test: generateDynamicPrompts() ---');
  const t0 = Date.now();
  const dynamicPrompts = await generateDynamicPrompts(3, 'trabajo de oficina');
  console.log(`Prompts obtenidos (${Date.now() - t0}ms):`, dynamicPrompts);
  if (!Array.isArray(dynamicPrompts) || dynamicPrompts.length !== 3) {
    throw new Error('generateDynamicPrompts no devolvió exactamente 3 prompts');
  }
  console.log('✅ generateDynamicPrompts completado con éxito.\n');

  // 3. Verificación de judgeRound
  console.log('--- 3. Test: judgeRound() ---');
  const judgeResult = await judgeRound(
    '¿Qué es lo peor que puedes susurrarle al oído a un desconocido en un elevador?',
    'Se me olvidó cómo desactivar la bomba de olor.',
    'Carlos El Caótico',
    'Tus zapatos combinan con los de mi sótano.',
    'María La Misteriosa'
  );
  console.log('Resultado del Juzgamiento IA:');
  console.log(JSON.stringify(judgeResult, null, 2));

  if (!['A', 'B', 'TIE'].includes(judgeResult.winner)) {
    throw new Error(`Ganador inválido: ${judgeResult.winner}`);
  }
  if (!judgeResult.comment || typeof judgeResult.comment !== 'string') {
    throw new Error('Comentario ausente o inválido');
  }
  if (typeof judgeResult.bonusPoints !== 'number' || judgeResult.bonusPoints <= 0) {
    throw new Error('bonusPoints inválidos');
  }
  console.log('✅ judgeRound retornó el esquema esperado { winner, comment, bonusPoints }.\n');

  // 4. Verificación de getHostDialogue
  console.log('--- 4. Test: getHostDialogue() ---');
  const events = ['welcome', 'voting_start', 'round_results', 'final_podium'];
  for (const ev of events) {
    const dialogue = await getHostDialogue(ev, { round: 1, winnerName: 'Carlos El Caótico' });
    console.log(`[Evento: ${ev}] -> "${dialogue}"`);
    if (!dialogue || typeof dialogue !== 'string') {
      throw new Error(`Diálogo inválido para evento ${ev}`);
    }
  }
  console.log('✅ getHostDialogue funcionando para todos los eventos clave.\n');

  // 5. Test de Resiliencia / Fallback (Simular endpoint inaccesible)
  console.log('--- 5. Test: Resiliencia ante desconexión de Ollama ---');
  const originalHost = OLLAMA_CONFIG.baseUrl;
  OLLAMA_CONFIG.baseUrl = 'http://127.0.0.1:99999'; // Endpoint caído

  const fallbackPrompts = await generateDynamicPrompts(2);
  console.log('Prompts obtenidos en contingencia:', fallbackPrompts);
  if (fallbackPrompts.length !== 2) {
    throw new Error('Fallo al obtener prompts en contingencia');
  }

  const fallbackJudge = await judgeRound('Premisa de prueba', 'Resp A', 'P1', 'Resp B', 'P2');
  console.log('Juzgamiento en contingencia:', fallbackJudge);
  if (!['A', 'B', 'TIE'].includes(fallbackJudge.winner) || !fallbackJudge.comment) {
    throw new Error('Fallo en juzgamiento de contingencia');
  }

  const fallbackDialogue = await getHostDialogue('welcome');
  console.log('Diálogo en contingencia:', fallbackDialogue);
  if (!fallbackDialogue) {
    throw new Error('Fallo en diálogo de contingencia');
  }

  // Restaurar endpoint
  OLLAMA_CONFIG.baseUrl = originalHost;
  console.log('✅ Resiliencia confirmada: el sistema nunca se detiene ni lanza excepciones no capturadas.\n');

  console.log('🎉 TODOS LOS TESTS PASARON EXITOSAMENTE!');
}

runTests().catch(err => {
  console.error('❌ Error en las pruebas:', err);
  process.exit(1);
});
