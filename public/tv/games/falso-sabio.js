import { resolveCast, renderCastImg, escapeHtml } from '/shared/cast.js';

export function renderFalsoTv(g, { renderSharedPodiumOrResults }) {
  if (g.phase === 'RESULTS' || g.phase === 'PODIUM') {
    return renderSharedPodiumOrResults(g);
  }

  const players = g.leaderboard || [];
  const isReveal = g.phase === 'REVEAL';

  if (g.phase === 'INTRO' || g.phase === 'LIE_WRITING') {
    return `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;">
        <div class="game-banner-pill" style="background:#d62828;">🥸 INVENTA UNA MENTIRA CONVINCENTE</div>
        <article class="jb-card big-prompt-card" style="background:#f5efe0;">
          <h2>“${escapeHtml(g.fact || g.question || '')}”</h2>
        </article>
        <div class="progress-cast-strip">
          ${players.map(p => {
            const c = resolveCast(p.avatar);
            return `
              <div class="cast-status-chip ${p.hasSubmittedLie ? 'done' : ''}">
                ${renderCastImg(c)}
                <span>${escapeHtml(p.name)}</span>
                <strong>${p.hasSubmittedLie ? '✅' : '✍️'}</strong>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  if (g.phase === 'TRUTH_VOTING' || isReveal) {
    const opts = g.options || [];
    return `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:12px;">
        <div class="game-banner-pill" style="background:${isReveal ? '#059669' : '#d62828'};">
          ${isReveal ? '🔍 ¡REVELACIÓN DE LA VERDAD Y LOS FAROLES!' : '🕵️ ¿CUÁL DE ESTAS ES LA VERDAD REAL?'}
        </div>
        <article class="jb-card big-prompt-card" style="padding:16px 24px;margin-bottom:2px;background:#f5efe0;">
          <h2 style="font-size:1.55rem;">“${escapeHtml(g.fact || g.question || '')}”</h2>
        </article>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;width:100%;max-width:960px;">
          ${opts.map(o => {
            const isTruth = Boolean(isReveal && o.isTruth);
            const voters = o.voters || [];
            return `
              <article class="jb-card" style="padding:14px 16px;background:${isTruth ? '#bbf7d0' : '#fffdf7'};border-color:${isTruth ? '#059669' : '#12101d'};">
                <div style="font-family:var(--font-display);font-size:1.25rem;line-height:1.18;">${escapeHtml(o.text)}</div>
                ${isReveal ? `
                  <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;gap:8px;">
                    <span class="jb-pill" style="background:${isTruth ? '#059669' : '#d62828'};color:#fff;">
                      ${escapeHtml(o.authorName || '')}
                    </span>
                    <span style="font-weight:900;font-size:0.82rem;">${voters.length} cayeron</span>
                  </div>
                ` : ''}
              </article>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  return '';
}
