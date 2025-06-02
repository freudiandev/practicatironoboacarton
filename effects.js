class Effects {
  constructor() {
    this.baseUrl = 'http://localhost:3000/api';
    this.listeners = [];
  }

  // Método init requerido por game-core.js
  init() {
    console.log('⚡ Effects API inicializado');
    // Inicializar sistemas de efectos
    if (window.VisualEffects && typeof window.VisualEffects.init === 'function') {
      window.VisualEffects.init();
    }
    if (window.SoundEffects && typeof window.SoundEffects.init === 'function') {
      window.SoundEffects.init();
    }
    if (window.ParticleEffects && typeof window.ParticleEffects.init === 'function') {
      window.ParticleEffects.init();
    }
  }

  // Método render requerido por renderer.js
  render() {
    if (window.VisualEffects && typeof window.VisualEffects.renderEffects === 'function') {
      window.VisualEffects.renderEffects();
    }
    if (window.ParticleEffects && typeof window.ParticleEffects.render === 'function') {
      window.ParticleEffects.render();
    }
  }

  // Método addEffect requerido por weapons.js y enemy-system.js
  addEffect(type, x, z, duration = 500, data = {}) {
    if (window.VisualEffects && typeof window.VisualEffects.addEffect === 'function') {
      window.VisualEffects.addEffect(type, x, z, duration, data);
    }
  }

  // Sistema de eventos para notificar cambios
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // Operaciones CRUD para shootings
  async loadShootings() {
    try {
      this.emit('loading', { type: 'loadShootings', loading: true });
      const response = await fetch(`${this.baseUrl}/shootings`);
      if (!response.ok) throw new Error('Error al cargar shootings');
      const data = await response.json();
      this.emit('shootingsLoaded', data);
      this.emit('loading', { type: 'loadShootings', loading: false });
      return data;
    } catch (error) {
      this.emit('error', { type: 'loadShootings', error: error.message });
      this.emit('loading', { type: 'loadShootings', loading: false });
      console.error('Error en loadShootings:', error);
      throw error;
    }
  }

  async getShooting(id) {
    try {
      this.emit('loading', { type: 'getShooting', loading: true });
      const response = await fetch(`${this.baseUrl}/shootings/${id}`);
      if (!response.ok) throw new Error('Shooting no encontrado');
      const data = await response.json();
      this.emit('shootingLoaded', data);
      this.emit('loading', { type: 'getShooting', loading: false });
      return data;
    } catch (error) {
      this.emit('error', { type: 'getShooting', error: error.message });
      this.emit('loading', { type: 'getShooting', loading: false });
      console.error('Error en getShooting:', error);
      throw error;
    }
  }

  async createShooting(shooting) {
    try {
      this.emit('loading', { type: 'createShooting', loading: true });
      const response = await fetch(`${this.baseUrl}/shootings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shooting)
      });
      if (!response.ok) throw new Error('Error al crear shooting');
      const data = await response.json();
      this.emit('shootingCreated', data);
      this.emit('loading', { type: 'createShooting', loading: false });
      return data;
    } catch (error) {
      this.emit('error', { type: 'createShooting', error: error.message });
      this.emit('loading', { type: 'createShooting', loading: false });
      console.error('Error en createShooting:', error);
      throw error;
    }
  }

  async updateShooting(id, shooting) {
    try {
      this.emit('loading', { type: 'updateShooting', loading: true });
      const response = await fetch(`${this.baseUrl}/shootings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shooting)
      });
      if (!response.ok) throw new Error('Error al actualizar shooting');
      const data = await response.json();
      this.emit('shootingUpdated', data);
      this.emit('loading', { type: 'updateShooting', loading: false });
      return data;
    } catch (error) {
      this.emit('error', { type: 'updateShooting', error: error.message });
      this.emit('loading', { type: 'updateShooting', loading: false });
      console.error('Error en updateShooting:', error);
      throw error;
    }
  }

  async deleteShooting(id) {
    try {
      this.emit('loading', { type: 'deleteShooting', loading: true });
      const response = await fetch(`${this.baseUrl}/shootings/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar shooting');
      this.emit('shootingDeleted', { id });
      this.emit('loading', { type: 'deleteShooting', loading: false });
      return true;
    } catch (error) {
      this.emit('error', { type: 'deleteShooting', error: error.message });
      this.emit('loading', { type: 'deleteShooting', loading: false });
      console.error('Error en deleteShooting:', error);
      throw error;
    }
  }

  async saveScore(shootingId, score) {
    try {
      this.emit('loading', { type: 'saveScore', loading: true });
      const response = await fetch(`${this.baseUrl}/shootings/${shootingId}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(score)
      });
      if (!response.ok) throw new Error('Error al guardar puntuación');
      const data = await response.json();
      this.emit('scoreSaved', data);
      this.emit('loading', { type: 'saveScore', loading: false });
      return data;
    } catch (error) {
      this.emit('error', { type: 'saveScore', error: error.message });
      this.emit('loading', { type: 'saveScore', loading: false });
      console.error('Error en saveScore:', error);
      throw error;
    }
  }

  async getScores(shootingId) {
    try {
      this.emit('loading', { type: 'getScores', loading: true });
      const response = await fetch(`${this.baseUrl}/shootings/${shootingId}/scores`);
      if (!response.ok) throw new Error('Error al cargar puntuaciones');
      const data = await response.json();
      this.emit('scoresLoaded', data);
      this.emit('loading', { type: 'getScores', loading: false });
      return data;
    } catch (error) {
      this.emit('error', { type: 'getScores', error: error.message });
      this.emit('loading', { type: 'getScores', loading: false });
      console.error('Error en getScores:', error);
      throw error;
    }
  }

  // Utilidades
  clearListeners() {
    this.listeners = [];
  }

  setBaseUrl(url) {
    this.baseUrl = url;
  }
}

// Sistema de efectos visuales
const VisualEffects = {
  init() {
    this.bloodSplatters = [];
    this.muzzleFlashes = [];
    this.headshotMessages = [];
    this.sparks = [];
    this.effects = [];
    console.log('💥 VisualEffects inicializado');
  },

  renderHeadshotMessages() {
    if (!this.headshotMessages || this.headshotMessages.length === 0) return;
    
    push();
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    
    for (const msg of this.headshotMessages) {
      fill(255, 255, 0, msg.alpha * 255);
      stroke(255, 0, 0, msg.alpha * 255);
      strokeWeight(2);
      textSize(msg.size);
      text(msg.text, msg.x, msg.y);
    }
    
    noStroke();
    pop();
  },

  renderSparks() {
    if (!this.sparks || this.sparks.length === 0) return;
    
    push();
    for (const spark of this.sparks) {
      fill(255, 255, 0, spark.alpha * 255);
      noStroke();
      ellipse(spark.x, spark.y, spark.size);
    }
    pop();
  },

  updateMuzzleFlashes() {
    this.muzzleFlashes = this.muzzleFlashes.filter(flash => {
      flash.alpha -= 0.1;
      flash.size *= 0.9;
      return flash.alpha > 0;
    });
  },

  updateHeadshotMessages() {
    this.headshotMessages = this.headshotMessages.filter(msg => {
      msg.alpha -= 0.03;
      msg.y -= 2;
      msg.size += 0.2;
      return msg.alpha > 0;
    });
  },

  updateSparks() {
    this.sparks = this.sparks.filter(spark => {
      spark.alpha -= 0.05;
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.vy += 0.2; // Gravedad
      spark.size *= 0.98;
      return spark.alpha > 0 && spark.size > 0.5;
    });
  },

  renderEffects() {
    this.renderBloodSplatters();
    this.renderMuzzleFlashes();
    this.renderHeadshotMessages();
    this.renderSparks();
    this.renderGeneralEffects();
  },

  renderBloodSplatters() {
    if (!this.bloodSplatters || this.bloodSplatters.length === 0) return;
    
    push();
    for (const splatter of this.bloodSplatters) {
      fill(255, 0, 0, splatter.alpha * 255);
      noStroke();
      ellipse(splatter.x, splatter.y, splatter.size);
    }
    pop();
  },

  renderMuzzleFlashes() {
    if (!this.muzzleFlashes || this.muzzleFlashes.length === 0) return;
    
    push();
    for (const flash of this.muzzleFlashes) {
      fill(255, 255, 0, flash.alpha * 255);
      noStroke();
      ellipse(flash.x, flash.y, flash.size);
    }
    pop();
  },

  renderGeneralEffects() {
    if (!this.effects || this.effects.length === 0) return;
    
    push();
    for (const effect of this.effects) {
      fill(effect.color.r, effect.color.g, effect.color.b, effect.alpha * 255);
      noStroke();
      
      push();
      translate(effect.x, effect.z);
      scale(effect.scale);
      ellipse(0, 0, effect.size);
      pop();
    }
    pop();
  },

  addBloodSplatter(x, y, size = 10) {
    this.bloodSplatters.push({
      x: x,
      y: y,
      size: size,
      alpha: 1.0
    });
  },

  addMuzzleFlash(x, y, size = 15) {
    this.muzzleFlashes.push({
      x: x,
      y: y,
      size: size,
      alpha: 1.0
    });
  },

  addHeadshotMessage(x, y, text = "HEADSHOT!") {
    this.headshotMessages.push({
      x: x,
      y: y,
      text: text,
      size: 24,
      alpha: 1.0
    });
  },

  addSparks(x, y, count = 5) {
    for (let i = 0; i < count; i++) {
      this.sparks.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        size: Math.random() * 3 + 1,
        alpha: 1.0
      });
    }
  },

  // Limpiar todos los efectos
  clear() {
    this.bloodSplatters = [];
    this.muzzleFlashes = [];
    this.headshotMessages = [];
    this.sparks = [];
    this.effects = [];
    console.log('🧹 Efectos limpiados');
  },

  addEffect(type, x, z, duration = 500, data = {}) {
    const effect = {
      type: type,
      x: x,
      z: z,
      duration: duration,
      startTime: Date.now(),
      age: 0,
      alpha: 1.0,
      scale: 1.0,
      data: data
    };
    
    // Configurar según tipo
    switch (type) {
      case 'muzzleFlash':
        effect.color = { r: 255, g: 255, b: 0 };
        effect.size = 20;
        effect.duration = 100;
        break;
        
      case 'bulletImpact':
        effect.color = { r: 255, g: 255, b: 255 };
        effect.size = 8;
        effect.duration = 200;
        break;
        
      case 'bloodSplatter':
        effect.color = { r: 255, g: 0, b: 0 };
        effect.size = 15;
        effect.duration = 500;
        break;
        
      case 'enemyDeath':
        effect.color = { r: 128, g: 128, b: 128 };
        effect.size = 25;
        effect.duration = 1000;
        break;
        
      case 'explosion':
        effect.color = { r: 255, g: 100, b: 0 };
        effect.size = 40;
        effect.duration = 800;
        break;
        
      default:
        effect.color = { r: 255, g: 255, b: 255 };
        effect.size = 10;
        break;
    }
    
    this.effects.push(effect);
    console.log(`✨ Efecto añadido: ${type} en (${x}, ${z})`);
  },

  updateEffects() {
    const currentTime = Date.now();
    
    // Actualizar y filtrar efectos
    this.effects = this.effects.filter(effect => {
      effect.age = currentTime - effect.startTime;
      const progress = effect.age / effect.duration;
      
      if (progress >= 1) return false; // Eliminar efectos expirados
      
      // Actualizar propiedades basadas en progreso
      effect.alpha = 1 - progress;
      effect.scale = 1 + (progress * 0.5);
      
      return true;
    });
    
    // Actualizar efectos específicos
    this.updateBloodSplatters();
    this.updateMuzzleFlashes();
    this.updateHeadshotMessages();
    this.updateSparks();
  },

  updateBloodSplatters() {
    this.bloodSplatters = this.bloodSplatters.filter(splatter => {
      splatter.alpha -= 0.02;
      splatter.size += 0.5;
      return splatter.alpha > 0;
    });
  },

  updateMuzzleFlashes() {
    this.muzzleFlashes = this.muzzleFlashes.filter(flash => {
      flash.alpha -= 0.1;
      flash.size *= 0.9;
      return flash.alpha > 0;
    });
  },

  updateHeadshotMessages() {
    this.headshotMessages = this.headshotMessages.filter(msg => {
      msg.alpha -= 0.03;
      msg.y -= 2;
      msg.size += 0.2;
      return msg.alpha > 0;
    });
  },

  updateSparks() {
    this.sparks = this.sparks.filter(spark => {
      spark.alpha -= 0.05;
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.vy += 0.2; // Gravedad
      spark.size *= 0.98;
      return spark.alpha > 0 && spark.size > 0.5;
    });
  },

  renderEffects() {
    this.renderBloodSplatters();
    this.renderMuzzleFlashes();
    this.renderHeadshotMessages();
    this.renderSparks();
    this.renderGeneralEffects();
  },

  renderBloodSplatters() {
    if (!this.bloodSplatters || this.bloodSplatters.length === 0) return;
    
    push();
    for (const splatter of this.bloodSplatters) {
      fill(255, 0, 0, splatter.alpha * 255);
      noStroke();
      ellipse(splatter.x, splatter.y, splatter.size);
    }
    pop();
  },

  renderMuzzleFlashes() {
    if (!this.muzzleFlashes || this.muzzleFlashes.length === 0) return;
    
    push();
    for (const flash of this.muzzleFlashes) {
      fill(255, 255, 0, flash.alpha * 255);
      noStroke();
      ellipse(flash.x, flash.y, flash.size);
    }
    pop();
  },

  renderGeneralEffects() {
    if (!this.effects || this.effects.length === 0) return;
    
    push();
    for (const effect of this.effects) {
      fill(effect.color.r, effect.color.g, effect.color.b, effect.alpha * 255);
      noStroke();
      
      push();
      translate(effect.x, effect.z);
      scale(effect.scale);
      ellipse(0, 0, effect.size);
      pop();
    }
    pop();
  },

  addBloodSplatter(x, y, size = 10) {
    this.bloodSplatters.push({
      x: x,
      y: y,
      size: size,
      alpha: 1.0
    });
  },

  addMuzzleFlash(x, y, size = 15) {
    this.muzzleFlashes.push({
      x: x,
      y: y,
      size: size,
      alpha: 1.0
    });
  },

  addHeadshotMessage(x, y, text = "HEADSHOT!") {
    this.headshotMessages.push({
      x: x,
      y: y,
      text: text,
      size: 24,
      alpha: 1.0
    });
  },

  addSparks(x, y, count = 5) {
    for (let i = 0; i < count; i++) {
      this.sparks.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        size: Math.random() * 3 + 1,
        alpha: 1.0
      });
    }
  },

  // Limpiar todos los efectos
  clear() {
    this.bloodSplatters = [];
    this.muzzleFlashes = [];
    this.headshotMessages = [];
    this.sparks = [];
    this.effects = [];
    console.log('🧹 Efectos limpiados');
  }
};

// Sistema de efectos de sonido
const SoundEffects = {
  sounds: {},
  volume: 0.5,
  enabled: true,

  init() {
    console.log('🔊 SoundEffects inicializado');
  },

  loadSound(name, path) {
    if (typeof loadSound === 'function') {
      this.sounds[name] = loadSound(path);
    } else {
      console.warn('loadSound no disponible, usando Audio API');
      this.sounds[name] = new Audio(path);
    }
  },

  play(name, volume = this.volume) {
    if (!this.enabled || !this.sounds[name]) return;
    
    try {
      if (this.sounds[name].play) {
        this.sounds[name].volume = volume;
        this.sounds[name].play();
      }
    } catch (error) {
      console.warn(`Error reproduciendo sonido ${name}:`, error);
    }
  },

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  },

  toggle() {
    this.enabled = !this.enabled;
    console.log(`🔊 Sonidos ${this.enabled ? 'activados' : 'desactivados'}`);
  }
};

// Sistema de efectos de partículas
const ParticleEffects = {
  particles: [],
  maxParticles: 500,

  init() {
    this.particles = [];
    console.log('✨ ParticleEffects inicializado');
  },

  addParticle(x, y, type = 'default') {
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift();
    }

    const particle = {
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 1.0,
      decay: 0.02,
      size: Math.random() * 3 + 1,
      type: type,
      color: this.getParticleColor(type)
    };

    this.particles.push(particle);
  },

  getParticleColor(type) {
    switch (type) {
      case 'fire': return { r: 255, g: 100, b: 0 };
      case 'smoke': return { r: 128, g: 128, b: 128 };
      case 'spark': return { r: 255, g: 255, b: 0 };
      case 'blood': return { r: 255, g: 0, b: 0 };
      default: return { r: 255, g: 255, b: 255 };
    }
  },

  update() {
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= particle.decay;
      particle.size *= 0.99;
      
      return particle.life > 0 && particle.size > 0.1;
    });
  },

  render() {
    if (!this.particles || this.particles.length === 0) return;
    
    push();
    noStroke();
    
    for (const particle of this.particles) {
      fill(
        particle.color.r,
        particle.color.g,
        particle.color.b,
        particle.life * 255
      );
      ellipse(particle.x, particle.y, particle.size);
    }
    
    pop();
  },

  clear() {
    this.particles = [];
  }
};

// Exportación principal para compatibilidad
const effects = new Effects();

// Browser globals - CORREGIDO: window.Effects debe ser la instancia, no la clase
if (typeof window !== 'undefined') {
  window.Effects = effects; // Instancia, no clase
  window.EffectsClass = Effects; // Clase disponible si se necesita
  window.effects = effects;
  window.VisualEffects = VisualEffects;
  window.SoundEffects = SoundEffects;
  window.ParticleEffects = ParticleEffects;
}

// Exportaciones para diferentes sistemas de módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Effects: Effects,
    effects: effects,
    VisualEffects: VisualEffects,
    SoundEffects: SoundEffects,
    ParticleEffects: ParticleEffects
  };
  module.exports.default = effects; // Exportar instancia por defecto
}

// AMD
if (typeof define === 'function' && define.amd) {
  define(function() {
    return {
      Effects: Effects,
      effects: effects,
      VisualEffects: VisualEffects,
      SoundEffects: SoundEffects,
      ParticleEffects: ParticleEffects
    };
  });
}

// ES6 Module export
if (typeof exports !== 'undefined') {
  exports.Effects = Effects;
  exports.effects = effects;
  exports.VisualEffects = VisualEffects;
  exports.SoundEffects = SoundEffects;
  exports.ParticleEffects = ParticleEffects;
  exports.default = effects; // Exportar instancia por defecto
}

// Verificar que el módulo se carga correctamente
console.log('✅ Módulo Effects cargado correctamente');
console.log('🔧 window.Effects:', typeof window.Effects);
console.log('🔧 window.Effects.init:', typeof window.Effects?.init);
