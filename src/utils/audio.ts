/**
 * Web Audio API - Authentic 1996 8-Bit Synthesizer Engine
 * Recreates the Game Boy DMG sound channels: Pulse/Square 1, Pulse/Square 2, Wave/Triangle, Noise
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.5;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  public playTone(
    freq: number,
    type: OscillatorType = 'square',
    duration: number = 0.1,
    gainVal: number = 0.15,
    delay: number = 0
  ) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = ctx.currentTime + delay;
      const effectiveGain = gainVal * this.masterVolume;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(effectiveGain, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch {
      // AudioContext policy catch
    }
  }

  // 1. Menu navigation blip
  public sfxSelect() {
    this.playTone(660, 'square', 0.06, 0.18);
  }

  // 2. Menu cancel / back
  public sfxCancel() {
    this.playTone(330, 'square', 0.08, 0.14);
  }

  // 3. Normal attack hit
  public sfxHit() {
    this.playTone(180, 'sawtooth', 0.12, 0.22);
    setTimeout(() => this.playTone(110, 'sawtooth', 0.12, 0.2), 70);
  }

  // 4. Super Effective hit (效果絕佳) - Cascading bright square chords
  public sfxSuperEffective() {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'square', 0.1, 0.22, idx * 0.06);
    });
  }

  // 5. Not Very Effective hit (效果不理想) - Low muffled rumble
  public sfxNotEffective() {
    this.playTone(130, 'triangle', 0.28, 0.25);
    setTimeout(() => this.playTone(95, 'sawtooth', 0.15, 0.18), 60);
  }

  // 6. Potion healing chime (使用傷藥)
  public sfxHeal() {
    const notes = [392.0, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'sine', 0.14, 0.2, idx * 0.07);
    });
  }

  // 7. Victory Fanfare (經典道館/冠軍勝利號角)
  public sfxVictory() {
    const notes = [523.25, 523.25, 523.25, 523.25, 659.25, 587.33, 659.25, 783.99];
    const times = [0, 0.09, 0.18, 0.27, 0.42, 0.58, 0.72, 0.92];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'square', 0.16, 0.22, times[idx]);
    });
  }

  // 8. Badge acquisition fanfare (獲得灰色徽章)
  public sfxBadgeObtained() {
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'square', 0.2, 0.2, idx * 0.12);
    });
  }

  // 9. Defeat / fainting sound (戰敗眼前一片漆黑)
  public sfxDefeat() {
    const notes = [330, 311.13, 293.66, 277.18, 220];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'sawtooth', 0.2, 0.2, idx * 0.12);
    });
  }

  // 10. Starter selection celebration sound
  public sfxStarterChosen() {
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'square', 0.12, 0.18, idx * 0.08);
    });
  }
}

export const sound = new SoundEngine();
