import { GAME_CATALOG, AUDIENCE_MODES, getGameMeta, resolveCast, renderCastImg, escapeHtml } from '/shared/cast.js';
import { BACKEND_URL } from '/shared/config.js';
import { partyAudio } from '/shared/audio.js';

// Game Stage Renderers (loaded modularly)
import { renderDueloTv } from '/tv/games/duelo-ocurrencias.js';
import { renderImpostorTv } from '/tv/games/impostor-silicio.js';
import { renderDilemasTv } from '/tv/games/dilemas-extremos.js';
import { renderBombaTv } from '/tv/games/bomba-palabras.js';
import { renderFalsoTv } from '/tv/games/falso-sabio.js';
import { renderTriviaTv } from '/tv/games/trivia-caotica.js';
import { renderTelepatiaTv } from '/tv/games/telepatia-fiesta.js';

const TV_RENDERERS = {
  'duelo-ocurrencias': renderDueloTv,
  'impostor-silicio': renderImpostorTv,
  'dilemas-extremos': renderDilemasTv,
  'bomba-palabras': renderBombaTv,
  'falso-sabio': renderFalsoTv,
  'trivia-caotica': renderTriviaTv,
  'telepatia-fiesta': renderTelepatiaTv
};

const els = {
  topbarTitle: document.getElementById('topbarGameTitle'),
  topbarRound: document.getElementById('topbarRoundBadge'),
  voiceSelect: document.getElementById('voiceSelect'),
  personalitySelect: document.getElementById('personalitySelect'),
  toggleAudioBtn: document.getElementById('toggleAudioBtn'),
  skipPhaseBtn: document.getElementById('skipPhaseBtn'),
  backLobbyBtn: document.getElementById('backLobbyBtn'),
  compactRoomChip: document.getElementById('compactRoomChip'),
  compactRoomCode: document.getElementById('compactRoomCode'),

  lobbyView: document.getElementById('lobbyView'),
  featuredPosterImg: document.getElementById('featuredPosterImg'),
  featuredGameTag: document.getElementById('featuredGameTag'),
  featuredGameTitle: document.getElementById('featuredGameTitle'),
  featuredGameDesc: document.getElementById('featuredGameDesc'),
  audiencePills: document.getElementById('audiencePills'),
  joinUrlLabel: document.getElementById('joinUrlLabel'),
  lobbyRoomCode: document.getElementById('lobbyRoomCode'),
  lobbyQrImg: document.getElementById('lobbyQrImg'),
  packGrid: document.getElementById('packGrid'),
  playerCounterBadge: document.getElementById('playerCounterBadge'),
  lobbyPlayersGrid: document.getElementById('lobbyPlayersGrid'),
  startShowBtn: document.getElementById('startShowBtn'),

  gameView: document.getElementById('gameView'),
  stageTimerBar: document.getElementById('stageTimerBar'),
  stageTimerNum: document.getElementById('stageTimerNum'),
  gameStageSlot: document.getElementById('gameStageSlot'),

  hostBubble: document.getElementById('hostBubble'),
  hostSubtitleText: document.getElementById('hostSubtitleText'),
  hostPuppetWrap: document.getElementById('hostPuppetWrap'),
  reactionLayer: document.getElementById('reactionLayer')
};

const state = {
  room: null,
  lastPhaseSignature: '',
  lastPlayerCount: 0,
  lastVoiceKey: ''
};

// Setup Host Puppet talking animation listener
partyAudio.setSpeakingListener((speaking, subtitle) => {
  els.hostPuppetWrap.classList.toggle('is-talking', speaking);
  els.hostPuppetWrap.classList.toggle('is-idle', !speaking);
  if (subtitle) {
    els.hostSubtitleText.textContent = subtitle;
    els.hostBubble.classList.remove('hidden');
  } else if (!speaking) {
    els.hostBubble.classList.add('hidden');
  }
});

// Socket.IO connection
const socket = window.io(BACKEND_URL || undefined, { transports: ['websocket', 'polling'] });

async function initVoices() {
  const voices = await partyAudio.loadVoices();
  els.voiceSelect.innerHTML = '';
  if (voices.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'Voz Sistema ES';
    els.voiceSelect.appendChild(opt);
    return;
  }
  for (const v of voices) {
    const id = v.id || v.name;
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = v.name || v.label || id;
    if (id === partyAudio.selectedVoiceId) opt.selected = true;
    els.voiceSelect.appendChild(opt);
  }
}

async function fetchQr(code) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/room/${code}/qr`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.qrDataUrl) els.lobbyQrImg.src = data.qrDataUrl;
    if (data.joinUrl) els.joinUrlLabel.textContent = data.joinUrl.replace(/^https?:\/\//, '');
  } catch (_) {}
}

function renderAudiencePills(activeAudience) {
  els.audiencePills.innerHTML = AUDIENCE_MODES.map(m => `
    <button type="button" class="aud-btn ${m.id === activeAudience ? 'active' : ''}" data-aud="${m.id}">
      ${escapeHtml(m.short)}
    </button>
  `).join('');

  els.audiencePills.querySelectorAll('.aud-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      partyAudio.unlock();
      partyAudio.playSfx('pop');
      socket.emit('host:set_audience', { audience: btn.dataset.aud });
    });
  });
}

function renderPackGrid(selectedGameId) {
  els.packGrid.innerHTML = GAME_CATALOG.map(g => `
    <button type="button" class="pack-tile ${g.id === selectedGameId ? 'selected' : ''}" data-game="${g.id}" role="option" aria-selected="${g.id === selectedGameId}">
      <div class="pack-tile-art">
        <img src="${g.poster}" alt="${escapeHtml(g.title)}" />
      </div>
      <div class="pack-tile-label">${escapeHtml(g.title)}</div>
    </button>
  `).join('');

  els.packGrid.querySelectorAll('.pack-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      partyAudio.unlock();
      partyAudio.playSfx('pop');
      const id = tile.dataset.game;
      const meta = getGameMeta(id);
      partyAudio.speak(`${meta.title}. ${meta.tagline}`, `select_${id}_${Date.now()}`);
      socket.emit('host:set_game', { gameId: id });
    });
  });
}

function renderCastSeats(room) {
  const players = room.players || [];
  els.playerCounterBadge.textContent = `${players.length} / ${room.maxPlayers || 10} EN ESCENARIO`;

  const cards = players.map(p => {
    const c = resolveCast(p.avatar);
    return `
      <div class="cast-seat-card" style="--seat-color:${c.color}">
        ${renderCastImg(c, 'cast-seat-img')}
        <div class="cast-seat-name">${escapeHtml(p.name)}</div>
      </div>
    `;
  });

  // Add subtle empty studio pedestals up to 4 seats so the lounge feels welcoming
  const emptyCount = Math.max(0, 4 - players.length);
  for (let i = 0; i < emptyCount; i++) {
    cards.push(`<div class="cast-seat-card empty-seat">ASIENTO LIBRE</div>`);
  }

  els.lobbyPlayersGrid.innerHTML = cards.join('');
}

export function renderSharedHowToPlay(tutorial, gameMeta) {
  const rules = (tutorial?.goldenRules || []).map(r => `
    <article class="jb-card howto-rule-card">
      <div class="howto-rule-num">${r.number}</div>
      <div>
        <h3>${escapeHtml(r.title)}</h3>
        <p>${escapeHtml(r.description)}</p>
      </div>
    </article>
  `).join('');

  return `
    <div class="howto-stage">
      <article class="jb-card howto-poster-card">
        <img src="${gameMeta.poster}" alt="${escapeHtml(gameMeta.title)}" />
        <div class="howto-poster-body">
          <span class="jb-pill">CÓMO JUGAR</span>
          <h2>${escapeHtml(tutorial?.title || gameMeta.title)}</h2>
          <p>${escapeHtml(tutorial?.objective || gameMeta.tagline)}</p>
        </div>
      </article>
      <div class="howto-rules-col">${rules}</div>
    </div>
  `;
}

export function renderSharedPodiumOrResults(game) {
  const list = game.leaderboard || game.podium || game.players || [];
  const topScore = list[0]?.score || 0;
  const isTie = list.length > 1 && list[0].score === list[1].score && topScore > 0;

  if (game.phase === 'PODIUM') {
    const top3 = list.slice(0, 3);
    const medals = ['1° LUGAR', '2° LUGAR', '3° LUGAR'];
    return `
      <div class="podium-stage">
        <div class="podium-banner">${isTie ? '🤝 ¡EMPATE HISTÓRICO EN LA CIMA!' : '👑 ¡PODIO FINAL DEL SHOW!'}</div>
        <div class="podium-row">
          ${top3.map((p, idx) => {
            const c = resolveCast(p.avatar);
            const rankLabel = (isTie && p.score === topScore) ? 'CO-CAMPEÓN' : (medals[idx] || `#${idx + 1}`);
            return `
              <div class="podium-step ${idx === 0 ? 'first' : ''}" style="--seat-color:${c.color}">
                ${renderCastImg(c, 'podium-cast-img')}
                <div class="podium-pedestal">
                  <div class="podium-rank-tag">${rankLabel}</div>
                  <div class="podium-name">${escapeHtml(p.name)}</div>
                  <div class="podium-score">${(p.score || 0).toLocaleString()} PTS</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  return `
    <div style="display:flex;flex-direction:column;align-items:center;gap:14px;width:100%;">
      <div class="game-banner-pill">TABLA DE POSICIONES — RONDA ${game.currentRound || 1}/${game.totalRounds || 3}</div>
      <div class="scoreboard-grid">
        ${list.map((p, idx) => {
          const c = resolveCast(p.avatar);
          const delta = p.roundDelta ?? p.lastRoundGain ?? 0;
          return `
            <div class="jb-card score-row-card" style="border-left:10px solid ${c.color};">
              <strong style="font-family:var(--font-display);font-size:1.3rem;">#${idx + 1}</strong>
              ${renderCastImg(c, 'score-row-avatar')}
              <div class="score-row-meta">
                <div class="score-row-name">${escapeHtml(p.name)}</div>
                ${delta > 0 ? `<div class="score-row-delta">+${delta} pts</div>` : ''}
              </div>
              <div class="score-row-total">${(p.score || 0).toLocaleString()}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function applyThemeClass(gameId) {
  const meta = getGameMeta(gameId);
  for (const g of GAME_CATALOG) document.body.classList.remove(g.stageClass);
  document.body.classList.add(meta.stageClass);
}

function speakHostLines(room) {
  const g = room.game;
  if (!g) return;
  const sig = `${g.gameId}:${g.phase}:${g.currentRound}:${g.currentDuel?.duelIndex || 0}`;
  if (sig === state.lastVoiceKey) return;
  state.lastVoiceKey = sig;

  const tut = g.tutorial || g.howToPlay;
  if (g.phase === 'HOW_TO_PLAY' && tut?.hostNarration) {
    partyAudio.speak(tut.hostNarration, sig);
  } else if (g.phase === 'INTRO' && g.question) {
    partyAudio.speak(g.question, sig);
  } else if (g.phase === 'INTRO' && g.topic) {
    partyAudio.speak(`Calibren sus antenas: ${g.topic}`, sig);
  } else if (g.phase === 'VOTING' && g.currentDuel?.promptText) {
    partyAudio.speak(g.currentDuel.promptText, sig);
  } else if (g.phase === 'AI_JUDGING' && g.currentDuel?.aiJudgement?.commentary) {
    partyAudio.speak(g.currentDuel.aiJudgement.commentary, sig);
  } else if (g.aiCommentary) {
    partyAudio.speak(g.aiCommentary, sig);
  } else if (g.phase === 'PODIUM') {
    partyAudio.playSfx('fanfare');
    const champ = (g.leaderboard || g.podium || [])[0];
    if (champ) partyAudio.speak(`¡Se cierra el telón! ¡Felicidades a ${champ.name} en la cima del podio!`, sig);
  }
}

function renderRoom(room) {
  state.room = room;
  const activeGameId = room.game?.gameId || room.selectedGameId || 'duelo-ocurrencias';
  const meta = getGameMeta(activeGameId);
  applyThemeClass(activeGameId);

  const inLobby = room.status === 'LOBBY' || !room.game;
  els.lobbyView.classList.toggle('hidden', !inLobby);
  els.gameView.classList.toggle('hidden', inLobby);
  els.skipPhaseBtn.classList.toggle('hidden', inLobby);
  els.backLobbyBtn.classList.toggle('hidden', inLobby);
  els.compactRoomChip.classList.toggle('hidden', inLobby);
  els.topbarRound.classList.toggle('hidden', inLobby);
  els.compactRoomCode.textContent = room.roomCode;

  if ((room.players || []).length > state.lastPlayerCount && inLobby) {
    partyAudio.playSfx('join');
  }
  state.lastPlayerCount = (room.players || []).length;

  if (inLobby) {
    els.topbarTitle.textContent = 'ANFITRIÓN DE FIESTAS 2.0';
    els.featuredPosterImg.src = meta.poster;
    els.featuredGameTag.textContent = meta.shortTag;
    els.featuredGameTitle.textContent = meta.title;
    els.featuredGameDesc.textContent = meta.tagline;
    els.lobbyRoomCode.textContent = room.roomCode;
    renderAudiencePills(room.audience || 'familia');
    renderPackGrid(activeGameId);
    renderCastSeats(room);
    els.stageTimerBar.classList.add('hidden');
    return;
  }

  // Active Game
  const g = room.game;
  els.topbarTitle.textContent = meta.title.toUpperCase();
  if (g.currentRound && g.totalRounds) {
    els.topbarRound.textContent = `RONDA ${g.currentRound}/${g.totalRounds}${g.isDoublePoints ? ' • X2' : ''}`;
  }

  const timer = Number(g.timer || 0);
  els.stageTimerBar.classList.toggle('hidden', timer <= 0);
  els.stageTimerBar.classList.toggle('urgent', timer > 0 && timer <= 5);
  els.stageTimerNum.textContent = String(timer).padStart(2, '0');

  if (g.phase === 'HOW_TO_PLAY') {
    els.gameStageSlot.innerHTML = renderSharedHowToPlay(g.tutorial || g.howToPlay, meta);
  } else {
    const renderer = TV_RENDERERS[g.gameId];
    if (renderer) {
      els.gameStageSlot.innerHTML = renderer(g, { renderSharedPodiumOrResults, room });
    }
  }

  speakHostLines(room);
}

// Spawn floating reactions from phones
function spawnFloatingReaction({ emoji, playerName }) {
  const node = document.createElement('div');
  node.className = 'floating-reaction';
  node.style.left = `${14 + Math.random() * 64}%`;
  node.innerHTML = `
    <span class="floating-reaction-emoji">${escapeHtml(emoji || '🔥')}</span>
    ${playerName ? `<span class="floating-reaction-sender">${escapeHtml(playerName)}</span>` : ''}
  `;
  els.reactionLayer.appendChild(node);
  setTimeout(() => node.remove(), 2700);
}

// Button Bindings
els.toggleAudioBtn.addEventListener('click', () => {
  partyAudio.unlock();
  partyAudio.ttsEnabled = !partyAudio.ttsEnabled;
  partyAudio.enabled = partyAudio.ttsEnabled;
  els.toggleAudioBtn.textContent = partyAudio.ttsEnabled ? '🔊 VOZ ON' : '🔇 SILENCIO';
  if (!partyAudio.ttsEnabled) partyAudio.stopSpeech();
});

els.voiceSelect.addEventListener('change', () => {
  partyAudio.selectedVoiceId = els.voiceSelect.value;
  partyAudio.speak('¡Probando micro en vivo! ¿Listos para el show?', `test_${Date.now()}`);
});

els.personalitySelect.addEventListener('change', () => {
  socket.emit('host:set_personality', { personality: els.personalitySelect.value });
});

els.startShowBtn.addEventListener('click', () => {
  partyAudio.unlock();
  partyAudio.playSfx('fanfare');
  socket.emit('host:start_game');
});

els.skipPhaseBtn.addEventListener('click', () => {
  partyAudio.unlock();
  partyAudio.playSfx('pop');
  socket.emit('host:skip_timer');
});

els.backLobbyBtn.addEventListener('click', () => {
  partyAudio.stopSpeech();
  socket.emit('host:restart_game');
});

// Socket Listeners
socket.on('connect', () => {
  socket.emit('host:create_room', {
    frontendOrigin: window.location.origin,
    backendUrl: BACKEND_URL
  }, (res) => {
    if (res?.qrCodeDataUrl) els.lobbyQrImg.src = res.qrCodeDataUrl;
    if (res?.joinUrl) els.joinUrlLabel.textContent = res.joinUrl.replace(/^https?:\/\//, '');
    if (res?.state) renderRoom(res.state);
    else if (res?.roomCode) fetchQr(res.roomCode);
  });
});

socket.on('host:state_update', (publicState) => {
  renderRoom(publicState);
});

socket.on('host:timer_tick', ({ timer }) => {
  const n = Number(timer || 0);
  els.stageTimerBar.classList.toggle('hidden', n <= 0);
  els.stageTimerBar.classList.toggle('urgent', n > 0 && n <= 5);
  els.stageTimerNum.textContent = String(n).padStart(2, '0');
  if (n > 0 && n <= 5) partyAudio.playSfx('tick');
});

socket.on('host:player_reaction', (payload) => {
  spawnFloatingReaction(payload);
});

initVoices();
