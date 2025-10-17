/**
 * SISTEMA DE AUDIO PARA DISPAROS
 * Genera sonidos sintéticos de escopeta y voz de headshot
 */

class WeaponAudioSystem {
  constructor() {
    this.audioContext = null;
    this.masterVolume = 0.7;
    this.headshotCount = 0;
    
    // Inicializar contexto de audio
    this.initAudioContext();
  }

  // Inicializar Web Audio API
  initAudioContext() {
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      console.log('🔊 Sistema de audio inicializado');
    } catch (error) {
      console.error('❌ Error al inicializar audio:', error);
    }
  }

  // Asegurar que el contexto está desbloqueado
  async ensureAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Generar sonido de escopeta sintético
  async createShotgunSound() {
    if (!this.audioContext) return;
    
    await this.ensureAudioContext();
    
    const now = this.audioContext.currentTime;
    const duration = 0.8;
    
    // Crear ganancia master
    const masterGain = this.audioContext.createGain();
    masterGain.connect(this.audioContext.destination);
    masterGain.gain.setValueAtTime(this.masterVolume, now);
    
    // === FASE 1: Explosión inicial (click/snap) ===
    const clickOsc = this.audioContext.createOscillator();
    const clickGain = this.audioContext.createGain();
    const clickFilter = this.audioContext.createBiquadFilter();
    
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(1200, now);
    clickOsc.frequency.exponentialRampToValueAtTime(800, now + 0.01);
    
    clickFilter.type = 'bandpass';
    clickFilter.frequency.setValueAtTime(2000, now);
    clickFilter.Q.setValueAtTime(10, now);
    
    clickGain.gain.setValueAtTime(0.3, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    
    clickOsc.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(masterGain);
    
    clickOsc.start(now);
    clickOsc.stop(now + 0.02);
    
    // === FASE 2: Ruido blanco para explosión principal ===
    const noiseBuffer = this.createNoiseBuffer(0.15, 44100);
    const noiseSource = this.audioContext.createBufferSource();
    const noiseGain = this.audioContext.createGain();
    const noiseFilter = this.audioContext.createBiquadFilter();
    
    noiseSource.buffer = noiseBuffer;
    
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(800, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(200, now + 0.1);
    noiseFilter.Q.setValueAtTime(2, now);
    
    noiseGain.gain.setValueAtTime(0.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.1, now + 0.1);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    
    noiseSource.start(now);
    
    // === FASE 3: Resonancia del cañón (tono bajo) ===
    const resonanceOsc = this.audioContext.createOscillator();
    const resonanceGain = this.audioContext.createGain();
    const resonanceFilter = this.audioContext.createBiquadFilter();
    
    resonanceOsc.type = 'sawtooth';
    resonanceOsc.frequency.setValueAtTime(120, now + 0.02);
    resonanceOsc.frequency.exponentialRampToValueAtTime(60, now + 0.4);
    
    resonanceFilter.type = 'lowpass';
    resonanceFilter.frequency.setValueAtTime(300, now);
    
    resonanceGain.gain.setValueAtTime(0, now);
    resonanceGain.gain.linearRampToValueAtTime(0.4, now + 0.02);
    resonanceGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    
    resonanceOsc.connect(resonanceFilter);
    resonanceFilter.connect(resonanceGain);
    resonanceGain.connect(masterGain);
    
    resonanceOsc.start(now + 0.02);
    resonanceOsc.stop(now + 0.5);
    
    // === FASE 4: Eco/reverb simulado ===
    const echoDelay = this.audioContext.createDelay(0.3);
    const echoGain = this.audioContext.createGain();
    const echoFilter = this.audioContext.createBiquadFilter();
    
    echoDelay.delayTime.setValueAtTime(0.08, now);
    echoGain.gain.setValueAtTime(0.2, now);
    echoFilter.type = 'lowpass';
    echoFilter.frequency.setValueAtTime(800, now);
    
    masterGain.connect(echoDelay);
    echoDelay.connect(echoFilter);
    echoFilter.connect(echoGain);
    echoGain.connect(masterGain);
    
    console.log('🔫 Sonido de escopeta disparado');
  }

  // Crear buffer de ruido blanco
  createNoiseBuffer(duration, sampleRate) {
    const length = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    
    return buffer;
  }

  // Generar voz sintética "HEADSHOT" (fallback cuando no hay speechSynthesis)
  async createHeadshotVoice(language = 'en-US') {
    if (!this.audioContext) return;

    await this.ensureAudioContext();

    const now = this.audioContext.currentTime;

  const voiceGain = this.audioContext.createGain();
  voiceGain.connect(this.audioContext.destination);
  const boostedGain = Math.min(1, (this.masterVolume || 0.7) * 1.6);
  voiceGain.gain.setValueAtTime(boostedGain, now);

    const isEnglish = language?.startsWith('en');
    const phrasePlan = isEnglish
      ? [
          { word: 'HEAD', startOffset: 0, duration: 0.38 },
          { word: 'SHOT', startOffset: 0.42, duration: 0.42 }
        ]
      : [
          { word: 'HEAD', startOffset: 0, duration: 0.38 },
          { word: 'SHOT', startOffset: 0.42, duration: 0.42 }
        ];

    for (const segment of phrasePlan) {
      await this.synthesizeWord(
        segment.word,
        now + segment.startOffset,
        voiceGain,
        segment.duration,
        boostedGain
      );
    }

    console.log('💀 Voz sintética de headshot reproducida');
  }

  // Sintetizar una palabra usando formantes
  async synthesizeWord(word, startTime, outputGain, duration, boost = 1) {
    const formants = this.getFormants(word);
    
    for (let formant of formants) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();
      
      // Configurar oscilador
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(formant.freq, startTime);
      
      // Configurar filtro para formante
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(formant.resonance, startTime);
      filter.Q.setValueAtTime(formant.bandwidth, startTime);
      
      // Configurar envolvente
      gain.gain.setValueAtTime(0, startTime);
  const targetAmp = Math.min(1, formant.amplitude * 1.35 * boost);
  gain.gain.linearRampToValueAtTime(targetAmp, startTime + 0.05);
  gain.gain.setValueAtTime(targetAmp, startTime + duration - 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      // Conectar cadena de audio
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(outputGain);
      
      // Iniciar y detener
      osc.start(startTime);
      osc.stop(startTime + duration);
    }
  }

  // Obtener formantes para síntesis de voz
  getFormants(word) {
    const formantData = {
      "HEAD": [
        { freq: 120, resonance: 800, bandwidth: 8, amplitude: 0.6 },  // H
        { freq: 160, resonance: 1200, bandwidth: 6, amplitude: 0.4 }, // E
        { freq: 200, resonance: 1600, bandwidth: 10, amplitude: 0.5 }, // A
        { freq: 140, resonance: 900, bandwidth: 12, amplitude: 0.3 }  // D
      ],
      "SHOT": [
        { freq: 180, resonance: 1000, bandwidth: 15, amplitude: 0.7 }, // SH
        { freq: 160, resonance: 1400, bandwidth: 8, amplitude: 0.5 },  // O
        { freq: 200, resonance: 1800, bandwidth: 20, amplitude: 0.6 }  // T
      ]
    };
    
    return formantData[word] || [];
  }

  // Crear sonido de impacto en metal
  async createMetalImpactSound() {
    if (!this.audioContext) return;
    
    await this.ensureAudioContext();
    
    const now = this.audioContext.currentTime;
    
    // Sonido metálico de impacto
    const metalOsc = this.audioContext.createOscillator();
    const metalGain = this.audioContext.createGain();
    const metalFilter = this.audioContext.createBiquadFilter();
    
    metalOsc.type = 'square';
    metalOsc.frequency.setValueAtTime(1500, now);
    metalOsc.frequency.exponentialRampToValueAtTime(300, now + 0.2);
    
    metalFilter.type = 'highpass';
    metalFilter.frequency.setValueAtTime(800, now);
    
    metalGain.gain.setValueAtTime(0.3, now);
    metalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    metalOsc.connect(metalFilter);
    metalFilter.connect(metalGain);
    metalGain.connect(this.audioContext.destination);
    
    metalOsc.start(now);
    metalOsc.stop(now + 0.3);
  }

  // Crear sonido de carga/recarga
  async createReloadSound() {
    if (!this.audioContext) return;
    
    await this.ensureAudioContext();
    
    const now = this.audioContext.currentTime;
    
    // Simular sonido de recarga de escopeta
    // Click inicial
    const click1 = this.createClickSound(now, 800, 0.1);
    // Sliding/mecánico
    const slide = this.createSlideSound(now + 0.2, 0.3);
    // Click final
    const click2 = this.createClickSound(now + 0.6, 600, 0.15);
    
    console.log('🔄 Sonido de recarga generado');
  }

  // Crear sonido de click metálico
  createClickSound(startTime, frequency, duration) {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(frequency, startTime);
    
    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // Crear sonido de deslizamiento mecánico
  createSlideSound(startTime, duration) {
    const noiseBuffer = this.createNoiseBuffer(duration, 44100);
    const source = this.audioContext.createBufferSource();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    source.buffer = noiseBuffer;
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, startTime);
    filter.Q.setValueAtTime(5, startTime);
    
    gain.gain.setValueAtTime(0.15, startTime);
    gain.gain.setValueAtTime(0.15, startTime + duration - 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);
    
    source.start(startTime);
  }

  // Método principal para disparar
  async fireWeapon() {
    await this.createShotgunSound();
  }

  // Método para headshot
  async headshotAchieved(options = {}) {
    const language = options.language || this.detectPreferredLanguage();
    const phrase = options.phrase || (language.startsWith('es') ? 'disparo fulminante en la cabeza' : 'headshot');

    const usedSpeech = this.trySpeechSynthesis(phrase, language, options.voiceHint);
    if (!usedSpeech) {
      await this.createHeadshotVoice(language);
    }

    this.headshotCount++;
    console.log(`💀 Voz de headshot reproducida (${this.headshotCount} total)`);
  }

  async playHeadshotSound(options = {}) {
    await this.headshotAchieved(options);
  }

  detectPreferredLanguage() {
    if (typeof navigator !== 'undefined' && navigator.language) {
      return navigator.language.toLowerCase();
    }
    return 'es-es';
  }

  trySpeechSynthesis(phrase, language, voiceHint) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = language || 'es-ES';
      utterance.rate = language?.startsWith('es') ? 0.95 : 0.9;
      utterance.pitch = language?.startsWith('es') ? 0.85 : 0.9;
  utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length) {
        const preferred = voices.find(v => voiceHint && v.name.toLowerCase().includes(voiceHint.toLowerCase()));
        const languageMatch = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(language));
        utterance.voice = preferred || languageMatch || voices[0];
      }

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (error) {
      console.error('❌ Error al usar speechSynthesis:', error);
      return false;
    }
  }

  // Ajustar volumen general
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  // Obtener estadísticas
  getStats() {
    return {
      headshotCount: this.headshotCount,
      audioContextState: this.audioContext?.state || 'unavailable'
    };
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.WeaponAudioSystem = WeaponAudioSystem;
}
