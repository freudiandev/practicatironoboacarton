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
  maxEnemies: 4,         // Reducido de 8 a 4 para menos densidad
  enemySpeed: 1.0,
  spawnCooldown: 5000,   // Aumentado de 3000 a 5000ms para spawns más espaciados
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
    amplitudeMinCells: 1.2,     // amplitud mínima en múltiplos de cellSize - aumentada para más recorrido
    amplitudeFallbackCells: 0.8, // amplitud fallback para pasillos cortos
    lateralSpeed: 0.7,          // factor de velocidad lateral base - reducida para más control
    advanceSpeed: 0.15,         // factor de avance frontal base - reducida
    edgePauseMs: [800, 1500],   // rango de pausa en borde - aumentada para más tiempo visible
    hideAtEdgesChance: 0.15,    // probabilidad de ocultarse en bordes - reducida
    predictablePattern: true,   // Nuevo: activar patrones predecibles
    rhythmicMovement: true      // Nuevo: movimiento rítmico como blanco de tiro
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
  this.initWeaponSystems();
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
  
  initWeaponSystems() {
    console.log('🔫 Inicializando sistemas de armas...');
    
    // Verificar disponibilidad de clases
    console.log('BulletEffectsSystem disponible:', typeof BulletEffectsSystem !== 'undefined');
    console.log('WeaponAudioSystem disponible:', typeof WeaponAudioSystem !== 'undefined');
    
    // Inicializar sistema de efectos de balas
    if (typeof BulletEffectsSystem !== 'undefined') {
      try {
        this.bulletEffects = new BulletEffectsSystem();
        console.log('✅ Sistema de efectos de balas cargado');
        
        // Verificar métodos críticos
        if (typeof this.bulletEffects.render === 'function') {
          console.log('✅ Método render disponible');
        } else {
          console.error('❌ Método render NO disponible');
        }
        
        if (typeof this.bulletEffects.createBullet === 'function') {
          console.log('✅ Método createBullet disponible');
        } else {
          console.error('❌ Método createBullet NO disponible');
        }
        
      } catch (error) {
        console.error('❌ Error instanciando BulletEffectsSystem:', error);
      }
    } else {
      console.error('❌ BulletEffectsSystem no disponible - verificar carga de bullet-effects.js');
    }
    
    // Inicializar sistema de audio de armas
    if (typeof WeaponAudioSystem !== 'undefined') {
      try {
        this.weaponAudio = new WeaponAudioSystem();
        console.log('✅ Sistema de audio de armas cargado');
        
        // Verificar métodos críticos
        if (typeof this.weaponAudio.playShotgunSound === 'function') {
          console.log('✅ Método playShotgunSound disponible');
        } else {
          console.error('❌ Método playShotgunSound NO disponible');
        }
        
      } catch (error) {
        console.error('❌ Error instanciando WeaponAudioSystem:', error);
      }
    } else {
      console.error('❌ WeaponAudioSystem no disponible - verificar carga de weapon-audio.js');
    }
    
    // Contador de headshots
    this.headshots = 0;
    
    // Estado de depuración
    console.log('🎯 Estado final de sistemas de armas:');
    console.log('- bulletEffects:', !!this.bulletEffects);
    console.log('- weaponAudio:', !!this.weaponAudio);
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
      
      // Salir del pointer lock con ESC
      if (e.code === 'Escape' && document.pointerLockElement) {
        document.exitPointerLock();
        e.preventDefault();
      }
    });
    
    document.addEventListener('keyup', (e) => {
      this.player.keys[e.code] = false;
      this.player.keysPressTime[e.code] = 0;
    });
    
    // Sistema de captura de mouse mejorado
    this.setupMouseCapture();
    
    document.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement) {
        this.player.angle += e.movementX * GAME_CONFIG.mouseSensitivity;
        
        // Movimiento vertical del mouse - CORREGIDO: mouse arriba = cámara arriba
        this.player.verticalLook -= e.movementY * GAME_CONFIG.mouseSensitivity;
        this.player.verticalLook = Math.max(-0.5, Math.min(0.5, this.player.verticalLook));
      }
    });
  },
  
  // Configurar sistema de captura de mouse
  setupMouseCapture() {
    const popup = document.getElementById('mouse-capture-popup');
    const canvas = this.canvas;
    
    // Evento específico para clic en el canvas
    canvas.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      
      if (isTouch) {
        // En móvil, disparar directamente
        this.shoot();
        return;
      }
      
      if (!document.pointerLockElement) {
        console.log('🖱️ Solicitando captura de mouse en canvas...');
        canvas.requestPointerLock();
      } else {
        this.shoot();
      }
    });
    
    // Eventos de pointer lock
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === canvas) {
        // Mouse capturado - ocultar popup
        if (popup) popup.style.display = 'none';
        if (canvas) canvas.classList.add('mouse-captured');
        console.log('🎯 Mouse capturado - Modo juego activado');
      } else {
        // Mouse liberado - mostrar popup
        if (popup) popup.style.display = 'block';
        if (canvas) canvas.classList.remove('mouse-captured');
        console.log('🖱️ Mouse liberado - Mostrar popup');
      }
    });
    
    // Error de pointer lock
    document.addEventListener('pointerlockerror', () => {
      console.error('❌ Error al capturar el pointer lock');
    });
    
    // Inicializar estado - mostrar popup al inicio
    if (popup) popup.style.display = 'block';
  },
  
  spawnInitialEnemies() {
    console.log('🎯 SPAWNING ENEMIES - DEBUG MODE');
    console.log(`Player position: (${this.player.x}, ${this.player.z})`);
    
    // TEMPORAL: Crear un enemigo muy cerca del jugador para testing
    const testEnemy = {
      id: 999,
      x: this.player.x + 200, // 200 pixels adelante
      z: this.player.z,
      health: 100,
      angle: 0,
      speed: 1.0,
      lastMove: 0,
      target: null,
      state: 'target',
      type: 'casual',
      trackAxis: null,
      trackMin: 0,
      trackMax: 0,
      trackDir: 1,
      pauseAtEdge: false,
      edgePauseRange: [250, 800],
      nextResumeTime: 0,
      hideAtEdges: false,
      hidden: false,
      hideDuration: 300,
      sepVX: 0,
      sepVZ: 0
    };
    
    this.enemies.push(testEnemy);
    console.log(`✅ Test enemy created at (${testEnemy.x}, ${testEnemy.z})`);
    
    const spawnPoints = [
      {x: 2 * 128, z: 2 * 128},
      {x: 17 * 128, z: 2 * 128},
      {x: 2 * 128, z: 12 * 128},
      {x: 17 * 128, z: 12 * 128},
      {x: 9 * 128, z: 6 * 128},
      {x: 6 * 128, z: 9 * 128}
    ];
    
    const types = ['casual', 'deportivo', 'presidencial'];
    const minSpawnDist = 50; // TEMPORAL: Reducido para debug (era GAME_CONFIG.enemyMinDistanceFromPlayer || 240)
    const speedByType = { casual: 0.9, deportivo: 1.4, presidencial: 1.1 };
    spawnPoints.forEach((point, index) => {
      if (this.isValidSpawnPoint(point.x, point.z)) {
        // Saltar puntos demasiado cercanos al jugador
        const dxp = point.x - this.player.x;
        const dzp = point.z - this.player.z;
        if (Math.hypot(dxp, dzp) < minSpawnDist * 1.1) {
          console.log(`⚠️ Skipping spawn point ${index} - too close to player: ${Math.round(Math.hypot(dxp, dzp))} < ${minSpawnDist * 1.1}`);
          return; // no spawnear tan cerca
        }
        console.log(`✅ Spawning enemy ${index} at (${point.x}, ${point.z}) - distance: ${Math.round(Math.hypot(dxp, dzp))}`);
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
    
    // Update bullet effects system
    if (this.bulletEffects) {
      this.bulletEffects.updateBullets(this);
    }
    
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
        
        // Aumentar radio de colisión para mejor jugabilidad
        if (distance < 35) {
          // ¡IMPACTO!
          const damage = GAME_CONFIG.damage;
          enemy.health -= damage;
          console.log(`🎯 ¡IMPACTO! Enemigo recibe ${damage} de daño. Vida restante: ${enemy.health}`);
          
          // Remover la bala
          bullet.active = false;
          this.bullets.splice(bulletIndex, 1);
          
          // Efectos visuales y sonoros del impacto
          this.sounds.hit();
          
          // Crear efectos de sangre si está disponible el sistema avanzado
          if (this.bulletEffects) {
            this.bulletEffects.createBloodBurst(enemy.x, enemy.z, enemy.y || 64);
          }
          
          // Empujar al enemigo ligeramente hacia atrás
          const pushForce = 15;
          const pushX = Math.cos(bullet.angle) * pushForce;
          const pushZ = Math.sin(bullet.angle) * pushForce;
          
          // Verificar que la nueva posición sea válida antes de empujar
          const newX = enemy.x + pushX;
          const newZ = enemy.z + pushZ;
          if (this.canMoveTo(newX, newZ)) {
            enemy.x = newX;
            enemy.z = newZ;
          }
          
          // Verificar si el enemigo murió
          if (enemy.health <= 0) {
            console.log('💀 ¡ENEMIGO ELIMINADO!');
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
    
    console.log('🔫 Intento de disparo...');
    
    if (this.player.ammo <= 0) {
      console.log('🚫 Sin munición');
      return;
    }
    
    if (currentTime - this.player.lastShot < GAME_CONFIG.fireRate) {
      console.log('🚫 Demasiado rápido - esperando cooldown');
      return;
    }
    
    this.player.ammo--;
    this.player.lastShot = currentTime;
    
    console.log(`💥 ¡DISPARO! Munición restante: ${this.player.ammo}`);
    
    // Calcular dirección exacta hacia el centro de la cruz (crosshair)
    const shootAngle = this.player.angle; // Ángulo exacto hacia donde mira el jugador
    const verticalLook = this.player.verticalLook; // Mirada vertical
    
    // Usar el nuevo sistema de efectos de balas
    if (this.bulletEffects) {
      console.log('🎯 Usando BulletEffectsSystem');
      try {
        const result = this.bulletEffects.createBullet(
          this.player.x,
          this.player.z,
          shootAngle,
          verticalLook
        );
        console.log('✅ Bala creada (nuevo sistema):', result);
      } catch (error) {
        console.error('❌ Error creando bala:', error);
      }
    } 
    
    // SIEMPRE usar también el sistema principal para garantizar funcionalidad
    console.log('🎯 Usando sistema principal de balas');
    const newBullet = {
      x: this.player.x,
      z: this.player.z,
      y: 64 + (verticalLook * 100), // Altura basada en mirada vertical
      angle: shootAngle,
      speed: GAME_CONFIG.bulletSpeed,
      distance: 0,
      active: true,
      startTime: currentTime
    };
    this.bullets.push(newBullet);
    console.log('✅ Bala creada (sistema principal)');
    
    // Reproducir sonido de disparo
    if (this.weaponAudio) {
      console.log('🔊 Usando WeaponAudioSystem');
      try {
        this.weaponAudio.playShotgunSound();
        console.log('✅ Sonido de escopeta reproducido');
      } catch (error) {
        console.error('❌ Error reproduciendo sonido:', error);
      }
    } else {
      console.log('⚠️ Usando sonido fallback');
      this.sounds.shoot();
    }
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
      const aliveEnemies = this.enemies.filter(e => e.health > 0).length;
      const currentTime = performance.now();
      const nextSpawnIn = Math.max(0, GAME_CONFIG.spawnCooldown - (currentTime - this.enemySpawnTimer));
      const nextSpawnSeconds = Math.ceil(nextSpawnIn / 1000);
      
      if (aliveEnemies < GAME_CONFIG.maxEnemies && nextSpawnIn > 0) {
        enemyCount.textContent = `${aliveEnemies}/${GAME_CONFIG.maxEnemies} (Next: ${nextSpawnSeconds}s)`;
      } else {
        enemyCount.textContent = `${aliveEnemies}/${GAME_CONFIG.maxEnemies}`;
      }
    }
  },
  
  updateHeadshotCounter() {
    const headshotDisplay = document.getElementById('headshot-counter');
    if (headshotDisplay) {
      headshotDisplay.textContent = this.headshots.toString();
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
    
    // 5.5. Render bullets (sistema fallback)
    this.renderBullets();
    
    // 6. Render bullet effects
    if (this.bulletEffects) {
      try {
        this.bulletEffects.render(this.ctx, this.width, this.height);
      } catch (error) {
        console.error('❌ Error renderizando efectos de balas:', error);
      }
    }
    
    // 7. Crosshair (siempre al frente)
    this.renderCrosshair();
    
    // 8. Debug info expandida
    this.renderDebugInfo();
    
    // 9. Weapon display (siempre al frente)
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
      // Log ocasional para no saturar la consola
      if (Math.random() < 0.02) {
        console.log(`🎮 Rendering ${this.enemies.length} enemies with EnemySpriteSystem`);
      }
      // Dibujar usando el sistema de sprites; no ocultar por loading
      this.enemies.forEach((enemy, index) => {
        if (enemy.health <= 0 || enemy.hidden) return;
        try {
          window.EnemySpriteSystem.renderEnemySprite(this.ctx, enemy, this.player);
        } catch (err) {
          // No dibujar fallback rojo si existe el sistema de sprites; solo registrar
          console.error('Sprite render failed:', err);
          if (window.console && console.warn) {
            console.warn('Sprite render falló, se omite fallback para evitar cuadros rojos:', err);
          }
        }
      });
    } else {
      console.log('❌ EnemySpriteSystem not found, using fallback');
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

  // Renderizar balas como puntos 3D
  renderBullets() {
    if (!this.bullets || this.bullets.length === 0) return;
    
    this.bullets.forEach(bullet => {
      if (!bullet.active) return;
      
      // Calcular posición relativa al jugador
      const dx = bullet.x - this.player.x;
      const dz = bullet.z - this.player.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      // No renderizar balas muy lejas o muy cerca
      if (distance > 800 || distance < 5) return;
      
      // Calcular ángulo relativo al jugador
      const angle = Math.atan2(dz, dx) - this.player.angle;
      
      // Verificar que la bala esté en el campo de visión
      if (Math.abs(angle) > Math.PI / 2) return;
      
      // Proyección 3D a 2D con perspectiva correcta
      const fov = GAME_CONFIG.fov;
      const screenX = (this.width / 2) + (Math.tan(angle) / Math.tan(fov / 2)) * (this.width / 2);
      
      // Verificar si está en pantalla
      if (screenX < -20 || screenX >= this.width + 20) return;
      
      // Calcular altura en pantalla (considerando mirada vertical)
      const baseY = this.height / 2;
      const verticalOffset = this.player.verticalLook * 200;
      const bulletVerticalOffset = (bullet.y - 64) * (200 / distance); // Perspectiva vertical
      const screenY = baseY + verticalOffset + bulletVerticalOffset;
      
      // Tamaño basado en distancia para perspectiva realista
      const baseSize = 4;
      const size = Math.max(1, baseSize * (100 / distance));
      
      // Renderizar la bala como un punto brillante con estela
      this.ctx.save();
      
      // Estela de la bala (múltiples puntos para crear efecto de velocidad)
      const trailLength = 3;
      for (let i = 0; i < trailLength; i++) {
        const trailAlpha = (trailLength - i) / trailLength * 0.6;
        const trailSize = size * (trailLength - i) / trailLength;
        const trailOffset = i * 8; // Separación entre puntos de estela
        
        this.ctx.globalAlpha = trailAlpha;
        this.ctx.fillStyle = '#FFA500'; // Naranja para estela
        this.ctx.beginPath();
        this.ctx.arc(screenX - Math.cos(bullet.angle) * trailOffset, 
                    screenY, trailSize, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      // Bala principal con efecto brillante
      this.ctx.globalAlpha = 1.0;
      this.ctx.fillStyle = '#FFD700'; // Dorado brillante
      this.ctx.shadowColor = '#FFD700';
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Núcleo blanco brillante
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.shadowBlur = 4;
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, size * 0.4, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    });
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

  const speed = Math.max(0.3, enemy.speed * (GAME_CONFIG.targetTrack?.lateralSpeed ?? 0.7));
  const slowAdvance = Math.max(0.04, enemy.speed * (GAME_CONFIG.targetTrack?.advanceSpeed ?? 0.15));

    // Inicializar propiedades de movimiento rítmico si no existen
    if (!enemy.rhythmTimer) {
      enemy.rhythmTimer = 0;
      enemy.rhythmCycle = 2000 + Math.random() * 1000; // Ciclo de 2-3 segundos
      enemy.movePhase = Math.random() * Math.PI * 2;   // Fase inicial aleatoria
    }

    // Actualizar timer rítmico
    enemy.rhythmTimer += 16; // Aproximadamente 60fps
    if (enemy.rhythmTimer >= enemy.rhythmCycle) {
      enemy.rhythmTimer = 0;
      // Pausar en cambio de dirección para comportamiento de blanco
      if (Math.random() < 0.7) { // 70% probabilidad de pausa
        this.scheduleEdgePause(enemy, currentTime);
      }
      enemy.trackDir *= -1;
    }

    // Mantener distancia del jugador: no cruzar un radio mínimo
    const dxP = enemy.x - this.player.x;
    const dzP = enemy.z - this.player.z;
    const distP = Math.hypot(dxP, dzP);
  const minDist = (GAME_CONFIG.separation?.minDistance ?? GAME_CONFIG.enemyMinDistanceFromPlayer) || 240;

  if (enemy.trackAxis === 'x') {
      // Movimiento rítmico para blancos de tiro
      const rhythmFactor = Math.sin((enemy.rhythmTimer / enemy.rhythmCycle) * Math.PI * 2);
      const adjustedSpeed = speed * (0.2 + 0.8 * Math.abs(rhythmFactor)); // Varía entre 20% y 100% de velocidad
      
      // elegir dirección que aumenta distancia si estamos cerca
      if (distP <= minDist + 10) {
        const dPlus = Math.hypot((enemy.x + adjustedSpeed) - this.player.x, enemy.z - this.player.z);
        const dMinus = Math.hypot((enemy.x - adjustedSpeed) - this.player.x, enemy.z - this.player.z);
        enemy.trackDir = dPlus >= dMinus ? 1 : -1;
      }
      const nextX = enemy.x + enemy.trackDir * adjustedSpeed;
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
      // Movimiento rítmico para blancos de tiro (eje Z)
      const rhythmFactor = Math.sin((enemy.rhythmTimer / enemy.rhythmCycle) * Math.PI * 2);
      const adjustedSpeed = speed * (0.2 + 0.8 * Math.abs(rhythmFactor)); // Varía entre 20% y 100% de velocidad
      
      if (distP <= minDist + 10) {
        const dPlus = Math.hypot(enemy.x - this.player.x, (enemy.z + adjustedSpeed) - this.player.z);
        const dMinus = Math.hypot(enemy.x - this.player.x, (enemy.z - adjustedSpeed) - this.player.z);
        enemy.trackDir = dPlus >= dMinus ? 1 : -1;
      }
      const nextZ = enemy.z + enemy.trackDir * adjustedSpeed;
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
    const [minP, maxP] = enemy.edgePauseRange || [800, 1500]; // Usar los nuevos valores de configuración
    const pause = Math.floor(minP + Math.random() * (maxP - minP));
    const hideChance = GAME_CONFIG.targetTrack?.hideAtEdgesChance ?? 0.15;
    
    if (enemy.hideAtEdges && Math.random() < hideChance) {
      enemy.hidden = true;
    }
    // Pausas más largas para comportamiento de blanco de tiro
    enemy.nextResumeTime = currentTime + (enemy.hidden ? Math.max(400, Math.min(800, Math.floor(pause * 0.6))) : pause);
  },

  // Spawnea un enemigo en una celda que califique como pasillo
  spawnEnemyInCorridor() {
    const cell = GAME_CONFIG.cellSize;
    const spot = this.findRandomCorridorCell(60);
    if (!spot) {
      console.log('⚠️ No se pudo encontrar una posición válida para spawn de enemigo');
      return;
    }

    const types = ['casual', 'deportivo', 'presidencial'];
    const type = types[this.nextEnemyTypeIndex++ % types.length];
    const speedByType = { casual: 0.9, deportivo: 1.4, presidencial: 1.1 };

    const worldX = spot.x * cell + cell / 2;
    const worldZ = spot.z * cell + cell / 2;

    const enemy = {
      id: Date.now(),
      x: worldX,
      z: worldZ,
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
      edgePauseRange: GAME_CONFIG.targetTrack.edgePauseMs || [800, 1500],
      nextResumeTime: 0,
      hideAtEdges: Math.random() < (GAME_CONFIG.targetTrack.hideAtEdgesChance ?? 0.15),
      hidden: false,
      hideDuration: 300
    };
    
    this.setupTargetTrack(enemy);
    this.enemies.push(enemy);
    
    console.log(`🎯 Spawned ${type} enemy at (${spot.x}, ${spot.z}) - World: (${worldX.toFixed(0)}, ${worldZ.toFixed(0)}) - Total: ${this.enemies.length}/${GAME_CONFIG.maxEnemies}`);
  },

  // Busca aleatoriamente una celda pasillo bien dispersa y lejos de otros enemigos
  findRandomCorridorCell(attempts = 60) {
    const cols = GAME_CONFIG.gridCols;
    const rows = GAME_CONFIG.gridRows;
    const cell = GAME_CONFIG.cellSize;
    
    const isFree = (x, z) => (
      x >= 0 && x < cols && z >= 0 && z < rows && MAZE[z] && MAZE[z][x] === 0
    );
    
    const farFromPlayer = (x, z) => {
      const px = Math.floor(this.player.x / cell);
      const pz = Math.floor(this.player.z / cell);
      const dx = x - px, dz = z - pz;
      return (dx*dx + dz*dz) >= 36; // Aumentado de 25 a 36 (mínimo 6 celdas de distancia)
    };
    
    const farFromOtherEnemies = (x, z) => {
      const worldX = x * cell + cell / 2;
      const worldZ = z * cell + cell / 2;
      
      for (let enemy of this.enemies) {
        const dx = worldX - enemy.x;
        const dz = worldZ - enemy.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        // Mínimo 8 celdas de distancia entre enemigos (1024 pixels)
        if (distance < cell * 8) {
          return false;
        }
      }
      return true;
    };

    // Intentar primero en las esquinas del mapa para máxima dispersión
    const preferredZones = [
      { minX: 1, maxX: Math.floor(cols/3), minZ: 1, maxZ: Math.floor(rows/3) },          // Esquina superior izquierda
      { minX: Math.floor(cols*2/3), maxX: cols-1, minZ: 1, maxZ: Math.floor(rows/3) },    // Esquina superior derecha
      { minX: 1, maxX: Math.floor(cols/3), minZ: Math.floor(rows*2/3), maxZ: rows-1 },    // Esquina inferior izquierda
      { minX: Math.floor(cols*2/3), maxX: cols-1, minZ: Math.floor(rows*2/3), maxZ: rows-1 } // Esquina inferior derecha
    ];

    // Primero intentar en zonas preferidas
    for (let zone of preferredZones) {
      for (let i = 0; i < attempts/4; i++) {
        const x = zone.minX + Math.floor(Math.random() * (zone.maxX - zone.minX));
        const z = zone.minZ + Math.floor(Math.random() * (zone.maxZ - zone.minZ));
        
        if (!isFree(x, z) || !farFromPlayer(x, z) || !farFromOtherEnemies(x, z)) continue;

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
    }

    // Si no encontró en zonas preferidas, buscar en todo el mapa
    for (let i = 0; i < attempts; i++) {
      const x = 1 + Math.floor(Math.random() * (cols - 2));
      const z = 1 + Math.floor(Math.random() * (rows - 2));
      
      if (!isFree(x, z) || !farFromPlayer(x, z) || !farFromOtherEnemies(x, z)) continue;

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
    // Solo renderizar la cruz si el mouse está capturado
    if (!document.pointerLockElement) return;
    
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const size = 12;
    
    // Cruz con borde para mejor visibilidad
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = '#000000'; // Borde negro
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - size, centerY);
    this.ctx.lineTo(centerX + size, centerY);
    this.ctx.moveTo(centerX, centerY - size);
    this.ctx.lineTo(centerX, centerY + size);
    this.ctx.stroke();
    
    // Cruz principal roja
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = '#FF0000'; // Rojo brillante
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - size, centerY);
    this.ctx.lineTo(centerX + size, centerY);
    this.ctx.moveTo(centerX, centerY - size);
    this.ctx.lineTo(centerX, centerY + size);
    this.ctx.stroke();
    
    // Punto central - SOLO cuando el mouse está capturado
    this.ctx.fillStyle = '#FF0000';
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
    this.ctx.fill();
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
