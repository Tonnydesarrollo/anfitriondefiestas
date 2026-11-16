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
- **Dock Flotante de Reacciones (`.player-reactions-bar`)**:
  - `position: fixed; bottom: 0; left: 0; right: 0; height: 70px; z-index: 999999;`
  - Vidrio translúcido oscuro: `background: rgba(10, 14, 32, 0.95); backdrop-filter: blur(16px); border-top: 2px solid rgba(0, 240, 255, 0.4);`
  - Contiene 6 botones de calcomanía troquelada (`.btn-custom-emote-sticker`) con dimensiones fijas (`44px x 48px`).

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

## 5. Emoticones y Reacciones: Vector Character Stickers (No Unicode Genérico)

1. **Identidad Troquelada ("Die-Cut Vinyl Sticker")**:
   - Cada emoticón es un **SVG vectorial ilustrado** representativo del avatar del jugador (Zorro, Fantasma, Pulpo, Dino, Universal).
   - Incorpora borde troquelado blanco exterior (`stroke="#ffffff" stroke-width="4"` o `filter: drop-shadow(0 0 2px #fff)`).
   - Expresiones faciales cartoon auténticas:
     - 🦊/👻 **¡Feliz!**: Ojos achinados alegres, rubor rosa, sonrisa y destellos dorados.
     - 🦊/👻 **¡Risas!**: Lágrimas de risa azul cian saliendo a chorros y boca abierta.
     - 🦊/👻 **¡OMG!**: Ojos saltones desorbitados y boca desencajada en grito.
     - 🦊/👻 **¡Fuego!**: Ojos ardientes, colmillos feroces y aura de llamas.
     - 🦊/👻 **¡Ojo!**: Mirada de sospecha lateral, ceja alzada y signo de interrogación.
     - 🦊/👻 **¡KO!**: Ojos en cruz (X X), lengua afuera y estrellas giratorias.
2. **Despliegue en Pantalla Host (TV)**:
   - Se posiciona **estrictamente sobre la ficha del jugador** mediante coordenadas fijas `getBoundingClientRect()` o flotando lateralmente si el jugador no está en el lobby.
   - Duración: `1.8 segundos`.
   - `pointer-events: none; overflow: hidden; z-index: 999999;`
   - **Jamás se inyecta como texto Unicode plano ni altera el DOM flow de las tarjetas**.

---

## 6. Pruebas de Resistencia y Casos Límite (Break-UI Checklist)

Antes de considerar una pantalla terminada, debe superar el test de estrés con datos extremos:
- [x] **Nombres Extremos**: `Jo` (2 letras) hasta `WenceslaoDeLaSantísimaTrinidad` (32 letras con truncado inteligente).
- [x] **Dispositivos Estrechos**: iPhone SE (375px de ancho) y Galaxy Fold cerrado (320px de ancho).
- [x] **Pantallas Apaisadas Cortas**: Laptops y Smart TVs con altura reducida (`<= 600px`).
- [x] **Cero Jugadores vs 10 Jugadores**: La sala de espera mantiene su alineación estética sin vacíos desmesurados ni desbordamientos.
- [x] **Empates de Puntuación**: El podio maneja 2 o más ganadores simultáneos (Co-Campeones 👑👑).
