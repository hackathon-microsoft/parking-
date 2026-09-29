/* ==========================================================================
   ParkIn - Procedural Web Audio API Sound Effects (Zero External Assets)
   ========================================================================== */

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.enabled = true;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // Audio might be blocked by autoplay policy until first click
    }
  }

  playClick() {
    this.playTone(600, 'triangle', 0.04, 0.08);
  }

  playSlotSelect() {
    this.playTone(520, 'sine', 0.08, 0.1);
    setTimeout(() => this.playTone(780, 'sine', 0.12, 0.12), 40);
  }

  playSuccess() {
    this.playTone(440, 'sine', 0.12, 0.15);
    setTimeout(() => this.playTone(554.37, 'sine', 0.12, 0.15), 100);
    setTimeout(() => this.playTone(659.25, 'sine', 0.25, 0.2), 200);
    setTimeout(() => this.playTone(880, 'sine', 0.4, 0.22), 300);
  }

  playBarrierChime() {
    this.playTone(880, 'sine', 0.2, 0.15);
    setTimeout(() => this.playTone(660, 'sine', 0.35, 0.15), 160);
  }
}

export const sound = new SoundEngine();
