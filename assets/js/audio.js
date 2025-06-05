class AudioSystem {
  constructor() {
    this.audioContext = null;
    this.volume = CONFIG.audio.volume;
    this.enabled = CONFIG.audio.enabled;
    this.init();
  }

  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('🔊 AudioSystem inicializado');
    } catch (error) {
      console.warn('⚠️ Audio no disponible:', error);
      this.enabled = false;
    }
  }

  createTone(frequency, duration, type = 'square', volume = 1) {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;

    const finalVolume = this.volume * volume * 0.3;
    gainNode.gain.setValueAtTime(finalVolume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playShoot() {
    this.createTone(800, 0.1, 'square', 0.8);
  }

  playHit() {
    this.createTone(300, 0.05, 'sawtooth', 0.6);
  }

  playDeath() {
    this.createTone(400, 0.1, 'triangle', 0.7);
    setTimeout(() => this.createTone(200, 0.2, 'triangle', 0.5), 100);
  }

  playHeadshot() {
    this.createTone(1000, 0.15, 'sine', 1.0);
    setTimeout(() => this.createTone(1200, 0.1, 'sine', 0.8), 50);
  }
}

window.AudioSystem = AudioSystem;
console.log('✅ AudioSystem cargado');
