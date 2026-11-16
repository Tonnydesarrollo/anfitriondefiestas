/**
 * host.js
 * Controller for the Party Game Host Screen (TV / PC / Projector)
 * Handles Socket.IO communication, Web Speech API (Spanish AI Host),
 * Web Audio sound effects, circular countdowns, and dynamic stage views.
 */

(function () {
  'use strict';

  // Socket connection (supports local origin or external docker backend URL)
  const targetBackend = window.PARTY_BACKEND_URL || window.location.origin;
  const socket = io(targetBackend, {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 10
  });

  // App State
  let currentRoomCode = null;
  let currentState = null;
  let activeAudioCtx = null;
  let isSpeechEnabled = true;
  let lastSpokenText = '';

  // DOM Elements
  const stageLobby = document.getElementById('stageLobby');
  const stageIntro = document.getElementById('stageIntro');
  const stageAnswering = document.getElementById('stageAnswering');
  const stageDuel = document.getElementById('stageDuel');
  const stageImpostor = document.getElementById('stageImpostor');
  const stageDilemas = document.getElementById('stageDilemas');
  const stageBomba = document.getElementById('stageBomba');
  const stageFalsoSabio = document.getElementById('stageFalsoSabio');
  const stageTrivia = document.getElementById('stageTrivia');
  const stageTelepatia = document.getElementById('stageTelepatia');
  const stageScores = document.getElementById('stageScores');
  const stagePodium = document.getElementById('stagePodium');

  const topRoomCodeTag = document.getElementById('topRoomCodeTag');
  const topRoomCode = document.getElementById('topRoomCode');
  const aiVoiceToggle = document.getElementById('aiVoiceToggle');
  const btnSkipTimer = document.getElementById('btnSkipTimer');
  const btnFullscreen = document.getElementById('btnFullscreen');

  // Lobby Elements
  const lobbyQrImage = document.getElementById('lobbyQrImage');
  const lobbyRoomCode = document.getElementById('lobbyRoomCode');
  const lobbyUrlHint = document.getElementById('lobbyUrlHint');
  const lobbyPlayerCount = document.getElementById('lobbyPlayerCount');
  const lobbyPlayersGrid = document.getElementById('lobbyPlayersGrid');
  const btnStartGame = document.getElementById('btnStartGame');
  const btnSimulatePlayers = document.getElementById('btnSimulatePlayers');

  // Answering Elements
  const answeringRoundBadge = document.getElementById('answeringRoundBadge');
  const answeringTimerBar = document.getElementById('answeringTimerBar');
  const answeringTimerText = document.getElementById('answeringTimerText');
  const answeringProgressCount = document.getElementById('answeringProgressCount');
  const answeringPlayersStatus = document.getElementById('answeringPlayersStatus');

  // Duel Elements
  const duelCounterBadge = document.getElementById('duelCounterBadge');
  const duelTimerBar = document.getElementById('duelTimerBar');
  const duelTimerText = document.getElementById('duelTimerText');
  const duelPromptText = document.getElementById('duelPromptText');
  const combatCardA = document.getElementById('combatCardA');
  const combatCardB = document.getElementById('combatCardB');
  const combatAuthorA = document.getElementById('combatAuthorA');
  const combatAuthorB = document.getElementById('combatAuthorB');
  const combatAnswerA = document.getElementById('combatAnswerA');
  const combatAnswerB = document.getElementById('combatAnswerB');
  const voteSectionA = document.getElementById('voteSectionA');
  const voteSectionB = document.getElementById('voteSectionB');
  const voteFillA = document.getElementById('voteFillA');
  const voteFillB = document.getElementById('voteFillB');
  const votePercentA = document.getElementById('votePercentA');
  const votePercentB = document.getElementById('votePercentB');
  const voteCountA = document.getElementById('voteCountA');
  const voteCountB = document.getElementById('voteCountB');

  // AI Speech Bubble
  const aiHostSpeechStage = document.getElementById('aiHostSpeechStage');
  const aiTalkingWave = document.getElementById('aiTalkingWave');
  const aiCommentaryText = document.getElementById('aiCommentaryText');
  const aiVerdictBadge = document.getElementById('aiVerdictBadge');

  // Scores Elements
  const scoresRoundBadge = document.getElementById('scoresRoundBadge');
  const scoresLeaderboardList = document.getElementById('scoresLeaderboardList');

  // Podium Elements
  const podiumStep1 = document.getElementById('podiumStep1');
  const podiumStep2 = document.getElementById('podiumStep2');
  const podiumStep3 = document.getElementById('podiumStep3');
  const podiumAvatar1 = document.getElementById('podiumAvatar1');
  const podiumAvatar2 = document.getElementById('podiumAvatar2');
  const podiumAvatar3 = document.getElementById('podiumAvatar3');
  const podiumName1 = document.getElementById('podiumName1');
  const podiumName2 = document.getElementById('podiumName2');
  const podiumName3 = document.getElementById('podiumName3');
  const podiumScore1 = document.getElementById('podiumScore1');
  const podiumScore2 = document.getElementById('podiumScore2');
  const podiumScore3 = document.getElementById('podiumScore3');
  const btnRestartGame = document.getElementById('btnRestartGame');
  const btnQuickBots = document.getElementById('btnQuickBots');

  // Overlays
  const reactionsOverlay = document.getElementById('reactionsOverlay');
  const confettiCanvas = document.getElementById('confettiCanvas');

  // Circle circumference for 42px radius: 2 * PI * 42 ≈ 263.89
  const CIRCLE_CIRCUMFERENCE = 263.89;

  // =========================================================================
  // WEB AUDIO SOUND EFFECTS SYNTHESIZER
  // =========================================================================
  function getAudioContext() {
    if (!activeAudioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        activeAudioCtx = new AudioCtx();
      }
    }
    if (activeAudioCtx && activeAudioCtx.state === 'suspended') {
      activeAudioCtx.resume();
    }
    return activeAudioCtx;
  }

  const SoundFX = {
    playDing() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    },

    playPop() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    },

    playTick() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    },

    playFanfare() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + (idx * 0.12);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.45);
      });
    },

    playWhoosh() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    },

    playDrumroll() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const totalPulses = 12;
      for (let i = 0; i < totalPulses; i++) {
        const t = ctx.currentTime + (i * 0.08);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120 + (i * 10), t);
        gain.gain.setValueAtTime(0.08 + (i * 0.015), t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.06);
      }
    },

    playGavel() {
      const ctx = getAudioContext();
      if (!ctx) return;
      [0, 0.14].forEach(offset => {
        const t = ctx.currentTime + offset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.09);
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.12);
      });
    },

    playAlarm() {
      const ctx = getAudioContext();
      if (!ctx) return;
      [0, 0.2, 0.4].forEach((offset, idx) => {
        const t = ctx.currentTime + offset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(idx % 2 === 0 ? 550 : 880, t);
        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.18);
      });
    },

    playCashRegister() {
      const ctx = getAudioContext();
      if (!ctx) return;
      [1174.66, 1760].forEach((freq, idx) => {
        const t = ctx.currentTime + (idx * 0.07);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
      });
    },

    playBuzzer() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  };

  function triggerScreenShake(duration = 400) {
    document.body.classList.add('screen-shake');
    setTimeout(() => document.body.classList.remove('screen-shake'), duration);
  }

  function triggerRedAlert(element, duration = 2500) {
    if (!element) return;
    element.classList.add('red-alert-strobe');
    setTimeout(() => element.classList.remove('red-alert-strobe'), duration);
  }

  // =========================================================================
  // WEB SPEECH API (NATURAL SPANISH AI HOST SYNTHESIS)
  // =========================================================================
  const aiVoiceSelect = document.getElementById('aiVoiceSelect');
  const btnTestVoice = document.getElementById('btnTestVoice');
  let selectedVoiceURI = null;

  function getAvatarEmoji(avatar, fallback = '👤') {
    if (!avatar) return fallback;
    if (typeof avatar === 'string') {
      if (avatar === '[object Object]' || avatar.trim() === '') return fallback;
      return avatar;
    }
    if (typeof avatar === 'object') {
      const val = avatar.emoji || avatar.icon || fallback;
      return (typeof val === 'string' && val !== '[object Object]') ? val : fallback;
    }
    return fallback;
  }

  function scoreVoice(v) {
    let s = 0;
    const name = (v.name + ' ' + v.voiceURI).toLowerCase();
    const lang = (v.lang || '').toLowerCase();

    // Prefer high-definition neural / natural / Google voices
    if (name.includes('natural')) s += 120;
    if (name.includes('neural')) s += 110;
    if (name.includes('online')) s += 90;
    if (name.includes('google')) s += 85;

    // Prefer Latin American / Mexican Spanish for party game vibe
    if (lang.includes('mx') || lang.includes('419')) s += 30;
    if (lang.includes('us')) s += 20;
    if (lang.includes('es')) s += 10;

    // Penalize old legacy mechanical Windows SAPI voices
    if (name.includes('desktop') || name.includes('sapi') || name.includes('sabina') || name.includes('helena')) s -= 80;

    return s;
  }

  function getAvailableSpanishVoices() {
    if (!window.speechSynthesis) return [];
    const all = window.speechSynthesis.getVoices() || [];
    const es = all.filter(v => v.lang.startsWith('es') || v.lang.includes('Spanish') || v.name.toLowerCase().includes('spanish'));
    return es.sort((a, b) => scoreVoice(b) - scoreVoice(a));
  }

  function populateVoiceSelector() {
    if (!aiVoiceSelect || !window.speechSynthesis) return;
    const esVoices = getAvailableSpanishVoices();

    if (esVoices.length === 0) {
      aiVoiceSelect.innerHTML = '<option value="">Voz predeterminada del sistema</option>';
      return;
    }

    aiVoiceSelect.innerHTML = '';
    esVoices.forEach((v, idx) => {
      const opt = document.createElement('option');
      opt.value = v.voiceURI;
      const isNatural = (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('neural'));
      opt.textContent = `${isNatural ? '✨ ' : ''}${v.name} (${v.lang})`;
      aiVoiceSelect.appendChild(opt);
    });

    if (!selectedVoiceURI && esVoices.length > 0) {
      selectedVoiceURI = esVoices[0].voiceURI;
      aiVoiceSelect.value = selectedVoiceURI;
    }
  }

  if (aiVoiceSelect) {
    aiVoiceSelect.addEventListener('change', (e) => {
      selectedVoiceURI = e.target.value;
    });
  }

  if (btnTestVoice) {
    btnTestVoice.addEventListener('click', () => {
      speakSpanish('¡Hola a todos! Soy el anfitrión de la fiesta. Prepárense para reír y ser juzgados con mi toque de humor.');
    });
  }

  // Pre-load voices on browser load
  if (window.speechSynthesis) {
    populateVoiceSelector();
    window.speechSynthesis.onvoiceschanged = () => {
      populateVoiceSelector();
    };
  }

  function speakSpanish(text) {
    if (!isSpeechEnabled || !window.speechSynthesis) return;
    if (!text || text === lastSpokenText) return;

    lastSpokenText = text;
    window.speechSynthesis.cancel(); // Stop any previous speech

    // Clean text for speech: remove emojis and weird characters so it reads naturally
    const cleanSpeech = text
      .replace(/[\u{1F600}-\u{1F6FF}|[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[""«»]/g, '')
      .trim();

    if (!cleanSpeech) return;

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.lang = 'es-MX';
    utterance.rate = 1.08;  // Fast, punchy TV showman cadence
    utterance.pitch = 1.06; // Animated, high-energy party host pitch

    const esVoices = getAvailableSpanishVoices();
    let chosenVoice = esVoices.find(v => v.voiceURI === selectedVoiceURI);
    if (!chosenVoice && esVoices.length > 0) {
      chosenVoice = esVoices[0];
    }
    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    // Toggle talking badge
    if (aiTalkingWave) aiTalkingWave.style.display = 'inline-block';

    utterance.onend = () => {
      if (aiTalkingWave) aiTalkingWave.style.display = 'none';
    };

    utterance.onerror = () => {
      if (aiTalkingWave) aiTalkingWave.style.display = 'none';
    };

    window.speechSynthesis.speak(utterance);
  }

  // =========================================================================
  // STAGE MANAGEMENT
  // =========================================================================
  const allStages = [stageLobby, stageIntro, stageAnswering, stageDuel, stageImpostor, stageDilemas, stageBomba, stageFalsoSabio, stageTrivia, stageTelepatia, stageScores, stagePodium];

  function showOnlyStage(activeStage) {
    allStages.forEach(s => {
      if (s) {
        if (s === activeStage) {
          s.style.display = (s === stageLobby ? 'grid' : (s === stageDuel ? 'flex' : 'block'));
        } else {
          s.style.display = 'none';
        }
      }
    });
  }

  function updateTimerCircle(timerBar, timerText, currentSeconds, totalSeconds) {
    if (!timerBar || !timerText) return;
    timerText.textContent = Math.max(0, currentSeconds);
    const fraction = totalSeconds > 0 ? (currentSeconds / totalSeconds) : 0;
    const offset = CIRCLE_CIRCUMFERENCE * (1 - fraction);
    timerBar.style.strokeDasharray = CIRCLE_CIRCUMFERENCE;
    timerBar.style.strokeDashoffset = offset;

    if (currentSeconds <= 5 && currentSeconds > 0) {
      timerBar.classList.add('urgent');
      SoundFX.playTick();
    } else {
      timerBar.classList.remove('urgent');
    }
  }

  // =========================================================================
  // SOCKET.IO EVENT HANDLERS
  // =========================================================================

  // Connect & Create Room
  socket.on('connect', () => {
    console.log('[Host] Connected to server. Requesting room creation...');
    socket.emit('host:create_room', {
      hostHeader: window.location.host,
      frontendOrigin: window.location.origin,
      backendUrl: targetBackend
    }, (response) => {
      if (response && response.success) {
        initRoom(response);
      }
    });
  });

  socket.on('host:room_created', (data) => {
    initRoom(data);
  });

  function initRoom(data) {
    currentRoomCode = data.roomCode;
    console.log(`[Host] Room initialized: ${currentRoomCode}`);

    // Notify multi-screen Arena Simulator (/demo) if running inside an iframe
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'HOST_ROOM_CREATED', roomCode: currentRoomCode }, '*');
    }

    // Update Room Code Displays
    if (lobbyRoomCode) lobbyRoomCode.textContent = currentRoomCode;
    if (topRoomCode) topRoomCode.textContent = currentRoomCode;

    // Update Join URL Hint
    const joinUrl = data.joinUrl || `${window.location.origin}/play.html?room=${currentRoomCode}`;
    if (lobbyUrlHint) lobbyUrlHint.textContent = joinUrl;

    // Update QR Code
    if (lobbyQrImage) {
      if (data.qrCodeDataUrl) {
        lobbyQrImage.src = data.qrCodeDataUrl;
      } else {
        // Fallback to dynamic endpoint or QR server
        lobbyQrImage.src = `/api/room/${currentRoomCode}/qr`;
      }
    }

    if (data.state) {
      handleStateUpdate(data.state);
    } else {
      showOnlyStage(stageLobby);
    }
  }

  // Main Public State Synchronization
  socket.on('host:state_update', (publicState) => {
    handleStateUpdate(publicState);
  });

  // Lightweight 1-second timer ticks for smooth Host animations without re-rendering duels
  socket.on('host:timer_tick', (data) => {
    const timer = data?.timer;
    if (timer === undefined || !currentState?.game) return;
    currentState.game.timer = timer;

    if (currentState.game.gameId === 'impostor-silicio') {
      const totalSec = currentState.game.phase === 'CLUES' ? 35 : (currentState.game.phase === 'DEBATE' ? 60 : 20);
      updateTimerCircle(document.getElementById('impostorTimerBar'), document.getElementById('impostorTimerText'), timer, totalSec);
    } else if (currentState.game.gameId === 'dilemas-extremos') {
      const totalSec = currentState.game.phase === 'CHOICE' ? 25 : 10;
      updateTimerCircle(document.getElementById('dilemasTimerBar'), document.getElementById('dilemasTimerText'), timer, totalSec);
    } else if (currentState.game.gameId === 'trivia-caotica') {
      const trTimerEl = document.getElementById('triviaTimer');
      if (trTimerEl) trTimerEl.textContent = `${Math.max(0, timer)}s`;
    } else if (currentState.game.gameId === 'telepatia-fiesta') {
      const telTimerEl = document.getElementById('telepatiaTimer');
      if (telTimerEl) telTimerEl.textContent = `${Math.max(0, timer)}s`;
    } else {
      if (currentState.game.phase === 'INTRO') {
        updateTimerCircle(document.getElementById('introTimerBar'), document.getElementById('introTimerText'), timer, 7);
      } else if (currentState.game.phase === 'ANSWERING') {
        updateTimerCircle(answeringTimerBar, answeringTimerText, timer, 45);
      } else if (currentState.game.phase === 'VOTING') {
        updateTimerCircle(duelTimerBar, duelTimerText, timer, 15);
      }
    }
  });

  function handleStateUpdate(state) {
    currentState = state;
    if (!state) return;

    // Show/hide top room code tag
    if (topRoomCodeTag) {
      topRoomCodeTag.style.display = (state.status === 'IN_GAME') ? 'flex' : 'none';
    }

    // Show/hide skip timer button
    if (btnSkipTimer) {
      btnSkipTimer.style.display = (state.status === 'IN_GAME' && state.game?.phase !== 'PODIUM') ? 'inline-flex' : 'none';
    }

    if (state.status === 'LOBBY') {
      renderLobby(state);
    } else if (state.status === 'IN_GAME' && state.game) {
      if (state.game.phase === 'PODIUM') {
        renderPodium(state.game);
      } else {
        renderGame(state.game);
      }
    } else if ((state.status === 'FINISHED' || state.status === 'PODIUM' || state.game?.phase === 'PODIUM') && state.game) {
      renderPodium(state.game);
    }
  }

  // =========================================================================
  // RENDER: LOBBY
  // =========================================================================
  function renderLobby(state) {
    showOnlyStage(stageLobby);
    stopConfetti();

    const players = state.players || [];
    const count = players.length;

    if (lobbyPlayerCount) {
      lobbyPlayerCount.textContent = `${count} / ${state.maxPlayers || 8} Jugadores`;
    }

    // Render Player Cards
    if (lobbyPlayersGrid) {
      lobbyPlayersGrid.innerHTML = '';
      if (players.length === 0) {
        lobbyPlayersGrid.innerHTML = `
          <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); padding: 26px 12px; gap: 8px;">
            <span style="font-size: 2.2rem;">📱</span>
            <span style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: #fff;">Esperando jugadores...</span>
            <span style="font-size: 0.9rem; color: var(--text-dim);">Escanea el código QR desde tu celular o usa "+ 3 Bots"</span>
          </div>
        `;
      } else {
        players.forEach(p => {
          const token = document.createElement('div');
          token.className = 'player-token';
          token.setAttribute('data-player-name', p.name);
          token.innerHTML = `
            <div class="player-token-avatar" style="background: ${p.avatar?.color || '#3b82f6'};">
              ${p.avatar?.emoji || '👤'}
            </div>
            <div class="player-token-name" title="${escapeHtml(p.name)}">
              ${escapeHtml(p.name)}
            </div>
            <div class="player-token-status">
              ¡LISTO! 🎮
            </div>
          `;
          lobbyPlayersGrid.appendChild(token);
        });
      }
    }

    // Start Button State - Always accessible with smart bot auto-fill
    if (btnStartGame) {
      btnStartGame.removeAttribute('disabled');
      btnStartGame.classList.remove('disabled');
      btnStartGame.classList.add('btn-yellow');
      if (players.length < 2) {
        btnStartGame.innerHTML = '🚀 Comenzar Partida <span style="font-size:0.8rem;opacity:0.85;display:block;font-family:var(--font-ui);">+ bots automáticos</span>';
      } else {
        btnStartGame.innerHTML = '🚀 ¡Comenzar Partida!';
      }
    }

    // Sync selected audience buttons
    if (state.audience) {
      document.querySelectorAll('.audience-btn').forEach(btn => {
        if (btn.getAttribute('data-audience') === state.audience) {
          btn.classList.add('active');
          btn.classList.remove('btn-outline');
        } else {
          btn.classList.remove('active');
          btn.classList.add('btn-outline');
        }
      });
    }

    // Sync selected game card
    if (state.selectedGameId) {
      document.querySelectorAll('.game-card').forEach(card => {
        if (card.getAttribute('data-game') === state.selectedGameId) {
          card.classList.add('active');
          card.style.background = 'rgba(0,240,255,0.12)';
          card.style.borderColor = 'var(--neon-cyan)';
        } else {
          card.classList.remove('active');
          card.style.background = 'rgba(255,255,255,0.04)';
          card.style.borderColor = 'rgba(255,255,255,0.15)';
        }
      });
    }

    // Dynamic Pacing Banner
    const pacingTitle = document.getElementById('dynamicPacingTitle');
    const pacingDesc = document.getElementById('dynamicPacingDesc');
    if (pacingTitle && pacingDesc) {
      if (state.dynamicPacing) {
        pacingTitle.textContent = state.dynamicPacing.title || `⚡ ${state.totalRounds || 3} RONDAS DINÁMICAS`;
        pacingDesc.textContent = state.dynamicPacing.reason || 'Adaptado automáticamente para el tamaño de tu grupo.';
      } else {
        pacingTitle.textContent = `⚡ ${state.totalRounds || 3} RONDAS DINÁMICAS`;
        pacingDesc.textContent = 'Duración optimizada para mantener el ritmo alto en la fiesta.';
      }
    }
  }

  // =========================================================================
  // RENDER: IN-GAME PHASES
  // =========================================================================
  function renderGame(game) {
    const hostMainLogoText = document.getElementById('hostMainLogoText');
    if (hostMainLogoText && game.gameTitle) {
      hostMainLogoText.textContent = game.gameTitle.toUpperCase();
    }

    if (game.gameId === 'impostor-silicio') {
      renderImpostorGame(game);
      return;
    }
    if (game.gameId === 'dilemas-extremos') {
      renderDilemasGame(game);
      return;
    }
    if (game.gameId === 'bomba-palabras') {
      renderBombaGame(game);
      return;
    }
    if (game.gameId === 'falso-sabio') {
      renderFalsoSabioGame(game);
      return;
    }
    if (game.gameId === 'trivia-caotica') {
      renderTriviaGame(game);
      return;
    }
    if (game.gameId === 'telepatia-fiesta') {
      renderTelepatiaGame(game);
      return;
    }

    switch (game.phase) {
      case 'INTRO':
        renderIntroPhase(game);
        break;
      case 'ANSWERING':
        renderAnsweringPhase(game);
        break;
      case 'VOTING':
        renderVotingPhase(game);
        break;
      case 'AI_JUDGING':
        renderAiJudgingPhase(game);
        break;
      case 'ROUND_RESULTS':
        renderScoresPhase(game);
        break;
      case 'PODIUM':
        renderPodium(game);
        break;
      default:
        console.warn('[Host] Unknown game phase:', game.phase);
    }
  }

  // =========================================================================
  // EL IMPOSTOR DE SILICIO (HOST RENDER)
  // =========================================================================
  function renderImpostorGame(game) {
    const hostMainLogoText = document.getElementById('hostMainLogoText');
    if (hostMainLogoText && game.gameTitle) {
      hostMainLogoText.textContent = game.gameTitle.toUpperCase();
    }

    if (game.phase === 'PODIUM') {
      renderPodium(game);
      return;
    }
    if (game.phase === 'RESULTS') {
      renderScoresPhase(game);
      return;
    }
    if (game.phase === 'INTRO' && game.currentRound === 1 && game.howToPlay) {
      renderIntroPhase(game);
      return;
    }

    showOnlyStage(stageImpostor);
    const roundBadge = document.getElementById('impostorRoundBadge');
    if (roundBadge) roundBadge.textContent = `🕵️ EL IMPOSTOR | RONDA ${game.currentRound} DE ${game.totalRounds}`;

    const catText = document.getElementById('impostorCategoryText');
    if (catText) catText.textContent = game.category || 'Misterio';

    const instText = document.getElementById('impostorInstructionsText');
    const timerBar = document.getElementById('impostorTimerBar');
    const timerText = document.getElementById('impostorTimerText');

    let totalSeconds = 30;
    if (game.phase === 'CLUES_1' || game.phase === 'CLUES_2') totalSeconds = 35;
    else if (game.phase === 'CLUES_REVEAL_1') totalSeconds = 15;
    else if (game.phase === 'DEBATE') totalSeconds = 60;
    else if (game.phase === 'VOTING') totalSeconds = 25;
    else if (game.phase === 'RESOLUTION') totalSeconds = 10;
    else if (game.phase === 'ESCAPE') totalSeconds = 12;

    updateTimerCircle(timerBar, timerText, game.timer, totalSeconds);

    const cluesGrid = document.getElementById('impostorCluesGrid');
    const cluesContainer = document.getElementById('impostorCluesContainer');
    const resStage = document.getElementById('impostorResolutionStage');
    const aiBox = document.getElementById('impostorAiHostBox');
    const aiText = document.getElementById('impostorAiCommentaryText');

    if (cluesGrid) {
      cluesGrid.innerHTML = '';
      const clues = game.clues || [];
      if (clues.length === 0) {
        cluesGrid.innerHTML = '<div style="color: var(--text-muted); font-size: 1.1rem; grid-column: 1/-1;">Esperando que los jugadores envíen sus pistas desde sus teléfonos...</div>';
      } else {
        clues.forEach((item, idx) => {
          const card = document.createElement('div');
          card.className = 'spy-dossier-card';
          const avatarEmoji = getAvatarEmoji(item.avatar || item.avatarStr);

          let cluesHtml = '';
          if (item.clue2) {
            cluesHtml = `
              <div class="spy-clue-bubble" style="border-color: var(--neon-cyan);">
                <div style="font-size: 0.75rem; color: var(--neon-cyan); font-weight: 800; text-transform: uppercase;">1ª PISTA // TESTIMONIO:</div>
                <div style="font-size: 1.25rem; font-weight: 900; color: #fff; font-family: var(--font-display); margin-top: 2px;">"${escapeHtml(item.clue1 || '-')}"</div>
              </div>
              <div class="spy-clue-bubble" style="border-color: var(--neon-yellow); margin-top: 8px;">
                <div style="font-size: 0.75rem; color: var(--neon-yellow); font-weight: 800; text-transform: uppercase;">2ª PISTA // REAFIRMACIÓN:</div>
                <div style="font-size: 1.25rem; font-weight: 900; color: #fff; font-family: var(--font-display); margin-top: 2px;">"${escapeHtml(item.clue2)}"</div>
              </div>
            `;
          } else {
            cluesHtml = `
              <div class="spy-clue-bubble">
                <div style="font-size: 0.75rem; color: var(--neon-cyan); font-weight: 800; text-transform: uppercase;">PISTA DE COARTADA:</div>
                <div style="font-size: 1.35rem; font-weight: 900; color: #ffd600; font-family: var(--font-display); margin-top: 2px;">"${escapeHtml(item.clue1 || item.clue || 'Pensando...')}"</div>
              </div>
            `;
          }

          card.innerHTML = `
            <div class="spy-dossier-header">
              <span class="spy-dossier-stamp">DOSSIER #${idx + 1}</span>
              <span style="font-size: 0.75rem; color: var(--neon-cyan); font-weight: 800; font-family: monospace;">SOSPECHOSO</span>
            </div>
            <div class="spy-target-reticle">${avatarEmoji}</div>
            <div style="font-weight: 800; color: #fff; font-size: 1.2rem; font-family: var(--font-display);">${escapeHtml(item.playerName)}</div>
            ${cluesHtml}
          `;
          cluesGrid.appendChild(card);
        });
      }
    }

    const suspStage = document.getElementById('impostorSuspicionBoardStage');
    if (suspStage && game.phase !== 'ROUND_SUSPICION') {
      suspStage.style.display = 'none';
    }

    if (game.phase === 'INTRO') {
      if (cluesContainer) cluesContainer.style.display = 'block';
      if (resStage) resStage.style.display = 'none';
      if (aiBox) aiBox.style.display = 'none';
      if (instText) instText.textContent = 'Miren sus teléfonos en silencio. ¡Descubran si son inocentes o el impostor!';
      speakSpanish(`Comienza la ronda de El Impostor de Silicio. La categoría es: ${game.category}. ¡Miren sus teléfonos!`);
    } else if (game.phase === 'CLUES_1') {
      if (cluesContainer) cluesContainer.style.display = 'block';
      if (resStage) resStage.style.display = 'none';
      if (aiBox) aiBox.style.display = 'none';
      if (instText) instText.textContent = '✍️ Ronda 1 de Pistas: Escriban su 1ª pista en su teléfono con cuidado.';
    } else if (game.phase === 'CLUES_REVEAL_1') {
      if (cluesContainer) cluesContainer.style.display = 'block';
      if (resStage) resStage.style.display = 'none';
      if (aiBox) aiBox.style.display = 'none';
      if (instText) instText.textContent = '👀 ¡Primeras pistas proyectadas! Léanlas bien antes de la 2ª ronda.';
    } else if (game.phase === 'CLUES_2') {
      if (cluesContainer) cluesContainer.style.display = 'block';
      if (resStage) resStage.style.display = 'none';
      if (aiBox) aiBox.style.display = 'none';
      if (instText) instText.textContent = '✍️ Ronda 2 de Pistas: Escriban su 2ª pista para despistar o acorralar.';
    } else if (game.phase === 'DEBATE') {
      if (cluesContainer) cluesContainer.style.display = 'block';
      if (resStage) resStage.style.display = 'none';
      if (instText) instText.textContent = '🗣️ ¡Debate abierto! Comparen las 2 pistas de cada uno y descubran al infiltrado.';
      if (aiBox && game.aiCommentary) {
        aiBox.style.display = 'flex';
        if (aiText) aiText.textContent = game.aiCommentary;
        speakSpanish(game.aiCommentary);
      }
    } else if (game.phase === 'VOTING') {
      if (cluesContainer) cluesContainer.style.display = 'block';
      if (resStage) resStage.style.display = 'none';
      if (instText) instText.textContent = '🗳️ ¡VOTEN EN SUS TELÉFONOS! Seleccionen quién creen que es el impostor.';
      SoundFX.playGavel();
    } else if (game.phase === 'ROUND_SUSPICION') {
      if (cluesContainer) cluesContainer.style.display = 'none';
      if (resStage) resStage.style.display = 'none';
      if (suspStage) suspStage.style.display = 'block';
      if (instText) instText.textContent = `📊 Fin de la Ronda ${game.currentRound}. ¡Las sospechas quedan registradas! Nadie es expulsado.`;

      const listEl = document.getElementById('impostorSuspicionList');
      if (listEl && game.suspicionBoard) {
        listEl.innerHTML = '';
        game.suspicionBoard.forEach((p, idx) => {
          const item = document.createElement('div');
          item.className = 'spy-dossier-card';
          item.innerHTML = `
            <div class="spy-dossier-header">
              <span class="spy-dossier-stamp">#${idx + 1} SOSPECHOSO</span>
              <span style="font-size:0.8rem;color:var(--neon-yellow);font-weight:800;">+${p.roundVotes} votos hoy</span>
            </div>
            <div class="spy-target-reticle">${getAvatarEmoji(p.avatar)}</div>
            <div style="font-weight:900;color:#fff;font-size:1.2rem;font-family:var(--font-display);">${escapeHtml(p.name)}</div>
            <div style="margin-top:8px;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.2);padding:6px;border-radius:var(--radius-pill);font-weight:800;color:var(--neon-cyan);">
              🔥 Total: ${p.totalSuspicion} ${p.totalSuspicion === 1 ? 'Sospecha' : 'Sospechas'}
            </div>
          `;
          listEl.appendChild(item);
        });
      }
      SoundFX.playDing();
      speakSpanish(`Fin de la ronda ${game.currentRound}. Miren la pantalla: los votos de sospecha quedan anotados en el expediente. Nadie queda fuera, ¡el infiltrado sigue entre nosotros!`);
    } else if (game.phase === 'RESOLUTION') {
      if (cluesContainer) cluesContainer.style.display = 'none';
      if (resStage) resStage.style.display = 'block';
      if (instText) instText.textContent = '⚖️ ¡EL TRIBUNAL HA DICTADO SENTENCIA!';

      const res = game.resolution;
      if (res) {
        const resVotedName = document.getElementById('resolutionVotedName');
        const resBadge = document.getElementById('resolutionVerdictBadge');
        const resWord = document.getElementById('resolutionSecretWord');
        const resImpostor = document.getElementById('resolutionRealImpostor');
        const resEscape = document.getElementById('resolutionEscapeStatus');

        if (resVotedName) {
          resVotedName.textContent = `${getAvatarEmoji(res.votedOutAvatar)} ${res.votedOutName} (${res.votesCount || 0} VOTOS)`;
        }

        if (resBadge) {
          if (res.wasImpostorCaught) {
            resBadge.textContent = '¡ERA EL VERDADERO IMPOSTOR! 🚨';
            resBadge.style.background = 'rgba(0, 255, 157, 0.2)';
            resBadge.style.border = '2px solid var(--neon-green)';
            resBadge.style.color = 'var(--neon-green)';
            SoundFX.playAlarm();
          } else {
            resBadge.textContent = '¡ERA UN INOCENTE! 😱 EL IMPOSTOR SIGUE LIBRE';
            resBadge.style.background = 'rgba(255, 42, 133, 0.2)';
            resBadge.style.border = '2px solid var(--neon-magenta)';
            resBadge.style.color = 'var(--neon-magenta)';
            SoundFX.playBuzzer();
          }
        }

        if (resWord) {
          resWord.textContent = res.secretWord || game.secretWord || '???';
        }

        if (resImpostor) {
          resImpostor.textContent = `${getAvatarEmoji(res.realImpostorAvatar, '😈')} ${res.realImpostorName || 'El Infiltrado'}`;
        }

        if (resEscape) {
          if (res.wasImpostorCaught) {
            resEscape.textContent = '⚠️ ¡El impostor tendrá 12 segundos para intentar adivinar la palabra secreta y robar los puntos!';
            resEscape.style.color = 'var(--neon-yellow)';
          } else {
            resEscape.textContent = '🎉 ¡El impostor engañó a la sala y se lleva 1000 puntos!';
            resEscape.style.color = 'var(--neon-green)';
          }
        }
      }

      if (game.aiCommentary) {
        if (aiBox) aiBox.style.display = 'flex';
        if (aiText) aiText.textContent = game.aiCommentary;
        speakSpanish(game.aiCommentary);
      }
    } else if (game.phase === 'ESCAPE') {
      if (cluesContainer) cluesContainer.style.display = 'none';
      if (resStage) resStage.style.display = 'block';
      if (instText) instText.textContent = '⚡ ¡INTENTO DE ESCAPE EN VIVO! El impostor está adivinando en su móvil...';
      const resEscape = document.getElementById('resolutionEscapeStatus');
      if (resEscape) {
        resEscape.textContent = '⏳ ¡El impostor está eligiendo entre 4 opciones en su teléfono! ¿Logrará robarse la victoria?';
        resEscape.style.color = 'var(--neon-magenta)';
      }
      SoundFX.playAlarm();
      triggerRedAlert(stageImpostor);
    }
  }

  // =========================================================================
  // DILEMAS EXTREMOS (HOST RENDER)
  // =========================================================================
  function renderDilemasGame(game) {
    if (game.phase === 'PODIUM') {
      renderPodium(game);
      return;
    }
    if (game.phase === 'RESULTS') {
      renderScoresPhase(game);
      return;
    }
    if (game.phase === 'INTRO' && game.currentRound === 1 && game.howToPlay) {
      renderIntroPhase(game);
      return;
    }

    showOnlyStage(stageDilemas);
    const roundBadge = document.getElementById('dilemasRoundBadge');
    if (roundBadge) roundBadge.textContent = `🤔 DILEMAS EXTREMOS | RONDA ${game.currentRound} DE ${game.totalRounds}`;

    const timerBar = document.getElementById('dilemasTimerBar');
    const timerText = document.getElementById('dilemasTimerText');
    const totalSeconds = game.phase === 'CHOICE' ? 25 : 10;
    updateTimerCircle(timerBar, timerText, game.timer, totalSeconds);

    const questionText = document.getElementById('dilemaQuestionText');
    const optTextA = document.getElementById('dilemaOptionTextA');
    const optTextB = document.getElementById('dilemaOptionTextB');
    if (game.dilemma) {
      if (questionText) questionText.textContent = `"${game.dilemma.question}"`;
      if (optTextA) optTextA.textContent = game.dilemma.optionA;
      if (optTextB) optTextB.textContent = game.dilemma.optionB;
    }

    const meterA = document.getElementById('dilemaMeterA');
    const meterB = document.getElementById('dilemaMeterB');
    const fillA = document.getElementById('dilemaFillA');
    const fillB = document.getElementById('dilemaFillB');
    const percentA = document.getElementById('dilemaPercentA');
    const percentB = document.getElementById('dilemaPercentB');
    const votesA = document.getElementById('dilemaVotesA');
    const votesB = document.getElementById('dilemaVotesB');
    const aiBox = document.getElementById('dilemaAiHostBox');
    const aiText = document.getElementById('dilemaAiCommentaryText');

    if (game.phase === 'INTRO' || game.phase === 'CHOICE') {
      if (meterA) meterA.style.display = 'none';
      if (meterB) meterB.style.display = 'none';
      if (aiBox) aiBox.style.display = 'none';
      if (game.phase === 'INTRO') {
        speakSpanish(`Atención al nuevo dilema extremo: ${game.dilemma?.question}`);
      }
    } else if (game.phase === 'REVEAL') {
      if (meterA) meterA.style.display = 'block';
      if (meterB) meterB.style.display = 'block';
      if (fillA) fillA.style.width = `${game.percentA || 0}%`;
      if (fillB) fillB.style.width = `${game.percentB || 0}%`;
      if (percentA) percentA.textContent = `${game.percentA || 0}%`;
      if (percentB) percentB.textContent = `${game.percentB || 0}%`;
      if (votesA) votesA.textContent = `${game.votesA || 0} Votos`;
      if (votesB) votesB.textContent = `${game.votesB || 0} Votos`;

      // Game Feel: audio cues based on outcome
      if ((game.votesA === 1 && game.votesB >= 2) || (game.votesB === 1 && game.votesA >= 2)) {
        SoundFX.playCashRegister(); // Lone wolf!
      } else if (game.percentA === 50 && game.percentB === 50 && (game.votesA + game.votesB) > 0) {
        SoundFX.playDrumroll(); // Civil war 50/50!
      } else {
        SoundFX.playFanfare();
      }

      // Show list of who voted what
      const playersA = document.getElementById('dilemaPlayersA');
      const playersB = document.getElementById('dilemaPlayersB');
      if (playersA && playersB) {
        const listA = (game.players || []).filter(p => p.choice === 'A').map(p => `${getAvatarEmoji(p.avatar)} ${p.playerName}`).join(', ');
        const listB = (game.players || []).filter(p => p.choice === 'B').map(p => `${getAvatarEmoji(p.avatar)} ${p.playerName}`).join(', ');
        playersA.textContent = listA || '(Nadie)';
        playersB.textContent = listB || '(Nadie)';
      }

      if (aiBox && game.aiCommentary) {
        aiBox.style.display = 'flex';
        if (aiText) aiText.textContent = game.aiCommentary;
        speakSpanish(game.aiCommentary);
      }
    }
  }

  // =========================================================================
  // BOMBA DE PALABRAS (HOST RENDER)
  // =========================================================================
  function renderBombaGame(game) {
    if (game.phase === 'PODIUM') {
      renderPodium(game);
      return;
    }
    if (game.phase === 'RESULTS') {
      renderScoresPhase(game);
      return;
    }
    if (game.phase === 'INTRO' && game.currentRound === 1 && game.howToPlay) {
      renderIntroPhase(game);
      return;
    }

    showOnlyStage(stageBomba);

    const roundBadge = document.getElementById('bombaRoundBadge');
    const timerEl = document.getElementById('bombaTimer');
    const holderEl = document.getElementById('bombaActiveHolderName');
    const promptEl = document.getElementById('bombaPromptText');
    const wordsFeed = document.getElementById('bombaWordsFeed');
    const sphere = document.getElementById('bombaVisualSphere');

    if (roundBadge) {
      roundBadge.textContent = `💣 BOMBA DE PALABRAS | RONDA ${game.currentRound} DE ${game.totalRounds}`;
    }
    if (timerEl) {
      timerEl.textContent = `${Math.max(0, game.timer || 0)}s`;
      if ((game.timer || 0) <= 3) {
        timerEl.style.color = '#ff0000';
        if (sphere) sphere.style.animation = 'shake 0.2s infinite';
      } else {
        timerEl.style.color = '#ff0055';
        if (sphere) sphere.style.animation = 'none';
      }
    }
    if (holderEl) {
      const avatarStr = getAvatarEmoji(game.activePlayerAvatar);
      holderEl.textContent = `${avatarStr} ${game.activePlayerName || 'Nadie'}`;
    }
    if (promptEl) {
      promptEl.textContent = game.prompt || 'Palabras de la categoría...';
    }
    if (wordsFeed) {
      const words = game.wordsAccepted || [];
      if (words.length === 0) {
        wordsFeed.innerHTML = '<span class="badge" style="background: rgba(0,255,157,0.15); color: var(--neon-green); border: 1px solid var(--neon-green); padding: 4px 10px; border-radius: var(--radius-pill); font-weight: 700;">¡Empieza la ronda! Escribe rápido...</span>';
      } else {
        wordsFeed.innerHTML = words.map(w => `
          <span class="badge" style="background: rgba(0,240,255,0.15); color: var(--neon-cyan); border: 1px solid var(--neon-cyan); padding: 4px 12px; border-radius: var(--radius-pill); font-weight: 700; font-size: 1rem;">
            ✓ ${escapeHtml(w)}
          </span>
        `).join('');
      }
    }

    if (game.phase === 'EXPLOSION') {
      SoundFX.playBuzz();
      if (holderEl) {
        holderEl.textContent = `💥 ¡BOOOOOOM! Explotó en manos de ${game.lastExplosionVictim?.name || game.activePlayerName}!`;
      }
    }
  }

  // =========================================================================
  // FALSO SABIO (HOST RENDER)
  // =========================================================================
  function renderFalsoSabioGame(game) {
    if (game.phase === 'PODIUM') {
      renderPodium(game);
      return;
    }
    if (game.phase === 'RESULTS') {
      renderScoresPhase(game);
      return;
    }
    if (game.phase === 'INTRO' && game.currentRound === 1 && game.howToPlay) {
      renderIntroPhase(game);
      return;
    }

    showOnlyStage(stageFalsoSabio);

    const roundBadge = document.getElementById('falsoRoundBadge');
    const timerEl = document.getElementById('falsoTimer');
    const promptEl = document.getElementById('falsoPromptQuestion');
    const gridEl = document.getElementById('falsoChoicesGrid');
    const revealBox = document.getElementById('falsoRevealBox');
    const realAnswerEl = document.getElementById('falsoRealAnswer');

    if (roundBadge) {
      roundBadge.textContent = `🎓 FALSO SABIO | RONDA ${game.currentRound} DE ${game.totalRounds}`;
    }
    if (timerEl) {
      timerEl.textContent = `${Math.max(0, game.timer || 0)}s`;
    }
    if (promptEl) {
      promptEl.innerHTML = escapeHtml(game.question || '');
    }

    if (game.phase === 'LIE_WRITING') {
      if (revealBox) revealBox.style.display = 'none';
      if (gridEl) {
        gridEl.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 24px; color: var(--neon-yellow); font-size: 1.2rem; font-weight: 700;">
            ✍️ Los jugadores están inventando sus mentiras más convincentes en sus teléfonos...
          </div>
        `;
      }
    } else if (game.phase === 'TRUTH_VOTING') {
      if (revealBox) revealBox.style.display = 'none';
      if (gridEl) {
        gridEl.innerHTML = '';
        (game.choices || []).forEach(choice => {
          const card = document.createElement('div');
          card.className = 'falso-lie-card';
          card.innerHTML = `
            <div style="font-size: 0.8rem; color: var(--neon-yellow); font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">OPCIÓN POSIBLE:</div>
            <div style="font-size: 1.35rem; font-weight: 800; color: #fff; margin-top: 4px;">"${escapeHtml(choice.text)}"</div>
          `;
          gridEl.appendChild(card);
        });
      }
    } else if (game.phase === 'REVEAL') {
      if (revealBox && game.revealedTruth) {
        revealBox.style.display = 'block';
        if (realAnswerEl) realAnswerEl.textContent = game.revealedTruth;
      }
      if (gridEl) {
        gridEl.innerHTML = '';
        (game.results || []).forEach(item => {
          const card = document.createElement('div');
          card.style.borderRadius = 'var(--radius-md)';
          card.style.padding = '16px 20px';
          card.style.fontFamily = 'var(--font-display)';
          card.style.display = 'flex';
          card.style.flexDirection = 'column';
          card.style.gap = '6px';

          if (item.isRealTruth) {
            card.style.background = 'rgba(0, 255, 157, 0.15)';
            card.style.border = '2px solid var(--neon-green)';
            card.innerHTML = `
              <div style="color: var(--neon-green); font-size: 0.85rem; font-weight: 800;">✓ LA VERDAD REAL</div>
              <div style="color: #fff; font-size: 1.3rem; font-weight: 800;">"${escapeHtml(item.text)}"</div>
              <div style="color: var(--neon-yellow); font-size: 0.95rem; font-weight: 700;">${item.votesCount} VOTOS (+500 PTS)</div>
            `;
          } else {
            card.style.background = 'rgba(255, 42, 133, 0.1)';
            card.style.border = '1px solid rgba(255, 42, 133, 0.4)';
            card.innerHTML = `
              <div style="color: var(--neon-magenta); font-size: 0.85rem; font-weight: 800;">FAROL DE ${escapeHtml(item.authorName)}</div>
              <div style="color: #fff; font-size: 1.2rem; font-weight: 700;">"${escapeHtml(item.text)}"</div>
              <div style="color: var(--text-muted); font-size: 0.9rem;">${item.votesCount} engañados (+250 PTS para ${escapeHtml(item.authorName)})</div>
            `;
          }
          gridEl.appendChild(card);
        });
      }
    }
  }

  // =========================================================================
  // TRIVIA CAÓTICA (HOST RENDER)
  // =========================================================================
  function renderTriviaGame(game) {
    if (game.phase === 'PODIUM') {
      renderPodium(game);
      return;
    }
    if (game.phase === 'RESULTS') {
      renderScoresPhase(game);
      return;
    }

    showOnlyStage(stageTrivia);

    const roundBadge = document.getElementById('triviaRoundBadge');
    const doubleBadge = document.getElementById('triviaDoublePointsBadge');
    const timerEl = document.getElementById('triviaTimer');
    const modePill = document.getElementById('triviaModePill');
    const categoryEl = document.getElementById('triviaCategory');
    const questionEl = document.getElementById('triviaQuestionText');
    const optionsGrid = document.getElementById('triviaOptionsGrid');
    const explanationBox = document.getElementById('triviaExplanationBox');
    const explanationText = document.getElementById('triviaExplanationText');
    const aiCommentaryEl = document.getElementById('triviaAiCommentary');

    if (roundBadge) {
      roundBadge.textContent = `🧠 TRIVIA CAÓTICA | RONDA ${game.currentRound} DE ${game.totalRounds}`;
    }
    if (doubleBadge) {
      doubleBadge.style.display = game.isDoublePoints ? 'inline-block' : 'none';
    }
    if (timerEl) {
      timerEl.textContent = `${Math.max(0, game.timer || 0)}s`;
    }
    if (modePill) {
      modePill.textContent = game.isDuelMode 
        ? '⚔️ MODO DUELO 1v1: ¡EL ACIERTO ROBA PUNTOS AL RIVAL!' 
        : '⚡ BATALLA CAMPAL: ¡BONIFICACIÓN POR VELOCIDAD!';
    }
    if (categoryEl) {
      categoryEl.textContent = `CATEGORÍA: ${game.category ? game.category.toUpperCase() : 'CULTURA POP Y CURIOSIDADES'}`;
    }
    if (questionEl) {
      questionEl.textContent = game.question || '¿Pregunta de Trivia?';
    }

    const optionColors = [
      { border: '#00f0ff', bg: 'rgba(0, 240, 255, 0.1)', letter: 'A' },
      { border: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)', letter: 'B' },
      { border: '#eab308', bg: 'rgba(234, 179, 8, 0.1)', letter: 'C' },
      { border: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', letter: 'D' }
    ];

    if (optionsGrid) {
      optionsGrid.innerHTML = '';
      const isReveal = (game.phase === 'REVEAL');

      (game.options || []).forEach((optText, idx) => {
        const theme = optionColors[idx % optionColors.length];
        const isThisCorrect = isReveal && (idx === game.correctIndex);
        const card = document.createElement('div');
        card.style.borderRadius = 'var(--radius-md)';
        card.style.padding = '18px 22px';
        card.style.textAlign = 'left';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.gap = '8px';
        card.style.transition = 'all 0.3s ease';

        if (isReveal) {
          if (isThisCorrect) {
            card.style.background = 'rgba(0, 255, 157, 0.2)';
            card.style.border = '3px solid var(--neon-green)';
            card.style.boxShadow = '0 0 25px rgba(0, 255, 157, 0.4)';
          } else {
            card.style.background = 'rgba(255, 255, 255, 0.03)';
            card.style.border = '2px solid rgba(255, 255, 255, 0.1)';
            card.style.opacity = '0.55';
          }
        } else {
          card.style.background = theme.bg;
          card.style.border = `2px solid ${theme.border}`;
        }

        let votersHtml = '';
        if (isReveal && game.players) {
          const voters = game.players.filter(p => p.choiceIndex === idx);
          if (voters.length > 0) {
            votersHtml = `
              <div style="margin-top: 8px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                ${voters.map(v => `
                  <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.6); padding: 2px 8px; border-radius: var(--radius-pill); font-size: 0.8rem; font-weight: 700;">
                    ${getAvatarEmoji(v.avatar)} ${escapeHtml(v.name)}
                  </span>
                `).join('')}
              </div>
            `;
          }
        }

        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 900; color: ${isThisCorrect ? 'var(--neon-green)' : theme.border}; background: rgba(0,0,0,0.4); padding: 2px 10px; border-radius: 6px;">
              ${theme.letter}
            </span>
            ${isThisCorrect ? '<span style="font-size: 0.85rem; font-weight: 900; color: var(--neon-green); background: rgba(0,255,157,0.2); padding: 2px 8px; border-radius: 4px;">✓ CORRECTA</span>' : ''}
          </div>
          <div style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; color: #fff; line-height: 1.3;">
            ${escapeHtml(optText)}
          </div>
          ${votersHtml}
        `;
        optionsGrid.appendChild(card);
      });
    }

    if (explanationBox) {
      if (game.phase === 'REVEAL' && game.explanation) {
        explanationBox.style.display = 'block';
        if (explanationText) explanationText.textContent = game.explanation;
        if (aiCommentaryEl) {
          if (game.aiCommentary) {
            aiCommentaryEl.textContent = `"${game.aiCommentary}"`;
            speakSpanish(game.aiCommentary);
          } else {
            aiCommentaryEl.textContent = '';
          }
        }
      } else {
        explanationBox.style.display = 'none';
      }
    }
  }

  // =========================================================================
  // TELEPATÍA DE FIESTA (HOST RENDER)
  // =========================================================================
  function renderTelepatiaGame(game) {
    if (game.phase === 'PODIUM') {
      renderPodium(game);
      return;
    }
    if (game.phase === 'RESULTS') {
      renderScoresPhase(game);
      return;
    }

    showOnlyStage(stageTelepatia);

    const roundBadge = document.getElementById('telepatiaRoundBadge');
    const doubleBadge = document.getElementById('telepatiaDoublePointsBadge');
    const timerEl = document.getElementById('telepatiaTimer');
    const modePill = document.getElementById('telepatiaModePill');
    const topicEl = document.getElementById('telepatiaTopicText');
    const leftLabelEl = document.getElementById('telepatiaLeftLabel');
    const rightLabelEl = document.getElementById('telepatiaRightLabel');
    const markersContainer = document.getElementById('telepatiaMarkersContainer');
    const submissionStatus = document.getElementById('telepatiaSubmissionStatus');
    const resultBox = document.getElementById('telepatiaResultBox');
    const affinityHeadline = document.getElementById('telepatiaAffinityHeadline');
    const affinityDesc = document.getElementById('telepatiaAffinityDesc');
    const aiCommentaryEl = document.getElementById('telepatiaAiCommentary');

    if (roundBadge) {
      roundBadge.textContent = `🔮 TELEPATÍA DE FIESTA | RONDA ${game.currentRound} DE ${game.totalRounds}`;
    }
    if (doubleBadge) {
      doubleBadge.style.display = game.isDoublePoints ? 'inline-block' : 'none';
    }
    if (timerEl) {
      timerEl.textContent = `${Math.max(0, game.timer || 0)}s`;
    }
    if (modePill) {
      modePill.textContent = game.isDuelMode 
        ? '💑 TEST DE CONEXIÓN MENTAL (DUELO 1v1)' 
        : '🧠 MENTE COLMENA (GRUPO COMPLETO)';
    }
    if (topicEl) {
      topicEl.textContent = game.topic || '¿Qué tan aceptable es...?';
    }
    if (leftLabelEl) {
      leftLabelEl.textContent = game.leftLabel || '0% Mínimo';
    }
    if (rightLabelEl) {
      rightLabelEl.textContent = game.rightLabel || '100% Máximo';
    }

    const isReveal = (game.phase === 'REVEAL');

    if (submissionStatus) {
      submissionStatus.innerHTML = '';
      (game.players || []).forEach(p => {
        const pill = document.createElement('div');
        pill.style.display = 'inline-flex';
        pill.style.alignItems = 'center';
        pill.style.gap = '6px';
        pill.style.padding = '6px 14px';
        pill.style.borderRadius = 'var(--radius-pill)';
        pill.style.fontSize = '0.85rem';
        pill.style.fontWeight = '700';

        if (p.hasSubmitted) {
          pill.style.background = 'rgba(0, 255, 157, 0.15)';
          pill.style.border = '1px solid var(--neon-green)';
          pill.style.color = 'var(--neon-green)';
          pill.innerHTML = `${getAvatarEmoji(p.avatar)} ${escapeHtml(p.name)}: ✓ Sintonizado`;
        } else {
          pill.style.background = 'rgba(255, 255, 255, 0.05)';
          pill.style.border = '1px dashed rgba(255, 255, 255, 0.2)';
          pill.style.color = 'var(--text-muted)';
          pill.innerHTML = `${getAvatarEmoji(p.avatar)} ${escapeHtml(p.name)}: ⏳ Calibrando...`;
        }
        submissionStatus.appendChild(pill);
      });
    }

    if (markersContainer) {
      markersContainer.innerHTML = '';
      if (isReveal) {
        (game.players || []).forEach(p => {
          if (p.value !== null && p.value !== undefined) {
            const pin = document.createElement('div');
            pin.style.position = 'absolute';
            pin.style.left = `calc(${Math.min(96, Math.max(4, p.value))}% - 22px)`;
            pin.style.top = '0';
            pin.style.display = 'flex';
            pin.style.flexDirection = 'column';
            pin.style.alignItems = 'center';
            pin.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            pin.innerHTML = `
              <div style="background: #000; border: 2px solid #fff; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
                ${getAvatarEmoji(p.avatar)}
              </div>
              <div style="background: rgba(0,0,0,0.85); color: #fff; border-radius: 4px; padding: 2px 6px; font-size: 0.75rem; font-weight: 800; margin-top: 2px; white-space: nowrap; border: 1px solid rgba(255,255,255,0.3);">
                ${escapeHtml(p.name)} (${p.value}%)
              </div>
            `;
            markersContainer.appendChild(pin);
          }
        });
      }
    }

    if (resultBox) {
      if (isReveal) {
        resultBox.style.display = 'block';
        if (game.isDuelMode && game.duelResult) {
          if (affinityHeadline) {
            affinityHeadline.textContent = `¡SINTONÍA DEL ${game.duelResult.affinityPercent}%! 🤯`;
          }
          if (affinityDesc) {
            affinityDesc.textContent = `Diferencia de solo ${game.duelResult.diff} puntos entre ustedes. ¡Ambos ganan +${game.duelResult.points} PTS!`;
          }
        } else if (game.groupResult) {
          if (affinityHeadline) {
            affinityHeadline.textContent = `PUNTO MEDIO DEL GRUPO: ${game.groupResult.median}% 🎯`;
          }
          if (affinityDesc) {
            affinityDesc.textContent = `¡Quienes más cerca estuvieron del consenso sintonizan el espíritu de la fiesta!`;
          }
        }
        if (aiCommentaryEl) {
          if (game.aiCommentary) {
            aiCommentaryEl.textContent = `"${game.aiCommentary}"`;
            speakSpanish(game.aiCommentary);
          } else {
            aiCommentaryEl.textContent = '';
          }
        }
      } else {
        resultBox.style.display = 'none';
      }
    }
  }

  // Phase 1: Intro / Cómo Jugar (Show Host Presentation)
  function renderIntroPhase(game) {
    showOnlyStage(stageIntro);

    const titleEl = document.getElementById('introGameTitle');
    const taglineEl = document.getElementById('introGameTagline');
    const stepsContainer = document.getElementById('introStepsContainer');

    const tutorial = game.howToPlay;
    if (tutorial) {
      if (titleEl) titleEl.textContent = tutorial.title || game.gameTitle || 'Minijuego';
      if (taglineEl) taglineEl.textContent = tutorial.tagline || '¡Prepárense para la diversión!';

      if (stepsContainer && tutorial.goldenRules && tutorial.goldenRules.length > 0) {
        stepsContainer.innerHTML = '';
        tutorial.goldenRules.slice(0, 3).forEach((rule, idx) => {
          const card = document.createElement('div');
          card.className = 'step-card';
          card.innerHTML = `
            <span class="step-badge-num">PASO ${idx + 1}</span>
            <span class="step-icon">${rule.icon || '🎯'}</span>
            <div class="step-title">${escapeHtml(rule.title)}</div>
            <div class="step-desc">${escapeHtml(rule.description)}</div>
          `;
          stepsContainer.appendChild(card);
        });
      }

      if (tutorial.hostNarration) {
        speakSpanish(tutorial.hostNarration);
      }
    } else {
      speakSpanish('¡Bienvenidos al juego! Miren sus teléfonos móviles.');
    }

    updateTimerCircle(
      document.getElementById('introTimerBar'),
      document.getElementById('introTimerText'),
      game.timer,
      (tutorial && tutorial.durationSeconds) ? tutorial.durationSeconds : 20
    );
  }

  // Phase 2: Answering (Players typing on mobile)
  function renderAnsweringPhase(game) {
    showOnlyStage(stageAnswering);

    if (answeringRoundBadge) {
      answeringRoundBadge.textContent = `RONDA ${game.currentRound} DE ${game.totalRounds}${game.isDoublePoints ? ' (¡PUNTOS DOBLES!)' : ''}`;
    }

    updateTimerCircle(answeringTimerBar, answeringTimerText, game.timer, 45);

    // Update players answering progress
    const players = game.leaderboard || [];
    let answeredCount = 0;

    if (answeringPlayersStatus) {
      answeringPlayersStatus.innerHTML = '';
      players.forEach(p => {
        if (p.hasAnswered) answeredCount++;
        const item = document.createElement('div');
        item.className = 'player-token';
        item.setAttribute('data-player-name', p.name);
        item.style.padding = '10px';
        item.innerHTML = `
          <div style="font-size: 2rem; margin-bottom: 4px;">${getAvatarEmoji(p.avatar)}</div>
          <div style="font-family: var(--font-display); font-size: 1rem; font-weight: 700;">${escapeHtml(p.name)}</div>
          <div style="font-size: 0.85rem; font-weight: 700; color: ${p.hasAnswered ? 'var(--neon-green)' : 'var(--neon-yellow)'};">
            ${p.hasAnswered ? '✓ Enviado' : '⏳ Escribiendo...'}
          </div>
        `;
        answeringPlayersStatus.appendChild(item);
      });
    }

    if (answeringProgressCount) {
      answeringProgressCount.textContent = `${answeredCount}/${players.length}`;
    }
  }

  // Phase 3: Voting (Duel Presentation)
  function renderVotingPhase(game) {
    showOnlyStage(stageDuel);
    const duel = game.currentDuel;
    if (!duel) return;

    if (duelCounterBadge) {
      duelCounterBadge.textContent = `⚔️ DUELO ${duel.duelIndex} DE ${duel.totalDuels}`;
    }

    updateTimerCircle(duelTimerBar, duelTimerText, game.timer, 18);

    if (duelPromptText) {
      duelPromptText.textContent = `"${duel.promptText}"`;
    }

    // Option A
    if (combatAnswerA) combatAnswerA.textContent = `"${duel.optionA.text}"`;
    if (combatAuthorA) combatAuthorA.textContent = '???';
    if (voteSectionA) voteSectionA.style.display = 'none';
    if (combatCardA) {
      combatCardA.classList.remove('winner', 'loser');
    }

    // Option B
    if (combatAnswerB) combatAnswerB.textContent = `"${duel.optionB.text}"`;
    if (combatAuthorB) combatAuthorB.textContent = '???';
    if (voteSectionB) voteSectionB.style.display = 'none';
    if (combatCardB) {
      combatCardB.classList.remove('winner', 'loser');
    }

    // Hide AI speech bubble during voting
    if (aiHostSpeechStage) aiHostSpeechStage.style.display = 'none';
  }

  // Phase 4: AI Judging & Vote Reveal
  function renderAiJudgingPhase(game) {
    showOnlyStage(stageDuel);
    const duel = game.currentDuel;
    if (!duel) return;

    // Reveal Authors
    if (combatAuthorA) combatAuthorA.textContent = duel.optionA.authorName;
    if (combatAuthorB) combatAuthorB.textContent = duel.optionB.authorName;

    // Reveal Votes and Fill Bars
    const votesA = duel.optionA.votesCount || 0;
    const votesB = duel.optionB.votesCount || 0;
    const totalVotes = votesA + votesB;
    const pctA = totalVotes > 0 ? Math.round((votesA / totalVotes) * 100) : 50;
    const pctB = totalVotes > 0 ? Math.round((votesB / totalVotes) * 100) : 50;

    if (voteSectionA) voteSectionA.style.display = 'block';
    if (voteFillA) voteFillA.style.width = `${pctA}%`;
    if (votePercentA) votePercentA.textContent = `${pctA}%`;
    if (voteCountA) voteCountA.textContent = `${votesA} Voto${votesA === 1 ? '' : 's'}`;

    if (voteSectionB) voteSectionB.style.display = 'block';
    if (voteFillB) voteFillB.style.width = `${pctB}%`;
    if (votePercentB) votePercentB.textContent = `${pctB}%`;
    if (voteCountB) voteCountB.textContent = `${votesB} Voto${votesB === 1 ? '' : 's'}`;

    // Highlight Winner & Trigger Dramatic Effects
    const isSweep = (pctA === 100 || pctB === 100) && totalVotes >= 2;
    if (votesA > votesB) {
      combatCardA.classList.add('winner');
      combatCardB.classList.add('loser');
      if (isSweep) triggerScreenShake(450);
    } else if (votesB > votesA) {
      combatCardB.classList.add('winner');
      combatCardA.classList.add('loser');
      if (isSweep) triggerScreenShake(450);
    }

    // AI Host Comic Bubble
    if (aiHostSpeechStage && duel.aiJudgement) {
      aiHostSpeechStage.style.display = 'flex';
      const ai = duel.aiJudgement;

      if (aiCommentaryText) {
        aiCommentaryText.textContent = `"${ai.commentary}"`;
      }

      if (aiVerdictBadge) {
        const winnerChoice = ai.winner === 'A' ? 'Opción A' : 'Opción B';
        aiVerdictBadge.textContent = `👑 Veredicto del Juez: ¡${winnerChoice} gana +${ai.aiBonus || 250} PTS extra!`;
      }

      // Voice Narration
      SoundFX.playFanfare();
      speakSpanish(ai.commentary);
    }
  }

  // Phase 5: Round Scores
  function renderScoresPhase(game) {
    showOnlyStage(stageScores);

    if (scoresRoundBadge) {
      scoresRoundBadge.textContent = `FIN DE LA RONDA ${game.currentRound} DE ${game.totalRounds}`;
    }

    const leaderboard = game.leaderboard || [];
    if (scoresLeaderboardList) {
      scoresLeaderboardList.innerHTML = '';
      leaderboard.forEach((p, idx) => {
        const row = document.createElement('div');
        row.className = `leaderboard-item rank-${idx + 1}`;
        row.innerHTML = `
          <div class="leaderboard-left">
            <span class="leaderboard-rank">#${idx + 1}</span>
            <div class="leaderboard-avatar" style="background: ${(typeof p.avatar === 'object' ? p.avatar?.color : null) || '#3b82f6'};">
              ${getAvatarEmoji(p.avatar)}
            </div>
            <span class="leaderboard-name">${escapeHtml(p.name)}</span>
          </div>
          <div class="leaderboard-right">
            ${p.roundDelta > 0 ? `<span class="round-delta-badge">+${p.roundDelta} pts</span>` : ''}
            <span class="total-score-badge">${p.score} PTS</span>
          </div>
        `;
        scoresLeaderboardList.appendChild(row);
      });
    }

    SoundFX.playDing();
    speakSpanish(`Fin de la ronda ${game.currentRound}. ¡Miren la tabla de puntuaciones!`);
  }

  // Phase 6: Final Podium
  function renderPodium(game) {
    const hostMainLogoText = document.getElementById('hostMainLogoText');
    if (hostMainLogoText && game.gameTitle) {
      hostMainLogoText.textContent = game.gameTitle.toUpperCase();
    }

    showOnlyStage(stagePodium);
    startConfetti();

    let podium = game.podium;
    if (!podium || !Array.isArray(podium) || podium.length === 0) {
      if (Array.isArray(game.leaderboard) && game.leaderboard.length > 0) {
        podium = game.leaderboard.slice(0, 3);
      } else if (Array.isArray(currentState?.players) && currentState.players.length > 0) {
        podium = [...currentState.players].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 3);
      } else {
        podium = [];
      }
    }

    // 1st Place (Gold)
    if (podium[0]) {
      const av1 = getAvatarEmoji(podium[0].avatar, '🦊');
      if (podiumAvatar1) podiumAvatar1.textContent = av1;
      if (podiumName1) podiumName1.textContent = podium[0].name || 'Jugador 1';
      if (podiumScore1) podiumScore1.textContent = `${podium[0].score || 0} PTS`;
    }

    // 2nd Place (Silver)
    if (podium[1]) {
      const av2 = getAvatarEmoji(podium[1].avatar, '🐙');
      if (podiumAvatar2) podiumAvatar2.textContent = av2;
      if (podiumName2) podiumName2.textContent = podium[1].name || 'Jugador 2';
      if (podiumScore2) podiumScore2.textContent = `${podium[1].score || 0} PTS`;
      if (podiumStep2) podiumStep2.style.visibility = 'visible';
    } else {
      if (podiumStep2) podiumStep2.style.visibility = 'hidden';
    }

    // 3rd Place (Bronze)
    if (podium[2]) {
      const av3 = getAvatarEmoji(podium[2].avatar, '🦙');
      if (podiumAvatar3) podiumAvatar3.textContent = av3;
      if (podiumName3) podiumName3.textContent = podium[2].name || 'Jugador 3';
      if (podiumScore3) podiumScore3.textContent = `${podium[2].score || 0} PTS`;
      if (podiumStep3) podiumStep3.style.visibility = 'visible';
    } else {
      if (podiumStep3) podiumStep3.style.visibility = 'hidden';
    }

    SoundFX.playFanfare();
    if (podium[0]) {
      const gTitle = game.gameTitle || 'la partida';
      speakSpanish(`¡Felicidades a ${podium[0].name}! Es el gran campeón de ${gTitle}.`);
    }
  }

  // =========================================================================
  // PLAYER LIVE REACTIONS (Custom Vector Character Stickers Over Player Card)
  // =========================================================================
  socket.on('host:player_reaction', ({ playerName, avatar, emoteId, emoteSvg, emoji }) => {
    SoundFX.playPop();

    const targetEmoteId = emoteId || 'happy';
    const playerEmoji = avatar?.emoji || '🦊';
    const playerColor = avatar?.color || '#ff6b4a';

    // Prioritize freshly rendered pure vector character sticker
    let svgMarkup = '';
    if (window.CharacterEmoteEngine) {
      svgMarkup = window.CharacterEmoteEngine.getEmoteSvg(playerEmoji, targetEmoteId, playerColor);
    } else if (emoteSvg) {
      svgMarkup = emoteSvg;
    } else {
      svgMarkup = `<span style="font-size:3.5rem;">${emoji || '🎉'}</span>`;
    }

    triggerPlayerTokenReaction(playerName, svgMarkup);
  });

  function triggerPlayerTokenReaction(playerName, svgMarkup) {
    if (!playerName) return;
    const cleanTarget = playerName.trim().toLowerCase();
    const tokens = document.querySelectorAll('.player-token');
    let found = false;

    tokens.forEach(t => {
      const tokenName = (t.getAttribute('data-player-name') || t.querySelector('.player-token-name')?.textContent || '').trim().toLowerCase();
      if (tokenName && (tokenName === cleanTarget || tokenName.includes(cleanTarget) || cleanTarget.includes(tokenName))) {
        found = true;
        // Bounce the avatar
        const av = t.querySelector('.player-token-avatar');
        if (av) {
          av.classList.remove('avatar-bounce');
          void av.offsetWidth;
          av.classList.add('avatar-bounce');
        }

        // Calculate token position on screen so sticker overlays perfectly without affecting DOM flow or scrollbars
        const rect = t.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const centerX = rect.left + (rect.width / 2);
          const startY = rect.top + 20;

          // Remove any active bubble for this token
          const existing = document.querySelector(`.player-token-reaction-bubble[data-owner="${cleanTarget}"]`);
          if (existing) existing.remove();

          // Create overlay reaction sticker directly ABOVE the player avatar appended to body
          const bubble = document.createElement('div');
          bubble.className = 'player-token-reaction-bubble';
          bubble.setAttribute('data-owner', cleanTarget);
          bubble.style.cssText = `position: fixed; left: ${centerX}px; top: ${startY}px; width: 92px; height: 92px; pointer-events: none; z-index: 99999; filter: drop-shadow(0 8px 18px rgba(0,0,0,0.65)); animation: stickerPopAbove 1.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;`;
          bubble.innerHTML = svgMarkup;
          document.body.appendChild(bubble);

          setTimeout(() => bubble.remove(), 1800);
        } else {
          found = false;
        }
      }
    });

    // If player is not currently in the visible lobby grid (e.g. answering or duel phases)
    if (!found) {
      const floater = document.createElement('div');
      floater.className = 'arena-floating-emote';
      floater.style.cssText = `position: fixed; bottom: 80px; right: ${Math.floor(40 + Math.random() * 220)}px; width: 92px; height: 92px; pointer-events: none; z-index: 99999; filter: drop-shadow(0 8px 20px rgba(0,0,0,0.6)); animation: floatReactionAesthetic 2.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;`;
      floater.innerHTML = svgMarkup;
      document.body.appendChild(floater);
      setTimeout(() => floater.remove(), 2500);
    }
  }

  // =========================================================================
  // USER ACTIONS / BUTTON EVENTS
  // =========================================================================

  // =========================================================================
  // AUDIENCE & GAME CATALOG CONTROLS
  // =========================================================================
  const audienceGroup = document.getElementById('audienceGroup');
  if (audienceGroup) {
    audienceGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('.audience-btn');
      if (!btn) return;
      const audience = btn.getAttribute('data-audience');
      SoundFX.playTick();
      socket.emit('host:set_audience', { audience }, (res) => {
        if (res && res.success) {
          document.querySelectorAll('.audience-btn').forEach(b => {
            b.classList.remove('active');
            b.classList.add('btn-outline');
          });
          btn.classList.add('active');
          btn.classList.remove('btn-outline');
        }
      });
    });
  }

  const catalogGroup = document.getElementById('catalogGroup');
  if (catalogGroup) {
    catalogGroup.addEventListener('click', (e) => {
      const card = e.target.closest('.game-card');
      if (!card) return;
      const gameId = card.getAttribute('data-game');
      SoundFX.playDing();
      socket.emit('host:set_game', { gameId }, (res) => {
        if (res && res.success) {
          document.querySelectorAll('.game-card').forEach(c => {
            c.classList.remove('active');
            c.style.background = 'rgba(255,255,255,0.04)';
            c.style.borderColor = 'rgba(255,255,255,0.15)';
          });
          card.classList.add('active');
          card.style.background = 'rgba(0,240,255,0.12)';
          card.style.borderColor = 'var(--neon-cyan)';
        }
      });
    });
  }

  // Dynamic pacing replaces manual round buttons

  // Start Game Button
  if (btnStartGame) {
    btnStartGame.addEventListener('click', () => {
      SoundFX.playDing();
      if (!currentState || (currentState.playersCount < 2)) {
        if (btnSimulatePlayers && !btnSimulatePlayers.disabled) {
          btnSimulatePlayers.click();
          setTimeout(() => {
            socket.emit('host:start_game', {}, (res) => {
              if (res && !res.success) {
                console.warn('[Host] Start game:', res.error);
              }
            });
          }, 600);
          return;
        }
      }
      socket.emit('host:start_game', {}, (res) => {
        if (res && !res.success) {
          alert(res.error || 'No se pudo iniciar el juego');
        }
      });
    });
  }

  // Skip Timer Button
  if (btnSkipTimer) {
    btnSkipTimer.addEventListener('click', () => {
      SoundFX.playTick();
      socket.emit('host:skip_timer');
    });
  }

  // Restart Game Button
  if (btnRestartGame) {
    btnRestartGame.addEventListener('click', () => {
      SoundFX.playDing();
      socket.emit('host:restart_game');
    });
  }

  // Fullscreen Button
  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  // AI Voice Toggle
  if (aiVoiceToggle) {
    aiVoiceToggle.addEventListener('change', (e) => {
      isSpeechEnabled = e.target.checked;
      if (!isSpeechEnabled && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    });
  }

  if (btnQuickBots && btnSimulatePlayers) {
    btnQuickBots.addEventListener('click', () => {
      btnSimulatePlayers.click();
    });
  }

  // =========================================================================
  // DEMO / SIMULATE PLAYERS BUTTON (FOR STANDALONE TESTING)
  // =========================================================================
  if (btnSimulatePlayers) {
    btnSimulatePlayers.addEventListener('click', () => {
      SoundFX.playDing();
      btnSimulatePlayers.disabled = true;
      btnSimulatePlayers.style.opacity = '0.5';
      btnSimulatePlayers.innerText = '🤖 Bots Simulados';

      // Connect simulated sockets to quickly fill the room and test the entire game flow
      const simNames = ['🦊 FedeZorro', '🐙 PulpoFiestero', '🦙 LlamaLoca'];
      simNames.forEach((name, i) => {
        setTimeout(() => {
          const simSocket = io();
          let answeredRound = null;
          let votedDuelId = null;
          let submittedClueRound = null;
          let votedImpostorRound = null;
          let chosenDilemmaRound = null;

          simSocket.emit('player:join', { roomCode: currentRoomCode, playerName: name }, (res) => {
            console.log(`[Sim] ${name} joined:`, res);

            // Auto-respond across all 3 party games
            simSocket.on('player:state_update', (privState) => {
              if (!privState?.game) return;
              const g = privState.game;
              const currentRound = g.currentRound || g.round || 1;

              // Game 1: Duelo de Ocurrencias
              if (g.gameId === 'duelo-ocurrencias') {
                if (g.phase === 'ANSWERING' && g.prompts && answeredRound !== currentRound) {
                  answeredRound = currentRound;
                  const answers = {};
                  g.prompts.forEach((p, idx) => {
                    answers[p.duelId] = `Ocurrencia de ${name} para el duelo ${idx + 1}`;
                  });
                  setTimeout(() => {
                    simSocket.emit('player:submit_answers', { answers });
                  }, 800 + Math.random() * 800);
                } else if (g.phase === 'VOTING' && g.options && votedDuelId !== g.duelId) {
                  votedDuelId = g.duelId;
                  const choice = Math.random() > 0.5 ? 'A' : 'B';
                  setTimeout(() => {
                    simSocket.emit('player:vote', { duelId: g.duelId, choice });
                  }, 600 + Math.random() * 800);
                }
              }

              // Game 2: El Impostor de Silicio
              if (g.gameId === 'impostor-silicio') {
                const isCluePhase = (g.phase === 'CLUES_1' || g.phase === 'CLUES_2' || g.phase === 'CLUES');
                const clueKey = `${currentRound}_${g.phase}`;
                if (isCluePhase && !g.hasSubmittedClue && submittedClueRound !== clueKey) {
                  submittedClueRound = clueKey;
                  const simClues = ['Sospechoso', 'Interesante', 'Fresco', 'Noche', 'Secreto', 'Brillo', 'Silencio', 'Oculto'];
                  const randomClue = simClues[Math.floor(Math.random() * simClues.length)];
                  setTimeout(() => {
                    simSocket.emit('player:submit_clue', { clue: randomClue });
                  }, 700 + Math.random() * 900);
                } else if (g.phase === 'VOTING' && !g.hasVoted && votedImpostorRound !== currentRound) {
                  votedImpostorRound = currentRound;
                  const candidates = g.candidates || [];
                  if (candidates.length > 0) {
                    const pick = candidates[Math.floor(Math.random() * candidates.length)];
                    setTimeout(() => {
                      simSocket.emit('player:submit_impostor_vote', { suspectId: pick.id });
                    }, 800 + Math.random() * 1000);
                  }
                } else if (g.phase === 'ESCAPE' && g.isImpostor && g.escapeOptions && g.escapeOptions.length > 0) {
                  const guess = g.escapeOptions[Math.floor(Math.random() * g.escapeOptions.length)];
                  setTimeout(() => {
                    simSocket.emit('player:submit_impostor_guess', { guess });
                  }, 900);
                }
              }

              // Game 3: Dilemas Extremos
              if (g.gameId === 'dilemas-extremos') {
                if (g.phase === 'CHOICE' && !g.hasChosen && chosenDilemmaRound !== currentRound) {
                  chosenDilemmaRound = currentRound;
                  setTimeout(() => {
                    simSocket.emit('player:choose_dilemma', {
                      choice: Math.random() > 0.5 ? 'A' : 'B',
                      prediction: Math.random() > 0.5 ? 'A' : 'B'
                    });
                  }, 600 + Math.random() * 900);
                }
              }

              // Game 4: Bomba de Palabras
              if (g.gameId === 'bomba-palabras') {
                if (g.phase === 'TICKING' && g.isMyTurn) {
                  const passWord = g.filter ? `MEGA${g.filter}BOMBA` : 'FIESTON';
                  setTimeout(() => {
                    simSocket.emit('player:submit_bomba_word', { word: passWord });
                  }, 800 + Math.random() * 800);
                }
              }

              // Game 5: Falso Sabio
              if (g.gameId === 'falso-sabio') {
                if (g.phase === 'LIE_WRITING' && !g.hasSubmittedLie) {
                  const funnyLies = [
                    'Inventó los tacos transparentes en 1980',
                    'Se convirtió en presidente de una isla por error',
                    'Ganó un premio Nobel por bailar breakdance',
                    'Declaró la guerra a los mosquitos oficialmente'
                  ];
                  const pickLie = funnyLies[Math.floor(Math.random() * funnyLies.length)];
                  setTimeout(() => {
                    simSocket.emit('player:submit_falso_lie', { lie: pickLie });
                  }, 600 + Math.random() * 800);
                } else if (g.phase === 'TRUTH_VOTING' && !g.hasVoted && g.choices && g.choices.length > 0) {
                  const pickChoice = g.choices[Math.floor(Math.random() * g.choices.length)];
                  setTimeout(() => {
                    simSocket.emit('player:submit_falso_vote', { choice: pickChoice.text });
                  }, 700 + Math.random() * 900);
                }
              }
            });
          });
        }, i * 300);
      });
    });
  }

  // =========================================================================
  // CONFETTI ANIMATION (CANVAS PARTICLES)
  // =========================================================================
  let confettiAnimationId = null;
  const particles = [];
  const confettiColors = ['#00f0ff', '#ff2a85', '#ffd600', '#00ff9d', '#9d4edd', '#ffffff'];

  function initConfettiParticles() {
    particles.length = 0;
    const count = 120;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * -window.innerHeight,
        size: Math.random() * 10 + 6,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 5 + 4,
        rot: Math.random() * 360,
        vrot: (Math.random() - 0.5) * 10
      });
    }
  }

  function renderConfetti() {
    if (!confettiCanvas) return;
    const ctx = confettiCanvas.getContext('2d');
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;

      if (p.y > window.innerHeight) {
        p.y = -20;
        p.x = Math.random() * window.innerWidth;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
      ctx.restore();
    });

    confettiAnimationId = requestAnimationFrame(renderConfetti);
  }

  function startConfetti() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    initConfettiParticles();
    if (!confettiAnimationId) {
      renderConfetti();
    }
  }

  function stopConfetti() {
    if (confettiAnimationId) {
      cancelAnimationFrame(confettiAnimationId);
      confettiAnimationId = null;
    }
    if (confettiCanvas) {
      const ctx = confettiCanvas.getContext('2d');
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  window.addEventListener('resize', () => {
    if (confettiCanvas) {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    }
  });

  // Utility helper
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

})();
