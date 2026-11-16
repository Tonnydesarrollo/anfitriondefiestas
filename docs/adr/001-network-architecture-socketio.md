# ADR-001: Arquitectura de Red y Protocolo de Mensajería Asimétrico

## Contexto
El juego requiere que una pantalla compartida (Host TV) muestre el juego público mientras múltiples celulares (jugadores) muestran interfaces privadas táctiles en tiempo real con latencia inferior a 100ms.

## Decisión
Usar **Node.js con Socket.io** manteniendo una separación estricta:
1. `host:state_update`: Envía únicamente datos públicos a la TV (pistas públicas, tiempo, duelos, tabla de puntuaciones general).
2. `player:state_update`: Envía a cada socket individual su información privada (rol secreto de impostor, sus duelos asignados, estado de su voto).
3. Nunca exponer información confidencial en el payload público del host.

## Consecuencias
- **Positivo**: Imposible que los jugadores hagan trampa mirando la consola o tráfico de red del host.
- **Positivo**: Reconexión inmediata sin pérdida de estado gracias a sesiones en memoria en el servidor (`roomManager.js`).
