/**
 * gamePrompts.js
 * Base de datos categorizada por Rangos de Edad / Dinámica de Grupo:
 * - FAMILIA: Padres e hijos, todo público, sano, creativo y divertido.
 * - AMIGOS: Amigos de fiesta (+18), humor picante, fiestas, anécdotas atrevidas.
 * - PAREJAS: Citas, convivencia, manías, amor y celos cómicos.
 * - CEREBRITOS: Ciencia ficción, inventos bizarros, paradojas y humor absurdo.
 */

export const AUDIENCE_MODES = {
  FAMILIA: 'familia',       // Todo público / Padres e hijos
  AMIGOS: 'amigos',         // +18 / Amigos de fiesta picante
  PAREJAS: 'parejas',       // Parejas y citas
  CEREBRITOS: 'cerebritos'  // Ingenio, sci-fi y filosofía absurda
};

export const PROMPT_DATABASE = [
  // ==========================================
  // 1. FAMILIA / PADRES E HIJOS (TODO PÚBLICO)
  // ==========================================
  { audience: AUDIENCE_MODES.FAMILIA, text: '¿Qué hace realmente tu mascota cuando te vas de la casa y cree que nadie la ve?' },
  { audience: AUDIENCE_MODES.FAMILIA, text: 'La peor excusa de un estudiante para justificar que no entregó la tarea.' },
  { audience: AUDIENCE_MODES.FAMILIA, text: 'El superpoder más inútil del mundo que solo serviría para hacer los quehaceres de la casa.' },
  { audience: AUDIENCE_MODES.FAMILIA, text: '¿Qué piensa el refrigerador cuando lo abres por quinta vez en diez minutos sin sacar nada?' },
  { audience: AUDIENCE_MODES.FAMILIA, text: 'El peor sabor de helado que arruinaría una fiesta de cumpleaños infantil.' },
  { audience: AUDIENCE_MODES.FAMILIA, text: 'Una nueva regla familiar obligatoria que mamá o papá implementarían con gusto.' },
  { audience: AUDIENCE_MODES.FAMILIA, text: 'Si tu perro pudiera hablar por un solo minuto, ¿qué reclamo te haría primero?' },
  { audience: AUDIENCE_MODES.FAMILIA, text: 'El nombre de una película animada donde los villanos son las verduras.' },
  { audience: AUDIENCE_MODES.FAMILIA, text: 'El peor regalo de Navidad que viene envuelto con mucho cariño pero cero utilidad.' },
  { audience: AUDIENCE_MODES.FAMILIA, text: 'Un sonido vergonzoso que nunca deberías hacer en medio del silencio del salón de clases.' },
  { audience: AUDIENCE_MODES.FAMILIA, text: '¿Cuál sería el peor trabajo para un perezoso en el reino animal?' },
  { audience: AUDIENCE_MODES.FAMILIA, text: 'Una señal indiscutible de que te estás convirtiendo exactamente en tus padres.' },
  { audience: AUDIENCE_MODES.FAMILIA, text: 'El invento perfecto para que los niños ordenen su cuarto en menos de 5 segundos.' },
  { audience: AUDIENCE_MODES.FAMILIA, text: 'Si los juguetes cobraran vida como en Toy Story, ¿de qué se quejarían los tuyos?' },

  // ==========================================
  // 2. AMIGOS (+18 / FIESTA PICANTE / SPICY)
  // ==========================================
  { audience: AUDIENCE_MODES.AMIGOS, text: 'El peor mensaje de texto que puedes mandar a las 3:00 AM tras una noche de copas.' },
  { audience: AUDIENCE_MODES.AMIGOS, text: 'Un fetiche tan extraño que los extraterrestres decidirían cancelar la invasión.' },
  { audience: AUDIENCE_MODES.AMIGOS, text: 'La mentira más descarada que le has dicho a tu jefe un lunes por la mañana para no ir a trabajar.' },
  { audience: AUDIENCE_MODES.AMIGOS, text: '¿Cuál sería el peor tema de conversación en la primera reunión con tus suegros?' },
  { audience: AUDIENCE_MODES.AMIGOS, text: 'El secreto inconfesable que jamás admitirías sobrio frente a este grupo de amigos.' },
  { audience: AUDIENCE_MODES.AMIGOS, text: 'El peor lugar y momento para que te dé un ataque repentino de flatulencia.' },
  { audience: AUDIENCE_MODES.AMIGOS, text: '¿Qué es lo más turbio que alguien podría encontrar en tu historial de navegación en modo incógnito?' },
  { audience: AUDIENCE_MODES.AMIGOS, text: 'El peor consejo financiero que podrías darle a tu mejor amigo con resaca.' },
  { audience: AUDIENCE_MODES.AMIGOS, text: 'Una frase que arruina de inmediato la tensión romántica en la cama.' },
  { audience: AUDIENCE_MODES.AMIGOS, text: 'El castigo que debería existir para el amigo que siempre se hace el desentendido al pagar la cuenta.' },
  { audience: AUDIENCE_MODES.AMIGOS, text: 'La señal más clara de que tu cita de Tinder usó fotos de cuando aún existía Myspace.' },
  { audience: AUDIENCE_MODES.AMIGOS, text: '¿Qué es lo primero que harías si despiertas desnudo en el techo de un Walmart?' },
  { audience: AUDIENCE_MODES.AMIGOS, text: 'El nombre de una bebida alcohólica que te garantiza despertar con una orden de alejamiento.' },

  // ==========================================
  // 3. PAREJAS / CITAS (RELATIONSHIP HUMOR)
  // ==========================================
  { audience: AUDIENCE_MODES.PAREJAS, text: 'La peor respuesta a la temida pregunta: "¿Qué somos?"' },
  { audience: AUDIENCE_MODES.PAREJAS, text: 'Esa pequeña manía de tu pareja que en secreto te saca de quicio todos los días.' },
  { audience: AUDIENCE_MODES.PAREJAS, text: 'El peor apodo cariñoso que tu pareja podría decirte en voz alta en una cena elegante.' },
  { audience: AUDIENCE_MODES.PAREJAS, text: 'La mentira blanca más común sobre "¿dónde quieres ir a comer hoy?"' },
  { audience: AUDIENCE_MODES.PAREJAS, text: 'El regalo de aniversario que casi provoca un divorcio instantáneo.' },
  { audience: AUDIENCE_MODES.PAREJAS, text: '¿Qué significa realmente cuando tu pareja te dice: "No me pasa nada, estoy bien"?' },
  { audience: AUDIENCE_MODES.PAREJAS, text: 'La excusa más floja para justificar haberte comido el último pedazo de postre en el refrigerador.' },
  { audience: AUDIENCE_MODES.PAREJAS, text: 'El crimen doméstico más grave: ¿robar la cobija o ver un capítulo de la serie sin el otro?' },
  { audience: AUDIENCE_MODES.PAREJAS, text: 'La frase definitiva para salir victorioso de una discusión sin tener la razón.' },
  { audience: AUDIENCE_MODES.PAREJAS, text: '¿Cómo sería el Tinder para encontrar pareja en el asilo de ancianos?' },
  { audience: AUDIENCE_MODES.PAREJAS, text: 'El peor momento para pedirle matrimonio a alguien.' },

  // ==========================================
  // 4. CEREBRITOS / ABSURDO / INGENIO
  // ==========================================
  { audience: AUDIENCE_MODES.CEREBRITOS, text: 'Una teoría de conspiración ridícula pero que extrañamente tiene todo el sentido del mundo.' },
  { audience: AUDIENCE_MODES.CEREBRITOS, text: 'El invento tecnológico que la humanidad necesita con urgencia aunque no lo sepa.' },
  { audience: AUDIENCE_MODES.CEREBRITOS, text: '¿Por qué la Inteligencia Artificial realmente decidiría exterminar o ignorar a la raza humana?' },
  { audience: AUDIENCE_MODES.CEREBRITOS, text: 'Si pudieras viajar en el tiempo 500 años al pasado, ¿qué objeto moderno causaría más caos?' },
  { audience: AUDIENCE_MODES.CEREBRITOS, text: 'La ley de la física que debería ser abolida por molesta e innecesaria.' },
  { audience: AUDIENCE_MODES.CEREBRITOS, text: 'El peor nombre para una nave espacial intergaláctica financiada por millonarios excéntricos.' },
  { audience: AUDIENCE_MODES.CEREBRITOS, text: '¿Qué pregunta existencial haría que ChatGPT o cualquier IA entrara en un bucle existencial infinito?' },
  { audience: AUDIENCE_MODES.CEREBRITOS, text: 'El argumento más absurdo para convencer a los terraplanistas de que la Tierra tiene forma de rosquilla.' },
  { audience: AUDIENCE_MODES.CEREBRITOS, text: 'Un nuevo elemento de la tabla periódica y su efecto colateral más bizarro.' }
];

/**
 * Obtiene prompts aleatorios filtrados por rango de edad / audiencia.
 * @param {string} audience 'familia' | 'amigos' | 'parejas' | 'cerebritos'
 * @param {number} count Cantidad de prompts requeridos
 * @returns {string[]} Lista de textos de prompts sin repetir
 */
export function getPromptsByAudience(audience = AUDIENCE_MODES.AMIGOS, count = 10) {
  const normAudience = String(audience).toLowerCase();
  let pool = PROMPT_DATABASE.filter(p => p.audience === normAudience);

  // Si no hay suficientes, rellenar con modo familia o general
  if (pool.length < count) {
    const generalPool = PROMPT_DATABASE.filter(p => p.audience === AUDIENCE_MODES.FAMILIA);
    pool = [...pool, ...generalPool];
  }

  // Mezclar con Fisher-Yates
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count).map(p => p.text);
}

/**
 * Fallback genérico compatible hacia atrás
 */
export function getRandomFallbackPrompts(count = 10) {
  return getPromptsByAudience(AUDIENCE_MODES.AMIGOS, count);
}
