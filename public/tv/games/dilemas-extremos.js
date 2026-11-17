import { resolveCast, renderCastImg, escapeHtml } from '/shared/cast.js';

export function renderDilemasTv(g, { renderSharedPodiumOrResults }) {
  if (g.phase === 'RESULTS' || g.phase === 'PODIUM') {
    return renderSharedPodiumOrResults(g);
  }

  const d = g.dilemma || {};
  const isReveal = g.phase === 'REVEAL';
  const pctA = isReveal ? (g.percentA ?? 50) : 50;
  const pctB = isReveal ? (g.percentB ?? 50) : 50;

  return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:14px;">
      <div class="game-banner-pill">${isReveal ? '📊 ¡VEREDICTO DEL VOTÓMETRO!' : '⚖️ DILEMA IMPOSIBLE — DECIDE EN TU TELÉFONO'}</div>
      <article class="jb-card big-prompt-card" style="padding:20px 28px;margin-bottom:2px;">
        <h2>${escapeHtml(d.question || 'Elige una postura')}</h2>
      </article>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;width:100%;max-width:960px;">
        <article class="jb-card" style="padding:22px;background:#e0f2fe;border-color:#0284c7;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="jb-pill" style="background:#0284c7;color:#fff;">PORTAL A</span>
            ${isReveal ? `<strong style="font-family:var(--font-display);font-size:1.85rem;color:#0369a1;">${pctA}%</strong>` : ''}
          </div>
          <p style="font-family:var(--font-display);font-size:1.45rem;margin-top:12px;line-height:1.2;">${escapeHtml(d.optionA || '')}</p>
        </article>

        <article class="jb-card" style="padding:22px;background:#ffedd5;border-color:#ea580c;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="jb-pill" style="background:#ea580c;color:#fff;">PORTAL B</span>
            ${isReveal ? `<strong style="font-family:var(--font-display);font-size:1.85rem;color:#c2410c;">${pctB}%</strong>` : ''}
          </div>
          <p style="font-family:var(--font-display);font-size:1.45rem;margin-top:12px;line-height:1.2;">${escapeHtml(d.optionB || '')}</p>
        </article>
      </div>

      ${isReveal ? `
        <div style="width:100%;max-width:860px;height:28px;border:var(--jb-border);border-radius:999px;overflow:hidden;display:flex;box-shadow:0 4px 0 var(--jb-ink);">
          <div style="width:${pctA}%;background:#0284c7;transition:width .5s;"></div>
          <div style="width:${pctB}%;background:#ea580c;transition:width .5s;"></div>
        </div>
        ${g.aiCommentary ? `
          <div class="jb-card" style="padding:10px 18px;max-width:860px;background:var(--jb-gold);">
            <strong>🎙️ ANFITRIÓN:</strong> <span style="font-weight:800;">${escapeHtml(g.aiCommentary)}</span>
          </div>
        ` : ''}
      ` : `
        <div class="progress-cast-strip">
          ${(g.leaderboard || []).map(p => {
            const c = resolveCast(p.avatar);
            const chosen = (g.players || []).some(dp => dp.playerId === p.id);
            return `
              <div class="cast-status-chip ${chosen ? 'done' : ''}">
                ${renderCastImg(c)}
                <span>${escapeHtml(p.name)}</span>
                <strong>${chosen ? '✅' : '🤔'}</strong>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
}
