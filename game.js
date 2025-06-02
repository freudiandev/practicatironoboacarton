// Sistema de estado del juego global
window.GameState = {
  isActive: false,

  init() {
    console.log('GameState inicializado');
  },

  setActive(active) {
    this.isActive = active;
    console.log(`GameState.isActive = ${this.isActive}`);
  },

  // Método getter para verificar si está activo
  getActive() {
    return this.isActive;
  }
};

// Gestor principal del juego - VERSIÓN LIMPIA
window.Game = {
  initialized: false,
  running: false,
  paused: false,
  animationId: null,
  
  async init() {
    console.log('🎮 Inicializando juego...');
    
    try {
      // Debug: Verificar qué sistemas están disponibles
      console.log('🔍 Verificando sistemas disponibles:');
      console.log('- window.CanvasSystem:', !!window.CanvasSystem);
      console.log('- window.DoomEngine:', !!window.DoomEngine);
      console.log('- window.Player:', !!window.Player);
      console.log('- window.EnemyManager:', !!window.EnemyManager);
      console.log('- window.GAME_CONFIG:', !!window.GAME_CONFIG);
      console.log('- window.MAZE:', !!window.MAZE);
      
      // Verificar que todos los sistemas estén disponibles
      if (!window.CanvasSystem) {
        console.error('❌ CanvasSystem no está disponible');
        throw new Error('CanvasSystem no está disponible');
      }
      if (!window.DoomEngine) {
        console.error('❌ DoomEngine no está disponible');
        throw new Error('DoomEngine no está disponible');
      }
      if (!window.Player) {
        console.error('❌ Player no está disponible');
        throw new Error('Player no está disponible');
      }
      if (!window.EnemyManager) {
        console.error('❌ EnemyManager no está disponible');
        throw new Error('EnemyManager no está disponible');
      }
      
      // Inicializar sistemas en orden
      console.log('🔧 Inicializando CanvasSystem...');
      if (!window.CanvasSystem.init()) {
        throw new Error('Canvas System falló');
      }
      
      console.log('🔧 Inicializando DoomEngine...');
      if (!window.DoomEngine.init()) {
        throw new Error('DOOM Engine falló');
      }
      
      console.log('🔧 Inicializando Player...');
      window.Player.init();
      
      console.log('🔧 Inicializando EnemyManager...');
      window.EnemyManager.init();
      
      this.initialized = true;
      console.log('✅ Juego inicializado correctamente');
      
    } catch (error) {
      console.error('❌ Error inicializando juego:', error);
      throw error;
    }
  },
  
  start() {
    if (!this.initialized) {
      console.error('❌ Juego no inicializado');
      return;
    }
    
    this.running = true;
    this.paused = false;
    this.gameLoop();
    console.log('🚀 Juego iniciado');
  },
  
  stop() {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    console.log('🛑 Juego detenido');
  },
  
  pause() {
    this.paused = true;
    console.log('⏸️ Juego pausado');
  },
  
  resume() {
    this.paused = false;
    console.log('▶️ Juego resumido');
  },
  
  update() {
    if (!this.running || this.paused) return;
    
    try {
      window.Player.update();
      window.EnemyManager.update();
    } catch (error) {
      console.error('Error en update:', error);
    }
  },
  
  render() {
    if (!this.running) return;
    
    try {
      window.DoomEngine.render();
    } catch (error) {
      console.error('Error en render:', error);
    }
  },
  
  gameLoop() {
    if (!this.running) return;
    
    this.update();
    this.render();
    
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }
};

console.log('🎮 Game manager cargado');
