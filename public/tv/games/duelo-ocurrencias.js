import { resolveCast, renderCastImg, escapeHtml } from '/shared/cast.js';

export function renderDueloTv(g, { renderSharedPodiumOrResults }) {
  if (g.phase === 'ROUND_RESULTS' || g.phase === 'PODIUM') {
    return renderSharedPodiumOrResults(g);
  }

  const players = g.leaderboard || [];

  if (g.phase === 'ANSWERING') {
    return `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;">
        <div class="game-banner-pill">FASE DE CREACIÓN — RESPONDE EN TU TELÉFONO</div>
        <article class="jb-card big-prompt-card" style="background:#fffdf7;transform:rotate(-0.6deg);">
          <h2>✍️ ¡Inventa las 2 ocurrencias más ingeniosas antes de que suene la chicharra!</h2>
          <p style="margin-top:10px;font-weight:800;color:#473d66;font-size:1.05rem;">Nadie verá tus respuestas hasta que entren al cuadrilátero de duelos.</p>
        </article>
        <div class="progress-cast-strip">
          ${players.map(p => {
            const c = resolveCast(p.avatar);
            return `
              <div class="cast-status-chip ${p.hasAnswered ? 'done' : ''}">
                ${renderCastImg(c)}
                <span>${escapeHtml(p.name)}</span>
                <strong>${p.hasAnswered ? '✅' : '✍️'}</strong>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  if (g.phase === 'VOTING' || g.phase === 'AI_JUDGING') {
    const d = g.currentDuel;
    if (!d) return '';
    const isReveal = g.phase === 'AI_JUDGING';
    const votesA = d.optionA?.votesCount || 0;
    const votesB = d.optionB?.votesCount || 0;
    const winA = isReveal && votesA > votesB;
    const winB = isReveal && votesB > votesA;

    return `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:14px;">
        <div class="game-banner-pill">DUELO ${d.duelIndex || 1} DE ${d.totalDuels || 1}</div>
        <article class="jb-card big-prompt-card" style="padding:18px 28px;margin-bottom:4px;">
          <h2>“${escapeHtml(d.promptText)}”</h2>
        </article>

        <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:16px;align-items:center;width:100%;max-width:980px;">
          <article class="jb-card" style="padding:24px 22px;background:${winA ? '#fff7ed' : '#fffdf7'};border-color:#ff6b1a;box-shadow:0 10px 0 #12101d;transform:rotate(-1.2deg);min-height:190px;display:flex;flex-direction:column;justify-content:space-between;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span class="jb-pill" style="background:#ff6b1a;color:#fff;">OPCIÓN A</span>
              ${isReveal ? `<span class="jb-pill" style="background:var(--jb-gold);">${votesA} VOTO${votesA === 1 ? '' : 'S'}</span>` : ''}
            </div>
            <p style="font-family:var(--font-display);font-size:1.65rem;line-height:1.2;margin:14px 0;color:#12101d;">${escapeHtml(d.optionA?.text)}</p>
            <div style="font-weight:900;font-size:0.9rem;color:#c2410c;">
              ${isReveal ? `Autor: ${escapeHtml(d.optionA?.authorName)}${winA ? ' 🏆' : ''}` : '🔒 Anónimo — ¡Vota en tu móvil!'}
            </div>
          </article>

          <div style="width:64px;height:64px;border-radius:50%;background:var(--jb-gold);color:var(--jb-ink);border:var(--jb-border);box-shadow:0 5px 0 var(--jb-ink);display:grid;place-items:center;font-family:var(--font-display);font-size:1.6rem;font-weight:700;">
            VS
          </div>

          <article class="jb-card" style="padding:24px 22px;background:${winB ? '#ecfeff' : '#fffdf7'};border-color:#00b4d8;box-shadow:0 10px 0 #12101d;transform:rotate(1.2deg);min-height:190px;display:flex;flex-direction:column;justify-content:space-between;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span class="jb-pill" style="background:#00b4d8;color:#fff;">OPCIÓN B</span>
              ${isReveal ? `<span class="jb-pill" style="background:var(--jb-gold);">${votesB} VOTO${votesB === 1 ? '' : 'S'}</span>` : ''}
            </div>
            <p style="font-family:var(--font-display);font-size:1.65rem;line-height:1.2;margin:14px 0;color:#12101d;">${escapeHtml(d.optionB?.text)}</p>
            <div style="font-weight:900;font-size:0.9rem;color:#0e7490;">
              ${isReveal ? `Autor: ${escapeHtml(d.optionB?.authorName)}${winB ? ' 🏆' : ''}` : '🔒 Anónimo — ¡Vota en tu móvil!'}
            </div>
          </article>
        </div>

        ${isReveal && d.aiJudgement?.commentary ? `
          <div class="jb-card" style="padding:12px 20px;max-width:860px;background:var(--jb-gold);">
            <strong style="font-family:var(--font-title);font-size:0.86rem;">🎙️ VEREDICTO DEL ANFITRIÓN:</strong>
            <span style="font-weight:800;margin-left:6px;">${escapeHtml(d.aiJudgement.commentary)}</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  return '';
}
