import { escapeHtml } from '/shared/cast.js';
import { partyAudio } from '/shared/audio.js';

export function renderTriviaController(g, { stage, socket, shouldSkipRedraw, renderWaitCard }) {
  if (g.phase === 'QUESTION') {
    const sig = `Q:${g.currentRound}:${g.hasAnswered}`;
    if (shouldSkipRedraw(sig)) return;
    if (g.hasAnswered) {
      stage.innerHTML = renderWaitCard('⚡ ¡Respuesta bloqueada!', 'Espera un instante para saber quién sobrevivió al asalto.');
      return;
    }

    const opts = g.options || [];
    const colors = ['#e63946', '#2563eb', '#d97706', '#059669'];
    const labels = ['A', 'B', 'C', 'D'];

    stage.innerHTML = `
      <div class="pad-card">
        <span class="pad-kicker">💀 ¡RESPONDE RÁPIDO! (${escapeHtml(g.category || 'TRIVIA')})</span>
        <h2 class="pad-prompt-title">${escapeHtml(g.question || '')}</h2>
        <div class="pad-choice-stack">
          ${opts.map((opt, idx) => `
            <button type="button" class="jb-btn pad-choice-btn" data-idx="${idx}" style="background:${colors[idx % 4]};color:#fff;">
              <strong>${labels[idx]}.</strong> ${escapeHtml(opt)}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    stage.querySelectorAll('[data-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        partyAudio.playSfx('pop');
        socket.emit('player:submit_trivia_answer', { choiceIndex: parseInt(btn.dataset.idx, 10) });
      });
    });
    return;
  }

  if (g.phase === 'REVEAL') {
    const sig = `REV:${g.currentRound}:${g.isCorrect}`;
    if (shouldSkipRedraw(sig)) return;
    stage.innerHTML = renderWaitCard(
      g.isCorrect ? '🎉 ¡ACERTASTE!' : '💀 ¡FALLASTE!',
      g.explanation || 'Mira el marcador en la TV para ver cómo cambian los puestos.'
    );
    return;
  }

  const sig = `WAIT:${g.phase}:${g.currentRound}`;
  if (shouldSkipRedraw(sig)) return;
  stage.innerHTML = renderWaitCard('Prepárate para la pregunta', 'Lee la categoría en la pantalla principal.');
}
