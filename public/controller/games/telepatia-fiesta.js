import { escapeHtml } from '/shared/cast.js';
import { partyAudio } from '/shared/audio.js';

export function renderTelepatiaController(g, { stage, socket, shouldSkipRedraw, renderWaitCard }) {
  if (g.phase === 'SPECTRUM') {
    const sig = `SPEC:${g.currentRound}:${g.hasSubmitted}`;
    if (shouldSkipRedraw(sig)) return;
    if (g.hasSubmitted) {
      stage.innerHTML = renderWaitCard('📡 Frecuencia fijada', 'Mira la pantalla TV para descubrir dónde cayó la mente colmena.');
      return;
    }

    const startVal = g.myValue ?? 50;
    stage.innerHTML = `
      <form id="teleForm" class="pad-card">
        <span class="pad-kicker">CALIBRA TU DIAL MENTAL</span>
        <h2 class="pad-prompt-title">${escapeHtml(g.topic || '')}</h2>
        <div style="display:flex;justify-content:space-between;font-size:0.8rem;font-weight:900;color:#475569;">
          <span>0% ${escapeHtml(g.leftLabel || '')}</span>
          <span>100% ${escapeHtml(g.rightLabel || '')}</span>
        </div>
        <div style="text-align:center;font-family:var(--font-display);font-size:2.4rem;color:var(--jb-connect-accent);" id="teleDialVal">${startVal}%</div>
        <input id="teleSlider" type="range" min="0" max="100" value="${startVal}" style="width:100%;accent-color:#06d6a0;height:36px;cursor:pointer;" />
        <button type="submit" class="jb-btn jb-btn-mint" style="padding:14px;font-size:1.1rem;">📡 FIJAR SINTONÍA</button>
      </form>
    `;

    const slider = stage.querySelector('#teleSlider');
    const valReadout = stage.querySelector('#teleDialVal');
    slider.addEventListener('input', () => {
      valReadout.textContent = `${slider.value}%`;
    });

    stage.querySelector('#teleForm').addEventListener('submit', (e) => {
      e.preventDefault();
      partyAudio.playSfx('pop');
      socket.emit('player:submit_telepatia_value', { value: parseInt(slider.value, 10) });
    });
    return;
  }

  const sig = `WAIT:${g.phase}:${g.currentRound}`;
  if (shouldSkipRedraw(sig)) return;
  stage.innerHTML = renderWaitCard('Telepatía en vivo', 'Observa la barra de consenso en la pantalla del salón.');
}
