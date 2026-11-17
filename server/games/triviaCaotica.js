/**
 * Game Module: Trivia Caótica (Trivia Murder Party / You Don't Know Jack style)
 * Specially designed for 2 to 10 players (Awesome in 1v1 Duel & Group Battle Royale).
 * 
 * Features:
 * - 4-choice rapid fire absurd & culture trivia
 * - 2-Player "Duelo de Asalto": Correct answer steals points from opponent if they fail!
 * - Multi-Player speed bonuses & double points final round
 * - AI Host commentary by Ollama
 */

import { judgeDuel } from '../aiHost.js';
import { calculateDynamicRounds, getTutorial } from '../rules/gameRulesConfig.js';

// Pre-defined bank of witty, funny trivia questions categorized by audience
export const TRIVIA_DATABASE = [
  // --- FAMILIA ---
  {
    category: 'Naturaleza Extraña',
    question: '¿Cuál de estos animales es conocido científicamente por defecar en forma de cubos geométricos casi perfectos?',
    options: ['El Wombat australiano', 'El Ornitorrinco', 'La Hiena manchada', 'El Perezoso de tres dedos'],
    correctIndex: 0,
    explanation: 'El wombat tiene intestinos elásticos en los bordes que moldean sus heces en cubos para que no rueden de las rocas.',
    audiences: ['familia', 'cerebritos', 'amigos']
  },
  {
    category: 'Historia Curiosa',
    question: '¿Qué alimento fue utilizado originalmente como medicina contra la diarrea y la indigestión en el siglo XIX?',
    options: ['La Salsa Kétchup', 'El Chocolate con leche', 'Las Papas fritas', 'La Mayonesa casera'],
    correctIndex: 0,
    explanation: 'En 1834, el Dr. John Cook Bennett vendía kétchup en píldoras como cura estomacal milagrosa.',
    audiences: ['familia', 'cerebritos', 'amigos']
  },
  {
    category: 'Inventos Ridículos',
    question: '¿Por qué inventó Nintendo las tarjetas de juego de Switch con un sabor extremadamente amargo?',
    options: ['Para evitar que los niños (o adultos curiosos) se las traguen', 'Porque el químico preserva los circuitos', 'Fue un error de fábrica en Kioto', 'Para evitar que las mascotas las muerdan'],
    correctIndex: 0,
    explanation: 'Están recubiertas de benzoato de denatonio, la sustancia más amarga conocida por el ser humano.',
    audiences: ['familia', 'cerebritos', 'amigos']
  },
  {
    category: 'Récords Mundiales',
    question: '¿Cuánto duró la guerra más corta de toda la historia de la humanidad?',
    options: ['Entre 38 y 45 minutos (Reino Unido vs Zanzíbar)', '3 horas exactas', '1 día y medio', '12 minutos'],
    correctIndex: 0,
    explanation: 'Ocurrió el 27 de agosto de 1896. El sultán huyó tras 38 minutos de bombardeo naval.',
    audiences: ['familia', 'cerebritos', 'amigos']
  },

  // --- CEREBRITOS ---
  {
    category: 'Ciencia Asombrosa',
    question: 'Si pudieras doblar una hoja de papel estándar de 0.1 mm exactamente 42 veces por la mitad, ¿hasta dónde llegaría?',
    options: ['Hasta la Luna', 'Hasta la cima del Monte Everest', 'Cruzaría el Océano Atlántico', 'Apenas mediría 2 metros'],
    correctIndex: 0,
    explanation: 'Por crecimiento exponencial (2^42), el grosor resultante sería de aproximadamente 439,804 kilómetros, superando la distancia a la Luna.',
    audiences: ['cerebritos']
  },
  {
    category: 'Tecnología Vintage',
    question: '¿Cuál fue el primer nombre que los creadores consideraron para el buscador Google antes de registrarlo?',
    options: ['BackRub', 'PageSearch', 'WebIndex', 'GoogolPlex'],
    correctIndex: 0,
    explanation: 'Larry Page y Sergey Brin lo llamaron BackRub en 1996 porque analizaba los enlaces entrantes (backlinks).',
    audiences: ['cerebritos', 'amigos']
  },

  // --- PAREJAS ---
  {
    category: 'Psicología y Citas',
    question: 'Según estudios de psicología social, ¿cuánto tiempo tarda en promedio una persona en decidir si le atrae alguien en una cita?',
    options: ['Menos de 30 segundos', 'Aproximadamente 15 minutos', 'Al terminar la primera bebida', 'Exactamente 1 hora'],
    correctIndex: 0,
    explanation: 'Las señales no verbales y feromonas definen la química inicial en los primeros 30 segundos de interacción.',
    audiences: ['parejas', 'amigos']
  },
  {
    category: 'Romance y Tradición',
    question: '¿En qué país es tradición popular de San Valentín comer pollo frito de KFC en pareja?',
    options: ['Japón', 'Corea del Sur', 'Australia', 'Francia'],
    correctIndex: 0,
    explanation: 'Gracias a una campaña masiva de marketing en 1974, KFC es el banquete romántico nacional japonés en Navidad y San Valentín.',
    audiences: ['parejas', 'familia', 'amigos']
  },

  // --- AMIGOS / PICANTE (+18) ---
  {
    category: 'Fiesta y Tragos',
    question: '¿Por qué los antiguos piratas realmente usaban un parche en un solo ojo?',
    options: ['Para tener un ojo adaptado a la oscuridad al bajar a la bodega', 'Porque la mayoría perdía un ojo por pólvora', 'Como símbolo de rango y respeto', 'Para intimidar a los prisioneros'],
    correctIndex: 0,
    explanation: 'Al pasar de la cubierta soleada a la bodega oscura, cambiaban el parche de ojo y veían al instante sin esperar adaptación.',
    audiences: ['amigos', 'cerebritos']
  },
  {
    category: 'Insólito & Cringe',
    question: '¿En qué país es legal casarse legalmente con un holograma o personaje ficticio de anime?',
    options: ['Japón (a través de la empresa Gatebox)', 'Corea del Norte', 'Suiza', 'Estonia'],
    correctIndex: 0,
    explanation: 'Cientos de personas han recibido certificados ceremoniales oficiales de la empresa de tecnología Gatebox en Tokio.',
    audiences: ['amigos']
  }
];

export class TriviaCaoticaGame {
  constructor(room, onStateChange = null, onTimerTick = null, customRounds = null) {
    this.id = 'trivia-caotica';
    this.title = 'Trivia Caótica';
    this.room = room;
    this.onStateChange = onStateChange;
    this.onTimerTick = onTimerTick;

    const count = Math.max(2, room.players.size || 2);
    const dynamicPacing = calculateDynamicRounds('trivia-caotica', count);
    this.totalRounds = customRounds || dynamicPacing.rounds;

    this.currentRound = 1;
    this.phase = 'HOW_TO_PLAY'; // HOW_TO_PLAY | INTRO | QUESTION | REVEAL | RESULTS | PODIUM
    this.timer = 0;
    this.timerInterval = null;

    this.usedQuestionIndices = new Set();
    this.currentQuestion = null;
    this.shuffledOptions = [];
    this.correctAnswerIndex = 0;

    this.playerAnswers = new Map(); // socketId -> { choiceIndex, timestamp, delta: number }
    this.questionStartTime = 0;
    this.aiCommentary = null;

    console.log(`[TriviaCaotica] Initialized for room ${room.code} (${this.totalRounds} rondas, ${count} jugadores)`);
  }

  start() {
    this.room.status = 'IN_GAME';
    this.currentRound = 1;
    this.usedQuestionIndices.clear();

    for (const p of this.room.players.values()) {
      p.score = 0;
      p.lastRoundGain = 0;
    }

    this.startHowToPlayPhase();
  }

  startHowToPlayPhase() {
    this.clearCountdown();
    this.phase = 'HOW_TO_PLAY';
    const tut = getTutorial('trivia-caotica');
    this.timer = tut ? tut.durationSeconds : 12;
    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      this.startRound();
    });
  }

  startRound() {
    this.clearCountdown();
    this.playerAnswers.clear();
    this.aiCommentary = null;

    for (const p of this.room.players.values()) {
      p.lastRoundGain = 0;
    }

    // Pick question suited for audience
    const audience = this.room.audience || 'familia';
    const pool = TRIVIA_DATABASE.filter((q, idx) => {
      if (this.usedQuestionIndices.has(idx)) return false;
      return q.audiences.includes(audience) || q.audiences.includes('familia');
    });

    const candidatePool = pool.length > 0 ? pool : TRIVIA_DATABASE;
    const randomItem = candidatePool[Math.floor(Math.random() * candidatePool.length)];
    const originalIdx = TRIVIA_DATABASE.indexOf(randomItem);
    if (originalIdx >= 0) this.usedQuestionIndices.add(originalIdx);

    this.currentQuestion = randomItem;

    // Shuffle options while keeping track of correct one
    const optsWithMeta = randomItem.options.map((text, i) => ({
      text,
      isCorrect: (i === randomItem.correctIndex)
    }));
    optsWithMeta.sort(() => Math.random() - 0.5);

    this.shuffledOptions = optsWithMeta.map(o => o.text);
    this.correctAnswerIndex = optsWithMeta.findIndex(o => o.isCorrect);

    // INTRO Phase: 6 seconds to read question category and prepare
    this.phase = 'INTRO';
    this.timer = 5;
    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      this.startQuestionPhase();
    });
  }

  startQuestionPhase() {
    this.clearCountdown();
    this.phase = 'QUESTION';
    this.questionStartTime = Date.now();
    this.timer = 20; // 20s to answer on phones
    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      this.finishQuestionPhase();
    });
  }

  submitAnswer(socketId, choiceIndex) {
    if (this.phase !== 'QUESTION') return { success: false, error: 'No es momento de responder' };
    if (this.playerAnswers.has(socketId)) return { success: false, error: 'Ya enviaste tu respuesta' };

    const idx = parseInt(choiceIndex, 10);
    if (isNaN(idx) || idx < 0 || idx >= this.shuffledOptions.length) {
      return { success: false, error: 'Opción inválida' };
    }

    const elapsed = Date.now() - this.questionStartTime;
    this.playerAnswers.set(socketId, {
      choiceIndex: idx,
      timestamp: elapsed,
      isCorrect: (idx === this.correctAnswerIndex),
      delta: 0
    });

    this.notifyStateChange();

    // If all connected players submitted, advance early
    const connectedCount = Array.from(this.room.players.values()).filter(p => p.connected).length;
    if (this.playerAnswers.size >= connectedCount) {
      setTimeout(() => {
        if (this.phase === 'QUESTION') this.finishQuestionPhase();
      }, 500);
    }

    return { success: true };
  }

  finishQuestionPhase() {
    this.clearCountdown();
    this.phase = 'REVEAL';
    this.timer = 12;

    const roundMultiplier = (this.currentRound === this.totalRounds) ? 2 : 1;
    const isDuelMode = (this.room.players.size === 2);

    let correctPlayers = [];
    let incorrectPlayers = [];

    for (const p of this.room.players.values()) {
      const ans = this.playerAnswers.get(p.id);
      if (ans && ans.isCorrect) {
        correctPlayers.push(p);
      } else {
        incorrectPlayers.push(p);
      }
    }

    // SCORING ENGINE
    if (isDuelMode && this.room.players.size === 2) {
      // 1v1 HEAD-TO-HEAD DUEL STEAL MECHANIC!
      const playersList = Array.from(this.room.players.values());
      const p1 = playersList[0];
      const p2 = playersList[1];
      const a1 = this.playerAnswers.get(p1.id);
      const a2 = this.playerAnswers.get(p2.id);

      const p1Correct = Boolean(a1 && a1.isCorrect);
      const p2Correct = Boolean(a2 && a2.isCorrect);

      if (p1Correct && !p2Correct) {
        // Player 1 steals from Player 2!
        const pts = Math.round(500 * roundMultiplier);
        const steal = Math.round(150 * roundMultiplier);
        p1.score = (p1.score || 0) + pts + steal;
        p1.lastRoundGain = pts + steal;
        p2.score = Math.max(0, (p2.score || 0) - steal);
        p2.lastRoundGain = -steal;
        this.aiCommentary = `¡ASALTO 1v1! ${p1.name} acertó y le robó ${steal} PTS a ${p2.name}. ¡Duelo directo en la mesa!`;
      } else if (!p1Correct && p2Correct) {
        // Player 2 steals from Player 1!
        const pts = Math.round(500 * roundMultiplier);
        const steal = Math.round(150 * roundMultiplier);
        p2.score = (p2.score || 0) + pts + steal;
        p2.lastRoundGain = pts + steal;
        p1.score = Math.max(0, (p1.score || 0) - steal);
        p1.lastRoundGain = -steal;
        this.aiCommentary = `¡ASALTO 1v1! ${p2.name} acertó y le robó ${steal} PTS a ${p1.name}. ¡Impecable!`;
      } else if (p1Correct && p2Correct) {
        // Both correct
        const pts = Math.round(400 * roundMultiplier);
        p1.score = (p1.score || 0) + pts;
        p1.lastRoundGain = pts;
        p2.score = (p2.score || 0) + pts;
        p2.lastRoundGain = pts;
        this.aiCommentary = `¡EMPATE DE CRÁNEOS! Ambos acertaron que era "${this.shuffledOptions[this.correctAnswerIndex]}".`;
      } else {
        // Both failed!
        p1.lastRoundGain = 0;
        p2.lastRoundGain = 0;
        this.aiCommentary = `¡DESASTRE TOTAL! Ninguno de los dos sabía la respuesta correcta. La correcta era: "${this.shuffledOptions[this.correctAnswerIndex]}".`;
      }
    } else {
      // GROUP SCORING (3+ Players): Speed bonuses & streak rewards
      correctPlayers.sort((a, b) => {
        const tA = this.playerAnswers.get(a.id)?.timestamp || 999999;
        const tB = this.playerAnswers.get(b.id)?.timestamp || 999999;
        return tA - tB;
      });

      correctPlayers.forEach((p, rank) => {
        let base = 500;
        let speedBonus = (rank === 0) ? 250 : ((rank === 1) ? 100 : 0);
        let totalGain = Math.round((base + speedBonus) * roundMultiplier);
        p.score = (p.score || 0) + totalGain;
        p.lastRoundGain = totalGain;
      });

      incorrectPlayers.forEach(p => {
        p.lastRoundGain = 0;
      });

      if (correctPlayers.length === 0) {
        this.aiCommentary = `¡Masacre intelectual! Nadie acertó que la respuesta correcta era "${this.shuffledOptions[this.correctAnswerIndex]}".`;
      } else {
        this.aiCommentary = `¡Brillante reflejo de ${correctPlayers[0].name}! Fue el más rápido en responder correctamente.`;
      }
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
    console.log(`[TriviaCaotica] Game finished for room ${this.room.code}`);
    this.notifyStateChange();
  }

  skipTimer() {
    if (this.timerInterval) {
      this.clearCountdown();
      if (this.phase === 'HOW_TO_PLAY') {
        this.startRound();
      } else if (this.phase === 'INTRO') {
        this.startQuestionPhase();
      } else if (this.phase === 'QUESTION') {
        this.finishQuestionPhase();
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

    const sortedPlayers = Array.from(this.room.players.values()).map(p => {
      const ans = this.playerAnswers.get(p.id);
      return {
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        score: p.score || 0,
        roundDelta: p.lastRoundGain || 0,
        hasAnswered: this.playerAnswers.has(p.id),
        choiceIndex: isReveal ? (ans ? ans.choiceIndex : null) : null,
        isCorrect: isReveal ? (ans ? ans.isCorrect : false) : null
      };
    }).sort((a, b) => b.score - a.score);

    return {
      gameId: this.id,
      gameTitle: this.title,
      phase: this.phase,
      tutorial: this.phase === 'HOW_TO_PLAY' ? getTutorial('trivia-caotica') : null,
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      isDoublePoints: (this.currentRound === this.totalRounds),
      isDuelMode: (this.room.players.size === 2),
      timer: this.timer,
      category: this.currentQuestion?.category || 'Cultura Pop',
      question: this.currentQuestion?.question || '',
      options: this.shuffledOptions,
      correctIndex: isReveal ? this.correctAnswerIndex : null,
      explanation: isReveal ? this.currentQuestion?.explanation : null,
      aiCommentary: this.aiCommentary,
      players: sortedPlayers,
      leaderboard: sortedPlayers,
      podium: this.phase === 'PODIUM' ? sortedPlayers.slice(0, 3) : null
    };
  }

  getPrivateState(socketId) {
    const isReveal = (this.phase === 'REVEAL' || this.phase === 'RESULTS' || this.phase === 'PODIUM');
    const myAns = this.playerAnswers.get(socketId);
    const player = this.room.players.get(socketId) || {};

    const sortedPlayers = Array.from(this.room.players.values()).sort((a, b) => (b.score || 0) - (a.score || 0));
    const rank = sortedPlayers.findIndex(p => p.id === socketId) + 1;
    const topScore = sortedPlayers[0]?.score || 0;
    const isTieForFirst = sortedPlayers.length > 1 && sortedPlayers[0].score === sortedPlayers[1].score && topScore > 0;
    const isCoChampion = isTieForFirst && (player.score || 0) === topScore;

    return {
      gameId: this.id,
      gameTitle: this.title,
      phase: this.phase,
      tutorial: this.phase === 'HOW_TO_PLAY' ? getTutorial('trivia-caotica') : null,
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      isDoublePoints: (this.currentRound === this.totalRounds),
      isDuelMode: (this.room.players.size === 2),
      timer: this.timer,
      category: this.currentQuestion?.category,
      question: this.currentQuestion?.question,
      options: this.shuffledOptions,
      hasAnswered: Boolean(myAns),
      myChoice: myAns ? myAns.choiceIndex : null,
      correctIndex: isReveal ? this.correctAnswerIndex : null,
      isCorrect: isReveal ? (myAns ? myAns.isCorrect : false) : null,
      explanation: isReveal ? this.currentQuestion?.explanation : null,
      totalScore: player.score || 0,
      roundDelta: player.lastRoundGain || 0,
      rank: isCoChampion ? 1 : rank,
      isWinner: rank === 1 && !isTieForFirst,
      isCoChampion,
      isTie: isTieForFirst
    };
  }
}
