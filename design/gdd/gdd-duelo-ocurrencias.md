# GDD: Duelo de Ocurrencias (The Joke Colosseum)

## 1. High Concept & Visión
Un combate cómico 1 contra 1 donde dos jugadores reciben la misma premisa absurda y tienen 45 segundos para escribir el mejor remate (*punchline*). El televisor proyecta la batalla con estética de ring de boxeo o coliseo romano, el resto del salón actúa como jurado popular votando en silencio desde sus móviles, y el Anfitrión IA remata con comentarios ácidos.

---

## 2. Bucle de Juego (Core Loop)
```
[Tutorial 15s] 
    ↓
[Ronda 1: Escritura (45s)] — Cada jugador responde 2 premisas distintas
    ↓
[Duelos Cara a Cara (15s c/u en TV)]
    ├── Proyección de Opción A vs Opción B
    ├── Jurado vota en móvil (Duelistas en pantalla de suspense)
    ├── Revelación de votos y porcentajes
    └── Comentario y Bono de la IA
    ↓
[Tabla de Puntuaciones de la Ronda]
    ↓
[Ronda 2: PUNTOS DOBLES (Escritura 40s + Duelos Finales)]
    ↓
[Gran Podio de Campeones con Fanfarria]
```

---

## 3. Economía de Puntuación (Scoring Balance)
| Evento | Ronda 1 | Ronda 2 (Doble) | Justificación de Game Design |
|---|---|---|---|
| **Voto Popular del Jurado** | +500 pts | +1,000 pts | Recompensa directa al humor que resuena con el grupo. |
| **Paliza Cómica (100% votos)** | +250 pts | +500 pts | Bono por unanimidad absoluta. |
| **Bono del Anfitrión IA** | +250 pts | +500 pts | La IA premia la ocurrencia más ingeniosa o bizarra. |
| **Voto Rápido del Jurado** | +50 pts | +50 pts | Incentiva emitir el voto rápido antes de 3 segundos. |

---

## 4. Estructura de Premisas (Mad-Libs y Situaciones Extremas)
Las preguntas deben generar un impulso cómico instantáneo:
1. **Situaciones Inapropiadas**: "Lo peor que puedes decir al entrar a un elevador lleno de desconocidos".
2. **Productos y Servicios Nefastos**: "Un eslogan terrible para un cirujano plástico clandestino".
3. **Secretos Revelados**: "La búsqueda de Google más comprometedora que tu mamá podría encontrar".
4. **Respuestas Inesperadas**: "El peor nombre para una mascota familiar que causará pánico en el parque".
