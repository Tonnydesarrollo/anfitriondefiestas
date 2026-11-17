import { resolveCast, renderCastImg, escapeHtml } from '/shared/cast.js';

function castLookup(list = []) {
  const map = new Map();
  for (const p of list) map.set(p.id, resolveCast(p.avatar));
  return map;
}

export function renderImpostorTv(g, { renderSharedPodiumOrResults }) {
  if (g.phase === 'RESULTS' || g.phase === 'PODIUM') {
    return renderSharedPodiumOrResults(g);
  }

  const avatarMap = castLookup(g.leaderboard || []);

  if (g.phase === 'INTRO') {
    return `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;">
        <div class="game-banner-pill">EXPEDIENTE CLASIFICADO • RONDA ${g.currentRound}</div>
        <article class="jb-card big-prompt-card" style="background:#f6efe2;transform:rotate(-0.5deg);">
          <span class="jb-pill" style="background:#c1121f;color:#fff;margin-bottom:10px;">CATEGORÍA ACTIVA</span>
          <h2>🤫 ${escapeHtml(g.category || 'Clasificado')}</h2>
          <p style="margin-top:10px;font-weight:800;color:#4a3f55;font-size:1.05rem;">Miren en secreto su celular: todos conocen la palabra excepto el Impostor.</p>
        </article>
      </div>
    `;
  }

  if (g.phase === 'CLUES_1' || g.phase === 'CLUES_2' || g.phase === 'DEBATE' || g.phase === 'VOTING') {
    const headline = g.phase === 'DEBATE'
      ? '🗣️ ¡DEBATE EN EL SALÓN! ¿QUIÉN FINGE SABER?'
      : (g.phase === 'VOTING' ? '🗳️ ¡JUICIO! ACUSA AL SOSPECHOSO EN TU MÓVIL' : `✍️ ENVÍEN SU PISTA (${g.category})`);
    const clues = g.clues || [];
    return `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:14px;">
        <div class="game-banner-pill">${headline}</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px;width:100%;max-width:980px;">
          ${clues.map((item, i) => {
            const c = avatarMap.get(item.playerId) || resolveCast();
            const rot = (i % 2 === 0 ? -1 : 1) * 1.2;
            const cText = g.phase === 'CLUES_1' ? (item.clue1 ? '🔒 PISTA LISTA' : 'Pensando...') : item.clue;
            return `
              <article class="jb-card" style="padding:14px;background:#f6efe2;transform:rotate(${rot}deg);display:flex;flex-direction:column;gap:8px;border-top:8px solid ${c.color};">
                <div style="display:flex;align-items:center;gap:10px;">
                  ${renderCastImg(c, 'score-row-avatar')}
                  <strong style="font-family:var(--font-display);font-size:1.15rem;">${escapeHtml(item.playerName)}</strong>
                </div>
                <div style="background:#fff;border:2.5px solid #12101d;border-radius:12px;padding:10px 12px;font-family:var(--font-display);font-size:1.1rem;text-align:center;">
                  ${escapeHtml(cText || '⏳ Escribiendo...')}
                </div>
              </article>
            `;
          }).join('')}
        </div>
        ${g.aiCommentary ? `
          <div class="jb-card" style="padding:10px 18px;max-width:860px;background:var(--jb-gold);">
            <strong>🕵️ ANFITRIÓN:</strong> <span style="font-weight:800;">${escapeHtml(g.aiCommentary)}</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  if (g.phase === 'RESOLUTION' || g.phase === 'ESCAPE') {
    const r = g.resolution || {};
    const banner = g.phase === 'ESCAPE'
      ? '⚡ ¡ÚLTIMA OPORTUNIDAD! EL IMPOSTOR INTENTA ADIVINAR LA PALABRA'
      : (r.wasImpostorCaught ? '🚨 ¡IMPOSTOR DESCUBIERTO!' : '😈 ¡EL IMPOSTOR SE SALIÓ CON LA SUYA!');
    return `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;">
        <div class="game-banner-pill">${banner}</div>
        <article class="jb-card big-prompt-card" style="background:#f6efe2;">
          <p style="font-weight:900;font-size:1rem;color:#991b1b;">EL SALÓN EXPULSÓ A: ${escapeHtml(r.votedOutName || 'NADIE')}</p>
          <h2 style="margin:8px 0;">🕵️ El verdadero Impostor era: <span style="color:#c1121f;">${escapeHtml(r.realImpostorName)}</span></h2>
          ${g.phase === 'RESOLUTION' ? `
            <div style="margin-top:12px;display:inline-block;padding:8px 20px;background:var(--jb-gold);border:var(--jb-border);border-radius:14px;font-family:var(--font-display);font-size:1.3rem;">
              PALABRA SECRETA: ${escapeHtml(r.secretWord)}
            </div>
          ` : ''}
        </article>
      </div>
    `;
  }

  return '';
}
