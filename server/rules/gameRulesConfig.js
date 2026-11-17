/**
 * gameRulesConfig.js
 * 
 * Configuración formal y parámetros matemáticos de reglas, temporización dinámica,
 * puntuación, tutorialización ("CÓMO JUGAR" / HOW_TO_PLAY) y micro-instrucciones
 * contextuales de mando móvil (Call-To-Action) para la plataforma de Party Games.
 * 
 * Consumido directamente por los motores de juego del backend y la interfaz web.
 */

// ============================================================================
// 1. RESTRICCIONES Y CONSTANTES GLOBALES DE SALA
// ============================================================================

export const GLOBAL_CONSTRAINTS = {
  MIN_PLAYERS: 3,
  MAX_PLAYERS: 12,
  RECOMMENDED_MIN: 4,
  RECOMMENDED_MAX: 8,
  FAST_FORWARD_BUFFER_SECONDS: 1.5, // Tiempo de gracia tras recibir el 100% de envíos
  TIE_BREAKER_RANDOM_EPSILON: 0.001
};

// ============================================================================
// 2. TUTORIALIZACIÓN FORMAL ("CÓMO JUGAR" / HOW_TO_PLAY) PARA CADA JUEGO
// ============================================================================

export const TUTORIALS_CONFIG = {
  'duelo-ocurrencias': {
    gameId: 'duelo-ocurrencias',
    title: 'Duelo de Ocurrencias',
    tagline: '¡Batalla de ingenio, votos traicioneros y juicio implacable de la IA!',
    durationSeconds: 14,
    objective: 'Escribe las ocurrencias más graciosas o absurdas para ganar los votos de tus amigos y el visto bueno del Anfitrión IA.',
    goldenRules: [
      {
        number: 1,
        title: 'Sé Rápido y Divertido',
        description: 'Recibirás 2 preguntas en tu celular. Responde antes de que expire el tiempo. ¡Cualquier locura es mejor que dejarlo en blanco!',
        icon: '✍️'
      },
      {
        number: 2,
        title: 'El Salón es el Jurado',
        description: 'En cada duelo se enfrentan 2 respuestas anónimas en la TV. Si tú no estás en el duelo, ¡vota en tu móvil por la que te haga reír más!',
        icon: '🗳️'
      },
      {
        number: 3,
        title: 'Teme (o Ama) a la IA',
        description: 'El Anfitrión IA destrozará las respuestas aburridas con comentarios mordaces y otorgará un bono especial a su favorita.',
        icon: '🤖'
      }
    ],
    mobileGuide: [
      { step: 1, title: 'Escribe en Privado', description: 'Tus 2 respuestas se envían en secreto desde tu teléfono.', icon: '📱' },
      { step: 2, title: 'Vota en Duelos Ajenos', description: 'Elige entre la Opción A o la Opción B tocando la pantalla.', icon: '⚡' },
      { step: 3, title: 'Dispara Reacciones', description: 'Envía emojis en vivo (🔥, 😂, 💩) para festejar o trolear en la TV.', icon: '🎉' }
    ],
    scoringEconomy: [
      { event: 'Voto del Jurado', points: '+500 pts', description: 'Por cada jugador que vote por tu respuesta (¡se duplica a +1000 en Ronda 2!)', icon: '⭐' },
      { event: 'Victoria Aplastante', points: '+250 pts', description: 'Si te llevas el 100% de los votos del salón en tu duelo.', icon: '👑' },
      { event: 'Bono de la Crítica IA', points: '+250 pts', description: 'Otorgado por el Anfitrión IA a la ocurrencia más memorable.', icon: '🧠' },
      { event: 'Voto Relámpago', points: '+50 pts', description: 'Si emites tu voto de jurado en menos de 3 segundos.', icon: '🚀' }
    ],
    hostNarration: '¡Bienvenidos al Duelo de Ocurrencias! Recibirán dos preguntas en su celular. Sean rápidos e ingeniosos. Luego, las respuestas se enfrentarán cara a cara en esta pantalla y todo el salón votará por la mejor. ¡Y prepárense, porque yo también juzgaré sus ocurrencias!'
  },

  'impostor-silicio': {
    gameId: 'impostor-silicio',
    title: 'El Impostor de Silicio',
    tagline: '¡Deducción social, pistas crípticas, acusaciones ardientes y fuga cibernética!',
    durationSeconds: 15,
    objective: 'Los humanos deben cazar al impostor sin revelar la palabra secreta. El impostor debe fingir que sabe todo o adivinar la palabra para escapar.',
    goldenRules: [
      {
        number: 1,
        title: 'Mira tu Móvil en Secreto',
        description: 'Todos reciben la Categoría y la Palabra Secreta, EXCEPTO el Impostor, que solo conoce la Categoría. ¡No dejes que espíen tu pantalla!',
        icon: '🤫'
      },
      {
        number: 2,
        title: 'Da una Pista de Una Sola Palabra',
        description: 'Escribe 1 pista sutil. Si es demasiado obvia, el Impostor aprenderá la palabra. Si es muy rara, te acusarán a ti.',
        icon: '🧩'
      },
      {
        number: 3,
        title: 'Juicio, Votación y Fuga',
        description: 'Debatan en voz alta y voten al sospechoso. Si atrapan al Impostor, ¡él tendrá una última oportunidad de adivinar la palabra y robar la victoria!',
        icon: '🚨'
      }
    ],
    mobileGuide: [
      { step: 1, title: 'Memoriza tu Rol', description: 'Revisa si eres Inocente o Impostor y memoriza tu palabra clave.', icon: '👀' },
      { step: 2, title: 'Envía tu Pista', description: 'Escribe tu palabra de camuflaje antes de que acabe el tiempo.', icon: '⌨️' },
      { step: 3, title: 'Vota y Escapa', description: 'Toca a quién quieres expulsar. Y si eres el Impostor, hackea la palabra secreta.', icon: '🎯' }
    ],
    scoringEconomy: [
      { event: 'Victoria del Impostor', points: '+500 pts', description: 'Si pasa desapercibido y no es el más votado de la ronda.', icon: '🕵️' },
      { event: 'Bono de Confusión', points: '+50 pts', description: 'Por cada voto que el salón lance contra un humano inocente.', icon: '🌀' },
      { event: 'Fuga Cibernética', points: '+350 pts', description: 'Si el Impostor atrapado adivina la palabra secreta en su teléfono.', icon: '🚪' },
      { event: 'Acierto Humano', points: '+200 pts', description: 'A cada humano que vote correctamente al verdadero Impostor.', icon: '🛡️' },
      { event: 'Chivo Expiatorio', points: '-50 pts', description: 'Penalización cómica al inocente que reciba más votos por sospechoso.', icon: '🐑' }
    ],
    hostNarration: '¡Comienza El Impostor de Silicio! Todos menos uno conocen la palabra secreta. Escriban una pista sutil en sus teléfonos, debatan en voz alta y voten por el sospechoso. ¡Pero cuidado! Si el impostor adivina la palabra secreta al final, se robará toda la gloria.'
  },

  'dilemas-extremos': {
    gameId: 'dilemas-extremos',
    title: 'Dilemas Extremos',
    tagline: '¡Consenso social, decisiones imposibles y análisis psicológico de la IA!',
    durationSeconds: 14,
    objective: 'Enfrenta preguntas polarizantes, vota lo que harías tú y adivina qué elegirá la mayoría del salón para sumar puntos.',
    goldenRules: [
      {
        number: 1,
        title: 'No Hay Opción Cómoda',
        description: 'La TV mostrará un dilema ridículo o incómodo entre la Opción A y la Opción B. ¡No puedes abstenerte!',
        icon: '⚖️'
      },
      {
        number: 2,
        title: 'Voto Doble en tu Móvil',
        description: 'Primero votas qué harías tú en secreto. Luego apuestas qué crees que votará la MAYORÍA de tus amigos.',
        icon: '🔮'
      },
      {
        number: 3,
        title: 'Premios a la Rareza y al Caos',
        description: 'Si eres el único que vota por una opción ganas el Bono Lobo Solitario. Y si el salón empata 50/50, ¡todos ganan bono!',
        icon: '🐺'
      }
    ],
    mobileGuide: [
      { step: 1, title: 'Tu Elección Personal', description: 'Presiona el botón de la opción que prefieras (A o B).', icon: '🅰️' },
      { step: 2, title: 'Predicción de Mayoría', description: 'Apuesta qué botón presionaron la mayoría de los demás.', icon: '📈' },
      { step: 3, title: 'Mira el Votómetro', description: 'Observa la revelación dramática de porcentajes en la TV.', icon: '📊' }
    ],
    scoringEconomy: [
      { event: 'Acierto de Mayoría', points: '+200 pts', description: 'Si predices correctamente la opción ganadora del salón (x2 en ronda final).', icon: '🎯' },
      { event: 'Acierto de Veredicto IA', points: '+150 pts', description: 'Si aciertas la opción preferida por el retorcido algoritmo del Anfitrión.', icon: '🤖' },
      { event: 'Bono Lobo Solitario', points: '+350 pts', description: 'Si eres el ÚNICO jugador de la sala que eligió esa opción.', icon: '🐺' },
      { event: 'Dilema Dorado (50/50)', points: '+250 pts', description: 'Bono especial para todos si la sala queda dividida exactamente a la mitad.', icon: '✨' }
    ],
    hostNarration: '¡Llegó la hora de Dilemas Extremos! Les presentaré situaciones morales absurdas e incómodas. En sus celulares, elijan qué harían y apuesten qué votará la mayoría del salón. ¡Veamos qué tan retorcidos son sus amigos!'
  },

  'bomba-palabras': {
    gameId: 'bomba-palabras',
    title: 'Bomba de Palabras',
    tagline: '¡Contrarreloj explosivo de vocabulario bajo presión!',
    durationSeconds: 12,
    objective: 'Escribe rápidamente una palabra que contenga la sílaba secreta antes de que estalle la mecha en tu turno.',
    goldenRules: [
      { number: 1, title: 'Sílaba Obligatoria', description: 'Tu palabra debe incluir exactamente la combinación de letras que parpadea en pantalla.', icon: '💣' },
      { number: 2, title: 'No Repitas Palabras', description: 'El sistema memoriza cada palabra válida en la ronda: ¡usa tu ingenio antes de que otros la quemen!', icon: '🚫' },
      { number: 3, title: 'La Mecha Se Acelera', description: 'Cada acierto pasa la bomba al siguiente jugador y acorta el tiempo restante.', icon: '🔥' }
    ],
    hostNarration: '¡Bienvenidos a Bomba de Palabras! Les daré una sílaba y una bomba encendida. Quien la tenga en sus manos deberá escribir una palabra válida antes de que haga ¡BUM!'
  },

  'falso-sabio': {
    gameId: 'falso-sabio',
    title: 'Falso Sabio',
    tagline: '¡Inventa mentiras tan creíbles que engañen a todo el salón!',
    durationSeconds: 13,
    objective: 'Lee el dato histórico o absurdo incompleto, redacta una mentira convincente y detecta la verdad entre los engaños.',
    goldenRules: [
      { number: 1, title: 'Redacta tu Mentira', description: 'Completa la frase misteriosa en tu celular como si fueras enciclopedia viviente.', icon: '🥸' },
      { number: 2, title: 'Elige la Verdad Real', description: 'Todas las mentiras se mezclan con la respuesta verdadera en la TV. ¡Vota por la auténtica!', icon: '🔍' },
      { number: 3, title: 'Cobra por Cada Víctima', description: 'Cada amigo que vote por tu mentira te regala puntos masivos de farsante.', icon: '💰' }
    ],
    hostNarration: '¡Prepárense para mentir sin pudor en Falso Sabio! Inventen respuestas tan creíbles que sus amigos caigan directo en su trampa mientras intentan encontrar la única verdad.'
  },

  'trivia-caotica': {
    gameId: 'trivia-caotica',
    title: 'Trivia Caótica',
    tagline: '¡Cultura pop macabra, velocidad relámpago y robos de último segundo!',
    durationSeconds: 12,
    objective: 'Responde más rápido que nadie entre 4 opciones bizarras y sobrevive a la ronda final de puntos dobles.',
    goldenRules: [
      { number: 1, title: 'Cuatro Opciones, Un Destino', description: 'Lee la pregunta en la TV y presiona la respuesta correcta lo más rápido posible en tu móvil.', icon: '⚡' },
      { number: 2, title: 'Bono de Velocidad', description: 'Acertar en los primeros segundos otorga cientos de puntos extra frente a los indecisos.', icon: '⏱️' },
      { number: 3, title: 'Ronda Final X2', description: 'Nadie está a salvo: las últimas preguntas valen el doble y pueden voltear el podio.', icon: '💀' }
    ],
    hostNarration: '¡Bienvenidos al salón macabro de Trivia Caótica! Preguntas bizarras, cuatro respuestas y cero piedad. Quien dude un segundo pierde puntos!'
  },

  'telepatia-fiesta': {
    gameId: 'telepatia-fiesta',
    title: 'Telepatía de Fiesta',
    tagline: '¡Calibra el dial mental y sintoniza con la frecuencia de tus amigos!',
    durationSeconds: 12,
    objective: 'Mueve tu dial de 0% a 100% en un dilema subjetivo para coincidir exactamente con la mente colmena del grupo.',
    goldenRules: [
      { number: 1, title: 'Dos Extremos Claros', description: 'La TV muestra una escala absurda del 0% al 100% entre dos posturas extremas.', icon: '📡' },
      { number: 2, title: 'Calibra Sin Hablar', description: 'Desliza tu aguja en secreto en el teléfono intentando predecir dónde caerá el consenso.', icon: '🎛️' },
      { number: 3, title: 'Sintonía Fina', description: 'Mientras más cerca estés de la mediana del salón (o de tu pareja), mayor será tu recompensa.', icon: '🧠' }
    ],
    hostNarration: '¡Enciendan sus antenas en Telepatía de Fiesta! Verán una escala del cero al cien por ciento. Calibren su dial en secreto para demostrar si comparten cerebro!'
  }
};

// ============================================================================
// 3. MICRO-INSTRUCCIONES CONTEXTUALES ("CALL-TO-ACTION" / CTA) PARA EL MÓVIL
// ============================================================================

export const MOBILE_CTAS = {
  'duelo-ocurrencias': {
    HOW_TO_PLAY: {
      headline: '📖 MIRA LA PANTALLA PRINCIPAL',
      instruction: '¡Aprende las 3 Reglas de Oro y prepárate para escribir!',
      badge: '👀 TUTORIAL EN CURSO',
      subtext: 'La ronda comenzará automáticamente en unos segundos.'
    },
    ANSWERING_PENDING: {
      headline: '✍️ ESCRIBE TUS OCURRENCIAS',
      instruction: 'Responde ambas preguntas con tu toque más divertido antes de que acabe el tiempo.',
      badge: '⏳ ACCIÓN REQUERIDA',
      subtext: 'Tus respuestas son 100% secretas hasta el duelo.'
    },
    ANSWERING_SUBMITTED: {
      headline: '✅ RESPUESTAS ENVIADAS',
      instruction: '¡Excelente! Espera a que los demás jugadores terminen de escribir.',
      badge: '⏳ ESPERANDO AL SALÓN',
      subtext: 'Mantén la calma y prepárate para votar en los duelos ajenos.'
    },
    VOTING_VOTER: {
      headline: '🗳️ ¡ERES JURADO! VOTA AHORA',
      instruction: 'Elige en tu celular la respuesta que te haga reír más.',
      badge: '⚡ VOTA EN SECRETO',
      subtext: 'Vota en menos de 3 segundos para ganar bono de velocidad (+50 pts).'
    },
    VOTING_DUELIST: {
      headline: '🥊 ¡ESTE ES TU DUELO!',
      instruction: 'Tu respuesta está compitiendo en la pantalla principal. ¡No puedes votar por ti mismo!',
      badge: '🤫 MANTÉN CARA DE PÓQUER',
      subtext: 'Observa la TV y ruega por los votos de tus amigos.'
    },
    VOTING_SUBMITTED: {
      headline: '✅ VOTO REGISTRADO',
      instruction: '¡Voto guardado! Mira la TV para ver el veredicto y el juicio de la IA.',
      badge: '👀 MIRA LA PANTALLA',
      subtext: '¿Habrás elegido al ganador?'
    },
    AI_JUDGING: {
      headline: '🤖 EL ANFITRIÓN IA ESTÁ JUZGANDO',
      instruction: 'Escucha la crítica en la TV y mira quién se lleva el bono especial.',
      badge: '🎙️ VEREDICTO EN VIVO',
      subtext: '¡Dispara emojis en tu pantalla para ovacionar o abuchear!'
    },
    ROUND_RESULTS: {
      headline: '📊 RESULTADOS DE LA RONDA',
      instruction: 'Revisa tu puntuación en la pantalla grande.',
      badge: '🏆 TABLA DE PUNTOS',
      subtext: '¡Aún queda tiempo para remontar!'
    },
    PODIUM: {
      headline: '🎉 ¡FIN DE LA PARTIDA!',
      instruction: '¡Felicidades a los campeones en el podio!',
      badge: '👑 CELEBRACIÓN',
      subtext: 'Toca en la TV para jugar otra ronda.'
    }
  },

  'impostor-silicio': {
    HOW_TO_PLAY: {
      headline: '📖 MIRA LA PANTALLA PRINCIPAL',
      instruction: '¡Conoce tu misión y las 3 Reglas de Oro de deducción y engaño!',
      badge: '👀 TUTORIAL EN CURSO',
      subtext: 'Aprende cómo jugar antes de ver tu rol secreto.'
    },
    ROLE_REVEAL_HUMAN: {
      headline: '😇 ERES UN INOCENTE',
      instruction: 'Memoriza la palabra secreta. ¡Nunca la digas en voz alta ni dejes que vean tu celular!',
      badge: '🤫 INFORMACIÓN CLASIFICADA',
      subtext: 'Deberás dar una pista sutil que solo los inocentes entiendan.'
    },
    ROLE_REVEAL_IMPOSTOR: {
      headline: '🕵️ ¡ERES EL IMPOSTOR!',
      instruction: 'Tú NO conoces la palabra secreta. ¡Finge que la sabes y deduce de qué hablan!',
      badge: '🚨 MODO INFILTRADO',
      subtext: 'Solo conoces la Categoría general. ¡Disimula!'
    },
    CLUES_PENDING: {
      headline: '🧩 ENVÍA TU PISTA',
      instruction: 'Escribe exactamente 1 palabra o frase muy corta relacionada con el tema.',
      badge: '✍️ PISTA DE 1 PALABRA',
      subtext: 'Ni muy obvia (ayudas al impostor), ni muy rara (te linchan a ti).'
    },
    CLUES_SUBMITTED: {
      headline: '✅ PISTA ENVIADA',
      instruction: 'Pista guardada. Espera a que los demás envíen sus pistas.',
      badge: '⏳ ESPERANDO PISTAS',
      subtext: 'En unos instantes todas las pistas se revelarán en la TV.'
    },
    DEBATE: {
      headline: '🗣️ ¡DEBATE ABIERTO EN EL SALÓN!',
      instruction: 'Miren las pistas en la TV y discutan en voz alta. ¿Quién parece no saber de qué habla?',
      badge: '🔥 HORA DE SOSPECHAR',
      subtext: 'El Anfitrión IA soltará pistas y cizaña sobre los sospechosos.'
    },
    VOTING_PENDING: {
      headline: '🎯 ELIGE AL IMPOSTOR',
      instruction: 'Toca el nombre del jugador que creas que está fingiendo.',
      badge: '🗳️ JUICIO FINAL',
      subtext: 'Tu voto es secreto. Si atrapan al impostor, ganan puntos.'
    },
    VOTING_SUBMITTED: {
      headline: '✅ ACUSACIÓN REGISTRADA',
      instruction: 'Voto emitido. Mira la pantalla principal para el conteo de votos.',
      badge: '👀 MIRA LA PANTALLA',
      subtext: '¿Será culpable o lincharon a un inocente?'
    },
    ESCAPE_IMPOSTOR: {
      headline: '🚨 ¡HACKEA LA PALABRA SECRETA!',
      instruction: '¡Te han descubierto! Adivina la palabra secreta entre las opciones para robar la victoria.',
      badge: '⚡ ÚLTIMA OPORTUNIDAD',
      subtext: 'Tienes pocos segundos. ¡Elige con audacia!'
    },
    ESCAPE_SPECTATOR: {
      headline: '🚨 ¡EL IMPOSTOR ESTÁ INTENTANDO ESCAPAR!',
      instruction: 'El sospechoso tiene 12 segundos para intentar adivinar la palabra secreta en su celular.',
      badge: '👀 ATENCIÓN A LA TV',
      subtext: '¡Ruega porque elija la opción incorrecta!'
    },
    RESULTS: {
      headline: '📊 VEREDICTO DE LA RONDA',
      instruction: 'Mira en la pantalla principal quién triunfó y quién fue engañado.',
      badge: '🏆 RESULTADOS',
      subtext: 'Revisa los puntos y las penalizaciones.'
    }
  },

  'dilemas-extremos': {
    HOW_TO_PLAY: {
      headline: '📖 MIRA LA PANTALLA PRINCIPAL',
      instruction: '¡Aprende las 3 Reglas de Oro de los dilemas y el voto doble!',
      badge: '👀 TUTORIAL EN CURSO',
      subtext: 'El primer dilema comenzará en unos segundos.'
    },
    DILEMMA_INTRO: {
      headline: '🤔 ESCUCHA EL DILEMA EN LA TV',
      instruction: 'El Anfitrión IA está presentando las dos opciones. ¡Prepárate para decidir!',
      badge: '👀 ATENCIÓN A LA TV',
      subtext: 'No hay opción fácil: ambas tienen consecuencias.'
    },
    CHOICE_PENDING: {
      headline: '🅰️/🅱️ ELIGE TU POSTURA Y APUESTA',
      instruction: '1° Elige qué harías tú. 2° Apuesta qué crees que votará la mayoría del salón.',
      badge: '⚖️ DOBLE DECISIÓN',
      subtext: 'Adivinar la mayoría te da +200 pts. ¡Ser la única oveja negra te da +350 pts!'
    },
    CHOICE_SUBMITTED: {
      headline: '✅ ELECCIÓN Y APUESTA ENVIADAS',
      instruction: '¡Listo! Esperando a que el resto del salón complete su decisión.',
      badge: '⏳ ESPERANDO AL SALÓN',
      subtext: 'En breve veremos el Votómetro en la pantalla principal.'
    },
    REVEAL_METER: {
      headline: '📊 ¡EL VOTÓMETRO ESTÁ SUBIENDO!',
      instruction: 'Mira en la pantalla cómo quedó dividido el salón y escucha el juicio de la IA.',
      badge: '📈 REVELACIÓN EN VIVO',
      subtext: '¿Habrás acertado la predicción de la mayoría?'
    },
    RESULTS: {
      headline: '🏆 PUNTOS DEL DILEMA',
      instruction: 'Comprueba los puntos ganados y los bonos especiales en la TV.',
      badge: '✨ RESUMEN DE PUNTOS',
      subtext: 'Prepárate para el siguiente dilema.'
    }
  }
};

// ============================================================================
// 4. REGLAS: DUELO DE OCURRENCIAS (QUILL-STYLE / QUIZ / BLUFFING)
// ============================================================================

export const DUELO_OCURRENCIAS_CONFIG = {
  id: 'duelo-ocurrencias',
  name: 'Duelo de Ocurrencias',
  totalRounds: 4,

  // Temporizadores Base (en segundos)
  timers: {
    howToPlay: 14,
    intro: 6,
    answeringBase: 45,
    votingBase: 15,
    aiJudging: 8,
    roundResults: 9,
    podium: 20
  },

  // Ajustes dinámicos según conteo de jugadores
  dynamicTiming: {
    answeringPerPlayerDelta: 1,    // Segundos extra por jugador por encima de 4
    minAnsweringSeconds: 35,
    maxAnsweringSeconds: 60,
    votingPerPlayerDelta: 0.5,
    minVotingSeconds: 12,
    maxVotingSeconds: 20
  },

  // Asignación de prompts
  promptsAssignment: {
    promptsPerPlayer: 2,           // Cada jugador responde 2 preguntas
    playersPerPrompt: 2            // Cada pregunta enfrenta exactamente a 2 duelistas
  },

  // Parámetros de Puntuación
  scoring: {
    pointsPerVote: 500,            // Puntos otorgados por cada voto de jurado recibido
    roundMultipliers: {
      1: 1.0,                      // Ronda 1: Calentamiento (500 pts/voto)
      2: 1.5,                      // Ronda 2: Escalada (750 pts/voto)
      3: 2.0,                      // Ronda 3: ¡PUNTOS DOBLES! (1000 pts/voto)
      4: 3.0                       // Ronda 4: ¡CLÍMAX FINAL PUNTOS TRIPLES! (1500 pts/voto)
    },
    sweepBonus: 250,               // Bono de 'Barredora' / 100% de votos (unanimidad)
    aiCriticBonus: 250,            // Bono de la Crítica otorgado por el Anfitrión IA
    fastVoteBonus: 50,             // Bono si el jurado vota en los primeros segundos
    fastVoteThresholdMs: 3000      // 3 segundos para el bono de voto rápido
  },

  // Mecánica de Remontada (Catch-up)
  catchUp: {
    underdogThresholdPercentile: 0.33, // Último 33% de la tabla
    underdogTieBreakerAdvantage: true,  // En caso de empate en la final, gana el de menor puntaje acumulado
    finalRoundScoreMultiplier: 3.0
  }
};

// ============================================================================
// 5. REGLAS: EL IMPOSTOR DE SILICIO (DEDUCCIÓN SOCIAL Y ENGAÑO)
// ============================================================================

export const IMPOSTOR_SILICIO_CONFIG = {
  id: 'impostor-silicio',
  name: 'El Impostor de Silicio',
  totalRounds: 3,

  // Distribución de Roles según N jugadores
  roleDistribution: {
    3: { impostors: 1, humans: 2 },
    4: { impostors: 1, humans: 3 },
    5: { impostors: 1, humans: 4 },
    6: { impostors: 1, humans: 5 },
    7: { impostors: 1, humans: 6 },
    8: { impostors: 2, humans: 6 },
    9: { impostors: 2, humans: 7 },
    10: { impostors: 2, humans: 8 },
    11: { impostors: 2, humans: 9 },
    12: { impostors: 2, humans: 10 }
  },

  // Temporizadores (en segundos)
  timers: {
    howToPlay: 15,
    roleReveal: 8,                 // Tiempo privado para leer rol y palabra
    clueSubmissionBase: 35,        // Tiempo para redactar pista de 1 palabra
    clueReveal: 6,                 // Muestra todas las pistas en pantalla grande
    debateBase: 60,                // Debate abierto
    debatePerPlayerDelta: 5,       // +5s de debate por cada jugador adicional sobre 3
    minDebateSeconds: 45,
    maxDebateSeconds: 100,
    voting: 20,                    // Votación de linchamiento/expulsión
    escapeOpportunity: 12,         // Impostor tiene 12s para adivinar la palabra secreta
    roundResults: 10
  },

  // Puntuación
  scoring: {
    impostorUndiscovered: 500,     // Impostor no fue el más votado
    impostorConfusionPerVote: 50,  // Por cada voto que reciba un inocente
    impostorEscapeSuccess: 350,    // Impostor descubierto pero adivina la palabra
    humanCorrectVote: 200,         // Humano que votó al impostor real
    scapegoatPenalty: 50,          // Penalización cómica al humano inocente más votado
    aiMasterstrokeBonus: 100,      // Mejor pista o mejor coartada según el Host IA
    roundMultipliers: {
      1: 1.0,
      2: 1.25,
      3: 1.5
    }
  },

  // Catch-up
  catchUp: {
    underdogMultiplier: 1.5        // Humanos rezagados ganan 1.5x por descubrir al impostor
  }
};

// ============================================================================
// 6. REGLAS: DILEMAS EXTREMOS (CONSENSO SOCIAL Y JUICIO IA)
// ============================================================================

export const DILEMAS_EXTREMOS_CONFIG = {
  id: 'dilemas-extremos',
  name: 'Dilemas Extremos',
  totalRounds: 4,

  // Temporizadores (en segundos)
  timers: {
    howToPlay: 14,
    dilemmaIntro: 10,              // Lectura en voz alta del dilema con animaciones
    choiceAndPrediction: 22,       // Elección personal + apuesta de qué votará el salón
    voteMeterReveal: 8,            // Animación suspense del 'Votómetro'
    aiHostVerdict: 8,              // Decisión y mofa del Anfitrión IA
    roundResults: 8
  },

  // Puntuación
  scoring: {
    majorityConsensusBonus: 200,   // Acertar cuál opción obtuvo la mayoría de votos
    aiPredictionBonus: 150,        // Acertar qué opción eligió el Anfitrión IA
    loneWolfBonus: 350,            // Bono 'Oveja Negra' si eres el único en todo el salón con esa opción
    goldenSplit5050Bonus: 250,     // Bono especial a todos si la sala empata exactamente 50/50
    roundMultipliers: {
      1: 1.0,
      2: 1.25,
      3: 1.5,
      4: 2.0                      // Última ronda otorga el doble de puntos
    }
  },

  catchUp: {
    riskOptionMultiplier: 2.0      // Para jugadores en última posición que eligen contra la corriente
  }
};

// ============================================================================
// 7. FUNCIONES MATEMÁTICAS Y ALGORITMOS DE EQUILIBRIO
// ============================================================================

/**
 * Calcula el tiempo dinámico de una fase con clamp de seguridad.
 * @param {number} baseSeconds 
 * @param {number} playerCount 
 * @param {number} minSeconds 
 * @param {number} maxSeconds 
 * @param {number} deltaPerPlayer 
 * @returns {number} Tiempo en segundos
 */
export function calculateDynamicTimer(
  baseSeconds,
  playerCount,
  minSeconds = 10,
  maxSeconds = 120,
  deltaPerPlayer = 1
) {
  const scaled = baseSeconds + (playerCount - GLOBAL_CONSTRAINTS.MIN_PLAYERS) * deltaPerPlayer;
  return Math.min(Math.max(Math.round(scaled), minSeconds), maxSeconds);
}

/**
 * Determina el número de impostores según el tamaño de la sala.
 * @param {number} playerCount 
 * @returns {number}
 */
export function getImpostorCount(playerCount) {
  if (playerCount >= 8) return 2;
  return 1;
}

/**
 * Calcula la puntuación de un duelista en 'Duelo de Ocurrencias'.
 * @param {Object} params
 * @param {number} params.votesReceived - Votos válidos del jurado
 * @param {number} params.totalEligibleVoters - Votantes posibles (excluyendo a los duelistas)
 * @param {number} [params.roundNumber=1] - 1 o 2
 * @param {boolean} [params.hasAiBonus=false] - Ganó el Bono de la Crítica
 * @returns {number} Puntos totales calculados
 */
export function calculateDueloScore({
  votesReceived = 0,
  totalEligibleVoters = 0,
  roundNumber = 1,
  hasAiBonus = false
}) {
  const cfg = DUELO_OCURRENCIAS_CONFIG.scoring;
  const multiplier = cfg.roundMultipliers[roundNumber] || 1.0;

  let total = votesReceived * cfg.pointsPerVote * multiplier;

  // Barredora (Sweep): 100% de los votos del jurado (mínimo 2 votos)
  const isSweep = totalEligibleVoters >= 2 && votesReceived === totalEligibleVoters;
  if (isSweep) {
    total += cfg.sweepBonus * multiplier;
  }

  // Bono IA
  if (hasAiBonus) {
    total += cfg.aiCriticBonus * multiplier;
  }

  return Math.round(total);
}

/**
 * Retorna el multiplicador de remontada (Catch-up) para un jugador según su posición.
 * @param {number} playerRank - Posición (1 para el primer lugar, N para el último)
 * @param {number} totalPlayers - Total de jugadores en la sala
 * @returns {number} Factor multiplicador (1.0 a 1.5)
 */
export function getUnderdogMultiplier(playerRank, totalPlayers) {
  if (totalPlayers < 3) return 1.0;
  const isBottomThird = playerRank > Math.ceil(totalPlayers * (2 / 3));
  return isBottomThird ? 1.5 : 1.0;
}

/**
 * Obtiene el paquete de tutorial estructurado para el Host TV.
 * @param {string} gameId 
 * @returns {Object}
 */
export function getTutorial(gameId) {
  return TUTORIALS_CONFIG[gameId] || null;
}

/**
 * Obtiene la micro-instrucción contextual (CTA) para el mando móvil.
 * @param {string} gameId 
 * @param {string} phase 
 * @param {Object} [context={}] 
 * @returns {Object}
 */
export function getMobileCTA(gameId, phase, context = {}) {
  const gameCtas = MOBILE_CTAS[gameId];
  if (!gameCtas) {
    return {
      headline: '📱 ANFITRIÓN DE FIESTAS',
      instruction: 'Sigue las instrucciones en la pantalla principal.',
      badge: '👀 MIRA LA PANTALLA',
      subtext: ''
    };
  }

  if (gameId === 'duelo-ocurrencias') {
    if (phase === 'HOW_TO_PLAY') return gameCtas.HOW_TO_PLAY;
    if (phase === 'ANSWERING') {
      return context.hasSubmitted ? gameCtas.ANSWERING_SUBMITTED : gameCtas.ANSWERING_PENDING;
    }
    if (phase === 'VOTING') {
      if (context.isDuelist) return gameCtas.VOTING_DUELIST;
      if (context.hasVoted) return gameCtas.VOTING_SUBMITTED;
      return gameCtas.VOTING_VOTER;
    }
    if (phase === 'AI_JUDGING') return gameCtas.AI_JUDGING;
    if (phase === 'ROUND_RESULTS') return gameCtas.ROUND_RESULTS;
    if (phase === 'PODIUM') return gameCtas.PODIUM;
  }

  if (gameId === 'impostor-silicio') {
    if (phase === 'HOW_TO_PLAY') return gameCtas.HOW_TO_PLAY;
    if (phase === 'INTRO' || phase === 'ROLE_REVEAL') {
      return context.isImpostor ? gameCtas.ROLE_REVEAL_IMPOSTOR : gameCtas.ROLE_REVEAL_HUMAN;
    }
    if (phase === 'CLUES') {
      return context.hasSubmittedClue ? gameCtas.CLUES_SUBMITTED : gameCtas.CLUES_PENDING;
    }
    if (phase === 'DEBATE') return gameCtas.DEBATE;
    if (phase === 'VOTING') {
      return context.hasVoted ? gameCtas.VOTING_SUBMITTED : gameCtas.VOTING_PENDING;
    }
    if (phase === 'ESCAPE') {
      return context.isImpostor ? gameCtas.ESCAPE_IMPOSTOR : gameCtas.ESCAPE_SPECTATOR;
    }
    if (phase === 'RESULTS') return gameCtas.RESULTS;
  }

  if (gameId === 'dilemas-extremos') {
    if (phase === 'HOW_TO_PLAY') return gameCtas.HOW_TO_PLAY;
    if (phase === 'INTRO' || phase === 'DILEMMA_INTRO') return gameCtas.DILEMMA_INTRO;
    if (phase === 'CHOICE') {
      return context.hasSubmittedChoice ? gameCtas.CHOICE_SUBMITTED : gameCtas.CHOICE_PENDING;
    }
    if (phase === 'REVEAL') return gameCtas.REVEAL_METER;
    if (phase === 'RESULTS') return gameCtas.RESULTS;
  }

  return gameCtas[phase] || {
    headline: '📱 ANFITRIÓN DE FIESTAS',
    instruction: 'Presta atención a la pantalla principal.',
    badge: '👀 MIRA LA PANTALLA',
    subtext: ''
  };
}

/**
 * Calculates optimal dynamic round counts based on game mode and player count.
 * Jackbox Party Philosophy: Pacing is automatically calibrated to group size.
 * Small groups get tighter, focused rounds; larger groups get faster, punchier rounds to avoid downtime.
 *
 * @param {string} gameId
 * @param {number} playerCount
 * @returns {{ rounds: number, title: string, reason: string }}
 */
export function calculateDynamicRounds(gameId, playerCount = 3) {
  const count = Math.max(2, playerCount);

  switch (gameId) {
    case 'impostor-silicio': {
      return {
        rounds: 4,
        title: '🕵️ 4 RONDAS (PISTAS, CONTRA-INTERROGATORIO Y DESTIERRO)',
        reason: 'Estructura completa de deducción: Pistas iniciales, sospecha acumulada, careo directo y Votación Final con opción de fuga.'
      };
    }

    case 'duelo-ocurrencias': {
      return {
        rounds: 4,
        title: '🥊 4 RONDAS (CALENTAMIENTO, RIVALIDAD, DOBLES Y CLÍMAX)',
        reason: 'Permite a los jugadores soltar el ingenio, forjar rivalidades, remontar con puntos dobles y definir al campeón en un clímax épico.'
      };
    }

    case 'trivia-caotica': {
      return {
        rounds: 5,
        title: '🧠 5 RONDAS (POP, VELOCIDAD, PUNTOS DOBLES Y MUERTE SÚBITA)',
        reason: 'Curva dramática perfecta estilo Trivia Murder Party: conocimiento, asalto de puntos, penalizaciones y duelo decisivo final.'
      };
    }

    case 'telepatia-fiesta': {
      return {
        rounds: 4,
        title: count === 2 
          ? '💑 4 RONDAS ALTERNADAS (EMISOR VS LECTOR + CLÍMAX 3X)' 
          : '🧠 4 RONDAS DE MENTE COLMENA (CONSENSO CRECIENTE)',
        reason: count === 2
          ? '2 rondas completas para cada jugador alternando roles de Emisor y Adivinador con puntos crecientes.'
          : '4 dilemas subjetivos donde el grupo afina su sintonía mental hasta la ronda de puntos dobles.'
      };
    }

    case 'dilemas-extremos': {
      return {
        rounds: 5,
        title: '⚖️ 5 RONDAS (DEBATE ESCALONADO Y APUESTAS DE CONVICCIÓN)',
        reason: '5 dilemas absurdos y morales que permiten conocer a fondo la psicología del grupo y arriesgar fichas por la victoria.'
      };
    }

    case 'bomba-palabras': {
      return {
        rounds: 4,
        title: '💣 4 RONDAS (MECHA PROGRESIVA Y EXPLOSIÓN FINAL X3)',
        reason: '4 rondas de tensión creciente donde la mecha se acelera de 30s a 15s en la ronda decisiva.'
      };
    }

    case 'falso-sabio': {
      return {
        rounds: 4,
        title: '🎓 4 PREGUNTAS INSÓLITAS (FAROLES MAESTROS Y VERDAD FINAL)',
        reason: '4 rondas de mentiras ingeniosas que dan tiempo a los rezagados para tender trampas y recuperar terreno.'
      };
    }

    default:
      return {
        rounds: 4,
        title: '⭐ 4 RONDAS DINÁMICAS (SHOW COMPLETO)',
        reason: 'Duración ideal de 4 a 6 minutos para máxima diversión y revancha.'
      };
  }
}

// Exportación unificada por defecto
export default {
  GLOBAL_CONSTRAINTS,
  TUTORIALS_CONFIG,
  MOBILE_CTAS,
  DUELO_OCURRENCIAS_CONFIG,
  IMPOSTOR_SILICIO_CONFIG,
  DILEMAS_EXTREMOS_CONFIG,
  calculateDynamicTimer,
  calculateDynamicRounds,
  getImpostorCount,
  calculateDueloScore,
  getUnderdogMultiplier,
  getTutorial,
  getMobileCTA
};
