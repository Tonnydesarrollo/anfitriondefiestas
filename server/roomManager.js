/**
 * Room Manager module for "Anfitrión de Fiestas"
 * Handles room lifecycle, 4-character code generation, player sessions,
 * avatar assignment, and state synchronization (public for Host, private for Players).
 */

import { calculateDynamicRounds } from './rules/gameRulesConfig.js';

// Readable characters omitting ambiguous symbols (no '0', 'O', '1', 'I')
const CODE_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 4;

// Avatar pool with fun emojis, colors and descriptive nicknames
const AVATAR_POOL = [
  { emoji: '🦊', color: '#FF6B6B', label: 'Zorro Astuto' },
  { emoji: '🐙', color: '#4ECDC4', label: 'Pulpo Fiestero' },
  { emoji: '🦙', color: '#FFD166', label: 'Llama Dramática' },
  { emoji: '🦖', color: '#06D6A0', label: 'Dino Bailarín' },
  { emoji: '🦄', color: '#9B5DE5', label: 'Unicornio Cósmico' },
  { emoji: '🐼', color: '#457B9D', label: 'Panda Zen' },
  { emoji: '🦁', color: '#F77F00', label: 'León Rumbero' },
  { emoji: '🐸', color: '#2EC4B6', label: 'Rana Sabia' },
  { emoji: '🦉', color: '#E76F51', label: 'Búho Nocturno' },
  { emoji: '🦈', color: '#118AB2', label: 'Tiburón Bromista' },
  { emoji: '🐨', color: '#8338EC', label: 'Koala Chill' },
  { emoji: '🐵', color: '#FB5607', label: 'Mono Travieso' },
  { emoji: '🐧', color: '#3A86FF', label: 'Pingüino Elegante' },
  { emoji: '🐯', color: '#FF9F1C', label: 'Tigre Veloz' }
];

export class RoomManager {
  constructor() {
    /** @type {Map<string, Object>} Map<roomCode, RoomData> */
    this.rooms = new Map();
    /** @type {Map<string, { roomCode: string, isHost: boolean }>} Map<socketId, sessionInfo> */
    this.socketMap = new Map();
  }

  /**
   * Generates a unique 4-character room code.
   * @returns {string} 4-character alphanumeric uppercase code
   */
  generateCode() {
    let code = '';
    let attempts = 0;
    const maxAttempts = 1000;

    do {
      code = '';
      for (let i = 0; i < CODE_LENGTH; i++) {
        const randomIndex = Math.floor(Math.random() * CODE_CHARSET.length);
        code += CODE_CHARSET[randomIndex];
      }
      attempts++;
      if (attempts > maxAttempts) {
        throw new Error('Unable to generate unique room code (namespace full)');
      }
    } while (this.rooms.has(code));

    return code;
  }

  /**
   * Selects an avatar for a new player, preferring ones not yet chosen in the room.
   * @param {Object} room 
   * @returns {{ emoji: string, color: string, label: string }}
   */
  assignAvatar(room) {
    const usedEmojis = new Set(
      Array.from(room.players.values()).map(p => p.avatar?.emoji)
    );
    const available = AVATAR_POOL.filter(a => !usedEmojis.has(a.emoji));

    if (available.length > 0) {
      const idx = Math.floor(Math.random() * available.length);
      return available[idx];
    }
    // Fallback: pick any from the pool
    const idx = Math.floor(Math.random() * AVATAR_POOL.length);
    return AVATAR_POOL[idx];
  }

  /**
   * Creates a new empty room and assigns the host socket.
   * @param {string} hostSocketId 
   * @returns {Object} Newly created room object
   */
  createRoom(hostSocketId) {
    if (!hostSocketId) {
      throw new Error('hostSocketId is required to create a room');
    }

    const code = this.generateCode();
    const room = {
      code,
      hostSocketId,
      hostConnected: true,
      createdAt: Date.now(),
      status: 'LOBBY', // 'LOBBY' | 'IN_GAME' | 'FINISHED'
      currentGame: null,
      selectedGameId: 'duelo-ocurrencias',
      totalRounds: 3,
      hostPersonality: 'FIESTA_PICANTE',
      audience: 'familia', // 'familia' | 'cerebritos' | 'parejas' | 'amigos'
      players: new Map(), // socketId -> Player
      minPlayers: 2,
      maxPlayers: 10
    };

    this.rooms.set(code, room);
    this.socketMap.set(hostSocketId, { roomCode: code, isHost: true });

    console.log(`[RoomManager] Room created: ${code} (Host: ${hostSocketId})`);
    return room;
  }

  /**
   * Updates selected party game.
   * @param {string} code 
   * @param {string} gameId 
   * @returns {boolean}
   */
  setSelectedGame(code, gameId) {
    const room = this.getRoom(code);
    if (!room) return false;
    room.selectedGameId = gameId;
    const activeCount = Array.from(room.players.values()).filter(p => p.connected).length || 3;
    const pacing = calculateDynamicRounds(gameId, activeCount);
    room.totalRounds = pacing.rounds;
    return true;
  }

  /**
   * Updates total rounds for a room (2, 3 or 4).
   * @param {string} code 
   * @param {number} rounds 
   * @returns {boolean}
   */
  setTotalRounds(code, rounds) {
    const room = this.getRoom(code);
    if (!room) return false;
    const r = parseInt(rounds, 10);
    room.totalRounds = [2, 3, 4].includes(r) ? r : 3;
    return true;
  }

  /**
   * Updates audience / age rating.
   * @param {string} code 
   * @param {string} audience 
   * @returns {boolean}
   */
  setAudience(code, audience) {
    const room = this.getRoom(code);
    if (!room) return false;
    room.audience = audience;
    return true;
  }

  /**
   * Updates host personality for a room.
   * @param {string} code 
   * @param {string} personalityId
   * @returns {boolean}
   */
  setHostPersonality(code, personalityId) {
    const room = this.getRoom(code);
    if (!room) return false;
    room.hostPersonality = personalityId;
    return true;
  }

  /**
   * Finds a room by its 4-character code (case-insensitive).
   * @param {string} code 
   * @returns {Object|null}
   */
  getRoom(code) {
    if (!code) return null;
    const normalized = String(code).trim().toUpperCase();
    return this.rooms.get(normalized) || null;
  }

  /**
   * Retrieves session info by socketId.
   * @param {string} socketId 
   * @returns {{ roomCode: string, isHost: boolean }|null}
   */
  getSession(socketId) {
    return this.socketMap.get(socketId) || null;
  }

  /**
   * Adds a player to a room.
   * Validates code existence, name uniqueness, and lobby status.
   * @param {string} code 
   * @param {string} playerName 
   * @param {string} socketId 
   * @returns {{ success: boolean, error?: string, room?: Object, player?: Object }}
   */
  joinRoom(code, playerName, socketId, options = {}) {
    const room = this.getRoom(code);
    if (!room) {
      return { success: false, error: 'La sala especificada no existe.' };
    }

    const cleanName = (playerName || '').trim();
    const clientIp = options.clientIp || null;
    const deviceToken = options.deviceToken || null;
    const customAvatar = options.customAvatar || null;

    // 1. Check for reconnection by deviceToken AND name (protects against multi-tab sharing token)
    let existingPlayerEntry = null;
    if (deviceToken && cleanName) {
      existingPlayerEntry = Array.from(room.players.entries()).find(
        ([, p]) => p.deviceToken === deviceToken && p.name.toLowerCase() === cleanName.toLowerCase()
      );
    }

    // 2. Fallback: match by IP address only if player disconnected AND name matches
    if (!existingPlayerEntry && clientIp && cleanName) {
      existingPlayerEntry = Array.from(room.players.entries()).find(
        ([, p]) => !p.connected && p.clientIp === clientIp && p.name.toLowerCase() === cleanName.toLowerCase()
      );
    }

    // 3. Fallback: match by player name if previously disconnected
    if (!existingPlayerEntry && cleanName) {
      existingPlayerEntry = Array.from(room.players.entries()).find(
        ([, p]) => !p.connected && p.name.toLowerCase() === cleanName.toLowerCase()
      );
    }

    if (existingPlayerEntry) {
      const [oldSocketId, existingPlayer] = existingPlayerEntry;

      // Reconnect player smoothly
      if (!existingPlayer.connected || oldSocketId !== socketId) {
        console.log(`[RoomManager] Player '${existingPlayer.name}' reconnected via deviceToken/IP to socket ${socketId}`);
        room.players.delete(oldSocketId);
        this.socketMap.delete(oldSocketId);

        existingPlayer.id = socketId;
        existingPlayer.connected = true;
        if (clientIp) existingPlayer.clientIp = clientIp;
        if (deviceToken) existingPlayer.deviceToken = deviceToken;
        if (customAvatar) existingPlayer.avatar = customAvatar;
        if (cleanName && cleanName.length >= 2) existingPlayer.name = cleanName;

        room.players.set(socketId, existingPlayer);
        this.socketMap.set(socketId, { roomCode: room.code, isHost: false });

        if (room.currentGame && typeof room.currentGame.handlePlayerReconnect === 'function') {
          room.currentGame.handlePlayerReconnect(oldSocketId, socketId);
        }

        return { success: true, room, player: existingPlayer, reconnected: true };
      }

      return { success: false, error: 'Ya existe un jugador activo con ese nombre en la sala.' };
    }

    if (!cleanName || cleanName.length < 2 || cleanName.length > 16) {
      return { success: false, error: 'El nombre debe tener entre 2 y 16 caracteres.' };
    }

    // Check if room is full
    const activePlayers = Array.from(room.players.values()).filter(p => p.connected);
    if (activePlayers.length >= room.maxPlayers) {
      return { success: false, error: `La sala está llena (máximo ${room.maxPlayers} jugadores).` };
    }

    // New players cannot join while game is actively running
    if (room.status !== 'LOBBY') {
      return { success: false, error: 'El juego ya ha comenzado en esta sala.' };
    }

    const avatar = customAvatar || this.assignAvatar(room);
    const player = {
      id: socketId,
      name: cleanName,
      avatar,
      score: 0,
      connected: true,
      clientIp,
      deviceToken,
      joinedAt: Date.now()
    };

    room.players.set(socketId, player);
    this.socketMap.set(socketId, { roomCode: room.code, isHost: false });

    console.log(`[RoomManager] Player '${cleanName}' joined room ${room.code} (${player.avatar?.emoji || '👤'}) [IP: ${clientIp || 'local'}]`);
    return { success: true, room, player, reconnected: false };
  }

  /**
   * Handles player or host disconnect.
   * @param {string} socketId 
   * @returns {{ roomCode: string, isHost: boolean, player?: Object, room?: Object }|null}
   */
  handleDisconnect(socketId) {
    const session = this.socketMap.get(socketId);
    if (!session) return null;

    const { roomCode, isHost } = session;
    const room = this.rooms.get(roomCode);
    if (!room) {
      this.socketMap.delete(socketId);
      return null;
    }

    if (isHost) {
      room.hostConnected = false;
      console.log(`[RoomManager] Host disconnected from room ${roomCode}`);
      // If room is still in lobby and has no players, clean it up immediately
      if (room.status === 'LOBBY' && room.players.size === 0) {
        this.rooms.delete(roomCode);
        this.socketMap.delete(socketId);
        console.log(`[RoomManager] Empty room ${roomCode} destroyed.`);
      }
      return { roomCode, isHost: true, room };
    } else {
      const player = room.players.get(socketId);
      if (player) {
        player.connected = false;
        console.log(`[RoomManager] Player '${player.name}' disconnected from room ${roomCode}`);

        // In LOBBY, remove disconnected players completely to free names and avatars
        if (room.status === 'LOBBY') {
          room.players.delete(socketId);
          this.socketMap.delete(socketId);
        }

        if (room.currentGame && typeof room.currentGame.handlePlayerDisconnect === 'function') {
          room.currentGame.handlePlayerDisconnect(socketId);
        }

        return { roomCode, isHost: false, player, room };
      }
    }

    return null;
  }

  /**
   * Explicitly removes a player from a room (e.g. kicked or left voluntarily).
   * @param {string} socketId 
   * @returns {boolean}
   */
  removePlayer(socketId) {
    const session = this.socketMap.get(socketId);
    if (!session || session.isHost) return false;

    const room = this.rooms.get(session.roomCode);
    if (room) {
      room.players.delete(socketId);
      this.socketMap.delete(socketId);
      if (room.currentGame && typeof room.currentGame.handlePlayerDisconnect === 'function') {
        room.currentGame.handlePlayerDisconnect(socketId);
      }
      return true;
    }
    return false;
  }

  /**
   * Destroys an existing room and cleans up all mapped sockets.
   * @param {string} code 
   */
  destroyRoom(code) {
    const room = this.getRoom(code);
    if (!room) return;

    if (room.hostSocketId) {
      this.socketMap.delete(room.hostSocketId);
    }
    for (const socketId of room.players.keys()) {
      this.socketMap.delete(socketId);
    }

    if (room.currentGame && typeof room.currentGame.destroy === 'function') {
      room.currentGame.destroy();
    }

    this.rooms.delete(room.code);
    console.log(`[RoomManager] Room ${room.code} destroyed.`);
  }

  /**
   * Returns public state intended for the common TV/Host screen.
   * Does NOT reveal private unsubmitted player answers or unvoted choices.
   * @param {string} code 
   * @returns {Object|null}
   */
  getPublicState(code) {
    const room = this.getRoom(code);
    if (!room) return null;

    const playersList = Array.from(room.players.values()).map(p => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      score: p.score,
      connected: p.connected
    }));

    let gameState = null;
    if (room.currentGame && typeof room.currentGame.getPublicState === 'function') {
      gameState = room.currentGame.getPublicState();
    }

    const activeCount = playersList.filter(p => p.connected).length || 3;
    const dynamicPacing = calculateDynamicRounds(room.selectedGameId || 'duelo-ocurrencias', activeCount);
    if (room.status === 'LOBBY') {
      room.totalRounds = dynamicPacing.rounds;
    }

    return {
      roomCode: room.code,
      status: room.status,
      hostConnected: room.hostConnected,
      selectedGameId: room.selectedGameId || 'duelo-ocurrencias',
      totalRounds: room.totalRounds || dynamicPacing.rounds,
      dynamicPacing,
      audience: room.audience || 'familia',
      hostPersonality: room.hostPersonality || 'FIESTA_PICANTE',
      playersCount: playersList.length,
      players: playersList,
      minPlayers: room.minPlayers,
      maxPlayers: room.maxPlayers,
      canStart: playersList.length >= room.minPlayers && room.status === 'LOBBY',
      game: gameState
    };
  }

  /**
   * Returns private state tailored for a specific mobile Player controller.
   * Contains only what that specific player is permitted to see.
   * @param {string} code 
   * @param {string} socketId 
   * @returns {Object|null}
   */
  getPrivateState(code, socketId) {
    const room = this.getRoom(code);
    if (!room) return null;

    const player = room.players.get(socketId);
    if (!player) return null;

    let gamePrivateState = null;
    if (room.currentGame && typeof room.currentGame.getPrivateState === 'function') {
      gamePrivateState = room.currentGame.getPrivateState(socketId);
    }

    return {
      roomCode: room.code,
      status: room.status,
      me: {
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        score: player.score,
        connected: player.connected
      },
      game: gamePrivateState
    };
  }
}

export const roomManager = new RoomManager();
