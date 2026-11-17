# DESIGN.md — Sistema de Diseño e Ingeniería UI/UX (Estilo Jackbox / Web Browser Game)

> **Filosofía**: Basado en las reglas de ingeniería de diseño de **Emil Kowalski** (`emil-design-eng`, `mobile-native`, `animate`, `break-ui`) adaptadas a videojuegos de fiesta en navegador web (Host TV 16:9 + Mando Móvil en Smartphones).

---

## 1. Naturaleza del Proyecto: Juego de Explorador Web (No es un Motor Nativo)

A diferencia de un juego de Unity o Unreal que renderiza mediante OpenGL/DirectX con una resolución fija, este es un **juego web en tiempo real** que corre en:
1. **Pantalla Host (TV / Proyector / Laptop)**: Navegador a pantalla completa o ventana (`1080p`, `720p`, o laptops con pantallas de 1366x768 / 1024x600 con barras de herramientas).
2. **Mando Móvil (`/play`)**: Smartphones iOS Safari y Android Chrome de diversas dimensiones con barras de navegación dinámicas, teclado en pantalla y áreas seguras (notch / home indicator).

---

## 2. Reglas Inquebrantables de Viewport y Layout (Zero-Scroll & Anti-Clip)

### 2.1. Pantalla Host (TV / Pantalla Principal)
- **Altura estricta 100vh / 100dvh**: La pantalla de Host **NUNCA** debe tener scrollbars globales ni recortar elementos interactivos en resoluciones bajas.
- **Estructura en Grid Proporcional**:
  - `host-container`: `display: grid; grid-template-rows: auto 1fr; height: 100dvh; overflow: hidden;`
  - `stageLobby`: `display: grid; grid-template-columns: minmax(260px, 300px) 1fr; height: 100%; min-height: 0; gap: 20px; align-items: stretch; overflow: hidden;`
- **Tarjeta Izquierda (Unirse / QR)**:
  - El marco del código QR debe ser responsivo: `clamp(130px, 16vh, 200px)`.
  - El texto de URL debe ser **limpio y humano** (`anfitriondefiestas.vercel.app/play`), jamás enlaces crudos con 120 caracteres de query parameters codificados.
  - El código de sala (`----`) debe ser gigante y legible desde 5 metros de distancia.
- **Tarjeta Derecha (Lobby & Catálogo)**:
  - `lobby-players-card`: `display: flex; flex-direction: column; justify-content: space-between; height: 100%; min-height: 0;`
  - `players-grid`: Altura flexible con `max-height: 140px; overflow-y: auto;`. Las tarjetas de jugador son fichas compactas (`110px x 115px`), permitiendo que el Catálogo de Minijuegos y las opciones de audiencia siempre sean 100% visibles.
  - `catalog-grid`: Tarjetas compactas con espaciado ajustado para pantallas con altura <= 700px.

### 2.2. Mando Móvil (`/play`)
- **Regla del 100dvh**: Usar siempre `height: 100dvh` (o fallback a `100vh`) combinado con `env(safe-area-inset-bottom)`.
- **Cabecera Móvil (`.player-header`) en 1 Fila Estricta**:
  - Disposición: `display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; width: 100%; height: 50px; flex-shrink: 0;`
  - Izquierda: Avatar y nombre (`max-width: 130px`, truncado con ellipsis).
  - Centro: Badge de Sala compacto (`SALA: ABCD`).
  - Derecha: Marcador (`0 PTS`).
  - **Prohibido**: Jamás permitir que la cabecera salte a múltiples líneas verticales o que el código de sala ocupe el 100% de ancho.
- **Área de Juego Central (`.player-body`)**:
  - `flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; overflow-y: auto;`
  - Clearance inferior: `padding-bottom: 85px` para evitar que el dock flotante de reacciones tape botones o campos de texto.
- **Dock Flotante de Reacciones (`.pad-reaction-bar`)**:
  - Pie fijo con borde ink sólido `3px solid #12101d` y botones táctiles `48px x 44px` sobre fondo oscuro `#141820` (`public/controller/controller.css`).
  - Reacciones flotan como stickers en la pantalla del Host TV (`floating-reaction`) con `pointer-events: none; z-index: 40;`.

---

## 3. Principios de Ingeniería Móvil Nativa (Kowalski Mobile-Native)

| Problema Web Típico | Causa en Browser | Solución Estricta Kowalski |
| :--- | :--- | :--- |
| **Sticky Hover** | El navegador simula hover en el primer toque táctil y lo deja pegado. | Envolver todo `:hover` en `@media (hover: hover) and (pointer: fine)`. Los usuarios táctiles solo reciben feedback vía `:active`. |
| **Flash Gris al Tocar** | Resaltado predeterminado del motor WebKit/Blink en enlaces y botones. | `* { -webkit-tap-highlight-color: transparent; }` |
| **Retraso de 300ms** | El navegador espera para detectar si es un doble toque para zoom. | `touch-action: manipulation;` en todos los controles interactivos. |
| **Zoom Accidental en Inputs** | iOS Safari hace zoom automático en inputs con `font-size < 16px`. | Todos los campos `<input>` y `<textarea>` tienen `font-size: 16px` como mínimo absoluto. |
| **Rebote Elástico de Página** | El scroll elástico (rubber-banding) de Safari mueve toda la pantalla. | `overscroll-behavior: none;` en `html, body`. |
| **Selección de Texto Molesta** | Al presionar botones o jugar rápido se selecciona el texto azul. | `user-select: none; -webkit-user-select: none;` en botones, fichas, badges y cabeceras. |
| **Tap Targets Diminutos** | Dificultad para pulsar botones con el pulgar. | Todos los botones interactivos tienen un mínimo de `48px x 48px` (óptimo arcade: `54px`). |

---

## 4. Sistema de Animaciones y Micro-Interacciones (Kowalski Motion Specs)

### 4.1. Curvas de Easing y Físicas
- **Entradas (Pop-In / Emerger)**:
  - Curva de muelle elástico: `cubic-bezier(0.34, 1.56, 0.64, 1)`
  - Duración: `250ms - 350ms`
  - Escala inicial: **Nunca comenzar desde `scale(0)`** (se ve microscópico e irreal). Comenzar desde `scale(0.85)` u `opacity: 0; scale(0.92)`.
- **Salidas (Exits / Fade-Out)**:
  - Curva de desaceleración suave: `cubic-bezier(0.16, 1, 0.3, 1)` o `ease-out`
  - Duración: `150ms - 200ms` (las salidas siempre deben ser más rápidas que las entradas).
- **Sensación Táctil Física en Botones Arcade (`:active`)**:
  ```css
  .btn:active, .mobile-arcade-btn:active {
    transform: translateY(3px) scale(0.97) !important;
    box-shadow: 0 2px 0 #000, 0 4px 8px rgba(0, 0, 0, 0.4) !important;
    transition: transform 70ms ease-out, box-shadow 70ms ease-out !important;
  }
  ```

---

## 5. Arte Táctil, Elenco de Arcilla y Anfitrión en Escenario (Anfitrión 2.0)

1. **Estética Prime-Time Show & Tactile Claymation (`design/art/art-bible.md`)**:
   - Carteles clave ilustrados 16:9 por juego en `public/assets/posters/*.jpg` (sin texto quemado ni emojis gigantes en cabeceras).
   - **8 Concursantes de Arcilla Esculpida** en PNG transparente (`public/assets/cast/*.png`): `crimson`, `tangerine`, `lemon`, `mint`, `cyan`, `cobalt`, `violet`, `magenta`, seleccionables en el card `@connect` (`/play`).
   - **Cookie Host Animado** (`public/assets/host/cookie-host.png`) persistente en esquina derecha del escenario TV con animación de habla sincronizada con Voice Studio (`/api/tts`) y globo de diálogo tipo cómic.
   - Arquitectura estrictamente modular por juego: `public/tv/games/<gameId>.js` + `public/controller/games/<gameId>.js`.

---

## 6. Pruebas de Resistencia y Casos Límite (Break-UI Checklist)

Antes de considerar una pantalla terminada, debe superar el test de estrés con datos extremos:
- [x] **Nombres Extremos**: `Jo` (2 letras) hasta `WenceslaoDeLaSantísimaTrinidad` (32 letras con truncado inteligente).
- [x] **Dispositivos Estrechos**: iPhone SE (375px de ancho) y Galaxy Fold cerrado (320px de ancho).
- [x] **Pantallas Apaisadas Cortas**: Laptops y Smart TVs con altura reducida (`<= 600px`).
- [x] **Cero Jugadores vs 10 Jugadores**: La sala de espera mantiene su alineación estética sin vacíos desmesurados ni desbordamientos.
- [x] **Empates de Puntuación**: El podio maneja 2 o más ganadores simultáneos (Co-Campeones 👑👑).
