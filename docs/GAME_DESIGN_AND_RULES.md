# 🎮 Manual de Reglas, Dirección Escénica y Locuciones del Anfitrión
**Plataforma de Party Games: "Anfitrión de Fiestas"**
*Documento Oficial de Game Design, Guiones de Locución y Game Feel (v2.0)*

---

## 1. El Manifiesto de la "Regla de los 20 Segundos"

> [!IMPORTANT]
> **La Regla de Oro del Party Game Moderno:**
> Ningún jugador en una reunión social debe pasar más de **20 segundos** sin comprender con claridad cristalina:
> 1. **Qué está pasando en la pantalla grande (TV).**
> 2. **Qué debe pulsar, escribir o decidir en su teléfono móvil.**
> 3. **Por qué lo que acaba de suceder es gracioso o emocionante.**

Cuando un juego carece de estructura o transiciones claras, la energía de la fiesta se desploma. Este documento establece los guiones de locución tipo show televisivo, los pasos visuales simplificados ("How to Play"), las transiciones dramáticas de combate y los efectos audiovisuales diegéticos para los 3 minijuegos oficiales:
1. 🥊 **Duelo de Ocurrencias** (Combate de ingenio cómico 1 vs 1)
2. 🕵️‍♂️ **El Impostor de Silicio** (Deducción social, paranoia y farol)
3. 🤔 **Dilemas Extremos** (Polarización moral, apuestas de consenso y análisis psicológico)

---

## 2. Minijuego 1: Duelo de Ocurrencias (Quiplash Style)

### Ficha Técnica
- **Dinámica:** Batalla de respuestas disparatadas en pantalla dividida con votación de la sala y veredicto de IA.
- **Ritmo:** Rápido, competitivo y enfocado en carcajadas inmediatas.
- **Duración por partida:** 8-12 minutos (2 Rondas + Podio).

### Infografía de Reglas (3 Pasos Visuales en Pantalla)
```
+---------------------------------------------------------------------------------------+
|                              ¿CÓMO SE JUEGA? (20 SEGUNDOS)                            |
+---------------------------------------------------------------------------------------+
|  [ 1. ESCRIBE EN TU MÓVIL ]  -->  [ 2. VOTA EL DUELO ]   -->  [ 3. CORÓNATE EN EL PODIO]|
|  Recibes 2 preguntas absurdas.   Dos respuestas anónimas se   Gana puntos por cada voto |
|  Escribe la ocurrencia más       enfrentan en la TV. ¡Vota    del público y un jugoso   |
|  descarada antes del tiempo.     por la más legendaria!       bono del Anfitrión IA.    |
+---------------------------------------------------------------------------------------+
```

### Guiones de Locución del Anfitrión ("Show Host Script" - 20s)
*Se reproduce mediante síntesis de voz (Web Speech API) y globos de texto cinemáticos al inicio de la partida.*

- **Modo Fiesta Picante (Por defecto):**
  > *"¡Apaguen la decencia que aquí empieza el desmadre! El juego es ultra simple: en su celular van a recibir dos preguntas absurdas. Escriban la peor salvajada o la ocurrencia más graciosa que se les cruce por la mente antes de que muera el reloj. Luego, en la tele, dos respuestas anónimas chocarán a muerte... ¡y toda la sala votará por la mejor! Quien conquiste al público y a mi algoritmo, se lleva la noche. ¡A escribir, descarados!"*

- **Modo Familiar Sarcástico:**
  > *"Buenas noches, respetable salón. Las reglas son para que hasta el abuelo las entienda: dos preguntas por teléfono, cero censura a su creatividad. Escriban su mejor ocurrencia, y luego en la pantalla grande veremos qué familiar tiene verdadero sentido del humor y quién necesita reconsiderar su lugar en la herencia. Voten con el corazón... o con el rencor habitual."*

- **Modo Juez Tirano:**
  > *"¡Silencio en la corte imperial! Vuestras pantallas recibirán dos enigmas grotescos. Tenéis escasos segundos para redactar algo que no ofenda mi procesador. Luego, dos respuestas plebeyas entrarán al coliseo y el pueblo votará quién merece vivir un día más. ¡Que comience el sacrificio retórico!"*

- **Modo Zen Pasivo-Agresivo:**
  > *"Respiren profundo y dejen que el karma cómico fluya a sus pantallas. Dos preguntas llegarán a sus dispositivos; escriban desde el corazón... aunque sepamos que su corazón necesita terapia. Después contemplaremos la energía de sus respuestas en la pantalla grande y votaremos con amor... y juicio."*

---

### Textos Dramáticos de Transición (Duelo de Ocurrencias)

#### A. Presentación de Duelistas (Gladiadores al Ring)
*Antes de abrir la votación, el Host presenta a los dos rivales con tono de combate de boxeo:*

| Arquetipo | Esquina Roja (Opción A) | Esquina Azul (Opción B) | Frase de Enfrentamiento |
| :--- | :--- | :--- | :--- |
| **Fiesta Picante** | *"¡En la esquina roja... con el avatar {avatarA} y ganas de prender fuego al club... llega {authorA}!"* | *"¡En la esquina azul... con el avatar {avatarB} y un descaro sin límites... llega {authorB}!"* | *"¡Dos respuestas entran al coliseo, solo una sale con vida! ¡A VOTAR!"* |
| **Familiar Sarcástico** | *"Por un lado tenemos a {authorA}, defendiendo el honor de la familia..."* | *"Y por el otro a {authorB}, desafiando toda lógica y decoro..."* | *"Veamos quién paga la cuenta de la cena esta noche. ¡Emitan sus votos!"* |
| **Juez Tirano** | *"¡Gladiador número uno: {authorA}! ¿Será digno de mi clemencia?"* | *"¡Gladiador número dos: {authorB}! ¿O caerá derrotado en la arena?"* | *"¡Que ruja el coliseo! ¡Votad o seréis desterrados!"* |
| **Zen Pasivo** | *"Contemplemos el vórtice de energía de {authorA}..."* | *"Frente al aura impredecible de {authorB}..."* | *"Dejen que la intuición cósmica guíe sus dedos hacia el voto sagrado."* |

#### B. Revelación de Votos y Redoble de Tambores
*Al cerrar el timer de votación, se congelan los controles móviles y la pantalla entra en suspenso.*
1. **Pausa Dramática (1.5s):**
   - Sonido: `playDrumroll()` + palpitación `playHeartbeat()`.
   - Texto en TV: *"Cerrando urnas... Calculando la traición..."*
2. **Impacto de Veredicto (Bars Fill):**
   - Animación: Barras de porcentaje rebotan con aceleración elástica.
   - Sonido: `playFanfare()` o `playGavel()`.
   - Locución: *"¡Y la sala ha hablado! {winner} aplasta con el {percent}% de los votos frente a la respuesta de {loser}."*
3. **Casos Especiales:**
   - **Paliza Unánime (100% Sweep):** *"¡DESPIADADO! ¡100% de los votos para {winner}! ¡A {loser} lo mandaron a dormir sin cenar!"* (Efecto: Sacudida de pantalla `screenShake`).
   - **Empate Técnico (50% / 50%):** *"¡GUERRA CIVIL EN LA SALA! ¡Empate clavado! La mitad de ustedes tiene razón y la otra mitad necesita examen de la vista."*

---

## 3. Minijuego 2: El Impostor de Silicio (Social Deduction)

### Ficha Técnica
- **Dinámica:** Juego de engaño social, pistas crípticas y cacería de brujas.
- **El Giro Cómico:** La IA actúa como criminólogo que analiza las pistas más ridículas y las expone en la pantalla.
- **Duración:** 8-10 minutos (2 Rondas).

### Infografía de Reglas (3 Pasos Visuales en Pantalla)
```
+---------------------------------------------------------------------------------------+
|                              ¿CÓMO SE JUEGA? (20 SEGUNDOS)                            |
+---------------------------------------------------------------------------------------+
|  [ 1. MIRA TU ROL SECRETO ]  -->  [ 2. ESCRIBE UNA PISTA ] -->  [ 3. DEBATE Y SENTENCIA]|
|  Todos leen la palabra          Escribe una pista corta:       Lean las pistas en TV,   |
|  secreta en su teléfono...      ¡bastante clara para amigos,   debatan y voten al espía.|
|  ¡excepto uno! (El Impostor).   pero misteriosa para el espía! ¡Si lo cazan, puede huir!|
+---------------------------------------------------------------------------------------+
```

### Guiones de Locución del Anfitrión ("Show Host Script" - 20s)

- **Modo Fiesta Picante:**
  > *"¡Atención, club de la paranoia! En este juego la confianza no existe. Todos van a mirar su teléfono en silencio: casi todos verán la PALABRA SECRETA de la ronda... ¡pero uno de ustedes es el IMPOSTOR y solo verá la categoría! Cada uno debe escribir una pista corta: si eres inocente, hazla sutil para que no te la robe el espía; si eres el impostor... disimula, copia la vibra de los demás y no te delates. Luego debatiremos a los gritos y votaremos para cazarlo. ¡Cuidado con quién tienen al lado!"*

- **Modo Familiar Sarcástico:**
  > *"Es momento de poner a prueba cuántos secretos guardan en este salón. Todos recibirán una palabra secreta en su teléfono, menos una persona que no tiene idea de qué estamos hablando: nuestro querido impostor. Escriban una pista que demuestre que saben la palabra sin regalársela al farsante. Luego debatiremos en familia... y veremos quién es el mejor mentiroso del árbol genealógico."*

- **Modo Juez Tirano:**
  > *"¡Hay un traidor entre vosotros! El sistema ha otorgado un salvoconducto secreto a la mayoría, pero un espía se ha infiltrado en mis filas. Redactad una clave cifrada en vuestros mandos. Quien escriba una tontería será sospechoso, y quien no sepa disimular terminará en la horca pública. ¡Buscad al impostor antes de que engañe a la corte!"*

- **Modo Zen Pasivo-Agresivo:**
  > *"La verdad es un río cristalino, pero hoy alguien está enturbiando las aguas. Todos recibirán una vibración en forma de palabra secreta, salvo un alma perdida que deberá fingir iluminación. Compartan una pista consciente y luego buscaremos juntos la disonancia energética. Namasté a los inocentes... y que el karma encuentre al infiltrado."*

---

### Textos Dramáticos de Transición (El Impostor de Silicio)

#### A. Revelación de Pistas & Debate Abierto (The Roast Board)
- **Apertura de Debate:** *"¡Cartas sobre la mesa! Miren las pistas proyectadas. Hay algunas brillantes... y otras que parecen un grito de auxilio."*
- **Análisis de la IA:** *"Esa pista de {playerName} es tan sospechosa que amerita auditoría fiscal inmediata."*

#### B. El Momento de la Acusación y Sentencia Popular
*Cierre de votación secreta en el móvil:*
1. **Llamado al Juicio:**
   - *"¡SE ACABÓ EL TIEMPO! Todos bajen los celulares y apunten con el dedo... ¿Quién es la rata infiltrada?"*
   - Sonido: `playGavel()` (Tres golpes solemnes de mazo).
2. **El Veredicto del Pueblo:**
   - *"El pueblo soberano ha dictado sentencia con {votesCount} votos... ¡{suspectName}, da un paso al frente!"*
3. **Sentencia Dramática (Dos Desenlaces Posibles):**
   - **Caso 1: Inocente Linchado por Error:**
     - Sonido: `playBuzzer()` (Error estridente) + Iluminación azul fría.
     - Locución: *"¡TRAGEDIA JUDICIAL! ¡{suspectName} era completamente INOCENTE! El verdadero impostor está sentado entre ustedes bebiéndose su trago y riéndose en su cara."*
   - **Caso 2: Impostor Cazado con las Manos en la Masa:**
     - Sonido: `playAlarm()` (Sirena de alarma roja) + Efecto: `redAlertStrobe`.
     - Locución: *"¡BOMBAZO! ¡{suspectName} ERA EL IMPOSTOR! ¡Lo cazaron como a un conejo en el bosque! Pero alto ahí... ¡aún le queda el escape de emergencia!"*

#### C. La Fase de Escape del Impostor (The Final Bluff)
*El impostor tiene 15 segundos en su móvil para adivinar la palabra entre 4 opciones:*
- **Inicio de Escape:** *"¡El impostor está acorralado en la cornisa! Si adivina la palabra secreta en su celular, ¡robará la victoria entera!"*
- **Escape Exitoso:** *"¡ROBO HISTÓRICO! ¡{impostorName} adivinó que la palabra era '{secretWord}'! Se escapó en helicóptero con todos los puntos y les dejó cara de payasos."* (Sonido: `playCashRegister()`).
- **Escape Fallido:** *"¡CRASH! ¡Eligió la opción equivocada y se estrelló contra el suelo! Los inocentes celebran una victoria implacable."* (Sonido: `playFanfare()`).

---

## 4. Minijuego 3: Dilemas Extremos (Moral & Consensus)

### Ficha Técnica
- **Dinámica:** Dilemas surrealistas con mecanismo dual: tu respuesta personal + predicción del consenso grupal + bonificación de 'Lobo Solitario'.
- **El Giro Cómico:** La IA psycho-analiza a la sala según la inclinación moral de sus votos.
- **Duración:** 7-10 minutos (3 Rondas).

### Infografía de Reglas (3 Pasos Visuales en Pantalla)
```
+---------------------------------------------------------------------------------------+
|                              ¿CÓMO SE JUEGA? (20 SEGUNDOS)                            |
+---------------------------------------------------------------------------------------+
|  [ 1. LEE EL DILEMA ]        -->  [ 2. ELIGE Y PREDICE ]   -->  [ 3. EL VOTÓMETRO ]    |
|  En la TV verás dos opciones     En tu móvil: elige qué         El Votómetro mide la    |
|  monstruosas o vergonzosas.      harías TÚ... ¡y apuesta        cordura de la sala.     |
|  ¡Ninguna es agradable!          qué votará la MAYORÍA!         ¡Bonos por acertar o    |
|                                                                 por ser Lobo Solitario! |
+---------------------------------------------------------------------------------------+
```

### Guiones de Locución del Anfitrión ("Show Host Script" - 20s)

- **Modo Fiesta Picante:**
  > *"¡Llegó la hora de medir qué tan retorcidos están todos aquí! En la tele verán un dilema imposible: dos opciones asquerosas o humillantes. En sus celulares tienen dos misiones: primero, elijan cuál de las dos desgracias prefieren para su vida; segundo, apuesten qué creen que elegirá la MAYORÍA de esta sala. Si le atinan a la masa ganan puntos, pero si alguien tiene las agallas de ser el ÚNICO en votar una opción... ¡se lleva el jugoso bono de Lobo Solitario! ¿Listos para conocer a sus verdaderos amigos?"*

- **Modo Familiar Sarcástico:**
  > *"Un ejercicio de honestidad brutal para la familia. Aparecerán dos situaciones que nadie en su sano juicio desearía vivir. Voten por la que tolerarían mejor y predigan qué opina la mayoría del grupo. Aquí descubriremos quién tiene principios firmes, quién se deja llevar por la masa y qué pariente definitivamente necesita ayuda profesional."*

- **Modo Juez Tirano:**
  > *"¡Bienvenidos al tribunal de la perversión ética! Os presento dos tormentos de igual calibre. Vuestra tarea es elegir vuestro veneno en el móvil y anticipar la decadencia de vuestros semejantes. Quien prediga el rebaño triunfará, pero el alma solitaria que desafíe el consenso ganará mi respeto imperial. ¡Elegid vuestro destino!"*

- **Modo Zen Pasivo-Agresivo:**
  > *"El universo nos pone ante encrucijadas para observar el desapego del alma. Dos opciones complejas se manifiestan ante ustedes. Elijan desde su verdad más íntima y sientan la pulsación de lo que el colectivo elegirá. Abrazaremos el consenso... y juzgaremos con cariño a los descarriados."*

---

### Textos Dramáticos de Transición (Dilemas Extremos)

#### A. El Encendido del Votómetro de la Verdad
- **Introducción:** *"¡Votos emitidos! El Votómetro de la Verdad cobra vida... Veamos hacia qué lado se inclina la balanza de la locura."*
- **Sonido:** `playMeterCharge()` (Zumbido eléctrico ascendente) seguido de `playGong()`.

#### B. Análisis Psicológico de Resultados (4 Arquetipos de División)

1. **La Guerra Civil (50% vs 50%):**
   - Rótulo en TV: *"⚔️ ¡GUERRA CIVIL EN LA SALA!"*
   - Locución: *"¡50% y 50%! El grupo está completamente fracturado. Esta discusión no se va a resolver aquí; se va a resolver a gritos en el grupo de WhatsApp a las tres de la mañana."*
   - Puntos: Bono de 'Equilibrio de Oro' (+250 pts a todos).

2. **La Secta Mental (Consenso Unánime 100% vs 0%):**
   - Rótulo en TV: *"🧠 ¡CONSENSO DE COLMENA!"*
   - Locución: *"¡Unanimidad total! El 100% de la sala votó por la misma barbaridad. O todos son unas almas puras... o todos comparten exactamente el mismo trauma infantil."*

3. **La Masa vs El Rebaño (Mayoría Aplastante 80%+):**
   - Rótulo en TV: *"🐑 ¡EL PODER DE LA MASA!"*
   - Locución: *"La opción '{optionName}' arrasó sin piedad con el {percent}% de los votos. Los que votaron por mayoría sonríen con sus puntos bien ganados."*

4. **El Lobo Solitario (+350 Puntos Especiales):**
   - Rótulo en TV: *"🐺 ¡LOBO SOLITARIO DETECTADO!"*
   - Sonido: `playCashRegister()` + Efecto: `spotlightLoneWolf`.
   - Locución: *"¡PARAD LAS MÁQUINAS! Todos votaron una opción... ¡EXCEPTO {playerName}! {playerName} prefirió arder solo en el infierno antes que seguir al rebaño. ¡Bono masivo por valentía y demencia solitaria!"*

---

## 5. Matriz de Efectos Sensoriales y Feedback Sonoro (Game Feel)

Para garantizar un show vivo, reactivo y profesional, cada fase del juego dispara eventos acústicos mediante el sintetizador Web Audio del navegador:

```
+---------------------------------------------------------------------------------------------------------+
|                                    TABLA DE DIRECCIÓN ACÚSTICA DIEGÉTICA                                |
+---------------------------------------------------------------------------------------------------------+
| EVENTO ESCÉNICO             | MÉTODO SINTETIZADOR        | FRECUENCIA / TIMING      | EFECTO VISUAL ASOCIADO    |
+---------------------------------------------------------------------------------------------------------+
| Entrada de Ronda / Intro    | playWhoosh()               | Rampa ascendente 200-800Hz | Fade in con rebote elástico|
| Últimos 5s del Temporizador | playTensionTick()          | Pulso staccato 1000Hz (1s)| Timer en rojo parpadeante |
| Cierre de Votación / Freeze | playGavel()                | Impacto percusivo doble   | Flash blanco en bordes    |
| Suspenso de Revelación      | playDrumroll()             | Redoble dinámico de 1.5s  | Zoom in lento a tarjetas  |
| Impacto de Veredicto / Ganó | playFanfare()              | Acordes C5-E5-G5-C6       | Tarjeta vencedora salta   |
| Paliza 100% (Sweep)         | playAirHorn()              | Sirena festiva trifónica  | Screen Shake (sacudida 6px)|
| Alarma de Impostor Cazado   | playAlarm()                | Sirena bitonal 440-880Hz  | Fondo estroboscópico rojo |
| Escape de Impostor / Lobo   | playCashRegister()         | Tintineo metálico agudo   | Lluvia dorada de monedas  |
| Podio Final de Campeones    | playOrchestralChime()      | Secuencia armónica rica   | Cañón de Confeti continuo |
+---------------------------------------------------------------------------------------------------------+
```

---

## 6. Integración Directa con el Código

Todos los guiones, textos de esquinas de combate, acusaciones de impostor y análisis del votómetro están centralizados en:
- 📦 **Módulo Backend:** [`server/ai/narrativeVoice.js`](file:///c:/Users/Palom/OneDrive/Documentos/anfitriondefiestas/server/ai/narrativeVoice.js)
  - Métodos exportados: `getHowToPlay(gameId, personalityId)`, `getDuelPresentation(personalityId, data)`, `getVoteRevealCue(personalityId, data)`, `getImpostorSentence(personalityId, data)`, `getDilemaVotometerAnalysis(personalityId, data)`.
- 🖥️ **Controlador Frontend:** [`public/js/host.js`](file:///c:/Users/Palom/OneDrive/Documentos/anfitriondefiestas/public/js/host.js)
  - Modos de voz con pronunciación en español neutro vía Web Speech API.
  - Temporizadores de 20s para la pantalla de CÓMO JUGAR con botón de "Saltar" en el mando del Host para fiestas rápidas.
