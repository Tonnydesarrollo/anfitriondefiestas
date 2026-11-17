/**
 * Bomba de Palabras (Word Bomb / La Patata Caliente Explosiva)
 * High-speed Jackbox-style party word association game.
 * 
 * Rules:
 * 1. A ticking digital bomb passes from phone to phone.
 * 2. The Host TV and active player phone display a syllable, prefix, or category prompt.
 * 3. The active player must type a valid matching word before the fuse burns out!
 * 4. Submitting a valid word passes the bomb to another random player. The timer ticks faster!
 * 5. If the bomb explodes on your phone: BOOM! You lose points, survivors score!
 */

import { getMobileCTA, calculateDynamicRounds, getTutorial } from '../rules/gameRulesConfig.js';

const BOMBA_PROMPTS = [
  { prompt: "Palabras que empiecen con: CAR-", filter: "CAR" },
  { prompt: "Palabras que terminen en: -MENTE", filter: "MENTE" },
  { prompt: "Palabras que contengan: -TRO-", filter: "TRO" },
  { prompt: "Cosas que encuentras en el baño", category: "baño" },
  { prompt: "Palabras que empiecen con: PRE-", filter: "PRE" },
  { prompt: "Excusas para no ir al trabajo", category: "excusas" },
  { prompt: "Palabras que contengan: -BLE-", filter: "BLE" },
  { prompt: "Comidas que huelen fuerte", category: "comida" },
  { prompt: "Palabras que empiecen con: DES-", filter: "DES" },
  { prompt: "Cosas que guardas en la guantera del auto", category: "auto" },
  { prompt: "Palabras que terminen en: -AZO", filter: "AZO" },
  { prompt: "Cosas que dan vergüenza ajena", category: "cringe" },
  { prompt: "Palabras que empiecen con: RE-", filter: "RE" },
  { prompt: "Animales que no tendrías de mascota", category: "animales" },
  { prompt: "Palabras que contengan: -QUI-", filter: "QUI" }
];

export class BombaPalabras {
  constructor(room, onStateChange, onTimerTick, customRounds = null) {
    this.id = 'bomba-palabras';
    this.title = 'Bomba de Palabras';
    this.room = room;
    this.onStateChange = onStateChange;
    this.onTimerTick = onTimerTick;

    const count = Math.max(2, room.players.size || 2);
    const dynamicPacing = calculateDynamicRounds('bomba-palabras', count);
    this.totalRounds = customRounds || dynamicPacing.rounds;
    this.currentRound = 1;
    this.phase = 'HOW_TO_PLAY'; // HOW_TO_PLAY | INTRO | TICKING | EXPLOSION | ROUND_RESULTS | PODIUM
    this.timer = 0;
    this.timerInterval = null;

    this.currentPrompt = null;
    this.usedWords = new Set();
    this.activePlayerId = null;
    this.activePlayerName = '';
    this.bombTurnTimer = 10;
    this.bombExplodedOnPlayerId = null;
    this.bombPassCount = 0;
    this.playerRoundDeltas = new Map();
  }

  start() {
    this.room.status = 'IN_GAME';
    this.currentRound = 1;
    for (const p of this.room.players.values()) {
      p.score = 0;
      p.lastRoundGain = 0;
    }
    this.startHowToPlayPhase();
  }

  startHowToPlayPhase() {
    this.phase = 'HOW_TO_PLAY';
    this.timer = 8;
    this.notifyStateChange();
    this.startCountdown(this.timer, () => {
      this.startRound();
    });
  }

  startRound() {
    this.phase = 'INTRO';
    this.clearCountdown();
    this.usedWords.clear();
    this.bombPassCount = 0;
    this.bombTurnTimer = 10;
    this.bombExplodedOnPlayerId = null;
    this.playerRoundDeltas.clear();

    for (const p of this.room.players.values()) {
      this.playerRoundDeltas.set(p.id, 0);
    }

    const promptIdx = Math.floor(Math.random() * BOMBA_PROMPTS.length);
    this.currentPrompt = BOMBA_PROMPTS[promptIdx];

    // Pick first victim
    const activePlayers = Array.from(this.room.players.values()).filter(p => p.connected);
    const firstPlayer = activePlayers[Math.floor(Math.random() * activePlayers.length)];
    this.activePlayerId = firstPlayer?.id;
    this.activePlayerName = firstPlayer?.name || 'Jugador';

    this.timer = 4;
    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      this.startTickingPhase();
    });
  }

  startTickingPhase() {
    this.phase = 'TICKING';
    this.clearCountdown();
    // Progressive urgency: timer gets shorter with each pass
    this.bombTurnTimer = Math.max(5, 10 - Math.floor(this.bombPassCount * 0.8));
    this.timer = this.bombTurnTimer;
    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      this.detonateBomb();
    });
  }

  submitWord(socketId, word) {
    if (this.phase !== 'TICKING') return { success: false, error: 'La bomba no está activa.' };
    if (socketId !== this.activePlayerId) return { success: false, error: '¡No es tu turno de tener la bomba!' };

    const cleanWord = (word || '').trim().toUpperCase();
    if (cleanWord.length < 2) return { success: false, error: 'Palabra demasiado corta.' };
    if (this.usedWords.has(cleanWord)) return { success: false, error: 'Esa palabra ya se usó en esta ronda.' };

    // Check filter if required
    if (this.currentPrompt.filter && !cleanWord.includes(this.currentPrompt.filter)) {
      return { success: false, error: `Debe contener "${this.currentPrompt.filter}".` };
    }

    // Word accepted! Defuse and pass bomb!
    this.usedWords.add(cleanWord);
    this.bombPassCount++;

    // Reward active player for fast thinking
    const activeP = this.room.players.get(socketId);
    if (activeP) {
      const passPts = 100 + (this.bombPassCount * 25);
      activeP.score += passPts;
      this.playerRoundDeltas.set(socketId, (this.playerRoundDeltas.get(socketId) || 0) + passPts);
    }

    // Choose next random connected player (different from current)
    const connected = Array.from(this.room.players.values()).filter(p => p.connected && p.id !== socketId);
    const nextPlayer = connected.length > 0 ? connected[Math.floor(Math.random() * connected.length)] : activeP;

    this.activePlayerId = nextPlayer.id;
    this.activePlayerName = nextPlayer.name;

    console.log(`[BombaPalabras] ${activeP?.name} passed bomb to ${nextPlayer.name} with word: "${cleanWord}"`);
    this.startTickingPhase();
    return { success: true, message: `¡Bomba pasada a ${nextPlayer.name}!` };
  }

  detonateBomb() {
    this.clearCountdown();
    this.phase = 'EXPLOSION';
    this.bombExplodedOnPlayerId = this.activePlayerId;
    const explodedPlayer = this.room.players.get(this.activePlayerId);

    // Exploded player loses points or takes penalty
    if (explodedPlayer) {
      explodedPlayer.score = Math.max(0, explodedPlayer.score - 150);
      this.playerRoundDeltas.set(explodedPlayer.id, (this.playerRoundDeltas.get(explodedPlayer.id) || 0) - 150);
    }

    // Surviving players get survival bonus
    for (const p of this.room.players.values()) {
      if (p.id !== this.activePlayerId && p.connected) {
        p.score += 200;
        this.playerRoundDeltas.set(p.id, (this.playerRoundDeltas.get(p.id) || 0) + 200);
      }
    }

    this.timer = 6;
    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      this.startRoundResults();
    });
  }

  startRoundResults() {
    this.phase = 'ROUND_RESULTS';
    this.clearCountdown();
    this.timer = 7;
    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      if (this.currentRound < this.totalRounds) {
        this.currentRound++;
        this.startRound();
      } else {
        this.showPodium();
      }
    });
  }

  showPodium() {
    this.clearCountdown();
    this.phase = 'PODIUM';
    this.room.status = 'FINISHED';
    this.notifyStateChange();
  }

  skipTimer() {
    this.clearCountdown();
    if (this.phase === 'HOW_TO_PLAY') {
      this.startRound();
    } else if (this.phase === 'INTRO') {
      this.startTickingPhase();
    } else if (this.phase === 'TICKING') {
      this.detonateBomb();
    } else if (this.phase === 'EXPLOSION') {
      this.startRoundResults();
    } else if (this.phase === 'ROUND_RESULTS') {
      if (this.currentRound < this.totalRounds) {
        this.currentRound++;
        this.startRound();
      } else {
        this.showPodium();
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
    this.clearCountdown();
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

  notifyStateChange() {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange(this.room.code);
    }
  }

  notifyTimerTick() {
    if (typeof this.onTimerTick === 'function') {
      this.onTimerTick(this.room.code, this.timer);
    } else {
      this.notifyStateChange();
    }
  }

  getPublicState() {
    const sortedPlayers = Array.from(this.room.players.values())
      .map(p => ({
        id: p.id,
        name: p.name,
        score: p.score || 0,
        avatar: p.avatar,
        roundDelta: this.playerRoundDeltas.get(p.id) || 0
      }))
      .sort((a, b) => b.score - a.score);

    const victim = this.room.players.get(this.bombExplodedOnPlayerId);

    return {
      gameId: this.id,
      gameTitle: this.title,
      phase: this.phase,
      howToPlay: this.phase === 'HOW_TO_PLAY' ? getTutorial('bomba-palabras') : null,
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      timer: this.timer,
      prompt: this.currentPrompt?.prompt,
      filter: this.currentPrompt?.filter || null,
      activePlayerName: this.activePlayerName,
      activePlayerId: this.activePlayerId,
      bombPassCount: this.bombPassCount,
      usedWordsCount: this.usedWords.size,
      wordsAccepted: Array.from(this.usedWords),
      explodedPlayerName: victim?.name || null,
      explodedPlayerAvatar: victim?.avatar || null,
      leaderboard: sortedPlayers,
      podium: this.phase === 'PODIUM' ? sortedPlayers.slice(0, 3) : null
    };
  }

  getPrivateState(socketId) {
    const isMyTurn = (socketId === this.activePlayerId);
    const player = this.room.players.get(socketId) || {};
    const sortedPlayers = Array.from(this.room.players.values())
      .map(p => ({
        id: p.id,
        name: p.name,
        score: p.score || 0,
        avatar: p.avatar
      }))
      .sort((a, b) => b.score - a.score);

    const myRank = sortedPlayers.findIndex(p => p.id === socketId) + 1;
    const topScore = sortedPlayers[0]?.score || 0;
    const isTieForFirst = sortedPlayers.length > 1 && sortedPlayers[0].score === sortedPlayers[1].score && topScore > 0;
    const isCoChampion = isTieForFirst && (player.score || 0) === topScore;

    return {
      gameId: this.id,
      gameTitle: this.title,
      phase: this.phase,
      howToPlay: this.phase === 'HOW_TO_PLAY' ? getTutorial('bomba-palabras') : null,
      currentRound: this.currentRound,
      timer: this.timer,
      prompt: this.currentPrompt?.prompt,
      filter: this.currentPrompt?.filter || null,
      isMyTurn,
      activePlayerName: this.activePlayerName,
      bombPassCount: this.bombPassCount,
      totalScore: player.score || 0,
      roundDelta: this.playerRoundDeltas.get(socketId) || 0,
      rank: isCoChampion ? 1 : myRank,
      isWinner: myRank === 1 && !isTieForFirst,
      isCoChampion,
      isTie: isTieForFirst
    };
  }
}
