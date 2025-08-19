// Sistema de juego todo-en-uno - VERSIÓN COMPLETA

console.log('🎮 === INICIANDO CARGA DE DOOM GAME ===');

// ===== CONFIGURACIÓN EXPANDIDA =====
window.GAME_CONFIG = {
  cellSize: 128, // Aumentado de 64 a 128 para espacios más grandes
  gridCols: 20, // Ajustado para el nuevo tamaño
  gridRows: 15,
  fov: Math.PI / 3,
  renderDistance: 1000, // Aumentado para el mapa más grande
  wallHeight: 128, // Aumentado proporcionalmente
  playerSpeed: 2.0, // Reducido para menos sensibilidad
  rotationSpeed: 0.03, // Reducido de 0.05 para menos sensibilidad
  playerRadius: 20,
  maxEnemies: 8,
  enemySpeed: 1.0,
  spawnCooldown: 3000,
  fireRate: 300,
  maxAmmo: 30,
  damage: 25,
  bulletSpeed: 10,
  mouseSensitivity: 0.001, // Reducido para menos sensibilidad
  enemyHealth: 50,
  maxWallDepth: 3,
  verticalLookSensitivity: 0.02, // Nueva configuración para mirar arriba/abajo
  enemyMinDistanceFromPlayer: 240, // Distancia mínima para que no se "pegue" al jugador
  showEnemyFallbackMarkers: false, // No mostrar marcadores de cuadrados rojos
  // Ajustes de movimiento tipo "blanco de tiro"
  targetTrack: {
    amplitudeMinCells: 0.8,     // amplitud mínima en múltiplos de cellSize
    amplitudeFallbackCells: 0.6, // amplitud fallback para pasillos cortos
    lateralSpeed: 1.0,          // factor de velocidad lateral base (multiplica enemy.speed)
    advanceSpeed: 0.22,         // factor de avance frontal base (multiplica enemy.speed)
    edgePauseMs: [260, 780],    // rango de pausa en borde
    hideAtEdgesChance: 0.25     // probabilidad de ocultarse en bordes
  },
  // Push-back suave para mantener distancia
  separation: {
    minDistance: 240,           // distancia objetivo mínima (px)
    pushSpeed: 0.32,            // velocidad base de separación (px por tick aprox)
    damping: 0.85               // amortiguación para suavizar
  }
};

// Nuevo mapa tipo casa más espacioso
window.MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1],
  [1,0,1,1,1,0,0,1,0,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,1],
  [1,0,1,0,1,1,1,1,1,1,1,0,1,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// ===== SISTEMA UNIFICADO EXPANDIDO =====
window.DoomGame = {
  canvas: null,
  ctx: null,
  width: 800,
  height: 600,
  running: false,
  animationId: null,
  
  // Game state
  score: 0,
  kills: 0,
  gameTime: 0,
  level: 1,
  
  // Player data expandido con cámara vertical
  player: {
    x: 10 * 128, // Ajustado al nuevo cellSize
    z: 7 * 128,
    angle: 0,
    verticalLook: 0, // Nueva propiedad para mirar arriba/abajo
    health: 100,
    maxHealth: 100,
    keys: {},
    keysPressTime: {}, // Para controlar sensibilidad
    ammo: 30,
    maxAmmo: 30,
    lastShot: 0,
    weapon: 'pistol'
  },
  
  // Enemies system
  enemies: [],
  enemySpawnTimer: 0,
  nextEnemyTypeIndex: 0,
  
  // Bullets system
  bullets: [],
  
  // Items system
  items: [],
  
  // Sound system
  sounds: {
    shoot: null,
    hit: null,
    enemyDeath: null,
    footstep: null,
    reload: null
  },
  
  // Textures (simple patterns)
  textures: {
    wall1: null,
    wall2: null,
    floor: null
  },
  
  init() {
    console.log('🎮 Inicializando DoomGame completo...');
    
    try {
      // Crear canvas
      const gameContainer = document.getElementById('game-container');
      if (!gameContainer) {
        throw new Error('No se encontró game-container');
      }
      
      const existingCanvas = gameContainer.querySelector('canvas');
      if (existingCanvas) {
        existingCanvas.remove();
      }
      
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'gameCanvas';
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.canvas.style.display = 'block';
      this.canvas.style.background = '#000';
      
      gameContainer.appendChild(this.canvas);
      
      this.ctx = this.canvas.getContext('2d');
      if (!this.ctx) {
        throw new Error('No se pudo obtener contexto 2D');
      }
      
      // Inicializar sistemas
  this.initSounds();
  this.initTextures();
  this.setupControls();
  // Spawnear enemigos SOLO cuando los sprites PNG estén listos
  this.spawnInitialEnemies();
  this.spawnItems();
  // Alinear FOV del jugador con configuración para sprites
  this.player.fov = GAME_CONFIG.fov;
      
      // Hacer player global
      window.player = this.player;
      
      // Reset game state
      this.score = 0;
      this.kills = 0;
      this.gameTime = 0;
      
      console.log('✅ DoomGame completo inicializado');
      return true;
      
    } catch (error) {
      console.error('❌ Error inicializando DoomGame:', error);
      throw error;
    }
  },
  
  initSounds() {
    // Crear sonidos simples usando Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      this.sounds = {
        shoot: () => this.playTone(audioContext, 400, 0.1),
        hit: () => this.playTone(audioContext, 200, 0.2),
        enemyDeath: () => this.playTone(audioContext, 150, 0.3),
        footstep: () => this.playTone(audioContext, 100, 0.05),
        reload: () => this.playTone(audioContext, 300, 0.3),
        pickup: () => this.playTone(audioContext, 800, 0.2)
      };
      
      console.log('🔊 Sistema de sonidos inicializado');
    } catch (error) {
      console.warn('⚠️ No se pudo inicializar audio:', error);
      // Sonidos silenciosos como fallback
      Object.keys(this.sounds).forEach(key => {
        this.sounds[key] = () => {};
      });
    }
  },
  
  playTone(audioContext, frequency, duration) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  },
  
  initTextures() {
    // Crear texturas simples usando canvas
    this.textures.wall1 = this.createBrickTexture('#8B4513', '#A0522D');
    this.textures.wall2 = this.createBrickTexture('#696969', '#808080');
    this.textures.floor = this.createFloorTexture('#654321');
    
    console.log('🎨 Texturas inicializadas');
  },
  
  createBrickTexture(color1, color2) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Colores más oscuros para mejor contraste
    ctx.fillStyle = '#5a3317'; // Marrón más oscuro
    ctx.fillRect(0, 0, 64, 64);
    
    ctx.fillStyle = '#6b4423'; // Marrón ligeramente más claro
    for (let y = 0; y < 64; y += 16) {
      for (let x = 0; x < 64; x += 32) {
        ctx.fillRect(x + (y % 32 ? 16 : 0), y, 30, 14);
      }
    }
    
    return canvas;
  },
  
  createFloorTexture(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#2a1f15'; // Suelo más oscuro
    ctx.fillRect(0, 0, 64, 64);
    
    // Patrón de piedras más sutil
    ctx.fillStyle = '#1f1611';
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * 64;
      const y = Math.random() * 64;
      ctx.fillRect(x, y, 2, 2);
    }
    
    return canvas;
  },
  
  setupControls() {
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    document.addEventListener('keydown', (e) => {
      if (!this.player.keysPressTime[e.code]) {
        this.player.keysPressTime[e.code] = Date.now();
      }
      this.player.keys[e.code] = true;
      
      // Teclas especiales
      if (e.code === 'KeyR') {
        this.reload();
      }
    });
    
    document.addEventListener('keyup', (e) => {
      this.player.keys[e.code] = false;
      this.player.keysPressTime[e.code] = 0;
    });
    
    document.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement) {
        this.player.angle += e.movementX * GAME_CONFIG.mouseSensitivity;
        
        // Movimiento vertical del mouse (opcional)
        this.player.verticalLook += e.movementY * GAME_CONFIG.mouseSensitivity;
        this.player.verticalLook = Math.max(-0.5, Math.min(0.5, this.player.verticalLook));
      }
    });
    
    document.addEventListener('click', (e) => {
      // Si es dispositivo táctil, no solicitar pointer lock y permitir que el botón táctil dispare
      if (isTouch) {
        // Evita que clicks de botones táctiles burbujeen y cambien estado de pointer lock
        if (e.target && (e.target.closest && e.target.closest('#mobile-controls')))
          return;
        // En móvil, un tap en el canvas puede disparar directamente
        this.shoot();
        return;
      }
      if (!document.pointerLockElement) {
        this.canvas.requestPointerLock();
      } else {
        this.shoot();
      }
    });
  },
  
  spawnInitialEnemies() {
    const spawnPoints = [
      {x: 2 * 128, z: 2 * 128},
      {x: 17 * 128, z: 2 * 128},
      {x: 2 * 128, z: 12 * 128},
      {x: 17 * 128, z: 12 * 128},
      {x: 9 * 128, z: 6 * 128},
      {x: 6 * 128, z: 9 * 128}
    ];
    
    const types = ['casual', 'deportivo', 'presidencial'];
    const minSpawnDist = GAME_CONFIG.enemyMinDistanceFromPlayer || 240;
    const speedByType = { casual: 0.9, deportivo: 1.4, presidencial: 1.1 };
    spawnPoints.forEach((point, index) => {
      if (this.isValidSpawnPoint(point.x, point.z)) {
        // Saltar puntos demasiado cercanos al jugador
        const dxp = point.x - this.player.x;
        const dzp = point.z - this.player.z;
        if (Math.hypot(dxp, dzp) < minSpawnDist * 1.1) {
          return; // no spawnear tan cerca
        }
        const type = types[index % types.length];
        const enemy = {
          id: index,
          x: point.x,
          z: point.z,
          health: GAME_CONFIG.enemyHealth,
          angle: Math.random() * Math.PI * 2,
          speed: speedByType[type] || GAME_CONFIG.enemySpeed,
          lastMove: 0,
          target: null,
          state: 'target', // comportamiento "blanco de tiro"
          type,
          trackAxis: null,
          trackMin: 0,
          trackMax: 0,
          trackDir: Math.random() < 0.5 ? -1 : 1,
          // comportamiento de blanco de tiro
          pauseAtEdge: true,
          edgePauseRange: GAME_CONFIG.targetTrack.edgePauseMs || [250, 800],
          nextResumeTime: 0,
          hideAtEdges: Math.random() < (GAME_CONFIG.targetTrack.hideAtEdgesChance ?? 0.25),
          hidden: false,
          hideDuration: 300,
          // variables para empuje/ separación suave
          sepVX: 0,
          sepVZ: 0
        };
        // Configurar la pista de movimiento lateral en el pasillo
        this.setupTargetTrack(enemy);
        this.enemies.push(enemy);
      }
    });
    
    console.log(`👾 ${this.enemies.length} enemigos spawneados`);
  },
  
  isValidSpawnPoint(x, z) {
    const mapX = Math.floor(x / GAME_CONFIG.cellSize);
    const mapZ = Math.floor(z / GAME_CONFIG.cellSize);
    
    if (mapX < 0 || mapX >= GAME_CONFIG.gridCols ||
        mapZ < 0 || mapZ >= GAME_CONFIG.gridRows) {
      return false;
    }
    
    return MAZE[mapZ][mapX] === 0;
  },
  
  spawnItems() {
    const itemTypes = [
      {type: 'ammo', x: 4 * 128, z: 4 * 128, color: '#FFD700'},
      {type: 'health', x: 15 * 128, z: 10 * 128, color: '#FF0000'},
      {type: 'ammo', x: 12 * 128, z: 6 * 128, color: '#FFD700'},
      {type: 'health', x: 7 * 128, z: 11 * 128, color: '#FF0000'},
      {type: 'ammo', x: 18 * 128, z: 3 * 128, color: '#FFD700'}
    ];
    
    itemTypes.forEach((item, index) => {
      if (this.isValidSpawnPoint(item.x, item.z)) {
        this.items.push({
          id: index,
          type: item.type,
          x: item.x,
          z: item.z,
          color: item.color,
          collected: false,
          bobOffset: Math.random() * Math.PI * 2
        });
      }
    });
    
    console.log(`📦 ${this.items.length} items spawneados`);
  },
  
  start() {
    this.running = true;
    this.gameStartTime = Date.now();
    this.gameLoop();
    console.log('🚀 Juego completo iniciado');
  },
  
  stop() {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    console.log('🛑 Juego detenido');
  },
  
  update() {
    if (!this.running) return;
    
    const currentTime = Date.now();
    this.gameTime = Math.floor((currentTime - this.gameStartTime) / 1000);
    
    // Update player
    this.updatePlayer();
    
    // Update enemies
    this.updateEnemies(currentTime);

    // Spawn gradual en pasillos SOLO si los sprites están listos
    if (
      this.enemies.length < GAME_CONFIG.maxEnemies &&
      currentTime - this.enemySpawnTimer > GAME_CONFIG.spawnCooldown
    ) {
      this.spawnEnemyInCorridor();
      this.enemySpawnTimer = currentTime;
    }
    
    // Update bullets
    this.updateBullets();
    
    // Check collisions
    this.checkCollisions();
    
    // Update items
    this.updateItems();
    
    // Update HUD
    this.updateHUD();
    
    // Check win/lose conditions
    this.checkGameState();
    
    window.player = this.player;
  },
  
  updatePlayer() {
    const speed = GAME_CONFIG.playerSpeed;
    const rotSpeed = GAME_CONFIG.rotationSpeed;
    const verticalSpeed = GAME_CONFIG.verticalLookSensitivity;
    
    let moveX = 0, moveZ = 0;
    let moved = false;
    
    // Movimiento con menos sensibilidad
    if (this.player.keys['KeyW']) {
      moveX += Math.cos(this.player.angle) * speed;
      moveZ += Math.sin(this.player.angle) * speed;
      moved = true;
    }
    if (this.player.keys['KeyS']) {
      moveX -= Math.cos(this.player.angle) * speed;
      moveZ -= Math.sin(this.player.angle) * speed;
      moved = true;
    }
    if (this.player.keys['KeyA']) {
      moveX += Math.cos(this.player.angle - Math.PI/2) * speed;
      moveZ += Math.sin(this.player.angle - Math.PI/2) * speed;
      moved = true;
    }
    if (this.player.keys['KeyD']) {
      moveX += Math.cos(this.player.angle + Math.PI/2) * speed;
      moveZ += Math.sin(this.player.angle + Math.PI/2) * speed;
      moved = true;
    }
    
    // Aplicar movimiento con colisiones
    if (this.canMoveTo(this.player.x + moveX, this.player.z + moveZ)) {
      this.player.x += moveX;
      this.player.z += moveZ;
      
      // Sonido de pasos ocasional
      if (moved && Math.random() < 0.02) {
        this.sounds.footstep();
      }
    }
    
    // Rotación horizontal con menos sensibilidad
    if (this.player.keys['ArrowLeft']) {
      this.player.angle -= rotSpeed;
    }
    if (this.player.keys['ArrowRight']) {
      this.player.angle += rotSpeed;
    }
    
    // NUEVO: Rotación vertical con flechas arriba/abajo
    if (this.player.keys['ArrowUp']) {
      this.player.verticalLook -= verticalSpeed;
    }
    if (this.player.keys['ArrowDown']) {
      this.player.verticalLook += verticalSpeed;
    }
    
    // Limitar el rango de mirada vertical
    this.player.verticalLook = Math.max(-0.8, Math.min(0.8, this.player.verticalLook));
    
    // Actualizar referencia global
    window.player = this.player;
  },
  
  updateEnemies(currentTime) {
    this.enemies.forEach(enemy => {
      if (enemy.health <= 0) return;

      // Asegurar SIEMPRE el modo "blanco de tiro" y una pista válida
      if (enemy.state !== 'target') {
        enemy.state = 'target';
      }
      if (!enemy.trackAxis) {
        this.setupTargetTrack(enemy);
      }

      // Movimiento lateral por pasillos (target-track)
      this.updateTargetBehavior(enemy, currentTime);
    });
  },
  
  enemyAttack(enemy) {
    // Damage player
    this.player.health -= 10;
    this.sounds.hit();
    
    if (this.player.health <= 0) {
      this.gameOver();
    }
  },
  
  updateBullets() {
    this.bullets = this.bullets.filter(bullet => {
      bullet.x += Math.cos(bullet.angle) * bullet.speed;
      bullet.z += Math.sin(bullet.angle) * bullet.speed;
      
      // Check wall collision
      if (!this.canMoveTo(bullet.x, bullet.z)) {
        return false;
      }
      
      // Check range
      bullet.distance += bullet.speed;
      return bullet.distance < 500;
    });
  },
  
  checkCollisions() {
    // Bullet vs Enemy collisions
    this.bullets.forEach((bullet, bulletIndex) => {
      this.enemies.forEach((enemy, enemyIndex) => {
  if (enemy.health <= 0 || enemy.hidden) return;
        
        const dx = bullet.x - enemy.x;
        const dz = bullet.z - enemy.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance < 20) {
          // Hit!
          enemy.health -= GAME_CONFIG.damage;
          this.bullets.splice(bulletIndex, 1);
          this.sounds.hit();
          
          if (enemy.health <= 0) {
            this.enemyDeath(enemy, enemyIndex);
          }
        }
      });
    });
    
    // Player vs Item collisions
    this.items.forEach((item, index) => {
      if (item.collected) return;
      
      const dx = this.player.x - item.x;
      const dz = this.player.z - item.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance < 30) {
        this.collectItem(item, index);
      }
    });
  },
  
  collectItem(item, index) {
    item.collected = true;
    this.sounds.pickup();
    
    switch (item.type) {
      case 'ammo':
        this.player.ammo = Math.min(this.player.maxAmmo, this.player.ammo + 10);
        break;
      case 'health':
        this.player.health = Math.min(this.player.maxHealth, this.player.health + 25);
        break;
    }
    
    this.score += 50;
  },
  
  updateItems() {
    this.items.forEach(item => {
      if (!item.collected) {
        item.bobOffset += 0.1;
      }
    });
  },
  
  enemyDeath(enemy, index) {
    this.sounds.enemyDeath();
    this.kills++;
    this.score += 100;
    
    // Remove enemy
    this.enemies.splice(index, 1);
    
    console.log(`💀 Enemigo eliminado. Kills: ${this.kills}`);
  },
  
  shoot() {
    const currentTime = Date.now();
    
    if (this.player.ammo <= 0) {
      // Click vacío
      return;
    }
    
    if (currentTime - this.player.lastShot < GAME_CONFIG.fireRate) {
      return;
    }
    
    this.player.ammo--;
    this.player.lastShot = currentTime;
    
    this.bullets.push({
      x: this.player.x,
      z: this.player.z,
      angle: this.player.angle,
      speed: GAME_CONFIG.bulletSpeed,
      distance: 0
    });
    
    this.sounds.shoot();
  },
  
  reload() {
    if (this.player.ammo < this.player.maxAmmo) {
      this.player.ammo = this.player.maxAmmo;
      this.sounds.reload();
    }
  },
  
  updateHUD() {
    // Update HUD elements
    const timerDisplay = document.getElementById('timer-display');
    const killsDisplay = document.getElementById('kills-display');
    const enemyCount = document.getElementById('enemy-count');
    
    if (timerDisplay) {
      const minutes = Math.floor(this.gameTime / 60);
      const seconds = this.gameTime % 60;
      timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    if (killsDisplay) {
      killsDisplay.textContent = this.kills.toString();
    }
    
    if (enemyCount) {
      enemyCount.textContent = this.enemies.filter(e => e.health > 0).length.toString();
    }
  },
  
  checkGameState() {
    // Win condition: all enemies dead
    const aliveEnemies = this.enemies.filter(e => e.health > 0).length;
    if (aliveEnemies === 0) {
      this.gameWin();
    }
    
    // Lose condition: player dead
    if (this.player.health <= 0) {
      this.gameOver();
    }
  },
  
  gameWin() {
    this.running = false;
    this.showGameEnd('¡VICTORIA!', `Puntuación: ${this.score}`, '#00FF00');
  },
  
  gameOver() {
    this.running = false;
    this.showGameEnd('GAME OVER', `Puntuación: ${this.score}`, '#FF0000');
  },
  
  showGameEnd(title, subtitle, color) {
    // Save score
    this.saveScore();
    
    setTimeout(() => {
      alert(`${title}\n${subtitle}\nKills: ${this.kills}\nTiempo: ${this.gameTime}s`);
      if (window.MenuManager) {
        window.MenuManager.showMainMenu();
      }
    }, 100);
  },
  
  saveScore() {
    try {
      const scores = JSON.parse(localStorage.getItem('doomHighscores') || '[]');
      scores.push({
        score: this.score,
        kills: this.kills,
        time: this.gameTime,
        date: new Date().toLocaleDateString(),
        name: 'Player'
      });
      
      scores.sort((a, b) => b.score - a.score);
      localStorage.setItem('doomHighscores', JSON.stringify(scores.slice(0, 10)));
    } catch (error) {
      console.warn('No se pudo guardar puntuación:', error);
    }
  },
  
  canMoveTo(x, z) {
    // Verificar que MAZE esté disponible
    if (!window.MAZE || !window.GAME_CONFIG) {
      return false;
    }
    
    const mapX = Math.floor(x / window.GAME_CONFIG.cellSize);
    const mapZ = Math.floor(z / window.GAME_CONFIG.cellSize);
    
    if (mapX < 0 || mapX >= window.GAME_CONFIG.gridCols ||
        mapZ < 0 || mapZ >= window.GAME_CONFIG.gridRows ||
        !window.MAZE[mapZ]) {
      return false;
    }
    
    return window.MAZE[mapZ][mapX] === 0;
  },
  
  render() {
    if (!this.running || !this.ctx) return;
    
    // 1. Limpiar pantalla completamente en negro
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // 2. Renderizar cielo como rectángulo horizontal en la parte superior
    this.renderSky();
    
    // 3. Renderizar suelo como rectángulo horizontal en la parte inferior
    this.renderFloor();
    
    // 4. Renderizar paredes (encima del cielo y suelo)
    this.renderWalls();
    
    // 5. Render sprites (enemies and items)
    this.renderSprites();
    
    // 6. Crosshair (siempre al frente)
    this.renderCrosshair();
    
    // 7. Debug info expandida
    this.renderDebugInfo();
    
    // 8. Weapon display (siempre al frente)
    this.renderWeapon();
  },
  
  renderSky() {
    // NUEVO: Cielo que se mueve con verticalLook
    const verticalOffset = this.player.verticalLook * this.height * 0.6;
    const skyHeight = this.height / 2 + verticalOffset;
    
    if (skyHeight > 0) {
      const gradient = this.ctx.createLinearGradient(0, 0, 0, skyHeight);
      gradient.addColorStop(0, '#2a3d5a');
      gradient.addColorStop(1, '#1a2a3a');
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.width, Math.max(0, skyHeight));
    }
  },
  
  renderFloor() {
    // NUEVO: Suelo que se mueve con verticalLook
    const verticalOffset = this.player.verticalLook * this.height * 0.6;
    const floorTop = this.height / 2 + verticalOffset;
    const floorHeight = this.height - floorTop;
    
    if (floorHeight > 0 && floorTop < this.height) {
      const gradient = this.ctx.createLinearGradient(0, floorTop, 0, this.height);
      gradient.addColorStop(0, '#2a1f15');
      gradient.addColorStop(1, '#1a120c');
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, Math.max(0, floorTop), this.width, floorHeight);
    }
  },
  
  castMultipleRays(startX, startZ, angle) {
    const stepSize = 2;
    const maxDistance = 800;
    const hits = [];
    let currentDistance = 0;
    
    // Verificar que MAZE esté disponible
    if (!window.MAZE || !window.GAME_CONFIG) {
      console.warn('MAZE o GAME_CONFIG no disponible');
      return [{ distance: maxDistance, hit: false, side: null }];
    }
    
    while (currentDistance < maxDistance && hits.length < 3) {
      let foundHit = false;
      
      // Buscar la siguiente pared desde la posición actual
      for (let distance = currentDistance; distance < maxDistance; distance += stepSize) {
        const x = startX + Math.cos(angle) * distance;
        const z = startZ + Math.sin(angle) * distance;
        
        const mapX = Math.floor(x / window.GAME_CONFIG.cellSize);
        const mapZ = Math.floor(z / window.GAME_CONFIG.cellSize);
        
        // Verificar límites del array antes de acceder
        if (mapX < 0 || mapX >= window.GAME_CONFIG.gridCols ||
            mapZ < 0 || mapZ >= window.GAME_CONFIG.gridRows ||
            !window.MAZE[mapZ] || window.MAZE[mapZ][mapX] === 1) {
          
          // Determinar qué lado de la pared fue golpeado
          const prevX = startX + Math.cos(angle) * (distance - stepSize);
          const prevZ = startZ + Math.sin(angle) * (distance - stepSize);
          const prevMapX = Math.floor(prevX / window.GAME_CONFIG.cellSize);
          const prevMapZ = Math.floor(prevZ / window.GAME_CONFIG.cellSize);
          
          const side = (mapX !== prevMapX) ? 'vertical' : 'horizontal';
          
          hits.push({ distance, hit: true, side });
          
          // Buscar una abertura después de esta pared para continuar el rayo
          let found_opening = false;
          for (let skip = distance + window.GAME_CONFIG.cellSize; skip < distance + window.GAME_CONFIG.cellSize * 2; skip += stepSize) {
            const skipX = startX + Math.cos(angle) * skip;
            const skipZ = startZ + Math.sin(angle) * skip;
            const skipMapX = Math.floor(skipX / window.GAME_CONFIG.cellSize);
            const skipMapZ = Math.floor(skipZ / window.GAME_CONFIG.cellSize);
            
            if (skipMapX >= 0 && skipMapX < window.GAME_CONFIG.gridCols &&
                skipMapZ >= 0 && skipMapZ < window.GAME_CONFIG.gridRows &&
                window.MAZE[skipMapZ] && window.MAZE[skipMapZ][skipMapX] === 0) {
              currentDistance = skip;
              found_opening = true;
              break;
            }
          }
          
          if (!found_opening) {
            // No hay abertura, terminar
            break;
          }
          
          foundHit = true;
          break;
        }
      }
      
      if (!foundHit) {
        break;
      }
    }
    
    // Si no hay hits, devolver un hit por defecto
    if (hits.length === 0) {
      hits.push({ distance: maxDistance, hit: false, side: null });
    }
    
    return hits;
  },

  renderWalls() {
    // Verificar que el contexto esté disponible
    if (!this.ctx) return;
    
    // Renderizar paredes con verificación de errores
    for (let screenX = 0; screenX < this.width; screenX += 4) { // Aumentado step para performance
      const rayAngle = this.player.angle + (screenX - this.width/2) * 0.001;
      
      try {
        const hits = this.castMultipleRays(this.player.x, this.player.z, rayAngle);
        
        // Renderizar desde la pared más lejana hasta la más cercana
        hits.reverse().forEach((hit, index) => {
          if (hit.distance > 0 && hit.hit) {
            const wallHeight = (this.height * 150) / hit.distance; // Ajustado para paredes más altas
            
            // NUEVO: Aplicar offset vertical basado en verticalLook
            const verticalOffset = this.player.verticalLook * this.height * 0.6;
            const wallTop = (this.height - wallHeight) / 2 + verticalOffset;
            const wallBottom = wallTop + wallHeight;
            
            const clampedTop = Math.max(0, wallTop);
            const clampedBottom = Math.min(this.height, wallBottom);
            const clampedHeight = clampedBottom - clampedTop;
            
            if (clampedHeight > 0) {
              const depthFactor = Math.max(0.1, 1 - index * 0.3);
              const distanceFactor = Math.max(0.2, 1 - hit.distance / 800);
              const brightness = depthFactor * distanceFactor;
              
              let baseColor;
              if (hit.side === 'horizontal') {
                baseColor = index === 0 ? [139, 69, 19] : [100, 50, 15];
              } else {
                baseColor = index === 0 ? [101, 67, 33] : [70, 45, 20];
              }
              
              const wallColor = `rgb(${Math.floor(baseColor[0] * brightness)}, ${Math.floor(baseColor[1] * brightness)}, ${Math.floor(baseColor[2] * brightness)})`;
              
              this.ctx.fillStyle = wallColor;
              this.ctx.fillRect(screenX, clampedTop, 4, clampedHeight);
              
              if (index === hits.length - 1 && hit.distance < 200) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                this.ctx.fillRect(screenX, clampedTop, 2, Math.min(4, clampedHeight));
                if (clampedHeight > 8) {
                  this.ctx.fillRect(screenX, clampedBottom - 4, 2, 4);
                }
              }
            }
          }
        });
      } catch (error) {
        console.warn('Error en renderWalls para screenX:', screenX, error);
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(screenX, 0, 4, this.height);
      }
    }
  },

  renderDebugInfo() {
    this.ctx.fillStyle = '#00FF00';
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'left';
    
    const info = [
      `Pos: ${Math.floor(this.player.x)}, ${Math.floor(this.player.z)}`,
      `Ángulo H: ${(this.player.angle * 180 / Math.PI).toFixed(0)}°`,
      `Ángulo V: ${(this.player.verticalLook * 180 / Math.PI).toFixed(0)}°`, // NUEVO
      `Vida: ${this.player.health}/${this.player.maxHealth}`,
      `Munición: ${this.player.ammo}/${this.player.maxAmmo}`,
      `Puntuación: ${this.score}`,
      `Enemigos: ${this.enemies.filter(e => e.health > 0).length}`,
      `Balas: ${this.bullets.length}`
    ];
      
    info.forEach((line, index) => {
      this.ctx.fillText(line, 10, 20 + index * 15);
    });
  },

  renderWeapon() {
    // Dibujar arma simple en la parte inferior
    const weaponX = this.width - 100;
    const weaponY = this.height - 80;
    
    // Pistola simple
    this.ctx.fillStyle = '#444';
    this.ctx.fillRect(weaponX, weaponY, 80, 60);
    
    this.ctx.fillStyle = '#666';
    this.ctx.fillRect(weaponX + 10, weaponY + 10, 60, 40);
    
    // Indicador de munición
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${this.player.ammo}`, weaponX + 40, weaponY + 35);
  },
  
  renderSprites() {
    // Renderizar enemigos con sprites PNG a escala humana si el sistema existe
    if (window.EnemySpriteSystem) {
      // Dibujar usando el sistema de sprites; no ocultar por loading
      this.enemies.forEach(enemy => {
        if (enemy.health <= 0 || enemy.hidden) return;
        try {
          window.EnemySpriteSystem.renderEnemySprite(this.ctx, enemy, this.player);
        } catch (err) {
          // No dibujar fallback rojo si existe el sistema de sprites; solo registrar
          if (window.console && console.warn) {
            console.warn('Sprite render falló, se omite fallback para evitar cuadros rojos:', err);
          }
        }
      });
    } else {
      // Fallback a marcadores simples solo si no hay sistema de sprites
      this.enemies.forEach(enemy => this.renderEnemyFallbackMarker(enemy));
    }
    
    // Renderizar items (distancia menor y formas sin confusión visual)
    this.items.forEach(item => {
      if (item.collected) return;
      
      const dx = item.x - this.player.x;
      const dz = item.z - this.player.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      // Reducir rango para evitar que se vean como píxeles lejanos
      if (distance < 220) {
        const angle = Math.atan2(dz, dx) - this.player.angle;
        const screenX = (this.width / 2) + Math.tan(angle) * (this.width / 2);
        
        if (screenX >= 0 && screenX < this.width) {
          const size = Math.max(8, 110 / distance);
          const bobHeight = Math.sin(item.bobOffset) * 5;
          const screenY = this.height / 2 - size / 2 + bobHeight;

          // Dibujar ítems con formas claras para no confundir con enemigos
          if (item.type === 'ammo') {
            // Círculo dorado con borde
            const grd = this.ctx.createRadialGradient(screenX - size*0.2, screenY + size*0.2, size*0.2, screenX, screenY + size*0.1, size*0.7);
            grd.addColorStop(0, '#ffe680');
            grd.addColorStop(1, '#d4a017');
            this.ctx.fillStyle = grd;
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY + size/2, size/2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.strokeStyle = 'rgba(255,255,255,0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
          } else if (item.type === 'health') {
            // Ícono de corazón rojo estilizado (sin rectángulos)
            const cx = screenX;
            const cy = screenY + size*0.55;
            const w = size * 0.9;
            const h = size * 0.9;
            this.ctx.save();
            this.ctx.translate(cx, cy);
            this.ctx.scale(w/100, h/100);
            this.ctx.beginPath();
            this.ctx.moveTo(0, 20);
            this.ctx.bezierCurveTo(0, 0, -30, 0, -30, 20);
            this.ctx.bezierCurveTo(-30, 40, -10, 55, 0, 70);
            this.ctx.bezierCurveTo(10, 55, 30, 40, 30, 20);
            this.ctx.bezierCurveTo(30, 0, 0, 0, 0, 20);
            this.ctx.closePath();
            this.ctx.fillStyle = '#e53935';
            this.ctx.fill();
            this.ctx.lineWidth = 2.2;
            this.ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            this.ctx.stroke();
            this.ctx.restore();
          } else {
            // Otros: pequeño rombo verde
            this.ctx.fillStyle = '#66bb6a';
            this.ctx.beginPath();
            this.ctx.moveTo(screenX, screenY);
            this.ctx.lineTo(screenX + size/2, screenY + size/2);
            this.ctx.lineTo(screenX, screenY + size);
            this.ctx.lineTo(screenX - size/2, screenY + size/2);
            this.ctx.closePath();
            this.ctx.fill();
          }
        }
      }
    });
  },

  // Dibuja un marcador simple si no hay sprite disponible
  renderEnemyFallbackMarker(enemy) {
  if (!GAME_CONFIG.showEnemyFallbackMarkers) return; // Desactivado por configuración
    if (enemy.health <= 0 || enemy.hidden) return;
    const dx = enemy.x - this.player.x;
    const dz = enemy.z - this.player.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    if (distance >= 500) return;
    const angle = Math.atan2(dz, dx) - this.player.angle;
    const screenX = (this.width / 2) + Math.tan(angle) * (this.width / 2);
    if (screenX < 0 || screenX >= this.width) return;
    const size = Math.max(10, 200 / distance);
    const screenY = this.height / 2 - size / 2;
    // Marcador alternativo no rojo y no cuadrado (triángulo semitransparente)
    this.ctx.fillStyle = 'rgba(0, 150, 255, 0.5)';
    this.ctx.beginPath();
    this.ctx.moveTo(screenX, screenY);
    this.ctx.lineTo(screenX + size/2, screenY + size);
    this.ctx.lineTo(screenX - size/2, screenY + size);
    this.ctx.closePath();
    this.ctx.fill();
  },

  

  // Configura una pista de movimiento lateral para un enemigo en función del laberinto
  setupTargetTrack(enemy) {
    if (!window.MAZE || !window.GAME_CONFIG) return;
    const cell = window.GAME_CONFIG.cellSize;
    const gx = Math.floor(enemy.x / cell);
    const gz = Math.floor(enemy.z / cell);
  const margin = Math.max(12, Math.floor(cell * 0.15));

    const isFree = (x, z) => (
      x >= 0 && x < window.GAME_CONFIG.gridCols &&
      z >= 0 && z < window.GAME_CONFIG.gridRows &&
      window.MAZE[z] && window.MAZE[z][x] === 0
    );

    // Explorar horizontalmente (a lo largo de X)
    let minGX = gx, maxGX = gx;
    while (isFree(minGX - 1, gz)) minGX--;
    while (isFree(maxGX + 1, gz)) maxGX++;
    const minX = minGX * cell + margin;
    const maxX = (maxGX + 1) * cell - margin;
    const lenX = Math.max(0, maxX - minX);

    // Explorar verticalmente (a lo largo de Z)
    let minGZ = gz, maxGZ = gz;
    while (isFree(gx, minGZ - 1)) minGZ--;
    while (isFree(gx, maxGZ + 1)) maxGZ++;
    const minZ = minGZ * cell + margin;
    const maxZ = (maxGZ + 1) * cell - margin;
    const lenZ = Math.max(0, maxZ - minZ);

    // Elegir el eje más largo para moverse de lado a lado
    if (lenX >= lenZ && lenX > cell * 0.6) {
      enemy.trackAxis = 'x';
      // Forzar una amplitud mínima de oscilación configurable
      const minAmp = Math.max(cell * (GAME_CONFIG.targetTrack?.amplitudeMinCells ?? 0.8), 160);
      const center = (minX + maxX) / 2;
      const half = Math.max(minAmp / 2, (maxX - minX) / 2);
      enemy.trackMin = Math.max(minX, center - half);
      enemy.trackMax = Math.min(maxX, center + half);
      // Centrar al enemigo en el corredor sobre Z
      enemy.z = (gz + 0.5) * cell;
      // Ajustar posición a límites
      enemy.x = Math.min(Math.max(enemy.x, enemy.trackMin), enemy.trackMax);
    } else if (lenZ > cell * 0.75) {
      enemy.trackAxis = 'z';
      const minAmp = Math.max(cell * (GAME_CONFIG.targetTrack?.amplitudeMinCells ?? 0.8), 160);
      const center = (minZ + maxZ) / 2;
      const half = Math.max(minAmp / 2, (maxZ - minZ) / 2);
      enemy.trackMin = Math.max(minZ, center - half);
      enemy.trackMax = Math.min(maxZ, center + half);
      // Centrar al enemigo en el corredor sobre X
      enemy.x = (gx + 0.5) * cell;
      enemy.z = Math.min(Math.max(enemy.z, enemy.trackMin), enemy.trackMax);
    } else {
      // Fallback: pequeña oscilación local en X
      enemy.trackAxis = (lenZ > lenX) ? 'z' : 'x';
      const amp = Math.max(cell * (GAME_CONFIG.targetTrack?.amplitudeFallbackCells ?? 0.6), 140);
      if (enemy.trackAxis === 'x') {
        enemy.trackMin = enemy.x - amp / 2;
        enemy.trackMax = enemy.x + amp / 2;
      } else {
        enemy.trackMin = enemy.z - amp / 2;
        enemy.trackMax = enemy.z + amp / 2;
      }
    }
  },

  // Actualiza el movimiento tipo "blanco de tiro" con pausas y posible ocultamiento en extremos
  updateTargetBehavior(enemy, currentTime) {
    // Si está en pausa/oculto, esperar
    if (enemy.nextResumeTime && currentTime < enemy.nextResumeTime) {
      return;
    }
    if (enemy.hidden && currentTime >= enemy.nextResumeTime) {
      enemy.hidden = false;
      enemy.nextResumeTime = 0;
    }

  const speed = Math.max(0.5, enemy.speed * (GAME_CONFIG.targetTrack?.lateralSpeed ?? 1.0));
  const slowAdvance = Math.max(0.06, enemy.speed * (GAME_CONFIG.targetTrack?.advanceSpeed ?? 0.22));

    // Mantener distancia del jugador: no cruzar un radio mínimo
    const dxP = enemy.x - this.player.x;
    const dzP = enemy.z - this.player.z;
    const distP = Math.hypot(dxP, dzP);
  const minDist = (GAME_CONFIG.separation?.minDistance ?? GAME_CONFIG.enemyMinDistanceFromPlayer) || 240;

  if (enemy.trackAxis === 'x') {
      // elegir dirección que aumenta distancia si estamos cerca
      if (distP <= minDist + 10) {
        const dPlus = Math.hypot((enemy.x + speed) - this.player.x, enemy.z - this.player.z);
        const dMinus = Math.hypot((enemy.x - speed) - this.player.x, enemy.z - this.player.z);
        enemy.trackDir = dPlus >= dMinus ? 1 : -1;
      }
      const nextX = enemy.x + enemy.trackDir * speed;
      const dNext = Math.hypot(nextX - this.player.x, enemy.z - this.player.z);
      if (dNext >= minDist) {
        enemy.x = nextX;
      }
  if (enemy.x <= enemy.trackMin) {
        enemy.x = enemy.trackMin; enemy.trackDir = 1; this.scheduleEdgePause(enemy, currentTime);
      }
  if (enemy.x >= enemy.trackMax) {
        enemy.x = enemy.trackMax; enemy.trackDir = -1; this.scheduleEdgePause(enemy, currentTime);
      }
      // Avance frontal ocasional lento si está lejos del jugador
      if (distP > minDist * 1.3 && Math.random() < 0.006) {
        const step = slowAdvance;
        const nextZ = enemy.z + (Math.random() < 0.5 ? step : -step);
        const cell = GAME_CONFIG.cellSize;
        const centerZ = Math.floor(enemy.z / cell) * cell + cell / 2;
        const dNextZ = Math.hypot(enemy.x - this.player.x, nextZ - this.player.z);
        if (dNextZ >= minDist * 1.05) {
          enemy.z = Math.max(centerZ - cell * 0.3, Math.min(centerZ + cell * 0.3, nextZ));
        }
      }
      // Mantener distancia mínima: push-back suave con amortiguación
      if (distP < minDist) {
        const dirX = (enemy.x - this.player.x) / Math.max(0.0001, distP);
        const dirZ = (enemy.z - this.player.z) / Math.max(0.0001, distP);
        const push = (GAME_CONFIG.separation?.pushSpeed ?? 0.32);
        enemy.sepVX = (enemy.sepVX || 0) * (GAME_CONFIG.separation?.damping ?? 0.85) + dirX * push;
        enemy.sepVZ = (enemy.sepVZ || 0) * (GAME_CONFIG.separation?.damping ?? 0.85) + dirZ * push;
        const cell = GAME_CONFIG.cellSize;
        const centerZ = Math.floor(enemy.z / cell) * cell + cell / 2;
        enemy.x = Math.min(Math.max(enemy.x + enemy.sepVX, enemy.trackMin), enemy.trackMax);
        const targetZ = enemy.z + enemy.sepVZ;
        enemy.z = Math.max(centerZ - cell * 0.3, Math.min(centerZ + cell * 0.3, targetZ));
      } else {
        // Desacelerar la separación cuando ya no está cerca
        enemy.sepVX = (enemy.sepVX || 0) * (GAME_CONFIG.separation?.damping ?? 0.85);
        enemy.sepVZ = (enemy.sepVZ || 0) * (GAME_CONFIG.separation?.damping ?? 0.85);
      }
      enemy.angle = enemy.trackDir > 0 ? 0 : Math.PI;
  } else {
      if (distP <= minDist + 10) {
        const dPlus = Math.hypot(enemy.x - this.player.x, (enemy.z + speed) - this.player.z);
        const dMinus = Math.hypot(enemy.x - this.player.x, (enemy.z - speed) - this.player.z);
        enemy.trackDir = dPlus >= dMinus ? 1 : -1;
      }
      const nextZ = enemy.z + enemy.trackDir * speed;
      const dNext = Math.hypot(enemy.x - this.player.x, nextZ - this.player.z);
      if (dNext >= minDist) {
        enemy.z = nextZ;
      }
  if (enemy.z <= enemy.trackMin) {
        enemy.z = enemy.trackMin; enemy.trackDir = 1; this.scheduleEdgePause(enemy, currentTime);
      }
  if (enemy.z >= enemy.trackMax) {
        enemy.z = enemy.trackMax; enemy.trackDir = -1; this.scheduleEdgePause(enemy, currentTime);
      }
      // Avance frontal ocasional lento si está lejos del jugador (eje X)
      if (distP > minDist * 1.3 && Math.random() < 0.006) {
        const step = slowAdvance;
        const nextX = enemy.x + (Math.random() < 0.5 ? step : -step);
        const cell = GAME_CONFIG.cellSize;
        const centerX = Math.floor(enemy.x / cell) * cell + cell / 2;
        const dNextX = Math.hypot(nextX - this.player.x, enemy.z - this.player.z);
        if (dNextX >= minDist * 1.05) {
          enemy.x = Math.max(centerX - cell * 0.3, Math.min(centerX + cell * 0.3, nextX));
        }
      }
      // Mantener distancia mínima: push-back suave con amortiguación
      if (distP < minDist) {
        const dirX = (enemy.x - this.player.x) / Math.max(0.0001, distP);
        const dirZ = (enemy.z - this.player.z) / Math.max(0.0001, distP);
        const push = (GAME_CONFIG.separation?.pushSpeed ?? 0.32);
        enemy.sepVX = (enemy.sepVX || 0) * (GAME_CONFIG.separation?.damping ?? 0.85) + dirX * push;
        enemy.sepVZ = (enemy.sepVZ || 0) * (GAME_CONFIG.separation?.damping ?? 0.85) + dirZ * push;
        const cell = GAME_CONFIG.cellSize;
        const centerX = Math.floor(enemy.x / cell) * cell + cell / 2;
        const targetX = enemy.x + enemy.sepVX;
        enemy.x = Math.max(centerX - cell * 0.3, Math.min(centerX + cell * 0.3, targetX));
        enemy.z = Math.min(Math.max(enemy.z + enemy.sepVZ, enemy.trackMin), enemy.trackMax);
      } else {
        enemy.sepVX = (enemy.sepVX || 0) * (GAME_CONFIG.separation?.damping ?? 0.85);
        enemy.sepVZ = (enemy.sepVZ || 0) * (GAME_CONFIG.separation?.damping ?? 0.85);
      }
      enemy.angle = enemy.trackDir > 0 ? Math.PI/2 : -Math.PI/2;
    }
  },

  scheduleEdgePause(enemy, currentTime) {
    if (!enemy.pauseAtEdge) return;
    const [minP, maxP] = enemy.edgePauseRange || [320, 900];
    const pause = Math.floor(minP + Math.random() * (maxP - minP));
    if (enemy.hideAtEdges) {
      enemy.hidden = true;
    }
    // Limitar tiempo oculto para que el ritmo se sienta constante
    enemy.nextResumeTime = currentTime + (enemy.hidden ? Math.max(220, Math.min(650, Math.floor(pause * 0.55))) : pause);
  },

  // Spawnea un enemigo en una celda que califique como pasillo
  spawnEnemyInCorridor() {
    const cell = GAME_CONFIG.cellSize;
    const spot = this.findRandomCorridorCell(50);
    if (!spot) return;

    const types = ['casual', 'deportivo', 'presidencial'];
    const type = types[this.nextEnemyTypeIndex++ % types.length];
    const speedByType = { casual: 0.9, deportivo: 1.4, presidencial: 1.1 };

    const enemy = {
      id: Date.now(),
      x: spot.x * cell + cell / 2,
      z: spot.z * cell + cell / 2,
      health: GAME_CONFIG.enemyHealth,
      angle: 0,
      speed: speedByType[type] || GAME_CONFIG.enemySpeed,
      lastMove: 0,
      target: null,
      state: 'target',
      type,
      trackAxis: null,
      trackMin: 0,
      trackMax: 0,
      trackDir: Math.random() < 0.5 ? -1 : 1,
      // comportamiento de blanco de tiro
  pauseAtEdge: true,
  edgePauseRange: GAME_CONFIG.targetTrack.edgePauseMs || [250, 800],
      nextResumeTime: 0,
  hideAtEdges: Math.random() < (GAME_CONFIG.targetTrack.hideAtEdgesChance ?? 0.25),
      hidden: false,
      hideDuration: 300
    };
    this.setupTargetTrack(enemy);
    this.enemies.push(enemy);
  },

  // Busca aleatoriamente una celda pasillo (horizontal o vertical)
  findRandomCorridorCell(attempts = 40) {
    const cols = GAME_CONFIG.gridCols;
    const rows = GAME_CONFIG.gridRows;
    const isFree = (x, z) => (
      x >= 0 && x < cols && z >= 0 && z < rows && MAZE[z] && MAZE[z][x] === 0
    );
    const farFromPlayer = (x, z) => {
      const px = Math.floor(this.player.x / GAME_CONFIG.cellSize);
      const pz = Math.floor(this.player.z / GAME_CONFIG.cellSize);
      const dx = x - px, dz = z - pz;
      return (dx*dx + dz*dz) >= 25; // al menos ~5 celdas de distancia
    };

    for (let i = 0; i < attempts; i++) {
      const x = 1 + Math.floor(Math.random() * (cols - 2));
      const z = 1 + Math.floor(Math.random() * (rows - 2));
      if (!isFree(x, z) || !farFromPlayer(x, z)) continue;

      const freeL = isFree(x - 1, z);
      const freeR = isFree(x + 1, z);
      const freeU = isFree(x, z - 1);
      const freeD = isFree(x, z + 1);

      const horizontalCorridor = (freeL || freeR) && !(freeU || freeD);
      const verticalCorridor = (freeU || freeD) && !(freeL || freeR);

      if (horizontalCorridor || verticalCorridor) {
        return { x, z };
      }
    }
    return null;
  },
  
  renderCrosshair() {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const size = 10;
    
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - size, centerY);
    this.ctx.lineTo(centerX + size, centerY);
    this.ctx.moveTo(centerX, centerY - size);
    this.ctx.lineTo(centerX, centerY + size);
    this.ctx.stroke();
  },
  
  gameLoop() {
    if (!this.running) return;
    
    this.update();
    this.render();
    
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }
};

console.log('✅ DoomGame completo cargado y definido en window.DoomGame');
console.log('🔍 Verificación inmediata - window.DoomGame:', !!window.DoomGame);
console.log('🔍 Métodos disponibles:', window.DoomGame ? Object.keys(window.DoomGame).filter(key => typeof window.DoomGame[key] === 'function') : 'N/A');

// Verificación adicional
if (typeof window.DoomGame === 'undefined') {
  console.error('❌ CRÍTICO: DoomGame no se definió correctamente');
} else {
  console.log('✅ DoomGame se definió correctamente');
  
  // Verificar que métodos críticos existan
  const criticalMethods = ['init', 'start', 'stop', 'update', 'render'];
  criticalMethods.forEach(method => {
    if (typeof window.DoomGame[method] === 'function') {
      console.log(`✅ ${method} disponible`);
    } else {
      console.error(`❌ ${method} NO disponible`);
    }
  });
}
