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
  verticalLookSensitivity: 0.02 // Nueva configuración para mirar arriba/abajo
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
      this.spawnInitialEnemies();
      this.spawnItems();
      
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
    
    spawnPoints.forEach((point, index) => {
      if (this.isValidSpawnPoint(point.x, point.z)) {
        this.enemies.push({
          id: index,
          x: point.x,
          z: point.z,
          health: GAME_CONFIG.enemyHealth,
          angle: Math.random() * Math.PI * 2,
          speed: GAME_CONFIG.enemySpeed,
          lastMove: 0,
          target: null,
          state: 'patrol'
        });
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
      
      // Calcular distancia al jugador
      const dx = this.player.x - enemy.x;
      const dz = this.player.z - enemy.z;
      const distanceToPlayer = Math.sqrt(dx * dx + dz * dz);
      
      // IA simple
      if (distanceToPlayer < 200) {
        // Chase player
        enemy.state = 'chase';
        enemy.angle = Math.atan2(dz, dx);
        
        const moveX = Math.cos(enemy.angle) * enemy.speed;
        const moveZ = Math.sin(enemy.angle) * enemy.speed;
        
        if (this.canMoveTo(enemy.x + moveX, enemy.z + moveZ)) {
          enemy.x += moveX;
          enemy.z += moveZ;
        }
        
        // Atacar si está muy cerca
        if (distanceToPlayer < 50 && currentTime - enemy.lastAttack > 1000) {
          this.enemyAttack(enemy);
          enemy.lastAttack = currentTime;
        }
      } else {
        // Patrol
        enemy.state = 'patrol';
        if (currentTime - enemy.lastMove > 2000) {
          enemy.angle = Math.random() * Math.PI * 2;
          enemy.lastMove = currentTime;
        }
        
        const moveX = Math.cos(enemy.angle) * enemy.speed * 0.5;
        const moveZ = Math.sin(enemy.angle) * enemy.speed * 0.5;
        
        if (this.canMoveTo(enemy.x + moveX, enemy.z + moveZ)) {
          enemy.x += moveX;
          enemy.z += moveZ;
        }
      }
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
        if (enemy.health <= 0) return;
        
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
    // Renderizar enemigos
    this.enemies.forEach(enemy => {
      if (enemy.health <= 0) return;
      
      const dx = enemy.x - this.player.x;
      const dz = enemy.z - this.player.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance < 500) {
        const angle = Math.atan2(dz, dx) - this.player.angle;
        const screenX = (this.width / 2) + Math.tan(angle) * (this.width / 2);
        
        if (screenX >= 0 && screenX < this.width) {
          const size = Math.max(10, 200 / distance);
          const screenY = this.height / 2 - size / 2;
          
          this.ctx.fillStyle = '#FF0000';
          this.ctx.fillRect(screenX - size/2, screenY, size, size);
        }
      }
    });
    
    // Renderizar items
    this.items.forEach(item => {
      if (item.collected) return;
      
      const dx = item.x - this.player.x;
      const dz = item.z - this.player.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance < 300) {
        const angle = Math.atan2(dz, dx) - this.player.angle;
        const screenX = (this.width / 2) + Math.tan(angle) * (this.width / 2);
        
        if (screenX >= 0 && screenX < this.width) {
          const size = Math.max(5, 100 / distance);
          const bobHeight = Math.sin(item.bobOffset) * 5;
          const screenY = this.height / 2 - size / 2 + bobHeight;
          
          this.ctx.fillStyle = item.color;
          this.ctx.fillRect(screenX - size/2, screenY, size, size);
        }
      }
    });
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
