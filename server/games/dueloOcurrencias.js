/**
 * Game Module: Duelo de Ocurrencias (Quiplash-style game for 3 to 10 players)
 * 
 * Phases:
 * 1. INTRO: Game intro on Host screen.
 * 2. ANSWERING: Players receive 2 prompts on their mobile controllers to answer before the timer expires.
 * 3. VOTING: Duels are presented one by one on the Host screen (Answer A vs Answer B).
 *    Non-duelist players vote on their phones. Duelists see a suspense screen.
 * 4. AI_JUDGING: "El Anfitrión IA" (via Ollama) evaluates the duel, delivers a witty punchline and awards bonus points.
 * 5. ROUND_RESULTS: Displays score updates and leaderboard for the round.
 * 6. PODIUM: Final celebratory podium with winners after all rounds.
 */

import { judgeDuel } from '../aiHost.js';
import { DUELO_OCURRENCIAS_CONFIG, getTutorial, getMobileCTA } from '../rules/gameRulesConfig.js';
import { getPromptsByAudience } from '../ai/gamePrompts.js';

// Pre-defined collection of creative, hilarious, and party-friendly prompts in Spanish
const PROMPTS_DATABASE = [
  "Lo peor que puedes decir al conocer a tus suegros por primera vez.",
  "Un nombre terrible para un restaurante de sushi barato.",
  "El superpoder más inútil y ridículo que puedas imaginar.",
  "Una excusa muy sospechosa para llegar 3 horas tarde al trabajo.",
  "Lo que realmente piensan los gatos cuando te miran fijamente.",
  "El peor regalo de San Valentín que alguien podría recibir.",
  "El título de la autobiografía de alguien que siempre toma malas decisiones.",
  "Una señal inequívoca de que tu vecino es en realidad un alienígena.",
  "Un eslogan pésimo para una funeraria.",
  "Lo primero que diría un perro si de repente pudiera hablar.",
  "La peor frase para romper el hielo en una primera cita.",
  "Un ingrediente secreto que arruinaría cualquier pizza al instante.",
  "El nombre de una banda de rock formada exclusivamente por abuelos.",
  "Una regla absurda que implementarías si fueras el rey del mundo.",
  "Lo que jamás deberías gritar en una biblioteca llena de gente.",
  "La peor búsqueda en el historial de Google de un médico cirujano.",
  "El peor consejo financiero que podrías darle a tu mejor amigo.",
  "Una razón surrealista por la que la policía te detendría a las 3 AM.",
  "El peor nombre para una colonia o perfume de lujo.",
  "Lo que dice tu refrigerador cuando lo abres por quinta vez en la noche.",
  "El título de una película de terror donde el monstruo es una verdura.",
  "La peor mentira que puedes decir en tu currículum vitae.",
  "Un invento moderno que nadie pidió pero que alguien vendería por televisión.",
  "Lo peor que puedes susurrarle al oído a un desconocido en un ascensor.",
  "El castigo más creativo para los que no lavan los platos en casa.",
  "Un eslogan honesto para una red social adictiva.",
  "La pregunta más incómoda para hacer durante la cena de Navidad.",
  "El peor nombre para una aerolínea de bajo costo.",
  "Algo que nunca esperarías encontrar dentro de una piñata.",
  "El peor mensaje que puedes recibir por error de tu jefe.",
  "Una señal de que estás envejeciendo más rápido de lo que creías.",
  "Lo más ridículo por lo que dos adultos han discutido a gritos.",
  "El nombre de una telenovela basada en tu grupo de amigos.",
  "Una advertencia que debería venir grabada en los teléfonos inteligentes.",
  "Lo que sueñan las plantas carnívoras.",
  "La peor excusa para no devolver dinero que te prestaron.",
  "El tema de conversación más peligroso para un grupo de WhatsApp familiar.",
  "Un objeto cotidiano que se volvería aterrador si cobrara vida.",
  "El peor eslogan para una pasta dental.",
  "Una pésima idea de negocio para presentar en Shark Tank.",
  "Lo que jamás deberías poner de foto de perfil en LinkedIn.",
  "La razón más tonta para ser despedido el primer día de trabajo.",
  "Un fetiche tan extraño que los extraterrestres decidirían no invadirnos.",
  "El peor tatuaje que te podrías hacer después de una noche de fiesta.",
  "Lo que un fantasma perezoso haría para asustar en una casa embrujada.",
  "Una señal de que tu cita por internet usó fotos de hace 15 años.",
  "El peor souvenir que puedes traerle a tu familia de vacaciones.",
  "La frase más dramática para anunciar que se acabó el papel higiénico.",
  "Un secreto inconfesable que guardaría tu horno microondas.",
  "El nombre de un videojuego donde el objetivo es no hacer nada."
];

export class DueloOcurrencias {
  /**
   * @param {Object} room Reference to the parent room object
   * @param {Function} onStateChange Callback invoked when the game state changes
   * @param {Function} onTimerTick Callback invoked on lightweight timer ticks
   */
  constructor(room, onStateChange, onTimerTick) {
    this.room = room;
    this.onStateChange = onStateChange;
    this.onTimerTick = onTimerTick;

    this.id = 'duelo-ocurrencias';
    this.title = 'Duelo de Ocurrencias';
    this.description = '¡Compite cara a cara con tus ocurrencias más ingeniosas, vota por las mejores y déjate juzgar por la IA!';

    // Configuration from Game Rules
    this.totalRounds = DUELO_OCURRENCIAS_CONFIG.totalRounds;
    this.answeringTimeSeconds = DUELO_OCURRENCIAS_CONFIG.timers.answeringBase;
    this.votingTimeSeconds = DUELO_OCURRENCIAS_CONFIG.timers.votingBase;
    this.aiJudgingTimeSeconds = DUELO_OCURRENCIAS_CONFIG.timers.aiJudging;
    this.roundResultsTimeSeconds = DUELO_OCURRENCIAS_CONFIG.timers.roundResults;

    // Game state machine
    this.phase = 'INTRO'; // 'INTRO' | 'ANSWERING' | 'VOTING' | 'AI_JUDGING' | 'ROUND_RESULTS' | 'PODIUM'
    this.currentRound = 1;
    this.timer = 0;
    this.timerInterval = null;

    // Prompts and Duels for current round
    this.usedPromptIndices = new Set();
    this.duels = []; // Array of Duel objects
    this.currentDuelIndex = 0;

    // Scores summary tracking for the round
    this.roundScoreDeltas = new Map(); // socketId -> points earned this round

    // Active AI evaluation state
    this.currentAiVerdict = null;

    console.log(`[DueloOcurrencias] Initialized for room ${room.code}`);
  }

  /**
   * Starts the game from the LOBBY state.
   */
  start() {
    this.room.status = 'IN_GAME';
    this.currentRound = 1;
    this.usedPromptIndices.clear();

    // Reset all player scores
    for (const player of this.room.players.values()) {
      player.score = 0;
    }

    this.startHowToPlayPhase();
  }

  /**
   * HOW_TO_PLAY Phase: Shows the 3 Golden Rules, Objective, Mobile controls and Points Economy.
   */
  startHowToPlayPhase() {
    this.phase = 'HOW_TO_PLAY';
    const tutorial = getTutorial('duelo-ocurrencias');
    this.timer = tutorial ? tutorial.durationSeconds : 14;
    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      this.startAnsweringPhase();
    });
  }

  /**
   * INTRO Phase: Shows intro screen on Host before jumping into prompt answering.
   */
  startIntroPhase() {
    this.startHowToPlayPhase();
  }

  /**
   * Fetches fresh, unused prompts from the database.
   * @param {number} count 
   * @returns {string[]}
   */
  getFreshPrompts(count) {
    const audience = this.room?.audience || 'amigos';
    return getPromptsByAudience(audience, count);
  }

  /**
   * ANSWERING Phase:
   * Prompts are paired up into duels in a circular fashion.
   * Player i and Player (i+1)%N share prompt i.
   * Therefore, every player gets 2 prompts, and every prompt is a 1v1 duel!
   */
  startAnsweringPhase() {
    this.phase = 'ANSWERING';
    this.clearCountdown();
    this.answeredPlayers = new Set();

    const players = Array.from(this.room.players.values()).filter(p => p.connected);
    const n = players.length;

    if (n < 3) {
      console.warn(`[DueloOcurrencias] Less than 3 players in room ${this.room.code}, cannot proceed standard duel.`);
    }

    // Pick N unique prompts for N duels
    const promptTexts = this.getFreshPrompts(n);
    this.duels = [];

    // Create N circular duels
    for (let i = 0; i < n; i++) {
      const player1 = players[i];
      const player2 = players[(i + 1) % n];

      const duelId = `duel_${this.currentRound}_${i}`;
      this.duels.push({
        id: duelId,
        promptText: promptTexts[i],
        player1Id: player1.id,
        player1Name: player1.name,
        player2Id: player2.id,
        player2Name: player2.name,
        // Player submissions
        answer1: '',
        answer2: '',
        // Voting & results
        // When presenting in VOTING phase, answers are randomly assigned to Option A or B
        displayA: null, // { answerText, playerId, votes: number }
        displayB: null, // { answerText, playerId, votes: number }
        votes: new Map(), // voterSocketId -> 'A' | 'B'
        aiJudgement: null
      });
    }

    this.roundScoreDeltas.clear();
    for (const p of players) {
      this.roundScoreDeltas.set(p.id, 0);
    }

    this.timer = this.answeringTimeSeconds;
    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      this.finishAnsweringPhase();
    });
  }

  /**
   * Handles player submitting their answers from mobile.
   * @param {string} socketId 
   * @param {Object<string, string>} answers Object with { [duelId]: answerText }
   */
  submitAnswers(socketId, answers) {
    if (this.phase !== 'ANSWERING') return { success: false, error: 'No es la fase de respuestas.' };
    if (!answers || typeof answers !== 'object') return { success: false, error: 'Respuestas inválidas.' };

    if (!this.answeredPlayers) {
      this.answeredPlayers = new Set();
    }
    if (this.answeredPlayers.has(socketId)) {
      return { success: true, message: 'Respuestas ya recibidas.' };
    }

    for (const duel of this.duels) {
      if (answers[duel.id]) {
        const text = String(answers[duel.id]).trim().slice(0, 120);
        if (duel.player1Id === socketId) {
          duel.answer1 = text;
        } else if (duel.player2Id === socketId) {
          duel.answer2 = text;
        }
      }
    }

    this.answeredPlayers.add(socketId);
    console.log(`[DueloOcurrencias] Player ${socketId} submitted answers.`);
    this.notifyStateChange();

    // Check if ALL active players have answered all their assigned prompts
    if (this.haveAllPlayersAnswered()) {
      console.log(`[DueloOcurrencias] All players submitted answers early! Advancing to voting.`);
      this.clearCountdown();
      this.finishAnsweringPhase();
    }

    return { success: true };
  }

  /**
   * Checks whether all connected players have submitted their responses.
   * @returns {boolean}
   */
  haveAllPlayersAnswered() {
    for (const duel of this.duels) {
      const p1Connected = this.room.players.get(duel.player1Id)?.connected;
      const p2Connected = this.room.players.get(duel.player2Id)?.connected;

      if (p1Connected && !duel.answer1) return false;
      if (p2Connected && !duel.answer2) return false;
    }
    return true;
  }

  /**
   * Ends ANSWERING phase and starts VOTING for the first duel.
   */
  finishAnsweringPhase() {
    this.clearCountdown();
    this.currentDuelIndex = 0;
    this.startVotingForCurrentDuel();
  }

  /**
   * Prepares and starts the VOTING phase for this.duels[this.currentDuelIndex].
   */
  startVotingForCurrentDuel() {
    this.phase = 'VOTING';
    this.currentAiVerdict = null;

    const duel = this.duels[this.currentDuelIndex];
    if (!duel) {
      // All duels done, go to ROUND_RESULTS
      this.startRoundResultsPhase();
      return;
    }

    // Default answers if someone left it blank
    const ans1 = duel.answer1 || '... (se quedó sin palabras)';
    const ans2 = duel.answer2 || '... (no se le ocurrió nada)';

    // Randomize Option A vs Option B presentation so players can't guess by position
    const flip = Math.random() > 0.5;
    duel.displayA = {
      text: flip ? ans1 : ans2,
      authorId: flip ? duel.player1Id : duel.player2Id,
      authorName: flip ? duel.player1Name : duel.player2Name,
      votesCount: 0
    };
    duel.displayB = {
      text: flip ? ans2 : ans1,
      authorId: flip ? duel.player2Id : duel.player1Id,
      authorName: flip ? duel.player2Name : duel.player1Name,
      votesCount: 0
    };
    duel.votes.clear();

    this.timer = this.votingTimeSeconds;
    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      this.finishVotingForCurrentDuel();
    });
  }

  /**
   * Handles player voting for Option A or B.
   * @param {string} voterSocketId 
   * @param {string} duelId 
   * @param {'A'|'B'} choice 
   */
  submitVote(voterSocketId, duelId, choice) {
    if (this.phase !== 'VOTING') return { success: false, error: 'No es la fase de votación.' };
    const duel = this.duels[this.currentDuelIndex];
    if (!duel || duel.id !== duelId) return { success: false, error: 'Duelo no válido.' };

    // Duelists cannot vote in their own duel!
    if (voterSocketId === duel.player1Id || voterSocketId === duel.player2Id) {
      return { success: false, error: 'No puedes votar en tu propio duelo.' };
    }

    if (choice !== 'A' && choice !== 'B') {
      return { success: false, error: 'Elección de voto inválida (debe ser A o B).' };
    }

    if (duel.votes.has(voterSocketId)) {
      return { success: true, message: 'Voto ya registrado.' };
    }

    duel.votes.set(voterSocketId, choice);
    console.log(`[DueloOcurrencias] Player ${voterSocketId} voted for Option ${choice} in duel ${duelId}`);

    this.notifyStateChange();

    // Check if all eligible voters have voted
    if (this.haveAllEligibleVoted(duel)) {
      console.log(`[DueloOcurrencias] All eligible voters voted early! Proceeding to AI judging.`);
      this.clearCountdown();
      this.finishVotingForCurrentDuel();
    }

    return { success: true };
  }

  /**
   * Checks whether all eligible (non-duelist) connected players voted.
   * @param {Object} duel 
   * @returns {boolean}
   */
  haveAllEligibleVoted(duel) {
    const eligiblePlayers = Array.from(this.room.players.values()).filter(
      p => p.connected && p.id !== duel.player1Id && p.id !== duel.player2Id
    );
    return eligiblePlayers.every(p => duel.votes.has(p.id));
  }

  /**
   * Completes the voting countdown and transitions into AI_JUDGING.
   */
  async finishVotingForCurrentDuel() {
    this.clearCountdown();
    this.phase = 'AI_JUDGING';

    const duel = this.duels[this.currentDuelIndex];
    if (!duel) {
      this.startRoundResultsPhase();
      return;
    }

    // Count player votes
    let countA = 0;
    let countB = 0;
    for (const choice of duel.votes.values()) {
      if (choice === 'A') countA++;
      if (choice === 'B') countB++;
    }
    duel.displayA.votesCount = countA;
    duel.displayB.votesCount = countB;

    // Calculate score points using formal game rules
    const pointsMultiplier = DUELO_OCURRENCIAS_CONFIG.scoring.roundMultipliers[this.currentRound] || 1;
    const pointsPerVote = DUELO_OCURRENCIAS_CONFIG.scoring.pointsPerVote * pointsMultiplier;

    let ptsA = countA * pointsPerVote;
    let ptsB = countB * pointsPerVote;

    // Baseline response reward: if you wrote an answer, you get 150 pts baseline
    if (duel.answer1 && duel.answer1 !== '... (se quedó sin palabras)') {
      ptsA += Math.round(150 * pointsMultiplier);
    }
    if (duel.answer2 && duel.answer2 !== '... (no se le ocurrió nada)') {
      ptsB += Math.round(150 * pointsMultiplier);
    }

    // "¡Paliza!" (Quiplash/Unanimous Bonus)
    // If one gets 100% of votes and at least 2 people voted
    const totalVotes = countA + countB;
    let isSweepA = false;
    let isSweepB = false;
    if (totalVotes >= 2) {
      if (countA === totalVotes) {
        ptsA += DUELO_OCURRENCIAS_CONFIG.scoring.sweepBonus * pointsMultiplier;
        isSweepA = true;
      } else if (countB === totalVotes) {
        ptsB += DUELO_OCURRENCIAS_CONFIG.scoring.sweepBonus * pointsMultiplier;
        isSweepB = true;
      }
    } else if (totalVotes === 0) {
      // If nobody voted, award 100 courtesy points to both dueling writers
      ptsA += Math.round(100 * pointsMultiplier);
      ptsB += Math.round(100 * pointsMultiplier);
    }

    // Award player points
    const playerA = this.room.players.get(duel.displayA.authorId);
    const playerB = this.room.players.get(duel.displayB.authorId);

    if (playerA) {
      playerA.score += ptsA;
      this.roundScoreDeltas.set(playerA.id, (this.roundScoreDeltas.get(playerA.id) || 0) + ptsA);
    }
    if (playerB) {
      playerB.score += ptsB;
      this.roundScoreDeltas.set(playerB.id, (this.roundScoreDeltas.get(playerB.id) || 0) + ptsB);
    }

    // Notify state so Host screen immediately shows vote counts and author reveals
    this.notifyStateChange();

    // Call Ollama AI Host to judge the duel
    console.log(`[DueloOcurrencias] Requesting AI judgment for duel: "${duel.promptText}"`);
    try {
      const aiVerdict = await judgeDuel(
        duel.promptText,
        duel.displayA.text,
        duel.displayA.authorName,
        duel.displayB.text,
        duel.displayB.authorName,
        this.room?.hostPersonality || 'FIESTA_PICANTE'
      );

      // Award AI bonus points
      const aiBonus = (aiVerdict.bonusPoints || DUELO_OCURRENCIAS_CONFIG.scoring.aiCriticBonus) * pointsMultiplier;
      if (aiVerdict.winner === 'A' && playerA) {
        playerA.score += aiBonus;
        this.roundScoreDeltas.set(playerA.id, (this.roundScoreDeltas.get(playerA.id) || 0) + aiBonus);
      } else if (aiVerdict.winner === 'B' && playerB) {
        playerB.score += aiBonus;
        this.roundScoreDeltas.set(playerB.id, (this.roundScoreDeltas.get(playerB.id) || 0) + aiBonus);
      }

      this.currentAiVerdict = {
        ...aiVerdict,
        aiBonus,
        isSweepA,
        isSweepB
      };
      duel.aiJudgement = this.currentAiVerdict;
    } catch (err) {
      console.error('[DueloOcurrencias] AI judgment failed:', err);
      const fallbackBonus = Math.round(DUELO_OCURRENCIAS_CONFIG.scoring.aiCriticBonus * pointsMultiplier);
      const chosenWinner = (countB > countA) ? 'B' : 'A';
      if (chosenWinner === 'A' && playerA) {
        playerA.score += fallbackBonus;
        this.roundScoreDeltas.set(playerA.id, (this.roundScoreDeltas.get(playerA.id) || 0) + fallbackBonus);
      } else if (chosenWinner === 'B' && playerB) {
        playerB.score += fallbackBonus;
        this.roundScoreDeltas.set(playerB.id, (this.roundScoreDeltas.get(playerB.id) || 0) + fallbackBonus);
      }

      this.currentAiVerdict = {
        winner: chosenWinner,
        commentary: '¡Vaya ingenio callejero! El Anfitrión IA premia la chispa de esta respuesta.',
        bonusPoints: fallbackBonus,
        source: 'fallback',
        aiBonus: fallbackBonus,
        isSweepA,
        isSweepB
      };
      duel.aiJudgement = this.currentAiVerdict;
    }

    // Display AI judgment and author reveal for a few seconds
    this.timer = this.aiJudgingTimeSeconds;
    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      // Advance to next duel or finish round
      this.currentDuelIndex++;
      if (this.currentDuelIndex < this.duels.length) {
        this.startVotingForCurrentDuel();
      } else {
        this.startRoundResultsPhase();
      }
    });
  }

  /**
   * ROUND_RESULTS Phase: Shows round leaderboard and points breakdown on Host.
   */
  startRoundResultsPhase() {
    this.phase = 'ROUND_RESULTS';
    this.clearCountdown();
    this.currentAiVerdict = null;

    this.timer = this.roundResultsTimeSeconds;
    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      if (this.currentRound < this.totalRounds) {
        // Next round
        this.currentRound++;
        console.log(`[DueloOcurrencias] Starting Round ${this.currentRound} (DOUBLE POINTS!)`);
        this.startAnsweringPhase();
      } else {
        // Final podium
        this.startPodiumPhase();
      }
    });
  }

  /**
   * PODIUM Phase: Final celebratory reveal of winners.
   */
  startPodiumPhase() {
    this.phase = 'PODIUM';
    this.clearCountdown();
    this.timer = 0;
    this.room.status = 'FINISHED';

    console.log(`[DueloOcurrencias] Game concluded for room ${this.room.code}. Showing podium!`);
    this.notifyStateChange();
  }

  /**
   * Allows the Host to skip current timer or advance phase immediately.
   */
  skipTimer() {
    if (this.timerInterval) {
      this.clearCountdown();
      if (this.phase === 'HOW_TO_PLAY' || this.phase === 'INTRO') {
        this.startAnsweringPhase();
      } else if (this.phase === 'ANSWERING') {
        this.finishAnsweringPhase();
      } else if (this.phase === 'VOTING') {
        this.finishVotingForCurrentDuel();
      } else if (this.phase === 'AI_JUDGING') {
        this.currentDuelIndex++;
        if (this.currentDuelIndex < this.duels.length) {
          this.startVotingForCurrentDuel();
        } else {
          this.startRoundResultsPhase();
        }
      } else if (this.phase === 'ROUND_RESULTS') {
        if (this.currentRound < this.totalRounds) {
          this.currentRound++;
          this.startAnsweringPhase();
        } else {
          this.startPodiumPhase();
        }
      }
    }
  }

  /**
   * Restarts the game to Lobby mode.
   */
  restartToLobby() {
    this.clearCountdown();
    this.phase = 'INTRO';
    this.room.status = 'LOBBY';
    this.room.currentGame = null;
    for (const p of this.room.players.values()) {
      p.score = 0;
    }
    this.notifyStateChange();
  }

  /**
   * Handle player disconnect during game.
   */
  handlePlayerDisconnect(socketId) {
    console.log(`[DueloOcurrencias] Player ${socketId} disconnected during ${this.phase}`);
    // If during answering and everyone else finished, check if we should finish answering
    if (this.phase === 'ANSWERING' && this.haveAllPlayersAnswered()) {
      this.clearCountdown();
      this.finishAnsweringPhase();
    }
    // If during voting and all other eligible voted, finish voting
    if (this.phase === 'VOTING') {
      const duel = this.duels[this.currentDuelIndex];
      if (duel && this.haveAllEligibleVoted(duel)) {
        this.clearCountdown();
        this.finishVotingForCurrentDuel();
      }
    }
  }

  /**
   * Handle player reconnection during game.
   */
  handlePlayerReconnect(oldSocketId, newSocketId) {
    console.log(`[DueloOcurrencias] Remapping player ${oldSocketId} to ${newSocketId}`);
    for (const duel of this.duels) {
      if (duel.player1Id === oldSocketId) duel.player1Id = newSocketId;
      if (duel.player2Id === oldSocketId) duel.player2Id = newSocketId;
      if (duel.displayA && duel.displayA.authorId === oldSocketId) duel.displayA.authorId = newSocketId;
      if (duel.displayB && duel.displayB.authorId === oldSocketId) duel.displayB.authorId = newSocketId;
      if (duel.votes && duel.votes.has(oldSocketId)) {
        const choice = duel.votes.get(oldSocketId);
        duel.votes.delete(oldSocketId);
        duel.votes.set(newSocketId, choice);
      }
    }
    if (this.roundScoreDeltas.has(oldSocketId)) {
      const delta = this.roundScoreDeltas.get(oldSocketId);
      this.roundScoreDeltas.delete(oldSocketId);
      this.roundScoreDeltas.set(newSocketId, delta);
    }
  }

  /**
   * Internal timer helper
   */
  startCountdown(seconds, onComplete) {
    this.clearCountdown();
    this.timer = seconds;

    this.timerInterval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        this.clearCountdown();
        if (typeof onComplete === 'function') {
          onComplete();
        }
      } else {
        // Send lightweight timer tick (prevents resetting mobile input fields)
        this.notifyTimerTick();
      }
    }, 1000);
  }

  clearCountdown() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  destroy() {
    this.clearCountdown();
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

  /**
   * PUBLIC STATE for Host Screen:
   * Shows everything needed for the TV screen without leaking secret unsubmitted text.
   */
  getPublicState() {
    const sortedPlayers = Array.from(this.room.players.values())
      .map(p => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        score: p.score,
        roundDelta: this.roundScoreDeltas.get(p.id) || 0,
        connected: p.connected,
        // Status indicators
        hasAnswered: this.phase === 'ANSWERING' ? this.hasPlayerAnsweredAll(p.id) : null,
        hasVoted: this.phase === 'VOTING' && this.duels[this.currentDuelIndex]
          ? this.duels[this.currentDuelIndex].votes.has(p.id)
          : null
      }))
      .sort((a, b) => b.score - a.score);

    // Current duel info
    let duelPublicInfo = null;
    if (this.phase === 'VOTING' || this.phase === 'AI_JUDGING') {
      const duel = this.duels[this.currentDuelIndex];
      if (duel) {
        const isReveal = this.phase === 'AI_JUDGING';
        duelPublicInfo = {
          duelIndex: this.currentDuelIndex + 1,
          totalDuels: this.duels.length,
          promptText: duel.promptText,
          // Hide author names during voting; reveal during AI_JUDGING
          optionA: {
            text: duel.displayA.text,
            authorName: isReveal ? duel.displayA.authorName : '???',
            votesCount: isReveal ? duel.displayA.votesCount : null
          },
          optionB: {
            text: duel.displayB.text,
            authorName: isReveal ? duel.displayB.authorName : '???',
            votesCount: isReveal ? duel.displayB.votesCount : null
          },
          aiJudgement: isReveal ? this.currentAiVerdict : null
        };
      }
    }

    return {
      gameId: this.id,
      gameTitle: this.title,
      phase: this.phase,
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      isDoublePoints: this.currentRound === 2,
      timer: this.timer,
      leaderboard: sortedPlayers,
      currentDuel: duelPublicInfo,
      howToPlay: getTutorial('duelo-ocurrencias'),
      cta: getMobileCTA(this.id, this.phase, {}),
      podium: this.phase === 'PODIUM' ? sortedPlayers.slice(0, 3) : null
    };
  }

  /**
   * Checks if player answered all assigned prompts
   */
  hasPlayerAnsweredAll(socketId) {
    for (const duel of this.duels) {
      if (duel.player1Id === socketId && !duel.answer1) return false;
      if (duel.player2Id === socketId && !duel.answer2) return false;
    }
    return true;
  }

  /**
   * PRIVATE STATE for mobile phone controller:
   * Only what this specific player is allowed to see and interact with.
   */
  getPrivateState(socketId) {
    const player = this.room.players.get(socketId);
    if (!player) return null;

    let privatePhaseData = {};

    if (this.phase === 'ANSWERING') {
      // Find the prompts assigned to this player
      const assignedPrompts = [];
      for (const duel of this.duels) {
        if (duel.player1Id === socketId) {
          assignedPrompts.push({
            duelId: duel.id,
            promptText: duel.promptText,
            currentAnswer: duel.answer1 || ''
          });
        } else if (duel.player2Id === socketId) {
          assignedPrompts.push({
            duelId: duel.id,
            promptText: duel.promptText,
            currentAnswer: duel.answer2 || ''
          });
        }
      }
      privatePhaseData = {
        prompts: assignedPrompts,
        allSubmitted: this.hasPlayerAnsweredAll(socketId)
      };
    } else if (this.phase === 'VOTING') {
      const duel = this.duels[this.currentDuelIndex];
      if (duel) {
        const isDuelist = (duel.player1Id === socketId || duel.player2Id === socketId);
        privatePhaseData = {
          duelId: duel.id,
          promptText: duel.promptText,
          isDuelist,
          hasVoted: duel.votes.has(socketId),
          myVote: duel.votes.get(socketId) || null,
          // If not duelist, show the choices
          options: !isDuelist ? {
            A: duel.displayA.text,
            B: duel.displayB.text
          } : null
        };
      }
    } else if (this.phase === 'AI_JUDGING') {
      const duel = this.duels[this.currentDuelIndex];
      if (duel) {
        const isDuelist = (duel.player1Id === socketId || duel.player2Id === socketId);
        privatePhaseData = {
          isDuelist,
          aiVerdict: this.currentAiVerdict,
          myRoundScore: player.score
        };
      }
    } else if (this.phase === 'ROUND_RESULTS') {
      privatePhaseData = {
        roundDelta: this.roundScoreDeltas.get(socketId) || 0,
        totalScore: player.score
      };
    } else if (this.phase === 'PODIUM') {
      // Rank calculation
      const ranked = Array.from(this.room.players.values())
        .sort((a, b) => b.score - a.score);
      const myRank = ranked.findIndex(p => p.id === socketId) + 1;
      privatePhaseData = {
        rank: myRank,
        totalScore: player.score,
        isWinner: myRank === 1
      };
    }

    const isDuelist = (this.phase === 'VOTING' || this.phase === 'AI_JUDGING') &&
      this.duels[this.currentDuelIndex] &&
      (this.duels[this.currentDuelIndex].player1Id === socketId || this.duels[this.currentDuelIndex].player2Id === socketId);

    const hasVoted = this.phase === 'VOTING' &&
      this.duels[this.currentDuelIndex] &&
      this.duels[this.currentDuelIndex].votes.has(socketId);

    const cta = getMobileCTA(this.id, this.phase, {
      hasSubmitted: this.hasPlayerAnsweredAll(socketId),
      isDuelist,
      hasVoted
    });

    return {
      gameId: this.id,
      phase: this.phase,
      timer: this.timer,
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      cta,
      ...privatePhaseData
    };
  }
}
