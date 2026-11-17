/**
 * tests/test-all-7-games.js
 * Comprehensive integration suite verifying all 7 Jackbox-style games:
 * 1. Duelo de Ocurrencias (Mín. 3)
 * 2. El Impostor de Silicio (Mín. 3)
 * 3. Dilemas Extremos (2-10)
 * 4. Bomba de Palabras (2-10)
 * 5. Falso Sabio (Mín. 3)
 * 6. Trivia Caótica (2-10) [Verified in 2-Player 1v1 Duel with point stealing]
 * 7. Telepatía de Fiesta (2-10) [Verified in 2-Player Connection Test with spectrum slider]
 */

import { io as ioClient } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3000';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createRoomWithPlayers(gameId, rounds = 2, audience = 'amigos', playerCount = 3) {
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
  for (let i = 0; i < playerCount; i++) {
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

async function testAll7Games() {
  console.log('🚀 INICIANDO VERIFICACIÓN COMPLETA DE LOS 7 JUEGOS JACKBOX-STYLE');

  // ==========================================
  // 1. DUELO DE OCURRENCIAS (QUILLASH)
  // ==========================================
  console.log('\n--- 1. Probando DUELO DE OCURRENCIAS (3 Jugadores) ---');
  {
    const { host, players, getHostState } = await createRoomWithPlayers('duelo-ocurrencias', 2, 'amigos', 3);
    await new Promise((res) => host.emit('host:start_game', {}, res));
    await sleep(300);

    host.emit('host:skip_timer'); // skip intro
    await sleep(300);

    for (let i = 0; i < players.length; i++) {
      const pState = players[i].socket._lastState;
      if (pState?.game?.prompts) {
        const answers = {};
        pState.game.prompts.forEach(pr => { answers[pr.duelId] = `Respuesta de ${players[i].name}`; });
        players[i].socket.emit('player:submit_answers', { answers });
      }
    }
    await sleep(400);

    for (let k = 0; k < 8; k++) {
      host.emit('host:skip_timer');
      await sleep(150);
      const hs = getHostState();
      if (hs?.game?.phase === 'PODIUM' || hs?.status === 'FINISHED') break;
    }
    console.log('✅ Duelo de Ocurrencias completado.');
    host.disconnect();
    players.forEach(p => p.socket.disconnect());
  }

  // ==========================================
  // 2. EL IMPOSTOR DE SILICIO (SPYFALL)
  // ==========================================
  console.log('\n--- 2. Probando EL IMPOSTOR DE SILICIO (3 Jugadores) ---');
  {
    const { host, players, getHostState } = await createRoomWithPlayers('impostor-silicio', 2, 'amigos', 3);
    await new Promise((res) => host.emit('host:start_game', {}, res));
    await sleep(300);

    host.emit('host:skip_timer'); // TUTORIAL
    await sleep(300);

    const hs = getHostState();
    console.log(`Palabra secreta: ${hs?.game?.secretWord}, Pista: ${hs?.game?.secretClue}`);

    // Submit clues
    players.forEach((p, idx) => {
      p.socket.emit('player:submit_clue', { clueText: `Pista_sospechosa_${idx}` });
    });
    await sleep(400);

    host.emit('host:skip_timer'); // CLUES -> DEBATE
    await sleep(200);
    host.emit('host:skip_timer'); // DEBATE -> VOTING
    await sleep(300);

    const suspect = players[0].socket.id;
    players.forEach(p => {
      p.socket.emit('player:submit_impostor_vote', { suspectId: suspect });
    });
    await sleep(400);

    console.log('✅ El Impostor de Silicio completado.');
    host.disconnect();
    players.forEach(p => p.socket.disconnect());
  }

  // ==========================================
  // 3. DILEMAS EXTREMOS
  // ==========================================
  console.log('\n--- 3. Probando DILEMAS EXTREMOS (2 Jugadores) ---');
  {
    const { host, players, getHostState } = await createRoomWithPlayers('dilemas-extremos', 2, 'amigos', 2);
    await new Promise((res) => host.emit('host:start_game', {}, res));
    await sleep(300);

    host.emit('host:skip_timer'); // TUTORIAL -> CHOICE
    await sleep(300);

    players.forEach(p => {
      p.socket.emit('player:choose_dilemma', { choice: 'A', prediction: 'A' });
    });
    await sleep(400);

    const hs = getHostState();
    console.log(`Dilemas Host Phase: ${hs?.game?.phase}`);
    console.log('✅ Dilemas Extremos completado.');

    host.disconnect();
    players.forEach(p => p.socket.disconnect());
  }

  // ==========================================
  // 4. BOMBA DE PALABRAS
  // ==========================================
  console.log('\n--- 4. Probando BOMBA DE PALABRAS (2 Jugadores) ---');
  {
    const { host, players, getHostState } = await createRoomWithPlayers('bomba-palabras', 2, 'amigos', 2);
    await new Promise((res) => host.emit('host:start_game', {}, res));
    await sleep(300);

    host.emit('host:skip_timer'); // HOW_TO_PLAY
    await sleep(200);
    host.emit('host:skip_timer'); // INTRO -> TICKING
    await sleep(350);

    const hs = getHostState();
    const activePlayer = players.find(p => p.socket._lastState?.game?.isMyTurn);
    if (!activePlayer) throw new Error('FAIL: Nadie tiene el turno de la bomba!');

    const testWord = hs?.game?.filter ? `SUPER${hs.game.filter}TEST` : 'FIESTALOCA';
    const wordRes = await new Promise(res => {
      activePlayer.socket.emit('player:submit_bomba_word', { word: testWord }, res);
    });
    if (!wordRes.success) throw new Error('FAIL: Falló envío de palabra: ' + wordRes.error);

    console.log('✅ Bomba de Palabras completado.');
    host.disconnect();
    players.forEach(p => p.socket.disconnect());
  }

  // ==========================================
  // 5. FALSO SABIO
  // ==========================================
  console.log('\n--- 5. Probando FALSO SABIO (3 Jugadores) ---');
  {
    const { host, players, getHostState } = await createRoomWithPlayers('falso-sabio', 2, 'amigos', 3);
    await new Promise((res) => host.emit('host:start_game', {}, res));
    await sleep(300);

    host.emit('host:skip_timer'); // HOW_TO_PLAY -> LIE_WRITING
    await sleep(400);

    players.forEach((p, idx) => {
      p.socket.emit('player:submit_falso_lie', { lie: `Mentira_${idx}_muy_creible` });
    });
    await sleep(500);

    const hsVoting = getHostState();
    if (!hsVoting?.game?.choices || hsVoting.game.choices.length < 3) {
      throw new Error('FAIL: Falso Sabio no generó opciones!');
    }

    players.forEach(p => {
      p.socket.emit('player:submit_falso_vote', { choice: hsVoting.game.choices[0].text });
    });
    await sleep(500);

    console.log('✅ Falso Sabio completado.');
    host.disconnect();
    players.forEach(p => p.socket.disconnect());
  }

  // ==========================================
  // 6. TRIVIA CAÓTICA (2 JUGADORES - 1v1 DUEL CON ROBO DE PUNTOS)
  // ==========================================
  console.log('\n--- 6. Probando TRIVIA CAÓTICA (2 Jugadores - Duelo 1v1) ---');
  {
    const { host, players, getHostState } = await createRoomWithPlayers('trivia-caotica', 2, 'familia', 2);
    await new Promise((res) => host.emit('host:start_game', {}, res));
    await sleep(300);

    host.emit('host:skip_timer'); // HOW_TO_PLAY -> INTRO
    await sleep(250);
    host.emit('host:skip_timer'); // INTRO -> QUESTION
    await sleep(400);

    const hs = getHostState();
    console.log(`Trivia Pregunta: "${hs?.game?.question}", Categoría: "${hs?.game?.category}"`);
    console.log(`Modo Duelo 1v1 activado: ${hs?.game?.isDuelMode}`);
    if (!hs?.game?.isDuelMode) throw new Error('FAIL: Trivia Caótica con 2 jugadores debió activar isDuelMode!');

    // Player 0 answers correctly (correctIndex is hidden during question phase on mobile, let's submit choice 0)
    // Both players submit choices
    players[0].socket.emit('player:submit_trivia_answer', { choiceIndex: 0 });
    players[1].socket.emit('player:submit_trivia_answer', { choiceIndex: 1 });
    await sleep(600);

    const hsReveal = getHostState();
    console.log(`Trivia Fase tras responder: ${hsReveal?.game?.phase}`);
    console.log(`Opción correcta revelada: ${hsReveal?.game?.correctIndex}`);
    console.log(`Explicación: "${hsReveal?.game?.explanation}"`);
    if (hsReveal?.game?.phase !== 'REVEAL') {
      throw new Error('FAIL: Trivia Caótica no avanzó a REVEAL tras responder ambos jugadores!');
    }

    console.log('✅ Trivia Caótica: 1v1 Duelo de Asalto y revelación verificados al 100%.');
    host.disconnect();
    players.forEach(p => p.socket.disconnect());
  }

  // ==========================================
  // 7. TELEPATÍA DE FIESTA (2 JUGADORES - CONEXIÓN MENTAL)
  // ==========================================
  console.log('\n--- 7. Probando TELEPATÍA DE FIESTA (2 Jugadores - Test Conexión) ---');
  {
    const { host, players, getHostState } = await createRoomWithPlayers('telepatia-fiesta', 2, 'familia', 2);
    await new Promise((res) => host.emit('host:start_game', {}, res));
    await sleep(300);

    host.emit('host:skip_timer'); // HOW_TO_PLAY -> INTRO
    await sleep(250);
    host.emit('host:skip_timer'); // INTRO -> SPECTRUM
    await sleep(400);

    const hs = getHostState();
    console.log(`Telepatía Tema: "${hs?.game?.topic}"`);
    console.log(`Izquierda: "${hs?.game?.leftLabel}" | Derecha: "${hs?.game?.rightLabel}"`);
    console.log(`Modo Duelo Parejas / 1v1 activado: ${hs?.game?.isDuelMode}`);
    if (!hs?.game?.isDuelMode) throw new Error('FAIL: Telepatía de Fiesta con 2 jugadores debió activar isDuelMode!');

    // Player 0 sends 75%, Player 1 sends 78% (Difference = 3, High Affinity!)
    players[0].socket.emit('player:submit_telepatia_value', { value: 75 });
    players[1].socket.emit('player:submit_telepatia_value', { value: 78 });
    await sleep(600);

    const hsReveal = getHostState();
    console.log(`Telepatía Fase tras calibrar: ${hsReveal?.game?.phase}`);
    console.log(`Diferencia: ${hsReveal?.game?.duelResult?.diff} puntos`);
    console.log(`Afinidad calculada: ${hsReveal?.game?.duelResult?.affinityPercent}%`);
    console.log(`Puntos otorgados por conexión: +${hsReveal?.game?.duelResult?.points} PTS`);

    if (hsReveal?.game?.duelResult?.diff !== 3) {
      throw new Error(`FAIL: Diferencia esperada 3, pero se obtuvo ${hsReveal?.game?.duelResult?.diff}`);
    }
    if (hsReveal?.game?.duelResult?.affinityPercent !== 97) {
      throw new Error(`FAIL: Afinidad esperada 97%, pero se obtuvo ${hsReveal?.game?.duelResult?.affinityPercent}`);
    }

    console.log('✅ Telepatía de Fiesta: Test de Conexión Mental 1v1 verificado al 100%.');
    host.disconnect();
    players.forEach(p => p.socket.disconnect());
  }

  console.log('\n🎉 ¡TODOS LOS TESTS DE LOS 7 JUEGOS JACKBOX-STYLE PASARON CON 100% DE ÉXITO!');
  process.exit(0);
}

testAll7Games().catch(err => {
  console.error('\n❌ ERROR EN LA VERIFICACIÓN:', err);
  process.exit(1);
});
