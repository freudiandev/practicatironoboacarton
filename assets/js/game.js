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

class DoomGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.running = false;
    this.player = null;
    this.inputSystem = null;
    this.audioSystem = null;
    this.raycasting = null;
    this.bulletSystem = null;
    this.enemySystem = null;
    this.lastShot = 0;
    this.score = 0;
    this.kills = 0;
  }

  init() {
    this.canvas = document.getElementById('gameCanvas');
    if (!this.canvas) {
      console.error('❌ No se encontró el canvas del juego');
      return false;
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.initPlayer();
    this.initSystems();
    
    console.log('✅ DoomGame inicializado correctamente');
    return true;
  }

  initPlayer() {
    this.player = {
      x: CONFIG.player.startX,
      y: CONFIG.player.startY,
      z: CONFIG.player.startZ,
      angle: 0,
      health: CONFIG.player.health,
      ammo: CONFIG.player.maxAmmo,
      speed: CONFIG.player.speed
    };
  }

  initSystems() {
    this.inputSystem = new InputSystem(this.canvas);
    this.audioSystem = new AudioSystem();
    this.raycasting = new RaycastingEngine(this.canvas, this.ctx);
    this.bulletSystem = new BulletSystem();
    this.enemySystem = new EnemySystem();
    this.setupControls();
  }

  setupControls() {
    this.canvas.addEventListener('click', (e) => {
      e.preventDefault();
      this.shoot();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'escape') {
        this.stop();
        if (window.menuManager) window.menuManager.showMainMenu();
      } else if (e.key === ' ') {
        e.preventDefault();
        this.shoot();
      }
    });
  }

  start() {
    this.running = true;
    this.gameLoop();
  }

  stop() {
    this.running = false;
  }

  gameLoop() {
    if (!this.running) return;
    
    const currentTime = Date.now();
    this.update(currentTime);
    this.render();
    requestAnimationFrame(() => this.gameLoop());
  }

  update(currentTime) {
    this.updatePlayer();
    this.bulletSystem.update(currentTime);
    this.enemySystem.update(currentTime, this.player);
    this.checkCollisions();
    this.updateUI();
  }
  updatePlayer() {
    const movement = this.inputSystem.getMovement();
    const deltaTime = 0.016;
    const speed = this.player.speed * deltaTime;
    
    if (movement.x !== 0 || movement.z !== 0) {
      // Movimiento relativo al ángulo del jugador (estilo FPS)
      let newX = this.player.x;
      let newZ = this.player.z;
      
      // W = adelante (en la dirección que mira el jugador)
      if (movement.z < 0) { // W presionado
        newX += Math.cos(this.player.angle) * speed;
        newZ += Math.sin(this.player.angle) * speed;
      }
      
      // S = atrás (opuesto a la dirección que mira el jugador)
      if (movement.z > 0) { // S presionado
        newX -= Math.cos(this.player.angle) * speed;
        newZ -= Math.sin(this.player.angle) * speed;
      }
      
      // A = izquierda (perpendicular a la izquierda)
      if (movement.x < 0) { // A presionado
        newX += Math.cos(this.player.angle - Math.PI/2) * speed;
        newZ += Math.sin(this.player.angle - Math.PI/2) * speed;
      }
      
      // D = derecha (perpendicular a la derecha)
      if (movement.x > 0) { // D presionado
        newX += Math.cos(this.player.angle + Math.PI/2) * speed;
        newZ += Math.sin(this.player.angle + Math.PI/2) * speed;
      }
      
      // Verificar colisiones antes de mover
      if (Utils.canMoveTo(newX, this.player.z)) {
        this.player.x = newX;
      }
      if (Utils.canMoveTo(this.player.x, newZ)) {
        this.player.z = newZ;
      }
    }    // Rotar jugador basado en mouse
    if (this.inputSystem.isMouseActive()) {
      this.player.angle = this.inputSystem.getShootingAngle();
    }
    
    // Rotar jugador con flechas del teclado
    const cameraRotation = this.inputSystem.getCameraRotation();
    if (cameraRotation.horizontal !== 0) {
      const rotationSpeed = 2.0 * deltaTime; // Velocidad de rotación
      this.player.angle += cameraRotation.horizontal * rotationSpeed;
      
      // Normalizar ángulo entre -π y π
      while (this.player.angle > Math.PI) this.player.angle -= 2 * Math.PI;
      while (this.player.angle < -Math.PI) this.player.angle += 2 * Math.PI;
    }
  }

  checkCollisions() {
    const hits = this.bulletSystem.checkCollisions(this.enemySystem.enemies);
    
    hits.forEach(hit => {
      const died = this.enemySystem.takeDamage(hit.enemy, hit.damage, hit.isHeadshot);
      
      if (hit.isHeadshot) {
        this.showHeadshotIndicator();
        this.audioSystem.playHeadshot();
        this.score += 100;
      } else {
        this.audioSystem.playHit();
        this.score += 25;
      }
      
      if (died) {
        this.audioSystem.playDeath();
        this.kills++;
        this.score += 200;
      }
      
      this.bulletSystem.removeBullet(hit.bulletIndex);
    });
  }

  shoot() {
    const currentTime = Date.now();
    if (currentTime - this.lastShot < CONFIG.bullet.cooldown || this.player.ammo <= 0) return;
    
    this.player.ammo--;
    this.lastShot = currentTime;
    this.audioSystem.playShoot();
    
    const angle = this.inputSystem.getShootingAngle();
    this.bulletSystem.addBullet(this.player.x, this.player.z, this.player.y, angle);
  }

  showHeadshotIndicator() {
    const indicator = document.getElementById('headshotIndicator');
    indicator.textContent = 'HEADSHOT!';
    indicator.style.display = 'block';
    
    setTimeout(() => {
      indicator.style.display = 'none';
    }, CONFIG.ui.headshotDuration);
  }
  render() {
    this.raycasting.render(this.player);
    this.bulletSystem.render(this.ctx, this.player);
    this.enemySystem.render(this.ctx, this.player, this.raycasting);
    this.renderCrosshair();
  }

  renderCrosshair() {
    const pos = this.inputSystem.getCrosshairPosition();
    if (!pos) return;
    
    this.ctx.save();
    this.ctx.strokeStyle = CONFIG.ui.crosshairColor;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.shadowColor = '#000000';
    this.ctx.shadowBlur = 2;
    
    const size = CONFIG.ui.crosshairSize;
    const gap = 6;
    
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x - size, pos.y);
    this.ctx.lineTo(pos.x - gap, pos.y);
    this.ctx.moveTo(pos.x + gap, pos.y);
    this.ctx.lineTo(pos.x + size, pos.y);
    this.ctx.moveTo(pos.x, pos.y - size);
    this.ctx.lineTo(pos.x, pos.y - gap);
    this.ctx.moveTo(pos.x, pos.y + gap);
    this.ctx.lineTo(pos.x, pos.y + size);
    this.ctx.stroke();
    
    // Punto central
    this.ctx.fillStyle = CONFIG.ui.crosshairColor;
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }

  updateUI() {
    document.getElementById('health').textContent = this.player.health;
    document.getElementById('ammo').textContent = this.player.ammo;
    document.getElementById('enemies').textContent = this.enemySystem.getAliveCount();
    document.getElementById('score').textContent = this.score;
  }
}

window.DoomGame = DoomGame;

console.log('🎮 Game manager cargado');
