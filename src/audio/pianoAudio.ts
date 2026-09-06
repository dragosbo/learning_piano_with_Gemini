// High-Fidelity Web Audio Piano Engine for Nuvole Bianche
class PianoAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private isInitialized = false;

  private init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

      // Create ambient acoustic reverb impulse response
      this.reverbNode = this.ctx.createConvolver();
      this.reverbNode.buffer = this.buildReverbImpulse(2.2, 2.0);

      const wetGain = this.ctx.createGain();
      wetGain.gain.setValueAtTime(0.28, this.ctx.currentTime);

      const dryGain = this.ctx.createGain();
      dryGain.gain.setValueAtTime(0.72, this.ctx.currentTime);

      this.masterGain.connect(dryGain);
      dryGain.connect(this.ctx.destination);

      this.masterGain.connect(this.reverbNode);
      this.reverbNode.connect(wetGain);
      wetGain.connect(this.ctx.destination);

      this.isInitialized = true;
    } catch {
      console.warn('Web Audio API not supported or blocked.');
    }
  }

  // Generates a smooth acoustic room impulse buffer for concert grand hall acoustics
  private buildReverbImpulse(durationSec: number, decay: number): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext missing');
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * durationSec;
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * decay);
      left[i] = (Math.random() * 2 - 1) * envelope;
      right[i] = (Math.random() * 2 - 1) * envelope;
    }
    return impulse;
  }

  public getContextTime(): number {
    this.init();
    return this.ctx ? this.ctx.currentTime : 0;
  }

  public resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Plays a synthesized acoustic grand piano note
  public playNote(
    midi: number,
    durationSec = 1.2,
    velocity = 0.8,
    startTime?: number
  ) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = startTime ?? this.ctx.currentTime;
    const freq = 440 * Math.pow(2, (midi - 69) / 12);

    // Stereo Panning: Bass on left (-0.6), Treble on right (+0.6)
    const panX = Math.max(-0.65, Math.min(0.65, ((midi - 60) / 36) * 0.7));
    const panner = this.ctx.createStereoPanner();
    panner.pan.setValueAtTime(panX, t);

    const noteGain = this.ctx.createGain();
    // Dynamic scaling
    const peakVolume = Math.max(0.01, Math.min(1.0, velocity * 0.45));

    // Acoustic Piano ADSR:
    // Instant attack (hammer strike), quick initial decay, long smooth harmonic sustain
    noteGain.gain.setValueAtTime(0.0001, t);
    noteGain.gain.exponentialRampToValueAtTime(peakVolume, t + 0.006);
    noteGain.gain.exponentialRampToValueAtTime(peakVolume * 0.65, t + 0.09);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.2, durationSec * 1.6));

    // Acoustic harmonics
    // 1. Fundamental
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, t);

    // 2. Warmth / body (triangle wave at fundamental)
    const oscBody = this.ctx.createOscillator();
    oscBody.type = 'triangle';
    oscBody.frequency.setValueAtTime(freq, t);
    const bodyGain = this.ctx.createGain();
    bodyGain.gain.setValueAtTime(0.35, t);
    oscBody.connect(bodyGain);
    bodyGain.connect(noteGain);

    // 3. Second harmonic (octave shimmer, slightly detuned by +1.5 cents for multi-string chorus)
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, t);
    osc2.detune.setValueAtTime(2.0, t);
    const harm2Gain = this.ctx.createGain();
    harm2Gain.gain.setValueAtTime(0.22, t);
    harm2Gain.gain.exponentialRampToValueAtTime(0.001, t + durationSec * 0.7);
    osc2.connect(harm2Gain);
    harm2Gain.connect(noteGain);

    // 4. Third harmonic (twelfth)
    const osc3 = this.ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 3, t);
    const harm3Gain = this.ctx.createGain();
    harm3Gain.gain.setValueAtTime(0.12, t);
    harm3Gain.gain.exponentialRampToValueAtTime(0.001, t + durationSec * 0.4);
    osc3.connect(harm3Gain);
    harm3Gain.connect(noteGain);

    // Low-pass filter for warmer acoustic timber
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const cutoff = Math.min(10000, freq * 5 + 1200);
    filter.frequency.setValueAtTime(cutoff, t);
    filter.frequency.exponentialRampToValueAtTime(Math.max(300, freq * 1.5), t + durationSec);

    // Hammer strike click transient
    const hammerBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.015), this.ctx.sampleRate);
    const hammerData = hammerBuffer.getChannelData(0);
    for (let i = 0; i < hammerData.length; i++) {
      hammerData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.003));
    }
    const hammerSource = this.ctx.createBufferSource();
    hammerSource.buffer = hammerBuffer;
    const hammerGain = this.ctx.createGain();
    hammerGain.gain.setValueAtTime(velocity * 0.06, t);
    hammerSource.connect(hammerGain);
    hammerGain.connect(filter);

    osc1.connect(noteGain);
    noteGain.connect(filter);
    filter.connect(panner);
    panner.connect(this.masterGain);

    const stopTime = t + Math.max(0.3, durationSec * 1.7);
    osc1.start(t);
    oscBody.start(t);
    osc2.start(t);
    osc3.start(t);
    hammerSource.start(t);

    osc1.stop(stopTime);
    oscBody.stop(stopTime);
    osc2.stop(stopTime);
    osc3.stop(stopTime);
  }

  // Metronome tick sound
  public playClick(isDownbeat = false, time?: number) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = time ?? this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isDownbeat ? 1200 : 800, t);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.05);
  }
}

export const pianoEngine = new PianoAudioEngine();
