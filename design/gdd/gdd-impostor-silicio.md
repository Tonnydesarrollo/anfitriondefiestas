# GDD: El Impostor de Silicio (Social Deduction & AI Bluffing)

## 1. High Concept & Visión
Un juego de deducción social asimétrica donde todos los jugadores conocen una palabra secreta excepto uno: **El Impostor**. A través de dos rondas de pistas sutiles proyectadas en el televisor, los humanos deben desenmascarar al farsante sin regalarle la palabra, mientras que el impostor debe deducir el tema a partir de las pistas de los demás y montar un farol convincente.

---

## 2. Bucle de Juego (Core Loop)
```
[Tutorial 15s]
    ↓
[Reparto de Roles en Secreto (7s)]
    ├── Inocentes: Categoría ("Mascotas") + Palabra Secreta ("Delfín")
    └── Impostor: Categoría ("Mascotas") + Pista Leve ("Animal marino")
    ↓
[Ronda 1 de Pistas (35s)] — 1 o 2 palabras enviadas desde el móvil
    ↓
[Revelación 1 en TV (15s)] — Proyección de la primera pista de todos
    ↓
[Ronda 2 de Pistas (35s)] — Segunda pista para acorralar o despistar
    ↓
[Debate Abierto en el Salón (60s)] — TV muestra ambas pistas en el tablero
    ↓
[Juicio y Votación Secreta (25s)] — Votación de sospechosos en móvil
    ↓
[Sentencia del Tribunal (12s en TV)]
    ├── Revelación dramática del más votado y número de votos
    ├── Veredicto sonoro: ¿Era el Impostor o un Inocente?
    └── Revelación pública de la Palabra Secreta y el Impostor Real
    ↓
[Fase de Escape (12s) — Solo si el Impostor fue descubierto]
    └── El Impostor tiene 12 segundos para adivinar entre 4 opciones
    ↓
[Resultados de Puntos y Podio]
```

---

## 3. Economía de Puntuación (Scoring Balance)
| Rol / Evento | Puntos Ronda 1 | Puntos Ronda 2 | Justificación de Game Design |
|---|---|---|---|
| **Inocente atrapa al Impostor** | +500 pts | +1,000 pts | Premia a los inocentes que votaron correctamente al infiltrado. |
| **Impostor Invicto (No descubierto)** | +1,000 pts | +2,000 pts | Gran botín por engañar exitosamente a toda la sala. |
| **Escape Legendario del Impostor** | +800 pts | +1,600 pts | Recompensa al impostor si fue descubierto pero adivinó la palabra. |
| **Chivo Expiatorio (Inocente expulsado)** | +150 pts | +300 pts | Puntos de consolación por ser víctima del engaño del grupo. |

---

## 4. Requisitos Clave de Implementación
1. **Pista Leve para el Impostor**: Para evitar frustración donde el impostor no tiene idea de qué decir, se le otorga una pista general que le permite improvisar.
2. **Tablero de Pistas Dual**: El TV agrupa tanto la Pista 1 como la Pista 2 de cada jugador en tarjetas con sus avatares emoji.
3. **Fase de Escape en Móvil**: Botones gigantes con 1 palabra real y 3 señuelos fonética o semánticamente relacionados.
