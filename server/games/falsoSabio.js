/**
 * Falso Sabio (Fibbage / Academia del Farol)
 * Bluffing Trivia Jackbox-style game.
 * 
 * Rules:
 * 1. AI Host displays an unbelievable real trivia fact with a blank (____).
 * 2. LIE_WRITING: Each player writes a believable fake answer to trick others.
 * 3. TRUTH_VOTING: The real answer and all player lies are mixed randomly.
 *    Players vote on which one is the true fact!
 * 4. SCORING:
 *    - +500 PTS if you identify the real truth.
 *    - +250 PTS for every other player you tricked with your lie!
 *    - If you vote for your own lie: 0 PTS and an AI Host roast!
 */

const FALSO_SABIO_QUESTIONS = [
  {
    fact: "En 1923, el jockey Frank Hayes ganó una carrera en Belmont Park a pesar de estar...",
    truth: "Muerto de un infarto",
    decoys: ["Ciego de un ojo", "Borracho", "Descalzo", "Sin pantalones"]
  },
  {
    fact: "En Suiza es ilegal por ley de bienestar animal tener un solo...",
    truth: "Conejillo de indias",
    decoys: ["Gato persa", "Canario cantor", "Hamster", "Pez dorado"]
  },
  {
    fact: "Durante la Segunda Guerra Mundial, la estatuilla del premio Óscar se fabricó con...",
    truth: "Yeso pintado",
    decoys: ["Madera de pino", "Plomo fundido", "Cobre reciclado", "Cartón prensado"]
  },
  {
    fact: "El creador de las papas Pringles fue tan devoto a su invento que sus cenizas fueron enterradas en...",
    truth: "Una lata de Pringles",
    decoys: ["Una freidora industrial", "Un paquete de papas", "Un barril de sal", "Un envase de plástico"]
  },
  {
    fact: "En la antigua Grecia, lanzar una manzana a alguien era una declaración tradicional de...",
    truth: "Amor y propuesta de matrimonio",
    decoys: ["Guerra a muerte", "Bancarrota", "Insulto a sus ancestros", "Deseo de buena suerte"]
  },
  {
    fact: "Antes de inventar el papel higiénico moderno en 1857, los estadounidenses solían limpiarse con...",
    truth: "Mazorcas de maíz",
    decoys: ["Hojas de tabaco", "Trapos viejos de lana", "Paja seca", "Cáscaras de nuez"]
  },
  {
    fact: "El animal nacional oficial de Escocia es el...",
    truth: "Unicornio",
    decoys: ["Monstruo del Lago Ness", "Ciervo rojo", "Tejón montañés", "Halcón dorado"]
  },
  {
    fact: "En 2012, una mujer en Suecia provocó un choque de trenes luego de robarlo mientras trabajaba como...",
    truth: "Limpiadora",
    decoys: ["Cocinera de a bordo", "Revisora de boletos", "Mecánica pasante", "Guardia de seguridad"]
  }
];

export class FalsoSabio {
  constructor(room, onStateChange, onTimerTick, customRounds = 3) {
    this.id = 'falso-sabio';
    this.title = 'Falso Sabio';
    this.room = room;
    this.onStateChange = onStateChange;
    this.onTimerTick = onTimerTick;

    this.totalRounds = customRounds || 3;
    this.currentRound = 1;
    this.phase = 'HOW_TO_PLAY'; // HOW_TO_PLAY | INTRO | LIE_WRITING | TRUTH_VOTING | REVEAL | ROUND_RESULTS | PODIUM
    this.timer = 0;
    this.timerInterval = null;

    this.currentQuestion = null;
    this.playerLies = new Map(); // socketId -> string
    this.playerVotes = new Map(); // voterSocketId -> answerText
    this.mixedOptions = []; // Array<{ text, authorId, isTruth }>
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
    this.phase = 'LIE_WRITING';
    this.clearCountdown();
    this.playerLies.clear();
    this.playerVotes.clear();
    this.mixedOptions = [];
    this.playerRoundDeltas.clear();

    for (const p of this.room.players.values()) {
      this.playerRoundDeltas.set(p.id, 0);
    }

    const qIdx = (this.currentRound - 1) % FALSO_SABIO_QUESTIONS.length;
    this.currentQuestion = FALSO_SABIO_QUESTIONS[qIdx];

    this.timer = 30; // 30s to write a believable lie
    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      this.finishLieWriting();
    });
  }

  submitLie(socketId, lieText) {
    if (this.phase !== 'LIE_WRITING') return { success: false, error: 'No es momento de escribir faroles.' };
    const cleanLie = (lieText || '').trim();
    if (!cleanLie || cleanLie.length < 2) return { success: false, error: 'Escribe una mentira creíble.' };

    this.playerLies.set(socketId, cleanLie);
    console.log(`[FalsoSabio] Player ${socketId} submitted lie: "${cleanLie}"`);
    this.notifyStateChange();

    const activePlayers = Array.from(this.room.players.values()).filter(p => p.connected);
    if (this.playerLies.size >= activePlayers.length) {
      this.clearCountdown();
      this.finishLieWriting();
    }
    return { success: true };
  }

  finishLieWriting() {
    this.clearCountdown();
    this.phase = 'TRUTH_VOTING';

    // Mix player lies with the real truth and random decoys if needed
    const options = [];
    // Add real truth
    options.push({
      text: this.currentQuestion.truth,
      authorId: 'TRUTH',
      isTruth: true
    });

    // Add player lies
    for (const [pId, lie] of this.playerLies.entries()) {
      options.push({
        text: lie,
        authorId: pId,
        isTruth: false
      });
    }

    // If few players, add a game decoy
    if (options.length < 4 && this.currentQuestion.decoys) {
      for (const d of this.currentQuestion.decoys) {
        if (options.length >= 4) break;
        options.push({
          text: d,
          authorId: 'DECOY',
          isTruth: false
        });
      }
    }

    // Shuffle options
    this.mixedOptions = options.sort(() => Math.random() - 0.5);
    this.timer = 20;
    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      this.revealResults();
    });
  }

  submitVote(voterSocketId, chosenText) {
    if (this.phase !== 'TRUTH_VOTING') return { success: false, error: 'No es la fase de votación.' };
    this.playerVotes.set(voterSocketId, chosenText);
    this.notifyStateChange();

    const activePlayers = Array.from(this.room.players.values()).filter(p => p.connected);
    if (this.playerVotes.size >= activePlayers.length) {
      this.clearCountdown();
      this.revealResults();
    }
    return { success: true };
  }

  revealResults() {
    this.clearCountdown();
    this.phase = 'REVEAL';

    // Tally points:
    // +500 PTS for guessing Truth
    // +250 PTS per vote tricked on your Lie
    const truthText = this.currentQuestion.truth;

    for (const [voterId, chosen] of this.playerVotes.entries()) {
      const voter = this.room.players.get(voterId);
      if (!voter) continue;

      if (chosen === truthText) {
        // Correctly guessed the truth!
        voter.score += 500;
        this.playerRoundDeltas.set(voterId, (this.playerRoundDeltas.get(voterId) || 0) + 500);
      } else {
        // Find which author tricked this voter
        const trickedOption = this.mixedOptions.find(o => o.text === chosen);
        if (trickedOption && trickedOption.authorId !== 'TRUTH' && trickedOption.authorId !== 'DECOY') {
          const author = this.room.players.get(trickedOption.authorId);
          if (author && author.id !== voterId) {
            author.score += 250;
            this.playerRoundDeltas.set(author.id, (this.playerRoundDeltas.get(author.id) || 0) + 250);
          }
        }
      }
    }

    this.timer = 10;
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
    if (this.phase === 'HOW_TO_PLAY' || this.phase === 'INTRO') {
      this.phase = 'LIE_WRITING';
      this.startRound();
    } else if (this.phase === 'LIE_WRITING') {
      this.finishLieWriting();
    } else if (this.phase === 'TRUTH_VOTING') {
      this.revealResults();
    } else if (this.phase === 'REVEAL') {
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
        roundDelta: this.playerRoundDeltas.get(p.id) || 0,
        hasSubmittedLie: this.playerLies.has(p.id),
        hasVoted: this.playerVotes.has(p.id)
      }))
      .sort((a, b) => b.score - a.score);

    // Votes breakdown for reveal phase
    const optionsWithVotes = this.mixedOptions.map(opt => {
      const voters = [];
      for (const [vId, text] of this.playerVotes.entries()) {
        if (text === opt.text) {
          const vP = this.room.players.get(vId);
          if (vP) voters.push({ name: vP.name, avatar: vP.avatar });
        }
      }
      const author = this.room.players.get(opt.authorId);
      return {
        text: opt.text,
        isTruth: this.phase === 'REVEAL' ? opt.isTruth : null,
        authorName: this.phase === 'REVEAL' ? (opt.isTruth ? '¡LA VERDAD!' : (author?.name || 'Farol de la Casa')) : null,
        voters: this.phase === 'REVEAL' ? voters : []
      };
    });

    return {
      gameId: this.id,
      gameTitle: this.title,
      phase: this.phase,
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      timer: this.timer,
      fact: this.currentQuestion?.fact,
      question: this.currentQuestion?.fact,
      truth: this.phase === 'REVEAL' ? this.currentQuestion?.truth : null,
      revealedTruth: this.phase === 'REVEAL' ? this.currentQuestion?.truth : null,
      options: optionsWithVotes,
      choices: optionsWithVotes,
      results: optionsWithVotes.map(o => ({
        text: o.text,
        isRealTruth: o.isTruth,
        authorName: o.authorName,
        votesCount: o.voters?.length || 0
      })),
      leaderboard: sortedPlayers,
      podium: this.phase === 'PODIUM' ? sortedPlayers.slice(0, 3) : null
    };
  }

  getPrivateState(socketId) {
    const player = this.room.players.get(socketId) || {};
    const myLie = this.playerLies.get(socketId) || null;
    const hasSubmittedLie = this.playerLies.has(socketId);
    const hasVoted = this.playerVotes.has(socketId);
    const myVote = this.playerVotes.get(socketId) || null;

    // Filter out player's own lie during voting so they don't vote for themselves
    const selectableOptions = this.mixedOptions
      .filter(o => o.authorId !== socketId)
      .map(o => o.text);

    const sortedPlayers = Array.from(this.room.players.values())
      .map(p => ({
        id: p.id,
        name: p.name,
        score: p.score || 0,
        avatar: p.avatar
      }))
      .sort((a, b) => b.score - a.score);

    return {
      gameId: this.id,
      gameTitle: this.title,
      phase: this.phase,
      currentRound: this.currentRound,
      timer: this.timer,
      fact: this.currentQuestion?.fact,
      question: this.currentQuestion?.fact,
      truth: (this.phase === 'REVEAL') ? this.currentQuestion?.truth : null,
      hasSubmittedLie,
      myLie,
      selectableOptions,
      choices: selectableOptions.map(t => ({ text: t })),
      options: selectableOptions.map(t => ({ text: t })),
      hasVoted,
      myVote,
      totalScore: player.score || 0,
      roundDelta: this.playerRoundDeltas.get(socketId) || 0,
      rank: sortedPlayers.findIndex(p => p.id === socketId) + 1,
      isWinner: sortedPlayers[0]?.id === socketId
    };
  }
}
