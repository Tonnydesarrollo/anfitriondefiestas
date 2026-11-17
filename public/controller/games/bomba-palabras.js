import { escapeHtml } from '/shared/cast.js';
import { partyAudio } from '/shared/audio.js';

export function renderBombaController(g, { stage, socket, shouldSkipRedraw, renderWaitCard }) {
  if (g.phase === 'EXPLOSION' || g.phase === 'ROUND_RESULTS') {
    const sig = `WAIT:${g.phase}:${g.currentRound}`;
    if (shouldSkipRedraw(sig)) return;
    stage.innerHTML = renderWaitCard(
      g.phase === 'EXPLOSION' ? '💥 ¡KABOOM!' : 'Resumen de la ronda',
      'Mira la pantalla principal para ver quién sobrevivió a la explosión.'
    );
    return;
  }

  if (!g.isMyTurn) {
    const sig = `NOTTURN:${g.currentRound}:${g.activePlayerName}:${g.bombPassCount}`;
    if (shouldSkipRedraw(sig)) return;
    stage.innerHTML = renderWaitCard(
      `💣 ${g.activePlayerName || 'Otro jugador'} tiene la bomba`,
      `Regla activa: ${g.prompt || ''}. ¡Prepárate porque puede caerte en cualquier instante!`
    );
    return;
  }

  const sig = `MYTURN:${g.currentRound}:${g.bombPassCount}:${g.filter || g.prompt}`;
  if (shouldSkipRedraw(sig)) return;

  stage.innerHTML = `
    <form id="bombaForm" class="pad-card" style="background:#fef3c7;border-color:#d97706;">
      <span class="pad-kicker" style="background:#dc2626;color:#fff;">💣 ¡TIENES LA BOMBA EN LAS MANOS!</span>
      <h2 class="pad-prompt-title">${escapeHtml(g.prompt || 'Escribe una palabra')}</h2>
      <input id="bombaWordInput" class="pad-text-input" maxlength="32" placeholder="${g.filter ? `Incluye "${escapeHtml(g.filter)}"...` : 'Escribe tu palabra rápido...'}" autocomplete="off" required />
      <p id="bombaErr" class="join-error hidden"></p>
      <button type="submit" class="jb-btn jb-btn-crimson" style="padding:15px;font-size:1.15rem;">🔥 ¡PASAR LA BOMBA!</button>
    </form>
  `;

  const input = stage.querySelector('#bombaWordInput');
  const errEl = stage.querySelector('#bombaErr');
  input.focus();

  stage.querySelector('#bombaForm').addEventListener('submit', (e) => {
    e.preventDefault();
    errEl.classList.add('hidden');
    const word = input.value.trim();
    if (!word) return;
    socket.emit('player:submit_bomba_word', { word }, (res) => {
      if (res && res.success === false) {
        partyAudio.playSfx('wrong');
        errEl.textContent = res.error || 'Palabra inválida, intenta otra.';
        errEl.classList.remove('hidden');
        input.select();
      } else {
        partyAudio.playSfx('correct');
      }
    });
  });
}
