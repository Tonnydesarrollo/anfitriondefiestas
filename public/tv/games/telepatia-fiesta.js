import { resolveCast, renderCastImg, escapeHtml } from '/shared/cast.js';

export function renderTelepatiaTv(g, { renderSharedPodiumOrResults }) {
  if (g.phase === 'RESULTS' || g.phase === 'PODIUM') {
    return renderSharedPodiumOrResults(g);
  }

  const isReveal = g.phase === 'REVEAL';
  const players = g.players || g.leaderboard || [];
  const median = g.groupResult?.median ?? g.duelResult?.senderValue ?? null;

  return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;">
      <div class="game-banner-pill" style="background:#06d6a0;color:#12101d;">📡 ESPECTRO DE TELEPATÍA MENTAL</div>
      <article class="jb-card big-prompt-card" style="padding:20px 28px;margin-bottom:2px;">
        <h2>${escapeHtml(g.topic || '')}</h2>
      </article>

      <article class="jb-card" style="width:100%;max-width:940px;padding:24px 26px;background:#fffdf7;">
        <div style="display:flex;justify-content:space-between;font-family:var(--font-display);font-size:1.15rem;margin-bottom:16px;">
          <span class="jb-pill" style="background:#ffbe0b;">0% • ${escapeHtml(g.leftLabel || 'Cero')}</span>
          <span class="jb-pill" style="background:#ff2e93;color:#fff;">100% • ${escapeHtml(g.rightLabel || 'Máximo')}</span>
        </div>

        <div style="position:relative;height:44px;border-radius:999px;border:var(--jb-border);background:linear-gradient(90deg,#ffd60a 0%,#06d6a0 50%,#ff2e93 100%);box-shadow:0 5px 0 var(--jb-ink);margin:26px 0 14px;">
          ${isReveal && median !== null ? `
            <div style="position:absolute;left:${median}%;top:-26px;transform:translateX(-50%);background:#12101d;color:#ffd60a;border:2.5px solid #fff;border-radius:999px;padding:2px 10px;font-family:var(--font-mono);font-size:0.86rem;font-weight:800;white-space:nowrap;z-index:5;">
              🎯 CONSENSO ${median}%
            </div>
          ` : ''}
          ${isReveal ? players.map(p => {
            const val = p.value ?? 50;
            const c = resolveCast(p.avatar);
            return `
              <div style="position:absolute;left:${val}%;top:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;z-index:4;">
                <div style="width:42px;height:42px;border-radius:50%;background:${c.color};border:3px solid #12101d;padding:2px;box-shadow:0 3px 0 #12101d;">
                  ${renderCastImg(c)}
                </div>
                <span style="margin-top:4px;background:#12101d;color:#fff;border-radius:999px;padding:1px 7px;font-size:0.7rem;font-weight:800;white-space:nowrap;">${escapeHtml(p.name)} (${val}%)</span>
              </div>
            `;
          }).join('') : ''}
        </div>
      </article>

      ${isReveal && g.aiCommentary ? `
        <div class="jb-card" style="padding:12px 20px;max-width:860px;background:var(--jb-gold);">
          <strong>🎙️ SINTONÍA DEL GRUPO:</strong> <span style="font-weight:800;">${escapeHtml(g.aiCommentary)}</span>
        </div>
      ` : `
        <div class="progress-cast-strip">
          ${players.map(p => {
            const c = resolveCast(p.avatar);
            return `
              <div class="cast-status-chip ${p.hasSubmitted ? 'done' : ''}">
                ${renderCastImg(c)}
                <span>${escapeHtml(p.name)}</span>
                <strong>${p.hasSubmitted ? '📡' : '🎚️'}</strong>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
}
