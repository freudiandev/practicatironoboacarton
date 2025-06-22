// ANÁLISIS Y REFACTORIZACIÓN COMPLETA DEL PROYECTO DOOM
// Sistema de depuración inteligente usando learning-memory.js

console.log('🧹 === INICIANDO DEPURACIÓN COMPLETA ===');

// 1. Consultar al sistema de memoria sobre sistemas críticos
const SISTEMAS_CRITICOS = [
  'config.js',           // Configuración base
  'core.js',            // Utilidades básicas
  'input.js',           // Sistema de entrada
  'audio.js',           // Sistema de audio
  'game.js',            // Lógica principal
  'learning-memory.js', // Sistema IA (crítico según especificación)
  'pure-renderer-clean.js' // Renderer principal
];

const SISTEMAS_OPTIMIZADOS = [
  'bullets-optimized.js',
  'enemies-optimized.js'
];

const SISTEMAS_ADICIONALES_IMPORTANTES = [
  'decorative-system.js',
  'ai-safe-system.js',
  'noboa-sprites.js'
];

// 2. Archivos a ELIMINAR (duplicados o innecesarios)
const ARCHIVOS_BASURA = [
  // Versiones duplicadas de bullets
  'bullets.js', 'bullets-old.js', 'bullets-clean.js',
  
  // Versiones duplicadas de renderer
  'pure-renderer.js', 'pure-renderer-fixed.js', 'pure-renderer-new.js', 'pure-renderer-restored.js',
  'renderer.js',
  
  // Versiones duplicadas de particle system
  'particle-system.js', 'particle-system-old.js', 'particle-system-fixed.js',
  
  // Versiones duplicadas de resource manager
  'resource-manager.js', 'resource-manager-fixed.js', 'resource-manager-backup.js',
  
  // Archivos de prueba y debug innecesarios
  'test-syntax.js', 'test-rendering.js', 'validation-script.js',
  'app.js', 'agent-demo.js', 'menu.js',
  
  // Game versions duplicadas
  'game-restored.js', 'game-clean.js', 'game-init.js',
  
  // Otros duplicados
  'enemies.js', 'core-clean.js', 'input-handler.js', 'robust-input.js',
  'sprites.js', 'raycasting.js', 'player.js',
  
  // Archivos de emergencia/debug (ya integrados en solución definitiva)
  'DIAGNOSTICO-COMPLETO.js', 'PARCHE-INICIALIZACION.js', 'TEST-RENDERIZADO.js',
  'CONTROLES-EMERGENCIA.js', 'REPARACION-AUTOMATICA.js', 'EMERGENCIA-COORDENADAS.js',
  'comandos-urgentes-controles.js', 'COMANDOS-EMERGENCIA-CONSOLA.js'
];

// 3. Función para crear archivo unificado optimizado
window.crearSistemaUnificado = function() {
  console.log('🔧 Creando sistema de juego unificado y optimizado...');
  
  // Verificar que learning-memory protege sistemas críticos
  if (window.memorySystem && window.memorySystem.criticalSystems) {
    console.log('🧠 Consultando sistema de memoria IA...');
    const protectedSystems = Array.from(window.memorySystem.criticalSystems);
    console.log('🛡️ Sistemas protegidos por IA:', protectedSystems);
  }
  
  return `
// SISTEMA DE JUEGO DOOM UNIFICADO Y OPTIMIZADO
// Generado automáticamente con depuración completa

console.log('🎮 === DOOM GAME SYSTEM UNIFICADO ===');

// ================================
// 1. CONFIGURACIÓN OPTIMIZADA
// ================================
const GAME_CONFIG = {
  world: {
    gridRows: 20,
    gridCols: 20,
    cellSize: 64,
    wallHeight: 64,
    fov: Math.PI / 3,
    maxRenderDistance: 500
  },
  player: {
    startX: 3.5 * 64,
    startY: 32,
    startZ: 3.5 * 64,
    speed: 200,
    health: 100,
    maxAmmo: 50,
    cameraHeight: 50
  },
  controls: {
    mouseRotationSensitivity: 0.003,
    mousePitchSensitivity: 0.003,
    keyboardRotationSpeed: 2,
    keyboardPitchSpeed: 1,
    fixedHorizon: true,
    disableMousePitch: true
  },
  bullet: {
    speed: 400,
    fireRate: 100,
    maxRange: 500,
    damage: 25
  },
  enemy: {
    speed: 50,
    health: 50,
    damage: 10,
    spawnRate: 0.02,
    maxEnemies: 5
  }
};

// ================================
// 2. LABERINTO OPTIMIZADO
// ================================
const GAME_MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// ================================
// 3. UTILIDADES CORE
// ================================
class GameUtils {
  static distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  static normalizeAngle(angle) {
    while (angle < 0) angle += 2 * Math.PI;
    while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
    return angle;
  }
  
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  
  static checkCollision(x, y, maze, cellSize) {
    const gridX = Math.floor(x / cellSize);
    const gridY = Math.floor(y / cellSize);
    
    if (gridX < 0 || gridX >= maze[0].length || gridY < 0 || gridY >= maze.length) {
      return true;
    }
    
    return maze[gridY][gridX] === 1;
  }
}

// ================================
// 4. SISTEMA DE ENTRADA UNIFICADO
// ================================
class UnifiedInputSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = {};
    this.mouse = { x: 0, y: 0, clicked: false };
    this.pointerLocked = false;
    this.setupEvents();
  }
  
  setupEvents() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.pointerLocked) {
        this.mouse.x = e.movementX * GAME_CONFIG.controls.mouseRotationSensitivity;
        this.mouse.y = e.movementY * GAME_CONFIG.controls.mousePitchSensitivity;
      }
    });
    
    this.canvas.addEventListener('click', () => {
      this.mouse.clicked = true;
      this.canvas.requestPointerLock();
    });
    
    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
    });
  }
  
  getMovement() {
    return {
      x: (this.keys['d'] ? 1 : 0) - (this.keys['a'] ? 1 : 0),
      z: (this.keys['w'] ? 1 : 0) - (this.keys['s'] ? 1 : 0)
    };
  }
  
  getMouseRotation() {
    const rotation = { horizontal: this.mouse.x, pitch: this.mouse.y };
    this.mouse.x = 0;
    this.mouse.y = 0;
    return rotation;
  }
  
  isShoot() {
    const shoot = this.mouse.clicked || this.keys[' '];
    this.mouse.clicked = false;
    return shoot;
  }
}

// ================================
// 5. RENDERER OPTIMIZADO
// ================================
class OptimizedRenderer {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.renderQuality = 1;
  }
  
  render(player) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // Limpiar
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, w, h);
    
    // Fondo
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, w, h/2);
    this.ctx.fillStyle = '#654321';
    this.ctx.fillRect(0, h/2, w, h/2);
    
    // Raycasting
    this.renderWalls(player, w, h);
    
    // UI
    this.renderUI(player, w, h);
  }
  
  renderWalls(player, screenWidth, screenHeight) {
    const fov = GAME_CONFIG.world.fov;
    const rays = screenWidth;
    const rayStep = fov / rays;
    
    for (let i = 0; i < rays; i += 2) {
      const rayAngle = player.angle - fov/2 + i * rayStep;
      const hit = this.castRay(player.x, player.z, rayAngle);
      
      if (hit.wall) {
        this.drawWallColumn(i, hit, screenHeight);
      }
    }
  }
  
  castRay(startX, startZ, angle) {
    const stepSize = 2;
    const maxDistance = GAME_CONFIG.world.maxRenderDistance;
    let x = startX;
    let z = startZ;
    let distance = 0;
    
    const dx = Math.cos(angle) * stepSize;
    const dz = Math.sin(angle) * stepSize;
    
    while (distance < maxDistance) {
      x += dx;
      z += dz;
      distance += stepSize;
      
      const mapX = Math.floor(x / GAME_CONFIG.world.cellSize);
      const mapZ = Math.floor(z / GAME_CONFIG.world.cellSize);
      
      if (mapX < 0 || mapX >= GAME_CONFIG.world.gridCols ||
          mapZ < 0 || mapZ >= GAME_CONFIG.world.gridRows ||
          GAME_MAZE[mapZ][mapX] === 1) {
        return { wall: true, distance: distance };
      }
    }
    
    return { wall: false, distance: maxDistance };
  }
  
  drawWallColumn(x, hit, screenHeight) {
    const distance = hit.distance;
    const wallHeight = GAME_CONFIG.world.wallHeight;
    const projectedHeight = (wallHeight * screenHeight) / distance;
    
    const wallTop = Math.max(0, (screenHeight / 2) - (projectedHeight / 2));
    const wallBottom = Math.min(screenHeight, (screenHeight / 2) + (projectedHeight / 2));
    
    const brightness = Math.max(0.3, 1 - (distance / GAME_CONFIG.world.maxRenderDistance));
    const color = Math.floor(139 * brightness);
    
    this.ctx.fillStyle = \`rgb(\${color}, \${Math.floor(69 * brightness)}, \${Math.floor(19 * brightness)})\`;
    this.ctx.fillRect(x, wallTop, 2, wallBottom - wallTop);
  }
  
  renderUI(player, w, h) {
    // Crosshair
    const centerX = w / 2;
    const centerY = h / 2;
    this.ctx.strokeStyle = '#FF0000';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - 10, centerY);
    this.ctx.lineTo(centerX + 10, centerY);
    this.ctx.moveTo(centerX, centerY - 10);
    this.ctx.lineTo(centerX, centerY + 10);
    this.ctx.stroke();
    
    // Info
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(\`Salud: \${player.health}\`, 10, 30);
    this.ctx.fillText(\`Munición: \${player.ammo}\`, 10, 50);
    this.ctx.fillText(\`Enemigos: \${window.unifiedGame?.enemies?.length || 0}\`, 10, 70);
  }
}

// ================================
// 6. SISTEMA DE JUEGO UNIFICADO
// ================================
class UnifiedDoomGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.setupCanvas();
    
    this.player = {
      x: GAME_CONFIG.player.startX,
      y: GAME_CONFIG.player.startY,
      z: GAME_CONFIG.player.startZ,
      angle: 0,
      health: GAME_CONFIG.player.health,
      ammo: GAME_CONFIG.player.maxAmmo,
      speed: GAME_CONFIG.player.speed
    };
    
    this.input = new UnifiedInputSystem(this.canvas);
    this.renderer = new OptimizedRenderer(this.canvas, this.ctx);
    this.bullets = [];
    this.enemies = [];
    this.lastShot = 0;
    this.running = false;
  }
  
  setupCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.zIndex = '10';
    this.canvas.style.display = 'block';
  }
  
  start() {
    this.running = true;
    this.gameLoop();
    console.log('✅ Juego unificado iniciado correctamente');
  }
  
  stop() {
    this.running = false;
  }
  
  gameLoop() {
    if (!this.running) return;
    
    this.update();
    this.render();
    
    requestAnimationFrame(() => this.gameLoop());
  }
  
  update() {
    this.updatePlayer();
    this.updateBullets();
    this.updateEnemies();
  }
  
  updatePlayer() {
    const movement = this.input.getMovement();
    const rotation = this.input.getMouseRotation();
    
    // Rotación
    this.player.angle += rotation.horizontal;
    
    // Movimiento
    const speed = this.player.speed * 0.016;
    let moveX = 0;
    let moveZ = 0;
    
    if (movement.w) {
      moveX += Math.cos(this.player.angle) * speed;
      moveZ += Math.sin(this.player.angle) * speed;
    }
    if (movement.s) {
      moveX -= Math.cos(this.player.angle) * speed;
      moveZ -= Math.sin(this.player.angle) * speed;
    }
    if (movement.a) {
      moveX += Math.cos(this.player.angle - Math.PI/2) * speed;
      moveZ += Math.sin(this.player.angle - Math.PI/2) * speed;
    }
    if (movement.d) {
      moveX += Math.cos(this.player.angle + Math.PI/2) * speed;
      moveZ += Math.sin(this.player.angle + Math.PI/2) * speed;
    }
    
    // Aplicar movimiento con colisiones
    if (!GameUtils.checkCollision(this.player.x + moveX, this.player.z, GAME_MAZE, GAME_CONFIG.world.cellSize)) {
      this.player.x += moveX;
    }
    if (!GameUtils.checkCollision(this.player.x, this.player.z + moveZ, GAME_MAZE, GAME_CONFIG.world.cellSize)) {
      this.player.z += moveZ;
    }
    
    // Disparo
    if (this.input.isShoot() && Date.now() - this.lastShot > GAME_CONFIG.bullet.fireRate) {
      this.shoot();
      this.lastShot = Date.now();
    }
  }
  
  shoot() {
    if (this.player.ammo <= 0) return;
    
    this.player.ammo--;
    this.bullets.push({
      x: this.player.x,
      y: this.player.y,
      z: this.player.z,
      angle: this.player.angle,
      speed: GAME_CONFIG.bullet.speed,
      range: GAME_CONFIG.bullet.maxRange
    });
  }
  
  updateBullets() {
    this.bullets = this.bullets.filter(bullet => {
      const moveX = Math.cos(bullet.angle) * bullet.speed * 0.016;
      const moveZ = Math.sin(bullet.angle) * bullet.speed * 0.016;
      
      bullet.x += moveX;
      bullet.z += moveZ;
      bullet.range -= bullet.speed * 0.016;
      
      // Verificar colisión con paredes
      if (GameUtils.checkCollision(bullet.x, bullet.z, GAME_MAZE, GAME_CONFIG.world.cellSize)) {
        return false;
      }
      
      // Verificar colisión con enemigos
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        if (GameUtils.distance(bullet.x, bullet.z, enemy.x, enemy.z) < 32) {
          enemy.health -= GAME_CONFIG.bullet.damage;
          if (enemy.health <= 0) {
            this.enemies.splice(i, 1);
          }
          return false;
        }
      }
      
      return bullet.range > 0;
    });
  }
  
  updateEnemies() {
    // Spawn enemigos
    if (Math.random() < GAME_CONFIG.enemy.spawnRate && this.enemies.length < GAME_CONFIG.enemy.maxEnemies) {
      this.spawnEnemy();
    }
    
    // Actualizar enemigos
    this.enemies.forEach(enemy => {
      const dx = this.player.x - enemy.x;
      const dz = this.player.z - enemy.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance > 32) {
        const moveSpeed = GAME_CONFIG.enemy.speed * 0.016;
        enemy.x += (dx / distance) * moveSpeed;
        enemy.z += (dz / distance) * moveSpeed;
      }
    });
  }
  
  spawnEnemy() {
    let x, z;
    do {
      x = Math.random() * (GAME_CONFIG.world.gridCols - 2) + 1;
      z = Math.random() * (GAME_CONFIG.world.gridRows - 2) + 1;
    } while (GAME_MAZE[Math.floor(z)][Math.floor(x)] !== 0);
    
    this.enemies.push({
      x: x * GAME_CONFIG.world.cellSize,
      z: z * GAME_CONFIG.world.cellSize,
      health: GAME_CONFIG.enemy.health,
      angle: 0
    });
  }
  
  render() {
    this.renderer.render(this.player);
  }
}

// ================================
// 7. INICIALIZACIÓN AUTOMÁTICA
// ================================
function initUnifiedGame() {
  // Ocultar pantalla de carga
  const loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) loadingScreen.style.display = 'none';
  
  // Mostrar debug panel
  const debugPanel = document.getElementById('debugPanel');
  if (debugPanel) debugPanel.style.display = 'block';
  
  // Crear y iniciar juego
  window.unifiedGame = new UnifiedDoomGame();
  window.game = window.unifiedGame; // Compatibilidad
  window.player = window.unifiedGame.player; // Compatibilidad
  window.CONFIG = GAME_CONFIG; // Compatibilidad
  window.MAZE = GAME_MAZE; // Compatibilidad
  
  window.unifiedGame.start();
  
  console.log('✅ Sistema de juego unificado iniciado exitosamente');
  console.log('🎮 Usa WASD para moverte, mouse para girar, click/espacio para disparar');
}

// Auto-inicializar
setTimeout(initUnifiedGame, 1000);

console.log('🎯 Sistema unificado cargado - Iniciando automáticamente...');
`;
};

console.log('🧹 Sistema de depuración completa cargado');
console.log('📋 Archivos a eliminar identificados:', ARCHIVOS_BASURA.length);
console.log('🛡️ Sistemas críticos protegidos:', SISTEMAS_CRITICOS.length);
console.log('💡 Ejecuta crearSistemaUnificado() para generar el código optimizado');
