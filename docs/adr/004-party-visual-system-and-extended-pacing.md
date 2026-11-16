# ADR 004: Sistema Visual Unificado, Progresión de 4-5 Rondas y Soporte de Co-Campeones

## Estado
Aceptado / En Implementación

## Contexto
Durante las pruebas de juego se detectaron dos deficiencias estructurales:
1. **Deficiencias Visuales y de Dirección Artística**: La interfaz presentaba desbordamientos en resoluciones bajas/apaisadas (scrollbars en el lobby, dock móvil cortado), falta de contraste en el código de sala, tarjetas asimétricas en duelos 1v1 y solapamiento de marcadores en Telepatía. Además, los emoticones carecían de estética de calcomanía troquelada ("Die-Cut Vinyl Sticker") y el podio ignoraba empates asignando la victoria arbitrariamente al primer jugador del array.
2. **Duración y Ritmo de Partida Insuficiente**: Las partidas de 1 a 3 rondas (menos de 2 minutos) no daban tiempo a los jugadores para aclimatarse, entender las mecánicas, forjar rivalidades ni permitían remontadas dramáticas.

## Decisiones de Arquitectura

### 1. Extensión del Ritmo de Partida a 4-5 Rondas con Curva Emocional
- Todos los minijuegos contarán con una progresión estructurada de 4 a 5 rondas:
  - **Ronda 1**: Calentamiento (Puntuación base 500 pts).
  - **Ronda 2**: Escalada (750 pts + bonos de velocidad/consenso).
  - **Ronda 3**: Tensión y Puntos Dobles (1500 pts).
  - **Ronda 4**: Venganza o Giro Inesperado (Mecánica de robo o farol arriesgado).
  - **Ronda 5**: Duelo Final / Clímax (Puntos Triples / Muerte Súbita).
- En *Telepatía de Fiesta (1v1)*: Se establece un mínimo de 4 rondas con alternancia de roles (Ronda 1 y 3: Jugador A emite, Jugador B adivina; Ronda 2 y 4: Jugador B emite, Jugador A adivina).

### 2. Detección y Presentación de Empates (Co-Campeones)
- El podio y el backend soportan formalmente empates de puntos:
  - Si dos o más jugadores comparten la máxima puntuación, el podio no asigna 2do lugar; el pilar de Oro se expande albergando a ambos avatares con doble corona 👑👑 y badge de Co-Campeones.
  - La voz del anfitrión proclama el empate épico y los mandos móviles felicitan a ambos campeones.

### 3. Dirección de Arte "Die-Cut Vinyl Sticker"
- Los stickers de reacción de personajes incorporan borde exterior blanco troquelado (3px), sombra profunda y volumen vectorial en 2 tonos para máxima visibilidad en fondos oscuros.
- El dock móvil se ancla con `position: fixed !important; bottom: 0 !important;` garantizando visibilidad en cualquier dispositivo sin depender del scroll.

### 4. Hook Centralizado de Narración de Preguntas TTS
- Se implementa `announceQuestion()` en `host.js` para locutar fluidamente la premisa y opciones de cada minijuego al inicio de cada ronda, dotando al anfitrión "Charly Silicio" de timing televisivo y comedia ácida.

## Consecuencias
- Partidas más ricas y satisfactorias de 4 a 6 minutos.
- Inclusión total para empates y partidas de 2 personas.
- Estabilidad visual responsive en televisores y móviles de cualquier resolución.
