import { io as ioClient } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3000';
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function testFullImpostorFlow() {
  console.log('--- Testing El Impostor de Silicio Full 2-Clue & Resolution Flow ---');

  const host = ioClient(SERVER_URL, { reconnection: false });
  await new Promise((res) => host.on('connect', res));

  const roomRes = await new Promise((res) => host.emit('host:create_room', {}, res));
  const roomCode = roomRes.roomCode;
  console.log('Room created:', roomCode);

  let hostState = null;
  host.on('host:state_update', (st) => { 
    hostState = st?.game || st; 
  });

  // Select impostor game
  await new Promise((res) => host.emit('host:set_game', { gameId: 'impostor-silicio' }, res));

  // Connect 3 players
  const playerNames = ['Tonny', 'Sofía', 'Carlos'];
  const players = [];
  for (const name of playerNames) {
    const p = ioClient(SERVER_URL, { reconnection: false });
    await new Promise((res) => p.on('connect', res));
    await new Promise((res) => p.emit('player:join', { roomCode, playerName: name }, res));
    p.on('player:state_update', (st) => { p._lastState = st; });
    players.push({ name, socket: p });
  }

  await sleep(400);

  // 1. Start Game
  await new Promise((res) => host.emit('host:start_game', {}, res));
  await sleep(300);

  // Skip tutorial to INTRO
  host.emit('host:skip_timer');
  await sleep(300);

  // Skip INTRO to CLUES_1
  host.emit('host:skip_timer');
  await sleep(300);

  console.log('Current Phase:', hostState?.phase);
  if (hostState?.phase !== 'CLUES_1') {
    throw new Error(`Expected CLUES_1 phase, got: ${hostState?.phase}`);
  }

  // 2. Submit Round 1 Clues
  for (const p of players) {
    p.socket.emit('player:submit_clue', { clue: `Pista1_${p.name}` });
  }
  await sleep(600);

  console.log('Current Phase after submitting all Clues 1:', hostState?.phase);
  if (hostState?.phase === 'CLUES_REVEAL_1') {
    // Skip reveal 1 into CLUES_2
    host.emit('host:skip_timer');
    await sleep(400);
  }

  console.log('Current Phase:', hostState?.phase);
  if (hostState?.phase !== 'CLUES_2') {
    throw new Error(`Expected CLUES_2 phase, got: ${hostState?.phase}`);
  }

  // 3. Submit Round 2 Clues
  for (const p of players) {
    p.socket.emit('player:submit_clue', { clue: `Pista2_${p.name}` });
  }
  await sleep(600);

  console.log('Current Phase after submitting all Clues 2:', hostState?.phase);
  if (hostState?.phase !== 'DEBATE') {
    // Skip to DEBATE if not auto-advanced
    host.emit('host:skip_timer');
    await sleep(400);
  }
  await sleep(300);
  console.log('Current Phase:', hostState?.phase);
  if (hostState?.phase !== 'DEBATE') {
    throw new Error(`Expected DEBATE phase, got: ${hostState?.phase}`);
  }

  // Verify Host clues on TV have NO [object Object] and have both clues
  console.log('Verifying clues on TV board:');
  for (const c of hostState.clues) {
    console.log(`  Player ${c.playerName} Avatar: "${c.avatar}" | Clue 1: "${c.clue1}" | Clue 2: "${c.clue2}"`);
    if (typeof c.avatar === 'object' || c.avatar.includes('object Object')) {
      throw new Error(`Host clue board avatar corrupted as object: ${c.avatar}`);
    }
    if (!c.clue1 || !c.clue2) {
      throw new Error(`Host clue board missing clue 1 or 2 for ${c.playerName}`);
    }
  }

  // Skip DEBATE into VOTING
  host.emit('host:skip_timer');
  await sleep(400);
  console.log('Current Phase:', hostState?.phase);
  if (hostState?.phase !== 'VOTING') {
    throw new Error(`Expected VOTING phase, got: ${hostState?.phase}`);
  }

  // Inspect candidates for each player
  for (const p of players) {
    const st = p.socket._lastState;
    if (!st?.game?.candidates || st.game.candidates.length !== 2) {
      throw new Error(`Player ${p.name} should see exactly 2 candidates`);
    }
  }

  // Submit votes: Tonny and Sofía vote Carlos
  const carlosId = players[2].socket.id;
  players[0].socket.emit('player:submit_impostor_vote', { suspectId: carlosId });
  players[1].socket.emit('player:submit_impostor_vote', { suspectId: carlosId });
  players[2].socket.emit('player:submit_impostor_vote', { suspectId: players[0].socket.id });

  await sleep(500);

  // Should transition to RESOLUTION
  console.log('Current Phase after voting:', hostState?.phase);
  if (hostState?.phase !== 'RESOLUTION') {
    throw new Error(`Expected RESOLUTION phase, got: ${hostState?.phase}`);
  }

  console.log('Resolution data on TV:');
  console.log('  Voted Out:', hostState.resolution?.votedOutName, 'Votes:', hostState.resolution?.votesCount);
  console.log('  Was Impostor Caught?', hostState.resolution?.wasImpostorCaught);
  console.log('  Real Impostor:', hostState.resolution?.realImpostorName);
  console.log('  Secret Word:', hostState.resolution?.secretWord);

  if (!hostState.resolution?.secretWord) {
    throw new Error('Resolution missing secretWord!');
  }
  if (!hostState.resolution?.votedOutName) {
    throw new Error('Resolution missing votedOutName!');
  }

  // Check private resolution on players' phones
  for (const p of players) {
    const privRes = p.socket._lastState?.game?.resolution;
    console.log(`  Player ${p.name} mobile resolution:`, privRes?.votedOutName, 'secret:', privRes?.secretWord);
    if (!privRes?.secretWord) {
      throw new Error(`Player ${p.name} did not receive secretWord in resolution!`);
    }
  }

  // Skip RESOLUTION to ESCAPE (if caught) or RESULTS
  host.emit('host:skip_timer');
  await sleep(400);
  console.log('Phase after resolution skip:', hostState?.phase);

  if (hostState?.phase === 'ESCAPE') {
    host.emit('host:skip_timer');
    await sleep(400);
  }

  console.log('Phase at results:', hostState?.phase);
  console.log('Host Leaderboard:', hostState?.leaderboard);

  if (!hostState?.leaderboard || hostState.leaderboard.length === 0) {
    throw new Error('Host leaderboard is missing!');
  }

  const totalPoints = hostState.leaderboard.reduce((sum, p) => sum + p.score, 0);
  console.log('Total awarded points across all players:', totalPoints);
  if (totalPoints <= 0) {
    throw new Error('Points were NOT awarded! Scores are still 0 PTS!');
  }

  // Skip to PODIUM (after round 2 or when ended)
  host.emit('host:end_game');
  await sleep(400);

  console.log('Final Host Phase:', hostState?.phase);
  console.log('Host Podium:', hostState?.podium);

  console.log('✅ ALL TESTS PASSED! Impostor 2-clue flow, Courtroom Resolution, and Real Scoring verified 100%!');

  host.disconnect();
  players.forEach((p) => p.socket.disconnect());
  process.exit(0);
}

testFullImpostorFlow().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
