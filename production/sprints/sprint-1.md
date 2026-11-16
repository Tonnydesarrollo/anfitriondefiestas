# Sprint 1: Rediseño Integral de Jugabilidad y Experiencia de Fiesta

## Objetivo del Sprint
Transformar la base técnica existente en un party game cohesionado, estructurado y comercialmente pulido, donde cada uno de los 3 juegos se sienta único, con reglas transparentes y anfitrión carismático.

---

## Historias de Usuario y Tareas

### Épica 1: Dirección de Juego y Reglas Cristalinas (`game-designer`)
- [x] **US-101: Pantallas "Cómo se Juega" interactivas**: Cada minijuego debe mostrar un tutorial animado y narrado antes de la Ronda 1.
- [x] **US-102: Rediseño de El Impostor de Silicio a 2 Rondas**: Incorporar fase de doble pista (`CLUES_1` -> `CLUES_REVEAL_1` -> `CLUES_2`), careo público y fase de escape con 4 opciones.
- [ ] **US-103: Expansión y Curaduría del Banco de Preguntas**:
  - Duelos de ocurrencias: 100+ premisas hilarantes adaptadas por filtro de audiencia (Amigos / Familia / Adultos).
  - Impostor: 50+ parejas de palabras y señuelos creíbles por categoría.
  - Dilemas: 50+ dilemas morales absurdos y polémicos.

### Épica 2: UX Móvil y Presentación TV (`frontend-designer`)
- [x] **US-201: Erradicación de aplastamiento móvil**: Blindaje CSS vertical 100% en controles y botones.
- [x] **US-202: Tablero de Resolución en TV**: Sala de juicio con martillo de juez, estrado de sentencia, banner de veredicto y revelación dramática.
- [ ] **US-203: Polish Visual y Partículas**: Añadir efectos visuales de aplausos, confeti interactivo y animaciones de victoria en la TV.

### Épica 3: Cerebro del Anfitrión IA y Sonido (`ai-programmer` & `audio-director`)
- [ ] **US-301: Comentarios reactivos de IA afinados**:
  - Ajustar el prompt de Ollama para que el Anfitrión IA lea las ocurrencias de los jugadores y formule comentarios específicos sobre lo que acaban de escribir en lugar de bromas genéricas.
- [ ] **US-302: Modulación de Voz TTS**:
  - Probar configuraciones de tono (`pitch`), velocidad (`rate`) e inflexión en la Web Speech API para reducir el sonido robótico y darle más energía de presentador de televisión.

### Épica 4: Control de Calidad y Pruebas (`qa-lead`)
- [x] **US-401: Suite de Pruebas de Integración**: Pruebas completas de los 3 motores de juego con bots simulados sin intervención manual.
- [ ] **US-402: Pruebas de Carga y Resiliencia**: Simular desconexión intempestiva de jugadores durante votaciones y verificar recuperación fluida.
