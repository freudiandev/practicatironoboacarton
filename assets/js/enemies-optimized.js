// Sistema de Enemigos Optimizado Anti-Cuelgues
// Versión mejorada que previene bucles infinitos y problemas de rendimiento

class OptimizedEnemySystem {
  constructor() {
    this.enemies = [];
    this.lastSpawn = 0;
    this.spriteSystem = null;
    this.maxProcessingTime = 10; // Máximo 10ms por frame
    this.enemyProcessingIndex = 0; // Para procesamiento distribuido
    this.performanceMonitor = {
      totalUpdateTime: 0,
      frameCount: 0,
      averageTime: 0
    };
    
    // Comunicación con sistemas de IA
    this.aiCommunicationEnabled = false;
    this.lastPerformanceReport = 0;
    
    console.log('🤖 Sistema de Enemigos Optimizado inicializado');
  }
  
  // Conectar con sistema de diálogo autopoiético
  connectWithAI(autopoieticSystem, memorySystem) {
    this.autopoieticSystem = autopoieticSystem;
    this.memorySystem = memorySystem;
    this.aiCommunicationEnabled = true;
    console.log('🔗 Sistema de enemigos conectado con IAs');
  }
    init() {
    this.enemies = [];
    this.spawnInitialEnemies();
    
    // Inicializar sistema de sprites si está disponible
    if (window.SpriteSystem) {
      this.spriteSystem = new window.SpriteSystem();
    }
    
    // Conectar con sistema de memoria IA
    if (window.memorySystem) {
      this.memorySystem = window.memorySystem;
      this.aiCommunicationEnabled = true;
      this.memorySystem.reportSuccess('ENEMIES', 'Sistema de enemigos optimizado inicializado');
    }
  }
  spawnInitialEnemies() {
    const spawnPoints = [
      [3, 3] // Solo 1 enemigo inicial para mejor rendimiento
    ];
    
    const types = ['basic'];
    
    spawnPoints.forEach((pos, i) => {
      const x = pos[0] * CONFIG.world.cellSize + CONFIG.world.cellSize / 2;
      const z = pos[1] * CONFIG.world.cellSize + CONFIG.world.cellSize / 2;
      const type = types[i % types.length];
      
      if (MAZE && MAZE[pos[1]] && MAZE[pos[1]][pos[0]] === 0) {
        this.enemies.push(new OptimizedEnemy(x, z, type));
      }
    });
    
    window.enemies = this.enemies;
    console.log(`🎯 ${this.enemies.length} enemigo inicial spawneado`);
  }
  
  update(currentTime) {
    const startTime = performance.now();
    
    try {
      // Procesamiento distribuido de enemigos para evitar cuelgues
      this.updateEnemiesDistributed();
      
      // Limpieza de enemigos muertos
      this.cleanupDeadEnemies();
      
      // Spawn de nuevos enemigos con límites
      this.handleSpawning(currentTime);
      
      // Monitorear rendimiento
      this.monitorPerformance(startTime);
      
      // Comunicar con IAs si es necesario
      this.communicateWithAI(currentTime);
      
    } catch (error) {
      console.error('❌ Error en sistema de enemigos:', error);
      
      if (this.memorySystem) {
        this.memorySystem.reportError('ENEMY_SYSTEM_ERROR', `Error en sistema de enemigos: ${error.message}`, 'high');
      }
      
      // Modo de emergencia: detener procesamiento de enemigos temporalmente
      this.enterEmergencyMode();
    }
  }
  
  updateEnemiesDistributed() {
    if (this.enemies.length === 0) return;
    
    const startTime = performance.now();
    const maxEnemiesPerFrame = Math.min(3, this.enemies.length); // Máximo 3 enemigos por frame
    let processed = 0;
    
    // Procesamiento cíclico distribuido
    while (processed < maxEnemiesPerFrame && (performance.now() - startTime) < this.maxProcessingTime) {
      if (this.enemyProcessingIndex >= this.enemies.length) {
        this.enemyProcessingIndex = 0;
      }
      
      const enemy = this.enemies[this.enemyProcessingIndex];
      if (enemy && enemy.alive) {
        enemy.safeUpdate();
      }
      
      this.enemyProcessingIndex++;
      processed++;
    }
  }
  
  cleanupDeadEnemies() {
    const now = Date.now();
    const initialCount = this.enemies.length;
    
    this.enemies = this.enemies.filter(enemy => {
      if (enemy.alive) return true;
      if (enemy.deathTime && (now - enemy.deathTime) < 3000) return true;
      return false;
    });
    
    const removed = initialCount - this.enemies.length;
    if (removed > 0) {
      console.log(`🗑️ ${removed} enemigos muertos removidos`);
    }
    
    window.enemies = this.enemies;
  }  handleSpawning(currentTime) {
    const aliveCount = this.getAliveCount();
    const maxEnemies = CONFIG.enemy?.maxCount || 1; // Solo 1 enemigo máximo
    
    if (aliveCount < maxEnemies && 
        currentTime - this.lastSpawn > (CONFIG.enemy?.spawnCooldown || 20000)) { // 20 segundos entre spawns
      
      this.spawnRandomEnemyOptimized();
    }
  }
  
  spawnRandomEnemyOptimized() {
    const maxAttempts = 10; // Reducido de 20 a 10 para evitar cuelgues
    
    for (let attempts = 0; attempts < maxAttempts; attempts++) {
      const x = (2 + Math.random() * (CONFIG.world.gridCols - 4)) * CONFIG.world.cellSize;
      const z = (2 + Math.random() * (CONFIG.world.gridRows - 4)) * CONFIG.world.cellSize;
      
      const mapX = Math.floor(x / CONFIG.world.cellSize);
      const mapZ = Math.floor(z / CONFIG.world.cellSize);
      
      if (MAZE && MAZE[mapZ] && MAZE[mapZ][mapX] === 0) {
        const types = ['basic', 'fast', 'strong'];
        const type = types[Math.floor(Math.random() * types.length)];
        this.enemies.push(new OptimizedEnemy(x, z, type));
        this.lastSpawn = Date.now();
        console.log(`👾 Nuevo enemigo ${type} spawneado en (${mapX}, ${mapZ})`);
        break;
      }
    }
  }
  
  monitorPerformance(startTime) {
    const frameTime = performance.now() - startTime;
    this.performanceMonitor.totalUpdateTime += frameTime;
    this.performanceMonitor.frameCount++;
    
    if (this.performanceMonitor.frameCount >= 60) { // Cada 60 frames
      this.performanceMonitor.averageTime = 
        this.performanceMonitor.totalUpdateTime / this.performanceMonitor.frameCount;
      
      if (this.performanceMonitor.averageTime > 5) { // Más de 5ms promedio
        console.warn(`⚠️ Sistema de enemigos lento: ${this.performanceMonitor.averageTime.toFixed(2)}ms promedio`);
        
        if (this.memorySystem) {
          this.memorySystem.reportError('ENEMY_PERFORMANCE', 
            `Sistema de enemigos lento: ${this.performanceMonitor.averageTime.toFixed(2)}ms promedio`, 'medium');
        }
      }
      
      // Reset
      this.performanceMonitor.totalUpdateTime = 0;
      this.performanceMonitor.frameCount = 0;
    }
  }
  
  communicateWithAI(currentTime) {
    if (!this.aiCommunicationEnabled || 
        currentTime - this.lastPerformanceReport < 10000) { // Cada 10 segundos
      return;
    }
    
    const aliveCount = this.getAliveCount();
    const performanceData = {
      enemyCount: aliveCount,
      averageUpdateTime: this.performanceMonitor.averageTime,
      memoryUsage: this.calculateMemoryUsage()
    };
    
    if (this.autopoieticSystem && this.autopoieticSystem.receivePerformanceData) {
      this.autopoieticSystem.receivePerformanceData('ENEMY_SYSTEM', performanceData);
    }
    
    this.lastPerformanceReport = currentTime;
  }
  
  calculateMemoryUsage() {
    return this.enemies.length * 200; // Estimación aproximada en bytes
  }
  
  enterEmergencyMode() {
    console.warn('🚨 Sistema de enemigos en modo de emergencia');
    
    // Reducir número de enemigos activos
    const aliveEnemies = this.enemies.filter(e => e.alive);
    if (aliveEnemies.length > 3) {
      aliveEnemies.slice(3).forEach(enemy => {
        enemy.die();
      });
      console.log('🗑️ Enemigos reducidos por emergencia');
    }
    
    // Pausar spawn temporalmente
    this.lastSpawn = Date.now() + 30000; // 30 segundos
  }
  
  render(ctx, player) {
    const startTime = performance.now();
    let rendered = 0;
    const maxRenderTime = 8; // Máximo 8ms para renderizado
    
    for (const enemy of this.enemies) {
      if (performance.now() - startTime > maxRenderTime) {
        console.warn('⚠️ Renderizado de enemigos truncado por tiempo');
        break;
      }
      
      if (this.shouldRenderEnemy(enemy, player)) {
        this.renderEnemyOptimized(ctx, enemy, player);
        rendered++;
      }
    }
    
    // Monitorear renderización
    const renderTime = performance.now() - startTime;
    if (renderTime > 10) {
      console.warn(`⚠️ Renderizado de enemigos lento: ${renderTime.toFixed(2)}ms, ${rendered} enemigos`);
    }
  }
  
  shouldRenderEnemy(enemy, player) {
    if (!enemy.alive && (!enemy.deathTime || Date.now() - enemy.deathTime > 3000)) {
      return false;
    }
    
    const dx = enemy.x - player.x;
    const dz = enemy.z - player.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance > (CONFIG.world?.maxRenderDistance || 800)) return false;
    
    // Verificación simplificada de línea de vista para rendimiento
    return this.quickLineOfSightCheck(player.x, player.z, enemy.x, enemy.z);
  }
  
  quickLineOfSightCheck(x1, z1, x2, z2) {
    // Versión optimizada con menos pasos
    const distance = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
    const steps = Math.min(Math.ceil(distance / 20), 10); // Máximo 10 pasos
    
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const checkX = x1 + (x2 - x1) * t;
      const checkZ = z1 + (z2 - z1) * t;
      
      const gridX = Math.floor(checkX / CONFIG.world.cellSize);
      const gridZ = Math.floor(checkZ / CONFIG.world.cellSize);
      
      if (gridX < 0 || gridX >= CONFIG.world.gridCols || 
          gridZ < 0 || gridZ >= CONFIG.world.gridRows || 
          (MAZE[gridZ] && MAZE[gridZ][gridX] === 1)) {
        return false;
      }
    }
    
    return true;
  }
  
  renderEnemyOptimized(ctx, enemy, player) {
    // Usar renderizado simplificado para mejor rendimiento
    const dx = enemy.x - player.x;
    const dz = enemy.z - player.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    const angle = Math.atan2(dz, dx) - player.angle;
    let normalizedAngle = angle;
    while (normalizedAngle > Math.PI) normalizedAngle -= 2 * Math.PI;
    while (normalizedAngle < -Math.PI) normalizedAngle += 2 * Math.PI;
    
    if (Math.abs(normalizedAngle) > CONFIG.world.fov / 2) return;
    
    const screenX = ctx.canvas.width * 0.5 + (normalizedAngle / (CONFIG.world.fov / 2)) * (ctx.canvas.width * 0.5);
    const baseScale = (ctx.canvas.height * 0.4) / distance;
    const enemyWidth = (CONFIG.enemy?.size || 40) * baseScale;
    const enemyHeight = enemyWidth * (CONFIG.enemy?.heightMultiplier || 1.5);
    
    const worldHorizonY = ctx.canvas.height * 0.5;
    const enemyBottomY = worldHorizonY;
    const enemyTopY = enemyBottomY - enemyHeight;
    
    const x = screenX - enemyWidth * 0.5;
    const y = enemyTopY;
    
    // Renderizado simplificado
    if (!enemy.alive) {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#666666';
    } else {
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = `rgb(${enemy.color[0]}, ${enemy.color[1]}, ${enemy.color[2]})`;
    }
    
    ctx.fillRect(x, y, enemyWidth, enemyHeight);
    ctx.globalAlpha = 1.0;
    
    // Barra de salud simplificada
    if (enemy.alive && enemy.health < enemy.maxHealth) {
      const barWidth = enemyWidth * 0.8;
      const barHeight = 3;
      const healthRatio = enemy.health / enemy.maxHealth;
      
      ctx.fillStyle = '#333333';
      ctx.fillRect(screenX - barWidth * 0.5, y - 8, barWidth, barHeight);
      
      ctx.fillStyle = healthRatio > 0.5 ? '#00FF00' : '#FF0000';
      ctx.fillRect(screenX - barWidth * 0.5, y - 8, barWidth * healthRatio, barHeight);
    }
  }
  
  // Métodos auxiliares
  getAliveCount() {
    return this.enemies.filter(e => e.alive).length;
  }
  
  getEnemyAt(x, z, radius = 30) {
    return this.enemies.find(enemy => {
      if (!enemy.alive) return false;
      const dx = enemy.x - x;
      const dz = enemy.z - z;
      return Math.sqrt(dx * dx + dz * dz) < radius;
    });
  }
  
  takeDamage(enemy, damage, isHeadshot = false) {
    const finalDamage = isHeadshot ? (CONFIG.bullet?.headDamage || damage * 2) : damage;
    enemy.takeDamage(finalDamage);
    
    if (!enemy.alive) {
      enemy.deathTime = Date.now();
      
      if (this.memorySystem) {
        this.memorySystem.reportSuccess('ENEMY_KILLED', `Enemigo eliminado con ${isHeadshot ? 'headshot' : 'disparo normal'}`);
      }
      
      return true;
    }
    return false;
  }
}

// Exponer globalmente
window.EnemySystem = OptimizedEnemySystem;

// Enemigo optimizado
class OptimizedEnemy {
  constructor(x, z, type = 'basic') {
    this.x = x;
    this.z = z;
    this.y = 0;
    this.type = type;
    this.health = CONFIG.enemy?.health || 100;
    this.maxHealth = this.health;    this.speed = (CONFIG.enemy?.speed || 30) * 0.016; // Reducida velocidad
    this.size = CONFIG.enemy?.size || 40;
    this.lastAttack = 0;
    this.attackCooldown = CONFIG.enemy?.attackCooldown || 2500; // Usar configuración
    this.viewDistance = CONFIG.enemy?.detectionRange || 150; // Reducido de 200 a 150
    this.alive = true;
    this.deathTime = null;
    
    this.angle = Math.random() * Math.PI * 2;
    this.moveDirection = Math.random() * Math.PI * 2;
    this.state = 'wandering';
    this.spriteVariant = Math.floor(Math.random() * 3);
      // Sprites de Noboa
    this.spriteImages = {
      basic: 'assets/images/noboa-presidencial.png',
      fast: 'assets/images/noboa-deportivo.png', 
      strong: 'assets/images/noboa-casual.png'
    };
    this.spriteImage = null;
    this.spriteLoaded = false;
    this.loadSprite();
    
    // Optimizaciones
    this.lastUpdateTime = 0;
    this.updateThrottle = 100; // Actualizar cada 100ms para mejor rendimiento
    this.pathfindingCooldown = 0;
    
    this.setupType();
  }
  
  loadSprite() {
    const img = new Image();
    img.onload = () => {
      this.spriteImage = img;
      this.spriteLoaded = true;
      console.log(`🖼️ Sprite cargado para enemigo ${this.type}`);
    };
    img.onerror = () => {
      console.warn(`⚠️ No se pudo cargar sprite para ${this.type}: ${this.spriteImages[this.type]}`);
    };
    img.src = this.spriteImages[this.type] || this.spriteImages.basic;
  }
    setupType() {
    switch (this.type) {
      case 'fast':
        this.speed *= 1.5;
        this.health = Math.floor(this.health * 0.75);
        this.color = [255, 150, 150];
        this.description = 'Noboa Deportivo - Rápido y ágil';
        break;
      case 'strong':
        this.speed *= 0.7;
        this.health = Math.floor(this.health * 1.5);
        this.color = [150, 150, 255];
        this.description = 'Noboa Casual - Fuerte y resistente';
        break;
      default:
        this.color = [255, 100, 100];
        this.description = 'Noboa Presidencial - Enemigo estándar';
        break;
    }
    this.maxHealth = this.health;
  }
  
  safeUpdate() {
    const now = Date.now();
    
    // Throttling para evitar procesamiento excesivo
    if (now - this.lastUpdateTime < this.updateThrottle) {
      return;
    }
    
    this.lastUpdateTime = now;
    
    if (!this.alive || !window.player) return;
    
    try {
      const distance = this.getDistanceToPlayer();
        if (distance < this.viewDistance) {
        // Estado de persecución con comportamiento más inteligente
        this.state = 'chasing';
        this.moveTowardsPlayerOptimized();
          // Ataque solo si está muy cerca y ha pasado el cooldown
        if (distance < 35 && now - this.lastAttack > this.attackCooldown) {
          // Probabilidad de ataque muy baja (20% en lugar de 70%)
          if (Math.random() < 0.2) {
            this.attack();
          }
        }
      } else {
        // Patrullar si no ve al jugador
        this.state = 'wandering';
        this.wander();
      }
    } catch (error) {
      console.error('❌ Error en actualización de enemigo:', error);
      // En caso de error, detener al enemigo temporalmente
      this.updateThrottle = 1000; // Reducir frecuencia de actualización
    }
  }
    moveTowardsPlayerOptimized() {
    const dx = window.player.x - this.x;
    const dz = window.player.z - this.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance > 0 && distance > 25) { // Mantener distancia mínima mayor
      const moveX = (dx / distance) * this.speed;
      const moveZ = (dz / distance) * this.speed;
      
      // Verificación de movimiento más rápida
      if (this.canMoveToOptimized(this.x + moveX, this.z + moveZ)) {
        this.x += moveX;
        this.z += moveZ;
      } else {
        // Si no puede moverse directamente, intentar movimiento lateral
        this.handleObstacle();
      }
    }
  }
  
  canMoveToOptimized(x, z) {
    const mapX = Math.floor(x / CONFIG.world.cellSize);
    const mapZ = Math.floor(z / CONFIG.world.cellSize);
    
    return mapX >= 0 && mapX < CONFIG.world.gridCols &&
           mapZ >= 0 && mapZ < CONFIG.world.gridRows &&
           MAZE && MAZE[mapZ] && MAZE[mapZ][mapX] === 0;
  }
  
  handleObstacle() {
    // Cambiar dirección para evitar obstáculos
    this.moveDirection += (Math.random() - 0.5) * Math.PI / 2;
    
    const moveX = Math.cos(this.moveDirection) * this.speed;
    const moveZ = Math.sin(this.moveDirection) * this.speed;
    
    if (this.canMoveToOptimized(this.x + moveX, this.z + moveZ)) {
      this.x += moveX;
      this.z += moveZ;
    }
  }  attack() {
    this.lastAttack = Date.now();
    const damage = CONFIG.enemy?.attackDamage || 5;
    if (window.player && window.player.takeDamage) {
      window.player.takeDamage(damage);
      console.log(`💥 Enemigo atacó al jugador (-${damage} HP)`);
    }
  }
    takeDamage(amount) {
    this.health -= amount;
    
    // Registrar hit en analytics
    if (window.gameplayAnalytics) {
      window.gameplayAnalytics.onEnemyHit();
    }
    
    if (this.health <= 0) {
      this.die();
    }
  }
  
  die() {
    this.alive = false;
    this.deathTime = Date.now();
    console.log(`💀 Enemigo ${this.type} eliminado`);
    
    // Registrar muerte del enemigo en analytics
    if (window.gameplayAnalytics) {
      window.gameplayAnalytics.onEnemyKilled();
    }
  }
  
  getDistanceToPlayer() {
    if (!window.player) return Infinity;
    const dx = this.x - window.player.x;
    const dz = this.z - window.player.z;
    return Math.sqrt(dx * dx + dz * dz);
  }
  
  wander() {
    // Cambiar dirección aleatoriamente
    if (Math.random() < 0.1) { // 10% probabilidad de cambiar dirección
      this.moveDirection = Math.random() * Math.PI * 2;
    }
    
    const moveX = Math.cos(this.moveDirection) * this.speed * 0.5; // Movimiento más lento al patrullar
    const moveZ = Math.sin(this.moveDirection) * this.speed * 0.5;
    
    if (this.canMoveToOptimized(this.x + moveX, this.z + moveZ)) {
      this.x += moveX;
      this.z += moveZ;
    } else {
      // Si choca con una pared, cambiar dirección
      this.moveDirection = Math.random() * Math.PI * 2;
    }
  }
}

// Reemplazar sistema de enemigos existente
window.OptimizedEnemy = OptimizedEnemy;
window.OptimizedEnemySystem = OptimizedEnemySystem;

// Crear instancia global optimizada y reemplazar la anterior
if (window.EnemySystem) {
  console.log('🔄 Reemplazando sistema de enemigos con versión optimizada');
}

window.EnemySystem = OptimizedEnemySystem;
window.Enemy = OptimizedEnemy;

console.log('✅ Sistema de Enemigos Optimizado Anti-Cuelgues cargado');
