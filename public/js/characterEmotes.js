/**
 * CharacterEmoteEngine
 * Procedural & Vector Custom Emoticon Generator for Party Game Avatars.
 * Creates authentic custom stickers/emotes for characters (Ghost, Fox, Octopus, Dino, etc.)
 */
(function() {
  const EMOTE_TYPES = [
    { id: 'happy', label: '¡Feliz / Fiesta!' },
    { id: 'laugh', label: '¡Jajaja / Carcajadas!' },
    { id: 'shock', label: '¡Grito / OMG!' },
    { id: 'fire', label: '¡Hype / En Llamas!' },
    { id: 'sus', label: '¡Sospecha / Ojo!' },
    { id: 'dead', label: '¡KO / Fallecí!' }
  ];

  // Helper to create sticker drop shadow filter
  function getFilterDef(id) {
    return `
      <defs>
        <filter id="${id}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3.5" flood-color="#000" flood-opacity="0.45"/>
        </filter>
      </defs>
    `;
  }

  // =========================================================================
  // 1. GHOST CHARACTER SVG GENERATOR (👻)
  // =========================================================================
  function generateGhostEmote(type, color = '#38bdf8') {
    const fid = `shadow_ghost_${type}`;
    let bodyFill = 'linear-gradient';
    let bodyColorStop = '#cbeafe';
    if (type === 'fire') bodyColorStop = '#fed7aa';
    if (type === 'shock') bodyColorStop = '#bfdbfe';

    let faceMarkup = '';
    let propsMarkup = '';

    if (type === 'happy') {
      faceMarkup = `
        <!-- Eyes -->
        <ellipse cx="40" cy="46" rx="5.5" ry="7.5" fill="#0f172a"/>
        <circle cx="42" cy="43.5" r="2.3" fill="#ffffff"/>
        <ellipse cx="60" cy="46" rx="5.5" ry="7.5" fill="#0f172a"/>
        <circle cx="62" cy="43.5" r="2.3" fill="#ffffff"/>
        <!-- Rosy Cheeks -->
        <ellipse cx="32" cy="53" rx="5" ry="3.5" fill="#ff76a5" opacity="0.8"/>
        <ellipse cx="68" cy="53" rx="5" ry="3.5" fill="#ff76a5" opacity="0.8"/>
        <!-- Big Smile -->
        <path d="M 42 53 Q 50 64 58 53 Z" fill="#ef4444" stroke="#0f172a" stroke-width="2.5"/>
      `;
      propsMarkup = `
        <!-- Party Stars -->
        <path d="M 78 18 L 80 23 L 85 25 L 80 27 L 78 32 L 76 27 L 71 25 L 76 23 Z" fill="#ffd600" stroke="#ca8a04" stroke-width="1"/>
        <path d="M 22 28 L 23 32 L 27 33 L 23 35 L 22 39 L 21 35 L 17 33 L 21 32 Z" fill="#ff007f"/>
      `;
    } else if (type === 'laugh') {
      faceMarkup = `
        <!-- Laughing Eyes ^ ^ -->
        <path d="M 33 47 Q 40 38 47 47" stroke="#0f172a" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <path d="M 53 47 Q 60 38 67 47" stroke="#0f172a" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <!-- Huge Laughing Mouth -->
        <path d="M 38 52 Q 50 72 62 52 Z" fill="#e11d48" stroke="#0f172a" stroke-width="3"/>
        <path d="M 42 61 Q 50 56 58 61 Q 50 70 42 61 Z" fill="#f43f5e"/>
        <!-- Tears of Joy -->
        <path d="M 27 46 C 22 46, 21 53, 26 55 C 30 56, 31 49, 27 46 Z" fill="#00f0ff" stroke="#0284c7" stroke-width="1.5"/>
        <path d="M 73 46 C 78 46, 79 53, 74 55 C 70 56, 69 49, 73 46 Z" fill="#00f0ff" stroke="#0284c7" stroke-width="1.5"/>
      `;
    } else if (type === 'shock') {
      faceMarkup = `
        <!-- Wide O Eyes -->
        <circle cx="41" cy="44" r="7.5" fill="#ffffff" stroke="#0f172a" stroke-width="3.5"/>
        <circle cx="41" cy="44" r="2.8" fill="#0f172a"/>
        <circle cx="59" cy="44" r="7.5" fill="#ffffff" stroke="#0f172a" stroke-width="3.5"/>
        <circle cx="59" cy="44" r="2.8" fill="#0f172a"/>
        <!-- Tall Screaming Mouth -->
        <ellipse cx="50" cy="62" rx="6.5" ry="11" fill="#0f172a" stroke="#0f172a" stroke-width="2"/>
        <!-- Hands on Cheeks -->
        <ellipse cx="28" cy="50" rx="4.5" ry="7" fill="#ffffff" stroke="#0f172a" stroke-width="3"/>
        <ellipse cx="72" cy="50" rx="4.5" ry="7" fill="#ffffff" stroke="#0f172a" stroke-width="3"/>
      `;
      propsMarkup = `
        <!-- Fright Sweat / Lines -->
        <line x1="44" y1="26" x2="44" y2="34" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="50" y1="24" x2="50" y2="33" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="56" y1="26" x2="56" y2="34" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
      `;
    } else if (type === 'fire') {
      faceMarkup = `
        <!-- Angry Fierce Flame Eyes -->
        <path d="M 34 43 L 48 48 L 40 53 Z" fill="#ffd600" stroke="#0f172a" stroke-width="2.5"/>
        <path d="M 66 43 L 52 48 L 60 53 Z" fill="#ffd600" stroke="#0f172a" stroke-width="2.5"/>
        <!-- Sharp Grin -->
        <path d="M 40 56 Q 50 52 60 56 Q 50 66 40 56 Z" fill="#991b1b" stroke="#0f172a" stroke-width="2.5"/>
        <polygon points="45,54 47,59 49,54" fill="#ffffff"/>
        <polygon points="51,54 53,59 55,54" fill="#ffffff"/>
      `;
      propsMarkup = `
        <!-- Fire Aura Behind Head -->
        <path d="M 36 26 Q 44 10 50 18 Q 56 6 64 26 Z" fill="#ff0055" opacity="0.9"/>
        <path d="M 40 26 Q 46 14 50 20 Q 54 12 60 26 Z" fill="#ffcc00"/>
      `;
    } else if (type === 'sus') {
      faceMarkup = `
        <!-- Looking to the side with squint -->
        <ellipse cx="40" cy="46" rx="6.5" ry="4" fill="#ffffff" stroke="#0f172a" stroke-width="2.5"/>
        <circle cx="43" cy="46" r="2.8" fill="#0f172a"/>
        <ellipse cx="60" cy="46" rx="6.5" ry="4" fill="#ffffff" stroke="#0f172a" stroke-width="2.5"/>
        <circle cx="63" cy="46" r="2.8" fill="#0f172a"/>
        <!-- One Raised Eyebrow -->
        <path d="M 33 39 Q 40 33 47 40" stroke="#0f172a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M 53 43 Q 60 41 67 43" stroke="#0f172a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <!-- Smirk -->
        <path d="M 43 57 Q 52 60 58 53" stroke="#0f172a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      `;
      propsMarkup = `
        <!-- Golden Question Mark -->
        <text x="73" y="36" font-family="sans-serif" font-size="24" font-weight="900" fill="#ffd600" stroke="#0f172a" stroke-width="1.5">?</text>
      `;
    } else if (type === 'dead') {
      faceMarkup = `
        <!-- X X Eyes -->
        <line x1="35" y1="42" x2="45" y2="50" stroke="#0f172a" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="45" y1="42" x2="35" y2="50" stroke="#0f172a" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="55" y1="42" x2="65" y2="50" stroke="#0f172a" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="65" y1="42" x2="55" y2="50" stroke="#0f172a" stroke-width="4.5" stroke-linecap="round"/>
        <!-- Wavy Mouth with Tongue Hanging Out -->
        <path d="M 42 56 Q 50 54 58 56" stroke="#0f172a" stroke-width="3" fill="none"/>
        <path d="M 47 56 Q 49 68 53 66 Q 55 62 53 56 Z" fill="#f43f5e" stroke="#0f172a" stroke-width="2"/>
      `;
      propsMarkup = `
        <!-- Golden Halo -->
        <ellipse cx="50" cy="18" rx="18" ry="5.5" fill="none" stroke="#ffd600" stroke-width="4" filter="drop-shadow(0 0 6px #ffd600)"/>
      `;
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="custom-character-emote-svg">
        ${getFilterDef(fid)}
        <defs>
          <linearGradient id="grad_${fid}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="${bodyColorStop}"/>
          </linearGradient>
        </defs>
        ${propsMarkup}
        <!-- Ghost Body -->
        <path d="M 22 52 C 22 24, 78 24, 78 52 C 78 72, 75 88, 68 85 C 62 82, 58 88, 50 85 C 42 82, 38 88, 32 85 C 25 88, 22 72, 22 52 Z" 
              fill="url(#grad_${fid})" stroke="#0f172a" stroke-width="4" stroke-linejoin="round" filter="url(#${fid})"/>
        ${faceMarkup}
      </svg>
    `;
  }

  // =========================================================================
  // 2. FOX CHARACTER SVG GENERATOR (🦊)
  // =========================================================================
  function generateFoxEmote(type) {
    const fid = `shadow_fox_${type}`;
    let faceMarkup = '';
    let propsMarkup = '';

    if (type === 'happy') {
      faceMarkup = `
        <ellipse cx="40" cy="54" rx="4.5" ry="6.5" fill="#0f172a"/><circle cx="41.5" cy="52" r="2" fill="#fff"/>
        <ellipse cx="60" cy="54" rx="4.5" ry="6.5" fill="#0f172a"/><circle cx="61.5" cy="52" r="2" fill="#fff"/>
        <ellipse cx="50" cy="62" rx="4" ry="2.5" fill="#0f172a"/>
        <path d="M 44 65 Q 50 72 56 65" stroke="#0f172a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <circle cx="33" cy="58" r="4" fill="#ff76a5" opacity="0.8"/>
        <circle cx="67" cy="58" r="4" fill="#ff76a5" opacity="0.8"/>
      `;
      propsMarkup = `<text x="73" y="32" font-size="20">✨</text>`;
    } else if (type === 'laugh') {
      faceMarkup = `
        <path d="M 34 54 Q 40 46 46 54" stroke="#0f172a" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M 54 54 Q 60 46 66 54" stroke="#0f172a" stroke-width="4" fill="none" stroke-linecap="round"/>
        <ellipse cx="50" cy="60" rx="3.5" ry="2" fill="#0f172a"/>
        <path d="M 42 63 Q 50 76 58 63 Z" fill="#e11d48" stroke="#0f172a" stroke-width="2.5"/>
      `;
    } else if (type === 'shock') {
      faceMarkup = `
        <circle cx="40" cy="52" r="6.5" fill="#fff" stroke="#0f172a" stroke-width="3"/><circle cx="40" cy="52" r="2.5" fill="#0f172a"/>
        <circle cx="60" cy="52" r="6.5" fill="#fff" stroke="#0f172a" stroke-width="3"/><circle cx="60" cy="52" r="2.5" fill="#0f172a"/>
        <ellipse cx="50" cy="61" rx="3.5" ry="2" fill="#0f172a"/>
        <ellipse cx="50" cy="69" rx="5" ry="8" fill="#0f172a"/>
      `;
    } else if (type === 'fire') {
      faceMarkup = `
        <path d="M 34 51 L 46 55 L 39 59 Z" fill="#ffd600" stroke="#0f172a" stroke-width="2"/>
        <path d="M 66 51 L 54 55 L 61 59 Z" fill="#ffd600" stroke="#0f172a" stroke-width="2"/>
        <ellipse cx="50" cy="61" rx="4" ry="2.5" fill="#0f172a"/>
        <path d="M 43 66 Q 50 62 57 66 Q 50 73 43 66 Z" fill="#991b1b" stroke="#0f172a" stroke-width="2"/>
      `;
      propsMarkup = `<text x="42" y="24" font-size="22">🔥</text>`;
    } else if (type === 'sus') {
      faceMarkup = `
        <ellipse cx="40" cy="54" rx="5" ry="3" fill="#fff" stroke="#0f172a" stroke-width="2.5"/><circle cx="42" cy="54" r="2" fill="#0f172a"/>
        <ellipse cx="60" cy="54" rx="5" ry="3" fill="#fff" stroke="#0f172a" stroke-width="2.5"/><circle cx="62" cy="54" r="2" fill="#0f172a"/>
        <ellipse cx="50" cy="61" rx="3.5" ry="2" fill="#0f172a"/>
        <path d="M 44 65 Q 52 68 56 62" stroke="#0f172a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      `;
      propsMarkup = `<text x="70" y="35" font-size="22">🧐</text>`;
    } else if (type === 'dead') {
      faceMarkup = `
        <line x1="36" y1="50" x2="44" y2="56" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="44" y1="50" x2="36" y2="56" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="56" y1="50" x2="64" y2="56" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="64" y1="50" x2="56" y2="56" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round"/>
        <ellipse cx="50" cy="61" rx="3.5" ry="2" fill="#0f172a"/>
        <path d="M 45 66 Q 50 64 55 66" stroke="#0f172a" stroke-width="2" fill="none"/>
        <path d="M 48 66 Q 50 74 54 72 Z" fill="#f43f5e" stroke="#0f172a" stroke-width="1.5"/>
      `;
      propsMarkup = `<text x="40" y="26" font-size="22">💫</text>`;
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="custom-character-emote-svg">
        ${getFilterDef(fid)}
        ${propsMarkup}
        <!-- Fox Ears -->
        <polygon points="20,18 36,46 16,42" fill="#ea580c" stroke="#0f172a" stroke-width="3.5" stroke-linejoin="round"/>
        <polygon points="23,24 33,42 20,38" fill="#fff"/>
        <polygon points="80,18 64,46 84,42" fill="#ea580c" stroke="#0f172a" stroke-width="3.5" stroke-linejoin="round"/>
        <polygon points="77,24 67,42 80,38" fill="#fff"/>
        <!-- Fox Head -->
        <circle cx="50" cy="56" r="30" fill="#f97316" stroke="#0f172a" stroke-width="4" filter="url(#${fid})"/>
        <!-- White Cheeks / Muzzle -->
        <path d="M 23 58 Q 38 68 50 63 Q 62 68 77 58 Q 72 82 50 82 Q 28 82 23 58 Z" fill="#ffffff" stroke="#0f172a" stroke-width="2.5"/>
        ${faceMarkup}
      </svg>
    `;
  }

  // =========================================================================
  // 3. OCTOPUS CHARACTER SVG GENERATOR (🐙)
  // =========================================================================
  function generateOctopusEmote(type) {
    const fid = `shadow_octo_${type}`;
    let faceMarkup = '';
    let propsMarkup = '';

    if (type === 'happy') {
      faceMarkup = `
        <ellipse cx="40" cy="46" rx="5" ry="7" fill="#0f172a"/><circle cx="42" cy="44" r="2.2" fill="#fff"/>
        <ellipse cx="60" cy="46" rx="5" ry="7" fill="#0f172a"/><circle cx="62" cy="44" r="2.2" fill="#fff"/>
        <circle cx="32" cy="52" r="4.5" fill="#ff76a5" opacity="0.8"/>
        <circle cx="68" cy="52" r="4.5" fill="#ff76a5" opacity="0.8"/>
        <circle cx="50" cy="56" r="5" fill="#e11d48" stroke="#0f172a" stroke-width="2"/>
      `;
      propsMarkup = `<text x="74" y="28" font-size="20">🫧</text>`;
    } else if (type === 'laugh') {
      faceMarkup = `
        <path d="M 33 46 Q 40 38 47 46" stroke="#0f172a" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M 53 46 Q 60 38 67 46" stroke="#0f172a" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M 40 52 Q 50 68 60 52 Z" fill="#e11d48" stroke="#0f172a" stroke-width="2.5"/>
      `;
    } else if (type === 'shock') {
      faceMarkup = `
        <circle cx="40" cy="44" r="7" fill="#fff" stroke="#0f172a" stroke-width="3"/><circle cx="40" cy="44" r="2.5" fill="#0f172a"/>
        <circle cx="60" cy="44" r="7" fill="#fff" stroke="#0f172a" stroke-width="3"/><circle cx="60" cy="44" r="2.5" fill="#0f172a"/>
        <ellipse cx="50" cy="58" rx="6" ry="10" fill="#0f172a"/>
      `;
    } else if (type === 'fire') {
      faceMarkup = `
        <path d="M 35 44 L 46 48 L 40 52 Z" fill="#ffd600" stroke="#0f172a" stroke-width="2"/>
        <path d="M 65 44 L 54 48 L 60 52 Z" fill="#ffd600" stroke="#0f172a" stroke-width="2"/>
        <path d="M 42 56 Q 50 52 58 56 Q 50 64 42 56 Z" fill="#991b1b" stroke="#0f172a" stroke-width="2"/>
      `;
      propsMarkup = `<text x="42" y="20" font-size="22">⚡</text>`;
    } else if (type === 'sus') {
      faceMarkup = `
        <ellipse cx="40" cy="46" rx="6" ry="3.5" fill="#fff" stroke="#0f172a" stroke-width="2.5"/><circle cx="42" cy="46" r="2.2" fill="#0f172a"/>
        <ellipse cx="60" cy="46" rx="6" ry="3.5" fill="#fff" stroke="#0f172a" stroke-width="2.5"/><circle cx="62" cy="46" r="2.2" fill="#0f172a"/>
        <path d="M 44 56 Q 52 58 56 52" stroke="#0f172a" stroke-width="3" fill="none" stroke-linecap="round"/>
      `;
      propsMarkup = `<text x="73" y="32" font-size="20">?</text>`;
    } else if (type === 'dead') {
      faceMarkup = `
        <line x1="36" y1="42" x2="44" y2="48" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="44" y1="42" x2="36" y2="48" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="56" y1="42" x2="64" y2="48" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="64" y1="42" x2="56" y2="48" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round"/>
        <ellipse cx="50" cy="56" rx="4" ry="7" fill="#0f172a"/>
      `;
      propsMarkup = `<text x="40" y="22" font-size="22">💫</text>`;
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="custom-character-emote-svg">
        ${getFilterDef(fid)}
        ${propsMarkup}
        <!-- Octopus Dome Head -->
        <path d="M 22 52 C 22 22, 78 22, 78 52 C 78 68, 72 74, 66 74 C 60 74, 56 68, 50 68 C 44 68, 40 74, 34 74 C 28 74, 22 68, 22 52 Z" 
              fill="#ec4899" stroke="#0f172a" stroke-width="4" filter="url(#${fid})"/>
        <!-- Tentacles -->
        <path d="M 24 70 Q 18 88 28 85 Q 34 82 32 74" fill="#db2777" stroke="#0f172a" stroke-width="3"/>
        <path d="M 38 72 Q 36 90 46 88 Q 50 84 46 72" fill="#db2777" stroke="#0f172a" stroke-width="3"/>
        <path d="M 54 72 Q 50 84 54 88 Q 64 90 62 72" fill="#db2777" stroke="#0f172a" stroke-width="3"/>
        <path d="M 68 74 Q 66 82 72 85 Q 82 88 76 70" fill="#db2777" stroke="#0f172a" stroke-width="3"/>
        ${faceMarkup}
      </svg>
    `;
  }

  // =========================================================================
  // 4. UNIVERSAL CHARACTER STICKER GENERATOR (For any other emoji avatar)
  // Renders a high-gloss 3D sticker badge with custom emotions
  // =========================================================================
  function generateUniversalEmote(avatarEmoji, type) {
    const fid = `shadow_univ_${type}`;
    let overlaySymbol = '';
    let badgeColor = '#3b82f6';
    let emotionTitle = '';

    if (type === 'happy') {
      overlaySymbol = '🎉';
      badgeColor = '#10b981';
      emotionTitle = 'FIESTA';
    } else if (type === 'laugh') {
      overlaySymbol = '😂';
      badgeColor = '#f59e0b';
      emotionTitle = 'JAJAJA';
    } else if (type === 'shock') {
      overlaySymbol = '😱';
      badgeColor = '#6366f1';
      emotionTitle = 'OMG';
    } else if (type === 'fire') {
      overlaySymbol = '🔥';
      badgeColor = '#ef4444';
      emotionTitle = 'FUEGO';
    } else if (type === 'sus') {
      overlaySymbol = '👀';
      badgeColor = '#8b5cf6';
      emotionTitle = 'OJO';
    } else if (type === 'dead') {
      overlaySymbol = '💀';
      badgeColor = '#64748b';
      emotionTitle = 'RIP';
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="custom-character-emote-svg">
        ${getFilterDef(fid)}
        <!-- Sticker Outer Border -->
        <circle cx="50" cy="50" r="42" fill="#ffffff" stroke="#0f172a" stroke-width="4" filter="url(#${fid})"/>
        <!-- Sticker Colored Inner Circle -->
        <circle cx="50" cy="50" r="38" fill="${badgeColor}" stroke="#ffffff" stroke-width="2"/>
        <!-- Central Character Avatar -->
        <text x="50" y="58" font-size="38" text-anchor="middle" dominant-baseline="central">${avatarEmoji}</text>
        <!-- Corner Emotion Sticker Badge -->
        <circle cx="74" cy="26" r="15" fill="#ffffff" stroke="#0f172a" stroke-width="2.5"/>
        <text x="74" y="27" font-size="16" text-anchor="middle" dominant-baseline="central">${overlaySymbol}</text>
      </svg>
    `;
  }

  // =========================================================================
  // PUBLIC ENGINE INTERFACE
  // =========================================================================
  window.CharacterEmoteEngine = {
    /**
     * Get the 6 custom sticker emotes for an avatar.
     * @param {string} avatarEmoji (e.g. '👻', '🦊', '🐙', '🦖')
     * @param {string} [color]
     * @returns {Array<{ id: string, label: string, svg: string }>}
     */
    getEmotesForAvatar(avatarEmoji, color = '#00f0ff') {
      const emoji = avatarEmoji || '👻';
      return EMOTE_TYPES.map(t => {
        return {
          id: t.id,
          label: t.label,
          svg: this.getEmoteSvg(emoji, t.id, color)
        };
      });
    },

    /**
     * Get a specific emote SVG markup.
     * @param {string} avatarEmoji 
     * @param {string} typeId ('happy'|'laugh'|'shock'|'fire'|'sus'|'dead')
     * @param {string} [color]
     * @returns {string} SVG HTML string
     */
    getEmoteSvg(avatarEmoji, typeId = 'happy', color = '#00f0ff') {
      const emoji = avatarEmoji || '👻';
      if (emoji === '👻') {
        return generateGhostEmote(typeId, color);
      }
      if (emoji === '🦊') {
        return generateFoxEmote(typeId);
      }
      if (emoji === '🐙') {
        return generateOctopusEmote(typeId);
      }
      return generateUniversalEmote(emoji, typeId);
    }
  };

  console.log('[CharacterEmoteEngine] Initialized with custom vector sticker generator.');
})();
