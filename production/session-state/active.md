# Active Session State — Game Studios

## Project
**Anfitrión de Fiestas (Party Game Platform 2.0 - The Jackbox Style Suite)**:
- **Pantalla Central Host (TV)**: Set televisivo interactivo con presentador IA local (Ollama Qwen 2.5 3B).
- **Mandos Móviles Asimétricos (`/play`)**: Controles táctiles responsivos con selector interactivo de 16 avatares y reconexión por IP + token persistente por nombre y sala.
- **Simulador Arena Multi-Pantalla 360° (`/demo`)**: Visualización simultánea del televisor y de 3-4 mandos móviles en un solo monitor con bots autónomos.
- **Suite de 7 Minijuegos Modulares (Jackbox Style)**:
  1. 🥊 *Duelo de Ocurrencias* (`MÍN. 3 JUG`): Batallas 1v1 de humor, votación del resto del salón y juez cómico IA.
  2. 🕵️ *El Impostor de Silicio* (`MÍN. 3 JUG`): Deducción social con pistas secretas, sospecha acumulativa y contrainterrogatorio.
  3. 🎓 *Falso Sabio* (`MÍN. 3 JUG`): Trivial de faroles (Fibbage-style), invención de mentiras convincentes y detección de la verdad.
  4. ⚖️ *Dilemas Extremos* (`2 - 10 JUG`): Dilemas morales y absurdos, apuestas de predicción grupal y modo afinidad para parejas.
  5. 💣 *Bomba de Palabras* (`2 - 10 JUG`): Patata caliente de vocabulario, reflejos contrarreloj y duelos de ping-pong mental.
  6. 🧠 *Trivia Caótica* (`2 - 10 JUG`) **NUEVO**: Estilo *Trivia Murder Party / You Don't Know Jack*. En 2 jugadores activa el "Duelo de Asalto" (el acierto roba puntos si el rival falla); en 3+ activa bonificación por velocidad de respuesta y ronda final a doble puntuación.
  7. 🔮 *Telepatía de Fiesta* (`2 - 10 JUG`) **NUEVO**: Estilo *Wavelength / Sintonía*. En 2 jugadores activa el "Test de Conexión Mental" (escala 0-100 para evaluar afinidad y sintonía cósmica); en 3+ activa el consenso de "Mente Colmena" premiando la proximidad a la mediana del grupo.

## Honestidad en el Catálogo de Jugadores (Mínimo Real vs Juegos de 2)
- Se corrigieron los badges del catálogo:
  - Juegos que mecánicamente requieren $\ge 3$ personas para votar o deducir (*Duelo de Ocurrencias*, *El Impostor de Silicio*, *Falso Sabio*) ahora muestran honestamente `MÍN. 3 JUG`.
  - Juegos diseñados nativamente para funcionar desde 2 personas (*Bomba de Palabras*, *Dilemas Extremos*, *Trivia Caótica*, *Telepatía de Fiesta*) muestran `2-10 JUG`.

## Verificación de Tests Automatizados
- `node tests/test-all-7-games.js`: 100% PASS (Los 7 juegos completaron sus flujos con código de salida 0, incluyendo verificación explícita de modos 1v1 con 2 jugadores para Trivia Caótica y Telepatía de Fiesta).

## Resolución de "NO INICIA" y Bloqueos de Sala
1. **Límite Mínimo de Jugadores Ajustado**:
   - `minPlayers` reducido de 3 a 2 para permitir partidas directas entre 2 personas.
2. **Auto-Fill de Bots al Iniciar**:
   - Si el anfitrión pulsa "Comenzar Partida" estando solo o con menos de 2 personas, el servidor auto-completa con bots de prueba (`FedeZorro`, `PulpoFiestero`, `LlamaLoca`) e inicia la partida de inmediato sin errores.
   - El botón de inicio ya no queda inhabilitado en gris: muestra un estado activo con feedback inmediato.
   - Se añadió el botón directo `🤖 + 3 Bots` en la cabecera de la sala para pruebas en 1 clic.
3. **Desacoplamiento de Tokens en Mismo Navegador**:
   - `party_device_token` ahora se parametriza con `_${roomCode}_${playerName.toLowerCase()}`. Dos pestañas en la misma máquina ya no se pisan entre sí.

## Dirección de Arte 2.0 (Estilo Jackbox Auténtico)
1. **Tipografía Expresiva y Caricaturesca**:
   - Títulos con efecto cómic 3D, bordes gruesos `-webkit-text-stroke: 3px #000`, sombras de relieve `4px 4px 0 #000` y rotación dinámica (`transform: rotate(-1.5deg)`).
2. **Escenarios Temáticos por Juego**:
   - 🕵️ **El Impostor de Silicio**: Estilo Dossier Clasificado de Espionaje (`.theme-impostor-stage`), banner de peligro diagonal amarillo/rojo, tarjetas de expediente con sello de confidencialidad, retícula de sospechoso y globos de interrogatorio.
   - 💣 **Bomba de Palabras**: Zona de demolición de alta tensión (`.theme-bomba-stage`), dinamita pulsante con esfera 3D y brillo de mecha encendida.
   - 🎓 **Falso Sabio**: Salón victoriano de concursos (`.theme-falso-stage`), tarjetas 3D `.falso-lie-card` con relieve táctil para opciones de faroles.
   - 🏆 **Podio Final 3D**: Columnas metálicas en relieve para Oro, Plata y Bronce (`.pillar-gold`, `.pillar-silver`, `.pillar-bronze`) con confeti, corona animada y fuegos artificiales.
3. **Mando Móvil Táctil (Arcade First)**:
   - Botones gigantes `.mobile-arcade-btn` y `.mobile-suspect-btn` con compresión física `active: translateY(5px)` y borde negro marcado, diseñados para interacción con pulgar.

## Correcciones Recientes de Calidad & Polish (UI/UX, Pacing, TTS, Mecánicas)
1. **Dimensiones & Layouts Limpios**:
   - Eliminados `max-height: 250px` y `overflow-y: auto` de `.players-grid` en la sala de espera. Las tarjetas de jugador (`.player-token`) ahora se muestran completas, sin barras de desplazamiento internas ni recortes de avatares.
   - En mandos móviles (`play.html`), la cabecera `.player-header` se blindó para mantenerse estrictamente en 1 sola fila elegante (nombre, código de sala y puntos) sin deformarse ni saltar a 3 líneas.
   - El dock inferior de reacciones en vivo se rediseñó con altura compacta, `z-index: 999999` y botones de stickers vectoriales con etiquetas claras ("¡Feliz!", "¡Risas!", "¡OMG!", "¡Fuego!", "¡Ojo!", "¡KO!").
2. **Stickers Vectoriales Puros (100% SVG Confinados)**:
   - Se añadieron `width="100%"` y `height="100%"` a todas las etiquetas `<svg>` en `characterEmotes.js`, eliminando el problema de expresiones gigantes desbordadas en pantalla.
   - Tanto en la TV del anfitrión (`.player-token-reaction-bubble`) como en el móvil (`.mobile-local-sticker-particle`), las dimensiones quedan estrictamente acotadas a 64-84px con sombras y animación de pop/burbuja flotante.
3. **Locución por Voz TTS en Tiempo Real**:
   - La voz del anfitrión ("Charly Silicio") ahora lee en voz alta en español cada pregunta, dilema y premisa de los duelos (`stageAnswering`, `stageDuel`, `stageTrivia`, `stageDilemas`, `stageTelepatia`, `stageFalsoSabio`, `stageBomba`).
4. **Mecánica Asimétrica y Competitiva de Telepatía de Fiesta**:
   - En modo 2 jugadores 1v1, se eliminó el puntaje gemelo forzado. Ahora los roles alternan cada ronda entre "Emisor Telepático" (fija el ancla secreta) y "Lector de Mentes" (adivina la calibración). El lector gana puntos según precisión y el emisor recibe un bono cooperativo del 50%, permitiendo ganadores claros y diferencias de puntaje reales.
5. **Reconocimiento de Empates (👑👑 Co-Campeones)**:
   - Tanto el servidor en `getPrivateState` como el TV en `renderPodium` y el móvil en `handlePodiumPhase` detectan empates en el 1er lugar (`podium[0].score === podium[1].score`).
   - El podio de oro se expande para coronar a ambos como Co-Campeones con fanfarria especial y anuncio de voz.
6. **Ritmo de Partida Extendido a 4-5 Rondas**:
   - Todos los 7 juegos calibrados con progresión emocional (Calentamiento -> Escalada -> Doble Puntuación / Clímax) para partidos de 4 a 6 minutos.
- **Backend Dockerizado (100.100.148.80)**:
  - Servidor: `palomares@100.100.148.80`
  - Contenedor: `anfitrion-party-backend` (puerto 3000)
  - URL local: `http://100.100.148.80:3000`
  - URL pública con SSL: `https://outlets-settings-packard-secretariat.trycloudflare.com` (Healthcheck: `status: ok`)
- **Repositorio GitHub**:
  - `https://github.com/Tonnydesarrollo/anfitriondefiestas` (rama `master` al día)
- **Frontend Vercel**:
  - `vercel` CLI v65.16.0 instalado globalmente.
  - `vercel.json` configurado para rewrites limpios (`/host`, `/play`, `/demo`).
  - `public/js/config.js` apunta por defecto al backend dockerizado con SSL.
- **Tests Automatizados**:
  - `node tests/test-all-7-games.js`: 100% PASS (7 juegos verificados con salida de código 0).

## Calibración Dinámica de Rondas (Eliminación de Botones Manuales)
- **Motivo**: En un party game estilo Jackbox, el anfitrión no debe adivinar ni configurar manualmente las rondas; el sistema debe auto-calibrarlas según la cantidad de jugadores y la dinámica de cada juego para evitar tiempos muertos y garantizar un ritmo óptimo.
- **Implementación**:
  - `server/rules/gameRulesConfig.js`: Se añadió `calculateDynamicRounds(gameId, playerCount)` con la fórmula de ritmo de cada juego:
    - *El Impostor de Silicio*: 2 rondas para 3 jugadores (evita redundancia de sospechas); 3 rondas para 4-6 jugadores (investigación clásica con pistas y contrainterrogatorio); 2 rondas rápidas para 7+ jugadores.
    - *Duelo de Ocurrencias*: 2 rondas dinámicas (Ronda 1 normal + Ronda 2 Puntos Dobles con clímax).
    - *Dilemas Extremos*: 4 rondas para 2-4 jugadores; 3 para 5-7; 2 para 8+.
    - *Bomba de Palabras*: 3 rondas para 2-4 jugadores; 2 rondas masivas para 5+.
    - *Falso Sabio*: 3 preguntas insólitas para 2-5 jugadores; 2 preguntas para 6+ jugadores.
  - `public/host.html`: Se **eliminaron por completo** los botones manuales `.round-btn` y se reemplazaron por la tarjeta de ritmo dinámico `#dynamicRoundsCard` con badge `AUTO-CALIBRADO`, título y descripción del ritmo.
  - `server/roomManager.js`: Actualiza `room.totalRounds` y emite `dynamicPacing` en `getPublicState()` cada vez que un jugador entra, sale o se cambia de minijuego.
  - Verificado visualmente con la herramienta `browse` (`browse snapshot`, `browse screenshot`).
1. **Captura 1 (Mando móvil sin botones de sospechosos en votación de El Impostor)**:
   - *Causa*: `candidates` requería `p.connected`. Cualquier desconexión momentánea de red móvil borraba al candidato de la lista. Además, el card de palabra secreta acaparaba la pantalla.
   - *Solución*: Se removió la exclusión por socket transitorio en `impostorSilicio.js` (`p.id !== socketId`). En `play.js`, durante la votación se oculta el recuadro superior para dar prioridad 100% a los botones gigantes `.mobile-suspect-btn` con avatar, nombre y pista enviada.
2. **Captura 2 (`[object Object]` en las cartas de pistas del televisor)**:
   - *Causa*: Los avatares son objetos estructurados `{ emoji, color, label }` que al interpolarse en `${item.avatar}` se convertían a la cadena `[object Object]`.
   - *Solución*: Sanitización global con `getAvatarEmoji()` en `host.js`, `play.js` y `impostorSilicio.js` (`avatarStr: p.avatar?.emoji || ...`), proyectando limpiamente los emojis visuales (`🦙`, `🐙`, `🦊`).
3. **Captura 3 (Podio con nombres "Campeón 0 PTS" / Confeti tapando el encabezado)**:
   - *Causa*: Si `renderPodium` no encontraba podio precargado, mantenía los textos placeholder del HTML ("Campeón", "Plata", "Bronce" con 0 PTS). El canvas de confeti tenía `z-index: 9999` tapando la barra de navegación y logo.
   - *Solución*: `renderPodium` ahora hace fallback jerárquico a `game.leaderboard` o `currentState.players` para mostrar siempre los nombres y puntuaciones de los jugadores reales; oculta escalones sobrantes si juegan menos de 3 personas; y el confeti se calibró en `z-index: 20` con el `host-topbar` en `z-index: 30`.

## Fase de Pulido Integral — 7 Pilares de Calidad
1. **Lectura TTS de Preguntas**: Hooks de locución en tiempo real para todos los minijuegos (`announceQuestion`).
2. **Mecánica Asimétrica de Telepatía**: Modo Emisor vs Adivinador en 1v1 y Consenso con Predicción en Grupo (4 Rondas alternadas).
3. **Gestión de Empates (Co-Campeones)**: Podio inclusivo con doble corona y soporte para empates en 1er y 2do puesto.
4. **Resolución de Errores Visuales**: Dock flotante fijo en móvil, normalización de layouts para pantallas cortas/apaisadas, stickers die-cut con borde blanco de vinilo.
5. **Extensión de Duración (4-5 Rondas)**: Estructura de 5 fases (Calentamiento -> Escalada -> Puntos Dobles -> Venganza -> Clímax Final) para partidas de 4 a 6 minutos (ADR 004).
6. **Splash de Instrucciones Iniciales**: Tarjeta de 6 segundos estilo Jackbox con locución cómica antes de la acción.
7. **Personalidad 'Charly Silicio'**: Locutor de late-night cómico con roasts, humor ácido y timing televisivo.
