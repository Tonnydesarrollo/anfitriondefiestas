# ADR-003: Resiliencia de UX Móvil y Apilado Vertical Estricto

## Contexto
En pruebas anteriores, los jugadores reportaron que refrescos de página o recargas accidentales borraban lo que estaban escribiendo. Además, pantallas con flexbox horizontal generaban aplastamiento de campos de texto y botones en smartphones estrechos.

## Decisión
1. **Single Page Application Táctica (`/play`)**:
   - Una sola carga HTML. Todos los cambios de fase se realizan por alternancia de visualización DOM (`display: none` / `display: flex`).
   - Bloquear eventos `pull-to-refresh` en navegadores móviles mediante `overscroll-behavior-y: contain`.
   - Persistencia inmediata de respuestas en `localStorage` o memoria del cliente al teclear (`input` event).
2. **Apilado Estrictamente Vertical**:
   - Cada pantalla (`#screenAnswering`, `#screenImpostor`, `#screenDilemma`) implementa `flex-direction: column !important; width: 100% !important; box-sizing: border-box !important;`.
   - Se prohíben layouts horizontales en componentes interactivos clave en móviles.

## Consecuencias
- **Positivo**: Experiencia nativa tipo app sin recargas ni pérdida de respuestas escritas.
- **Positivo**: Legibilidad perfecta en cualquier resolución de smartphone (iPhone, Android).
