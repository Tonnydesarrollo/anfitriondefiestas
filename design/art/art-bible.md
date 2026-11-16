# Art Bible — Anfitrión de Fiestas
**Versión:** 2.0  
**Línea Artística:** Cyber-Arcade Party Neon  
**Plataformas Objetivo:** Pantalla Grande (TV / Monitor 1080p / 4K) y Smartphones (iOS / Android 360px–430px)

---

## 1. Visual Identity Statement (Declaración de Identidad Visual)
*Anfitrión de Fiestas* combina la adrenalina visual de una máquina de arcade japonesa de los 90 con la sofisticación limpia y eléctrica del diseño de interfaces modernas (*glassmorphism*, bordes de neón reactivos y contrastes extremos). 
La pantalla central (TV) debe sentirse como un set de concurso televisivo futurista en horario estelar, mientras que los mandos móviles deben ser ergonómicos, vibrantes, con botones gigantes y sin distracciones cognitivas: **100% legibles a 3 metros en la TV y a 30 centímetros en una mano con una copa en la otra**.

---

## 2. Mood & Atmosphere (Atmósfera y Tono Emocional)
* **Emociones clave**: Euforia, anticipación de suspense, humor irreverente, tensión de farol y celebración festiva.
* **Tono**: Concurso de televisión nocturno donde la IA es un presentador sarcástico pero carismático.
* **Contraste lumínico**: Fondo oscuro cósmico profundo (obsidiana / azul noche) sobre el cual los elementos interactivos resplandecen con halos de luz (*glow effects*) y partículas de confeti.

---

## 3. Shape Language (Lenguaje de Formas)
* **Contenedores y Tarjetas**: Bordes suavizados (*rounded corners* de `16px` a `24px`) que transmiten amabilidad y accesibilidad lúdica, contrastados con bordes de 2px a 3px en neón brillante.
* **Botones e Inputs**: 
  - Altura mínima táctil en móvil: `56px` (zona de toque de pulgar sin fallos).
  - Píldoras (*pill shapes*, `border-radius: 9999px`) para estados, badges y categorías.
  - Rectángulos con esquinas curvas para opciones de respuesta y cartas de duelo.
* **Íconos y Avatares**: Figuras zoomórficas expresivas (🦊, 🐙, 🦙, 🦖, 🦄, 🐼, 🦁, 🦈) dentro de círculos de alto contraste con auras de color individuales.

---

## 4. Color System (Paleta de Colores Oficial)

### A. Fondos y Bases
* **Deep Space Obsidian**: `#0a0b12` (Fondo general del escenario)
* **Dark Velvet Navy**: `#131627` (Fondo de tarjetas y paneles)
* **Glass Surface**: `rgba(255, 255, 255, 0.06)` con `backdrop-filter: blur(12px)`

### B. Neones de Acción y Roles
* **Electric Cyan**: `#00f0ff` (Identidad general, inocentes, opción A, estado activo)
  - Glow: `box-shadow: 0 0 20px rgba(0, 240, 255, 0.45);`
* **Hot Magenta / Neon Pink**: `#ff2a85` (Impostor, peligro, opción B, veredicto culpable)
  - Glow: `box-shadow: 0 0 20px rgba(255, 42, 133, 0.5);`
* **Radioactive Green**: `#00ff9d` (Aciertos, victorias, votos confirmados, oro del campeón)
  - Glow: `box-shadow: 0 0 25px rgba(0, 255, 157, 0.6);`
* **Cyber Yellow**: `#ffd600` (Temporizadores, advertencias, fase de debate, pistas clave)
* **Amethyst Purple**: `#8b5cf6` (Fase de votación, eventos especiales)

### C. Tipografía y Textos
* **Pure Light**: `#ffffff` (Títulos, preguntas, opciones destacadas)
* **Muted Lavender**: `rgba(255, 255, 255, 0.7)` (Instrucciones secundarias, subtítulos)
* **Subtle Dark**: `rgba(255, 255, 255, 0.35)` (Marcas de agua, bordes inactivos)

---

## 5. Typography Hierarchy (Tipografía)
* **Display / Títulos de Concurso**: 
  - Fuentes: *Bungee*, *Titan One*, *Montserrat Black* (`font-weight: 900`).
  - Uso: Nombres de minijuegos, "¡JUICIO FINAL!", "CAMPEONES", números de temporizador.
* **Lectura y Controles Móviles**:
  - Fuentes: *Plus Jakarta Sans*, *Inter*, *System-UI* (`font-weight: 600–800`).
  - Uso: Preguntas de dilemas, premisas de ocurrencias, campos de texto, nombres de sospechosos.

---

## 6. Motion & Animation Standards (Animación y Efectos Visuales)
1. **Temporizador Circular**: Anillo SVG decreciente con interpolación fluida `stroke-dashoffset` y cambio de color a amarillo (<10s) y rojo pulsante (<5s).
2. **Entrada de Tarjetas**: Transición elástica `transform: translateY(20px) scale(0.95)` a `translateY(0) scale(1)` con `cubic-bezier(0.34, 1.56, 0.64, 1)`.
3. **Reacciones Flotantes**: Emojis en pantalla Host que suben con deriva horizontal aleatoria y se desvanecen en 3 segundos (`floatUpAndFade`).
4. **Veredicto y Clímax**: Efecto de foco teatral (*stage spotlight*), sacudida de pantalla sutil (*screen shake*) en sentencias culpables y lluvia de confeti en el podio.

---

## 7. Directrices de Accesibilidad y Legibilidad en Sala
* Contraste mínimo de texto sobre fondo de **7:1** (WCAG AAA para pantallas lejanas).
* Toda información de color se acompaña con un **ícono semántico** (😇 para Inocente, 😈 para Impostor, 🚨 para Culpable, ⚖️ para Sentencia).
* Tamaño de fuente mínimo en mando móvil: `16px` para evitar zoom automático en Safari iOS.
