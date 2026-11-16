/**
 * play.js
 * Mobile Controller for "Anfitrión de Fiestas"
 * Optimized for mobile touchscreens: zero-scroll, haptic feedback,
 * tactile buttons, real-time prompts and voting.
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
  let myPlayer = null;
  let currentRoomCode = '';
  let assignedPrompts = [];
  let currentPromptIndex = 0;
  let localAnswers = {}; // { [duelId]: string }
  let hasVotedCurrentDuel = false;

  // DOM Elements - Screens
  const screenJoin = document.getElementById('screenJoin');
  const screenLobbyWait = document.getElementById('screenLobbyWait');
  const screenHowToPlay = document.getElementById('screenHowToPlay');
  const howToPlayMobileTitle = document.getElementById('howToPlayMobileTitle');
  const howToPlayMobileDesc = document.getElementById('howToPlayMobileDesc');
  const screenGameIntro = document.getElementById('screenGameIntro');
  const screenAnswering = document.getElementById('screenAnswering');
  const screenAnswerSubmitted = document.getElementById('screenAnswerSubmitted');
  const screenVoting = document.getElementById('screenVoting');
  const screenImpostor = document.getElementById('screenImpostor');
  const screenDilemma = document.getElementById('screenDilemma');
  const screenBomba = document.getElementById('screenBomba');
  const screenFalsoSabio = document.getElementById('screenFalsoSabio');
  const screenTrivia = document.getElementById('screenTrivia');
  const screenTelepatia = document.getElementById('screenTelepatia');
  const screenAiJudging = document.getElementById('screenAiJudging');
  const screenRoundScores = document.getElementById('screenRoundScores');
  const screenPodium = document.getElementById('screenPodium');

  const allScreens = [
    screenJoin,
    screenLobbyWait,
    screenHowToPlay,
    screenGameIntro,
    screenAnswering,
    screenAnswerSubmitted,
    screenVoting,
    screenImpostor,
    screenDilemma,
    screenBomba,
    screenFalsoSabio,
    screenTrivia,
    screenTelepatia,
    screenAiJudging,
    screenRoundScores,
    screenPodium
  ];

  // CTA Elements
  const mobileCtaBanner = document.getElementById('mobileCtaBanner');
  const ctaHeadline = document.getElementById('ctaHeadline');
  const ctaBadge = document.getElementById('ctaBadge');
  const ctaInstruction = document.getElementById('ctaInstruction');
  const ctaSubtext = document.getElementById('ctaSubtext');

  // Header Elements
  const playerProfileBadge = document.getElementById('playerProfileBadge');
  const headerAvatar = document.getElementById('headerAvatar');
  const headerName = document.getElementById('headerName');
  const playerRoomDisplay = document.getElementById('playerRoomDisplay');
  const playerScoreDisplay = document.getElementById('playerScoreDisplay');
  const playerReactionsBar = document.getElementById('playerReactionsBar');

  // Join Elements
  const inputRoomCode = document.getElementById('inputRoomCode');
  const inputPlayerName = document.getElementById('inputPlayerName');
  const btnRandomName = document.getElementById('btnRandomName');
  const btnJoinRoom = document.getElementById('btnJoinRoom');
  const joinErrorMsg = document.getElementById('joinErrorMsg');

  // Lobby Wait Elements
  const waitAvatarIcon = document.getElementById('waitAvatarIcon');
  const waitPlayerGreeting = document.getElementById('waitPlayerGreeting');

  // Answering Elements
  const promptIndexBadge = document.getElementById('promptIndexBadge');
  const playerTimerAnswering = document.getElementById('playerTimerAnswering');
  const playerPromptText = document.getElementById('playerPromptText');
  const playerAnswerInput = document.getElementById('playerAnswerInput');
  const charCount = document.getElementById('charCount');
  const btnSubmitAnswer = document.getElementById('btnSubmitAnswer');

  // Voting Elements
  const votePromptHeader = document.getElementById('votePromptHeader');
  const votingButtonsGroup = document.getElementById('votingButtonsGroup');
  const btnVoteA = document.getElementById('btnVoteA');
  const btnVoteB = document.getElementById('btnVoteB');
  const voteTextA = document.getElementById('voteTextA');
  const voteTextB = document.getElementById('voteTextB');
  const duelistSuspenseCard = document.getElementById('duelistSuspenseCard');
  const voteConfirmedBanner = document.getElementById('voteConfirmedBanner');

  // Scores Elements
  const playerRoundGainText = document.getElementById('playerRoundGainText');

  // Impostor Elements
  const impostorRoleBadge = document.getElementById('impostorRoleBadge');
  const impostorMobileTimer = document.getElementById('impostorMobileTimer');
  const impostorMobileCategory = document.getElementById('impostorMobileCategory');
  const impostorSecretWordBox = document.getElementById('impostorSecretWordBox');
  const impostorSecretWordText = document.getElementById('impostorSecretWordText');
  const impostorWarningBox = document.getElementById('impostorWarningBox');
  const impostorHintText = document.getElementById('impostorHintText');
  const impostorClueForm = document.getElementById('impostorClueForm');
  const inputImpostorClue = document.getElementById('inputImpostorClue');
  const btnSubmitClue = document.getElementById('btnSubmitClue');
  const impostorVotingSection = document.getElementById('impostorVotingSection');
  const impostorCandidatesList = document.getElementById('impostorCandidatesList');
  const impostorEscapeSection = document.getElementById('impostorEscapeSection');
  const impostorEscapeButtons = document.getElementById('impostorEscapeButtons');
  const impostorStatusFeedback = document.getElementById('impostorStatusFeedback');
  const impostorMobileResolutionBox = document.getElementById('impostorMobileResolutionBox');
  const impostorMobileResolutionTitle = document.getElementById('impostorMobileResolutionTitle');
  const impostorMobileVotedOut = document.getElementById('impostorMobileVotedOut');
  const impostorMobileFinalWord = document.getElementById('impostorMobileFinalWord');
  const impostorMobileRealImpostorName = document.getElementById('impostorMobileRealImpostorName');

  // Dilemma Elements
  const dilemmaMobileTimer = document.getElementById('dilemmaMobileTimer');
  const dilemmaMobileQuestion = document.getElementById('dilemmaMobileQuestion');
  const btnDilemmaChoiceA = document.getElementById('btnDilemmaChoiceA');
  const btnDilemmaChoiceB = document.getElementById('btnDilemmaChoiceB');
  const dilemmaChoiceTextA = document.getElementById('dilemmaChoiceTextA');
  const dilemmaChoiceTextB = document.getElementById('dilemmaChoiceTextB');
  const btnPredictA = document.getElementById('btnPredictA');
  const btnPredictB = document.getElementById('btnPredictB');
  const dilemmaConfirmedMsg = document.getElementById('dilemmaConfirmedMsg');

  let selectedDilemmaChoice = null;
  let selectedDilemmaPrediction = null;

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

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

  // Podium Elements
  const playerPodiumIcon = document.getElementById('playerPodiumIcon');
  const playerPodiumTitle = document.getElementById('playerPodiumTitle');
  const playerPodiumRank = document.getElementById('playerPodiumRank');

  // Funny Nicknames Pool for the Randomizer
  const FUNNY_NAMES = [
    'TacoPoderoso', 'GuacaMole', 'AstroPato', 'ChurroLover', 'SalsaBrava',
    'PixelAlien', 'DinoBailarín', 'LlamaDrama', 'KoalaNinja', 'PulpoRey',
    'ZorroAstuto', 'CapiBarista', 'Quesadillero', 'PandaZen', 'TiburónLoco'
  ];

  // =========================================================================
  // HAPTIC FEEDBACK (VIBRATION API)
  // =========================================================================
  function triggerHaptic(duration = 40) {
    if (window.navigator && typeof window.navigator.vibrate === 'function') {
      try {
        window.navigator.vibrate(duration);
      } catch (e) {
        // Ignore if blocked by browser policy
      }
    }
  }

  // =========================================================================
  // SCREEN SWITCHER
  // =========================================================================
  // Screen Switcher
  let currentVisibleScreen = null;
  function showScreen(screen) {
    if (currentVisibleScreen === screen && screen && screen.style.display !== 'none') {
      return;
    }
    allScreens.forEach(s => {
      if (s) {
        if (s === screen) {
          s.style.display = 'flex';
          s.style.flexDirection = 'column';
          currentVisibleScreen = screen;
        } else {
          s.style.display = 'none';
        }
      }
    });
  }

  // =========================================================================
  // INITIALIZATION: URL PARAMETERS & RANDOM NICKNAME & AVATAR PICKER
  // =========================================================================
  const AVAILABLE_AVATARS = [
    { emoji: '🦊', color: '#ff6b4a', name: 'Zorro Astuto' },
    { emoji: '🐙', color: '#ec4899', name: 'Pulpo Fiestero' },
    { emoji: '🦙', color: '#8b5cf6', name: 'Llama Loca' },
    { emoji: '🦖', color: '#10b981', name: 'T-Rex Gamer' },
    { emoji: '🦄', color: '#f43f5e', name: 'Unicornio Caótico' },
    { emoji: '🐼', color: '#06b6d4', name: 'Panda Zen' },
    { emoji: '🦁', color: '#f59e0b', name: 'León Rey' },
    { emoji: '🦈', color: '#3b82f6', name: 'Tiburón Pro' },
    { emoji: '🐸', color: '#22c55e', name: 'Rana Ninja' },
    { emoji: '👽', color: '#a855f7', name: 'Alien Espía' },
    { emoji: '🤖', color: '#64748b', name: 'Robot DJ' },
    { emoji: '🐱', color: '#eab308', name: 'Michi Supremo' },
    { emoji: '👻', color: '#38bdf8', name: 'Fantasma Cool' },
    { emoji: '💀', color: '#e11d48', name: 'Calavera Rock' },
    { emoji: '🍕', color: '#f97316', name: 'Pizza Viviente' },
    { emoji: '🔥', color: '#ef4444', name: 'Fueguito Party' }
  ];
  let selectedAvatar = AVAILABLE_AVATARS[0];

  function initJoinForm() {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room') || params.get('code');
    if (roomParam && inputRoomCode) {
      inputRoomCode.value = roomParam.trim().toUpperCase().slice(0, 4);
    }

    const nameParam = params.get('name');
    if (nameParam && inputPlayerName) {
      inputPlayerName.value = nameParam.trim().slice(0, 16);
      if (nameParam.includes('Zorro')) selectedAvatar = AVAILABLE_AVATARS[0];
      else if (nameParam.includes('Pulpo')) selectedAvatar = AVAILABLE_AVATARS[1];
      else if (nameParam.includes('Llama')) selectedAvatar = AVAILABLE_AVATARS[2];
    }

    const avatarPickerGrid = document.getElementById('avatarPickerGrid');
    const joinAvatarPreview = document.getElementById('joinAvatarPreview');

    function renderAvatarPicker() {
      if (!avatarPickerGrid) return;
      avatarPickerGrid.innerHTML = '';
      AVAILABLE_AVATARS.forEach((av) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.style.padding = '8px 4px';
        btn.style.fontSize = '1.7rem';
        btn.style.borderRadius = 'var(--radius-sm)';
        btn.style.cursor = 'pointer';
        btn.style.transition = 'all 0.15s ease';
        const isSelected = (selectedAvatar.emoji === av.emoji);
        btn.style.border = isSelected ? '2px solid var(--neon-cyan)' : '1px solid rgba(255,255,255,0.12)';
        btn.style.background = isSelected ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255,255,255,0.04)';
        btn.style.boxShadow = isSelected ? '0 0 15px rgba(0, 240, 255, 0.5)' : 'none';
        btn.textContent = av.emoji;
        btn.title = av.name;
        btn.addEventListener('click', () => {
          triggerHaptic(30);
          selectedAvatar = av;
          renderAvatarPicker();
          if (joinAvatarPreview) {
            joinAvatarPreview.textContent = av.emoji;
            joinAvatarPreview.style.borderColor = av.color || 'var(--neon-cyan)';
            joinAvatarPreview.style.background = `${av.color || '#00f0ff'}22`;
          }
        });
        avatarPickerGrid.appendChild(btn);
      });
    }

    renderAvatarPicker();
    if (joinAvatarPreview) {
      joinAvatarPreview.textContent = selectedAvatar.emoji;
      joinAvatarPreview.style.borderColor = selectedAvatar.color || 'var(--neon-cyan)';
      joinAvatarPreview.style.background = `${selectedAvatar.color || '#00f0ff'}22`;
    }

    if (btnRandomName && inputPlayerName) {
      btnRandomName.addEventListener('click', () => {
        triggerHaptic(30);
        const randomName = FUNNY_NAMES[Math.floor(Math.random() * FUNNY_NAMES.length)];
        inputPlayerName.value = randomName;
      });
    }

    // Auto-join for demo / arena mode
    const autoJoin = params.get('autoJoin');
    if (autoJoin === '1' || autoJoin === 'true') {
      setTimeout(() => {
        if (inputRoomCode?.value && inputPlayerName?.value) {
          handleJoin();
        }
      }, 400);
    }

    // Auto-uppercase on room code typing
    if (inputRoomCode) {
      inputRoomCode.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
      });
    }

    // Join Room Button
    if (btnJoinRoom) {
      btnJoinRoom.addEventListener('click', handleJoin);
    }

    // Also join on Enter key
    [inputRoomCode, inputPlayerName].forEach(input => {
      if (input) {
        input.addEventListener('keyup', (e) => {
          if (e.key === 'Enter') handleJoin();
        });
      }
    });
  }

  function handleJoin() {
    triggerHaptic(50);
    const code = (inputRoomCode.value || '').trim().toUpperCase();
    const name = (inputPlayerName.value || '').trim();

    if (!code || code.length !== 4) {
      showError('El código de sala debe tener exactamente 4 letras.');
      return;
    }
    if (!name || name.length < 2) {
      showError('Ingresa un apodo de al menos 2 caracteres.');
      return;
    }

    hideError();
    btnJoinRoom.setAttribute('disabled', 'true');
    btnJoinRoom.textContent = 'Entrando...';

    // Device token scoped per room and player name for robust reconnection
    const tokenKey = `party_device_token_${code}_${name.toLowerCase()}`;
    let deviceToken = localStorage.getItem(tokenKey);
    if (!deviceToken) {
      deviceToken = 'dev_' + Math.random().toString(36).substring(2, 12);
      localStorage.setItem(tokenKey, deviceToken);
    }

    socket.emit('player:join', { 
      roomCode: code, 
      playerName: name,
      avatar: selectedAvatar,
      deviceToken
    }, (response) => {
      btnJoinRoom.removeAttribute('disabled');
      btnJoinRoom.textContent = '🚀 ¡Entrar a Jugar!';

      if (response && response.success) {
        currentRoomCode = response.roomCode;
        myPlayer = response.player;
        onJoinedSuccess(response);
      } else {
        showError(response?.error || 'No se pudo conectar a la sala.');
      }
    });
  }

  function showError(msg) {
    if (joinErrorMsg) {
      joinErrorMsg.textContent = msg;
      joinErrorMsg.style.display = 'block';
    }
  }

  function hideError() {
    if (joinErrorMsg) {
      joinErrorMsg.style.display = 'none';
    }
  }

  function onJoinedSuccess(data) {
    triggerHaptic([60, 40, 60]);

    // Update Header
    if (playerRoomDisplay) playerRoomDisplay.textContent = currentRoomCode;
    if (headerAvatar) headerAvatar.textContent = myPlayer.avatar?.emoji || '👤';
    if (headerName) headerName.textContent = myPlayer.name;
    if (playerScoreDisplay) playerScoreDisplay.textContent = `${myPlayer.score || 0} PTS`;

    if (playerProfileBadge) playerProfileBadge.style.display = 'flex';
    if (playerScoreDisplay) playerScoreDisplay.style.display = 'block';
    if (playerReactionsBar) playerReactionsBar.style.display = 'flex';

    if (waitAvatarIcon) waitAvatarIcon.textContent = myPlayer.avatar?.emoji || '🦊';
    if (waitPlayerGreeting) waitPlayerGreeting.textContent = `¡Estás dentro, ${myPlayer.name}!`;

    if (data.privateState) {
      handlePrivateState(data.privateState);
    } else {
      showScreen(screenLobbyWait);
    }
  }

  // =========================================================================
  // PRIVATE STATE SYNCHRONIZATION
  // =========================================================================
  let currentActiveDuelId = null;

  socket.on('player:timer_tick', (data) => {
    if (data?.timer !== undefined) {
      if (playerTimerAnswering) playerTimerAnswering.textContent = `${data.timer}s`;
      if (impostorMobileTimer) impostorMobileTimer.textContent = `${data.timer}s`;
      if (dilemmaMobileTimer) dilemmaMobileTimer.textContent = `${data.timer}s`;
      const triviaT = document.getElementById('triviaMobileTimer');
      if (triviaT) triviaT.textContent = `${data.timer}s`;
      const telT = document.getElementById('telepatiaMobileTimer');
      if (telT) telT.textContent = `${data.timer}s`;
    }
  });

  socket.on('player:state_update', (privateState) => {
    handlePrivateState(privateState);
  });

  socket.on('player:joined_success', (data) => {
    if (!myPlayer) {
      myPlayer = data.player;
      currentRoomCode = data.roomCode;
      onJoinedSuccess(data);
    }
  });

  socket.on('player:join_error', (data) => {
    showError(data?.error || 'Error al unirse.');
  });

  function handlePrivateState(state) {
    if (!state) return;

    if (state.me) {
      myPlayer = state.me;
      if (playerScoreDisplay) {
        playerScoreDisplay.textContent = `${myPlayer.score || 0} PTS`;
      }
    }

    if (state.status === 'LOBBY') {
      currentActiveDuelId = null;
      if (mobileCtaBanner) mobileCtaBanner.style.display = 'none';
      showScreen(screenLobbyWait);
      return;
    }

    // Update Contextual CTA banner on mobile
    if (state.status === 'IN_GAME' && state.game?.cta && mobileCtaBanner) {
      mobileCtaBanner.style.display = 'block';
      if (ctaHeadline) ctaHeadline.textContent = state.game.cta.headline || '📱 ANFITRIÓN DE FIESTAS';
      if (ctaBadge) ctaBadge.textContent = state.game.cta.badge || 'ACCIÓN REQUERIDA';
      if (ctaInstruction) ctaInstruction.textContent = state.game.cta.instruction || 'Sigue las instrucciones';
      if (ctaSubtext) ctaSubtext.textContent = state.game.cta.subtext || '';
    } else if (mobileCtaBanner) {
      mobileCtaBanner.style.display = 'none';
    }

    if (state.status === 'IN_GAME' && state.game) {
      if (state.game.phase === 'PODIUM') {
        currentActiveDuelId = null;
        if (mobileCtaBanner) mobileCtaBanner.style.display = 'none';
        handlePodiumPhase(state.game);
      } else {
        handleGamePhase(state.game);
      }
      runAutoBotLogic(state.game);
    } else if ((state.status === 'FINISHED' || state.status === 'PODIUM' || state.game?.phase === 'PODIUM') && state.game) {
      currentActiveDuelId = null;
      if (mobileCtaBanner) mobileCtaBanner.style.display = 'none';
      handlePodiumPhase(state.game);
    }
  }

  // =========================================================================
  // GAME STUDIO AUTONOMOUS BOT AGENT (FOR ARENA / MULTI-SCREEN DEMO)
  // =========================================================================
  const isAutoBot = new URLSearchParams(window.location.search).get('bot') === '1';
  let botAnsweredRound = null;
  let botVotedDuelId = null;
  let botSubmittedClueRound = null;
  let botVotedImpostorRound = null;
  let botChosenDilemmaRound = null;

  function runAutoBotLogic(game) {
    if (!isAutoBot || !game) return;
    const currentRound = game.currentRound || 1;

    // 1. Duelo de Ocurrencias
    if (game.gameId === 'duelo-ocurrencias') {
      if (game.phase === 'ANSWERING' && game.prompts && botAnsweredRound !== currentRound) {
        botAnsweredRound = currentRound;
        setTimeout(() => {
          const simAnswers = [
            'Llegar tarde y decir que había ovnis en la carretera.',
            'Cantar reggaetón en un funeral sin darse cuenta.',
            'Pedirle prestado dinero al árbitro del partido.',
            'Usar calcetines con sandalias en una boda elegante.',
            'Llevar a tu mamá como copiloto en una cita a ciegas.'
          ];
          const answers = {};
          game.prompts.forEach((p, idx) => {
            answers[p.duelId] = simAnswers[(idx + Math.floor(Math.random() * simAnswers.length)) % simAnswers.length];
          });
          if (playerAnswerInput) playerAnswerInput.value = answers[game.prompts[0]?.duelId] || 'Ocurrencia veloz';
          socket.emit('player:submit_answers', { answers }, (res) => {
            if (res && res.success) showScreen(screenAnswerSubmitted);
          });
        }, 1200 + Math.random() * 1500);
      } else if (game.phase === 'VOTING' && game.options && botVotedDuelId !== game.duelId && !game.isDuelist) {
        botVotedDuelId = game.duelId;
        setTimeout(() => {
          const choice = Math.random() > 0.5 ? 'A' : 'B';
          submitMyVote(game.duelId, choice);
        }, 1000 + Math.random() * 1500);
      }
    }

    // 2. Impostor de Silicio
    if (game.gameId === 'impostor-silicio') {
      const isCluePhase = (game.phase === 'CLUES_1' || game.phase === 'CLUES_2' || game.phase === 'CLUES');
      const clueKey = `${currentRound}_${game.phase}`;
      if (isCluePhase && !game.hasSubmittedClue && botSubmittedClueRound !== clueKey) {
        botSubmittedClueRound = clueKey;
        const myClues = game.isImpostor 
          ? ['Interesante', 'Noche', 'Fresco', 'Enigma', 'Peligro', 'Intenso']
          : ['Directo', 'Clásico', 'Familiar', 'Natural', 'Puro', 'Brillante'];
        const clue = myClues[Math.floor(Math.random() * myClues.length)];
        setTimeout(() => {
          if (inputImpostorClue) inputImpostorClue.value = clue;
          socket.emit('player:submit_clue', { clue });
          if (impostorClueForm) impostorClueForm.style.display = 'none';
          if (impostorStatusFeedback) {
            impostorStatusFeedback.style.display = 'block';
            impostorStatusFeedback.textContent = `✓ Pista enviada: "${clue}". Esperando...`;
          }
        }, 1000 + Math.random() * 1500);
      } else if (game.phase === 'VOTING' && !game.hasVoted && botVotedImpostorRound !== currentRound) {
        botVotedImpostorRound = currentRound;
        const candidates = game.candidates || [];
        if (candidates.length > 0) {
          const pick = candidates[Math.floor(Math.random() * candidates.length)];
          setTimeout(() => {
            socket.emit('player:submit_impostor_vote', { suspectId: pick.id });
            if (impostorStatusFeedback) {
              impostorStatusFeedback.style.display = 'block';
              impostorStatusFeedback.textContent = `✓ Votaste por ${pick.name}.`;
            }
          }, 1200 + Math.random() * 1800);
        }
      } else if (game.phase === 'ESCAPE' && game.isImpostor && game.escapeOptions?.length > 0) {
        const guess = game.escapeOptions[Math.floor(Math.random() * game.escapeOptions.length)];
        setTimeout(() => {
          socket.emit('player:submit_impostor_guess', { guess });
        }, 1200);
      }
    }

    // 3. Dilemas Extremos
    if (game.gameId === 'dilemas-extremos') {
      if (game.phase === 'CHOICE' && !game.hasChosen && botChosenDilemmaRound !== currentRound) {
        botChosenDilemmaRound = currentRound;
        setTimeout(() => {
          const c = Math.random() > 0.5 ? 'A' : 'B';
          const p = Math.random() > 0.5 ? 'A' : 'B';
          selectedDilemmaChoice = c;
          selectedDilemmaPrediction = p;
          socket.emit('player:choose_dilemma', { choice: c, prediction: p });
          if (dilemmaConfirmedMsg) dilemmaConfirmedMsg.style.display = 'block';
        }, 1000 + Math.random() * 1600);
      }
    }

    // 4. Bomba de Palabras
    if (game.gameId === 'bomba-palabras' && game.isMyTurn) {
      setTimeout(() => {
        const pool = ['CARRITO', 'CARMEN', 'CARBON', 'MENTALMENTE', 'PATRON', 'JABON', 'PREMIO', 'COMPLETO', 'CRINGE', 'FRESCO', 'BRISA'];
        const word = pool[Math.floor(Math.random() * pool.length)];
        socket.emit('player:submit_bomba_word', { word });
      }, 900 + Math.random() * 900);
    }

    // 5. Falso Sabio
    if (game.gameId === 'falso-sabio') {
      if (game.phase === 'LIE_WRITING' && !game.hasSubmittedLie) {
        setTimeout(() => {
          const funnyLies = [
            'Haber perdido los pantalones en la curva final',
            'Cantar reggaetón al oído de su caballo',
            'Quedarse completamente dormido sobre la silla',
            'Competir montado en una llama disfrazada',
            'Haber olvidado ponerse los zapatos reglamentarios'
          ];
          const lie = funnyLies[Math.floor(Math.random() * funnyLies.length)];
          socket.emit('player:submit_falso_lie', { lie });
        }, 1200 + Math.random() * 1500);
      } else if (game.phase === 'TRUTH_VOTING' && !game.hasVoted && game.choices && game.choices.length > 0) {
        setTimeout(() => {
          const pick = game.choices[Math.floor(Math.random() * game.choices.length)];
          if (pick) socket.emit('player:submit_falso_vote', { choice: pick.text });
        }, 1200 + Math.random() * 1400);
      }
    }

    // 6. Trivia Caótica
    if (game.gameId === 'trivia-caotica') {
      if (game.phase === 'QUESTION' && !game.hasAnswered) {
        setTimeout(() => {
          const randomChoice = Math.floor(Math.random() * 4);
          socket.emit('player:submit_trivia_answer', { choiceIndex: randomChoice });
        }, 1200 + Math.random() * 2000);
      }
    }

    // 7. Telepatía de Fiesta
    if (game.gameId === 'telepatia-fiesta') {
      if (game.phase === 'SPECTRUM' && !game.hasSubmitted) {
        setTimeout(() => {
          const randomVal = Math.floor(Math.random() * 101);
          socket.emit('player:submit_telepatia_value', { value: randomVal });
        }, 1200 + Math.random() * 2200);
      }
    }
  }

  function handleGamePhase(game) {
    if (game.phase === 'HOW_TO_PLAY') {
      currentActiveDuelId = null;
      showScreen(screenHowToPlay);
      return;
    }

    if (game.gameId === 'impostor-silicio') {
      currentActiveDuelId = null;
      handleImpostorPhase(game);
      return;
    }

    if (game.gameId === 'dilemas-extremos') {
      currentActiveDuelId = null;
      handleDilemmasPhase(game);
      return;
    }

    if (game.gameId === 'bomba-palabras') {
      currentActiveDuelId = null;
      handleBombaPhase(game);
      return;
    }

    if (game.gameId === 'falso-sabio') {
      currentActiveDuelId = null;
      handleFalsoSabioPhase(game);
      return;
    }

    if (game.gameId === 'trivia-caotica') {
      currentActiveDuelId = null;
      handleTriviaPhase(game);
      return;
    }

    if (game.gameId === 'telepatia-fiesta') {
      currentActiveDuelId = null;
      handleTelepatiaPhase(game);
      return;
    }

    switch (game.phase) {
      case 'INTRO':
        currentActiveDuelId = null;
        showScreen(screenGameIntro);
        break;
      case 'ANSWERING':
        handleAnsweringPhase(game);
        break;
      case 'VOTING':
        currentActiveDuelId = null;
        handleVotingPhase(game);
        break;
      case 'AI_JUDGING':
        currentActiveDuelId = null;
        showScreen(screenAiJudging);
        break;
      case 'ROUND_RESULTS':
        currentActiveDuelId = null;
        handleRoundResults(game);
        break;
      case 'PODIUM':
        currentActiveDuelId = null;
        handlePodiumPhase(game);
        break;
      default:
        console.log('[Play] Unhandled phase:', game.phase);
    }
  }

  // =========================================================================
  // EL IMPOSTOR DE SILICIO (MOBILE CONTROLLER)
  // =========================================================================
  function handleImpostorPhase(game) {
    if (game.phase === 'RESULTS') {
      showScreen(screenRoundScores);
      return;
    }
    if (game.phase === 'PODIUM') {
      handlePodiumPhase(game);
      return;
    }

    showScreen(screenImpostor);

    if (impostorMobileTimer && game.timer !== undefined) {
      impostorMobileTimer.textContent = `${game.timer}s`;
    }

    if (impostorMobileCategory) {
      impostorMobileCategory.textContent = game.category || 'Misterio';
    }

    // Role setup
    if (game.isImpostor) {
      if (impostorRoleBadge) {
        impostorRoleBadge.textContent = '¡ERES EL IMPOSTOR! 😈';
        impostorRoleBadge.style.color = 'var(--neon-magenta)';
        impostorRoleBadge.style.borderColor = 'var(--neon-magenta)';
        impostorRoleBadge.style.background = 'rgba(255, 42, 133, 0.15)';
      }
      if (impostorWarningBox) {
        impostorWarningBox.style.display = 'block';
        if (impostorHintText) {
          impostorHintText.textContent = game.hint || 'Observa las pistas de los demás';
        }
      }
      if (impostorSecretWordBox) impostorSecretWordBox.style.display = 'none';
    } else {
      if (impostorRoleBadge) {
        impostorRoleBadge.textContent = 'INOCENTE 😇';
        impostorRoleBadge.style.color = 'var(--neon-cyan)';
        impostorRoleBadge.style.borderColor = 'var(--neon-cyan)';
        impostorRoleBadge.style.background = 'rgba(0, 240, 255, 0.15)';
      }
      if (impostorWarningBox) impostorWarningBox.style.display = 'none';
      if (impostorSecretWordBox) {
        impostorSecretWordBox.style.display = 'block';
        if (impostorSecretWordText) impostorSecretWordText.textContent = game.secretWord || '???';
      }
    }

    // Ensure info card is visible for clue/intro phases
    const impostorInfoCard = document.getElementById('impostorInfoCard');
    if (impostorInfoCard && game.phase !== 'VOTING' && game.phase !== 'RESOLUTION') {
      impostorInfoCard.style.display = 'block';
    }

    // Reset rendered keys on non-voting phases
    if (game.phase !== 'VOTING' && impostorCandidatesList) {
      impostorCandidatesList.dataset.renderedKey = '';
    }

    // Phase views
    if (game.phase === 'INTRO') {
      if (impostorClueForm) impostorClueForm.style.display = 'none';
      if (impostorVotingSection) impostorVotingSection.style.display = 'none';
      if (impostorEscapeSection) impostorEscapeSection.style.display = 'none';
      if (impostorMobileResolutionBox) impostorMobileResolutionBox.style.display = 'none';
      if (impostorStatusFeedback) {
        impostorStatusFeedback.style.display = 'block';
        impostorStatusFeedback.textContent = '⏳ Memoriza tu rol en silencio...';
      }
    } else if (game.phase === 'CLUES_1' || game.phase === 'CLUES_2' || game.phase === 'CLUES') {
      if (impostorVotingSection) impostorVotingSection.style.display = 'none';
      if (impostorEscapeSection) impostorEscapeSection.style.display = 'none';
      if (impostorMobileResolutionBox) impostorMobileResolutionBox.style.display = 'none';

      const isSecondClue = (game.phase === 'CLUES_2');
      const clueLabel = document.querySelector('label[for="inputImpostorClue"]');
      if (clueLabel) {
        clueLabel.textContent = isSecondClue ? 'Tu 2ª Pista (1-2 palabras)' : 'Tu 1ª Pista (1-2 palabras)';
      }
      if (inputImpostorClue) {
        inputImpostorClue.placeholder = isSecondClue ? 'Ej: Peligro' : 'Ej: Aleta';
      }

      if (game.hasSubmittedClue) {
        if (impostorClueForm) impostorClueForm.style.display = 'none';
        if (impostorStatusFeedback) {
          impostorStatusFeedback.style.display = 'block';
          impostorStatusFeedback.textContent = `✓ Pista enviada: "${game.myClue || ''}". Esperando a los demás...`;
        }
      } else {
        if (impostorClueForm) impostorClueForm.style.display = 'flex';
        if (impostorStatusFeedback) impostorStatusFeedback.style.display = 'none';
      }
    } else if (game.phase === 'CLUES_REVEAL_1') {
      if (impostorClueForm) impostorClueForm.style.display = 'none';
      if (impostorVotingSection) impostorVotingSection.style.display = 'none';
      if (impostorEscapeSection) impostorEscapeSection.style.display = 'none';
      if (impostorMobileResolutionBox) impostorMobileResolutionBox.style.display = 'none';
      if (impostorStatusFeedback) {
        impostorStatusFeedback.style.display = 'block';
        impostorStatusFeedback.textContent = '👀 ¡Primeras pistas proyectadas en TV! Analízalas bien...';
      }
    } else if (game.phase === 'DEBATE') {
      if (impostorClueForm) impostorClueForm.style.display = 'none';
      if (impostorVotingSection) impostorVotingSection.style.display = 'none';
      if (impostorEscapeSection) impostorEscapeSection.style.display = 'none';
      if (impostorMobileResolutionBox) impostorMobileResolutionBox.style.display = 'none';
      if (impostorStatusFeedback) {
        impostorStatusFeedback.style.display = 'block';
        impostorStatusFeedback.textContent = '🗣️ ¡Debatan en el salón! ¿Quién dio la pista más extraña?';
      }
    } else if (game.phase === 'VOTING') {
      if (impostorClueForm) impostorClueForm.style.display = 'none';
      if (impostorEscapeSection) impostorEscapeSection.style.display = 'none';
      if (impostorMobileResolutionBox) impostorMobileResolutionBox.style.display = 'none';
      // During voting, hide category & secret word card so suspect voting buttons have 100% focus and zero scrolling
      if (impostorSecretWordBox) impostorSecretWordBox.style.display = 'none';
      if (impostorWarningBox) impostorWarningBox.style.display = 'none';
      if (impostorInfoCard) impostorInfoCard.style.display = 'none';

      if (game.hasVoted) {
        if (impostorVotingSection) impostorVotingSection.style.display = 'none';
        if (impostorStatusFeedback) {
          impostorStatusFeedback.style.display = 'block';
          impostorStatusFeedback.textContent = '✓ Voto guardado. Mira la TV para la revelación.';
        }
      } else {
        if (impostorStatusFeedback) impostorStatusFeedback.style.display = 'none';
        if (impostorVotingSection) {
          impostorVotingSection.style.display = 'flex';
          if (impostorCandidatesList) {
            const candidates = game.candidates || [];
            const candidateKey = candidates.map(c => `${c.id}_${c.name}_${c.clue}`).join('|');

            // Always render if empty or key changed
            const needsRebuild = (impostorCandidatesList.dataset.renderedKey !== candidateKey) || (impostorCandidatesList.children.length === 0);
            if (needsRebuild) {
              impostorCandidatesList.dataset.renderedKey = candidateKey;
              impostorCandidatesList.innerHTML = '';
              if (candidates.length === 0) {
                impostorCandidatesList.innerHTML = `
                  <div style="color: var(--neon-yellow); text-align: center; padding: 14px; background: rgba(255,255,255,0.05); border-radius: var(--radius-sm); font-size: 0.95rem;">
                    No hay otros sospechosos activos en la sala. Espera a la revelación en la TV.
                  </div>
                `;
              } else {
                candidates.forEach(candidate => {
                  const btn = document.createElement('button');
                  btn.type = 'button';
                  btn.className = 'btn mobile-suspect-btn';
                  btn.style.width = '100%';
                  btn.style.minHeight = '64px';

                  const avatarStr = getAvatarEmoji(candidate.avatar);
                  btn.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <span style="font-size: 1.8rem;">${avatarStr}</span>
                      <span style="font-size: 1.25rem; font-weight: 800; color: #fff; font-family: var(--font-display);">${escapeHtml(candidate.name)}</span>
                    </div>
                    <span style="font-size: 0.9rem; font-weight: 800; color: #ffd600; background: rgba(0,0,0,0.5); border: 1px solid var(--neon-yellow); padding: 6px 14px; border-radius: var(--radius-pill); max-width: 55%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      "${escapeHtml(candidate.clue || 'Sin pista')}"
                    </span>
                  `;
                  btn.addEventListener('click', () => {
                    triggerHaptic(50);
                    // Lock all candidates immediately so no double-clicking
                    Array.from(impostorCandidatesList.children).forEach(c => {
                      c.style.opacity = '0.5';
                      c.style.pointerEvents = 'none';
                    });
                    btn.style.opacity = '1';
                    btn.classList.add('selected');
                    socket.emit('player:submit_impostor_vote', { suspectId: candidate.id });
                    if (impostorStatusFeedback) {
                      impostorStatusFeedback.style.display = 'block';
                      impostorStatusFeedback.textContent = `✓ Votaste por ${candidate.name}. ¡Mira la pantalla grande!`;
                    }
                  });
                  impostorCandidatesList.appendChild(btn);
                });
              }
            }
          }
        }
      }
    } else if (game.phase === 'ROUND_SUSPICION') {
      if (impostorClueForm) impostorClueForm.style.display = 'none';
      if (impostorVotingSection) impostorVotingSection.style.display = 'none';
      if (impostorEscapeSection) impostorEscapeSection.style.display = 'none';
      if (impostorMobileResolutionBox) impostorMobileResolutionBox.style.display = 'none';
      if (impostorInfoCard) impostorInfoCard.style.display = 'block';
      if (impostorStatusFeedback) {
        impostorStatusFeedback.style.display = 'block';
        impostorStatusFeedback.innerHTML = `
          <div style="font-size:1.15rem;font-weight:900;color:var(--neon-cyan);font-family:var(--font-display);">📊 ¡Ronda ${game.currentRound} Finalizada!</div>
          <div style="margin-top:6px;font-size:0.95rem;color:#fff;line-height:1.4;">Tus sospechas han quedado registradas en el expediente. Nadie es expulsado... ¡El infiltrado sigue suelto!</div>
        `;
      }
    } else if (game.phase === 'RESOLUTION') {
      if (impostorClueForm) impostorClueForm.style.display = 'none';
      if (impostorVotingSection) impostorVotingSection.style.display = 'none';
      if (impostorEscapeSection) impostorEscapeSection.style.display = 'none';
      if (impostorSecretWordBox) impostorSecretWordBox.style.display = 'none';
      if (impostorWarningBox) impostorWarningBox.style.display = 'none';
      if (impostorStatusFeedback) impostorStatusFeedback.style.display = 'none';

      if (impostorMobileResolutionBox) {
        impostorMobileResolutionBox.style.display = 'flex';
        const res = game.resolution;
        if (res) {
          if (impostorMobileResolutionTitle) {
            impostorMobileResolutionTitle.textContent = res.wasImpostorCaught ? '¡Atraparon al Impostor! 🚨' : '¡El Impostor los Engañó! 😈';
            impostorMobileResolutionTitle.style.color = res.wasImpostorCaught ? 'var(--neon-green)' : 'var(--neon-magenta)';
          }
          if (impostorMobileVotedOut) {
            impostorMobileVotedOut.textContent = `${getAvatarEmoji(res.votedOutAvatar)} ${res.votedOutName || 'Nadie'}`;
          }
          if (impostorMobileFinalWord) {
            impostorMobileFinalWord.textContent = res.secretWord || '???';
          }
          if (impostorMobileRealImpostorName) {
            impostorMobileRealImpostorName.textContent = `Verdadero impostor: ${getAvatarEmoji(res.realImpostorAvatar, '😈')} ${res.realImpostorName || 'El Infiltrado'}`;
          }
        }
      }
    } else if (game.phase === 'ESCAPE') {
      if (impostorClueForm) impostorClueForm.style.display = 'none';
      if (impostorVotingSection) impostorVotingSection.style.display = 'none';
      if (impostorMobileResolutionBox) impostorMobileResolutionBox.style.display = 'none';

      if (game.isImpostor) {
        if (impostorStatusFeedback) impostorStatusFeedback.style.display = 'none';
        if (impostorEscapeSection) {
          impostorEscapeSection.style.display = 'flex';
          if (impostorEscapeButtons) {
            impostorEscapeButtons.innerHTML = '';
            (game.escapeOptions || []).forEach(choice => {
              const btn = document.createElement('button');
              btn.type = 'button';
              btn.className = 'btn btn-magenta btn-lg';
              btn.style.padding = '14px';
              btn.style.fontSize = '1.05rem';
              btn.textContent = choice;
              btn.addEventListener('click', () => {
                triggerHaptic(60);
                socket.emit('player:submit_impostor_guess', { guess: choice });
                btn.style.borderColor = '#ffffff';
                if (impostorStatusFeedback) {
                  impostorStatusFeedback.style.display = 'block';
                  impostorStatusFeedback.textContent = `Adivinaste: ${choice}. ¡Mira la TV!`;
                }
              });
              impostorEscapeButtons.appendChild(btn);
            });
          }
        }
      } else {
        if (impostorEscapeSection) impostorEscapeSection.style.display = 'none';
        if (impostorStatusFeedback) {
          impostorStatusFeedback.style.display = 'block';
          impostorStatusFeedback.textContent = '🕵️ ¡El sospechoso tiene 12 segundos para intentar adivinar la palabra!';
        }
      }
    }
  }

  // =========================================================================
  // DILEMAS EXTREMOS (MOBILE CONTROLLER)
  // =========================================================================
  function handleDilemmasPhase(game) {
    if (game.phase === 'RESULTS') {
      showScreen(screenRoundScores);
      return;
    }
    if (game.phase === 'PODIUM') {
      handlePodiumPhase(game);
      return;
    }

    showScreen(screenDilemma);

    if (dilemmaMobileTimer && game.timer !== undefined) {
      dilemmaMobileTimer.textContent = `${game.timer}s`;
    }

    if (dilemmaMobileQuestion && game.dilemma) {
      dilemmaMobileQuestion.textContent = `"${game.dilemma.question}"`;
    }

    if (dilemmaChoiceTextA && game.dilemma) {
      dilemmaChoiceTextA.textContent = game.dilemma.optionA;
    }
    if (dilemmaChoiceTextB && game.dilemma) {
      dilemmaChoiceTextB.textContent = game.dilemma.optionB;
    }

    if (game.hasChosen) {
      if (dilemmaConfirmedMsg) dilemmaConfirmedMsg.style.display = 'block';
    } else {
      if (dilemmaConfirmedMsg) dilemmaConfirmedMsg.style.display = 'none';
    }
  }

  // =========================================================================
  // BOMBA DE PALABRAS (MOBILE CONTROLLER)
  // =========================================================================
  function handleBombaPhase(game) {
    if (game.phase === 'RESULTS') {
      showScreen(screenRoundScores);
      return;
    }
    if (game.phase === 'PODIUM') {
      handlePodiumPhase(game);
      return;
    }

    showScreen(screenBomba);

    const roleBadge = document.getElementById('bombaMobileRoleBadge');
    const timerEl = document.getElementById('bombaMobileTimer');
    const promptEl = document.getElementById('bombaMobilePrompt');
    const formEl = document.getElementById('bombaInputForm');
    const spectatorEl = document.getElementById('bombaSpectatorMsg');
    const holderNameEl = document.getElementById('bombaCurrentHolder');

    if (timerEl) timerEl.textContent = `${Math.max(0, game.timer || 0)}s`;
    if (promptEl) promptEl.textContent = game.prompt || 'Escribe una palabra válida';

    const isMyTurn = (game.isMyTurn === true);

    if (isMyTurn) {
      if (roleBadge) {
        roleBadge.textContent = '💣 ¡TIENES LA BOMBA! ESCRIBE:';
        roleBadge.style.color = '#ff0055';
        roleBadge.style.background = 'rgba(255, 0, 85, 0.2)';
        roleBadge.style.borderColor = '#ff0055';
      }
      if (formEl) formEl.style.display = 'flex';
      if (spectatorEl) spectatorEl.style.display = 'none';
      const inputEl = document.getElementById('inputBombaWord');
      if (inputEl && document.activeElement !== inputEl) {
        inputEl.focus();
      }
    } else {
      if (roleBadge) {
        roleBadge.textContent = '🛡️ A SALVO POR AHORA';
        roleBadge.style.color = 'var(--neon-cyan)';
        roleBadge.style.background = 'rgba(0, 240, 255, 0.15)';
        roleBadge.style.borderColor = 'var(--neon-cyan)';
      }
      if (formEl) formEl.style.display = 'none';
      if (spectatorEl) {
        spectatorEl.style.display = 'block';
        if (holderNameEl) holderNameEl.textContent = game.activePlayerName || 'otro jugador';
      }
    }
  }

  // =========================================================================
  // FALSO SABIO (MOBILE CONTROLLER)
  // =========================================================================
  function handleFalsoSabioPhase(game) {
    if (game.phase === 'RESULTS') {
      showScreen(screenRoundScores);
      return;
    }
    if (game.phase === 'PODIUM') {
      handlePodiumPhase(game);
      return;
    }

    showScreen(screenFalsoSabio);

    const timerEl = document.getElementById('falsoMobileTimer');
    const questionEl = document.getElementById('falsoMobileQuestion');
    const lieForm = document.getElementById('falsoLieForm');
    const votingSection = document.getElementById('falsoVotingSection');
    const choicesList = document.getElementById('falsoChoicesList');
    const feedbackEl = document.getElementById('falsoFeedback');

    if (timerEl) timerEl.textContent = `${Math.max(0, game.timer || 0)}s`;
    if (questionEl) questionEl.textContent = game.question || 'Pregunta...';

    if (game.phase === 'LIE_WRITING') {
      if (votingSection) votingSection.style.display = 'none';
      if (game.hasSubmittedLie) {
        if (lieForm) lieForm.style.display = 'none';
        if (feedbackEl) {
          feedbackEl.style.display = 'block';
          feedbackEl.textContent = `✓ Farol enviado: "${game.myLie}". Esperando al resto...`;
        }
      } else {
        if (lieForm) lieForm.style.display = 'flex';
        if (feedbackEl) feedbackEl.style.display = 'none';
      }
    } else if (game.phase === 'TRUTH_VOTING') {
      if (lieForm) lieForm.style.display = 'none';
      if (game.hasVoted) {
        if (votingSection) votingSection.style.display = 'none';
        if (feedbackEl) {
          feedbackEl.style.display = 'block';
          feedbackEl.textContent = `✓ Voto registrado: "${game.myVote}". Mira la TV...`;
        }
      } else {
        if (feedbackEl) feedbackEl.style.display = 'none';
        if (votingSection) {
          votingSection.style.display = 'flex';
          if (choicesList) {
            const choices = game.choices || [];
            const key = choices.map(c => c.text).join('|');
            if (choicesList.dataset.renderedKey !== key || choicesList.children.length === 0) {
              choicesList.dataset.renderedKey = key;
              choicesList.innerHTML = '';
              choices.forEach(ch => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn btn-outline btn-lg';
                btn.style.width = '100%';
                btn.style.padding = '14px 18px';
                btn.style.fontFamily = 'var(--font-display)';
                btn.style.fontSize = '1.15rem';
                btn.style.fontWeight = '700';
                btn.textContent = ch.text;
                btn.addEventListener('click', () => {
                  triggerHaptic(50);
                  socket.emit('player:submit_falso_vote', { choice: ch.text });
                  Array.from(choicesList.children).forEach(b => {
                    b.style.opacity = '0.5';
                    b.style.pointerEvents = 'none';
                  });
                  btn.style.opacity = '1';
                  btn.style.borderColor = 'var(--neon-green)';
                  btn.style.boxShadow = '0 0 20px rgba(0,255,157,0.6)';
                });
                choicesList.appendChild(btn);
              });
            }
          }
        }
      }
    } else if (game.phase === 'REVEAL') {
      if (lieForm) lieForm.style.display = 'none';
      if (votingSection) votingSection.style.display = 'none';
      if (feedbackEl) {
        feedbackEl.style.display = 'block';
        feedbackEl.textContent = '👀 ¡Mira la pantalla grande para ver quién cayó!';
      }
    }
  }

  // =========================================================================
  // TRIVIA CAÓTICA (PLAYER MÓVIL)
  // =========================================================================
  function handleTriviaPhase(game) {
    if (game.phase === 'RESULTS') {
      showScreen(screenRoundScores);
      return;
    }
    if (game.phase === 'PODIUM') {
      handlePodiumPhase(game);
      return;
    }

    showScreen(screenTrivia);

    const timerEl = document.getElementById('triviaMobileTimer');
    const catEl = document.getElementById('triviaMobileCategory');
    const qEl = document.getElementById('triviaMobileQuestion');
    const buttonsContainer = document.getElementById('triviaMobileButtons');
    const feedbackEl = document.getElementById('triviaMobileFeedback');

    if (timerEl) timerEl.textContent = `${Math.max(0, game.timer || 0)}s`;
    if (catEl) catEl.textContent = game.category ? game.category.toUpperCase() : 'TRIVIA';
    if (qEl) qEl.textContent = game.question || '¿Pregunta?';

    const buttons = buttonsContainer ? buttonsContainer.querySelectorAll('.trivia-choice-btn') : [];

    (game.options || []).forEach((opt, idx) => {
      if (buttons[idx]) {
        const textSpan = buttons[idx].querySelector('.trivia-btn-text');
        if (textSpan) textSpan.textContent = opt;
      }
    });

    if (game.phase === 'QUESTION') {
      if (game.hasAnswered) {
        buttons.forEach((btn, idx) => {
          btn.disabled = true;
          if (idx === game.myChoice) {
            btn.style.boxShadow = '0 0 20px #00f0ff';
            btn.style.opacity = '1';
          } else {
            btn.style.opacity = '0.35';
            btn.style.boxShadow = 'none';
          }
        });
        if (feedbackEl) {
          feedbackEl.style.display = 'block';
          feedbackEl.style.color = 'var(--neon-green)';
          feedbackEl.textContent = '✓ ¡Respuesta enviada! Esperando al resto...';
        }
      } else {
        buttons.forEach(btn => {
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.style.boxShadow = 'none';
        });
        if (feedbackEl) feedbackEl.style.display = 'none';
      }
    } else if (game.phase === 'REVEAL') {
      buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === game.correctIndex) {
          btn.style.border = '3px solid var(--neon-green)';
          btn.style.boxShadow = '0 0 25px rgba(0,255,157,0.7)';
          btn.style.opacity = '1';
        } else {
          btn.style.opacity = '0.3';
          btn.style.boxShadow = 'none';
        }
      });
      if (feedbackEl) {
        feedbackEl.style.display = 'block';
        if (game.isCorrect) {
          feedbackEl.style.color = 'var(--neon-green)';
          feedbackEl.innerHTML = `🎉 ¡ACERTASTE! +${game.roundDelta} PTS`;
        } else {
          feedbackEl.style.color = 'var(--neon-magenta)';
          feedbackEl.innerHTML = `❌ ¡FALLASTE! La correcta era la opción ${['A','B','C','D'][game.correctIndex]}`;
        }
      }
    }
  }

  // =========================================================================
  // TELEPATÍA DE FIESTA (PLAYER MÓVIL)
  // =========================================================================
  function handleTelepatiaPhase(game) {
    if (game.phase === 'RESULTS') {
      showScreen(screenRoundScores);
      return;
    }
    if (game.phase === 'PODIUM') {
      handlePodiumPhase(game);
      return;
    }

    showScreen(screenTelepatia);

    const timerEl = document.getElementById('telepatiaMobileTimer');
    const topicEl = document.getElementById('telepatiaMobileTopic');
    const leftEl = document.getElementById('telepatiaMobileLeft');
    const rightEl = document.getElementById('telepatiaMobileRight');
    const slider = document.getElementById('inputTelepatiaSlider');
    const currentValEl = document.getElementById('telepatiaCurrentVal');
    const btnSubmit = document.getElementById('btnSubmitTelepatia');
    const feedbackEl = document.getElementById('telepatiaMobileFeedback');

    if (timerEl) timerEl.textContent = `${Math.max(0, game.timer || 0)}s`;
    if (topicEl) topicEl.textContent = game.topic || '¿Qué tan aceptable es...?';
    if (leftEl) leftEl.textContent = game.leftLabel || '0% Mínimo';
    if (rightEl) rightEl.textContent = game.rightLabel || '100% Máximo';

    if (slider && !slider.dataset.listenerAttached) {
      slider.dataset.listenerAttached = 'true';
      slider.addEventListener('input', (e) => {
        if (currentValEl) currentValEl.textContent = `${e.target.value}%`;
      });
    }

    if (game.phase === 'SPECTRUM') {
      if (game.hasSubmitted) {
        if (slider) slider.disabled = true;
        if (btnSubmit) btnSubmit.disabled = true;
        if (feedbackEl) {
          feedbackEl.style.display = 'block';
          feedbackEl.textContent = `✓ Sintonizado al ${game.myValue}%. Esperando al resto...`;
        }
      } else {
        if (slider) slider.disabled = false;
        if (btnSubmit) btnSubmit.disabled = false;
        if (feedbackEl) feedbackEl.style.display = 'none';
      }
    } else if (game.phase === 'REVEAL') {
      if (slider) slider.disabled = true;
      if (btnSubmit) btnSubmit.disabled = true;
      if (feedbackEl) {
        feedbackEl.style.display = 'block';
        feedbackEl.textContent = `👀 ¡Mira la pantalla grande para ver el resultado de sintonía!`;
      }
    }
  }

  // =========================================================================
  // PHASE: ANSWERING
  // =========================================================================
  function handleAnsweringPhase(game) {
    if (game.allSubmitted) {
      currentActiveDuelId = null;
      showScreen(screenAnswerSubmitted);
      return;
    }

    assignedPrompts = game.prompts || [];
    if (assignedPrompts.length === 0) {
      currentActiveDuelId = null;
      showScreen(screenAnswerSubmitted);
      return;
    }

    showScreen(screenAnswering);

    // Update timer text without re-rendering inputs
    if (playerTimerAnswering && game.timer !== undefined) {
      playerTimerAnswering.textContent = `${game.timer}s`;
    }

    // Determine which prompt to display
    if (currentPromptIndex >= assignedPrompts.length) {
      currentPromptIndex = 0;
    }

    const currentPrompt = assignedPrompts[currentPromptIndex];
    if (!currentPrompt) return;

    // CRITICAL: Only touch the input and prompt text if we switched to a new prompt!
    if (currentActiveDuelId !== currentPrompt.duelId) {
      currentActiveDuelId = currentPrompt.duelId;

      if (promptIndexBadge) {
        promptIndexBadge.textContent = `PREMISA ${currentPromptIndex + 1} DE ${assignedPrompts.length}`;
      }

      if (playerPromptText) {
        playerPromptText.textContent = `"${currentPrompt.promptText}"`;
      }

      if (playerAnswerInput) {
        const existing = localAnswers[currentPrompt.duelId] || currentPrompt.currentAnswer || '';
        playerAnswerInput.value = existing;
        if (charCount) charCount.textContent = existing.length;
      }
    }
  }

  // Textarea input char counter & immediate local persistence
  if (playerAnswerInput) {
    playerAnswerInput.addEventListener('input', (e) => {
      const text = e.target.value;
      const currentPrompt = assignedPrompts[currentPromptIndex];
      if (currentPrompt) {
        localAnswers[currentPrompt.duelId] = text;
      }
      if (charCount) charCount.textContent = text.length;
    });

    playerAnswerInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (btnSubmitAnswer) btnSubmitAnswer.click();
      }
    });
  }

  // Submit Answer Button
  if (btnSubmitAnswer) {
    btnSubmitAnswer.addEventListener('click', () => {
      triggerHaptic(50);
      const answerText = (playerAnswerInput.value || '').trim();
      const currentPrompt = assignedPrompts[currentPromptIndex];

      if (!answerText) {
        alert('Por favor escribe una ocurrencia antes de enviar.');
        return;
      }

      if (!currentPrompt) return;

      // Save locally
      localAnswers[currentPrompt.duelId] = answerText;

      // If more prompts need answering, advance to next prompt
      if (currentPromptIndex + 1 < assignedPrompts.length) {
        currentPromptIndex++;
        currentActiveDuelId = null; // Forces render of next prompt
        const nextPrompt = assignedPrompts[currentPromptIndex];
        currentActiveDuelId = nextPrompt.duelId;

        if (promptIndexBadge) {
          promptIndexBadge.textContent = `PREMISA ${currentPromptIndex + 1} DE ${assignedPrompts.length}`;
        }
        if (playerPromptText) {
          playerPromptText.textContent = `"${nextPrompt.promptText}"`;
        }
        playerAnswerInput.value = localAnswers[nextPrompt.duelId] || '';
        if (charCount) charCount.textContent = playerAnswerInput.value.length;
        playerAnswerInput.focus();
      } else {
        // All prompts filled, emit to server!
        socket.emit('player:submit_answers', { answers: localAnswers }, (res) => {
          if (res && res.success) {
            triggerHaptic([50, 50, 100]);
            showScreen(screenAnswerSubmitted);
          }
        });
      }
    });
  }

  // =========================================================================
  // PHASE: VOTING
  // =========================================================================
  function handleVotingPhase(game) {
    showScreen(screenVoting);

    if (votePromptHeader) {
      votePromptHeader.textContent = `"${game.promptText || ''}"`;
    }

    // If current player is one of the duelists
    if (game.isDuelist) {
      if (votingButtonsGroup) votingButtonsGroup.style.display = 'none';
      if (duelistSuspenseCard) duelistSuspenseCard.style.display = 'flex';
      if (voteConfirmedBanner) voteConfirmedBanner.style.display = 'none';
      return;
    }

    // If current player is an eligible voter
    if (duelistSuspenseCard) duelistSuspenseCard.style.display = 'none';
    if (votingButtonsGroup) votingButtonsGroup.style.display = 'flex';

    if (game.options) {
      if (voteTextA) voteTextA.textContent = `"${game.options.A}"`;
      if (voteTextB) voteTextB.textContent = `"${game.options.B}"`;
    }

    // Check if player already voted
    hasVotedCurrentDuel = !!game.hasVoted;
    if (hasVotedCurrentDuel) {
      btnVoteA.setAttribute('disabled', 'true');
      btnVoteB.setAttribute('disabled', 'true');
      btnVoteA.classList.toggle('selected', game.myVote === 'A');
      btnVoteB.classList.toggle('selected', game.myVote === 'B');
      if (voteConfirmedBanner) voteConfirmedBanner.style.display = 'block';
    } else {
      btnVoteA.removeAttribute('disabled');
      btnVoteB.removeAttribute('disabled');
      btnVoteA.classList.remove('selected');
      btnVoteB.classList.remove('selected');
      if (voteConfirmedBanner) voteConfirmedBanner.style.display = 'none';
    }

    // Button click listeners
    btnVoteA.onclick = () => submitMyVote(game.duelId, 'A');
    btnVoteB.onclick = () => submitMyVote(game.duelId, 'B');
  }

  function submitMyVote(duelId, choice) {
    if (hasVotedCurrentDuel) return;
    triggerHaptic(70);

    hasVotedCurrentDuel = true;
    btnVoteA.setAttribute('disabled', 'true');
    btnVoteB.setAttribute('disabled', 'true');

    if (choice === 'A') btnVoteA.classList.add('selected');
    if (choice === 'B') btnVoteB.classList.add('selected');

    if (voteConfirmedBanner) voteConfirmedBanner.style.display = 'block';

    socket.emit('player:vote', { duelId, choice }, (res) => {
      console.log('[Play] Vote response:', res);
    });
  }

  // =========================================================================
  // PHASE: ROUND RESULTS
  // =========================================================================
  function handleRoundResults(game) {
    showScreen(screenRoundScores);
    if (playerRoundGainText) {
      if (game.roundDelta > 0) {
        playerRoundGainText.innerHTML = `¡Ganaste <strong style="color: var(--neon-green);">+${game.roundDelta} PTS</strong> en esta ronda!`;
      } else {
        playerRoundGainText.textContent = '¡Sigue intentándolo en la próxima ronda!';
      }
    }
  }

  // =========================================================================
  // PHASE: PODIUM
  // =========================================================================
  function handlePodiumPhase(game) {
    showScreen(screenPodium);
    if (game.isWinner) {
      triggerHaptic([100, 50, 100, 50, 200]);
      if (playerPodiumIcon) playerPodiumIcon.textContent = '👑';
      if (playerPodiumTitle) playerPodiumTitle.textContent = '¡ERES EL CAMPEÓN!';
      if (playerPodiumRank) playerPodiumRank.innerHTML = `Quedaste en <strong>#1 LUGAR</strong> con ${game.totalScore || 0} PTS.`;
    } else {
      if (playerPodiumIcon) playerPodiumIcon.textContent = '🎖️';
      if (playerPodiumTitle) playerPodiumTitle.textContent = '¡Buen Juego!';
      if (playerPodiumRank) playerPodiumRank.innerHTML = `Quedaste en <strong>#${game.rank || '-'} Lugar</strong> con ${game.totalScore || 0} PTS.`;
    }
  }

  // =========================================================================
  // LIVE FLOATING REACTIONS
  // =========================================================================
  document.querySelectorAll('.btn-reaction').forEach(btn => {
    btn.addEventListener('click', () => {
      triggerHaptic(30);
      const emoji = btn.getAttribute('data-emoji') || '🔥';
      socket.emit('player:react', { emoji });
    });
  });

  // Impostor clue submission
  if (btnSubmitClue) {
    btnSubmitClue.addEventListener('click', () => {
      triggerHaptic(50);
      const clue = (inputImpostorClue?.value || '').trim();
      if (!clue) {
        alert('Por favor escribe una pista corta.');
        return;
      }
      socket.emit('player:submit_clue', { clue });
      if (impostorClueForm) impostorClueForm.style.display = 'none';
      if (impostorStatusFeedback) {
        impostorStatusFeedback.style.display = 'block';
        impostorStatusFeedback.textContent = `✓ Pista enviada: "${clue}". Esperando al resto...`;
      }
    });
  }

  if (inputImpostorClue) {
    inputImpostorClue.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (btnSubmitClue) btnSubmitClue.click();
      }
    });
  }

  // Dilemma choice & prediction
  function checkAndSendDilemma() {
    if (selectedDilemmaChoice && selectedDilemmaPrediction) {
      triggerHaptic(60);
      socket.emit('player:choose_dilemma', {
        choice: selectedDilemmaChoice,
        prediction: selectedDilemmaPrediction
      });
      if (dilemmaConfirmedMsg) dilemmaConfirmedMsg.style.display = 'block';
    }
  }

  if (btnDilemmaChoiceA) {
    btnDilemmaChoiceA.addEventListener('click', () => {
      triggerHaptic(40);
      selectedDilemmaChoice = 'A';
      btnDilemmaChoiceA.style.borderColor = '#ffffff';
      btnDilemmaChoiceA.style.boxShadow = '0 0 20px rgba(0,240,255,0.8)';
      btnDilemmaChoiceB.style.borderColor = 'transparent';
      btnDilemmaChoiceB.style.boxShadow = 'none';
      checkAndSendDilemma();
    });
  }

  if (btnDilemmaChoiceB) {
    btnDilemmaChoiceB.addEventListener('click', () => {
      triggerHaptic(40);
      selectedDilemmaChoice = 'B';
      btnDilemmaChoiceB.style.borderColor = '#ffffff';
      btnDilemmaChoiceB.style.boxShadow = '0 0 20px rgba(255,42,133,0.8)';
      btnDilemmaChoiceA.style.borderColor = 'transparent';
      btnDilemmaChoiceA.style.boxShadow = 'none';
      checkAndSendDilemma();
    });
  }

  if (btnPredictA) {
    btnPredictA.addEventListener('click', () => {
      triggerHaptic(40);
      selectedDilemmaPrediction = 'A';
      btnPredictA.style.background = 'var(--neon-yellow)';
      btnPredictA.style.color = '#000';
      btnPredictB.style.background = 'transparent';
      btnPredictB.style.color = '#fff';
      checkAndSendDilemma();
    });
  }

  if (btnPredictB) {
    btnPredictB.addEventListener('click', () => {
      triggerHaptic(40);
      selectedDilemmaPrediction = 'B';
      btnPredictB.style.background = 'var(--neon-yellow)';
      btnPredictB.style.color = '#000';
      btnPredictA.style.background = 'transparent';
      btnPredictA.style.color = '#fff';
      checkAndSendDilemma();
    });
  }

  // Bomba de Palabras Button Listener
  const btnSubmitBombaWord = document.getElementById('btnSubmitBombaWord');
  const inputBombaWord = document.getElementById('inputBombaWord');
  if (btnSubmitBombaWord) {
    btnSubmitBombaWord.addEventListener('click', () => {
      triggerHaptic(50);
      const word = (inputBombaWord?.value || '').trim();
      if (!word) return;
      socket.emit('player:submit_bomba_word', { word }, (res) => {
        if (res && res.success) {
          if (inputBombaWord) inputBombaWord.value = '';
          const fb = document.getElementById('bombaFeedback');
          if (fb) {
            fb.style.display = 'block';
            fb.textContent = `✓ ¡Pasaste la bomba con "${word}"!`;
            setTimeout(() => { fb.style.display = 'none'; }, 2000);
          }
        } else if (res && res.error) {
          alert(res.error);
        }
      });
    });
  }
  if (inputBombaWord) {
    inputBombaWord.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        btnSubmitBombaWord?.click();
      }
    });
  }

  // Falso Sabio Lie Submission Listener
  const btnSubmitFalsoLie = document.getElementById('btnSubmitFalsoLie');
  const inputFalsoLie = document.getElementById('inputFalsoLie');
  if (btnSubmitFalsoLie) {
    btnSubmitFalsoLie.addEventListener('click', () => {
      triggerHaptic(50);
      const lie = (inputFalsoLie?.value || '').trim();
      if (!lie) {
        alert('Por favor inventa un farol creíble.');
        return;
      }
      socket.emit('player:submit_falso_lie', { lie }, (res) => {
        if (res && res.success) {
          const form = document.getElementById('falsoLieForm');
          if (form) form.style.display = 'none';
          const fb = document.getElementById('falsoFeedback');
          if (fb) {
            fb.style.display = 'block';
            fb.textContent = `✓ Farol enviado: "${lie}". Esperando al resto...`;
          }
        }
      });
    });
  }
  if (inputFalsoLie) {
    inputFalsoLie.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        btnSubmitFalsoLie?.click();
      }
    });
  }

  // Trivia Caótica choice buttons
  document.querySelectorAll('.trivia-choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const choiceIndex = parseInt(btn.dataset.choice, 10);
      triggerHaptic(50);
      socket.emit('player:submit_trivia_answer', { choiceIndex });
      const feedback = document.getElementById('triviaMobileFeedback');
      if (feedback) {
        feedback.style.display = 'block';
        feedback.style.color = 'var(--neon-green)';
        feedback.textContent = '✓ ¡Respuesta enviada! Esperando al resto...';
      }
    });
  });

  // Telepatía de Fiesta submit button
  const btnSubmitTelepatia = document.getElementById('btnSubmitTelepatia');
  if (btnSubmitTelepatia) {
    btnSubmitTelepatia.addEventListener('click', () => {
      const slider = document.getElementById('inputTelepatiaSlider');
      const val = parseInt(slider?.value || '50', 10);
      triggerHaptic(50);
      socket.emit('player:submit_telepatia_value', { value: val });
      const feedback = document.getElementById('telepatiaMobileFeedback');
      if (feedback) {
        feedback.style.display = 'block';
        feedback.textContent = `✓ ¡Sintonizado al ${val}%! Mira la TV...`;
      }
    });
  }

  // Start initialization
  initJoinForm();

})();
