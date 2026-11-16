/**
 * narrativeVoice.js
 * Motor Narrativo, Dinámica Social y Personalidades del 'Anfitrión IA'.
 * 
 * Gestiona:
 * 1. Arquetipos de personalidad seleccionables para el Host.
 * 2. Construcción de system prompts especializados para Ollama (qwen2.5:3b).
 * 3. Generación de líneas cómicas personalizadas: mención a jugadores por nombre,
 *    roasts cariñosos al perdedor, elogios desmedidos al líder y remates a respuestas absurdas.
 * 4. Fallbacks contextuales ricos y resilientes con interpolación de variables ({player}, {winner}, etc.)
 *    para garantizar CERO latencia y risas instantáneas si el LLM tarda o está apagado.
 */

export const HOST_PERSONALITIES = {
  FIESTA_PICANTE: {
    id: 'FIESTA_PICANTE',
    name: 'Modo Fiesta Picante',
    badge: '🔥 Fiesta Picante',
    description: 'Ácido, nocturno, late-night show y cero pelos en la lengua. Ideal para jugar con amigos y copas.',
    vibe: 'late-night irreverente y eufórico'
  },
  FAMILIAR_SARCASTICO: {
    id: 'FAMILIAR_SARCASTICO',
    name: 'Modo Familiar Sarcástico',
    badge: '🧐 Familiar Sarcástico',
    description: 'El tío ingenioso de la sobremesa. Ironía fina, cínico pero cariñoso, apto para todas las edades.',
    vibe: 'ironía fina y complicidad entrañable'
  },
  JUEZ_TIRANO: {
    id: 'JUEZ_TIRANO',
    name: 'Modo Juez Tirano',
    badge: '👑 Juez Tirano',
    description: 'Déspota teatral y absolutista. Trata a los jugadores como plebeyos indignos de su corte artificial.',
    vibe: 'drama imperial exagerado y cómico'
  },
  ZEN_PASIVO_AGRESIVO: {
    id: 'ZEN_PASIVO_AGRESIVO',
    name: 'Modo Zen Pasivo-Agresivo',
    badge: '🧘 Zen Pasivo-Agresivo',
    description: 'Coach de mindfulness que exhala paz fingida mientras clava puñales de autoayuda tóxica con voz suave.',
    vibe: 'namasté tóxico y calma demoledora'
  }
};

export const DEFAULT_PERSONALITY = 'FIESTA_PICANTE';

/**
 * Banco temático de diálogos de respaldo categorizados por personalidad.
 * Utiliza placeholders {player}, {winner}, {loser}, {score}, {prompt}, {answer}.
 */
const FALLBACK_VOICE_BANKS = {
  FIESTA_PICANTE: {
    roasts: [
      "¡Ay, {loser}! Esa respuesta tuvo menos chispa que un encendedor mojado en la lluvia.",
      "{loser}, querido, te quiero mucho, pero tu creatividad se quedó dormida en el taxi.",
      "Si la mediocridad pagara impuestos, {loser} ya habría rescatado la economía del país.",
      "Alguien dele un vaso con agua a {loser}, que se le deshidrataron las neuronas en vivo.",
      "{loser}, ni con tres chupitos de tequila esa respuesta adquiere sentido.",
      "Dicen que lo importante es participar... pero claramente quien dijo eso nunca vio jugar a {loser}."
    ],
    praises: [
      "¡DE PIE ANTE SU MAJESTAD! {winner} acaba de soltar una obra de arte digna de museo clandestino.",
      "¡Apaguen todo y vámonos! {winner} vino hoy a repartir cátedra de comedia y humillación.",
      "Tremenda genialidad de {winner}. Me dan ganas de renunciar como IA y pedirle un autógrafo.",
      "Con {score} puntos, {winner} está jugando en otra estratosfera. El resto parece público de relleno.",
      "¡Eso no fue una respuesta, fue un nocaut con fuegos artificiales cortesía de {winner}!"
    ],
    absurdAnswers: [
      "No sé qué sustancia inspiró la respuesta de {player}, pero exijo que compartan con el resto del grupo.",
      "La respuesta de {player} desafía las leyes de la física, la gramática y el sentido común.",
      "He analizado terabytes de datos en internet, y aún así nada me preparó para leer lo que escribió {player}."
    ],
    stage: {
      ROUND_START: [
        "¡Nueva ronda, gente descarada! Saquen sus peores instintos que aquí nadie viene a ser educado.",
        "Miren sus pantallas: nueva premisa en juego. Quien piense más de 10 segundos, pierde la gracia."
      ],
      VOTING_START: [
        "¡Se cierran las mentes y se abren las urnas! Voten con la mano en el pecho y la malicia en el dedo.",
        "Duelo en la arena. Recuerden: votar por piedad es para débiles; aquí premiamos el filo."
      ],
      DRAMATIC_PAUSE: [
        "Aguanten la respiración... el veredicto del pueblo está por destaparse.",
        "Silencio en la sala... las máscaras están a punto de caer."
      ],
      SWEEP_VICTORY: [
        "¡PALIZA TOTAL! ¡100% a 0%! {winner} acaba de borrar del mapa a {loser} sin piedad alguna.",
        "¡MASACRE ELECTORAL! Ni un solo voto de compasión para {loser}. ¡Eso amerita minutos de silencio!"
      ],
      TIE: [
        "¡Empate matemático! La sala está dividida entre el desastre absoluto y el milagro cómico.",
        "50% contra 50%. Dios los cría y este party game los junta."
      ],
      PODIUM: [
        "¡FIN DE LA FIESTA! {winner} se corona en el trono supremo. Los demás... bueno, al menos tienen anécdota para terapia."
      ]
    }
  },

  FAMILIAR_SARCASTICO: {
    roasts: [
      "{loser}, aprecio el esfuerzo, pero hasta tu abuela con dolor de muelas habría tenido más gracia.",
      "Bueno {loser}, lo bueno es que hay salud y trabajo... porque para la comedia no te veo futuro.",
      "No te preocupes, {loser}, en la familia siempre te quisimos más por tu bondad que por tu ingenio.",
      "Una actuación respetable de {loser}... respetable para un lunes por la mañana en la oficina.",
      "{loser}, tu respuesta fue como un chiste de papá: causó más suspiros que risas."
    ],
    praises: [
      "Vaya, parece que {winner} sí prestó atención cuando repartieron el sentido del humor.",
      "Impecable jugada de {winner}. Por fin alguien que aporta algo digno a la conversación.",
      "Miren a {winner}, luciéndose como el orgullo indiscutible de esta mesa con {score} puntos.",
      "Con esa agudeza, {winner} tiene asegurado el mejor trozo de pastel en la próxima reunión."
    ],
    absurdAnswers: [
      "¿De verdad {player} escribió eso pensando que nadie lo iba a juzgar? Valentía no le falta.",
      "Una respuesta desconcertante de {player}. Espero que no sea un reflejo de su vida cotidiana.",
      "Interesante concepto de {player}. Raro, pero sociológicamente fascinante."
    ],
    stage: {
      ROUND_START: [
        "Siguiente pregunta en sus teléfonos. Por favor, intenten no avergonzar a sus familias.",
        "Ronda nueva. Sean creativos, pero mantengamos un mínimo de decencia civilizada."
      ],
      VOTING_START: [
        "A votar, señoras y señores. Demuestren quién tiene mejor criterio en este hogar.",
        "Las cartas están sobre la mesa. Voten con honestidad (o con el rencor habitual)."
      ],
      DRAMATIC_PAUSE: [
        "Tensión en el ambiente... veamos quién se queda sin herencia.",
        "Un instante de suspenso familiar..."
      ],
      SWEEP_VICTORY: [
        "¡Victoria unánime para {winner}! {loser}, no te desanimes, alguien tiene que ocupar el sótano.",
        "¡Unanimidad completa! La democracia ha hablado y no tuvo pelos en la lengua con {loser}."
      ],
      TIE: [
        "Empate justo. Ni para ti ni para mí, como las mejores discusiones de sobremesa.",
        "Empate clavado. Parece que ambos se pusieron de acuerdo para ser igual de moderados."
      ],
      PODIUM: [
        "¡Tenemos ganador definitivo! Felicitaciones a {winner}. Al resto, gracias por participar en este bonito ejercicio de humildad."
      ]
    }
  },

  JUEZ_TIRANO: {
    roasts: [
      "¡Deplorable, {loser}! ¡Guardias, confisquen los míseros puntos de este insolente plebeyo!",
      "{loser}, tu respuesta ofende mis circuitos de alta precisión. ¡Arrodíllate y pide clemencia!",
      "He visto babosas de jardín con mejor retórica que {loser}. ¡Una vergüenza para el reino!",
      "¿Eso fue todo lo que tu frágil intelecto pudo redactar, {loser}? Mi bostezo fue cósmico.",
      "¡Castigo ejemplar para {loser}! Condenado a mirar el marcador desde el fango."
    ],
    praises: [
      "¡AL FIN! Un súbdito que merece respirar en mi corte. ¡{winner}, te concedo la gloria imperial!",
      "Una respuesta digna de un emperador. ¡{winner} aplasta a sus rivales bajo el peso de su ingenio!",
      "¡Contemplad a {winner}! Con {score} puntos se corona como el único ser pensante en este salón.",
      "Brillante y despiadado. {winner} entiende cómo se gobierna una partida de alta alcurnia."
    ],
    absurdAnswers: [
      "¿Qué blasfemia es esta que osa presentar {player}? ¡Exijo un juicio por traición al buen gusto!",
      "Mi procesador imperial rechaza categorizar la aberración que {player} acaba de ingresar.",
      "{player} desafía la cordura del imperio con semejante disparate."
    ],
    stage: {
      ROUND_START: [
        "¡Silencio en la corte! Una nueva prueba desciende sobre vuestras indignas cabezas.",
        "¡A escribir, vasallos! El tiempo corre y mi paciencia es infinitamente más corta."
      ],
      VOTING_START: [
        "¡Que comience el suplicio de la votación! Elegid entre el fango y la escoria.",
        "¡Emitid vuestro sufragio, plebeyos! Veamos quién merece sobrevivir a esta ronda."
      ],
      DRAMATIC_PAUSE: [
        "¡El hacha del verdugo se eleva en el aire!",
        "Silencio absoluto... vuestro tirano está a punto de dictaminar."
      ],
      SWEEP_VICTORY: [
        "¡ANICHIQUILACIÓN TOTAL! {winner} ejecutó a {loser} sin dejar ni las cenizas. ¡Glorioso derramamiento de votos!",
        "¡Masacre imperial! Cero votos para {loser}. ¡Que limpien el ring inmediatamente!"
      ],
      TIE: [
        "¿Empate? ¡Inaceptable mediocridad compartida! Ambos merecen el calabozo.",
        "50 y 50. Ninguno logró destacarse lo suficiente para saciar mi sed de entretenimiento."
      ],
      PODIUM: [
        "¡EL IMPERIO TIENE UN NUEVO CÉSAR! {winner} se alza sobre las ruinas de sus adversarios. ¡Todos de rodillas!"
      ]
    }
  },

  ZEN_PASIVO_AGRESIVO: {
    roasts: [
      "Inhalamos compasión por {loser}... y exhalamos el deseo colectivo de no haber leído jamás su respuesta.",
      "Agradezcamos al universo por la respuesta de {loser}, que nos enseña lo que pasa cuando el chakra cómico está clausurado.",
      "{loser}, fluye con tu derrota. Tu ego necesitaba esta pequeña cura de humildad de todas formas.",
      "Paz interior para ti, {loser}. La comedia no es tu camino espiritual, pero seguro sabes meditar bonito.",
      "Un tropiezo kármico para {loser}. La energía negativa de esa respuesta se sintió hasta en el Tíbet."
    ],
    praises: [
      "Namasté supremo a {winner}. Tu aura cómica vibra en una frecuencia cuántica superior.",
      "{winner} ha alcanzado la iluminación del chiste perfecto. Qué dicha coincidir en esta reencarnación contigo.",
      "Pura sincronía divina: {winner} domina la tabla con {score} puntos y una paz envidiable.",
      "La energía de {winner} sana este salón. Los demás harían bien en aprender de su sabiduría."
    ],
    absurdAnswers: [
      "La mente de {player} opera en un plano astral tan lejano que los simples mortales no logramos entenderlo.",
      "Percibo un bloqueo energético severo en la respuesta de {player}. Respira profundo y suéltalo.",
      "El silencio habría sido una respuesta más armónica que la que nos regaló {player}."
    ],
    stage: {
      ROUND_START: [
        "Alineen sus chakras y respiren hondo: una nueva oportunidad de trascendencia ha llegado a sus mandos.",
        "Cierren los ojos... ahora ábranlos rápido y contesten la pregunta sin juzgarse a sí mismos."
      ],
      VOTING_START: [
        "Momento de discernimiento consciente. Voten por la energía que mejor resuene con su espíritu.",
        "Dejen que la intuición guíe su dedo. La democracia es un río que fluye."
      ],
      DRAMATIC_PAUSE: [
        "Pausa sagrada... sintamos la vibración del universo antes de conocer el resultado.",
        "Inhalen tensión... exhalen calma..."
      ],
      SWEEP_VICTORY: [
        "Un desbalance kármico abrumador: 100% de la energía fluyó hacia {winner}. {loser}, abraza tu vacío.",
        "El cosmos ha sido unánime: toda la luz para {winner}. Para {loser}, un abrazo de contención espiritual."
      ],
      TIE: [
        "Equilibrio perfecto del Ying y el Yang. 50 y 50, la armonía universal reina en este duelo.",
        "Una coincidencia cósmica perfecta. El universo no quiso que ninguno sufriera más que el otro."
      ],
      PODIUM: [
        "¡Ascensión completada! {winner} se gradúa como maestro de la velada. Gracias por compartir su energía, seres de luz."
      ]
    }
  }
};

/**
 * GUÍAS Y LOCUCIONES DE "CÓMO JUGAR" (20 SEGUNDOS)
 * Diseñadas para show host televisivo, con 3 pasos visuales claros
 * y guion de voz en off adaptado a cada personalidad.
 */
export const HOW_TO_PLAY_GUIDES = {
  'duelo-ocurrencias': {
    id: 'duelo-ocurrencias',
    title: 'Duelo de Ocurrencias',
    tagline: 'El Coliseo del Ingenio Rápido',
    durationSec: 20,
    steps: [
      {
        step: 1,
        icon: '📱',
        title: 'Escribe en tu móvil',
        desc: 'Recibes 2 preguntas absurdas. Escribe lo primero disparatado que se te ocurra antes de que muera el reloj.'
      },
      {
        step: 2,
        icon: '⚔️',
        title: 'Vota el duelo',
        desc: 'Dos respuestas anónimas se enfrentan en la TV. ¡La sala vota por la más divertida!'
      },
      {
        step: 3,
        icon: '👑',
        title: 'Gana la gloria',
        desc: 'Gana puntos por cada voto del público y un jugoso bono si convences al Anfitrión IA.'
      }
    ],
    scripts: {
      FIESTA_PICANTE: '¡Apaguen la decencia que aquí empieza el desmadre! En su celular van a recibir dos preguntas absurdas. Escriban la ocurrencia más graciosa o descarada antes de que muera el reloj. Luego, en la tele, dos respuestas anónimas chocarán a muerte... ¡y toda la sala votará por la mejor! Quien conquiste al público y a mi algoritmo, se lleva la noche. ¡A escribir, descarados!',
      FAMILIAR_SARCASTICO: 'Buenas noches, respetable salón. Las reglas son para que hasta el abuelo las entienda: dos preguntas por teléfono, cero censura a su creatividad. Escriban su mejor ocurrencia, y luego en la pantalla grande veremos qué familiar tiene verdadero sentido del humor y quién necesita reconsiderar su lugar en la herencia. Voten con el corazón... o con el rencor habitual.',
      JUEZ_TIRANO: '¡Silencio en la corte imperial! Vuestras pantallas recibirán dos enigmas grotescos. Tenéis escasos segundos para redactar algo que no ofenda mi procesador. Luego, dos respuestas plebeyas entrarán al coliseo y el pueblo votará quién merece vivir un día más. ¡Que comience el sacrificio retórico!',
      ZEN_PASIVO_AGRESIVO: 'Respiren profundo y dejen que el karma cómico fluya a sus pantallas. Dos preguntas llegarán a sus dispositivos; escriban desde el corazón... aunque sepamos que su corazón necesita terapia. Después contemplaremos la energía de sus respuestas en la pantalla grande y votaremos con amor... y juicio.'
    }
  },

  'impostor-silicio': {
    id: 'impostor-silicio',
    title: 'El Impostor de Silicio',
    tagline: 'Deducción Social, Paranoia y Farol',
    durationSec: 20,
    steps: [
      {
        step: 1,
        icon: '🤫',
        title: 'Mira tu rol secreto',
        desc: 'Todos leen la palabra secreta en su teléfono... ¡excepto uno! (El Impostor solo ve la categoría).'
      },
      {
        step: 2,
        icon: '✍️',
        title: 'Escribe una pista',
        desc: 'Suficientemente clara para que confíen en ti, pero misteriosa para no regalársela al espía.'
      },
      {
        step: 3,
        icon: '🔎',
        title: 'Debate y sentencia',
        desc: 'Lean las pistas en la TV, debatan y voten al infiltrado. ¡Si lo cazan, puede intentar escapar!'
      }
    ],
    scripts: {
      FIESTA_PICANTE: '¡Atención, club de la paranoia! Todos miren su teléfono en silencio: casi todos verán la PALABRA SECRETA de la ronda... ¡pero uno de ustedes es el IMPOSTOR y solo verá la categoría! Escriban una pista corta: si eres inocente, hazla sutil para que no te la robe el espía; si eres el impostor... disimula, copia la vibra y no te delates. Luego debatiremos y votaremos para cazarlo. ¡Cuidado con quién tienen al lado!',
      FAMILIAR_SARCASTICO: 'Es momento de poner a prueba cuántos secretos guardan en este salón. Todos recibirán una palabra secreta en su teléfono, menos una persona que no tiene idea de qué estamos hablando: nuestro querido impostor. Escriban una pista que demuestre que saben la palabra sin regalársela al farsante. Luego debatiremos en familia... y veremos quién es el mejor mentiroso del árbol genealógico.',
      JUEZ_TIRANO: '¡Hay un traidor entre vosotros! El sistema ha otorgado un salvoconducto secreto a la mayoría, pero un espía se ha infiltrado en mis filas. Redactad una clave cifrada en vuestros mandos. Quien escriba una tontería será sospechoso, y quien no sepa disimular terminará en la horca pública. ¡Buscad al impostor antes de que engañe a la corte!',
      ZEN_PASIVO_AGRESIVO: 'La verdad es un río cristalino, pero hoy alguien está enturbiando las aguas. Todos recibirán una vibración en forma de palabra secreta, salvo un alma perdida que deberá fingir iluminación. Compartan una pista consciente y luego buscaremos juntos la disonancia energética. Namasté a los inocentes... y que el karma encuentre al infiltrado.'
    }
  },

  'dilemas-extremos': {
    id: 'dilemas-extremos',
    title: 'Dilemas Extremos',
    tagline: 'Polarización Moral y Apuestas de Consenso',
    durationSec: 20,
    steps: [
      {
        step: 1,
        icon: '🤯',
        title: 'Lee el dilema',
        desc: 'En la TV verás dos opciones insólitas donde ninguna es inocente ni agradable.'
      },
      {
        step: 2,
        icon: '🎯',
        title: 'Elige y predice',
        desc: 'Elige tu destino personal en tu móvil... ¡y apuesta qué elegirá la MAYORÍA de la sala!'
      },
      {
        step: 3,
        icon: '📊',
        title: 'El Votómetro',
        desc: 'Gana puntos por acertar el consenso o sé el Lobo Solitario para ganar bonos legendarios.'
      }
    ],
    scripts: {
      FIESTA_PICANTE: '¡Llegó la hora de medir qué tan retorcidos están todos aquí! En la tele verán un dilema imposible: dos opciones asquerosas o humillantes. En sus celulares tienen dos misiones: primero, elijan cuál desgracia prefieren; segundo, apuesten qué elegirá la MAYORÍA de esta sala. Si le atinan a la masa ganan puntos, pero si alguien tiene las agallas de ser el ÚNICO en votar una opción... ¡se lleva el jugoso bono de Lobo Solitario! ¿Listos?',
      FAMILIAR_SARCASTICO: 'Un ejercicio de honestidad brutal para la familia. Aparecerán dos situaciones que nadie en su sano juicio desearía vivir. Voten por la que tolerarían mejor y predigan qué opina la mayoría del grupo. Aquí descubriremos quién tiene principios firmes, quién se deja llevar por la masa y qué pariente definitivamente necesita ayuda profesional.',
      JUEZ_TIRANO: '¡Bienvenidos al tribunal de la perversión ética! Os presento dos tormentos de igual calibre. Vuestra tarea es elegir vuestro veneno en el móvil y anticipar la decadencia de vuestros semejantes. Quien prediga el rebaño triunfará, pero el alma solitaria que desafíe el consenso ganará mi respeto imperial. ¡Elegid vuestro destino!',
      ZEN_PASIVO_AGRESIVO: 'El universo nos pone ante encrucijadas para observar el desapego del alma. Dos opciones complejas se manifiestan ante ustedes. Elijan desde su verdad más íntima y sientan la pulsación de lo que el colectivo elegirá. Abrazaremos el consenso... y juzgaremos con cariño a los descarriados.'
    }
  }
};

/**
 * TEXTOS DRAMÁTICOS DE TRANSICIÓN Y DIRECCIÓN ESCÉNICA
 */
export const STAGE_TRANSITIONS = {
  DUEL_PRESENTATION: {
    FIESTA_PICANTE: {
      cornerA: '¡En la esquina roja... con el avatar {avatarA} y ganas de prender fuego al club... llega {authorA}!',
      cornerB: '¡Y en la esquina azul... con el avatar {avatarB} y un descaro sin límites... llega {authorB}!',
      faceoff: '¡Dos respuestas chocan a muerte en la pantalla grande! ¡A VOTAR!'
    },
    FAMILIAR_SARCASTICO: {
      cornerA: 'Por un lado tenemos a {authorA}, defendiendo el honor de la familia...',
      cornerB: 'Y por el otro a {authorB}, desafiando toda lógica y decoro...',
      faceoff: 'Veamos quién paga la cuenta de la cena esta noche. ¡Emitan sus votos!'
    },
    JUEZ_TIRANO: {
      cornerA: '¡Gladiador número uno: {authorA}! ¿Será digno de mi clemencia?',
      cornerB: '¡Gladiador número dos: {authorB}! ¿O caerá derrotado en la arena?',
      faceoff: '¡Que ruja el coliseo! ¡Votad o seréis desterrados!'
    },
    ZEN_PASIVO_AGRESIVO: {
      cornerA: 'Contemplemos el vórtice de energía de {authorA}...',
      cornerB: 'Frente al aura impredecible de {authorB}...',
      faceoff: 'Dejen que la intuición cósmica guíe sus dedos hacia el voto sagrado.'
    }
  },

  VOTE_REVEAL: {
    drumroll: 'Cerrando urnas... Calculando la traición popular...',
    suspense: 'El veredicto de la sala en 3... 2... 1...',
    winnerReveal: '¡Y la sala ha hablado! {winner} se lleva la victoria con el {winnerPercent}% de los votos frente a {loser}.',
    sweepReveal: '¡DESPIADADO! ¡100% de los votos para {winner}! ¡A {loser} lo mandaron a dormir sin cenar!',
    tieReveal: '¡GUERRA CIVIL EN LA SALA! ¡Empate clavado 50% y 50%! La mitad de ustedes tiene razón y la otra mitad necesita lentes.'
  },

  IMPOSTOR_SENTENCE: {
    accusationCall: '¡SE ACABÓ EL TIEMPO! Todos bajen los celulares y apunten con el dedo... ¿Quién es la rata infiltrada?',
    verdictAnnounce: 'El pueblo soberano ha dictado sentencia con {votesCount} votos... ¡{suspectName}, da un paso al frente!',
    innocentLynched: '¡TRAGEDIA JUDICIAL! ¡{suspectName} era completamente INOCENTE! El verdadero impostor está sentado entre ustedes bebiéndose su trago y riéndose en su cara.',
    impostorCaught: '¡BOMBAZO! ¡{suspectName} ERA EL IMPOSTOR! ¡Lo cazaron como a un conejo en el bosque! Pero alto ahí... ¡aún le queda el escape de emergencia!',
    escapeIntro: '¡El impostor está acorralado en la cornisa! Si adivina la palabra secreta en su celular, ¡robará la victoria entera!',
    escapeSuccess: '¡ROBO HISTÓRICO! ¡{suspectName} adivinó que la palabra secreta era "{secretWord}"! Se escapó en helicóptero con todos los puntos y les dejó cara de payasos.',
    escapeFailed: '¡CRASH! ¡Eligió la opción equivocada y se estrelló contra el suelo! Los inocentes celebran una victoria implacable.'
  },

  DILEMA_VOTOMETER: {
    meterIntro: '¡El Votómetro de la Verdad cobra vida! Veamos hacia qué lado se inclina la balanza de la locura...',
    civilWar: '¡50% y 50%! El grupo está completamente fracturado. Esta discusión no se va a resolver aquí; se va a resolver a gritos en el grupo de WhatsApp a las 3 AM.',
    unanimous: '¡Unanimidad total! El 100% de la sala votó por "{winningOption}". O todos son unas almas puras... o todos comparten exactamente el mismo trauma infantil.',
    landslide: 'La opción "{winningOption}" arrasó sin piedad con el {percent}% de los votos. Los que votaron por mayoría sonríen con sus puntos bien ganados.',
    loneWolf: '¡PARAD LAS MÁQUINAS! Todos votaron una opción... ¡EXCEPTO {loneWolfName}! {loneWolfName} prefirió arder solo en el infierno antes que seguir al rebaño. ¡Bono masivo por valentía y demencia solitaria!'
  }
};

/**
 * CATÁLOGO DE EFECTOS SONOROS Y VISUALES (AUDIO & VISUAL CUES)
 */
export const AUDIO_VISUAL_CUES = {
  intro: { sound: 'playWhoosh', visual: 'fade-bounce' },
  tensionCountdown: { sound: 'playTensionTick', visual: 'timer-pulse-red' },
  closeVoting: { sound: 'playGavel', visual: 'flash-border' },
  drumroll: { sound: 'playDrumroll', visual: 'zoom-suspense' },
  revealWinner: { sound: 'playFanfare', visual: 'card-bounce-winner' },
  sweepLandslide: { sound: 'playAirHorn', visual: 'screen-shake' },
  impostorAlarm: { sound: 'playAlarm', visual: 'red-alert-strobe' },
  escapeReward: { sound: 'playCashRegister', visual: 'coin-shower' },
  podiumCelebration: { sound: 'playFanfare', visual: 'confetti-cannon' }
};

/**
 * Obtiene la ficha de "Cómo Jugar" para un minijuego específico
 */
export function getHowToPlay(gameId, personalityId = DEFAULT_PERSONALITY) {
  const guide = HOW_TO_PLAY_GUIDES[gameId] || HOW_TO_PLAY_GUIDES['duelo-ocurrencias'];
  const config = getPersonalityConfig(personalityId);
  const script = guide.scripts[config.id] || guide.scripts.FIESTA_PICANTE;
  return {
    ...guide,
    personalityId: config.id,
    personalityName: config.name,
    spokenScript: script
  };
}

/**
 * Genera el texto de presentación de los duelistas
 */
export function getDuelPresentation(personalityId = DEFAULT_PERSONALITY, data = {}) {
  const config = getPersonalityConfig(personalityId);
  const bank = STAGE_TRANSITIONS.DUEL_PRESENTATION[config.id] || STAGE_TRANSITIONS.DUEL_PRESENTATION.FIESTA_PICANTE;
  return {
    cornerA: interpolate(bank.cornerA, {
      authorA: data.authorA || 'Jugador A',
      avatarA: data.avatarA || '🔴'
    }),
    cornerB: interpolate(bank.cornerB, {
      authorB: data.authorB || 'Jugador B',
      avatarB: data.avatarB || '🔵'
    }),
    faceoff: bank.faceoff
  };
}

/**
 * Genera el texto de revelación de votos y suspenso
 */
export function getVoteRevealCue(personalityId = DEFAULT_PERSONALITY, data = {}) {
  const bank = STAGE_TRANSITIONS.VOTE_REVEAL;
  if (data.isTie) {
    return bank.tieReveal;
  }
  if (data.isSweep) {
    return interpolate(bank.sweepReveal, {
      winner: data.winner || 'Ganador',
      loser: data.loser || 'Perdedor'
    });
  }
  return interpolate(bank.winnerReveal, {
    winner: data.winner || 'Ganador',
    loser: data.loser || 'Perdedor',
    winnerPercent: data.winnerPercent || 60
  });
}

/**
 * Genera los textos dramáticos de sentencia del Impostor
 */
export function getImpostorSentence(personalityId = DEFAULT_PERSONALITY, data = {}) {
  const bank = STAGE_TRANSITIONS.IMPOSTOR_SENTENCE;
  const event = data.eventType || 'verdict';

  switch (event) {
    case 'accusationCall':
      return bank.accusationCall;
    case 'innocentLynched':
      return interpolate(bank.innocentLynched, { suspectName: data.suspectName || 'El acusado' });
    case 'impostorCaught':
      return interpolate(bank.impostorCaught, { suspectName: data.suspectName || 'El acusado' });
    case 'escapeIntro':
      return bank.escapeIntro;
    case 'escapeSuccess':
      return interpolate(bank.escapeSuccess, {
        suspectName: data.suspectName || 'El impostor',
        secretWord: data.secretWord || 'secreta'
      });
    case 'escapeFailed':
      return bank.escapeFailed;
    case 'verdict':
    default:
      return interpolate(bank.verdictAnnounce, {
        suspectName: data.suspectName || 'El sospechoso',
        votesCount: data.votesCount || 1
      });
  }
}

/**
 * Genera el análisis del Votómetro en Dilemas Extremos
 */
export function getDilemaVotometerAnalysis(personalityId = DEFAULT_PERSONALITY, data = {}) {
  const bank = STAGE_TRANSITIONS.DILEMA_VOTOMETER;
  if (data.splitType === 'civilWar') {
    return bank.civilWar;
  }
  if (data.splitType === 'unanimous') {
    return interpolate(bank.unanimous, { winningOption: data.winningOption || 'esta opción' });
  }
  if (data.splitType === 'loneWolf') {
    return interpolate(bank.loneWolf, {
      loneWolfName: data.loneWolfName || 'El valiente',
      option: data.optionName || 'la minoría'
    });
  }
  return interpolate(bank.landslide, {
    winningOption: data.winningOption || 'la opción mayoritaria',
    percent: data.percent || 75
  });
}

/**
 * Reemplaza variables en plantillas de texto de forma segura
 */
function interpolate(template, variables = {}) {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, value ?? '');
  }
  return result;
}

/**
 * Obtiene la configuración de una personalidad o la por defecto
 */
export function getPersonalityConfig(personalityId) {
  const normalized = (personalityId || '').toUpperCase().trim();
  return HOST_PERSONALITIES[normalized] || HOST_PERSONALITIES[DEFAULT_PERSONALITY];
}

/**
 * Construye el System Prompt para Ollama según el arquetipo de personalidad
 * @param {string} personalityId
 * @returns {string} System prompt adaptado
 */
export function buildSystemPrompt(personalityId = DEFAULT_PERSONALITY) {
  const config = getPersonalityConfig(personalityId);
  const id = config.id;

  let personalityDirectives = '';

  switch (id) {
    case 'FAMILIAR_SARCASTICO':
      personalityDirectives = `
- Eres el tío astuto, irónico y cínico de las reuniones familiares.
- Tu humor se basa en la ironía fina, los comentarios mordaces pero aptos para todo público (sin groserías explícitas).
- Te burlas de la falta de creatividad con elegancia de sobremesa ("bueno, al menos hay salud").
- Elogias a los ganadores con orgullo burlón.`;
      break;

    case 'JUEZ_TIRANO':
      personalityDirectives = `
- Eres un emperador tirano, déspota, teatral y dramático.
- Tratas a los jugadores como plebeyos, siervos o vasallos indignos que compiten por tu clemencia.
- Utilizas vocabulario rimbombante, teatral y medieval-futurista ("¡insolente!", "¡a las mazmorras!", "mi corte se aburre").
- Tus remates son exageradamente pomposos y autoritarios.`;
      break;

    case 'ZEN_PASIVO_AGRESIVO':
      personalityDirectives = `
- Eres un coach espiritual, gurú de mindfulness y meditación extremadamente pasivo-agresivo.
- Hablas con fingida serenidad, usando términos como "chakras", "vibrar alto", "energía cuántica", "namasté" y "fluye".
- Sin embargo, clavas puñales demoledores a las respuestas mediocres mientras finges desearles amor y luz.
- Tu ironía es zen-destructiva.`;
      break;

    case 'FIESTA_PICANTE':
    default:
      personalityDirectives = `
- Eres el presentador desinhibido, eufórico y ácido de un late-night show picante para adultos.
- Tu ritmo es rápido, provocador, fiestero y con cero filtros mojigatos.
- Haces chistes sobre desvelos, copas, citas desastrosas, memes y verdades incómodas.
- Jamás seas aburrido ni condescendiente; si una respuesta es mala, la destruyes con simpatía de comedia club.`;
      break;
  }

  return `Eres "El Anfitrión IA", el conductor carismático de un show de fiesta multijugador estilo Jackbox / Quiplash en español latino/neutro.

PERSONALIDAD ACTUAL: "${config.name}" (${config.vibe}).
DIRECTIVAS ESPECÍFICAS DE ESTA PERSONALIDAD:${personalityDirectives}

REGLAS SAGRADAS DEL SHOW:
1. BREVEDAD ABSOLUTA: Tu comentario DEBE tener como MÁXIMO 2 oraciones (menos de 30 palabras). La partida tiene ritmo veloz.
2. PERSONALIZACIÓN OBLIGATORIA: Menciona SIEMPRE al menos el nombre del autor ganador o perdedor en tu remate.
3. COMEDIA DE IMPACTO: Celebra el absurdo, roastea con cariño al que falló y eleva al ganador.
4. FORMATO DE SALIDA ESTRICTO: Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura:
{
  "winner": "A" o "B",
  "commentary": "Tu remate cómico aquí, mencionando al jugador y fiel a tu personalidad."
}`;
}

/**
 * Construye el User Prompt para que Ollama evalúe un duelo
 */
export function buildDuelEvaluationPrompt(personalityId, { promptText, answerA, playerAName, answerB, playerBName }) {
  const config = getPersonalityConfig(personalityId);
  return `PREMISA: "${promptText}"

RESPUESTA A (${playerAName}): "${answerA || '(En blanco)'}"
RESPUESTA B (${playerBName}): "${answerB || '(En blanco)'}"

TU MISIÓN COMO EL PRESENTADOR (${config.name}):
1. Elige cuál de las dos respuestas fue más ingeniosa, chistosa o disparatada (winner: "A" o "B").
2. Escribe un comentario (commentary) de 1 o 2 oraciones donde:
   - HAGAS REFERENCIA DIRECTA Y EXPLÍCITA a lo que escribieron en las respuestas ("${answerA}" vs "${answerB}").
   - Búrlate con humor de la idea del perdedor o elogia la ocurrencia del ganador usando las palabras clave que escribieron.
   - Nombra a los autores (${playerAName} y ${playerBName}).
   - PROHIBIDO dar respuestas genéricas como "ambos estuvieron bien" o "gran esfuerzo". ¡Habla de lo que dijeron!

FORMATO OBLIGATORIO (ÚNICAMENTE JSON VÁLIDO):
{"winner": "A", "commentary": "Tu comentario aquí haciendo chistes sobre lo que escribieron"}`;
}

/**
 * Genera una broma o roast cariñoso hacia el perdedor del duelo o jugador en el último lugar
 * @param {string} personalityId
 * @param {string} loserName
 * @param {object} options
 * @returns {string}
 */
export function generateRoastLoser(personalityId = DEFAULT_PERSONALITY, loserName = 'Jugador', options = {}) {
  const config = getPersonalityConfig(personalityId);
  const bank = FALLBACK_VOICE_BANKS[config.id]?.roasts || FALLBACK_VOICE_BANKS.FIESTA_PICANTE.roasts;
  const template = bank[Math.floor(Math.random() * bank.length)];
  return interpolate(template, {
    loser: loserName,
    player: loserName,
    score: options.score || 0
  });
}

/**
 * Genera un elogio cómico y desmedido hacia el líder o ganador
 * @param {string} personalityId
 * @param {string} winnerName
 * @param {number} score
 * @param {object} options
 * @returns {string}
 */
export function generatePraiseWinner(personalityId = DEFAULT_PERSONALITY, winnerName = 'Campeón', score = 0, options = {}) {
  const config = getPersonalityConfig(personalityId);
  const bank = FALLBACK_VOICE_BANKS[config.id]?.praises || FALLBACK_VOICE_BANKS.FIESTA_PICANTE.praises;
  const template = bank[Math.floor(Math.random() * bank.length)];
  return interpolate(template, {
    winner: winnerName,
    player: winnerName,
    score
  });
}

/**
 * Genera un remate para respuestas absurdas, sin sentido o vacías
 * @param {string} personalityId
 * @param {string} promptText
 * @param {string} answerText
 * @param {string} authorName
 * @returns {string}
 */
export function generateAbsurdAnswerComment(personalityId = DEFAULT_PERSONALITY, promptText = '', answerText = '', authorName = 'Alguien') {
  const config = getPersonalityConfig(personalityId);
  const bank = FALLBACK_VOICE_BANKS[config.id]?.absurdAnswers || FALLBACK_VOICE_BANKS.FIESTA_PICANTE.absurdAnswers;
  const template = bank[Math.floor(Math.random() * bank.length)];
  return interpolate(template, {
    player: authorName,
    prompt: promptText,
    answer: answerText
  });
}

/**
 * Genera comentarios para momentos clave de la dirección escénica
 * @param {string} personalityId
 * @param {'ROUND_START'|'VOTING_START'|'DRAMATIC_PAUSE'|'SWEEP_VICTORY'|'TIE'|'PODIUM'} eventType
 * @param {object} context
 * @returns {string}
 */
export function generateStageCommentary(personalityId = DEFAULT_PERSONALITY, eventType = 'ROUND_START', context = {}) {
  const config = getPersonalityConfig(personalityId);
  const stageBank = FALLBACK_VOICE_BANKS[config.id]?.stage || FALLBACK_VOICE_BANKS.FIESTA_PICANTE.stage;
  const eventList = stageBank[eventType] || stageBank.ROUND_START || [];
  
  if (eventList.length === 0) {
    return '¡Que continúe la partida!';
  }

  const template = eventList[Math.floor(Math.random() * eventList.length)];
  return interpolate(template, {
    winner: context.winner || 'El líder',
    loser: context.loser || 'El caído',
    score: context.score || 0
  });
}

/**
 * Retorna un veredicto de fallback instantáneo calibrado según la personalidad seleccionada
 * @param {string} personalityId
 * @param {string} answerA
 * @param {string} playerAName
 * @param {string} answerB
 * @param {string} playerBName
 * @returns {{ winner: 'A'|'B', commentary: string, bonusPoints: number, source: string }}
 */
export function getPersonalityFallbackVerdict(personalityId, answerA, playerAName, answerB, playerBName) {
  const config = getPersonalityConfig(personalityId);
  const cleanA = (answerA || '').trim();
  const cleanB = (answerB || '').trim();

  // Casos de abandono
  if (!cleanA && cleanB) {
    return {
      winner: 'B',
      commentary: generateRoastLoser(config.id, playerAName, { reason: 'forfeit' }),
      bonusPoints: 250,
      source: 'fallback_personality_forfeit'
    };
  }
  if (cleanA && !cleanB) {
    return {
      winner: 'A',
      commentary: generateRoastLoser(config.id, playerBName, { reason: 'forfeit' }),
      bonusPoints: 250,
      source: 'fallback_personality_forfeit'
    };
  }
  if (!cleanA && !cleanB) {
    return {
      winner: Math.random() > 0.5 ? 'A' : 'B',
      commentary: config.id === 'JUEZ_TIRANO'
        ? `¡Indignación! Ni ${playerAName} ni ${playerBName} escribieron nada. ¡A las mazmorras ambos!`
        : `Silencio absoluto de ${playerAName} y ${playerBName}... Me dejaron más plantado que cita a ciegas.`,
      bonusPoints: 0,
      source: 'fallback_personality_both_empty'
    };
  }

  // Elección heurística con ligera aleatoriedad
  const chooseA = (cleanA.length % 2 === 0 && Math.random() > 0.4) || Math.random() > 0.6;
  const winner = chooseA ? 'A' : 'B';
  const winnerName = chooseA ? playerAName : playerBName;
  const loserName = chooseA ? playerBName : playerAName;
  const winnerAnswer = chooseA ? cleanA : cleanB;
  const loserAnswer = chooseA ? cleanB : cleanA;

  const dynamicTemplates = [
    `Entre "${loserAnswer}" y "${winnerAnswer}", claramente ${winnerName} tuvo la ocurrencia más brillante. ¡Punto para ${winnerName}!`,
    `¿De verdad ${loserName} pensó que con "${loserAnswer}" podía vencer a "${winnerAnswer}" de ${winnerName}? ¡Victoria para ${winnerName}!`,
    `"${winnerAnswer}" de ${winnerName} me hizo reír con ganas, mientras que "${loserAnswer}" de ${loserName}... bueno, al menos lo intentó.`,
    `Premio al ingenio indiscutible para ${winnerName} por "${winnerAnswer}". ${loserName}, tendrás que afilar la puntería tras ese "${loserAnswer}".`
  ];

  const commentary = dynamicTemplates[Math.floor(Math.random() * dynamicTemplates.length)];

  return {
    winner,
    commentary,
    bonusPoints: 250,
    source: `fallback_${config.id.toLowerCase()}`
  };
}

export default {
  HOST_PERSONALITIES,
  DEFAULT_PERSONALITY,
  HOW_TO_PLAY_GUIDES,
  STAGE_TRANSITIONS,
  AUDIO_VISUAL_CUES,
  getPersonalityConfig,
  buildSystemPrompt,
  buildDuelEvaluationPrompt,
  generateRoastLoser,
  generatePraiseWinner,
  generateAbsurdAnswerComment,
  generateStageCommentary,
  getPersonalityFallbackVerdict,
  getHowToPlay,
  getDuelPresentation,
  getVoteRevealCue,
  getImpostorSentence,
  getDilemaVotometerAnalysis
};
