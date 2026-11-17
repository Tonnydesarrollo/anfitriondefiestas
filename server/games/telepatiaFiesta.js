/**
 * Game Module: Telepatía de Fiesta (Wavelength / Hive Mind / Sintonía style)
 * Specially designed for 2 to 10 players (Outstanding for 1v1 / Couples & Group Hive Mind).
 * 
 * Features:
 * - Subjective spectrum scales (1 to 100) or open matching
 * - 2-Player "Test de Conexión Mental": Score based on closeness of the two answers!
 * - Multi-Player "Mente Colmena": Score based on consensus and matching group median
 * - AI Host delivery and funny psychological roasting by Ollama
 */

import { calculateDynamicRounds, getTutorial } from '../rules/gameRulesConfig.js';

export const TELEPATIA_DATABASE = [
  // --- FAMILIA ---
  {
    topic: '¿Qué tan aceptable es comerse la última porción de pizza del refrigerador sin avisarle a nadie?',
    leftLabel: 'Crimen Imperdonable (0%)',
    rightLabel: 'Supervivencia Pura (100%)',
    audiences: ['familia', 'amigos', 'cerebritos']
  },
  {
    topic: '¿Qué tan vergonzoso es saludar efusivamente a alguien en la calle pensando que era tu amigo y era un completo extraño?',
    leftLabel: 'Trágame Tierra (0%)',
    rightLabel: 'Digno y Sonriente (100%)',
    audiences: ['familia', 'amigos', 'parejas']
  },
  {
    topic: '¿Qué tan sabrosa es la pizza con piña en la escala universal del buen gusto?',
    leftLabel: 'Herejía Total (0%)',
    rightLabel: 'Manjar de Dioses (100%)',
    audiences: ['familia', 'cerebritos', 'amigos']
  },
  {
    topic: '¿Qué tan tacaño es pedir que te hagan transferencia por 50 centavos que prestaste?',
    leftLabel: 'Es mi dinero legal (0%)',
    rightLabel: 'Tacañería Extrema (100%)',
    audiences: ['familia', 'amigos']
  },

  // --- PAREJAS ---
  {
    topic: '¿Qué tan grave es cancelar una cita planificada solo porque "hace mucho frío y me dio pereza salir"?',
    leftLabel: 'Causa de Ruptura (0%)',
    rightLabel: 'Totalmente Válido (100%)',
    audiences: ['parejas', 'amigos']
  },
  {
    topic: '¿Qué tan importante es saber cocinar delicioso para ser la pareja perfecta?',
    leftLabel: 'Da igual, pedimos delivery (0%)',
    rightLabel: '100% Indispensable (100%)',
    audiences: ['parejas', 'familia']
  },
  {
    topic: '¿Qué tan sospechoso es que tu pareja ponga el celular boca abajo en la mesa durante la cena?',
    leftLabel: 'Cero sospecha, paz mental (0%)',
    rightLabel: 'Alerta Roja Inmediata (100%)',
    audiences: ['parejas', 'amigos']
  },

  // --- AMIGOS / PICANTE (+18) ---
  {
    topic: '¿Qué tan peligroso es enviar un mensaje de texto arriesgado a tu ex a las 3:00 AM un sábado?',
    leftLabel: 'Accidente seguro (0%)',
    rightLabel: 'El que no arriesga no gana (100%)',
    audiences: ['amigos']
  },
  {
    topic: '¿Qué tan aceptable es inventar una emergencia familiar falsa para escapar de una fiesta aburrida?',
    leftLabel: 'Karma Instantáneo (0%)',
    rightLabel: 'Jugada Maestra (100%)',
    audiences: ['amigos', 'cerebritos']
  },
  {
    topic: '¿Qué tan tóxico es stalkear a alguien desde una cuenta falsa de Instagram?',
    leftLabel: 'Investigación del FBI necesaria (0%)',
    rightLabel: 'Psicópata de closet (100%)',
    audiences: ['amigos', 'parejas']
  }
];

export class TelepatiaFiestaGame {
  constructor(room, onStateChange = null, onTimerTick = null, customRounds = null) {
    this.id = 'telepatia-fiesta';
    this.title = 'Telepatía de Fiesta';
    this.room = room;
    this.onStateChange = onStateChange;
    this.onTimerTick = onTimerTick;

    const count = Math.max(2, room.players.size || 2);
    const dynamicPacing = calculateDynamicRounds('telepatia-fiesta', count);
    this.totalRounds = customRounds || dynamicPacing.rounds;

    this.currentRound = 1;
    this.phase = 'HOW_TO_PLAY'; // HOW_TO_PLAY | INTRO | SPECTRUM | REVEAL | RESULTS | PODIUM
    this.timer = 0;
    this.timerInterval = null;

    this.usedIndices = new Set();
    this.currentPrompt = null;
    this.playerValues = new Map(); // socketId -> number (0-100)
    this.aiCommentary = null;
    this.duelResult = null;
    this.groupResult = null;

    console.log(`[TelepatiaFiesta] Initialized for room ${room.code} (${this.totalRounds} rondas, ${count} jugadores)`);
  }

  start() {
    this.room.status = 'IN_GAME';
    this.currentRound = 1;
    this.usedIndices.clear();

    for (const p of this.room.players.values()) {
      p.score = 0;
      p.lastRoundGain = 0;
    }

    this.startHowToPlayPhase();
  }

  startHowToPlayPhase() {
    this.clearCountdown();
    this.phase = 'HOW_TO_PLAY';
    const tut = getTutorial('telepatia-fiesta');
    this.timer = tut ? tut.durationSeconds : 12;
    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      this.startRound();
    });
  }

  startRound() {
    this.clearCountdown();
    this.playerValues.clear();
    this.aiCommentary = null;
    this.duelResult = null;
    this.groupResult = null;

    for (const p of this.room.players.values()) {
      p.lastRoundGain = 0;
    }

    const audience = this.room.audience || 'familia';
    const pool = TELEPATIA_DATABASE.filter((q, idx) => {
      if (this.usedIndices.has(idx)) return false;
      return q.audiences.includes(audience) || q.audiences.includes('familia');
    });

    const candidatePool = pool.length > 0 ? pool : TELEPATIA_DATABASE;
    const randomItem = candidatePool[Math.floor(Math.random() * candidatePool.length)];
    const originalIdx = TELEPATIA_DATABASE.indexOf(randomItem);
    if (originalIdx >= 0) this.usedIndices.add(originalIdx);

    this.currentPrompt = randomItem;

    this.phase = 'INTRO';
    this.timer = 5;
    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      this.startSpectrumPhase();
    });
  }

  startSpectrumPhase() {
    this.clearCountdown();
    this.phase = 'SPECTRUM';
    this.timer = 25; // 25s for slider calibration on phone
    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      this.finishSpectrumPhase();
    });
  }

  submitValue(socketId, val) {
    if (this.phase !== 'SPECTRUM') return { success: false, error: 'No es momento de calibrar sintonía' };
    if (this.playerValues.has(socketId)) return { success: false, error: 'Ya enviaste tu posición' };

    let num = parseInt(val, 10);
    if (isNaN(num)) num = 50;
    num = Math.max(0, Math.min(100, num));

    this.playerValues.set(socketId, num);
    this.notifyStateChange();

    const connectedCount = Array.from(this.room.players.values()).filter(p => p.connected).length;
    if (this.playerValues.size >= connectedCount) {
      setTimeout(() => {
        if (this.phase === 'SPECTRUM') this.finishSpectrumPhase();
      }, 500);
    }

    return { success: true };
  }

  finishSpectrumPhase() {
    this.clearCountdown();
    this.phase = 'REVEAL';
    this.timer = 12;

    const roundMultiplier = (this.currentRound === this.totalRounds) ? 2 : 1;
    const playersList = Array.from(this.room.players.values());

    // Fill missing submissions with default 50
    for (const p of playersList) {
      if (!this.playerValues.has(p.id)) {
        this.playerValues.set(p.id, 50);
      }
    }

    if (playersList.length === 2) {
      // 2-PLAYER ASYMMETRIC TELEPATHY SCORING (Mind Reader vs Sender)
      // Alternates roles each round so players compete dynamically and don't tie automatically!
      const senderIndex = (this.currentRound - 1) % 2;
      const readerIndex = 1 - senderIndex;
      const sender = playersList[senderIndex];
      const reader = playersList[readerIndex];

      const vSender = this.playerValues.get(sender.id) ?? 50;
      const vReader = this.playerValues.get(reader.id) ?? 50;
      const diff = Math.abs(vSender - vReader);

      let readerPts = 0;
      let senderPts = 0;
      let badge = '';

      if (diff <= 5) {
        readerPts = Math.round(1000 * roundMultiplier);
        senderPts = Math.round(500 * roundMultiplier);
        badge = '¡TELEPATÍA CÓSMICA PERFECTA!';
        this.aiCommentary = `¡INCREÍBLE! ${reader.name} (${vReader}%) leyó la mente de ${sender.name} (${vSender}%) con precisión milimétrica (¡diferencia de solo ${diff}%)!`;
      } else if (diff <= 15) {
        readerPts = Math.round(750 * roundMultiplier);
        senderPts = Math.round(350 * roundMultiplier);
        badge = '¡GRAN SINTONÍA MENTAL!';
        this.aiCommentary = `¡Gran puntería psíquica! ${reader.name} (${vReader}%) sintonizó muy bien el pensamiento de ${sender.name} (${vSender}%).`;
      } else if (diff <= 30) {
        readerPts = Math.round(400 * roundMultiplier);
        senderPts = Math.round(200 * roundMultiplier);
        badge = 'Sintonía Moderada';
        this.aiCommentary = `Lectura aceptable (${vReader}% vs ${vSender}%). Hubo interferencia estática, pero se acercaron.`;
      } else {
        readerPts = Math.round(100 * roundMultiplier);
        senderPts = Math.round(50 * roundMultiplier);
        badge = 'Mundos Paralelos';
        this.aiCommentary = `¡Cerebros en dimensiones opuestas! ${sender.name} pensó en ${vSender}% mientras que ${reader.name} adivinó ${vReader}% (¡${diff}% de distancia!).`;
      }

      reader.score = (reader.score || 0) + readerPts;
      reader.lastRoundGain = readerPts;
      sender.score = (sender.score || 0) + senderPts;
      sender.lastRoundGain = senderPts;

      this.duelResult = {
        diff,
        affinityPercent: Math.max(0, 100 - diff),
        readerName: reader.name,
        senderName: sender.name,
        readerPoints: readerPts,
        senderPoints: senderPts,
        points: readerPts,
        badge
      };
    } else {
      // GROUP HIVE MIND CALCULATION (3+ Players)
      // Calculate group median
      const allVals = Array.from(this.playerValues.values()).sort((a, b) => a - b);
      const median = allVals[Math.floor(allVals.length / 2)] || 50;

      // Players closest to median get highest telepathy scores
      playersList.forEach(p => {
        const myVal = this.playerValues.get(p.id) ?? 50;
        const dist = Math.abs(myVal - median);

        let gain = 0;
        if (dist <= 10) gain = Math.round(800 * roundMultiplier);
        else if (dist <= 25) gain = Math.round(500 * roundMultiplier);
        else if (dist <= 40) gain = Math.round(250 * roundMultiplier);
        else gain = Math.round(50 * roundMultiplier);

        p.score = (p.score || 0) + gain;
        p.lastRoundGain = gain;
      });

      this.aiCommentary = `La mente colmena del salón se ubicó en el ${median}%. ¡Quienes calibraron cerca de ese valor acumulan grandes puntos de telepatía!`;
      this.groupResult = { median };
    }

    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      this.finishRound();
    });
  }

  finishRound() {
    this.clearCountdown();
    this.phase = 'RESULTS';
    this.timer = 8;
    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      if (this.currentRound < this.totalRounds) {
        this.currentRound++;
        this.startRound();
      } else {
        this.startPodium();
      }
    });
  }

  startPodium() {
    this.clearCountdown();
    this.phase = 'PODIUM';
    this.timer = 0;
    this.room.status = 'FINISHED';
    console.log(`[TelepatiaFiesta] Finished for room ${this.room.code}`);
    this.notifyStateChange();
  }

  skipTimer() {
    if (this.timerInterval) {
      this.clearCountdown();
      if (this.phase === 'HOW_TO_PLAY') {
        this.startRound();
      } else if (this.phase === 'INTRO') {
        this.startSpectrumPhase();
      } else if (this.phase === 'SPECTRUM') {
        this.finishSpectrumPhase();
      } else if (this.phase === 'REVEAL') {
        this.finishRound();
      } else if (this.phase === 'RESULTS') {
        if (this.currentRound < this.totalRounds) {
          this.currentRound++;
          this.startRound();
        } else {
          this.startPodium();
        }
      }
    }
  }

  restartToLobby() {
    this.clearCountdown();
    this.room.status = 'LOBBY';
    this.room.currentGame = null;
    for (const p of this.room.players.values()) {
      p.score = 0;
      p.lastRoundGain = 0;
    }
    this.notifyStateChange();
  }

  startCountdown(seconds, onComplete) {
    this.timer = seconds;
    this.notifyTimerTick();
    this.timerInterval = setInterval(() => {
      this.timer--;
      this.notifyTimerTick();
      if (this.timer <= 0) {
        this.clearCountdown();
        if (typeof onComplete === 'function') onComplete();
      }
    }, 1000);
  }

  clearCountdown() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  notifyTimerTick() {
    if (typeof this.onTimerTick === 'function') {
      this.onTimerTick(this.room.code, this.timer);
    } else {
      this.room.io?.to(this.room.code).emit('game:timer_tick', { timer: this.timer });
    }
  }

  notifyStateChange() {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange(this.room.code);
    } else if (typeof this.room.syncState === 'function') {
      this.room.syncState();
    }
  }

  getPublicState() {
    const isReveal = (this.phase === 'REVEAL' || this.phase === 'RESULTS' || this.phase === 'PODIUM');

    const playersDisplay = Array.from(this.room.players.values()).map(p => {
      const val = this.playerValues.get(p.id);
      return {
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        score: p.score || 0,
        roundDelta: p.lastRoundGain || 0,
        hasSubmitted: this.playerValues.has(p.id),
        value: isReveal ? val : null
      };
    }).sort((a, b) => b.score - a.score);

    return {
      gameId: this.id,
      gameTitle: this.title,
      phase: this.phase,
      tutorial: this.phase === 'HOW_TO_PLAY' ? getTutorial('telepatia-fiesta') : null,
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      isDoublePoints: (this.currentRound === this.totalRounds),
      isDuelMode: (this.room.players.size === 2),
      timer: this.timer,
      topic: this.currentPrompt?.topic || '',
      leftLabel: this.currentPrompt?.leftLabel || '0%',
      rightLabel: this.currentPrompt?.rightLabel || '100%',
      aiCommentary: this.aiCommentary,
      duelResult: this.duelResult,
      groupResult: this.groupResult,
      players: playersDisplay,
      leaderboard: playersDisplay,
      podium: this.phase === 'PODIUM' ? playersDisplay.slice(0, 3) : null
    };
  }

  getPrivateState(socketId) {
    const isReveal = (this.phase === 'REVEAL' || this.phase === 'RESULTS' || this.phase === 'PODIUM');
    const player = this.room.players.get(socketId) || {};
    const myVal = this.playerValues.get(socketId);

    const sortedPlayers = Array.from(this.room.players.values()).sort((a, b) => (b.score || 0) - (a.score || 0));
    const rank = sortedPlayers.findIndex(p => p.id === socketId) + 1;
    const topScore = sortedPlayers[0]?.score || 0;
    const isTieForFirst = sortedPlayers.length > 1 && sortedPlayers[0].score === sortedPlayers[1].score && topScore > 0;
    const isCoChampion = isTieForFirst && (player.score || 0) === topScore;

    return {
      gameId: this.id,
      gameTitle: this.title,
      phase: this.phase,
      tutorial: this.phase === 'HOW_TO_PLAY' ? getTutorial('telepatia-fiesta') : null,
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      isDoublePoints: (this.currentRound === this.totalRounds),
      isDuelMode: (this.room.players.size === 2),
      timer: this.timer,
      topic: this.currentPrompt?.topic,
      leftLabel: this.currentPrompt?.leftLabel,
      rightLabel: this.currentPrompt?.rightLabel,
      hasSubmitted: Boolean(this.playerValues.has(socketId)),
      myValue: myVal ?? 50,
      duelResult: this.duelResult,
      groupResult: this.groupResult,
      totalScore: player.score || 0,
      roundDelta: player.lastRoundGain || 0,
      rank: isCoChampion ? 1 : rank,
      isWinner: rank === 1 && !isTieForFirst,
      isCoChampion,
      isTie: isTieForFirst
    };
  }
}
