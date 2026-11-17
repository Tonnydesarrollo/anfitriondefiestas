import { escapeHtml } from '/shared/cast.js';
import { partyAudio } from '/shared/audio.js';

export function renderFalsoController(g, { stage, socket, shouldSkipRedraw, renderWaitCard }) {
  if (g.phase === 'LIE_WRITING') {
    const sig = `LIE:${g.currentRound}:${g.hasSubmittedLie}`;
    if (shouldSkipRedraw(sig)) return;
    if (g.hasSubmittedLie) {
      stage.innerHTML = renderWaitCard('🥸 Farol guardado', 'Espera a que los demás redacten sus mentiras.');
      return;
    }

    stage.innerHTML = `
      <form id="falsoLieForm" class="pad-card">
        <span class="pad-kicker">INVENTA UNA MENTIRA CREÍBLE</span>
        <h2 class="pad-prompt-title">${escapeHtml(g.fact || g.question || '')}</h2>
        <input id="falsoLieInput" class="pad-text-input" maxlength="60" placeholder="Completa con un dato falso..." required />
        <p id="falsoLieErr" class="join-error hidden"></p>
        <button type="submit" class="jb-btn jb-btn-primary" style="padding:14px;font-size:1.05rem;">🤥 ENVIAR FAROL</button>
      </form>
    `;

    const input = stage.querySelector('#falsoLieInput');
    const errEl = stage.querySelector('#falsoLieErr');
    stage.querySelector('#falsoLieForm').addEventListener('submit', (e) => {
      e.preventDefault();
      errEl.classList.add('hidden');
      const lie = input.value.trim();
      if (!lie) return;
      socket.emit('player:submit_falso_lie', { lie }, (res) => {
        if (res && res.success === false) {
          partyAudio.playSfx('wrong');
          errEl.textContent = res.error || 'Esa respuesta es demasiado parecida a la verdad. ¡Cambia tu farol!';
          errEl.classList.remove('hidden');
        } else {
          partyAudio.playSfx('pop');
        }
      });
    });
    return;
  }

  if (g.phase === 'TRUTH_VOTING') {
    const sig = `VOTE:${g.currentRound}:${g.hasVoted}`;
    if (shouldSkipRedraw(sig)) return;
    if (g.hasVoted) {
      stage.innerHTML = renderWaitCard('🔍 Voto enviado', 'Mira en la pantalla grande cuánta gente cayó en tu mentira.');
      return;
    }

    const opts = g.selectableOptions || [];
    stage.innerHTML = `
      <div class="pad-card">
        <span class="pad-kicker">ENCUENTRA LA ÚNICA VERDAD</span>
        <h2 class="pad-prompt-title">${escapeHtml(g.fact || g.question || '')}</h2>
        <div class="pad-choice-stack">
          ${opts.map(txt => `
            <button type="button" class="jb-btn jb-btn-paper pad-choice-btn" data-truth="${escapeHtml(txt)}">
              ${escapeHtml(txt)}
            </button>
          `).join('')}
        </div>
      </div>
    `;
    stage.querySelectorAll('[data-truth]').forEach(btn => {
      btn.addEventListener('click', () => {
        partyAudio.playSfx('pop');
        socket.emit('player:submit_falso_vote', { choice: btn.dataset.truth });
      });
    });
    return;
  }

  const sig = `WAIT:${g.phase}:${g.currentRound}`;
  if (shouldSkipRedraw(sig)) return;
  stage.innerHTML = renderWaitCard('Atento al Falso Sabio', 'Mira en la TV quién engañó a quién y cómo queda la tabla.');
}
