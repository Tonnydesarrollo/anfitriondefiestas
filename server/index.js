/**
 * Main Server for "Anfitrión de Fiestas"
 * Express + Socket.IO party game platform.
 */

import http from 'http';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import QRCode from 'qrcode';

import { roomManager } from './roomManager.js';
import { DueloOcurrencias } from './games/dueloOcurrencias.js';
import { ImpostorSilicio } from './games/impostorSilicio.js';
import { DilemasExtremos } from './games/dilemasExtremos.js';
import { BombaPalabras } from './games/bombaPalabras.js';
import { FalsoSabio } from './games/falsoSabio.js';
import { TriviaCaoticaGame } from './games/triviaCaotica.js';
import { TelepatiaFiestaGame } from './games/telepatiaFiesta.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

const PORT = parseInt(process.env.PORT || '3000', 10);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

/**
 * Detect local IPv4 address so mobile devices on the same Wi-Fi can connect directly.
 */
function getLocalNetworkIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const LOCAL_IP = getLocalNetworkIp();

/**
 * Generates the full mobile join URL for a room.
 * Supports split architecture: Frontend on Vercel + Backend on Docker/VPS.
 */
function getJoinUrl(roomCode, reqHost = null, frontendOrigin = null, backendUrl = null) {
  let base = frontendOrigin ? frontendOrigin.replace(/\/$/, '') : (reqHost ? `http://${reqHost}` : `http://${LOCAL_IP}:${PORT}`);
  let url = `${base}/play?room=${roomCode}`;
  if (backendUrl && frontendOrigin && backendUrl.replace(/\/$/, '') !== frontendOrigin.replace(/\/$/, '')) {
    url += `&server=${encodeURIComponent(backendUrl.replace(/\/$/, ''))}`;
  }
  return url;
}

/**
 * Generates a base64 DataURL QR code for a given join URL.
 */
async function generateQrDataUrl(url) {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 320,
    color: {
      dark: '#1e272e',
      light: '#ffffff'
    }
  });
}

/**
 * Broadcasts synchronized state to the Host (public) and all Players (private).
 * Strictly maintains separation between Host TV display and mobile controller screens.
 */
function syncRoomState(roomCode) {
  const room = roomManager.getRoom(roomCode);
  if (!room) return;

  // 1. Send public state to Host socket
  if (room.hostSocketId) {
    const publicState = roomManager.getPublicState(roomCode);
    io.to(room.hostSocketId).emit('host:state_update', publicState);
  }

  // 2. Send private, tailored state to each individual player socket
  for (const [socketId, player] of room.players.entries()) {
    if (player.connected) {
      const privateState = roomManager.getPrivateState(roomCode, socketId);
      io.to(socketId).emit('player:state_update', privateState);
    }
  }
}

/**
 * Lightweight broadcast for 1-second timer ticks.
 * Never causes clients to re-render DOM or wipe active input fields.
 */
function emitTimerTick(roomCode, timer) {
  const room = roomManager.getRoom(roomCode);
  if (!room) return;

  if (room.hostSocketId) {
    io.to(room.hostSocketId).emit('host:timer_tick', { timer });
  }

  for (const [socketId, player] of room.players.entries()) {
    if (player.connected) {
      io.to(socketId).emit('player:timer_tick', { timer });
    }
  }
}

// ----------------------------------------------------
// REST API Endpoints
// ----------------------------------------------------

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    localIp: LOCAL_IP,
    port: PORT,
    activeRooms: roomManager.rooms.size
  });
});

// ====================================================
// HERRAMIENTAS PALOMARES — VOICE STUDIO INTEGRATION
// ====================================================
const VOICE_STUDIO_ENDPOINTS = [
  process.env.VOICESTUDIO_URL,
  'http://127.0.0.1:3900',
  'http://100.70.121.47:3900',
  'http://host.docker.internal:3900',
  'http://100.100.148.80:5000/voice-studio/api'
].filter(Boolean);

const DEFAULT_HOST_VOICE_PROFILES = [
  {
    id: 'host-cookie-jackbox',
    name: '🎩 Cookie Jackbox (Anfitrión Sarcástico TV)',
    gender: 'M',
    pitch_shift_hz: 6,
    formant_ratio: 1.03,
    speed: 1.12,
    base_voice: 'es-MX-JorgeNeural',
    catchphrase: '¡Bienvenidos a Duelo de Ocurrencias! Espero que hayan traído su ingenio, porque la piedad se quedó en el camerino.'
  },
  {
    id: 'host-lucha-libre',
    name: '🤼 El Rudísimo (Narrador de Lucha y Arena)',
    gender: 'M',
    pitch_shift_hz: -6,
    formant_ratio: 0.95,
    speed: 1.16,
    base_voice: 'es-MX-JorgeNeural',
    catchphrase: '¡Arrrancan las hostilidades en el cuadrilátero de la fiesta! ¡A darle con todo desde la primera caída!'
  },
  {
    id: 'host-don-showman',
    name: '🎺 Don Showman (Gigante del Sábado TV)',
    gender: 'M',
    pitch_shift_hz: -9,
    formant_ratio: 0.96,
    speed: 1.06,
    base_voice: 'es-CO-GonzaloNeural',
    catchphrase: '¡Qué dice el público! ¡Se encienden las luces del gran estelar y que pase el primer valiente de la noche!'
  },
  {
    id: 'host-ia-sarcastica',
    name: '🤖 S.I.L.I.C.I.O. 9000 (IA Mordaz / GLaDOS)',
    gender: 'F',
    pitch_shift_hz: 12,
    formant_ratio: 1.05,
    speed: 1.05,
    base_voice: 'es-ES-ElviraNeural',
    catchphrase: 'Protocolo de entretenimiento humano iniciado. Sus probabilidades de sobrevivir sin hacer el ridículo son del tres por ciento.'
  },
  {
    id: 'host-diva-chisme',
    name: '💃 La Diva del Chisme (Conductora Explosiva)',
    gender: 'F',
    pitch_shift_hz: 8,
    formant_ratio: 1.03,
    speed: 1.12,
    base_voice: 'es-CO-SalomeNeural',
    catchphrase: '¡Ay, mis amores! Prepárense porque hoy vamos a sacar todos los trapitos al sol en esta sala.'
  },
  {
    id: 'host-inspector-noir',
    name: '🕵️ Inspector Noir (Detective de Misterio)',
    gender: 'M',
    pitch_shift_hz: -14,
    formant_ratio: 0.93,
    speed: 0.98,
    base_voice: 'es-ES-AlvaroNeural',
    catchphrase: 'Cierren las puertas. Hay un impostor entre nosotros y nadie saldrá de esta sala hasta encontrar la verdad.'
  },
  {
    id: 'host-pibe-canchero',
    name: '🧉 El Pibe Canchero (Showman Late-Night)',
    gender: 'M',
    pitch_shift_hz: 4,
    formant_ratio: 1.01,
    speed: 1.11,
    base_voice: 'es-AR-TomasNeural',
    catchphrase: '¡Pero mirá qué equipazo tenemos esta noche, papá! Agárrense fuerte los celulares que esto se pone picante.'
  },
  {
    id: 'host-tio-chabelote',
    name: '🎪 Tío Chabelote (Concurso Retro Caricatura)',
    gender: 'M',
    pitch_shift_hz: 18,
    formant_ratio: 1.07,
    speed: 1.08,
    base_voice: 'es-MX-JorgeNeural',
    catchphrase: '¡Hola cuates! ¿Qué prefieren: los puntos de esta ronda o lo que hay detrás de la catafixia número tres?'
  }
];

app.get('/api/voices', async (req, res) => {
  let remoteProfiles = [];
  for (const baseUrl of VOICE_STUDIO_ENDPOINTS) {
    try {
      const target = baseUrl.endsWith('/api') ? `${baseUrl}/status` : `${baseUrl}/profiles`;
      const resp = await fetch(target, { signal: AbortSignal.timeout(1800) });
      if (resp.ok) {
        const data = await resp.json();
        remoteProfiles = data.profiles || [];
        if (remoteProfiles.length > 0) break;
      }
    } catch (_) {
      // try next endpoint
    }
  }

  const merged = [...DEFAULT_HOST_VOICE_PROFILES];
  for (const rp of remoteProfiles) {
    if (rp && rp.id && !merged.some(m => m.id === rp.id)) {
      merged.push(rp);
    }
  }
  res.json({ online: remoteProfiles.length > 0, profiles: merged });
});

async function handleVoiceStudioTts(req, res) {
  const text = String(req.body?.text || req.query?.text || '').trim();
  const voiceId = String(req.body?.voice || req.query?.voice || 'host-cookie-jackbox').replace(/^vs:/, '');
  if (!text) {
    return res.status(400).json({ error: 'Texto vacío' });
  }

  const profile = DEFAULT_HOST_VOICE_PROFILES.find(p => p.id === voiceId);
  const speed = Number(req.body?.speed || req.query?.speed || profile?.speed || 1.08);

  const payload = {
    model: 'omnivoice-v1',
    input: text,
    voice: voiceId,
    language: 'es',
    speed,
    response_format: 'wav'
  };

  for (const baseUrl of VOICE_STUDIO_ENDPOINTS) {
    try {
      const target = baseUrl.endsWith('/api') ? `${baseUrl}/tts` : `${baseUrl}/v1/audio/speech`;
      const resp = await fetch(target, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer palomares-voicestudio-local-2026'
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(12000)
      });
      if (resp.ok) {
        const contentType = resp.headers.get('content-type') || 'audio/wav';
        const arrayBuf = await resp.arrayBuffer();
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=3600');
        return res.send(Buffer.from(arrayBuf));
      }
    } catch (_) {
      // try next endpoint
    }
  }

  return res.status(503).json({ error: 'Voice Studio no disponible temporalmente' });
}

app.get('/api/tts', handleVoiceStudioTts);
app.post('/api/tts', handleVoiceStudioTts);

// Dynamic QR code generator endpoint
app.get('/api/room/:code/qr', async (req, res) => {
  const { code } = req.params;
  const room = roomManager.getRoom(code);
  if (!room) {
    return res.status(404).json({ error: 'Sala no encontrada' });
  }

  try {
    const joinUrl = getJoinUrl(room.code, req.headers.host);
    const qrDataUrl = await generateQrDataUrl(joinUrl);
    res.json({ roomCode: room.code, joinUrl, qrDataUrl });
  } catch (err) {
    res.status(500).json({ error: 'Error generando código QR' });
  }
});

// Friendly redirect for mobile joining
app.get('/play', (req, res) => {
  const playerFile = path.join(PUBLIC_DIR, 'play.html');
  res.sendFile(playerFile, (err) => {
    if (err) {
      res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
    }
  });
});

// Friendly redirect for host screen
app.get('/host', (req, res) => {
  const hostFile = path.join(PUBLIC_DIR, 'host.html');
  res.sendFile(hostFile, (err) => {
    if (err) {
      res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
    }
  });
});

// Multi-Screen Arena Live Simulator (Host TV + All Virtual Player Phones)
app.get('/demo', (req, res) => {
  const demoFile = path.join(PUBLIC_DIR, 'demo.html');
  res.sendFile(demoFile, (err) => {
    if (err) {
      res.sendFile(path.join(PUBLIC_DIR, 'host.html'));
    }
  });
});

// ----------------------------------------------------
// Socket.IO Event Handlers
// ----------------------------------------------------

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // ==========================================
  // HOST EVENTS (Big Screen / Common TV)
  // ==========================================

  /**
   * Host requests room creation.
   */
  socket.on('host:create_room', async (data = {}, callback) => {
    try {
      const room = roomManager.createRoom(socket.id);
      socket.join(room.code);

      // Determine appropriate join URL (supports Vercel frontend + Docker backend)
      const reqHost = data.hostHeader || null;
      const frontendOrigin = data.frontendOrigin || null;
      const backendUrl = data.backendUrl || null;
      const joinUrl = getJoinUrl(room.code, reqHost, frontendOrigin, backendUrl);
      const qrCodeDataUrl = await generateQrDataUrl(joinUrl);

      const responsePayload = {
        success: true,
        roomCode: room.code,
        joinUrl,
        qrCodeDataUrl,
        state: roomManager.getPublicState(room.code)
      };

      console.log(`[Host] Created room ${room.code} with join URL: ${joinUrl}`);

      if (typeof callback === 'function') {
        callback(responsePayload);
      } else {
        socket.emit('host:room_created', responsePayload);
      }

      syncRoomState(room.code);
    } catch (err) {
      console.error('[Host] Error creating room:', err);
      const errPayload = { success: false, error: err.message };
      if (typeof callback === 'function') callback(errPayload);
      else socket.emit('host:error', errPayload);
    }
  });

  /**
   * Host requests to start the game.
   */
  socket.on('host:start_game', (data = {}, callback) => {
    const session = roomManager.getSession(socket.id);
    if (!session || !session.isHost) {
      const errPayload = { success: false, error: 'No autorizado como Host' };
      if (typeof callback === 'function') callback(errPayload);
      return;
    }

    const room = roomManager.getRoom(session.roomCode);
    if (!room) {
      const errPayload = { success: false, error: 'Sala no encontrada' };
      if (typeof callback === 'function') callback(errPayload);
      return;
    }

    let activePlayers = Array.from(room.players.values()).filter(p => p.connected);
    if (activePlayers.length < room.minPlayers) {
      console.log(`[Host] Room ${room.code} had ${activePlayers.length} players. Auto-filling with test bots for seamless start.`);
      const botPool = [
        { name: 'FedeZorro', avatar: { emoji: '🦊', color: '#ff6b4a' } },
        { name: 'PulpoFiestero', avatar: { emoji: '🐙', color: '#ec4899' } },
        { name: 'LlamaLoca', avatar: { emoji: '🦙', color: '#8b5cf6' } }
      ];
      for (const bot of botPool) {
        if (Array.from(room.players.values()).filter(p => p.connected).length >= 3) break;
        if (!Array.from(room.players.values()).some(p => p.name === bot.name)) {
          const botId = 'bot_' + Math.random().toString(36).substring(2, 9);
          roomManager.joinRoom(room.code, bot.name, botId, { customAvatar: bot.avatar });
        }
      }
    }

    // Initialize Selected Game Engine with configured round count
    const selectedGame = room.selectedGameId || 'duelo-ocurrencias';
    const customRounds = room.totalRounds || 3;

    if (selectedGame === 'impostor-silicio') {
      room.currentGame = new ImpostorSilicio(
        room,
        (roomCode) => { syncRoomState(roomCode); },
        (roomCode, timer) => { emitTimerTick(roomCode, timer); },
        customRounds
      );
      console.log(`[Host] Started El Impostor de Silicio in room ${room.code} (${customRounds} rondas)`);
    } else if (selectedGame === 'dilemas-extremos') {
      room.currentGame = new DilemasExtremos(
        room,
        (roomCode) => { syncRoomState(roomCode); },
        (roomCode, timer) => { emitTimerTick(roomCode, timer); },
        customRounds
      );
      console.log(`[Host] Started Dilemas Extremos in room ${room.code} (${customRounds} rondas)`);
    } else if (selectedGame === 'bomba-palabras') {
      room.currentGame = new BombaPalabras(
        room,
        (roomCode) => { syncRoomState(roomCode); },
        (roomCode, timer) => { emitTimerTick(roomCode, timer); },
        customRounds
      );
      console.log(`[Host] Started Bomba de Palabras in room ${room.code} (${customRounds} rondas)`);
    } else if (selectedGame === 'falso-sabio') {
      room.currentGame = new FalsoSabio(
        room,
        (roomCode) => { syncRoomState(roomCode); },
        (roomCode, timer) => { emitTimerTick(roomCode, timer); },
        customRounds
      );
      console.log(`[Host] Started Falso Sabio in room ${room.code} (${customRounds} rondas)`);
    } else if (selectedGame === 'trivia-caotica') {
      room.currentGame = new TriviaCaoticaGame(
        room,
        (roomCode) => { syncRoomState(roomCode); },
        (roomCode, timer) => { emitTimerTick(roomCode, timer); },
        customRounds
      );
      console.log(`[Host] Started Trivia Caótica in room ${room.code} (${customRounds} rondas)`);
    } else if (selectedGame === 'telepatia-fiesta') {
      room.currentGame = new TelepatiaFiestaGame(
        room,
        (roomCode) => { syncRoomState(roomCode); },
        (roomCode, timer) => { emitTimerTick(roomCode, timer); },
        customRounds
      );
      console.log(`[Host] Started Telepatía de Fiesta in room ${room.code} (${customRounds} rondas)`);
    } else {
      room.currentGame = new DueloOcurrencias(
        room, 
        (roomCode) => { syncRoomState(roomCode); },
        (roomCode, timer) => { emitTimerTick(roomCode, timer); },
        customRounds
      );
      console.log(`[Host] Started Duelo de Ocurrencias in room ${room.code} (${customRounds} rondas)`);
    }

    room.currentGame.start();

    const resPayload = { success: true };
    if (typeof callback === 'function') callback(resPayload);
    syncRoomState(room.code);
  });

  /**
   * Host skips the current timer or advances phase.
   */
  socket.on('host:skip_timer', () => {
    const session = roomManager.getSession(socket.id);
    if (!session || !session.isHost) return;

    const room = roomManager.getRoom(session.roomCode);
    if (room && room.currentGame && typeof room.currentGame.skipTimer === 'function') {
      console.log(`[Host] Skip timer triggered for room ${room.code}`);
      room.currentGame.skipTimer();
      syncRoomState(room.code);
    }
  });

  /**
   * Host restarts game back to Lobby.
   */
  socket.on('host:restart_game', () => {
    const session = roomManager.getSession(socket.id);
    if (!session || !session.isHost) return;

    const room = roomManager.getRoom(session.roomCode);
    if (room && room.currentGame && typeof room.currentGame.restartToLobby === 'function') {
      console.log(`[Host] Game restart to lobby triggered for room ${room.code}`);
      room.currentGame.restartToLobby();
      syncRoomState(room.code);
    }
  });

  /**
   * Host updates the AI Host personality mode.
   */
  socket.on('host:set_personality', (data = {}, callback) => {
    const session = roomManager.getSession(socket.id);
    if (!session || !session.isHost) return;

    const personalityId = data.personality || 'FIESTA_PICANTE';
    const updated = roomManager.setHostPersonality(session.roomCode, personalityId);
    if (updated) {
      console.log(`[Host] AI Personality for room ${session.roomCode} changed to: ${personalityId}`);
      syncRoomState(session.roomCode);
      if (typeof callback === 'function') callback({ success: true, personality: personalityId });
    }
  });

  /**
   * Host chooses party game from catalog.
   */
  socket.on('host:set_game', (data = {}, callback) => {
    const session = roomManager.getSession(socket.id);
    if (!session || !session.isHost) return;

    const gameId = data.gameId || 'duelo-ocurrencias';
    const updated = roomManager.setSelectedGame(session.roomCode, gameId);
    if (updated) {
      console.log(`[Host] Selected game for room ${session.roomCode} changed to: ${gameId}`);
      syncRoomState(session.roomCode);
      if (typeof callback === 'function') callback({ success: true, gameId });
    }
  });

  /**
   * Host selects audience / age range.
   */
  socket.on('host:set_audience', (data = {}, callback) => {
    const session = roomManager.getSession(socket.id);
    if (!session || !session.isHost) return;

    const audience = data.audience || 'amigos';
    const updated = roomManager.setAudience(session.roomCode, audience);
    if (updated) {
      console.log(`[Host] Audience / Age filter for room ${session.roomCode} set to: ${audience}`);
      syncRoomState(session.roomCode);
      if (typeof callback === 'function') callback({ success: true, audience });
    }
  });

  /**
   * Host selects total rounds (2, 3 or 4).
   */
  socket.on('host:set_rounds', (data = {}, callback) => {
    const session = roomManager.getSession(socket.id);
    if (!session || !session.isHost) return;

    const rounds = parseInt(data.rounds, 10) || 3;
    const updated = roomManager.setTotalRounds(session.roomCode, rounds);
    if (updated) {
      console.log(`[Host] Total rounds for room ${session.roomCode} set to: ${rounds}`);
      syncRoomState(session.roomCode);
      if (typeof callback === 'function') callback({ success: true, rounds });
    }
  });

  // ==========================================
  // PLAYER EVENTS (Mobile Controllers)
  // ==========================================

  /**
   * Player joins or resumes session in a room (Identified by Device Token & IP).
   */
  socket.on('player:join', ({ roomCode, playerName, deviceToken, avatar }, callback) => {
    const rawIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address || socket.conn?.remoteAddress || '';
    const clientIp = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : 'local';

    const result = roomManager.joinRoom(roomCode, playerName, socket.id, {
      clientIp,
      deviceToken,
      customAvatar: avatar
    });

    if (!result.success) {
      const errPayload = { success: false, error: result.error };
      if (typeof callback === 'function') callback(errPayload);
      else socket.emit('player:join_error', errPayload);
      return;
    }

    const { room, player, reconnected } = result;
    socket.join(room.code);

    const successPayload = {
      success: true,
      roomCode: room.code,
      player,
      reconnected,
      privateState: roomManager.getPrivateState(room.code, socket.id)
    };

    if (typeof callback === 'function') callback(successPayload);
    else socket.emit('player:joined_success', successPayload);

    // Notify room of updated state
    syncRoomState(room.code);
  });

  /**
   * Player submits prompt answers during ANSWERING phase.
   */
  socket.on('player:submit_answers', ({ answers }, callback) => {
    const session = roomManager.getSession(socket.id);
    if (!session || session.isHost) {
      const err = { success: false, error: 'Sesión de jugador no válida' };
      if (typeof callback === 'function') callback(err);
      return;
    }

    const room = roomManager.getRoom(session.roomCode);
    if (!room || !room.currentGame || typeof room.currentGame.submitAnswers !== 'function') {
      const err = { success: false, error: 'Juego no activo' };
      if (typeof callback === 'function') callback(err);
      return;
    }

    const result = room.currentGame.submitAnswers(socket.id, answers);
    if (typeof callback === 'function') callback(result);
    syncRoomState(room.code);
  });

  /**
   * Player submits vote during VOTING phase.
   */
  socket.on('player:vote', ({ duelId, choice }, callback) => {
    const session = roomManager.getSession(socket.id);
    if (!session || session.isHost) {
      const err = { success: false, error: 'Sesión de jugador no válida' };
      if (typeof callback === 'function') callback(err);
      return;
    }

    const room = roomManager.getRoom(session.roomCode);
    if (!room || !room.currentGame || typeof room.currentGame.submitVote !== 'function') {
      const err = { success: false, error: 'Juego no activo' };
      if (typeof callback === 'function') callback(err);
      return;
    }

    const result = room.currentGame.submitVote(socket.id, duelId, choice);
    if (typeof callback === 'function') callback(result);
    syncRoomState(room.code);
  });

  /**
   * Player submits clue in El Impostor de Silicio.
   */
  socket.on('player:submit_clue', ({ clue }, callback) => {
    const session = roomManager.getSession(socket.id);
    if (!session || session.isHost) return;

    const room = roomManager.getRoom(session.roomCode);
    if (!room || !room.currentGame || typeof room.currentGame.handlePlayerClue !== 'function') return;

    room.currentGame.handlePlayerClue(socket.id, clue);
    if (typeof callback === 'function') callback({ success: true });
    syncRoomState(room.code);
  });

  /**
   * Player submits suspect vote in El Impostor de Silicio.
   */
  socket.on('player:submit_impostor_vote', ({ suspectId }, callback) => {
    const session = roomManager.getSession(socket.id);
    if (!session || session.isHost) return;

    const room = roomManager.getRoom(session.roomCode);
    if (!room || !room.currentGame || typeof room.currentGame.handlePlayerVote !== 'function') return;

    room.currentGame.handlePlayerVote(socket.id, suspectId);
    if (typeof callback === 'function') callback({ success: true });
    syncRoomState(room.code);
  });

  /**
   * Impostor guesses the secret word in escape phase.
   */
  socket.on('player:submit_impostor_guess', ({ guess }, callback) => {
    const session = roomManager.getSession(socket.id);
    if (!session || session.isHost) return;

    const room = roomManager.getRoom(session.roomCode);
    if (!room || !room.currentGame || typeof room.currentGame.handleImpostorGuess !== 'function') return;

    room.currentGame.handleImpostorGuess(socket.id, guess);
    if (typeof callback === 'function') callback({ success: true });
    syncRoomState(room.code);
  });

  /**
   * Player chooses and predicts in Dilemas Extremos.
   */
  socket.on('player:choose_dilemma', ({ choice, prediction }, callback) => {
    const session = roomManager.getSession(socket.id);
    if (!session || session.isHost) return;

    const room = roomManager.getRoom(session.roomCode);
    if (!room || !room.currentGame || typeof room.currentGame.handlePlayerChoice !== 'function') return;

    room.currentGame.handlePlayerChoice(socket.id, choice, prediction);
    if (typeof callback === 'function') callback({ success: true });
    syncRoomState(room.code);
  });

  /**
   * Player submits word in Bomba de Palabras.
   */
  socket.on('player:submit_bomba_word', ({ word }, callback) => {
    const session = roomManager.getSession(socket.id);
    if (!session || session.isHost) return;

    const room = roomManager.getRoom(session.roomCode);
    if (!room || !room.currentGame || typeof room.currentGame.submitWord !== 'function') return;

    const result = room.currentGame.submitWord(socket.id, word);
    if (typeof callback === 'function') callback(result);
    syncRoomState(room.code);
  });

  /**
   * Player submits lie in Falso Sabio.
   */
  socket.on('player:submit_falso_lie', ({ lie }, callback) => {
    const session = roomManager.getSession(socket.id);
    if (!session || session.isHost) return;

    const room = roomManager.getRoom(session.roomCode);
    if (!room || !room.currentGame || typeof room.currentGame.submitLie !== 'function') return;

    const result = room.currentGame.submitLie(socket.id, lie);
    if (typeof callback === 'function') callback(result);
    syncRoomState(room.code);
  });

  /**
   * Player submits vote in Falso Sabio.
   */
  socket.on('player:submit_falso_vote', ({ choice }, callback) => {
    const session = roomManager.getSession(socket.id);
    if (!session || session.isHost) return;

    const room = roomManager.getRoom(session.roomCode);
    if (!room || !room.currentGame || typeof room.currentGame.submitVote !== 'function') return;

    const result = room.currentGame.submitVote(socket.id, choice);
    if (typeof callback === 'function') callback(result);
    syncRoomState(room.code);
  });

  /**
   * Player submits answer in Trivia Caótica.
   */
  socket.on('player:submit_trivia_answer', ({ choiceIndex }, callback) => {
    const session = roomManager.getSession(socket.id);
    if (!session || session.isHost) return;

    const room = roomManager.getRoom(session.roomCode);
    if (!room || !room.currentGame || typeof room.currentGame.submitAnswer !== 'function') return;

    const result = room.currentGame.submitAnswer(socket.id, choiceIndex);
    if (typeof callback === 'function') callback(result);
    syncRoomState(room.code);
  });

  /**
   * Player submits value (0-100) in Telepatía de Fiesta.
   */
  socket.on('player:submit_telepatia_value', ({ value }, callback) => {
    const session = roomManager.getSession(socket.id);
    if (!session || session.isHost) return;

    const room = roomManager.getRoom(session.roomCode);
    if (!room || !room.currentGame || typeof room.currentGame.submitValue !== 'function') return;

    const result = room.currentGame.submitValue(socket.id, value);
    if (typeof callback === 'function') callback(result);
    syncRoomState(room.code);
  });

  /**
   * Player sends a custom character sticker/emote to pop up on the Host screen.
   */
  socket.on('player:react', ({ emoji, emoteId, emoteSvg }) => {
    const session = roomManager.getSession(socket.id);
    if (!session || session.isHost) return;

    const room = roomManager.getRoom(session.roomCode);
    if (!room || !room.hostSocketId) return;

    const player = room.players.get(socket.id);
    if (player) {
      // Robust mapping: resolve whether sent as emoteId or standard emoji/id string
      let resolvedId = emoteId;
      if (!resolvedId && emoji) {
        const raw = String(emoji).toLowerCase();
        if (raw.includes('laugh') || raw.includes('😂') || raw.includes('risas') || raw.includes('jaja')) resolvedId = 'laugh';
        else if (raw.includes('shock') || raw.includes('😱') || raw.includes('sorpresa') || raw.includes('grito')) resolvedId = 'shock';
        else if (raw.includes('fire') || raw.includes('🔥') || raw.includes('fuego') || raw.includes('hype')) resolvedId = 'fire';
        else if (raw.includes('sus') || raw.includes('👀') || raw.includes('🧐') || raw.includes('ojo') || raw.includes('sospecha')) resolvedId = 'sus';
        else if (raw.includes('dead') || raw.includes('💀') || raw.includes('rip') || raw.includes('muerto') || raw.includes('falleci')) resolvedId = 'dead';
        else resolvedId = 'happy';
      }
      resolvedId = resolvedId || 'happy';

      io.to(room.hostSocketId).emit('host:player_reaction', {
        playerName: player.name,
        avatar: player.avatar,
        emoteId: resolvedId,
        emoteSvg: typeof emoteSvg === 'string' && emoteSvg.length < 20000 ? emoteSvg : undefined,
        emoji: emoji || resolvedId
      });
    }
  });

  // ==========================================
  // DISCONNECT HANDLER
  // ==========================================

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
    const result = roomManager.handleDisconnect(socket.id);
    if (result && result.roomCode) {
      syncRoomState(result.roomCode);
    }
  });
});

// Start HTTP and WebSocket Server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
======================================================
  🎉 ANFITRIÓN DE FIESTAS - PARTY GAME SERVER 🎉
======================================================
  - Servidor local:      http://localhost:${PORT}
  - Red Local (Wi-Fi):   http://${LOCAL_IP}:${PORT}
  - Inicio / Landing:    http://${LOCAL_IP}:${PORT}
  - Pantalla Host:       http://${LOCAL_IP}:${PORT}/host
  - Mando Jugador:       http://${LOCAL_IP}:${PORT}/play
======================================================
`);
});

export { app, server, io, roomManager, syncRoomState };
