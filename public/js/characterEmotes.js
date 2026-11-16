/**
 * CharacterEmoteEngine
 * Procedural & Vector Custom Emoticon Generator for Party Game Avatars.
 * Creates authentic custom stickers/emotes for characters (Fox, Ghost, Octopus, Dino, Cat, Skull, etc.)
 * NO unicode emoji overlays — 100% pure illustrated vector SVG expressions!
 */
(function() {
  const EMOTE_TYPES = [
    { id: 'happy', label: '¡Feliz / Fiesta!' },
    { id: 'laugh', label: '¡Jajaja / Carcajadas!' },
    { id: 'shock', label: '¡Grito / Pánico!' },
    { id: 'fire', label: '¡Hype / En Llamas!' },
    { id: 'sus', label: '¡Sospecha / Ojo!' },
    { id: 'dead', label: '¡KO / Fallecí!' }
  ];

  // =========================================================================
  // 1. FOX CHARACTER (🦊) — 100% PURE VECTOR EXPRESSIONS
  // =========================================================================
  function generateFoxEmote(type) {
    let eyes = '';
    let mouth = '';
    let extras = '';
    let headBg = '#f97316';
    let earBg = '#ea580c';

    if (type === 'happy') {
      // Cheerful joyful squinting eyes & sweet open smile with blush & stars
      eyes = `
        <path d="M 33 50 Q 40 42 47 50" stroke="#0f172a" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <path d="M 53 50 Q 60 42 67 50" stroke="#0f172a" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      `;
      mouth = `
        <ellipse cx="50" cy="59" rx="3.5" ry="2" fill="#0f172a"/>
        <path d="M 42 62 Q 50 74 58 62 Z" fill="#e11d48" stroke="#0f172a" stroke-width="2.5"/>
        <ellipse cx="50" cy="69" rx="3" ry="2" fill="#fda4af"/>
      `;
      extras = `
        <!-- Pink Blush -->
        <ellipse cx="30" cy="56" rx="5" ry="3.5" fill="#fb7185" opacity="0.85"/>
        <ellipse cx="70" cy="56" rx="5" ry="3.5" fill="#fb7185" opacity="0.85"/>
        <!-- Golden Sparkles -->
        <path d="M 78 20 L 80 25 L 85 27 L 80 29 L 78 34 L 76 29 L 71 27 L 76 25 Z" fill="#ffd600" stroke="#b45309" stroke-width="1"/>
        <path d="M 22 28 L 23 32 L 27 33 L 23 35 L 22 39 L 21 35 L 17 33 L 21 32 Z" fill="#38bdf8"/>
      `;
    } else if (type === 'laugh') {
      // Laughing hard with tears streaming
      eyes = `
        <path d="M 32 50 L 46 44 L 34 56 Z" fill="#0f172a"/>
        <path d="M 68 50 L 54 44 L 66 56 Z" fill="#0f172a"/>
      `;
      mouth = `
        <ellipse cx="50" cy="57" rx="3" ry="1.8" fill="#0f172a"/>
        <path d="M 38 60 Q 50 79 62 60 Z" fill="#be123c" stroke="#0f172a" stroke-width="3"/>
        <path d="M 43 69 Q 50 64 57 69 Q 50 77 43 69 Z" fill="#fb7185"/>
      `;
      extras = `
        <!-- Big Tears of Joy Shooting Out -->
        <path d="M 24 48 C 17 48, 16 57, 23 60 C 29 61, 30 52, 24 48 Z" fill="#00f0ff" stroke="#0284c7" stroke-width="1.8"/>
        <path d="M 76 48 C 83 48, 84 57, 77 60 C 71 61, 70 52, 76 48 Z" fill="#00f0ff" stroke="#0284c7" stroke-width="1.8"/>
        <ellipse cx="14" cy="58" rx="2.5" ry="2.5" fill="#00f0ff"/>
        <ellipse cx="86" cy="58" rx="2.5" ry="2.5" fill="#00f0ff"/>
      `;
    } else if (type === 'shock') {
      // Screaming wide eyes popping out & dropped jaw
      eyes = `
        <circle cx="39" cy="47" r="8.5" fill="#ffffff" stroke="#0f172a" stroke-width="3.5"/>
        <circle cx="39" cy="47" r="3" fill="#0f172a"/>
        <circle cx="61" cy="47" r="8.5" fill="#ffffff" stroke="#0f172a" stroke-width="3.5"/>
        <circle cx="61" cy="47" r="3" fill="#0f172a"/>
      `;
      mouth = `
        <ellipse cx="50" cy="58" rx="3" ry="2" fill="#0f172a"/>
        <ellipse cx="50" cy="71" rx="7.5" ry="11" fill="#0f172a" stroke="#0f172a" stroke-width="2"/>
        <ellipse cx="50" cy="77" rx="4.5" ry="4" fill="#e11d48"/>
      `;
      extras = `
        <!-- Trembling fright sweat lines -->
        <path d="M 33 24 L 33 34" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 50 20 L 50 31" stroke="#0284c7" stroke-width="3" stroke-linecap="round"/>
        <path d="M 67 24 L 67 34" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Ghostly pale cheek tone -->
        <circle cx="50" cy="56" r="30" fill="#fed7aa" opacity="0.3"/>
      `;
    } else if (type === 'fire') {
      // Angry flaming eyes, bared fangs & flame aura
      headBg = '#ea580c';
      earBg = '#c2410c';
      eyes = `
        <path d="M 32 45 L 47 50 L 37 55 Z" fill="#ffd600" stroke="#0f172a" stroke-width="2.5"/>
        <path d="M 68 45 L 53 50 L 63 55 Z" fill="#ffd600" stroke="#0f172a" stroke-width="2.5"/>
      `;
      mouth = `
        <ellipse cx="50" cy="58" rx="3.5" ry="2" fill="#0f172a"/>
        <!-- Fierce Grin with Sharp Fangs -->
        <path d="M 38 63 Q 50 58 62 63 Q 50 74 38 63 Z" fill="#7f1d1d" stroke="#0f172a" stroke-width="2.5"/>
        <polygon points="44,61 46,67 48,61" fill="#ffffff"/>
        <polygon points="52,61 54,67 56,61" fill="#ffffff"/>
      `;
      extras = `
        <!-- Flame Aura Behind Head -->
        <path d="M 34 26 Q 44 8 50 18 Q 56 4 66 26 Z" fill="#ef4444"/>
        <path d="M 38 26 Q 46 14 50 21 Q 54 11 62 26 Z" fill="#facc15"/>
      `;
    } else if (type === 'sus') {
      // Skeptical side glance, raised arched eyebrow, vector question mark
      eyes = `
        <!-- Left eye squinting -->
        <ellipse cx="38" cy="49" rx="6" ry="3" fill="#ffffff" stroke="#0f172a" stroke-width="2.5"/>
        <circle cx="41" cy="49" r="2.2" fill="#0f172a"/>
        <!-- Right eye wide raised -->
        <circle cx="62" cy="48" r="6" fill="#ffffff" stroke="#0f172a" stroke-width="2.5"/>
        <circle cx="64" cy="48" r="2.5" fill="#0f172a"/>
        <!-- Raised Eyebrow -->
        <path d="M 55 38 Q 63 32 70 38" stroke="#0f172a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M 31 43 Q 39 42 45 44" stroke="#0f172a" stroke-width="3" fill="none" stroke-linecap="round"/>
      `;
      mouth = `
        <ellipse cx="50" cy="58" rx="3.5" ry="2" fill="#0f172a"/>
        <!-- Smirking side mouth -->
        <path d="M 44 64 Q 53 68 59 62" stroke="#0f172a" stroke-width="3" fill="none" stroke-linecap="round"/>
      `;
      extras = `
        <!-- Vector Question Mark -->
        <path d="M 75 22 C 75 16, 85 16, 85 22 C 85 27, 80 28, 80 32" stroke="#ffd600" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <circle cx="80" cy="37" r="2" fill="#ffd600"/>
      `;
    } else if (type === 'dead') {
      // KO crossed eyes, tongue hanging out & floating spirit swirls
      headBg = '#94a3b8';
      earBg = '#64748b';
      eyes = `
        <!-- X X Eyes -->
        <line x1="34" y1="45" x2="44" y2="53" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>
        <line x1="44" y1="45" x2="34" y2="53" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>
        <line x1="56" y1="45" x2="66" y2="53" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>
        <line x1="66" y1="45" x2="56" y2="53" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>
      `;
      mouth = `
        <ellipse cx="50" cy="59" rx="3.5" ry="2" fill="#0f172a"/>
        <path d="M 43 65 Q 50 63 57 65" stroke="#0f172a" stroke-width="2.5" fill="none"/>
        <!-- Tongue hanging out sideways -->
        <path d="M 48 65 Q 49 76 54 74 Q 57 71 54 65 Z" fill="#f43f5e" stroke="#0f172a" stroke-width="2"/>
      `;
      extras = `
        <!-- Dizzy Golden Stars -->
        <path d="M 46 22 L 48 26 L 52 27 L 48 29 L 46 33 L 44 29 L 40 27 L 44 26 Z" fill="#ffd600"/>
        <path d="M 64 25 L 65 28 L 68 29 L 65 30 L 64 33 L 63 30 L 60 29 L 63 28 Z" fill="#ffd600"/>
        <!-- Knockout spiral -->
        <circle cx="50" cy="18" r="12" fill="none" stroke="#ffd600" stroke-width="2.5" stroke-dasharray="4 2"/>
      `;
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" class="custom-character-emote-svg" style="display:block; width:100%; height:100%; max-width:100%; max-height:100%;">
        ${extras}
        <!-- Fox Ears -->
        <polygon points="18,16 36,46 14,40" fill="${earBg}" stroke="#0f172a" stroke-width="3.5" stroke-linejoin="round"/>
        <polygon points="21,22 33,42 18,36" fill="#ffffff"/>
        <polygon points="82,16 64,46 86,40" fill="${earBg}" stroke="#0f172a" stroke-width="3.5" stroke-linejoin="round"/>
        <polygon points="79,22 67,42 82,36" fill="#ffffff"/>
        <!-- Fox Head -->
        <circle cx="50" cy="56" r="30" fill="${headBg}" stroke="#0f172a" stroke-width="4"/>
        <!-- White Muzzle -->
        <path d="M 23 58 Q 38 68 50 63 Q 62 68 77 58 Q 72 82 50 82 Q 28 82 23 58 Z" fill="#ffffff" stroke="#0f172a" stroke-width="2.5"/>
        ${eyes}
        ${mouth}
      </svg>
    `;
  }

  // =========================================================================
  // 2. GHOST CHARACTER (👻) — 100% PURE VECTOR EXPRESSIONS
  // =========================================================================
  function generateGhostEmote(type, color = '#38bdf8') {
    let bodyColor = '#ffffff';
    let bottomColor = '#cbeafe';
    let eyes = '';
    let mouth = '';
    let extras = '';

    if (type === 'happy') {
      eyes = `
        <ellipse cx="40" cy="46" rx="5.5" ry="7.5" fill="#0f172a"/>
        <circle cx="42" cy="43.5" r="2.3" fill="#ffffff"/>
        <ellipse cx="60" cy="46" rx="5.5" ry="7.5" fill="#0f172a"/>
        <circle cx="62" cy="43.5" r="2.3" fill="#ffffff"/>
      `;
      mouth = `
        <ellipse cx="32" cy="53" rx="5" ry="3.5" fill="#ff76a5" opacity="0.8"/>
        <ellipse cx="68" cy="53" rx="5" ry="3.5" fill="#ff76a5" opacity="0.8"/>
        <path d="M 42 53 Q 50 64 58 53 Z" fill="#ef4444" stroke="#0f172a" stroke-width="2.5"/>
      `;
      extras = `
        <path d="M 78 18 L 80 23 L 85 25 L 80 27 L 78 32 L 76 27 L 71 25 L 76 23 Z" fill="#ffd600" stroke="#ca8a04" stroke-width="1"/>
        <path d="M 22 28 L 23 32 L 27 33 L 23 35 L 22 39 L 21 35 L 17 33 L 21 32 Z" fill="#ff007f"/>
      `;
    } else if (type === 'laugh') {
      eyes = `
        <path d="M 33 47 Q 40 38 47 47" stroke="#0f172a" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <path d="M 53 47 Q 60 38 67 47" stroke="#0f172a" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      `;
      mouth = `
        <path d="M 38 52 Q 50 72 62 52 Z" fill="#e11d48" stroke="#0f172a" stroke-width="3"/>
        <path d="M 42 61 Q 50 56 58 61 Q 50 70 42 61 Z" fill="#f43f5e"/>
      `;
      extras = `
        <path d="M 27 46 C 22 46, 21 53, 26 55 C 30 56, 31 49, 27 46 Z" fill="#00f0ff" stroke="#0284c7" stroke-width="1.5"/>
        <path d="M 73 46 C 78 46, 79 53, 74 55 C 70 56, 69 49, 73 46 Z" fill="#00f0ff" stroke="#0284c7" stroke-width="1.5"/>
      `;
    } else if (type === 'shock') {
      bottomColor = '#bfdbfe';
      eyes = `
        <circle cx="41" cy="44" r="7.5" fill="#ffffff" stroke="#0f172a" stroke-width="3.5"/>
        <circle cx="41" cy="44" r="2.8" fill="#0f172a"/>
        <circle cx="59" cy="44" r="7.5" fill="#ffffff" stroke="#0f172a" stroke-width="3.5"/>
        <circle cx="59" cy="44" r="2.8" fill="#0f172a"/>
      `;
      mouth = `
        <ellipse cx="50" cy="62" rx="6.5" ry="11" fill="#0f172a" stroke="#0f172a" stroke-width="2"/>
        <ellipse cx="28" cy="50" rx="4.5" ry="7" fill="#ffffff" stroke="#0f172a" stroke-width="3"/>
        <ellipse cx="72" cy="50" rx="4.5" ry="7" fill="#ffffff" stroke="#0f172a" stroke-width="3"/>
      `;
      extras = `
        <line x1="44" y1="26" x2="44" y2="34" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="50" y1="24" x2="50" y2="33" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="56" y1="26" x2="56" y2="34" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
      `;
    } else if (type === 'fire') {
      bodyColor = '#ffedd5';
      bottomColor = '#fed7aa';
      eyes = `
        <path d="M 34 43 L 48 48 L 40 53 Z" fill="#ffd600" stroke="#0f172a" stroke-width="2.5"/>
        <path d="M 66 43 L 52 48 L 60 53 Z" fill="#ffd600" stroke="#0f172a" stroke-width="2.5"/>
      `;
      mouth = `
        <path d="M 40 56 Q 50 52 60 56 Q 50 66 40 56 Z" fill="#991b1b" stroke="#0f172a" stroke-width="2.5"/>
        <polygon points="45,54 47,59 49,54" fill="#ffffff"/>
        <polygon points="51,54 53,59 55,54" fill="#ffffff"/>
      `;
      extras = `
        <path d="M 36 26 Q 44 10 50 18 Q 56 6 64 26 Z" fill="#ff0055" opacity="0.9"/>
        <path d="M 40 26 Q 46 14 50 20 Q 54 12 60 26 Z" fill="#ffcc00"/>
      `;
    } else if (type === 'sus') {
      eyes = `
        <ellipse cx="40" cy="46" rx="6.5" ry="4" fill="#ffffff" stroke="#0f172a" stroke-width="2.5"/>
        <circle cx="43" cy="46" r="2.8" fill="#0f172a"/>
        <ellipse cx="60" cy="46" rx="6.5" ry="4" fill="#ffffff" stroke="#0f172a" stroke-width="2.5"/>
        <circle cx="63" cy="46" r="2.8" fill="#0f172a"/>
        <path d="M 33 39 Q 40 33 47 40" stroke="#0f172a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M 53 43 Q 60 41 67 43" stroke="#0f172a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      `;
      mouth = `
        <path d="M 43 57 Q 52 60 58 53" stroke="#0f172a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      `;
      extras = `
        <path d="M 74 24 C 74 18, 83 18, 83 24 C 83 28, 78 29, 78 33" stroke="#ffd600" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <circle cx="78" cy="38" r="2" fill="#ffd600"/>
      `;
    } else if (type === 'dead') {
      bottomColor = '#cbd5e1';
      eyes = `
        <line x1="35" y1="42" x2="45" y2="50" stroke="#0f172a" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="45" y1="42" x2="35" y2="50" stroke="#0f172a" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="55" y1="42" x2="65" y2="50" stroke="#0f172a" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="65" y1="42" x2="55" y2="50" stroke="#0f172a" stroke-width="4.5" stroke-linecap="round"/>
      `;
      mouth = `
        <path d="M 42 56 Q 50 54 58 56" stroke="#0f172a" stroke-width="3" fill="none"/>
        <path d="M 47 56 Q 49 68 53 66 Q 55 62 53 56 Z" fill="#f43f5e" stroke="#0f172a" stroke-width="2"/>
      `;
      extras = `
        <ellipse cx="50" cy="18" rx="18" ry="5.5" fill="none" stroke="#ffd600" stroke-width="4"/>
      `;
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" class="custom-character-emote-svg" style="display:block; width:100%; height:100%; max-width:100%; max-height:100%;">
        <defs>
          <linearGradient id="grad_ghost_${type}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${bodyColor}"/>
            <stop offset="100%" stop-color="${bottomColor}"/>
          </linearGradient>
        </defs>
        ${extras}
        <!-- Ghost Body -->
        <path d="M 22 52 C 22 24, 78 24, 78 52 C 78 72, 75 88, 68 85 C 62 82, 58 88, 50 85 C 42 82, 38 88, 32 85 C 25 88, 22 72, 22 52 Z" 
              fill="url(#grad_ghost_${type})" stroke="#0f172a" stroke-width="4" stroke-linejoin="round"/>
        ${eyes}
        ${mouth}
      </svg>
    `;
  }

  // =========================================================================
  // 3. OCTOPUS CHARACTER (🐙) — 100% PURE VECTOR EXPRESSIONS
  // =========================================================================
  function generateOctopusEmote(type) {
    let eyes = '';
    let mouth = '';
    let extras = '';
    let bodyColor = '#ec4899';
    let tentacleColor = '#db2777';

    if (type === 'happy') {
      eyes = `
        <ellipse cx="40" cy="46" rx="5" ry="7" fill="#0f172a"/><circle cx="42" cy="44" r="2.2" fill="#fff"/>
        <ellipse cx="60" cy="46" rx="5" ry="7" fill="#0f172a"/><circle cx="62" cy="44" r="2.2" fill="#fff"/>
      `;
      mouth = `
        <circle cx="32" cy="52" r="4.5" fill="#ff76a5" opacity="0.8"/>
        <circle cx="68" cy="52" r="4.5" fill="#ff76a5" opacity="0.8"/>
        <circle cx="50" cy="56" r="5" fill="#e11d48" stroke="#0f172a" stroke-width="2"/>
      `;
      extras = `
        <circle cx="76" cy="24" r="4" fill="#67e8f9" opacity="0.8"/>
        <circle cx="82" cy="16" r="2.5" fill="#67e8f9" opacity="0.8"/>
      `;
    } else if (type === 'laugh') {
      eyes = `
        <path d="M 33 46 Q 40 38 47 46" stroke="#0f172a" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M 53 46 Q 60 38 67 46" stroke="#0f172a" stroke-width="4" fill="none" stroke-linecap="round"/>
      `;
      mouth = `
        <path d="M 40 52 Q 50 68 60 52 Z" fill="#e11d48" stroke="#0f172a" stroke-width="2.5"/>
      `;
      extras = `
        <path d="M 26 44 C 20 44, 20 52, 25 54 C 29 55, 30 48, 26 44 Z" fill="#00f0ff" stroke="#0284c7" stroke-width="1.5"/>
        <path d="M 74 44 C 80 44, 80 52, 75 54 C 71 55, 70 48, 74 44 Z" fill="#00f0ff" stroke="#0284c7" stroke-width="1.5"/>
      `;
    } else if (type === 'shock') {
      eyes = `
        <circle cx="40" cy="44" r="7.5" fill="#fff" stroke="#0f172a" stroke-width="3"/><circle cx="40" cy="44" r="2.8" fill="#0f172a"/>
        <circle cx="60" cy="44" r="7.5" fill="#fff" stroke="#0f172a" stroke-width="3"/><circle cx="60" cy="44" r="2.8" fill="#0f172a"/>
      `;
      mouth = `
        <ellipse cx="50" cy="58" rx="6" ry="10" fill="#0f172a"/>
      `;
      extras = `
        <line x1="45" y1="24" x2="45" y2="32" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="55" y1="24" x2="55" y2="32" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
      `;
    } else if (type === 'fire') {
      bodyColor = '#ef4444';
      tentacleColor = '#b91c1c';
      eyes = `
        <path d="M 35 44 L 46 48 L 40 52 Z" fill="#ffd600" stroke="#0f172a" stroke-width="2"/>
        <path d="M 65 44 L 54 48 L 60 52 Z" fill="#ffd600" stroke="#0f172a" stroke-width="2"/>
      `;
      mouth = `
        <path d="M 42 56 Q 50 52 58 56 Q 50 64 42 56 Z" fill="#991b1b" stroke="#0f172a" stroke-width="2"/>
      `;
      extras = `
        <path d="M 40 22 Q 46 8 50 16 Q 54 6 60 22 Z" fill="#ffd600"/>
      `;
    } else if (type === 'sus') {
      eyes = `
        <ellipse cx="40" cy="46" rx="6" ry="3.5" fill="#fff" stroke="#0f172a" stroke-width="2.5"/><circle cx="42" cy="46" r="2.2" fill="#0f172a"/>
        <ellipse cx="60" cy="46" rx="6" ry="3.5" fill="#fff" stroke="#0f172a" stroke-width="2.5"/><circle cx="62" cy="46" r="2.2" fill="#0f172a"/>
      `;
      mouth = `
        <path d="M 44 56 Q 52 58 56 52" stroke="#0f172a" stroke-width="3" fill="none" stroke-linecap="round"/>
      `;
      extras = `
        <path d="M 75 22 C 75 16, 84 16, 84 22 C 84 26, 80 27, 80 30" stroke="#ffd600" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="80" cy="34" r="1.8" fill="#ffd600"/>
      `;
    } else if (type === 'dead') {
      bodyColor = '#94a3b8';
      tentacleColor = '#64748b';
      eyes = `
        <line x1="36" y1="42" x2="44" y2="48" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="44" y1="42" x2="36" y2="48" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="56" y1="42" x2="64" y2="48" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="64" y1="42" x2="56" y2="48" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round"/>
      `;
      mouth = `
        <ellipse cx="50" cy="56" rx="4" ry="7" fill="#0f172a"/>
      `;
      extras = `
        <ellipse cx="50" cy="18" rx="16" ry="5" fill="none" stroke="#ffd600" stroke-width="3.5"/>
      `;
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" class="custom-character-emote-svg" style="display:block; width:100%; height:100%; max-width:100%; max-height:100%;">
        ${extras}
        <!-- Octopus Dome Head -->
        <path d="M 22 52 C 22 22, 78 22, 78 52 C 78 68, 72 74, 66 74 C 60 74, 56 68, 50 68 C 44 68, 40 74, 34 74 C 28 74, 22 68, 22 52 Z" 
              fill="${bodyColor}" stroke="#0f172a" stroke-width="4"/>
        <!-- Tentacles -->
        <path d="M 24 70 Q 18 88 28 85 Q 34 82 32 74" fill="${tentacleColor}" stroke="#0f172a" stroke-width="3"/>
        <path d="M 38 72 Q 36 90 46 88 Q 50 84 46 72" fill="${tentacleColor}" stroke="#0f172a" stroke-width="3"/>
        <path d="M 54 72 Q 50 84 54 88 Q 64 90 62 72" fill="${tentacleColor}" stroke="#0f172a" stroke-width="3"/>
        <path d="M 68 74 Q 66 82 72 85 Q 82 88 76 70" fill="${tentacleColor}" stroke="#0f172a" stroke-width="3"/>
        ${eyes}
        ${mouth}
      </svg>
    `;
  }

  // =========================================================================
  // 4. DINO / T-REX CHARACTER (🦖) — 100% PURE VECTOR EXPRESSIONS
  // =========================================================================
  function generateDinoEmote(type) {
    let eyes = '';
    let mouth = '';
    let extras = '';
    let bodyColor = '#10b981';

    if (type === 'happy') {
      eyes = `
        <ellipse cx="42" cy="46" rx="5" ry="7" fill="#0f172a"/><circle cx="44" cy="44" r="2.2" fill="#fff"/>
        <ellipse cx="62" cy="46" rx="5" ry="7" fill="#0f172a"/><circle cx="64" cy="44" r="2.2" fill="#fff"/>
      `;
      mouth = `
        <path d="M 40 56 Q 52 70 64 56 Z" fill="#be123c" stroke="#0f172a" stroke-width="2.5"/>
        <polygon points="45,56 47,60 49,56" fill="#fff"/>
        <polygon points="55,56 57,60 59,56" fill="#fff"/>
      `;
      extras = `
        <ellipse cx="34" cy="53" rx="4" ry="2.5" fill="#f43f5e" opacity="0.8"/>
        <ellipse cx="70" cy="53" rx="4" ry="2.5" fill="#f43f5e" opacity="0.8"/>
      `;
    } else if (type === 'laugh') {
      eyes = `
        <path d="M 36 46 Q 42 38 48 46" stroke="#0f172a" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M 56 46 Q 62 38 68 46" stroke="#0f172a" stroke-width="4" fill="none" stroke-linecap="round"/>
      `;
      mouth = `
        <path d="M 38 54 Q 52 74 66 54 Z" fill="#991b1b" stroke="#0f172a" stroke-width="3"/>
        <path d="M 44 63 Q 52 59 60 63 Q 52 72 44 63 Z" fill="#f43f5e"/>
      `;
      extras = `
        <path d="M 28 44 C 22 44, 22 52, 27 54 C 31 55, 32 48, 28 44 Z" fill="#00f0ff" stroke="#0284c7" stroke-width="1.5"/>
        <path d="M 76 44 C 82 44, 82 52, 77 54 C 73 55, 72 48, 76 44 Z" fill="#00f0ff" stroke="#0284c7" stroke-width="1.5"/>
      `;
    } else if (type === 'shock') {
      eyes = `
        <circle cx="42" cy="44" r="7.5" fill="#fff" stroke="#0f172a" stroke-width="3"/><circle cx="42" cy="44" r="2.5" fill="#0f172a"/>
        <circle cx="62" cy="44" r="7.5" fill="#fff" stroke="#0f172a" stroke-width="3"/><circle cx="62" cy="44" r="2.5" fill="#0f172a"/>
      `;
      mouth = `
        <ellipse cx="52" cy="62" rx="7" ry="11" fill="#0f172a" stroke="#0f172a" stroke-width="2"/>
      `;
      extras = `
        <line x1="46" y1="24" x2="46" y2="33" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="58" y1="24" x2="58" y2="33" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
      `;
    } else if (type === 'fire') {
      bodyColor = '#059669';
      eyes = `
        <path d="M 36 43 L 48 48 L 40 52 Z" fill="#ffd600" stroke="#0f172a" stroke-width="2.5"/>
        <path d="M 68 43 L 56 48 L 64 52 Z" fill="#ffd600" stroke="#0f172a" stroke-width="2.5"/>
      `;
      mouth = `
        <path d="M 40 56 Q 52 52 64 56 Q 52 66 40 56 Z" fill="#7f1d1d" stroke="#0f172a" stroke-width="2.5"/>
        <polygon points="46,55 48,60 50,55" fill="#fff"/>
        <polygon points="54,55 56,60 58,55" fill="#fff"/>
      `;
      extras = `
        <!-- Fire breath flames -->
        <path d="M 38 24 Q 46 8 52 17 Q 58 6 66 24 Z" fill="#ef4444"/>
        <path d="M 42 24 Q 48 13 52 19 Q 56 11 62 24 Z" fill="#ffd600"/>
      `;
    } else if (type === 'sus') {
      eyes = `
        <ellipse cx="42" cy="46" rx="6.5" ry="3.5" fill="#fff" stroke="#0f172a" stroke-width="2.5"/><circle cx="45" cy="46" r="2.2" fill="#0f172a"/>
        <ellipse cx="62" cy="46" rx="6.5" ry="3.5" fill="#fff" stroke="#0f172a" stroke-width="2.5"/><circle cx="65" cy="46" r="2.2" fill="#0f172a"/>
        <path d="M 55 38 Q 63 34 69 40" stroke="#0f172a" stroke-width="3" fill="none" stroke-linecap="round"/>
      `;
      mouth = `
        <path d="M 45 58 Q 54 61 60 54" stroke="#0f172a" stroke-width="3" fill="none" stroke-linecap="round"/>
      `;
      extras = `
        <path d="M 76 22 C 76 16, 85 16, 85 22 C 85 26, 81 27, 81 30" stroke="#ffd600" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="81" cy="34" r="1.8" fill="#ffd600"/>
      `;
    } else if (type === 'dead') {
      bodyColor = '#64748b';
      eyes = `
        <line x1="36" y1="42" x2="46" y2="50" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>
        <line x1="46" y1="42" x2="36" y2="50" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>
        <line x1="58" y1="42" x2="68" y2="50" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>
        <line x1="68" y1="42" x2="58" y2="50" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>
      `;
      mouth = `
        <path d="M 44 58 Q 52 55 60 58" stroke="#0f172a" stroke-width="3" fill="none"/>
        <path d="M 50 58 Q 52 68 56 66 Q 58 62 56 58 Z" fill="#f43f5e" stroke="#0f172a" stroke-width="2"/>
      `;
      extras = `
        <ellipse cx="52" cy="18" rx="16" ry="5" fill="none" stroke="#ffd600" stroke-width="3.5"/>
      `;
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" class="custom-character-emote-svg" style="display:block; width:100%; height:100%; max-width:100%; max-height:100%;">
        ${extras}
        <!-- Dino Head & Crest -->
        <polygon points="26,26 34,42 22,40" fill="#047857" stroke="#0f172a" stroke-width="3"/>
        <polygon points="46,16 54,34 42,32" fill="#047857" stroke="#0f172a" stroke-width="3"/>
        <polygon points="66,24 74,40 62,38" fill="#047857" stroke="#0f172a" stroke-width="3"/>
        <!-- Big Round Dino Head -->
        <circle cx="52" cy="54" r="30" fill="${bodyColor}" stroke="#0f172a" stroke-width="4"/>
        ${eyes}
        ${mouth}
      </svg>
    `;
  }

  // =========================================================================
  // 5. UNIVERSAL VECTOR GENERATOR (For any other avatar)
  // Generates 100% vector badge with expressive cartoon faces & background
  // =========================================================================
  function generateUniversalEmote(avatarEmoji, type, customColor = '#3b82f6') {
    let badgeColor = customColor;
    let eyes = '';
    let mouth = '';
    let extras = '';

    if (type === 'happy') {
      badgeColor = '#10b981';
      eyes = `
        <path d="M 33 46 Q 40 38 47 46" stroke="#0f172a" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M 53 46 Q 60 38 67 46" stroke="#0f172a" stroke-width="4" fill="none" stroke-linecap="round"/>
      `;
      mouth = `
        <path d="M 40 54 Q 50 68 60 54 Z" fill="#e11d48" stroke="#0f172a" stroke-width="2.5"/>
        <ellipse cx="30" cy="52" rx="4" ry="3" fill="#ff76a5" opacity="0.8"/>
        <ellipse cx="70" cy="52" rx="4" ry="3" fill="#ff76a5" opacity="0.8"/>
      `;
      extras = `
        <path d="M 76 20 L 78 24 L 82 25 L 78 26 L 76 30 L 74 26 L 70 25 L 74 24 Z" fill="#ffd600"/>
      `;
    } else if (type === 'laugh') {
      badgeColor = '#f59e0b';
      eyes = `
        <line x1="34" y1="44" x2="46" y2="48" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>
        <line x1="34" y1="52" x2="46" y2="48" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>
        <line x1="66" y1="44" x2="54" y2="48" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>
        <line x1="66" y1="52" x2="54" y2="48" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>
      `;
      mouth = `
        <path d="M 38 54 Q 50 74 62 54 Z" fill="#991b1b" stroke="#0f172a" stroke-width="2.5"/>
      `;
      extras = `
        <path d="M 26 46 C 20 46, 20 54, 25 56 C 29 57, 30 50, 26 46 Z" fill="#00f0ff" stroke="#0284c7" stroke-width="1.5"/>
        <path d="M 74 46 C 80 46, 80 54, 75 56 C 71 57, 70 50, 74 46 Z" fill="#00f0ff" stroke="#0284c7" stroke-width="1.5"/>
      `;
    } else if (type === 'shock') {
      badgeColor = '#6366f1';
      eyes = `
        <circle cx="40" cy="44" r="7.5" fill="#fff" stroke="#0f172a" stroke-width="3"/><circle cx="40" cy="44" r="2.8" fill="#0f172a"/>
        <circle cx="60" cy="44" r="7.5" fill="#fff" stroke="#0f172a" stroke-width="3"/><circle cx="60" cy="44" r="2.8" fill="#0f172a"/>
      `;
      mouth = `
        <ellipse cx="50" cy="62" rx="7" ry="11" fill="#0f172a" stroke="#0f172a" stroke-width="2"/>
      `;
      extras = `
        <line x1="45" y1="24" x2="45" y2="32" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="55" y1="24" x2="55" y2="32" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
      `;
    } else if (type === 'fire') {
      badgeColor = '#ef4444';
      eyes = `
        <path d="M 34 43 L 47 48 L 39 52 Z" fill="#ffd600" stroke="#0f172a" stroke-width="2.5"/>
        <path d="M 66 43 L 53 48 L 61 52 Z" fill="#ffd600" stroke="#0f172a" stroke-width="2.5"/>
      `;
      mouth = `
        <path d="M 40 56 Q 50 52 60 56 Q 50 66 40 56 Z" fill="#7f1d1d" stroke="#0f172a" stroke-width="2.5"/>
      `;
      extras = `
        <path d="M 38 22 Q 46 8 50 16 Q 54 6 62 22 Z" fill="#ffd600"/>
      `;
    } else if (type === 'sus') {
      badgeColor = '#8b5cf6';
      eyes = `
        <ellipse cx="40" cy="46" rx="6" ry="3.5" fill="#fff" stroke="#0f172a" stroke-width="2.5"/><circle cx="42" cy="46" r="2.2" fill="#0f172a"/>
        <ellipse cx="60" cy="46" rx="6" ry="3.5" fill="#fff" stroke="#0f172a" stroke-width="2.5"/><circle cx="62" cy="46" r="2.2" fill="#0f172a"/>
        <path d="M 53 38 Q 61 34 67 40" stroke="#0f172a" stroke-width="3" fill="none" stroke-linecap="round"/>
      `;
      mouth = `
        <path d="M 44 58 Q 53 61 58 54" stroke="#0f172a" stroke-width="3" fill="none" stroke-linecap="round"/>
      `;
      extras = `
        <path d="M 75 20 C 75 14, 84 14, 84 20 C 84 24, 80 25, 80 28" stroke="#ffd600" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="80" cy="32" r="1.8" fill="#ffd600"/>
      `;
    } else if (type === 'dead') {
      badgeColor = '#64748b';
      eyes = `
        <line x1="35" y1="42" x2="45" y2="50" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>
        <line x1="45" y1="42" x2="35" y2="50" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>
        <line x1="55" y1="42" x2="65" y2="50" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>
        <line x1="65" y1="42" x2="55" y2="50" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>
      `;
      mouth = `
        <path d="M 43 58 Q 50 55 57 58" stroke="#0f172a" stroke-width="3" fill="none"/>
        <path d="M 48 58 Q 50 68 54 66 Q 56 62 54 58 Z" fill="#f43f5e" stroke="#0f172a" stroke-width="2"/>
      `;
      extras = `
        <ellipse cx="50" cy="18" rx="16" ry="5" fill="none" stroke="#ffd600" stroke-width="3.5"/>
      `;
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" class="custom-character-emote-svg" style="display:block; width:100%; height:100%; max-width:100%; max-height:100%;">
        ${extras}
        <!-- Badge Disc -->
        <circle cx="50" cy="52" r="34" fill="${badgeColor}" stroke="#0f172a" stroke-width="4"/>
        ${eyes}
        ${mouth}
      </svg>
    `;
  }

  // =========================================================================
  // PUBLIC ENGINE INTERFACE
  // =========================================================================
  window.CharacterEmoteEngine = {
    /**
     * Get the 6 custom sticker emotes for an avatar.
     * @param {string} avatarEmoji (e.g. '🦊', '👻', '🐙', '🦖')
     * @param {string} [color]
     * @returns {Array<{ id: string, label: string, svg: string }>}
     */
    getEmotesForAvatar(avatarEmoji, color = '#00f0ff') {
      const emoji = avatarEmoji || '🦊';
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
      const emoji = avatarEmoji || '🦊';
      const cleanType = String(typeId || 'happy').toLowerCase();

      if (emoji === '🦊') {
        return generateFoxEmote(cleanType);
      }
      if (emoji === '👻') {
        return generateGhostEmote(cleanType, color);
      }
      if (emoji === '🐙') {
        return generateOctopusEmote(cleanType);
      }
      if (emoji === '🦖') {
        return generateDinoEmote(cleanType);
      }
      return generateUniversalEmote(emoji, cleanType, color);
    }
  };

  console.log('[CharacterEmoteEngine] Initialized with 100% pure custom vector sticker generator.');
})();
