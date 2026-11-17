import { CAST_ROSTER, resolveCast, escapeHtml, getGameMeta } from '/shared/cast.js';
import { BACKEND_URL } from '/shared/config.js';
import { partyAudio } from '/shared/audio.js';

import { renderDueloController } from '/controller/games/duelo-ocurrencias.js';
import { renderImpostorController } from '/controller/games/impostor-silicio.js';
import { renderDilemasController } from '/controller/games/dilemas-extremos.js';
import { renderBombaController } from '/controller/games/bomba-palabras.js';
import { renderFalsoController } from '/controller/games/falso-sabio.js';
import { renderTriviaController } from '/controller/games/trivia-caotica.js';
import { renderTelepatiaController } from '/controller/games/telepatia-fiesta.js';

const CTRL_RENDERERS = {
  'duelo-ocurrencias': renderDueloController,
  'impostor-silicio': renderImpostorController,
  'dilemas-extremos': renderDilemasController,
  'bomba-palabras': renderBombaController,
  'falso-sabio': renderFalsoController,
  'trivia-caotica': renderTriviaController,
  'telepatia-fiesta': renderTelepatiaController
};

const els = {
  joinScreen: document.getElementById('joinScreen'),
  joinForm: document.getElementById('joinForm'),
  roomCodeInput: document.getElementById('roomCodeInput'),
  playerNameInput: document.getElementById('playerNameInput'),
  castPickerGrid: document.getElementById('castPickerGrid'),
  joinErrorMsg: document.getElementById('joinErrorMsg'),
  joinSubmitBtn: document.getElementById('joinSubmitBtn'),

  padScreen: document.getElementById('padScreen'),
  padHeader: document.getElementById('padHeader'),
  padAvatarImg: document.getElementById('padAvatarImg'),
  padPlayerName: document.getElementById('padPlayerName'),
  padRoomCode: document.getElementById('padRoomCode'),
  padScoreNum: document.getElementById('padScoreNum'),
  padStage: document.getElementById('padStage')
};

const params = new URLSearchParams(window.location.search);
let selectedAvatarId = params.get('avatar') || CAST_ROSTER[Math.floor(Math.random() * CAST_ROSTER.length)].id;
let myPrivateState = null;
let lastRenderKey = '';

function getDeviceToken() {
  let tok = localStorage.getItem('anfitrion_device_token');
  if (!tok) {
    tok = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('anfitrion_device_token', tok);
  }
  return tok;
}

function renderCastPicker() {
  els.castPickerGrid.innerHTML = CAST_ROSTER.map(c => `
    <button type="button"
      class="cast-pick-btn ${c.id === selectedAvatarId ? 'selected' : ''}"
      style="--pick-color:${c.color}"
      data-cast-id="${c.id}"
      title="${escapeHtml(c.label)}"
      aria-checked="${c.id === selectedAvatarId}"
      role="radio">
      <img src="${c.image}" alt="${escapeHtml(c.label)}" draggable="false" />
    </button>
  `).join('');

  els.castPickerGrid.querySelectorAll('.cast-pick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      partyAudio.playSfx('pop');
      selectedAvatarId = btn.dataset.castId;
      renderCastPicker();
    });
  });
}

// Prefill from URL (?room=ABCD&name=Bot)
const urlRoom = (params.get('room') || params.get('code') || '').trim().toUpperCase().slice(0, 4);
const urlName = (params.get('name') || '').trim().slice(0, 14);
if (urlRoom) els.roomCodeInput.value = urlRoom;
if (urlName) els.playerNameInput.value = urlName;

const socket = window.io(BACKEND_URL || undefined, { transports: ['websocket', 'polling'] });

function renderWaitCard(headline, subtext, castAvatar) {
  const c = resolveCast(castAvatar);
  return `
    <div class="pad-card">
      <span class="pad-kicker">MIRA LA PANTALLA PRINCIPAL</span>
      <div class="pad-wait-hero">
        <img src="${c.image}" alt="${escapeHtml(c.label)}" />
        <h2 class="pad-prompt-title">${escapeHtml(headline)}</h2>
        <p class="pad-subtext">${escapeHtml(subtext)}</p>
      </div>
    </div>
  `;
}

function renderConnectedState(priv) {
  myPrivateState = priv;
  const me = priv.me || {};
  const c = resolveCast(me.avatar);

  els.joinScreen.classList.add('hidden');
  els.padScreen.classList.remove('hidden');

  els.padHeader.style.setProperty('--player-color', c.color);
  els.padAvatarImg.src = c.image;
  els.padPlayerName.textContent = me.name || 'Jugador';
  els.padRoomCode.textContent = priv.roomCode;
  els.padScoreNum.textContent = (me.score || 0).toLocaleString();

  const g = priv.game;
  if (!g || priv.status === 'LOBBY') {
    const key = `LOBBY:${priv.roomCode}`;
    if (lastRenderKey !== key) {
      lastRenderKey = key;
      els.padStage.innerHTML = renderWaitCard(
        `¡Estás dentro, ${me.name || 'Crack'}!`,
        'Ya sales en el escenario principal. Usa los emojis de abajo para reaccionar mientras entran tus amigos.',
        c
      );
    }
    return;
  }

  const meta = getGameMeta(g.gameId);

  if (g.phase === 'HOW_TO_PLAY') {
    const key = `HOW_TO_PLAY:${g.gameId}`;
    if (lastRenderKey !== key) {
      lastRenderKey = key;
      els.padStage.innerHTML = renderWaitCard(
        `Reglas de ${meta.title}`,
        'Presta atención a la pantalla del salón. ¡En unos segundos empieza la acción en tu teléfono!',
        c
      );
    }
    return;
  }

  if (g.phase === 'PODIUM') {
    const badgeText = g.isTie
      ? (g.isCoChampion ? '🤝 ¡CO-CAMPEÓN EMPATADO!' : `Quedaste en #${g.rank}`)
      : (g.isWinner ? '👑 ¡CAMPEÓN DEL SHOW!' : `Finalizaste en puesto #${g.rank || '-'}`);
    const key = `PODIUM:${g.gameId}:${g.rank}:${g.totalScore}`;
    if (lastRenderKey !== key) {
      lastRenderKey = key;
      els.padStage.innerHTML = renderWaitCard(
        badgeText,
        `Puntuación final: ${(g.totalScore || me.score || 0).toLocaleString()} PTS. ¡Mira el podio en la TV!`,
        c
      );
    }
    return;
  }

  const renderer = CTRL_RENDERERS[g.gameId];
  if (renderer) {
    renderer(g, {
      stage: els.padStage,
      socket,
      me,
      avatar: c,
      shouldSkipRedraw: (sig) => {
        const fullSig = `${g.gameId}:${sig}`;
        if (lastRenderKey === fullSig) return true;
        lastRenderKey = fullSig;
        return false;
      },
      renderWaitCard: (h, s) => renderWaitCard(h, s, c)
    });
  }
}

function submitJoin(e) {
  if (e) e.preventDefault();
  partyAudio.unlock();
  els.joinErrorMsg.classList.add('hidden');

  const roomCode = (els.roomCodeInput.value || '').trim().toUpperCase();
  const playerName = (els.playerNameInput.value || '').trim();
  if (roomCode.length !== 4) {
    els.joinErrorMsg.textContent = 'Escribe el código de 4 letras que ves en la TV.';
    els.joinErrorMsg.classList.remove('hidden');
    return;
  }
  if (playerName.length < 2) {
    els.joinErrorMsg.textContent = 'Tu nombre necesita al menos 2 letras.';
    els.joinErrorMsg.classList.remove('hidden');
    return;
  }

  els.joinSubmitBtn.disabled = true;
  els.joinSubmitBtn.textContent = 'CONECTANDO...';

  socket.emit('player:join', {
    roomCode,
    playerName,
    avatarId: selectedAvatarId,
    deviceToken: getDeviceToken()
  }, (res) => {
    els.joinSubmitBtn.disabled = false;
    els.joinSubmitBtn.textContent = '¡ENTRAR A JUGAR!';
    if (!res?.success) {
      els.joinErrorMsg.textContent = res?.error || 'No se pudo entrar a la sala.';
      els.joinErrorMsg.classList.remove('hidden');
      return;
    }
    partyAudio.playSfx('join');
    if (res.privateState) renderConnectedState(res.privateState);
  });
}

els.joinForm.addEventListener('submit', submitJoin);

// Bottom emoji reaction flinger
document.querySelectorAll('.react-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    partyAudio.playSfx('pop');
    socket.emit('player:react', { emoji: btn.dataset.emoji });
  });
});

// Socket listeners
socket.on('connect', () => {
  if (params.get('autojoin') === '1' && urlRoom && urlName) {
    submitJoin();
  }
});

socket.on('player:state_update', (priv) => {
  if (priv) renderConnectedState(priv);
});

socket.on('player:joined_success', (res) => {
  if (res?.privateState) renderConnectedState(res.privateState);
});

renderCastPicker();
