import { escapeHtml } from '/shared/cast.js';
import { partyAudio } from '/shared/audio.js';

export function renderDilemasController(g, { stage, socket, shouldSkipRedraw, renderWaitCard }) {
  if (g.phase === 'CHOICE') {
    const sig = `CHOICE:${g.currentRound}:${g.hasChosen}`;
    if (shouldSkipRedraw(sig)) return;

    if (g.hasChosen) {
      stage.innerHTML = renderWaitCard('¡Decisión y apuesta enviadas!', 'Mira cómo sube el Votómetro en la pantalla del salón.');
      return;
    }

    const d = g.dilemma || {};
    let myChoice = null;
    let myPred = null;

    stage.innerHTML = `
      <div class="pad-card">
        <span class="pad-kicker">1° TU POSTURA • 2° APUESTA MAYORÍA</span>
        <h2 class="pad-prompt-title">${escapeHtml(d.question || '')}</h2>
        <div style="font-weight:900;font-size:0.86rem;color:#0284c7;">¿QUÉ ELEGIRÍAS TÚ?</div>
        <div class="pad-choice-stack">
          <button type="button" class="jb-btn jb-btn-paper pad-choice-btn" data-my="A">A • ${escapeHtml(d.optionA || '')}</button>
          <button type="button" class="jb-btn jb-btn-paper pad-choice-btn" data-my="B">B • ${escapeHtml(d.optionB || '')}</button>
        </div>
        <div style="font-weight:900;font-size:0.86rem;color:#ea580c;margin-top:4px;">¿QUÉ CREES QUE VOTARÁ LA MAYORÍA?</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <button type="button" class="jb-btn jb-btn-paper" style="padding:12px;" data-pred="A">MAYORÍA A</button>
          <button type="button" class="jb-btn jb-btn-paper" style="padding:12px;" data-pred="B">MAYORÍA B</button>
        </div>
        <button id="dilemaSendBtn" type="button" class="jb-btn jb-btn-primary" style="padding:14px;font-size:1.05rem;" disabled>🚀 ENVIAR DECISIÓN</button>
      </div>
    `;

    const sendBtn = stage.querySelector('#dilemaSendBtn');
    const syncBtn = () => { sendBtn.disabled = !(myChoice && myPred); };

    stage.querySelectorAll('[data-my]').forEach(btn => {
      btn.addEventListener('click', () => {
        partyAudio.playSfx('pop');
        myChoice = btn.dataset.my;
        stage.querySelectorAll('[data-my]').forEach(b => b.classList.toggle('selected', b === btn));
        syncBtn();
      });
    });

    stage.querySelectorAll('[data-pred]').forEach(btn => {
      btn.addEventListener('click', () => {
        partyAudio.playSfx('pop');
        myPred = btn.dataset.pred;
        stage.querySelectorAll('[data-pred]').forEach(b => b.classList.toggle('selected', b === btn));
        syncBtn();
      });
    });

    sendBtn.addEventListener('click', () => {
      if (!myChoice || !myPred) return;
      partyAudio.playSfx('pop');
      socket.emit('player:choose_dilemma', { choice: myChoice, prediction: myPred });
    });
    return;
  }

  const sig = `WAIT:${g.phase}:${g.currentRound}`;
  if (shouldSkipRedraw(sig)) return;
  stage.innerHTML = renderWaitCard('Mira el Dilema en la TV', 'El Anfitrión está presentando la pregunta o revelando el Votómetro.');
}
