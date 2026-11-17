import { resolveCast, renderCastImg, escapeHtml } from '/shared/cast.js';

export function renderBombaTv(g, { renderSharedPodiumOrResults }) {
  if (g.phase === 'ROUND_RESULTS' || g.phase === 'RESULTS' || g.phase === 'PODIUM') {
    return renderSharedPodiumOrResults(g);
  }

  const players = g.leaderboard || [];
  const activePlayer = players.find(p => p.id === g.activePlayerId);

  if (g.phase === 'EXPLOSION') {
    const victimCast = resolveCast(g.explodedPlayerAvatar);
    return `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;">
        <div class="game-banner-pill" style="background:#dc2626;">💥 ¡KABOOOOOM! ESTALLÓ LA BOMBA</div>
        <article class="jb-card big-prompt-card" style="background:#fee2e2;">
          <div style="display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:10px;">
            ${renderCastImg(victimCast, 'podium-cast-img')}
          </div>
          <h2 style="color:#991b1b;">¡La mecha explotó en manos de ${escapeHtml(g.explodedPlayerName || 'alguien')}!</h2>
          <p style="margin-top:8px;font-weight:800;color:#7f1d1d;">Los demás sobrevivientes suman puntos de supervivencia.</p>
        </article>
      </div>
    `;
  }

  const activeCast = resolveCast(activePlayer?.avatar);
  const words = g.wordsAccepted || [];

  return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:14px;">
      <div class="game-banner-pill">💣 PASES: ${g.bombPassCount || 0} • SÍLABA / TEMA ACTIVO</div>
      <article class="jb-card big-prompt-card" style="background:#fffbeb;border-color:#d97706;">
        ${g.filter ? `<span class="jb-pill" style="background:#fb5607;color:#fff;font-size:1.15rem;margin-bottom:8px;">CONTENER: ${escapeHtml(g.filter)}</span>` : ''}
        <h2>${escapeHtml(g.prompt || '¡Escribe rápido!')}</h2>
      </article>

      <article class="jb-card" style="padding:18px 28px;display:flex;align-items:center;gap:18px;background:${activeCast.color};color:#fff;">
        ${renderCastImg(activeCast, 'cast-seat-img')}
        <div>
          <div style="font-size:0.82rem;font-weight:900;letter-spacing:0.08em;">TIENE LA BOMBA AHORA MISMO:</div>
          <div style="font-family:var(--font-display);font-size:2rem;text-shadow:0 3px 0 var(--jb-ink);">${escapeHtml(g.activePlayerName || '...')}</div>
        </div>
      </article>

      ${words.length > 0 ? `
        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;max-width:860px;">
          ${words.slice(-8).map(w => `<span class="jb-pill" style="background:var(--jb-paper);">✅ ${escapeHtml(w)}</span>`).join('')}
        </div>
      ` : ''}
    </div>
  `;
}
