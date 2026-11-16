/**
 * Game Module: Dilemas Extremos
 * Social consensus, controversial choices and AI psychological roast for 3 to 12 players.
 * 
 * Mechanics:
 * 1. DILEMMA_INTRO: The host displays an absurd, polarizing moral/humorous dilemma.
 * 2. CHOICE_AND_PREDICTION:
 *    - Each player chooses Option A or Option B on their phone.
 *    - Each player also bets on what the GROUP MAJORITY will pick.
 * 3. REVEAL_METER:
 *    - The Host TV reveals the vote split (percentages, who voted what).
 *    - The AI Host roasts the group's moral bankruptcy or unanimous weirdness.
 * 4. ROUND_RESULTS:
 *    - Points awarded for Majority Prediction (+200), Lone Wolf (+350), or Golden Split 50/50 (+250).
 * 5. PODIUM:
 *    - Champion is crowned.
 */

import { DILEMAS_EXTREMOS_CONFIG, getTutorial, getMobileCTA, calculateDynamicRounds } from '../rules/gameRulesConfig.js';
import { judgeDuel } from '../aiHost.js';

export const DILEMAS_DATABASE = {
  familia: [
    {
      id: 'fam_1',
      question: '¿Qué preferirías tener como maldición familiar?',
      optionA: 'Que cada vez que hables suene una bocina de payaso 🤡',
      optionB: 'Tener que caminar hacia atrás a todos lados 🦀'
    },
    {
      id: 'fam_2',
      question: '¿Cuál de estos castigos gastronómicos soportarías por 1 año?',
      optionA: 'Comer pizza fría con piña todos los días 🍕',
      optionB: 'Comer sopa de verduras hirviendo en la playa a 40°C 🍲'
    },
    {
      id: 'fam_3',
      question: '¿Qué superpoder absurdo prefieres en la casa?',
      optionA: 'Hablar con los perros pero que solo se quejen de la comida 🐶',
      optionB: 'Controlar el control remoto con la mente pero cambia solo de canal 📺'
    },
    {
      id: 'fam_4',
      question: '¿Qué secreto familiar preferirías descubrir?',
      optionA: 'Que tu abuela era una espía internacional en su juventud 🕵️‍♀️',
      optionB: 'Que tu papá inventó un paso de baile prohibido en 1985 🕺'
    },
    {
      id: 'fam_5',
      question: '¿Qué castigo doméstico te parece peor?',
      optionA: 'Lavar los platos de 20 personas sin esponja ni jabón 🍽️',
      optionB: 'Limpiar el arenero del gato usando solo palillos chinos 🐱'
    },
    {
      id: 'fam_6',
      question: '¿Qué situación te daría más vergüenza en la escuela/reunión?',
      optionA: 'Que tus papás te lleven mariachis a tu salón de clases 🎺',
      optionB: 'Que tu mamá publique en Facebook tus fotos de bebé desnudo en la tina 👶'
    },
    {
      id: 'fam_7',
      question: 'Si tuvieras que intercambiar de cuerpo por 24 horas con alguien:',
      optionA: 'Con tu mascota (y comer croquetas) 🐕',
      optionB: 'Con el miembro más enojón de tu familia 😠'
    },
    {
      id: 'fam_8',
      question: '¿Qué preferirías que fuera obligatorio por ley familiar?',
      optionA: 'Hacer una coreografía grupal cada vez que alguien entra a la casa 💃',
      optionB: 'Hablar en rima durante toda la comida del domingo 📜'
    }
  ],
  amigos: [
    {
      id: 'amg_1',
      question: '¿Qué pesadilla social te asusta menos vivir un sábado por la noche?',
      optionA: 'Que lean en voz alta en una fiesta tus chats de WhatsApp de las 3 AM 📱',
      optionB: 'Tener que pagar la cuenta entera de una mesa de 12 desconocidos 💸'
    },
    {
      id: 'amg_2',
      question: '¿Cuál de estas dos desgracias prefieres por los próximos 6 meses?',
      optionA: 'Saludar con un beso apasionado en la mejilla a tu jefe cada mañana 💋',
      optionB: 'Que tu historial de búsqueda de Google se publique automáticamente en Instagram 😱'
    },
    {
      id: 'amg_3',
      question: '¿Cómo preferirías sobrevivir a un apocalipsis zombie con tus amigos?',
      optionA: 'Sacrificar al más lento del grupo para salvar al resto 🧟‍♂️',
      optionB: 'Quedarte a pelear con un tenedor de plástico y morir con honor 🍴'
    },
    {
      id: 'amg_4',
      question: '¿Qué secreto oscuro preferirías confesarle a tus amigos ahora mismo?',
      optionA: 'Cuál de los presentes te cae un poco mal en secreto 🤫',
      optionB: 'La mentira más vergonzosa que has dicho para no salir a una fiesta 🛌'
    },
    {
      id: 'amg_5',
      question: '¿Qué humillación preferirías sufrir en el trabajo?',
      optionA: 'Que se te escape un gas ruidoso en plena presentación con el director general 💨',
      optionB: 'Mandar un meme ultra picante al grupo oficial de toda la empresa 🤦‍♂️'
    },
    {
      id: 'amg_6',
      question: 'Por $10,000 dólares en efectivo:',
      optionA: 'Caminar 3 cuadras por tu vecindario vestido solo con pañal de adulto 🧷',
      optionB: 'Dejar que el grupo de amigos elija tu foto de perfil de LinkedIn por 1 año 📸'
    },
    {
      id: 'amg_7',
      question: '¿Qué tortura corporal preferirías padecer de fiesta?',
      optionA: 'Tener hipo incontrolable cada vez que te acerques a alguien que te gusta 😳',
      optionB: 'Tener que bailar cumbia frenética cada vez que alguien diga la palabra "Hola" 🪗'
    },
    {
      id: 'amg_8',
      question: 'Si solo pudieras salvar a uno en una isla desierta:',
      optionA: 'Al amigo más inteligente pero que no para de criticarte 🧠',
      optionB: 'Al amigo más chistoso pero que no sabe hacer ni una fogata 🤡'
    },
    {
      id: 'amg_9',
      question: '¿Cuál de estas dos verdades preferirías saber?',
      optionA: 'Qué opinan tus amigos de ti cuando te levantas al baño 🚪',
      optionB: 'Cuántas veces tus amigos te han mentido para cancelar planes juntos 📅'
    },
    {
      id: 'amg_10',
      question: '¿Qué castigo preferirías cumplir si pierdes una apuesta?',
      optionA: 'Comer una cucharada de canela en polvo pura 🥄',
      optionB: 'Cantar el himno nacional a todo pulmón en el transporte público 🎤'
    }
  ],
  parejas: [
    {
      id: 'par_1',
      question: '¿Qué preferirías saber sobre tu pareja?',
      optionA: 'Saber exactamente qué piensa de tu comida cada vez que cocinas 🍳',
      optionB: 'Saber todas las mentiras piadosas que te ha dicho este año 🤥'
    },
    {
      id: 'par_2',
      question: '¿Qué convivencia extrema tolerarías mejor por 1 año entero?',
      optionA: 'Vivir en la misma casa con tus suegros sin puertas 🚪',
      optionB: 'Vivir solos pero sin WiFi, sin Netflix y sin delivery 📵'
    },
    {
      id: 'par_3',
      question: '¿Qué regalo de aniversario sería más peligroso recibir?',
      optionA: 'Una aspiradora último modelo con moño rojo 🧹',
      optionB: 'Un peluche gigante que dice "Te amo" con la voz de su ex 🧸'
    },
    {
      id: 'par_4',
      question: '¿Qué sacrificio harías por amor?',
      optionA: 'Dejar que tu pareja elija toda tu ropa para el resto de tu vida 👗',
      optionB: 'Tener que ver su reality show favorito todos los días por 2 horas 📺'
    },
    {
      id: 'par_5',
      question: '¿Qué drama preferirías evitar a toda costa?',
      optionA: 'Que tu pareja descubra cuánto dinero gastas en tonterías en internet 💳',
      optionB: 'Que tu pareja lea los mensajes que te mandabas con tu ex hace 5 años 💬'
    },
    {
      id: 'par_6',
      question: '¿Cuál de estos hábitos de pareja toleras menos?',
      optionA: 'Que te robe las papas fritas después de jurar que no tenía hambre 🍟',
      optionB: 'Que se adelante 3 capítulos de tu serie favorita a escondidas 🎬'
    },
    {
      id: 'par_7',
      question: '¿Qué situación comprometedora prefieres vivir en una boda?',
      optionA: 'Atrapar el ramo/liga frente a toda la familia y que tu pareja se desmaye 💐',
      optionB: 'Que tu suegro te invite a bailar una balada romántica mirándote fijamente 🕺'
    },
    {
      id: 'par_8',
      question: '¿Qué dilema de honestidad eliges?',
      optionA: 'Decirle a tu pareja que su nuevo corte de cabello es espantoso 💇‍♂️',
      optionB: 'Fingir que te encanta y vivir con esa mentira para siempre 🤫'
    }
  ],
  cerebritos: [
    {
      id: 'cer_1',
      question: '¿Qué misterio existencial preferirías resolver hoy mismo?',
      optionA: 'Saber con certeza si vivimos dentro de una simulación cósmica 🖥️',
      optionB: 'Saber la fecha exacta en que la IA superará a toda la humanidad 🤖'
    },
    {
      id: 'cer_2',
      question: '¿Qué destino transhumano elegirías?',
      optionA: 'Subir tu mente a una nube cuántica inmortal pero sin sentidos físicos ☁️',
      optionB: 'Vivir 120 años como un humano ordinario con dolores de espalda 🧬'
    },
    {
      id: 'cer_3',
      question: '¿Qué verdad sobre el Universo te daría más tranquilidad?',
      optionA: 'Descubrir que estamos absolutamente solos en billones de galaxias 🌌',
      optionB: 'Descubrir que la Tierra es solo un experimento de laboratorio alienígena 👽'
    },
    {
      id: 'cer_4',
      question: '¿Qué dilema de máquina autónoma preferirías resolver?',
      optionA: 'Que el coche autónomo salve al peatón imprudente sacrificando al pasajero 🚗',
      optionB: 'Que el coche autónomo proteja siempre a su dueño sin importar las consecuencias 💥'
    },
    {
      id: 'cer_5',
      question: 'Si viajaras en el tiempo al año 1500 con un solo objeto moderno:',
      optionA: 'Un teléfono inteligente cargado con toda la Wikipedia (sin internet) 📱',
      optionB: 'Un botiquín con penicilina, antibióticos y analgésicos 💊'
    },
    {
      id: 'cer_6',
      question: '¿Qué paradoja preferirías experimentar en carne propia?',
      optionA: 'Conocer a tu versión de 80 años y que te diga que arruinaste todo 👴',
      optionB: 'Quedarte atrapado en un bucle temporal de un día aburrido de oficina por 1 año ⏰'
    },
    {
      id: 'cer_7',
      question: '¿Qué cambio en las leyes de la física causaría más risas mundiales?',
      optionA: 'Que la gravedad se reduzca un 70% cada vez que alguien estornude 🚀',
      optionB: 'Que la fricción desaparezca en todas las banquetas y pisos los días viernes ⛸️'
    },
    {
      id: 'cer_8',
      question: '¿Qué superinteligencia artificial preferirías que gobierne el planeta?',
      optionA: 'Una IA fría y calculadora pero 100% incorruptible y eficiente 🤖',
      optionB: 'Una IA con la personalidad bromista y caótica de un comediante de stand-up 🎙️'
    }
  ]
};

export class DilemasExtremos {
  constructor(room, onStateChange, onTimerTick, customRounds = null) {
    this.room = room;
    this.onStateChange = onStateChange;
    this.onTimerTick = onTimerTick;

    this.id = 'dilemas-extremos';
    this.title = 'Dilemas Extremos';
    this.description = 'Decisiones morales absurdas. Elige tu destino, predice qué votará el salón y deja que la IA juzgue tu salud mental.';

    const count = Math.max(2, room.players.size || 2);
    const dynamicPacing = calculateDynamicRounds('dilemas-extremos', count);
    this.totalRounds = customRounds || dynamicPacing.rounds;
    this.currentRound = 1;
    this.phase = 'INTRO'; // INTRO | CHOICE | REVEAL | RESULTS | PODIUM
    this.timer = 0;
    this.timerInterval = null;

    this.currentDilemma = null;
    this.playerChoices = new Map(); // socketId -> 'A' | 'B'
    this.playerPredictions = new Map(); // socketId -> 'A' | 'B'
    this.aiCommentary = null;
    this.majorityChoice = null; // 'A' | 'B' | 'TIE'

    console.log(`[DilemasExtremos] Initialized for room ${room.code}`);
  }

  start() {
    this.room.status = 'IN_GAME';
    this.currentRound = 1;
    for (const p of this.room.players.values()) {
      p.score = 0;
    }
    this.startHowToPlayPhase();
  }

  startHowToPlayPhase() {
    this.phase = 'HOW_TO_PLAY';
    const tutorial = getTutorial('dilemas-extremos');
    this.timer = tutorial ? tutorial.durationSeconds : 14;
    this.notifyStateChange();

    this.runCountdown(() => {
      this.startRound();
    });
  }

  startRound() {
    this.playerChoices.clear();
    this.playerPredictions.clear();
    this.aiCommentary = null;
    this.majorityChoice = null;

    const audience = this.room.audience || 'amigos';
    const pool = DILEMAS_DATABASE[audience] || DILEMAS_DATABASE.amigos;
    // Pick dilemma based on round or random
    const dilemmaIndex = (this.currentRound - 1) % pool.length;
    this.currentDilemma = pool[dilemmaIndex] || pool[0];

    console.log(`[DilemasExtremos] Round ${this.currentRound} dilemma: "${this.currentDilemma.question}"`);

    this.phase = 'INTRO';
    this.timer = 7;
    this.notifyStateChange();

    this.runCountdown(() => {
      this.startChoicePhase();
    });
  }

  startChoicePhase() {
    this.phase = 'CHOICE';
    this.timer = 25;
    this.notifyStateChange();

    this.runCountdown(() => {
      this.resolveDilemma();
    });
  }

  handlePlayerChoice(socketId, choice, prediction) {
    if (this.phase !== 'CHOICE') return;
    if (choice !== 'A' && choice !== 'B') return;

    this.playerChoices.set(socketId, choice);
    if (prediction === 'A' || prediction === 'B') {
      this.playerPredictions.set(socketId, prediction);
    }

    const activePlayers = Array.from(this.room.players.values()).filter(p => p.connected);
    // If all active players made their choice, fast-forward
    if (this.playerChoices.size >= activePlayers.length) {
      this.clearCountdown();
      this.resolveDilemma();
    } else {
      this.notifyStateChange();
    }
  }

  async resolveDilemma() {
    this.clearCountdown();
    this.phase = 'REVEAL';

    // Auto-fill choices for players who did not vote
    const activePlayers = Array.from(this.room.players.values()).filter(p => p.connected);
    for (const p of activePlayers) {
      if (!this.playerChoices.has(p.id)) {
        this.playerChoices.set(p.id, Math.random() < 0.5 ? 'A' : 'B');
      }
      if (!this.playerPredictions.has(p.id)) {
        this.playerPredictions.set(p.id, Math.random() < 0.5 ? 'A' : 'B');
      }
    }

    // Count votes for A and B
    let votesA = 0;
    let votesB = 0;
    for (const choice of this.playerChoices.values()) {
      if (choice === 'A') votesA++;
      if (choice === 'B') votesB++;
    }

    if (votesA > votesB) {
      this.majorityChoice = 'A';
    } else if (votesB > votesA) {
      this.majorityChoice = 'B';
    } else {
      this.majorityChoice = 'TIE';
    }

    // AI Commentary
    const winnerOptionText = this.majorityChoice === 'A' 
      ? this.currentDilemma.optionA 
      : (this.majorityChoice === 'B' ? this.currentDilemma.optionB : 'un empate absurdo');

    const promptText = `Dilema del grupo: "${this.currentDilemma.question}" | Opción A: "${this.currentDilemma.optionA}" (${votesA} votos) vs Opción B: "${this.currentDilemma.optionB}" (${votesB} votos). Ganó: ${winnerOptionText}.`;

    try {
      const personality = this.room.hostPersonality || 'FIESTA_PICANTE';
      const aiVerdict = await judgeDuel(
        promptText, 
        `Opción A (${votesA} votos)`, 
        `Opción B (${votesB} votos)`, 
        personality
      );
      this.aiCommentary = aiVerdict?.commentary || '¡Vaya grupo de personas con prioridades tan peculiares!';
    } catch (err) {
      this.aiCommentary = `El grupo ha hablado: ${votesA} contra ${votesB}. ¡Sus almas están en juego!`;
    }

    this.timer = 10;
    this.notifyStateChange();

    this.runCountdown(() => {
      this.applyScoringAndShowResults(votesA, votesB);
    });
  }

  applyScoringAndShowResults(votesA, votesB) {
    this.phase = 'RESULTS';

    // Scoring math
    const majorityBonus = 200;
    const loneWolfBonus = 350;
    const goldenSplitBonus = 250;

    for (const [playerId, choice] of this.playerChoices.entries()) {
      const player = this.room.players.get(playerId);
      if (!player) continue;

      let roundGain = 0;

      // 1. Prediction bonus
      const prediction = this.playerPredictions.get(playerId);
      if (prediction && prediction === this.majorityChoice) {
        roundGain += majorityBonus;
      }

      // 2. Lone Wolf (Oveja Negra) bonus
      if ((choice === 'A' && votesA === 1) || (choice === 'B' && votesB === 1)) {
        roundGain += loneWolfBonus;
      }

      // 3. Golden Split (50/50 exact tie)
      if (this.majorityChoice === 'TIE') {
        roundGain += goldenSplitBonus;
      }

      player.score = (player.score || 0) + roundGain;
      player.lastRoundGain = roundGain;
    }

    this.timer = 9;
    this.notifyStateChange();

    this.runCountdown(() => {
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
      this.startChoicePhase();
    } else if (this.phase === 'CHOICE') {
      this.resolveDilemma();
    } else if (this.phase === 'REVEAL') {
      let vA = 0, vB = 0;
      for (const c of this.playerChoices.values()) {
        if (c === 'A') vA++;
        if (c === 'B') vB++;
      }
      this.applyScoringAndShowResults(vA, vB);
    } else if (this.phase === 'RESULTS') {
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

  runCountdown(onComplete) {
    this.clearCountdown();
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
    let votesA = 0;
    let votesB = 0;
    const playerDetails = [];

    for (const [id, choice] of this.playerChoices.entries()) {
      if (choice === 'A') votesA++;
      if (choice === 'B') votesB++;
      const p = this.room.players.get(id);
      playerDetails.push({
        playerId: id,
        playerName: p?.name,
        avatar: p?.avatar,
        choice: (this.phase === 'REVEAL' || this.phase === 'RESULTS' || this.phase === 'PODIUM') ? choice : null
      });
    }

    const totalVotes = votesA + votesB;
    const percentA = totalVotes > 0 ? Math.round((votesA / totalVotes) * 100) : 50;
    const percentB = totalVotes > 0 ? (100 - percentA) : 50;

    const sortedPlayers = Array.from(this.room.players.values())
      .map(p => ({
        id: p.id,
        name: p.name,
        score: p.score || 0,
        avatar: p.avatar,
        roundDelta: p.lastRoundGain || 0
      }))
      .sort((a, b) => b.score - a.score);

    return {
      gameId: this.id,
      gameTitle: this.title,
      phase: this.phase,
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      timer: this.timer,
      dilemma: this.currentDilemma,
      votesA: (this.phase === 'REVEAL' || this.phase === 'RESULTS' || this.phase === 'PODIUM') ? votesA : 0,
      votesB: (this.phase === 'REVEAL' || this.phase === 'RESULTS' || this.phase === 'PODIUM') ? votesB : 0,
      percentA: (this.phase === 'REVEAL' || this.phase === 'RESULTS' || this.phase === 'PODIUM') ? percentA : 0,
      percentB: (this.phase === 'REVEAL' || this.phase === 'RESULTS' || this.phase === 'PODIUM') ? percentB : 0,
      majorityChoice: (this.phase === 'REVEAL' || this.phase === 'RESULTS' || this.phase === 'PODIUM') ? this.majorityChoice : null,
      aiCommentary: this.aiCommentary,
      howToPlay: getTutorial('dilemas-extremos'),
      cta: getMobileCTA('dilemas-extremos', this.phase, {}),
      players: playerDetails,
      leaderboard: sortedPlayers,
      podium: this.phase === 'PODIUM' ? sortedPlayers.slice(0, 3) : null
    };
  }

  getPrivateState(socketId) {
    const player = this.room.players.get(socketId) || {};
    const hasChosen = this.playerChoices.has(socketId);
    const myChoice = this.playerChoices.get(socketId) || null;
    const myPrediction = this.playerPredictions.get(socketId) || null;

    const sortedPlayers = Array.from(this.room.players.values())
      .map(p => ({
        id: p.id,
        name: p.name,
        score: p.score || 0,
        avatar: p.avatar,
        roundDelta: p.lastRoundGain || 0
      }))
      .sort((a, b) => b.score - a.score);

    const myRank = sortedPlayers.findIndex(p => p.id === socketId) + 1;
    const topScore = sortedPlayers[0]?.score || 0;
    const isTieForFirst = sortedPlayers.length > 1 && sortedPlayers[0].score === sortedPlayers[1].score && topScore > 0;
    const isCoChampion = isTieForFirst && (player.score || 0) === topScore;

    const cta = getMobileCTA('dilemas-extremos', this.phase, {
      hasSubmittedChoice: hasChosen
    });

    return {
      gameId: this.id,
      gameTitle: this.title,
      phase: this.phase,
      currentRound: this.currentRound,
      timer: this.timer,
      dilemma: this.currentDilemma,
      hasChosen,
      myChoice,
      myPrediction,
      cta,
      totalScore: player.score || 0,
      roundDelta: player.lastRoundGain || 0,
      rank: isCoChampion ? 1 : myRank,
      isWinner: myRank === 1 && !isTieForFirst,
      isCoChampion,
      isTie: isTieForFirst
    };
  }
}

