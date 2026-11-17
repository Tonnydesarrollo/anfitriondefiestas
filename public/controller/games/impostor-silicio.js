import { escapeHtml } from '/shared/cast.js';
import { partyAudio } from '/shared/audio.js';

export function renderImpostorController(g, { stage, socket, shouldSkipRedraw, renderWaitCard }) {
  if (g.phase === 'INTRO') {
    const sig = `INTRO:${g.currentRound}:${g.isImpostor}`;
    if (shouldSkipRedraw(sig)) return;
    stage.innerHTML = `
      <div class="pad-card" style="background:${g.isImpostor ? '#fee2e2' : '#dcfce7'};">
        <span class="pad-kicker" style="background:${g.isImpostor ? '#c1121f' : '#059669'};color:#fff;">
          ${g.isImpostor ? '🕵️ ROL SECRETO: IMPOSTOR' : '😇 ROL SECRETO: INOCENTE'}
        </span>
        <h2 class="pad-prompt-title">Categoría: ${escapeHtml(g.category || '')}</h2>
        <div style="padding:14px;background:#fff;border:var(--jb-border-thin);border-radius:14px;text-align:center;">
          ${g.isImpostor
            ? `<strong style="font-size:1.15rem;color:#c1121f;">NO SABES LA PALABRA.<br/>Finge y deduce de qué hablan.<br/>Pista sutil: ${escapeHtml(g.hint || 'Observa las pistas')}</strong>`
            : `<span style="font-size:0.85rem;font-weight:800;color:#475569;">PALABRA SECRETA:</span><div style="font-family:var(--font-display);font-size:1.9rem;color:#065f46;">${escapeHtml(g.secretWord)}</div>`}
        </div>
        <p class="pad-subtext">¡No dejes que nadie espíe tu pantalla!</p>
      </div>
    `;
    return;
  }

  if (g.phase === 'CLUES_1' || g.phase === 'CLUES_2') {
    const sig = `${g.phase}:${g.hasSubmittedClue}:${g.currentRound}`;
    if (shouldSkipRedraw(sig)) return;
    if (g.hasSubmittedClue) {
      stage.innerHTML = renderWaitCard('Pista cifrada enviada', 'Espera a que todos los jugadores envíen su pista de camuflaje.');
      return;
    }
    stage.innerHTML = `
      <form id="impClueForm" class="pad-card">
        <span class="pad-kicker">${g.isImpostor ? 'CAMÚFLATE SIN DELATARTE' : `PALABRA: ${escapeHtml(g.secretWord)}`}</span>
        <h2 class="pad-prompt-title">Escribe 1 pista corta (${escapeHtml(g.category)})</h2>
        <input id="impClueInput" class="pad-text-input" maxlength="28" placeholder="Ej. Brillante, cocina, noche..." required />
        <button type="submit" class="jb-btn jb-btn-primary" style="padding:14px;font-size:1.05rem;">🧩 ENVIAR PISTA</button>
      </form>
    `;
    stage.querySelector('#impClueForm').addEventListener('submit', (e) => {
      e.preventDefault();
      partyAudio.playSfx('pop');
      const val = stage.querySelector('#impClueInput').value.trim();
      if (val) socket.emit('player:submit_clue', { clue: val });
    });
    return;
  }

  if (g.phase === 'VOTING') {
    const sig = `VOTE:${g.currentRound}:${g.hasVoted}`;
    if (shouldSkipRedraw(sig)) return;
    if (g.hasVoted) {
      stage.innerHTML = renderWaitCard('🗳️ Acusación sellada', 'Mira la pantalla grande para descubrir a quién expulsó el grupo.');
      return;
    }
    const candidates = g.candidates || [];
    stage.innerHTML = `
      <div class="pad-card">
        <span class="pad-kicker">ELIGE AL IMPOSTOR</span>
        <h2 class="pad-prompt-title">¿Quién está fingiendo?</h2>
        <div class="pad-choice-stack">
          ${candidates.map(c => `
            <button type="button" class="jb-btn jb-btn-paper pad-choice-btn" data-suspect="${escapeHtml(c.id)}">
              <span>🎯 <strong>${escapeHtml(c.name)}</strong> — <small>${escapeHtml(c.clue)}</small></span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
    stage.querySelectorAll('[data-suspect]').forEach(btn => {
      btn.addEventListener('click', () => {
        partyAudio.playSfx('gavel');
        socket.emit('player:submit_impostor_vote', { suspectId: btn.dataset.suspect });
      });
    });
    return;
  }

  if (g.phase === 'ESCAPE') {
    const sig = `ESC:${g.currentRound}:${g.isImpostor}`;
    if (shouldSkipRedraw(sig)) return;
    if (!g.isImpostor) {
      stage.innerHTML = renderWaitCard('⚡ ¡El Impostor intenta escapar!', 'Si adivina la palabra secreta ahora, se robará la victoria.');
      return;
    }
    const opts = g.escapeOptions || [];
    stage.innerHTML = `
      <div class="pad-card" style="background:#fee2e2;">
        <span class="pad-kicker" style="background:#c1121f;color:#fff;">¡ÚLTIMA OPORTUNIDAD!</span>
        <h2 class="pad-prompt-title">¡Hackea la palabra secreta para ganar!</h2>
        <div class="pad-choice-stack">
          ${opts.map(opt => `
            <button type="button" class="jb-btn jb-btn-crimson pad-choice-btn" data-guess="${escapeHtml(opt)}">
              🔐 ${escapeHtml(opt)}
            </button>
          `).join('')}
        </div>
      </div>
    `;
    stage.querySelectorAll('[data-guess]').forEach(btn => {
      btn.addEventListener('click', () => {
        partyAudio.playSfx('pop');
        socket.emit('player:submit_impostor_guess', { guess: btn.dataset.guess });
      });
    });
    return;
  }

  const sig = `WAIT:${g.phase}:${g.currentRound}`;
  if (shouldSkipRedraw(sig)) return;
  const msg = g.phase === 'DEBATE'
    ? (g.isImpostor ? '¡Defiéndete en voz alta sin revelar que eres el Impostor!' : 'Debatan en voz alta las pistas en la TV antes de votar.')
    : 'Observa el veredicto en la pantalla del salón.';
  stage.innerHTML = renderWaitCard('Atento al salón', msg);
}
