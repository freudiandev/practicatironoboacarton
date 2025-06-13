// Como una radio mágica que toca todos los sonidos del juego
class AudioSystem {
  constructor() {
    this.audioContext = null; // La máquina que produce sonidos
    this.volume = CONFIG.audio.volume; // Qué tan fuerte suenan las cosas
    this.enabled = CONFIG.audio.enabled; // Si los sonidos están activados
    this.init(); // Encender la radio
  }

  init() {
    try {
      // Intentar crear la máquina de sonidos del navegador
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('🔊 AudioSystem inicializado');
    } catch (error) {
      console.warn('⚠️ Audio no disponible:', error);
      this.enabled = false; // Si no funciona, quedarse en silencio
    }
  }

  createTone(frequency, duration, type = 'square', volume = 1) {
    // Como crear un sonido específico - frequency es qué tan agudo/grave
    if (!this.enabled || !this.audioContext) return; // No hacer nada si no hay sonido

    const oscillator = this.audioContext.createOscillator(); // Generador de sonido
    const gainNode = this.audioContext.createGain(); // Controlador de volumen

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime); // Qué tan agudo
    oscillator.type = type; // Qué tipo de sonido ('square' = cuadrado, 'sawtooth' = sierra)

    const finalVolume = this.volume * volume * 0.3; // Calcular volumen final
    gainNode.gain.setValueAtTime(finalVolume, this.audioContext.currentTime); // Empezar con volumen
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration); // Bajar gradualmente

    // Conectar todo como cables de un equipo de música
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Empezar y parar el sonido
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playShoot() {
    // Sonido de disparar como un PUM! con varias partes
    this.createTone(1200, 0.05, 'square', 0.8);  // Clic inicial (como gatillo)
    setTimeout(() => this.createTone(400, 0.1, 'sawtooth', 0.9), 20); // Explosión principal (BANG!)
    setTimeout(() => this.createTone(200, 0.15, 'triangle', 0.4), 60); // Eco que se desvanece
  }

  playHit() {
    // Sonido cuando la bala toca algo - como un THACK!
    this.createTone(800, 0.03, 'square', 0.7); // Impacto inicial
    setTimeout(() => this.createTone(400, 0.05, 'sawtooth', 0.5), 30); // Resonancia
  }

  playHeadshot() {
    // Sonido especial de headshot - más dramático
    this.createTone(1500, 0.08, 'square', 1.0);  // Sonido agudo y fuerte
    setTimeout(() => this.createTone(800, 0.12, 'triangle', 0.8), 50);
    setTimeout(() => this.createTone(400, 0.08, 'sawtooth', 0.6), 120);
    
    // Voz sintética diciendo "HEADSHOT"
    this.speakHeadshot();
  }

  speakHeadshot() {
    // Usar Speech Synthesis API para voz sintética
    if ('speechSynthesis' in window) {
      try {
        // Cancelar cualquier discurso previo
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance('HEADSHOT');
        utterance.rate = 1.2; // Velocidad rápida
        utterance.pitch = 1.3; // Tono más agudo
        utterance.volume = this.volume; // Usar volumen del juego
        
        // Intentar encontrar una voz en inglés para mejor pronunciación
        const voices = speechSynthesis.getVoices();
        const englishVoice = voices.find(voice => 
          voice.lang.startsWith('en') || 
          voice.name.toLowerCase().includes('english') ||
          voice.name.toLowerCase().includes('david') ||
          voice.name.toLowerCase().includes('mark')
        );
        
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
        
        speechSynthesis.speak(utterance);
        console.log('🗣️ Voz sintética: HEADSHOT');
      } catch (error) {
        console.warn('⚠️ Error en voz sintética:', error);
      }
    } else {
      console.warn('⚠️ Speech Synthesis no disponible');
    }
  }

  playDeath() {
    this.createTone(400, 0.1, 'triangle', 0.7);
    setTimeout(() => this.createTone(200, 0.2, 'triangle', 0.5), 100);
  }
}

window.AudioSystem = AudioSystem;
console.log('✅ AudioSystem cargado');
