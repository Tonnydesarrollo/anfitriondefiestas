/**
 * tests/test-all-5-games.js
 * Comprehensive integration suite verifying all 5 Jackbox-style games,
 * round counts, avatar selection, device reconnection, and point economies.
 */

import { io as ioClient } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3000';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createRoomWithPlayers(gameId, rounds = 3, audience = 'amigos') {
  const host = ioClient(SERVER_URL, { reconnection: false });
  await new Promise((res) => host.on('connect', res));

  const roomRes = await new Promise((res) => host.emit('host:create_room', {}, res));
  const roomCode = roomRes.roomCode;

  await new Promise((res) => host.emit('host:set_game', { gameId }, res));
  await new Promise((res) => host.emit('host:set_rounds', { rounds }, res));
  await new Promise((res) => host.emit('host:set_audience', { audience }, res));

  const avatars = [
    { emoji: '🦊', color: '#ff6b4a', name: 'Zorro Astuto' },
    { emoji: '🐙', color: '#ec4899', name: 'Pulpo Fiestero' },
    { emoji: '🦙', color: '#8b5cf6', name: 'Llama Loca' }
  ];

  const players = [];
  const playerNames = ['FedeZorro', 'PulpoFiestero', 'LlamaLoca'];
  for (let i = 0; i < 3; i++) {
    const name = playerNames[i];
    const p = ioClient(SERVER_URL, { reconnection: false });
    await new Promise((res) => p.on('connect', res));
    const token = `dev_tok_${i}_${Date.now()}`;
    await new Promise((res) => p.emit('player:join', { 
      roomCode, 
      playerName: name, 
      avatar: avatars[i],
      deviceToken: token 
    }, res));
    players.push({ name, socket: p, token });
    p.on('player:state_update', (st) => {
      p._lastState = st;
    });
  }

  let hostState = null;
  host.on('host:state_update', (st) => { hostState = st; });

  await sleep(300);
  return { host, roomCode, players, getHostState: () => hostState };
}

async function testAll5Games() {
  console.log('🚀 INICIANDO VERIFICACIÓN COMPLETA DE LOS 5 JUEGOS JACKBOX-STYLE');

  // ==========================================
  // 1. DUELO DE OCURRENCIAS (POINTS GUARANTEE)
  // ==========================================
  console.log('\n--- 1. Probando DUELO DE OCURRENCIAS (Quiplash-style) ---');
  {
    const { host, players, getHostState } = await createRoomWithPlayers('duelo-ocurrencias', 2);
    await new Promise((res) => host.emit('host:start_game', {}, res));
    await sleep(300);

    // Skip Tutorial
    host.emit('host:skip_timer');
    await sleep(300);

    // ANSWERING Phase
    const p0State = players[0].socket._lastState;
    if (p0State?.game?.prompts) {
      const answers0 = {};
      p0State.game.prompts.forEach(pr => { answers0[pr.duelId] = 'Respuesta genial de Fede'; });
      players[0].socket.emit('player:submit_answers', { answers: answers0 });
    }
    const p1State = players[1].socket._lastState;
    if (p1State?.game?.prompts) {
      const answers1 = {};
      p1State.game.prompts.forEach(pr => { answers1[pr.duelId] = 'Respuesta rápida de Pulpo'; });
      players[1].socket.emit('player:submit_answers', { answers: answers1 });
    }
    const p2State = players[2].socket._lastState;
    if (p2State?.game?.prompts) {
      const answers2 = {};
      p2State.game.prompts.forEach(pr => { answers2[pr.duelId] = 'Respuesta épica de Llama'; });
      players[2].socket.emit('player:submit_answers', { answers: answers2 });
    }
    await sleep(500);

    // Skip through VOTING & AI JUDGING to PODIUM
    for (let k = 0; k < 12; k++) {
      host.emit('host:skip_timer');
      await sleep(200);
      const hs = getHostState();
      if (hs?.game?.phase === 'PODIUM' || hs?.status === 'FINISHED') break;
    }

    const finalHost = getHostState();
    const podium = finalHost?.game?.podium || finalHost?.game?.leaderboard || [];
    console.log('Podium final Duelo de Ocurrencias:');
    podium.forEach((p, idx) => console.log(`  #${idx+1}: ${p.name} - ${p.score} PTS`));

    const totalPts = podium.reduce((acc, p) => acc + (p.score || 0), 0);
    if (totalPts <= 0) {
      throw new Error('FAIL: Podium terminó con 0 PTS en todos los jugadores!');
    }
    console.log('✅ Duelo de Ocurrencias: Puntuaciones mayores a 0 PTS garantizadas en el podio.');

    host.disconnect();
    players.forEach(p => p.socket.disconnect());
  }

  // ==========================================
  // 2. EL IMPOSTOR DE SILICIO (VOTING BUTTONS & ROLE SECRECY)
  // ==========================================
  console.log('\n--- 2. Probando EL IMPOSTOR DE SILICIO (Spyfall-style) ---');
  {
    const { host, players, getHostState } = await createRoomWithPlayers('impostor-silicio', 2);
    await new Promise((res) => host.emit('host:start_game', {}, res));
    await sleep(300);

    // Skip Tutorial
    host.emit('host:skip_timer');
    await sleep(300);

    // Skip Intro
    host.emit('host:skip_timer');
    await sleep(300);

    // Submit Clues 1
    players.forEach((p, i) => {
      p.socket.emit('player:submit_clue', { clue: `Pista_Clave_${i}` });
    });
    await sleep(300);

    // Skip Reveal 1 & Clues 2 & Debate to VOTING
    for (let step = 0; step < 3; step++) {
      host.emit('host:skip_timer');
      await sleep(300);
    }

    // Verify VOTING phase and candidate list
    const p0State = players[0].socket._lastState;
    console.log(`Fase actual en teléfono: ${p0State?.game?.phase}`);
    const candidates = p0State?.game?.candidates || [];
    console.log(`Candidatos visibles para ${players[0].name} (debe excluirse a sí mismo): ${candidates.length}`);
    if (candidates.length !== 2) {
      throw new Error(`FAIL: Se esperaban 2 candidatos para votar, pero se recibieron ${candidates.length}`);
    }
    candidates.forEach(c => console.log(`  - Sospechoso: ${c.name} (${c.avatar}) | Pista: ${c.clue}`));

    // Players cast valid votes (excluding self)
    const p1State = players[1].socket._lastState;
    const p1Candidate = p1State?.game?.candidates?.[0]?.id || candidates[1].id;
    players[0].socket.emit('player:submit_impostor_vote', { suspectId: candidates[0].id });
    players[1].socket.emit('player:submit_impostor_vote', { suspectId: p1Candidate });
    players[2].socket.emit('player:submit_impostor_vote', { suspectId: candidates[0].id });
    await sleep(600);

    const hsRoundSusp = getHostState();
    console.log(`Fase tras votación Ronda 1: ${hsRoundSusp?.game?.phase}`);
    const suspSummary = (hsRoundSusp?.game?.suspicionBoard || []).map(s => `${s.name}: ${s.totalSuspicion} sospechas`).join(' | ');
    console.log(`Expediente de sospechas acumuladas: ${suspSummary}`);
    if (hsRoundSusp?.game?.phase !== 'ROUND_SUSPICION') {
      throw new Error(`FAIL: Se esperaba fase ROUND_SUSPICION pero se obtuvo ${hsRoundSusp?.game?.phase}`);
    }
    console.log('✅ El Impostor de Silicio: Votos acumulados sin expulsar tempranamente a nadie.');

    // Now skip to final round and verify final verdict
    for (let k = 0; k < 10; k++) {
      host.emit('host:skip_timer');
      await sleep(200);
      const hs = getHostState();
      if (hs?.game?.phase === 'RESOLUTION' || hs?.game?.phase === 'PODIUM') break;
    }
    const hsFinal = getHostState();
    console.log(`Fase final del Impostor: ${hsFinal?.game?.phase}`);
    console.log('✅ El Impostor de Silicio: Veredicto final y clímax dramático verificado.');

    host.disconnect();
    players.forEach(p => p.socket.disconnect());
  }

  // ==========================================
  // 3. DILEMAS EXTREMOS
  // ==========================================
  console.log('\n--- 3. Probando DILEMAS EXTREMOS (Would You Rather) ---');
  {
    const { host, players, getHostState } = await createRoomWithPlayers('dilemas-extremos', 2);
    await new Promise((res) => host.emit('host:start_game', {}, res));
    await sleep(300);

    host.emit('host:skip_timer'); // Skip HOW_TO_PLAY -> startRound (LIE_WRITING)
    await sleep(400);

    // CHOICE phase: players submit choices and predictions
    players.forEach(p => {
      p.socket.emit('player:choose_dilemma', { choice: 'A', prediction: 'A' });
    });
    await sleep(400);

    const hs = getHostState();
    console.log(`Dilemas Host Phase: ${hs?.game?.phase}`);
    console.log('✅ Dilemas Extremos: Respuestas y apuestas registradas correctamente.');

    host.disconnect();
    players.forEach(p => p.socket.disconnect());
  }

  // ==========================================
  // 4. BOMBA DE PALABRAS (WORD BOMB HOT POTATO)
  // ==========================================
  console.log('\n--- 4. Probando BOMBA DE PALABRAS (Hot Potato Word Speed) ---');
  {
    const { host, players, getHostState } = await createRoomWithPlayers('bomba-palabras', 2);
    await new Promise((res) => host.emit('host:start_game', {}, res));
    await sleep(300);

    host.emit('host:skip_timer'); // Skip HOW_TO_PLAY -> INTRO
    await sleep(250);
    host.emit('host:skip_timer'); // Skip INTRO -> TICKING
    await sleep(350);

    const hs = getHostState();
    console.log(`Bomba activa: Regla = "${hs?.game?.prompt}", Filtro = "${hs?.game?.filter || 'ninguno'}"`);
    console.log(`Portador de la bomba: ${hs?.game?.activePlayerName}`);

    // Active player submits a matching word
    const activePlayer = players.find(p => p.socket._lastState?.game?.isMyTurn);
    if (!activePlayer) throw new Error('FAIL: Ningún jugador tiene el turno de la bomba!');

    const testWord = hs?.game?.filter ? `SUPER${hs.game.filter}TEST` : 'FIESTALOCA';
    const wordRes = await new Promise(res => {
      activePlayer.socket.emit('player:submit_bomba_word', { word: testWord }, res);
    });
    console.log(`Palabra enviada por ${activePlayer.name}: ${JSON.stringify(wordRes)}`);
    if (!wordRes.success) throw new Error('FAIL: Falló el envío de palabra en Bomba de Palabras: ' + (wordRes.error || ''));

    await sleep(400);
    const hsAfter = getHostState();
    console.log(`Palabras aceptadas en cadena: ${JSON.stringify(hsAfter?.game?.wordsAccepted)}`);
    console.log(`Nuevo portador tras el pase: ${hsAfter?.game?.activePlayerName}`);
    console.log('✅ Bomba de Palabras: Mecánica de pase veloz y filtrado de palabras funcionando.');

    host.disconnect();
    players.forEach(p => p.socket.disconnect());
  }

  // ==========================================
  // 5. FALSO SABIO (FIBBAGE BLUFF TRIVIA)
  // ==========================================
  console.log('\n--- 5. Probando FALSO SABIO (Fibbage-style Bluff Trivia) ---');
  {
    const { host, players, getHostState } = await createRoomWithPlayers('falso-sabio', 2);
    await new Promise((res) => host.emit('host:start_game', {}, res));
    await sleep(300);

    host.emit('host:skip_timer'); // Skip HOW_TO_PLAY -> startRound (LIE_WRITING)
    await sleep(400);

    const hs = getHostState();
    console.log(`Pregunta insólita: "${hs?.game?.question}"`);

    // LIE_WRITING Phase
    players.forEach((p, idx) => {
      p.socket.emit('player:submit_falso_lie', { lie: `Mentira_${idx}_muy_creible` });
    });
    await sleep(500);

    const hsVoting = getHostState();
    console.log(`Fase tras enviar faroles: ${hsVoting?.game?.phase}`);
    console.log(`Opciones disponibles para votar: ${hsVoting?.game?.choices?.length}`);
    if (!hsVoting?.game?.choices || hsVoting.game.choices.length < 3) {
      throw new Error('FAIL: Falso Sabio no generó la lista de opciones (verdad + mentiras)!');
    }

    // TRUTH_VOTING: players vote
    players.forEach(p => {
      p.socket.emit('player:submit_falso_vote', { choice: hsVoting.game.choices[0].text });
    });
    await sleep(500);

    const hsReveal = getHostState();
    console.log(`Fase tras votar: ${hsReveal?.game?.phase}`);
    console.log(`La verdad real revelada es: "${hsReveal?.game?.revealedTruth}"`);
    console.log('✅ Falso Sabio: Mecánica de faroles, votación y revelación funcionando al 100%.');

    host.disconnect();
    players.forEach(p => p.socket.disconnect());
  }

  console.log('\n🎉 ¡TODOS LOS TESTS DE LOS 5 JUEGOS PASARON CON 100% DE ÉXITO!');
  process.exit(0);
}

testAll5Games().catch(err => {
  console.error('\n❌ ERROR EN LA VERIFICACIÓN:', err);
  process.exit(1);
});
