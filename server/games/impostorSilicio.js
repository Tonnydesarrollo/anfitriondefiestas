/**
 * Game Module: El Impostor de Silicio (Social deduction & bluffing game for 3 to 12 players)
 * 
 * Mechanics based on the viral social party game (Spyfall / Undercover):
 * 1. HOW_TO_PLAY: Golden rules and scoring explanation on TV.
 * 2. INTRO: Role distribution.
 *    - Inocentes: see category AND secret word.
 *    - Impostor: sees ONLY category, with a warning to blend in!
 * 3. CLUES_1 (Ronda 1 de Pistas): Everyone writes their 1st short clue.
 * 4. CLUES_REVEAL_1: Clues are revealed on the Host TV one by one. The Impostor gets context!
 * 5. CLUES_2 (Ronda 2 de Pistas): Everyone writes their 2nd clue to deepen the bluff or test suspects.
 * 6. DEBATE: Host TV displays both clues for each player. Open live group debate.
 * 7. VOTING: Players vote on their phone for who they believe is the Impostor.
 * 8. RESOLUTION: Grand dramatic TV Courtroom Reveal!
 *    - Who got the most votes.
 *    - Were they the real Impostor or an innocent scapegoat?
 *    - Secret word revealed to all.
 * 9. ESCAPE: If the Impostor was caught, they get 10 seconds on mobile to guess the secret word from 4 choices to steal the win!
 * 10. RESULTS: Points tallied and updated on the leaderboard.
 * 11. PODIUM: Final winners crowned.
 */

import { IMPOSTOR_SILICIO_CONFIG, getTutorial, getMobileCTA, calculateDynamicRounds } from '../rules/gameRulesConfig.js';
import { judgeDuel } from '../aiHost.js';

export const IMPOSTOR_WORDS_DATABASE = {
  familia: [
    { category: 'Mascotas y Animales', word: 'Delfín', hint: 'Animal marino muy inteligente', decoys: ['Tiburón', 'Ballena', 'Foca', 'Pulpo'] },
    { category: 'Lugares de Vacaciones', word: 'Playa', hint: 'Destino con sol y agua', decoys: ['Montaña', 'Piscina', 'Bosque', 'Campamento'] },
    { category: 'Comida Deliciosa', word: 'Pizza', hint: 'Comida rápida que se comparte en rebanadas', decoys: ['Hamburguesa', 'Tacos', 'Sushi', 'Lasaña'] },
    { category: 'Superpoderes', word: 'Invisibilidad', hint: 'Poder para no ser visto', decoys: ['Volar', 'Telepatía', 'Superfuerza', 'Teletransportación'] },
    { category: 'Objetos de la Escuela', word: 'Mochila', hint: 'Accesorio para cargar útiles', decoys: ['Cuaderno', 'Cartuchera', 'Regla', 'Lonchera'] },
    { category: 'Películas y Cuentos', word: 'Dinosaurio', hint: 'Criatura prehistórica gigante', decoys: ['Dragón', 'Monstruo', 'Alien', 'Mamut'] },
    { category: 'Deportes Populares', word: 'Fútbol', hint: 'Juego con balón y porterías', decoys: ['Básquetbol', 'Tenis', 'Voleibol', 'Béisbol'] },
    { category: 'Postres Clásicos', word: 'Helado', hint: 'Dulce frío de varios sabores', decoys: ['Pastel', 'Gelatina', 'Flan', 'Donas'] },
    { category: 'Medios de Transporte', word: 'Avión', hint: 'Transporte aéreo de pasajeros', decoys: ['Tren', 'Barco', 'Helicóptero', 'Submarino'] },
    { category: 'Profesiones de Respeto', word: 'Bombero', hint: 'Profesión de rescate y emergencia', decoys: ['Policía', 'Médico', 'Piloto', 'Veterinario'] },
    { category: 'Instrumentos Musicales', word: 'Guitarra', hint: 'Instrumento de cuerdas muy común', decoys: ['Piano', 'Batería', 'Violín', 'Trompeta'] },
    { category: 'Ropa y Accesorios', word: 'Pijama', hint: 'Prenda cómoda para descansar', decoys: ['Suéter', 'Bufanda', 'Pantalón', 'Sombrero'] }
  ],
  amigos: [
    { category: 'Noche de Fiesta', word: 'Tequila', hint: 'Bebida alcohólica mexicana fuerte', decoys: ['Cerveza', 'Vodka', 'Whisky', 'Ron'] },
    { category: 'Lugares Prohibidos', word: 'Motel', hint: 'Lugar de hospedaje discreto por horas', decoys: ['Discoteca', 'Bañera', 'Elevador', 'Estacionamiento'] },
    { category: 'Pecados de Resaca', word: 'Comida Chatarra', hint: 'Alimento calórico para calmar la culpa', decoys: ['Dormir 14 horas', 'Llamar al ex', 'Pedir disculpas', 'Tomar caldo'] },
    { category: 'Citas Desastrosas', word: 'Huida por el baño', hint: 'Técnica de escape ante una cita terrible', decoys: ['Olvidar la billetera', 'Hablar de la mamá', 'Eructar en la mesa', 'Quedarse dormido'] },
    { category: 'Cosas que escondes en tu cuarto', word: 'Historial Secreto', hint: 'Registro digital que nadie debe ver', decoys: ['Dinero debajo del colchón', 'Juguete sospechoso', 'Ropa sucia', 'Diario íntimo'] },
    { category: 'Excusas para no salir', word: 'Me siento enfermo', hint: 'Pretexto clásico para quedarse en cama', decoys: ['Tengo mucho trabajo', 'Cena familiar', 'No tengo dinero', 'Se me pinchó la llanta'] },
    { category: 'Momentos Bochornosos', word: 'Tirarse un gas', hint: 'Accidente corporal en el peor momento', decoys: ['Romper el pantalón', 'Caerse en público', 'Saludar a un desconocido', 'Tener comida en los dientes'] },
    { category: 'Redes Sociales Tóxicas', word: 'Stalkear al ex', hint: 'Actividad nocturna de espionaje digital', decoys: ['Subir indirectas', 'Borrar fotos viejas', 'Dejar en visto', 'Mandar capturas equivocadas'] },
    { category: 'Peleas de Cantina', word: 'Romper una botella', hint: 'Acción típica de película de pelea', decoys: ['Tirar la mesa', 'Llamar a seguridad', 'Insultar al árbitro', 'Huir corriendo'] },
    { category: 'Gastos Absurdos', word: 'Compras ebrio en Amazon', hint: 'Gasto impulsivo en la madrugada', decoys: ['Pagar la ronda entera', 'Apostar en el casino', 'Comprar criptomonedas', 'Pedir 5 hamburguesas'] },
    { category: 'Placeres Culposos', word: 'Canciones de reggaetón viejo', hint: 'Música bailable que no admites en público', decoys: ['Telenovelas viejas', 'Comer nutella a cucharadas', 'Ver realities trash', 'Bailar solo frente al espejo'] },
    { category: 'Cosas de Adulto Independiente', word: 'Pagar impuestos', hint: 'Obligación dolorosa que nadie te enseñó', decoys: ['Limpiar el baño', 'Hacer despensa', 'Comprar sartenes caros', 'Elegir lavadora'] }
  ],
  parejas: [
    { category: 'Planes Románticos', word: 'Cena a la luz de las velas', hint: 'Cita clásica elegante y formal', decoys: ['Película y cobija', 'Viaje a la playa', 'Picnic en el parque', 'Caminar bajo la lluvia'] },
    { category: 'Peleas de Convivencia', word: 'La tapa del baño', hint: 'Detalle doméstico que desata guerras', decoys: ['Lavar los platos', 'Robar la cobija', 'Llegar tarde', 'Dejar la ropa tirada'] },
    { category: 'Secretos de Pareja', word: 'Revisar el celular', hint: 'Invasión secreta de privacidad digital', decoys: ['Comerse el último postre', 'Comprar cosas a escondidas', 'Mentir sobre el precio', 'Fingir que te gusta su amigo'] },
    { category: 'Regalos Clásicos', word: 'Flores y Chocolates', hint: 'Detalle romántico tradicional para disculparse', decoys: ['Perfume', 'Carta de amor', 'Peluches gigantes', 'Joyería fina'] },
    { category: 'Preguntas Trampa', word: '¿Me veo gordo/a?', hint: 'Pregunta donde cualquier respuesta es peligro mortal', decoys: ['¿En qué estás pensando?', '¿Quién era esa del mensaje?', '¿Te acuerdas qué día es hoy?', '¿Prefieres a tu mamá o a mí?'] },
    { category: 'Citas de Aniversario', word: 'Hotel de lujo', hint: 'Escapada romántica para celebrar', decoys: ['Cena en restaurante caro', 'Sesión de spa', 'Concierto inolvidable', 'Paseo en globo aerostático'] },
    { category: 'Mentiras Piadosas', word: 'Ya casi estoy listo', hint: 'Frase que en realidad significa 40 minutos más', decoys: ['Me encanta tu comida', 'No me enojé', 'Solo miraba el reloj', 'Estaba pensando en ti'] },
    { category: 'Manías del Otro', word: 'Roncar como motosierra', hint: 'Ruido nocturno que no deja dormir', decoys: ['Morderse las uñas', 'Robarse las papas fritas', 'Tardar 2 horas arreglándose', 'Hablar durante la película'] },
    { category: 'Momentos Incómodos', word: 'Encontrarse al ex en la calle', hint: 'Situación tensa que congela el aire', decoys: ['Cena con los suegros', 'Olvidar el cumpleaños', 'Decir el nombre equivocado', 'Quedarse sin tema de conversación'] },
    { category: 'Planes a Futuro', word: 'Adoptar un perro juntos', hint: 'Paso previo antes de tener hijos o casarse', decoys: ['Comprar una casa', 'Mudarse juntos', 'Viajar a Europa', 'Abrir un negocio'] }
  ],
  cerebritos: [
    { category: 'Ciencia Ficción', word: 'Viaje en el Tiempo', hint: 'Concepto de saltar en la línea temporal', decoys: ['Teletransportación', 'Agujero Negro', 'Cyborg', 'Multiverso'] },
    { category: 'Inteligencia Artificial', word: 'Red Neuronal', hint: 'Estructura computacional inspirada en el cerebro', decoys: ['Algoritmo Cuántico', 'Singularidad', 'Robot Humanoide', 'Modelo de Lenguaje'] },
    { category: 'Misterios del Universo', word: 'Materia Oscura', hint: 'Masa invisible que compone la mayor parte del cosmos', decoys: ['Antimateria', 'Multiverso', 'Supernova', 'Energía del Vacío'] },
    { category: 'Inventos Revolucionarios', word: 'Internet', hint: 'Red global de comunicación descentralizada', decoys: ['La Rueda', 'La Imprenta', 'La Electricidad', 'El Transistor'] },
    { category: 'Paradojas Filosóficas', word: 'El gato de Schrödinger', hint: 'Experimento mental donde algo está vivo y muerto a la vez', decoys: ['La paradoja del abuelo', 'El barco de Teseo', 'El dilema del tranvía', 'La caverna de Platón'] },
    { category: 'Física Teórica', word: 'Teoría de Cuerdas', hint: 'Modelo que postula dimensiones vibrantes diminutas', decoys: ['Mecánica Cuántica', 'Relatividad General', 'Termodinámica', 'Entrelazamiento Cuántico'] },
    { category: 'Biología y Genética', word: 'Edición Genética CRISPR', hint: 'Técnica moderna para cortar y modificar ADN', decoys: ['Clonación', 'Evolución por selección natural', 'Células madre', 'Terapia génica'] },
    { category: 'Exploración Espacial', word: 'Colonizar Marte', hint: 'Meta de convertir la humanidad en especie multiplanetaria', decoys: ['Estación Espacial Internacional', 'Telescopio James Webb', 'Base Lunar', 'Viaje a las estrellas'] }
  ]
};

export class ImpostorSilicio {
  constructor(room, onStateChange, onTimerTick, customRounds = null) {
    this.room = room;
    this.onStateChange = onStateChange;
    this.onTimerTick = onTimerTick;

    this.id = 'impostor-silicio';
    this.title = 'El Impostor de Silicio';
    this.description = 'Uno de ustedes no sabe la palabra secreta. Den pistas disimuladas, debatan y cacen al impostor... ¡o ayúdenlo a escapar!';

    const count = Math.max(2, room.players.size || 3);
    const dynamicPacing = calculateDynamicRounds('impostor-silicio', count);
    this.totalRounds = customRounds || dynamicPacing.rounds;
    this.currentRound = 1;
    this.phase = 'HOW_TO_PLAY'; // HOW_TO_PLAY | INTRO | CLUES_1 | CLUES_REVEAL_1 | CLUES_2 | DEBATE | VOTING | ROUND_SUSPICION | RESOLUTION | ESCAPE | RESULTS | PODIUM
    this.timer = 0;
    this.timerInterval = null;

    this.currentWordData = null;
    this.impostorSocketId = null;
    // Map socketId -> { clue1: string, clue2: string }
    this.playerClues = new Map();
    // Map voterSocketId -> suspectSocketId
    this.playerVotes = new Map();
    // Map socketId -> accumulated suspicion votes across all rounds
    this.accumulatedSuspicion = new Map();
    this.votedOutSocketId = null;
    this.impostorGuessedCorrectly = false;
    this.aiCommentary = null;

    console.log(`[ImpostorSilicio] Initialized for room ${room.code} (${this.totalRounds} rondas)`);
  }

  start() {
    this.room.status = 'IN_GAME';
    this.currentRound = 1;
    this.accumulatedSuspicion.clear();
    for (const p of this.room.players.values()) {
      p.score = 0;
      p.lastRoundGain = 0;
      this.accumulatedSuspicion.set(p.id, 0);
    }

    // Pick 1 secret Impostor for the entire match!
    const activePlayers = Array.from(this.room.players.values()).filter(p => p.connected);
    const chosenImpostor = activePlayers[Math.floor(Math.random() * activePlayers.length)];
    this.impostorSocketId = chosenImpostor?.id;
    console.log(`[ImpostorSilicio] Persistent secret Impostor for match is: ${chosenImpostor?.name} (${this.impostorSocketId})`);

    this.startHowToPlayPhase();
  }

  startHowToPlayPhase() {
    this.phase = 'HOW_TO_PLAY';
    const tutorial = getTutorial('impostor-silicio');
    this.timer = tutorial ? tutorial.durationSeconds : 15;
    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      this.startRound();
    });
  }

  startRound() {
    this.playerClues.clear();
    this.playerVotes.clear();
    this.votedOutSocketId = null;
    this.impostorGuessedCorrectly = false;
    this.aiCommentary = null;

    const audience = this.room.audience || 'familia';
    const wordsPool = IMPOSTOR_WORDS_DATABASE[audience] || IMPOSTOR_WORDS_DATABASE.familia || IMPOSTOR_WORDS_DATABASE.amigos;
    const randomPick = wordsPool[Math.floor(Math.random() * wordsPool.length)];
    this.currentWordData = randomPick;

    // Verify impostor socket is still valid among connected players
    const activePlayers = Array.from(this.room.players.values()).filter(p => p.connected);
    if (!this.impostorSocketId || !activePlayers.some(p => p.id === this.impostorSocketId)) {
      const fallbackImpostor = activePlayers[Math.floor(Math.random() * activePlayers.length)];
      this.impostorSocketId = fallbackImpostor?.id;
    }
    const currentImpostorP = this.room.players.get(this.impostorSocketId);

    console.log(`[ImpostorSilicio] Starting Round ${this.currentRound}/${this.totalRounds}: Category "${randomPick.category}", Word "${randomPick.word}". Impostor: ${currentImpostorP?.name}`);

    // INTRO Phase (6s for players to read role in secret)
    this.phase = 'INTRO';
    this.timer = 6;
    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      this.startClues1Phase();
    });
  }

  // --- RONDA 1 DE PISTAS ---
  startClues1Phase() {
    this.phase = 'CLUES_1';
    this.timer = 28;
    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      this.startCluesReveal1Phase();
    });
  }

  startCluesReveal1Phase() {
    this.phase = 'CLUES_REVEAL_1';
    this.timer = 8;
    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      this.startClues2Phase();
    });
  }

  // --- RONDA 2 DE PISTAS (Ahora el impostor conoce las primeras pistas) ---
  startClues2Phase() {
    this.phase = 'CLUES_2';
    this.timer = 24;
    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      this.startDebatePhase();
    });
  }

  submitClue(socketId, clueText) {
    if (this.phase !== 'CLUES_1' && this.phase !== 'CLUES_2' && this.phase !== 'CLUES') {
      return { success: false, error: 'No es la fase de pistas.' };
    }

    const cleanClue = String(clueText || '').trim().slice(0, 30);
    if (!cleanClue) return { success: false, error: 'La pista no puede estar vacía.' };

    const existing = this.playerClues.get(socketId) || {};
    if (this.phase === 'CLUES_2') {
      existing.clue2 = cleanClue;
    } else {
      existing.clue1 = cleanClue;
    }
    this.playerClues.set(socketId, existing);
    console.log(`[ImpostorSilicio] Player ${socketId} submitted clue (${this.phase}): "${cleanClue}"`);
    this.notifyStateChange();

    // Check if all connected players submitted for this phase
    const activePlayers = Array.from(this.room.players.values()).filter(p => p.connected);
    const submittedCount = Array.from(this.playerClues.values()).filter(c => {
      return this.phase === 'CLUES_2' ? Boolean(c.clue2) : Boolean(c.clue1);
    }).length;

    if (submittedCount >= activePlayers.length) {
      this.clearCountdown();
      if (this.phase === 'CLUES_1' || this.phase === 'CLUES') {
        this.startCluesReveal1Phase();
      } else {
        this.startDebatePhase();
      }
    }

    return { success: true };
  }

  handlePlayerClue(socketId, clueText) {
    return this.submitClue(socketId, clueText);
  }

  // --- DEBATE ABIERTO ---
  startDebatePhase() {
    this.phase = 'DEBATE';
    this.timer = 25; // 25s live debate in the room
    this.generateAiRoastForClues();
    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      this.startVotingPhase();
    });
  }

  async generateAiRoastForClues() {
    const cluesList = [];
    for (const [id, clues] of this.playerClues.entries()) {
      const p = this.room.players.get(id);
      const cStr = clues.clue2 ? `"${clues.clue1}" y "${clues.clue2}"` : `"${clues.clue1 || ''}"`;
      cluesList.push(`${p?.name || 'Alguien'}: ${cStr}`);
    }

    this.aiCommentary = `Atentos a las pistas del salón: ${cluesList.slice(0, 4).join(', ')}. ¡Alguien está mintiendo descaradamente!`;
    this.notifyStateChange();
  }

  // --- VOTACIÓN SECRETA ---
  startVotingPhase() {
    this.phase = 'VOTING';
    this.playerVotes.clear();
    this.timer = 18;
    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      this.finishVoting();
    });
  }

  submitVote(voterSocketId, suspectSocketId) {
    if (this.phase !== 'VOTING') return { success: false, error: 'No es la fase de votación.' };
    if (voterSocketId === suspectSocketId) return { success: false, error: 'No puedes votar por ti mismo.' };

    this.playerVotes.set(voterSocketId, suspectSocketId);
    console.log(`[ImpostorSilicio] ${voterSocketId} voted for suspect ${suspectSocketId}`);
    this.notifyStateChange();

    const activePlayers = Array.from(this.room.players.values()).filter(p => p.connected);
    if (this.playerVotes.size >= activePlayers.length) {
      console.log(`[ImpostorSilicio] All players voted early! Proceeding to Resolution.`);
      this.clearCountdown();
      this.finishVoting();
    }

    return { success: true };
  }

  handlePlayerVote(socketId, suspectId) {
    return this.submitVote(socketId, suspectId);
  }

  // --- RESOLUCIÓN Y SENTENCIA (DRAMÁTICA) ---
  finishVoting() {
    this.clearCountdown();

    // 1. Tally votes for THIS round and accumulate total suspicion across match
    for (const suspectId of this.playerVotes.values()) {
      this.accumulatedSuspicion.set(
        suspectId, 
        (this.accumulatedSuspicion.get(suspectId) || 0) + 1
      );
    }

    // Award baseline points for participating & writing clues (+100 pts per clue)
    for (const [playerId, clues] of this.playerClues.entries()) {
      const p = this.room.players.get(playerId);
      if (p) {
        let pts = 0;
        if (clues.clue1) pts += 100;
        if (clues.clue2) pts += 100;
        p.score = (p.score || 0) + pts;
        p.lastRoundGain = (p.lastRoundGain || 0) + pts;
      }
    }

    const isFinalRound = (this.currentRound >= this.totalRounds);

    if (!isFinalRound) {
      // Intermediate round: DO NOT REVEAL IMPOSTOR! NO ONE ELIMINATED!
      // Everyone plays all rounds. Suspicion votes accumulate on the dossier.
      this.phase = 'ROUND_SUSPICION';
      this.timer = 8;
      this.aiCommentary = `¡Ronda ${this.currentRound} completada! Las sospechas han quedado registradas en el expediente. Nadie es expulsado... ¡El infiltrado sigue suelto!`;
      this.notifyStateChange();

      this.startCountdown(this.timer, () => {
        this.currentRound++;
        this.startRound();
      });
      return;
    }

    // FINAL ROUND: GRAND CLIMAX & FINAL COURT VERDICT!
    let topSuspectId = null;
    let maxSuspicion = -1;
    for (const [pId, totalVotes] of this.accumulatedSuspicion.entries()) {
      if (totalVotes > maxSuspicion) {
        maxSuspicion = totalVotes;
        topSuspectId = pId;
      }
    }

    this.votedOutSocketId = topSuspectId;
    const isImpostorCaught = (topSuspectId === this.impostorSocketId);

    console.log(`[ImpostorSilicio] Final Verdict! Top Suspect: ${topSuspectId} (${maxSuspicion} total votes). Caught Impostor? ${isImpostorCaught}`);

    // Enter RESOLUTION phase (TV shows dramatic reveal for 10s)
    this.phase = 'RESOLUTION';
    this.timer = 10;
    this.notifyStateChange();

    this.startCountdown(this.timer, () => {
      if (isImpostorCaught) {
        // Impostor has a backdoor escape opportunity!
        this.phase = 'ESCAPE';
        this.timer = 12;
        this.notifyStateChange();

        this.startCountdown(this.timer, () => {
          this.tallyPointsAndFinishRound();
        });
      } else {
        // Impostor tricked everyone!
        this.tallyPointsAndFinishRound();
      }
    });
  }

  submitImpostorGuess(socketId, guessedWord) {
    if (this.phase !== 'ESCAPE' || socketId !== this.impostorSocketId) {
      return { success: false, error: 'Acción no permitida.' };
    }

    if (guessedWord.toLowerCase().trim() === this.currentWordData.word.toLowerCase().trim()) {
      this.impostorGuessedCorrectly = true;
    }

    this.clearCountdown();
    this.tallyPointsAndFinishRound();
    return { success: true };
  }

  handleImpostorGuess(socketId, guess) {
    return this.submitImpostorGuess(socketId, guess);
  }

  tallyPointsAndFinishRound() {
    this.phase = 'RESULTS';
    const isImpostorCaught = (this.votedOutSocketId === this.impostorSocketId);
    const impostorPlayer = this.room.players.get(this.impostorSocketId);
    const votedPlayer = this.room.players.get(this.votedOutSocketId);

    // Reset last round gains
    for (const p of this.room.players.values()) {
      p.lastRoundGain = 0;
    }

    // Award baseline clue crafting bonus (100 pts per clue submitted)
    for (const [playerId, clues] of this.playerClues.entries()) {
      const p = this.room.players.get(playerId);
      if (p) {
        let cluePoints = 0;
        if (clues.clue1) cluePoints += 100;
        if (clues.clue2) cluePoints += 100;
        p.score = (p.score || 0) + cluePoints;
        p.lastRoundGain = (p.lastRoundGain || 0) + cluePoints;
      }
    }

    const roundMultiplier = (this.currentRound === 2) ? 2.0 : 1.0;

    if (isImpostorCaught && !this.impostorGuessedCorrectly) {
      // 1. INNOCENTS WIN!
      for (const [voterId, suspectId] of this.playerVotes.entries()) {
        if (suspectId === this.impostorSocketId) {
          const voter = this.room.players.get(voterId);
          if (voter) {
            const gain = Math.round(500 * roundMultiplier);
            voter.score = (voter.score || 0) + gain;
            voter.lastRoundGain = (voter.lastRoundGain || 0) + gain;
          }
        }
      }
      this.aiCommentary = `¡CAZARON AL IMPOSTOR! Era ${impostorPlayer?.name || 'el infiltrado'} y no pudo hackear la palabra secreta ("${this.currentWordData.word}"). ¡Victoria de los Inocentes!`;
    } else if (isImpostorCaught && this.impostorGuessedCorrectly) {
      // 2. LEGENDARY IMPOSTOR ESCAPE!
      if (impostorPlayer) {
        const gain = Math.round(800 * roundMultiplier);
        impostorPlayer.score = (impostorPlayer.score || 0) + gain;
        impostorPlayer.lastRoundGain = gain;
      }
      this.aiCommentary = `¡ESCAPE LEGENDARIO! Atraparon a ${impostorPlayer?.name || 'el infiltrado'}, ¡pero adivinó que la palabra secreta era "${this.currentWordData.word}" y robó la victoria!`;
    } else {
      // 3. IMPOSTOR DECEIVED EVERYONE!
      if (impostorPlayer) {
        const gain = Math.round(1000 * roundMultiplier);
        impostorPlayer.score = (impostorPlayer.score || 0) + gain;
        impostorPlayer.lastRoundGain = gain;
      }
      // Scapegoat sympathy points
      if (votedPlayer) {
        const gain = 150;
        votedPlayer.score = (votedPlayer.score || 0) + gain;
        votedPlayer.lastRoundGain = gain;
      }
      this.aiCommentary = `¡EL IMPOSTOR LOS ENGAÑÓ A TODOS! El grupo expulsó erróneamente a ${votedPlayer?.name || 'un inocente'}. El verdadero impostor era ${impostorPlayer?.name} y la palabra secreta era "${this.currentWordData.word}".`;
    }

    this.timer = 10;
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
      this.startClues1Phase();
    } else if (this.phase === 'CLUES_1' || this.phase === 'CLUES') {
      this.startCluesReveal1Phase();
    } else if (this.phase === 'CLUES_REVEAL_1') {
      this.startClues2Phase();
    } else if (this.phase === 'CLUES_2') {
      this.startDebatePhase();
    } else if (this.phase === 'DEBATE') {
      this.startVotingPhase();
    } else if (this.phase === 'VOTING') {
      this.finishVoting();
    } else if (this.phase === 'ROUND_SUSPICION') {
      this.currentRound++;
      this.startRound();
    } else if (this.phase === 'RESOLUTION') {
      const isImpostorCaught = (this.votedOutSocketId === this.impostorSocketId);
      if (isImpostorCaught) {
        this.phase = 'ESCAPE';
        this.timer = 12;
        this.notifyStateChange();
        this.startCountdown(this.timer, () => { this.tallyPointsAndFinishRound(); });
      } else {
        this.tallyPointsAndFinishRound();
      }
    } else if (this.phase === 'ESCAPE') {
      this.tallyPointsAndFinishRound();
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

  getVotesForPlayer(playerId) {
    let count = 0;
    for (const suspectId of this.playerVotes.values()) {
      if (suspectId === playerId) count++;
    }
    return count;
  }

  getVotesTally() {
    const tally = [];
    for (const [voterId, suspectId] of this.playerVotes.entries()) {
      const voter = this.room.players.get(voterId);
      const suspect = this.room.players.get(suspectId);
      tally.push({
        voterName: voter?.name || 'Jugador',
        suspectName: suspect?.name || 'Sospechoso'
      });
    }
    return tally;
  }

  getPublicState() {
    const cluesDisplay = [];
    for (const p of this.room.players.values()) {
      const clues = this.playerClues.get(p.id) || {};
      const avatarStr = p.avatar?.emoji || (typeof p.avatar === 'string' ? p.avatar : '👤');
      cluesDisplay.push({
        playerId: p.id,
        playerName: p.name || 'Jugador',
        avatar: avatarStr,
        clue1: clues.clue1 || null,
        clue2: clues.clue2 || null,
        clue: clues.clue2 ? `1: "${clues.clue1}" | 2: "${clues.clue2}"` : (clues.clue1 || '(Escribiendo...)')
      });
    }

    const votedOutPlayer = this.room.players.get(this.votedOutSocketId);
    const impostorPlayer = this.room.players.get(this.impostorSocketId);
    const isRevealPhase = (this.phase === 'RESOLUTION' || this.phase === 'ESCAPE' || this.phase === 'RESULTS' || this.phase === 'PODIUM');

    const sortedPlayers = Array.from(this.room.players.values())
      .map(p => ({
        id: p.id,
        name: p.name,
        score: p.score || 0,
        avatar: p.avatar,
        roundDelta: p.lastRoundGain || 0
      }))
      .sort((a, b) => b.score - a.score);

    const suspicionBoard = Array.from(this.room.players.values()).map(p => {
      const avatarStr = p.avatar?.emoji || (typeof p.avatar === 'string' ? p.avatar : '👤');
      const totalSuspicion = this.accumulatedSuspicion?.get(p.id) || 0;
      const roundVotes = this.getVotesForPlayer(p.id);
      return {
        id: p.id,
        name: p.name,
        avatar: avatarStr,
        totalSuspicion,
        roundVotes
      };
    }).sort((a, b) => b.totalSuspicion - a.totalSuspicion);

    return {
      gameId: this.id,
      gameTitle: this.title,
      phase: this.phase,
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      timer: this.timer,
      category: this.currentWordData?.category,
      secretWord: isRevealPhase ? this.currentWordData?.word : null,
      clues: cluesDisplay,
      suspicionBoard,
      leaderboard: sortedPlayers,
      podium: this.phase === 'PODIUM' ? sortedPlayers.slice(0, 3) : null,
      resolution: isRevealPhase ? {
        votedOutName: votedOutPlayer?.name || 'Nadie',
        votedOutAvatar: votedOutPlayer?.avatar?.emoji || (typeof votedOutPlayer?.avatar === 'string' ? votedOutPlayer.avatar : '👤'),
        votesCount: this.getVotesForPlayer(this.votedOutSocketId),
        wasImpostorCaught: (this.votedOutSocketId === this.impostorSocketId),
        realImpostorName: impostorPlayer?.name || 'El Infiltrado',
        realImpostorAvatar: impostorPlayer?.avatar?.emoji || (typeof impostorPlayer?.avatar === 'string' ? impostorPlayer.avatar : '😈'),
        secretWord: this.currentWordData?.word,
        category: this.currentWordData?.category,
        escaped: this.impostorGuessedCorrectly
      } : null,
      votedOutName: votedOutPlayer?.name || null,
      impostorName: isRevealPhase ? impostorPlayer?.name : null,
      aiCommentary: this.aiCommentary,
      howToPlay: getTutorial('impostor-silicio'),
      cta: getMobileCTA('impostor-silicio', this.phase, {}),
      votesTally: this.getVotesTally()
    };
  }

  getPrivateState(socketId) {
    const isImpostor = (socketId === this.impostorSocketId);
    const clues = this.playerClues.get(socketId) || {};
    const hasSubmittedClue1 = Boolean(clues.clue1);
    const hasSubmittedClue2 = Boolean(clues.clue2);
    const hasSubmittedCurrentClue = (this.phase === 'CLUES_2') ? hasSubmittedClue2 : hasSubmittedClue1;
    const hasVoted = this.playerVotes.has(socketId);

    // Escape options for the impostor
    let escapeOptions = [];
    if (isImpostor && this.currentWordData) {
      const allChoices = [this.currentWordData.word, ...(this.currentWordData.decoys || [])];
      escapeOptions = allChoices.sort(() => Math.random() - 0.5);
    }

    // List of candidates to vote against (exclude yourself)
    const candidates = [];
    for (const p of this.room.players.values()) {
      if (p.id !== socketId) {
        const pClues = this.playerClues.get(p.id) || {};
        const clue1 = pClues.clue1 || '';
        const clue2 = pClues.clue2 || '';
        let clueSummary = '';
        if (clue1 && clue2) {
          clueSummary = `1: "${clue1}" • 2: "${clue2}"`;
        } else if (clue1) {
          clueSummary = `"${clue1}"`;
        } else {
          clueSummary = '(Pensando pista...)';
        }
        candidates.push({
          id: p.id,
          name: p.name || 'Jugador',
          avatar: p.avatar?.emoji || (typeof p.avatar === 'string' ? p.avatar : '👤'),
          clue: clueSummary
        });
      }
    }

    const isRevealPhase = (this.phase === 'RESOLUTION' || this.phase === 'ESCAPE' || this.phase === 'RESULTS' || this.phase === 'PODIUM');
    const votedOutPlayer = this.room.players.get(this.votedOutSocketId);
    const impostorPlayer = this.room.players.get(this.impostorSocketId);

    const cta = getMobileCTA('impostor-silicio', this.phase, {
      isImpostor,
      hasSubmittedClue: hasSubmittedCurrentClue,
      hasVoted
    });

    const player = this.room.players.get(socketId) || {};
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
      timer: this.timer,
      category: this.currentWordData?.category,
      isImpostor,
      hint: isImpostor ? this.currentWordData?.hint : null,
      secretWord: (isImpostor && !isRevealPhase) ? null : this.currentWordData?.word,
      hasSubmittedClue: hasSubmittedCurrentClue,
      myClue1: clues.clue1 || null,
      myClue2: clues.clue2 || null,
      candidates,
      hasVoted,
      suspicionBoard: Array.from(this.room.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar?.emoji || (typeof p.avatar === 'string' ? p.avatar : '👤'),
        totalSuspicion: this.accumulatedSuspicion?.get(p.id) || 0
      })).sort((a, b) => b.totalSuspicion - a.totalSuspicion),
      escapeOptions,
      resolution: isRevealPhase ? {
        votedOutName: votedOutPlayer?.name || 'Nadie',
        votedOutAvatar: votedOutPlayer?.avatar?.emoji || (typeof votedOutPlayer?.avatar === 'string' ? votedOutPlayer.avatar : '👤'),
        wasImpostorCaught: (this.votedOutSocketId === this.impostorSocketId),
        realImpostorName: impostorPlayer?.name || 'El Infiltrado',
        realImpostorAvatar: impostorPlayer?.avatar?.emoji || (typeof impostorPlayer?.avatar === 'string' ? impostorPlayer.avatar : '😈'),
        secretWord: this.currentWordData?.word,
        escaped: this.impostorGuessedCorrectly
      } : null,
      cta,
      totalScore: player.score || 0,
      roundDelta: player.lastRoundGain || 0,
      rank: sortedPlayers.length > 1 && sortedPlayers[0].score === sortedPlayers[1].score && (player.score || 0) === sortedPlayers[0].score && sortedPlayers[0].score > 0 ? 1 : sortedPlayers.findIndex(p => p.id === socketId) + 1,
      isWinner: sortedPlayers[0]?.id === socketId && !(sortedPlayers.length > 1 && sortedPlayers[0].score === sortedPlayers[1].score && sortedPlayers[0].score > 0),
      isCoChampion: sortedPlayers.length > 1 && sortedPlayers[0].score === sortedPlayers[1].score && (player.score || 0) === sortedPlayers[0].score && sortedPlayers[0].score > 0,
      isTie: sortedPlayers.length > 1 && sortedPlayers[0].score === sortedPlayers[1].score && sortedPlayers[0].score > 0
    };
  }
}
