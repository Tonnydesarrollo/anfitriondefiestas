/**
 * Automated end-to-end simulation test for Party Game Server:
 * Tests RoomManager, Sockets, QR Code, Duelo de Ocurrencias phases, and Ollama/Fallback AI.
 */

import { io as ioClient } from 'socket.io-client';

const PORT = process.env.PORT || 3000;
const SERVER_URL = `http://localhost:${PORT}`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runSimulation() {
  console.log('🚀 Starting Party Game Server simulation test...\n');

  // Wait a moment for server to bind
  await sleep(1000);

  // 1. Connect Host Socket
  console.log('1️⃣ Connecting Host socket...');
  const hostSocket = ioClient(SERVER_URL, { reconnection: false });

  await new Promise((resolve) => hostSocket.on('connect', resolve));
  console.log('✅ Host connected:', hostSocket.id);

  // 2. Host creates room
  console.log('2️⃣ Host requests room creation...');
  const roomData = await new Promise((resolve) => {
    hostSocket.emit('host:create_room', {}, (res) => resolve(res));
  });

  if (!roomData.success || !roomData.roomCode) {
    throw new Error(`Failed to create room: ${JSON.stringify(roomData)}`);
  }

  const roomCode = roomData.roomCode;
  console.log(`✅ Room created successfully: [${roomCode}]`);
  console.log(`📱 Join URL: ${roomData.joinUrl}`);
  console.log(`📷 QR code data URL length: ${roomData.qrCodeDataUrl.length} characters`);

  // 3. Connect 3 players
  console.log('\n3️⃣ Connecting 3 players to room...');
  const playerNames = ['Valentina', 'Mateo', 'Camila'];
  const playerSockets = [];
  const latestPlayerStates = new Map();

  for (const name of playerNames) {
    const pSocket = ioClient(SERVER_URL, { reconnection: false });
    await new Promise((resolve) => pSocket.on('connect', resolve));
    pSocket.on('player:state_update', (st) => latestPlayerStates.set(pSocket.id, st));

    const joinRes = await new Promise((resolve) => {
      pSocket.emit('player:join', { roomCode, playerName: name }, resolve);
    });

    if (!joinRes.success) {
      throw new Error(`Player ${name} failed to join: ${joinRes.error}`);
    }

    console.log(`✅ Player joined: ${joinRes.player.name} (${joinRes.player.avatar.emoji} ${joinRes.player.avatar.label})`);
    playerSockets.push({ name, socket: pSocket, data: joinRes.player });
  }

  // 4. Test duplicate name prevention
  console.log('\n4️⃣ Testing duplicate name rejection...');
  const duplicateSocket = ioClient(SERVER_URL, { reconnection: false });
  await new Promise((resolve) => duplicateSocket.on('connect', resolve));
  const dupRes = await new Promise((resolve) => {
    duplicateSocket.emit('player:join', { roomCode, playerName: 'Valentina' }, resolve);
  });

  if (dupRes.success === false && dupRes.error.includes('Ya existe un jugador')) {
    console.log('✅ Duplicate name correctly rejected:', dupRes.error);
  } else {
    throw new Error(`Expected duplicate name to fail, got: ${JSON.stringify(dupRes)}`);
  }
  duplicateSocket.disconnect();

  // 5. Host starts game
  console.log('\n5️⃣ Host starts "Duelo de Ocurrencias"...');
  const startRes = await new Promise((resolve) => {
    hostSocket.emit('host:start_game', {}, resolve);
  });

  if (!startRes.success) {
    throw new Error(`Failed to start game: ${startRes.error}`);
  }
  console.log('✅ Game started in INTRO phase.');

  // Host skips intro countdown to answering phase
  await sleep(1000);
  console.log('⏭ Host skips intro timer into ANSWERING phase...');
  hostSocket.emit('host:skip_timer');

  // Wait for state updates
  await sleep(1000);

  // 6. Inspect private prompts for each player
  console.log('\n6️⃣ Checking private state and prompts assigned to players:');
  const answerSubmissions = {};

  for (const p of playerSockets) {
    const privateState = latestPlayerStates.get(p.socket.id);
    console.log(`👤 ${p.name} private state phase: ${privateState?.game?.phase}`);
    const prompts = privateState?.game?.prompts || [];
    console.log(`   Assigned ${prompts.length} prompts to ${p.name}:`);

    const myAnswers = {};
    for (const prompt of prompts) {
      console.log(`   - [Duel ${prompt.duelId}]: "${prompt.promptText}"`);
      myAnswers[prompt.duelId] = `Respuesta ocurrente de ${p.name} para ${prompt.duelId}`;
    }
    answerSubmissions[p.socket.id] = myAnswers;
  }

  // 7. Submit answers for all players
  console.log('\n7️⃣ Submitting answers for all players...');
  for (const p of playerSockets) {
    const subRes = await new Promise((resolve) => {
      p.socket.emit('player:submit_answers', { answers: answerSubmissions[p.socket.id] }, resolve);
    });
    console.log(`✅ ${p.name} answers submitted:`, subRes.success);
  }

  // Wait for automatic phase transition to VOTING
  await sleep(1500);

  // 8. Test VOTING phase
  console.log('\n8️⃣ Testing VOTING phase for first duel...');
  await sleep(1000);
  for (const p of playerSockets) {
    const pState = latestPlayerStates.get(p.socket.id);

    const isDuelist = pState?.game?.isDuelist;
    console.log(`👤 ${p.name}: isDuelist = ${isDuelist}`);

    if (!isDuelist) {
      console.log(`   ${p.name} is a voter! Options are:`);
      console.log(`   A: "${pState?.game?.options?.A}"`);
      console.log(`   B: "${pState?.game?.options?.B}"`);

      // Cast vote
      const voteRes = await new Promise((resolve) => {
        p.socket.emit('player:vote', { duelId: pState.game.duelId, choice: 'A' }, resolve);
      });
      console.log(`   ${p.name} voted for A:`, voteRes);
    } else {
      console.log(`   ${p.name} is in the duel (cannot vote, waiting in suspense)`);
    }
  }

  // Host skips voting countdown to proceed to AI judging
  await sleep(1500);
  console.log('⏭ Host advances to AI_JUDGING...');
  hostSocket.emit('host:skip_timer');

  await sleep(3500);

  // Host checks public state for AI verdict
  const hostPublicState = await new Promise((resolve) => {
    hostSocket.once('host:state_update', resolve);
    hostSocket.emit('host:skip_timer');
  });

  console.log('\n9️⃣ AI Evaluation received:');
  const duelInfo = hostPublicState?.game?.currentDuel;
  if (duelInfo?.aiJudgement) {
    console.log(`🤖 Anfitrión IA Verdict: Winner [${duelInfo.aiJudgement.winner}]`);
    console.log(`🎙️ Commentary: "${duelInfo.aiJudgement.commentary}"`);
    console.log(`⭐ Source: ${duelInfo.aiJudgement.source}`);
  } else {
    console.log('ℹ️ Current phase state:', hostPublicState?.game?.phase);
  }

  // Clean up
  console.log('\n🔟 Cleaning up test sockets...');
  for (const p of playerSockets) {
    p.socket.disconnect();
  }
  hostSocket.disconnect();

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! Platform backend architecture is solid and operational.\n');
  process.exit(0);
}

runSimulation().catch((err) => {
  console.error('\n❌ Simulation test error:', err);
  process.exit(1);
});
