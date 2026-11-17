# Art Bible — Anfitrión de Fiestas 2.0 (Jackbox TV Party Pack Reboot)

**Versión:** 3.0 (Reinicio Total)
**Línea Artística:** Tactile Claymation, Cut-Paper & Prime-Time Game Show Studio
**Referencias Directas (extraídas con REA):** *Quiplash 3*, *Fibbage 4*, *Fakin' It! 2*, *Nonsensory*, *The Poll Mine*, *Trivia Murder Party 2* y `@connect` (`jackbox.tv`).

---

## 1. Principio Rector: Cero "Dashboard Neón", 100% Show Televisivo
- **PROHIBIDO**: Glassmorphism genérico oscuro con bordes cian neón (`#00f0ff`), tablas o cuadrículas vacías de panel de administración, y emojis del sistema operativo (`🦊`, `🥊`, `🕵️`, `🚀`) usados como ilustraciones de portada o avatares.
- **OBLIGATORIO**:
  1. **Arte Ilustrado Propio**: Cada minijuego posee su propia ilustración clave (`public/assets/posters/<gameId>.png`), paleta cromática, ambiente de estudio y lenguaje de tarjetas.
  2. **Elenco de Marionetas Esculpidas**: Los jugadores eligen personajes físicos esculpidos tipo plastilina/vinilo con caras expresivas entintadas a mano (`public/assets/cast/*.png`), nunca emojis unicode desnudos.
  3. **Anfitrión Visible en Escena**: Un presentador ilustrado animado en el escenario (`public/assets/host/`) sincronizado con la voz neuronal de **Voice Studio** y subtítulos televisivos grandes.
  4. **Fisicalidad Táctil (Jackbox `@connect`)**: Contornos gruesos de tinta (`3px solid #12121a`), sombras sólidas desplazadas (`0 6px 0 #0a0c14`) que se hunden al presionar (`translateY(4px)`), tipografía display pesada con trazo exterior e interior.

---

## 2. Sistema Tipográfico
- **Display / Cartelera TV**: `'Bungee'`, `'Rubik'`, `'Fredoka'`, pesadas en mayúsculas para títulos de duelo, preguntas gigantes y códigos de sala.
- **Cuerpo y Mando Móvil**: `'Plus Jakarta Sans'`, `'Rubik'`, `'Helvetica Neue'`, mínimo `16px` en inputs móviles (anti-zoom iOS) y contraste alto (`>= 7:1` entre tinta y superficie).

---

## 3. Paleta Maestra del Pack & Temas por Minijuego

### A. Shell Maestro (`@connect` / Pack Launcher)
- **Azul Showbiz Eléctrico**: `#4254f4` (acentos de marca, CTA principal móvil)
- **Noche de Estudio Profunda**: `#0a1420` y `#0d1c2b` (telón base sin neón genérico)
- **Superficie de Tarjeta Táctil**: `#182235` / `#f8f5ec` (papel crema cálido para tarjetas de pregunta y comedia)
- **Tinta / Contorno**: `#0e1118` y sombreado físico `#07090f`
- **Amarillo Concurso**: `#ffd233` · **Rojo Alerta / Veto**: `#e63946` · **Verde Acierto**: `#16c784`

### B. Identidad Cromática por Minijuego
1. **Duelo de Ocurrencias** (*Quiplash 3*): Púrpura plastilina `#4c1d95` + Mandarina `#f97316` + Turquesa `#06b6d4` + burbujas blancas recortadas.
2. **El Impostor de Silicio** (*Fakin' It! 2*): Crema mid-century `#f5efe6` + Pizarra espía `#2b2d42` + Rojo alerta `#d62828` + cortes angulares inclinados.
3. **Dilemas Extremos** (*Poll Mine / Split*): Púrpura caverna `#241638` + Antorcha Ámbar `#f59e0b` + Split A `#0284c7` vs Split B `#e11d48`.
4. **Bomba de Palabras** (*Arcade Explosivo*): Carbón cálido `#1f1414` + Naranja pólvora `#ff5400` + Amarillo peligro `#ffbe0b` + cintas diagonales.
5. **Falso Sabio** (*Fibbage 4*): Negro estudio `#111111` + Crema editorial `#faf7f0` + Rojo carmesí `#ef233c` + Dorado espectáculo `#ffb703`.
6. **Trivia Caótica** (*Trivia Murder Party 2*): Terciopelo carmesí `#2d0810` + Rojo sangre `#dc2626` + Turquesa neón retro `#22d3ee` + Latón dorado `#eab308`.
7. **Telepatía de Fiesta** (*Nonsensory*): Gris pizarra texturizado `#2c3540` + Arcoíris de dial (`#e28f24` → `#504294`) + Verde sintonía `#00e676`.

---

## 4. Micro-interacciones y Audio
- Curvas Emil Kowalski (`--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-pop: cubic-bezier(0.34, 1.56, 0.64, 1)`).
- Jamás animar escalas desde `0`; mínimo `scale(0.92)`.
- Cada botón físico comprime su sombra inferior en `:active` en `60ms`.
- Efectos de sonido Web Audio API por cada acción + locución **Voice Studio** en escenario.
