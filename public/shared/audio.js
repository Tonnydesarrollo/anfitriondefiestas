import { BACKEND_URL } from './config.js';

/**
 * Broadcast Audio & Voice Studio Host Engine
 * Combines punchy Web Audio TV foley stings with Coqui/XTTS Voice Studio narration.
 */
class PartyAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.ttsEnabled = true;
    this.selectedVoiceId = '';
    this.voices = [];
    this.currentAudio = null;
    this.onSpeakCallback = null;
    this.lastSpokenKey = '';
  }

  setSpeakingListener(fn) {
    this.onSpeakCallback = fn;
  }

  _emitSpeaking(isSpeaking, subtitle = '') {
    if (typeof this.onSpeakCallback === 'function') {
      this.onSpeakCallback(isSpeaking, subtitle);
    }
  }

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  async loadVoices() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/voices`);
      if (!res.ok) return [];
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.profiles || data.voices || []);
      this.voices = list;
      if (!this.selectedVoiceId && list.length > 0) {
        const showman = list.find(v => /cookie|show|pepe|locutor|don/i.test(v.id || v.name || ''));
        this.selectedVoiceId = (showman || list[0]).id || (showman || list[0]).name || '';
      }
      return list;
    } catch (_) {
      return [];
    }
  }

  stopSpeech() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.src = '';
      } catch (_) {}
      this.currentAudio = null;
    }
    if (window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (_) {}
    }
    this._emitSpeaking(false, '');
  }

  async speak(text, dedupeKey = '') {
    if (!text) return;
    if (dedupeKey && dedupeKey === this.lastSpokenKey) return;
    if (dedupeKey) this.lastSpokenKey = dedupeKey;

    this._emitSpeaking(true, text);
    if (!this.ttsEnabled) {
      setTimeout(() => this._emitSpeaking(false, text), Math.min(3800, Math.max(1500, text.length * 42)));
      return;
    }

    this.stopSpeech();
    this._emitSpeaking(true, text);

    // Attempt Voice Studio backend first
    try {
      const res = await fetch(`${BACKEND_URL}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: this.selectedVoiceId || undefined })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        this.currentAudio = audio;
        audio.onended = () => {
          URL.revokeObjectURL(url);
          if (this.currentAudio === audio) this.currentAudio = null;
          this._emitSpeaking(false, text);
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          this._emitSpeaking(false, text);
        };
        await audio.play().catch(() => {
          this._emitSpeaking(false, text);
        });
        return;
      }
    } catch (_) {}

    // Fallback cleanly to Spanish browser speech if Voice Studio offline
    if (window.speechSynthesis) {
      try {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'es-MX';
        utter.rate = 1.05;
        utter.pitch = 1.04;
        utter.onend = () => this._emitSpeaking(false, text);
        utter.onerror = () => this._emitSpeaking(false, text);
        window.speechSynthesis.speak(utter);
        return;
      } catch (_) {}
    }

    setTimeout(() => this._emitSpeaking(false, text), Math.min(3500, Math.max(1400, text.length * 40)));
  }

  playSfx(type = 'pop') {
    if (!this.enabled) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const tone = (freq, dur, wave = 'triangle', vol = 0.14, delay = 0, endFreq = null) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = wave;
      osc.frequency.setValueAtTime(freq, now + delay);
      if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, now + delay + dur);
      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.exponentialRampToValueAtTime(vol, now + delay + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + dur + 0.02);
    };

    switch (type) {
      case 'join':
        tone(523.25, 0.11, 'triangle', 0.15, 0);
        tone(659.25, 0.12, 'triangle', 0.15, 0.08);
        tone(783.99, 0.18, 'triangle', 0.18, 0.16);
        break;
      case 'tick':
        tone(920, 0.045, 'square', 0.05, 0);
        break;
      case 'fanfare':
        tone(523.25, 0.14, 'triangle', 0.16, 0);
        tone(659.25, 0.14, 'triangle', 0.16, 0.11);
        tone(783.99, 0.14, 'triangle', 0.16, 0.22);
        tone(1046.5, 0.36, 'triangle', 0.20, 0.34);
        break;
      case 'correct':
        tone(587.33, 0.1, 'triangle', 0.16, 0);
        tone(880, 0.24, 'triangle', 0.18, 0.09);
        break;
      case 'wrong':
      case 'boom':
        tone(190, 0.28, 'sawtooth', 0.18, 0, 75);
        break;
      case 'gavel':
        tone(240, 0.09, 'square', 0.18, 0, 120);
        tone(180, 0.14, 'triangle', 0.16, 0.06, 90);
        break;
      default:
        tone(660, 0.08, 'sine', 0.1, 0, 820);
    }
  }
}

export const partyAudio = new PartyAudioEngine();
