# ADR-002: Motor de Anfitrión IA Local con Ollama y Cero Costo de Tokens

## Contexto
Los party games comerciales como Jackbox utilizan audios pregrabados que se vuelven repetitivos, mientras que el uso de APIs cloud (OpenAI, Gemini comercial por API key de pago) genera costos recurrentes por partida y riesgo de fallos por latencia de red en fiestas.

## Decisión
Integrar un servidor local **Ollama** con el modelo **`qwen2.5:3b`** (o equivalente liviano cuantizado):
1. **0 Tokens / 0 Costo**: Ejecución 100% offline o en red de área local.
2. **Prompts con Personalidad**: Inyección de Few-Shot de comediante sarcástico de stand-up en español latinoamericano/neutro.
3. **Mecanismo Fallback Silencioso**: Si Ollama no está encendido o responde con retardo (>3s), el servidor conmuta a un generador procedural de frases humorísticas sin interrumpir la partida.

## Consecuencias
- **Positivo**: Privacidad total y juego gratuito ilimitado.
- **Positivo**: Comentarios reactivos a lo que escribieron los jugadores.
- **Trade-off**: Requiere que la máquina host tenga Ollama instalado para habilitar las líneas generativas dinámicas.
