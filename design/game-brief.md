# Game Brief: Anfitrión de Fiestas (Party Game Platform 2.0)

## 1. Visión Re-definida del Proyecto
**Anfitrión de Fiestas** no es solo una colección de 3 minijuegos aislados; es una **Plataforma Modular de Juegos de Fiesta Multijugador Local** diseñada para salones, reuniones familiares, juntadas de amigos y fiestas.

Inspirado en el estándar de oro de *The Jackbox Party Pack*, *WarioWare* y *Mario Party*:
* **Infraestructura Modular (Plug-and-Play)**: Nuevos juegos pueden añadirse al motor registrando un archivo de reglas sin alterar la arquitectura central.
* **1 Pantalla Host (TV / Proyector)**: Actúa como el presentador y set televisivo en vivo.
* **N Mandos Móviles (`/play`)**: Controles asimétricos instantáneos sin descargas ni registros.
* **Anfitrión IA Cómico Local (Ollama `qwen2.5:3b`, 0 tokens)**: Presenta las rondas, evalúa las ocurrencias con remates cómicos y mantiene la energía al tope.
* **Modo Gran Torneo de Fiesta (Grand Prix)**: Los minijuegos pueden jugarse en partidas rápidas individuales o en un torneo acumulativo con mecánicas de remontada justa.

---

## 2. Pilares de Jugabilidad y Filosofía "Fair & Fun"

### A. Equidad Absoluta (Fair Play para Todos)
1. **Mecánica de Remontada Justa ("El Comodín del Perdedor")**: En el modo Torneo, los jugadores en últimos lugares reciben ventajas cómicas estratégicas (ej. votos de peso doble o multiplicadores de acierto) para mantener la emoción viva hasta la última ronda. Nunca hay eliminación de jugadores; todos juegan y puntúan en cada fase.
2. **Asimetría Protegida**: La información privada (roles de impostor, votos secretos, cartas de dilema) está blindada en el móvil y nunca se filtra en la TV hasta el momento dramático del clímax.

### B. Ritmo Frenético y Cero Tiempos Muertos (Maximum Fun)
1. **Rondas Ágiles (3 a 4 minutos por juego)**: Temporizadores visibles con alertas sonoras para que la fiesta mantenga una cadencia vibrante.
2. **Tutorial Interactivo en 15 Segundos ("Cómo se Juega")**: Cada juego arranca con un tutorial audiovisual animado de 3 reglas doradas, asegurando que novatos y expertos entiendan exactamente qué hacer sin manuales aburridos.
3. **Reacciones en Tiempo Real**: Mientras otros juegan o se revelan votos, los jugadores pueden lanzar emojis animados en vivo que flotan en la pantalla de la TV (🔥, 💀, 😂, 👏, 💩).

---

## 3. Catálogo Extendido de Minijuegos

### 1. Duelo de Ocurrencias (Comedia Coliseo 1v1)
* **Género**: Comedia rápida, creatividad e ingenio.
* **Mecánica**: Los jugadores reciben premisas absurdas y escriben remates graciosos. En la TV se enfrentan 1 contra 1 de forma anónima; el resto del salón vota la mejor respuesta.
* **Puntuación**: 100 PTS por voto recibido + 250 PTS por "¡Paliza!" (unanimidad) + 250 PTS de bonificación del Anfitrión IA por creatividad. Ronda 2 con **Puntos Dobles**.

### 2. El Impostor de Silicio (Deducción Social & Careo)
* **Género**: Farol (*bluffing*), psicología social y deducción.
* **Mecánica**: Todos los inocentes reciben la misma palabra secreta (*ej: Tequila*); el impostor solo recibe una pista orientativa leve (*ej: Bebida alcohólica nocturna*).
* **Estructura en 2 Rondas**:
  - *Ronda 1*: Cada jugador envía 1 palabra pista. Se proyectan en TV.
  - *Ronda 2*: Se envía una 2ª pista para acorralar o despistar.
  - *Debate Abierto*: Cuadrícula completa en la TV y debate acalorado en el salón.
  - *Votación Secreta*: Voto simultáneo contra el sospechoso en el móvil.
  - *Sentencia del Tribunal*: Revelación cinematográfica con martillazo. Si el impostor es atrapado, tiene 12 segundos para adivinar la palabra entre 4 opciones y robar la victoria.

### 3. Dilemas Extremos (Combate Moral & Apuesta de Mayoría)
* **Género**: Polarización, debate ético bizarro y lectura de grupo.
* **Mecánica**: Se presenta un dilema ridículo (Opción A vs Opción B). Cada jugador elige su postura personal Y apuesta qué opción cree que elegirá la mayoría del salón.
* **Puntuación**: +200 PTS por predecir la mayoría del grupo + +350 PTS por el bono "Lobo Solitario" (si quedas en la minoría valiente).

### 4. Subasta de Secretos (Secret Auction & Bluffing)
* **Género**: Secretos anónimos, acusaciones y revelaciones picantes.
* **Mecánica**: La IA formula una pregunta íntima o vergonzosa (ej. *"¿Qué es lo más tonto por lo que lloraste?"* o *"¿Qué secreto escondes de tu trabajo?"*). Los jugadores envían respuestas secretas. La pantalla grande las subasta una a una y los jugadores apuestan fichas a quién le pertenece cada confesión.

### 5. Bomba de Palabras (Word Speed Rush)
* **Género**: Velocidad mental, asociación de palabras y adrenalina.
* **Mecánica**: Una bomba virtual con cuenta regresiva acelerada pasa de teléfono en teléfono. El jugador con la bomba debe escribir una palabra válida según la regla del Anfitrión (ej. *"Animales que empiecen con C"* o *"Cosas que encuentras en un refrigerador"* antes de que explote en sus manos).

---

## 4. Arquitectura de Catálogo Abierto (Game Registry)
El backend cuenta con una clase abstracta `BasePartyGame` y un `GameRegistry` dinámico:
```
server/
  ├── games/
  │    ├── gameRegistry.js        <- Catálogo central extensible
  │    ├── basePartyGame.js       <- Contrato común (start, getPublicState, getPrivateState, skipTimer)
  │    ├── dueloOcurrencias.js    <- Minijuego 1
  │    ├── impostorSilicio.js     <- Minijuego 2
  │    ├── dilemasExtremos.js     <- Minijuego 3
  │    ├── subastaSecretos.js     <- Minijuego 4
  │    └── bombaPalabras.js       <- Minijuego 5
```

Cualquier nuevo minijuego se registra automáticamente en el selector del Host sin necesidad de reescribir la capa de red o el lobby.
