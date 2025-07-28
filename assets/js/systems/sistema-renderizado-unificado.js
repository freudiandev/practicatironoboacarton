/**
 * SISTEMA DE RENDERIZADO UNIFICADO
 * Unifica el renderizado de enemigos y otras funciones visuales dispersas
 * Aprendido del learning-memory: centralizar renderizado en un solo lugar
 */

window.SistemaRenderizadoUnificado = {
  // Configuración
  config: {
    version: '1.0.0',
    debug: true,
    FOV: Math.PI / 3, // 60 grados
    alturaNoboaM: 1.8, // metros
    metrosAUnidades: 32,
    distanciaReferencia: 160,
    alturaReferenciaPx: 180
  },

  // Estado
  initialized: false,
  renderLoop: null,

  /**
   * Inicializar el sistema
   */
  init() {
    console.log('🎨 Inicializando Sistema de Renderizado Unificado v' + this.config.version);
    
    this.initializeEnemyRendering();
    this.setupResizeHandlers();
    
    this.initialized = true;
    console.log('✅ Sistema de Renderizado Unificado inicializado');
    return this;
  },

  /**
   * Inicializar renderizado de enemigos
   */
  initializeEnemyRendering() {
    // Forzar sprites en DOM al cargar
    this.forceNoboaSpritesInDOM();
    
    // Configurar el loop de renderizado
    this.startRenderLoop();
    
    console.log('👾 Renderizado de enemigos inicializado');
  },

  /**
   * Configurar handlers de resize
   */
  setupResizeHandlers() {
    window.addEventListener('resize', () => {
      this.forceNoboaSpritesInDOM();
    });
  },

  /**
   * Iniciar loop de renderizado
   */
  startRenderLoop() {
    const renderLoop = () => {
      this.forceNoboaSpritesInDOM();
      this.renderLoop = window.requestAnimationFrame(renderLoop);
    };
    
    this.renderLoop = window.requestAnimationFrame(renderLoop);
    console.log('🔄 Loop de renderizado iniciado');
  },

  /**
   * Forzar sprites de Noboa en el DOM
   */
  forceNoboaSpritesInDOM() {
    // 1. Asegurar que hay enemigos y datos del juego
    this.ensureGameData();
    
    // 2. Configurar el canvas
    this.setupCanvas();
    
    // 3. Renderizar sprites solo si el menú está oculto
    this.renderSprites();
  },

  /**
   * Asegurar que existen los datos del juego
   */
  ensureGameData() {
    if (!window.GAME) window.GAME = {};
    
    // Crear enemigos si no existen
    if (!window.GAME.enemies || !Array.isArray(window.GAME.enemies) || window.GAME.enemies.length === 0) {
      this.createDefaultEnemies();
    }
    
    // Crear jugador si no existe
    if (!window.GAME.player) {
      this.createDefaultPlayer();
    }
    
    // Cargar sprites si no existen
    if (!window.GAME.enemySprites) {
      this.loadEnemySprites();
    }
  },

  /**
   * Crear enemigos por defecto
   */
  createDefaultEnemies() {
    const tipos = ['casual']; // Solo un tipo para reducir spawns
    window.GAME.enemies = [];
    
    for (let i = 0; i < tipos.length; i++) {
      const pos = this.getSafePosition();
      window.GAME.enemies.push({
        x: pos.x,
        y: pos.y,
        z: 0,
        type: tipos[i],
        active: true
      });
    }
    
    console.log('👾 Enemigos por defecto creados:', window.GAME.enemies.length);
  },

  /**
   * Crear jugador por defecto
   */
  createDefaultPlayer() {
    console.log('=== INICIANDO SPAWN DEL JUGADOR ===');
    const pos = this.getSafePosition();
    console.log('Posición calculada:', pos);
    
    window.GAME.player = { x: pos.x, y: pos.y, angle: 0 };
    
    // Verificar posición con WorldPhysics si está disponible
    this.validatePlayerPosition();
    
    console.log('🎮 Jugador por defecto creado en:', window.GAME.player.x, window.GAME.player.y);
  },

  /**
   * Validar posición del jugador
   */
  validatePlayerPosition() {
    if (!window.WorldPhysics || typeof window.WorldPhysics.checkCollision !== 'function') {
      return;
    }

    let intentos = 0;
    while (window.WorldPhysics.checkCollision(window.GAME.player.x, window.GAME.player.y) && intentos < 10) {
      intentos++;
      console.warn(`🔄 Reintento #${intentos} - Jugador en pared, buscando nueva posición...`);
      
      const nuevaPos = this.getSafePosition();
      window.GAME.player.x = nuevaPos.x;
      window.GAME.player.y = nuevaPos.y;
    }

    if (intentos >= 10) {
      console.error('🆘 ¡CRÍTICO! No se pudo encontrar spawn seguro después de 10 intentos.');
      window.GAME.player.x = 96;
      window.GAME.player.y = 96;
    }
  },

  /**
   * Obtener posición segura
   */
  getSafePosition() {
    // Usar sistema unificado si está disponible
    if (window.SistemaSpawnUnificado && window.SistemaSpawnUnificado.initialized) {
      return window.SistemaSpawnUnificado.buscarCeldaVacia();
    }
    
    // Usar función global si está disponible
    if (window.buscarCeldaVacia) {
      return window.buscarCeldaVacia();
    }
    
    // Posición por defecto
    return { x: 96, y: 96 };
  },

  /**
   * Cargar sprites de enemigos
   */
  loadEnemySprites() {
    window.GAME.enemySprites = {};
    const tiposSprites = ['casual', 'deportivo', 'presidencial'];
    
    tiposSprites.forEach((tipo) => {
      const img = new window.Image();
      img.src = `assets/images/noboa-${tipo}.png`;
      window.GAME.enemySprites[tipo] = img;
    });
    
    console.log('🖼️ Sprites de enemigos cargados');
  },

  /**
   * Configurar canvas
   */
  setupCanvas() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    // Asegurar tamaño mínimo
    if (!canvas.width || canvas.width < 100) canvas.width = 800;
    if (!canvas.height || canvas.height < 100) canvas.height = 600;
    
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    canvas.style.display = 'block';
  },

  /**
   * Renderizar sprites
   */
  renderSprites() {
    const layer = document.getElementById('enemyLayer');
    const mainMenu = document.getElementById('mainMenu');
    const canvas = document.getElementById('gameCanvas');
    
    if (!layer || !canvas) return;

    // Solo renderizar si el menú está oculto
    const menuVisible = mainMenu && mainMenu.style.display !== 'none' && mainMenu.style.display !== '';
    if (menuVisible) {
      layer.innerHTML = '';
      layer.style.display = 'none';
      return;
    }

    // Configurar layer
    this.setupEnemyLayer(layer, canvas);
    
    // Renderizar cada enemigo
    this.renderEnemies(layer, canvas);
  },

  /**
   * Configurar capa de enemigos
   */
  setupEnemyLayer(layer, canvas) {
    layer.innerHTML = '';
    layer.style.display = 'block';
    layer.style.pointerEvents = 'none';
    layer.style.position = 'absolute';
    layer.style.visibility = 'visible';
    layer.style.opacity = '1';
    layer.style.zIndex = '9999';
    layer.classList.remove('hidden');
    
    const rect = canvas.getBoundingClientRect();
    layer.style.left = rect.left + window.scrollX + 'px';
    layer.style.top = rect.top + window.scrollY + 'px';
    layer.style.width = canvas.width + 'px';
    layer.style.height = canvas.height + 'px';
    layer.style.background = 'transparent';
  },

  /**
   * Renderizar enemigos
   */
  renderEnemies(layer, canvas) {
    if (!window.GAME.enemies || !window.GAME.player) return;

    const HALF_FOV = this.config.FOV / 2;
    const player = window.GAME.player;
    const screenW = canvas.width;
    const screenH = canvas.height;
    const alturaNoboaUnidades = this.config.alturaNoboaM * this.config.metrosAUnidades;

    window.GAME.enemies.forEach((enemy, idx) => {
      if (enemy.active === false) return;
      
      const tipo = enemy.type || 'casual';
      const imgObj = window.GAME.enemySprites && window.GAME.enemySprites[tipo];
      if (!imgObj || !imgObj.src) return;

      // Calcular distancia y ángulo
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // No renderizar si está demasiado lejos o cerca
      if (dist < 40 || dist > 1200) return;

      // Calcular ángulo relativo
      const angleToEnemy = Math.atan2(dy, dx);
      let relAngle = angleToEnemy - player.angle;
      
      // Normalizar ángulo
      while (relAngle < -Math.PI) relAngle += 2 * Math.PI;
      while (relAngle > Math.PI) relAngle -= 2 * Math.PI;

      // Proyección horizontal
      const screenX = (screenW / 2) + Math.tan(relAngle) * (screenW / 2) / Math.tan(HALF_FOV);

      // Calcular tamaño del sprite
      const factor_proyeccion = (this.config.alturaReferenciaPx * this.config.distanciaReferencia) / alturaNoboaUnidades;
      const alturaSpritePx = Math.max(32, (alturaNoboaUnidades / dist) * factor_proyeccion);

      // Mantener proporción
      let proporcion = 1;
      if (imgObj.naturalWidth && imgObj.naturalHeight) {
        proporcion = imgObj.naturalWidth / imgObj.naturalHeight;
      } else if (imgObj.width && imgObj.height) {
        proporcion = imgObj.width / imgObj.height;
      }
      
      const anchoSpritePx = alturaSpritePx * proporcion;
      const screenY = screenH - alturaSpritePx - 24;
      const leftEdge = screenX - anchoSpritePx / 2;
      const rightEdge = screenX + anchoSpritePx / 2;

      // No renderizar si está fuera de pantalla
      if (rightEdge < 0 || leftEdge > screenW) return;

      // Verificar visibilidad con WorldPhysics
      if (!this.isEnemyVisible(player, enemy, angleToEnemy, anchoSpritePx)) return;

      // Crear y configurar imagen
      this.createEnemySprite(layer, imgObj, enemy, leftEdge, screenY, anchoSpritePx, alturaSpritePx, dist);
    });
  },

  /**
   * Verificar si el enemigo es visible
   */
  isEnemyVisible(player, enemy, angleToEnemy, anchoSpritePx) {
    if (!window.WorldPhysics || typeof window.WorldPhysics.isVisible !== 'function') {
      return true;
    }

    // Revisar centro, borde izquierdo y derecho del sprite
    const puntosSprite = [
      [enemy.x, enemy.y],
      [enemy.x - (anchoSpritePx / 2) * Math.cos(angleToEnemy + Math.PI / 2), 
       enemy.y - (anchoSpritePx / 2) * Math.sin(angleToEnemy + Math.PI / 2)],
      [enemy.x + (anchoSpritePx / 2) * Math.cos(angleToEnemy + Math.PI / 2), 
       enemy.y + (anchoSpritePx / 2) * Math.sin(angleToEnemy + Math.PI / 2)]
    ];

    for (let i = 0; i < puntosSprite.length; i++) {
      if (window.WorldPhysics.isVisible(player.x, player.y, puntosSprite[i][0], puntosSprite[i][1])) {
        return true;
      }
    }

    return false;
  },

  /**
   * Crear sprite de enemigo
   */
  createEnemySprite(layer, imgObj, enemy, leftEdge, screenY, anchoSpritePx, alturaSpritePx, dist) {
    const img = document.createElement('img');
    img.src = imgObj.src;
    img.alt = enemy.type || 'casual';
    img.style.position = 'absolute';
    img.style.left = leftEdge + 'px';
    img.style.top = screenY + 'px';
    img.style.width = anchoSpritePx + 'px';
    img.style.height = alturaSpritePx + 'px';
    img.style.objectFit = 'contain';
    img.style.pointerEvents = 'none';
    img.style.zIndex = Math.floor(10000 - dist);
    img.style.userSelect = 'none';
    
    layer.appendChild(img);
  },

  /**
   * Parar el loop de renderizado
   */
  stopRenderLoop() {
    if (this.renderLoop) {
      window.cancelAnimationFrame(this.renderLoop);
      this.renderLoop = null;
      console.log('⏹️ Loop de renderizado detenido');
    }
  },

  /**
   * Diagnóstico del sistema
   */
  diagnosticar() {
    console.log('🔍 === DIAGNÓSTICO SISTEMA DE RENDERIZADO ===');
    console.log('Inicializado:', this.initialized);
    console.log('Loop activo:', !!this.renderLoop);
    console.log('Canvas disponible:', !!document.getElementById('gameCanvas'));
    console.log('Enemy layer disponible:', !!document.getElementById('enemyLayer'));
    console.log('Juego disponible:', !!window.GAME);
    
    if (window.GAME) {
      console.log('Jugador:', !!window.GAME.player);
      console.log('Enemigos:', window.GAME.enemies?.length || 0);
      console.log('Sprites cargados:', Object.keys(window.GAME.enemySprites || {}).length);
    }
  }
};

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.SistemaRenderizadoUnificado.init();
  });
} else {
  // DOM ya está listo
  setTimeout(() => {
    window.SistemaRenderizadoUnificado.init();
  }, 300);
}

console.log('📦 Módulo Sistema de Renderizado Unificado cargado');
