/**
 * SISTEMA DE SPAWN UNIFICADO
 * Unifica todas las funciones de spawn dispersas por el proyecto
 * Aprendido del learning-memory: evitar duplicación de funciones
 */

window.SistemaSpawnUnificado = {
  // Configuración
  config: {
    version: '1.0.0',
    debug: true
  },

  // Estado
  initialized: false,
  lastSpawnPosition: null,
  spawnAttempts: 0,

  /**
   * Inicializar el sistema
   */
  init() {
    console.log('🎯 Inicializando Sistema de Spawn Unificado v' + this.config.version);
    this.initialized = true;
    
    // Conectar con otros sistemas si están disponibles
    this.connectSystems();
    
    console.log('✅ Sistema de Spawn Unificado inicializado');
    return this;
  },

  /**
   * Conectar con otros sistemas existentes
   */
  connectSystems() {
    // Conectar con SpawnManager si existe
    if (window.SpawnManager) {
      console.log('🔗 Conectado con SpawnManager');
      this.spawnManager = window.SpawnManager;
    }

    // Conectar con WorldPhysics si existe
    if (window.WorldPhysics) {
      console.log('🔗 Conectado con WorldPhysics');
      this.worldPhysics = window.WorldPhysics;
    }

    // Conectar con MapCartographer si existe
    if (window.MapCartographer) {
      console.log('🔗 Conectado con MapCartographer');
      this.cartographer = window.MapCartographer;
    }
  },

  /**
   * Función principal unificada para buscar celda vacía
   * ESTA FUNCIÓN REEMPLAZA TODAS LAS VERSIONES DUPLICADAS
   */
  buscarCeldaVacia() {
    this.spawnAttempts++;
    console.log(`🔍 === BÚSQUEDA DE SPAWN #${this.spawnAttempts} ===`);

    if (!window.GAME || !window.GAME.mapaColisiones) {
      console.warn('⚠️ No hay mapa de colisiones disponible');
      return this.getEmergencyPosition();
    }

    const mapa = window.GAME.mapaColisiones;
    const ancho = mapa[0] ? mapa[0].length : 0;
    const alto = mapa.length;
    
    console.log(`📏 Dimensiones del mapa: ${ancho}x${alto}`);

    // NIVEL 1: Usar sistemas avanzados si están disponibles
    const advancedPosition = this.tryAdvancedSystems();
    if (advancedPosition) {
      console.log('✅ Spawn encontrado por sistemas avanzados:', advancedPosition);
      this.lastSpawnPosition = advancedPosition;
      return advancedPosition;
    }

    // NIVEL 2: Búsqueda ultra segura (área 7x7 libre)
    console.log('🔍 Nivel 2: Búsqueda ultra segura...');
    const ultraSafePosition = this.findUltraSafePosition(mapa, ancho, alto);
    if (ultraSafePosition) {
      console.log('✅ Posición ultra segura encontrada:', ultraSafePosition);
      this.lastSpawnPosition = ultraSafePosition;
      return ultraSafePosition;
    }

    // NIVEL 3: Búsqueda segura estándar (área 5x5 libre)
    console.log('🔍 Nivel 3: Búsqueda segura estándar...');
    const safePosition = this.findSafePosition(mapa, ancho, alto);
    if (safePosition) {
      console.log('✅ Posición segura encontrada:', safePosition);
      this.lastSpawnPosition = safePosition;
      return safePosition;
    }

    // NIVEL 4: Búsqueda mínima viable (celda individual libre)
    console.log('🔍 Nivel 4: Búsqueda mínima viable...');
    const basicPosition = this.findBasicPosition(mapa, ancho, alto);
    if (basicPosition) {
      console.log('✅ Posición básica encontrada:', basicPosition);
      this.lastSpawnPosition = basicPosition;
      return basicPosition;
    }

    // EMERGENCIA: Posición fija conocida
    console.error('🆘 EMERGENCIA: Usando posición fija');
    const emergencyPos = this.getEmergencyPosition();
    this.lastSpawnPosition = emergencyPos;
    return emergencyPos;
  },

  /**
   * Intentar usar sistemas avanzados
   */
  tryAdvancedSystems() {
    // Intentar SpawnManager
    if (this.spawnManager && typeof this.spawnManager.buscarCeldaVacia === 'function') {
      try {
        return this.spawnManager.buscarCeldaVacia();
      } catch (e) {
        console.warn('⚠️ Error en SpawnManager:', e.message);
      }
    }

    // Intentar WorldPhysics
    if (this.worldPhysics && typeof this.worldPhysics.getSafeSpawnPosition === 'function') {
      try {
        return this.worldPhysics.getSafeSpawnPosition();
      } catch (e) {
        console.warn('⚠️ Error en WorldPhysics:', e.message);
      }
    }

    // Intentar MapCartographer
    if (this.cartographer && typeof this.cartographer.getBestSpawnPosition === 'function') {
      try {
        return this.cartographer.getBestSpawnPosition();
      } catch (e) {
        console.warn('⚠️ Error en MapCartographer:', e.message);
      }
    }

    return null;
  },

  /**
   * Verificar si una celda está libre
   */
  esCeldaLibre(x, y, mapa) {
    const ancho = mapa[0] ? mapa[0].length : 0;
    const alto = mapa.length;
    
    if (x < 0 || y < 0 || x >= ancho || y >= alto) return false;
    return mapa[y][x] === 0;
  },

  /**
   * Verificar si un área es ultra segura (7x7)
   */
  esCeldaUltraSegura(x, y, mapa) {
    if (!this.esCeldaLibre(x, y, mapa)) return false;
    
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        if (!this.esCeldaLibre(x + dx, y + dy, mapa)) return false;
      }
    }
    return true;
  },

  /**
   * Verificar si un área es segura (5x5)
   */
  esCeldaSegura(x, y, mapa) {
    if (!this.esCeldaLibre(x, y, mapa)) return false;
    
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        if (!this.esCeldaLibre(x + dx, y + dy, mapa)) return false;
      }
    }
    return true;
  },

  /**
   * Buscar posición ultra segura
   */
  findUltraSafePosition(mapa, ancho, alto) {
    // Buscar desde el centro hacia afuera
    const centerX = Math.floor(ancho / 2);
    const centerY = Math.floor(alto / 2);
    
    // Verificar el centro exacto primero
    if (this.esCeldaUltraSegura(centerX, centerY, mapa)) {
      return this.cellToWorld(centerX, centerY);
    }
    
    // Buscar en círculos expandiéndose desde el centro
    for (let radio = 1; radio <= Math.min(ancho, alto) / 4; radio++) {
      for (let angulo = 0; angulo < 360; angulo += 30) {
        const rad = angulo * Math.PI / 180;
        const x = Math.floor(centerX + Math.cos(rad) * radio);
        const y = Math.floor(centerY + Math.sin(rad) * radio);
        
        if (this.esCeldaUltraSegura(x, y, mapa)) {
          return this.cellToWorld(x, y);
        }
      }
    }
    
    return null;
  },

  /**
   * Buscar posición segura estándar
   */
  findSafePosition(mapa, ancho, alto) {
    for (let y = 3; y < alto - 3; y++) {
      for (let x = 3; x < ancho - 3; x++) {
        if (this.esCeldaSegura(x, y, mapa)) {
          return this.cellToWorld(x, y);
        }
      }
    }
    return null;
  },

  /**
   * Buscar posición básica
   */
  findBasicPosition(mapa, ancho, alto) {
    for (let y = 1; y < alto - 1; y++) {
      for (let x = 1; x < ancho - 1; x++) {
        if (this.esCeldaLibre(x, y, mapa)) {
          return this.cellToWorld(x, y);
        }
      }
    }
    return null;
  },

  /**
   * Convertir coordenadas de celda a mundo
   */
  cellToWorld(x, y) {
    return {
      x: x * 32 + 16,
      y: y * 32 + 16
    };
  },

  /**
   * Obtener posición de emergencia
   */
  getEmergencyPosition() {
    return { x: 96, y: 96 };
  },

  /**
   * Validar posición con WorldPhysics si está disponible
   */
  validatePosition(x, y) {
    if (this.worldPhysics && typeof this.worldPhysics.checkCollision === 'function') {
      return !this.worldPhysics.checkCollision(x, y);
    }
    return true; // Asumir válida si no hay sistema de validación
  },

  /**
   * Diagnóstico del sistema
   */
  diagnosticar() {
    console.log('🔍 === DIAGNÓSTICO SISTEMA DE SPAWN ===');
    console.log('Inicializado:', this.initialized);
    console.log('Intentos de spawn:', this.spawnAttempts);
    console.log('Última posición:', this.lastSpawnPosition);
    console.log('SpawnManager disponible:', !!this.spawnManager);
    console.log('WorldPhysics disponible:', !!this.worldPhysics);
    console.log('MapCartographer disponible:', !!this.cartographer);
    console.log('Mapa de colisiones:', !!(window.GAME && window.GAME.mapaColisiones));
    
    if (window.GAME && window.GAME.mapaColisiones) {
      const mapa = window.GAME.mapaColisiones;
      console.log('Dimensiones del mapa:', `${mapa[0]?.length || 0}x${mapa.length}`);
    }
  },

  /**
   * Reposicionar jugador con verificación
   */
  reposicionarJugador() {
    if (!window.GAME || !window.GAME.player) {
      console.error('❌ No hay jugador para reposicionar');
      return false;
    }

    const posicionAnterior = { x: window.GAME.player.x, y: window.GAME.player.y };
    console.log('🔄 Reposicionando jugador desde:', posicionAnterior);

    // Verificar si realmente está en pared
    const estaEnPared = !this.validatePosition(posicionAnterior.x, posicionAnterior.y);
    console.log('¿Está en pared?', estaEnPared ? 'SÍ' : 'NO');

    const nuevaPos = this.buscarCeldaVacia();
    window.GAME.player.x = nuevaPos.x;
    window.GAME.player.y = nuevaPos.y;

    console.log('✅ Jugador reposicionado a:', nuevaPos);

    // Verificar nueva posición
    const nuevaPosValida = this.validatePosition(nuevaPos.x, nuevaPos.y);
    if (!nuevaPosValida) {
      console.error('⚠️ Nueva posición también está en pared');
      // Forzar posición de emergencia
      window.GAME.player.x = 128;
      window.GAME.player.y = 128;
      console.log('🆘 Forzando posición de emergencia: (128, 128)');
    }

    return true;
  }
};

// Función global unificada para compatibilidad
window.buscarCeldaVacia = function() {
  if (!window.SistemaSpawnUnificado.initialized) {
    window.SistemaSpawnUnificado.init();
  }
  return window.SistemaSpawnUnificado.buscarCeldaVacia();
};

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.SistemaSpawnUnificado.init();
  });
} else {
  // DOM ya está listo
  setTimeout(() => {
    window.SistemaSpawnUnificado.init();
  }, 100);
}

console.log('📦 Módulo Sistema de Spawn Unificado cargado');
