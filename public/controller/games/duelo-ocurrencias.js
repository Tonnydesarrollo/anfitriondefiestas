import { escapeHtml } from '/shared/cast.js';
import { partyAudio } from '/shared/audio.js';

export function renderDueloController(g, { stage, socket, shouldSkipRedraw, renderWaitCard }) {
  if (g.phase === 'ANSWERING') {
    const sig = `ANS:${g.currentRound}:${Boolean(g.allSubmitted)}`;
    if (shouldSkipRedraw(sig)) return;

    if (g.allSubmitted) {
      stage.innerHTML = renderWaitCard('¡Ocurrencias enviadas!', 'Espera a que los demás terminen sus chistes para pasar a los duelos.');
      return;
    }

    const prompts = g.prompts || [];
    stage.innerHTML = `
      <form id="dueloAnsForm" class="pad-card">
        <span class="pad-kicker">ESCRIBE TUS OCURRENCIAS (${prompts.length})</span>
        ${prompts.map((p, idx) => `
          <div style="display:flex;flex-direction:column;gap:5px;">
            <label style="font-family:var(--font-display);font-size:1.05rem;">${idx + 1}. ${escapeHtml(p.promptText)}</label>
            <textarea class="pad-textarea" data-duel-id="${escapeHtml(p.duelId)}" rows="2" maxlength="100" placeholder="Tu respuesta más graciosa..." required>${escapeHtml(p.currentAnswer || '')}</textarea>
          </div>
        `).join('')}
        <button type="submit" class="jb-btn jb-btn-primary" style="padding:14px;font-size:1.08rem;">📤 ¡ENVIAR RESPUESTAS!</button>
      </form>
    `;

    stage.querySelector('#dueloAnsForm').addEventListener('submit', (e) => {
      e.preventDefault();
      partyAudio.playSfx('pop');
      const answers = {};
      stage.querySelectorAll('[data-duel-id]').forEach(ta => {
        answers[ta.dataset.duelId] = ta.value.trim() || 'Sin comentarios 😅';
      });
      socket.emit('player:submit_answers', { answers });
    });
    return;
  }

  if (g.phase === 'VOTING') {
    const sig = `VOTE:${g.duelId}:${Boolean(g.isDuelist)}:${Boolean(g.hasVoted)}`;
    if (shouldSkipRedraw(sig)) return;

    if (g.isDuelist) {
      stage.innerHTML = renderWaitCard('🥊 ¡Tu duelo está en vivo!', 'Tú compites aquí: mantén cara de póquer mientras el salón vota.');
      return;
    }
    if (g.hasVoted) {
      stage.innerHTML = renderWaitCard('✅ Voto secreto enviado', 'Mira la pantalla TV para conocer al ganador del duelo.');
      return;
    }

    stage.innerHTML = `
      <div class="pad-card">
        <span class="pad-kicker">ELIGE LA MEJOR RESPUESTA</span>
        <h2 class="pad-prompt-title">${escapeHtml(g.promptText)}</h2>
        <div class="pad-choice-stack">
          <button type="button" class="jb-btn pad-choice-btn" data-choice="A" style="background:#ff6b1a;color:#fff;">
            A • ${escapeHtml(g.options?.A || '')}
          </button>
          <button type="button" class="jb-btn pad-choice-btn" data-choice="B" style="background:#00b4d8;color:#fff;">
            B • ${escapeHtml(g.options?.B || '')}
          </button>
        </div>
      </div>
    `;

    stage.querySelectorAll('[data-choice]').forEach(btn => {
      btn.addEventListener('click', () => {
        partyAudio.playSfx('pop');
        socket.emit('player:vote', { duelId: g.duelId, choice: btn.dataset.choice });
      });
    });
    return;
  }

  const fallbackSig = `WAIT:${g.phase}:${g.currentRound}`;
  if (shouldSkipRedraw(fallbackSig)) return;
  stage.innerHTML = renderWaitCard('Veredicto en la pantalla', 'Observa la pantalla del salón para ver los votos y puntos.');
}
