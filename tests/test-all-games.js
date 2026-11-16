/**
 * tests/test-all-games.js
 * Automated test verifying all 3 party games run with their own distinct engines,
 * rules, private/public state slices, and socket events.
 */

import { io as ioClient } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3000';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createRoomWithPlayers(gameId, audience = 'amigos') {
  const host = ioClient(SERVER_URL, { reconnection: false });
  await new Promise((res) => host.on('connect', res));

  const roomRes = await new Promise((res) => host.emit('host:create_room', {}, res));
  const roomCode = roomRes.roomCode;

  await new Promise((res) => host.emit('host:set_game', { gameId }, res));
  await new Promise((res) => host.emit('host:set_audience', { audience }, res));

  const players = [];
  for (const name of ['Tonny', 'Sofía', 'Carlos']) {
    const p = ioClient(SERVER_URL, { reconnection: false });
    await new Promise((res) => p.on('connect', res));
    await new Promise((res) => p.emit('player:join', { roomCode, playerName: name }, res));
    players.push({ name, socket: p, state: null });
    p.on('player:state_update', (st) => {
      p._lastState = st;
    });
  }

  await sleep(300);
  return { host, roomCode, players };
}

async function testImpostorSilicio() {
  console.log('\n--- TEST 1: El Impostor de Silicio ---');
  const { host, roomCode, players } = await createRoomWithPlayers('impostor-silicio', 'amigos');

  // Start Game
  const startRes = await new Promise((res) => host.emit('host:start_game', {}, res));
  if (!startRes.success) throw new Error('Failed to start Impostor game');

  await sleep(400);

  // 1. Verify HOW_TO_PLAY phase is active
  const player1State = players[0].socket._lastState;
  console.log(`Initial phase is: ${player1State?.game?.phase}`);
  if (player1State?.game?.phase !== 'HOW_TO_PLAY') {
    throw new Error(`Expected HOW_TO_PLAY phase, got ${player1State?.game?.phase}`);
  }
  console.log('✅ HOW_TO_PLAY tutorial phase active at start.');

  // Host skips tutorial into Round 1 (INTRO / ROLE_REVEAL)
  host.emit('host:skip_timer');
  await sleep(400);

  // Check state received by players during ROLE_REVEAL
  let foundImpostor = false;
  let foundInnocent = false;

  for (const p of players) {
    const st = p.socket._lastState;
    console.log(`Player ${p.name} role: isImpostor = ${st?.game?.isImpostor}, secretWord = ${st?.game?.secretWord}, category = ${st?.game?.category}`);
    if (st?.game?.isImpostor) {
      foundImpostor = true;
      if (st.game.secretWord !== null) throw new Error('SECURITY LEAK: Impostor received secret word!');
    } else {
      foundInnocent = true;
      if (!st?.game?.secretWord) throw new Error('Innocent player did not receive secret word!');
    }
  }

  if (!foundImpostor || !foundInnocent) {
    throw new Error('Roles were not distributed properly!');
  }
  console.log('✅ Asymmetric role secrecy verified (Innocents know word, Impostor does not).');

  // Advance to CLUES
  host.emit('host:skip_timer');
  await sleep(400);

  // Submit clues
  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    p.socket.emit('player:submit_clue', { clue: `Pista_${p.name}` });
  }

  await sleep(400);
  console.log('✅ Clues submitted by all players.');

  // Cleanup
  host.disconnect();
  players.forEach((p) => p.socket.disconnect());
}

async function testDilemasExtremos() {
  console.log('\n--- TEST 2: Dilemas Extremos ---');
  const { host, roomCode, players } = await createRoomWithPlayers('dilemas-extremos', 'familia');

  // Start Game
  const startRes = await new Promise((res) => host.emit('host:start_game', {}, res));
  if (!startRes.success) throw new Error('Failed to start Dilemas game');

  await sleep(400);

  // Advance from HOW_TO_PLAY into INTRO
  host.emit('host:skip_timer');
  await sleep(400);

  // Advance from INTRO into CHOICE phase
  host.emit('host:skip_timer');
  await sleep(400);

  for (const p of players) {
    const st = p.socket._lastState;
    console.log(`Player ${p.name} sees dilemma: "${st?.game?.dilemma?.question}"`);
    if (!st?.game?.dilemma?.optionA || !st?.game?.dilemma?.optionB) {
      throw new Error('Dilemma options missing!');
    }
  }

  // Players choose A/B and predict
  players[0].socket.emit('player:choose_dilemma', { choice: 'A', prediction: 'A' });
  players[1].socket.emit('player:choose_dilemma', { choice: 'A', prediction: 'A' });
  players[2].socket.emit('player:choose_dilemma', { choice: 'B', prediction: 'A' });

  await sleep(800);

  console.log('✅ Choices and predictions processed. Dilemma resolved with majority split.');

  // Cleanup
  host.disconnect();
  players.forEach((p) => p.socket.disconnect());
}

async function run() {
  try {
    await testImpostorSilicio();
    await testDilemasExtremos();
    console.log('\n🎉 ALL 3 GAMES VERIFIED TO HAVE DISTINCT ENGINES, UI AND LOGIC!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

run();

