import { resolveCast, renderCastImg, escapeHtml } from '/shared/cast.js';

export function renderTriviaTv(g, { renderSharedPodiumOrResults }) {
  if (g.phase === 'RESULTS' || g.phase === 'PODIUM') {
    return renderSharedPodiumOrResults(g);
  }

  const isReveal = g.phase === 'REVEAL';
  const opts = g.options || [];
  const players = g.leaderboard || [];
  const labels = ['A', 'B', 'C', 'D'];

  return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:14px;">
      <div class="game-banner-pill" style="background:#9b1d20;">
        💀 ${escapeHtml(g.category || 'CULTURA POP')}${g.isDoublePoints ? ' • ¡DOBLES X2!' : ''}
      </div>
      <article class="jb-card big-prompt-card" style="background:#fffdf7;padding:20px 28px;margin-bottom:2px;">
        <h2>${escapeHtml(g.question || '')}</h2>
      </article>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;max-width:920px;">
        ${opts.map((txt, idx) => {
          const isRight = isReveal && idx === g.correctIndex;
          const isDim = isReveal && idx !== g.correctIndex;
          return `
            <article class="jb-card" style="padding:16px 18px;display:flex;align-items:center;gap:12px;background:${isRight ? '#bbf7d0' : '#fffdf7'};border-color:${isRight ? '#059669' : '#12101d'};opacity:${isDim ? 0.52 : 1};">
              <span class="jb-pill" style="background:${isRight ? '#059669' : '#9b1d20'};color:#fff;font-size:1rem;">${labels[idx] || idx + 1}</span>
              <strong style="font-family:var(--font-display);font-size:1.25rem;line-height:1.18;">${escapeHtml(txt)}</strong>
            </article>
          `;
        }).join('')}
      </div>

      ${isReveal ? `
        ${g.explanation ? `
          <div class="jb-card" style="padding:12px 20px;max-width:860px;background:var(--jb-gold);">
            <strong>🧠 DATO CURIOSO:</strong> <span style="font-weight:800;">${escapeHtml(g.explanation)}</span>
          </div>
        ` : ''}
      ` : `
        <div class="progress-cast-strip">
          ${players.map(p => {
            const c = resolveCast(p.avatar);
            return `
              <div class="cast-status-chip ${p.hasAnswered ? 'done' : ''}">
                ${renderCastImg(c)}
                <span>${escapeHtml(p.name)}</span>
                <strong>${p.hasAnswered ? '⚡' : '⏳'}</strong>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
}
