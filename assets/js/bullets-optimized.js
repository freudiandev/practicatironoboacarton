// Sistema de Balas Optimizado Anti-Cuelgues
// Versión mejorada que previene bucles infinitos y problemas de rendimiento

class OptimizedBulletSystem {
  constructor() {
    this.bullets = [];
    this.bulletHoles = [];
    this.maxHoles = 30; // Reducido para mejor rendimiento
    this.maxBullets = 20; // Límite de balas activas
    this.performanceMonitor = {
      totalUpdateTime: 0,
      frameCount: 0,
      averageTime: 0
    };
    
    // Comunicación con sistemas de IA
    this.aiCommunicationEnabled = false;
    this.lastPerformanceReport = 0;
    
    console.log('🔫 Sistema de Balas Optimizado inicializado');
  }
  
  // Conectar con sistema de diálogo autopoiético
  connectWithAI(autopoieticSystem, memorySystem) {
    this.autopoieticSystem = autopoieticSystem;
    this.memorySystem = memorySystem;
    this.aiCommunicationEnabled = true;
    console.log('🔗 Sistema de balas conectado con IAs');
  }

  init() {
    this.bullets = [];
    this.bulletHoles = [];
    
    // Conectar con sistema de memoria IA
    if (window.memorySystem) {
      this.memorySystem = window.memorySystem;
      this.aiCommunicationEnabled = true;
      this.memorySystem.reportSuccess('BULLETS', 'Sistema de balas optimizado inicializado');
    }
    
    console.log('🔫 Sistema de balas inicializado');
  }

  // Crear una nueva bala con validaciones mejoradas
  createBullet(startX, startY, startZ, angle, pitch = 0) {
    // Validar parámetros de entrada
    if (typeof startX !== 'number' || typeof startZ !== 'number' || 
        typeof angle !== 'number' || isNaN(startX) || isNaN(startZ) || isNaN(angle)) {
      console.warn('⚠️ Parámetros inválidos para crear bala');
      return null;
    }
    
    // Limitar número de balas activas
    if (this.bullets.length >= this.maxBullets) {
      // Remover la bala más antigua
      this.bullets.shift();
    }
    
    const bullet = {
      x: startX,
      y: startY || (CONFIG.player?.cameraHeight || 50),
      z: startZ,
      vx: Math.cos(angle) * (CONFIG.bullet?.speed || 500),
      vy: Math.sin(pitch) * (CONFIG.bullet?.speed || 500),
      vz: Math.sin(angle) * (CONFIG.bullet?.speed || 500),
      life: 1.0,
      distance: 0,
      maxDistance: CONFIG.bullet?.maxDistance || 1000,
      damage: CONFIG.bullet?.damage || 25,
      id: Date.now() + Math.random() // ID único para tracking
    };
    
    this.bullets.push(bullet);
    
    if (this.memorySystem) {
      this.memorySystem.reportSuccess('BULLET_CREATED', 'Bala creada correctamente');
    }
    
    return bullet;
  }

  // Actualizar todas las balas con optimizaciones
  update(deltaTime) {
    const startTime = performance.now();
    
    try {
      const dt = Math.min(deltaTime / 1000, 0.05); // Limitar delta time para estabilidad
      
      // Procesamiento distribuido de balas
      this.updateBulletsOptimized(dt);
      
      // Limpieza de agujeros de bala
      this.cleanupBulletHoles();
      
      // Monitorear rendimiento
      this.monitorPerformance(startTime);
      
    } catch (error) {
      console.error('❌ Error en sistema de balas:', error);
      
      if (this.memorySystem) {
        this.memorySystem.reportError('BULLET_SYSTEM_ERROR', `Error en sistema de balas: ${error.message}`, 'medium');
      }
      
      // Modo de emergencia: limpiar todas las balas
      this.emergencyCleanup();
    }
  }
  
  updateBulletsOptimized(dt) {
    const maxProcessingTime = 5; // Máximo 5ms para actualizar balas
    const startTime = performance.now();
    let processedBullets = 0;
    
    this.bullets = this.bullets.filter(bullet => {
      // Verificar tiempo de procesamiento
      if (performance.now() - startTime > maxProcessingTime && processedBullets > 0) {
        console.warn('⚠️ Procesamiento de balas truncado por tiempo');
        return true; // Mantener balas no procesadas para el siguiente frame
      }
      
      processedBullets++;
      
      try {
        // Validar bala antes de procesarla
        if (!this.validateBullet(bullet)) {
          return false;
        }
        
        // Mover la bala
        bullet.x += bullet.vx * dt;
        bullet.y += bullet.vy * dt;
        bullet.z += bullet.vz * dt;
        
        bullet.distance += Math.abs(bullet.vx) * dt; // Usar velocidad para distancia
        
        // Verificar si la bala salió del rango
        if (bullet.distance > bullet.maxDistance) {
          return false;
        }
        
        // Verificar colisión con paredes (optimizada)
        if (this.checkWallCollisionOptimized(bullet)) {
          this.createBulletHole(bullet.x, bullet.y, bullet.z);
          return false;
        }
        
        // Verificar colisión con enemigos (optimizada)
        if (this.checkEnemyCollisionOptimized(bullet)) {
          return false;
        }
        
        return true;
        
      } catch (error) {
        console.error('❌ Error procesando bala:', error);
        return false; // Remover bala problemática
      }
    });
  }
  
  validateBullet(bullet) {
    return bullet && 
           typeof bullet.x === 'number' && !isNaN(bullet.x) &&
           typeof bullet.z === 'number' && !isNaN(bullet.z) &&
           typeof bullet.vx === 'number' && !isNaN(bullet.vx) &&
           typeof bullet.vz === 'number' && !isNaN(bullet.vz);
  }

  // Verificar colisión con paredes optimizada
  checkWallCollisionOptimized(bullet) {
    // Verificar que la bala tenga coordenadas válidas
    if (!this.validateBullet(bullet)) {
      return true;
    }
    
    try {
      const mapX = Math.floor(bullet.x / CONFIG.world.cellSize);
      const mapZ = Math.floor(bullet.z / CONFIG.world.cellSize);
      
      // Verificar límites del mapa con validación adicional
      if (mapX < 0 || mapX >= (CONFIG.world?.gridCols || 25) || 
          mapZ < 0 || mapZ >= (CONFIG.world?.gridRows || 25)) {
        return true; // Fuera del mapa
      }
      
      // Verificar que MAZE exista y tenga la estructura correcta
      if (!window.MAZE || !Array.isArray(window.MAZE) || 
          !window.MAZE[mapZ] || !Array.isArray(window.MAZE[mapZ])) {
        return true;
      }
      
      return MAZE[mapZ][mapX] === 1; // Pared
      
    } catch (error) {
      console.error('❌ Error en verificación de colisión con pared:', error);
      return true; // En caso de error, considerar como colisión
    }
  }

  // Verificar colisión con enemigos optimizada
  checkEnemyCollisionOptimized(bullet) {
    if (!window.enemies || !Array.isArray(window.enemies)) {
      return false;
    }
    
    try {
      // Limitar número de enemigos a verificar por frame
      const maxEnemyChecks = 5;
      let checkedEnemies = 0;
      
      for (const enemy of window.enemies) {
        if (checkedEnemies >= maxEnemyChecks) break;
        
        if (!enemy || !enemy.alive) continue;
        
        checkedEnemies++;
        
        const dx = bullet.x - enemy.x;
        const dz = bullet.z - enemy.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        const hitRadius = (enemy.size || 40) / 2;
        
        if (distance < hitRadius) {
          // Verificar si es headshot
          const isHeadshot = this.isHeadshotOptimized(bullet, enemy);
          
          // Aplicar daño usando el sistema de enemigos
          let killed = false;
          if (window.game && window.game.enemySystem && window.game.enemySystem.takeDamage) {
            killed = window.game.enemySystem.takeDamage(enemy, bullet.damage, isHeadshot);
          } else {
            // Fallback
            enemy.takeDamage(bullet.damage);
            killed = !enemy.alive;
          }
          
          // Crear efectos
          this.createHitEffects(bullet, enemy, isHeadshot);
          
          // Reportar a las IAs
          if (this.memorySystem) {
            const hitType = isHeadshot ? 'HEADSHOT' : 'BODY_HIT';
            this.memorySystem.reportSuccess(hitType, `Impacto ${isHeadshot ? 'crítico' : 'normal'} en enemigo`);
          }
          
          return true; // Bala impactó
        }
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Error en verificación de colisión con enemigo:', error);
      return false;
    }
  }

  // Verificar headshot optimizada
  isHeadshotOptimized(bullet, enemy) {
    try {
      const enemyHeight = (enemy.size || 40) * (CONFIG.enemy?.heightMultiplier || 1.5);
      const headHeight = enemyHeight * (CONFIG.enemy?.headHeight || 0.3);
      const headY = enemy.y + enemyHeight - headHeight;
      
      return bullet.y >= headY && bullet.y <= enemy.y + enemyHeight;
      
    } catch (error) {
      console.error('❌ Error verificando headshot:', error);
      return false;
    }
  }

  // Crear efectos de impacto
  createHitEffects(bullet, enemy, isHeadshot) {
    try {
      // Efectos de partículas
      if (window.particleSystemInstance && window.particleSystemInstance.createBloodSplash) {
        const color = isHeadshot ? [255, 255, 0] : [255, 0, 0]; // Amarillo para headshot
        window.particleSystemInstance.createBloodSplash(enemy.x, enemy.z, color);
      }
      
      // Efectos de sonido
      if (window.game && window.game.audioSystem) {
        const soundType = isHeadshot ? 'headshot' : 'hit';
        if (window.game.audioSystem.playHit) {
          window.game.audioSystem.playHit(soundType);
        }
      }
      
    } catch (error) {
      console.error('❌ Error creando efectos de impacto:', error);
    }
  }

  // Crear agujero de bala optimizado
  createBulletHole(x, y, z) {
    try {
      const hole = { x, y, z, time: Date.now() };
      this.bulletHoles.push(hole);
      
      // Mantener límite de agujeros
      if (this.bulletHoles.length > this.maxHoles) {
        this.bulletHoles.shift();
      }
      
    } catch (error) {
      console.error('❌ Error creando agujero de bala:', error);
    }
  }
  
  cleanupBulletHoles() {
    const maxAge = 30000; // 30 segundos
    const now = Date.now();
    
    this.bulletHoles = this.bulletHoles.filter(hole => {
      return (now - hole.time) < maxAge;
    });
  }
  
  monitorPerformance(startTime) {
    const frameTime = performance.now() - startTime;
    this.performanceMonitor.totalUpdateTime += frameTime;
    this.performanceMonitor.frameCount++;
    
    if (this.performanceMonitor.frameCount >= 60) { // Cada 60 frames
      this.performanceMonitor.averageTime = 
        this.performanceMonitor.totalUpdateTime / this.performanceMonitor.frameCount;
      
      if (this.performanceMonitor.averageTime > 3) { // Más de 3ms promedio
        console.warn(`⚠️ Sistema de balas lento: ${this.performanceMonitor.averageTime.toFixed(2)}ms promedio`);
        
        if (this.memorySystem) {
          this.memorySystem.reportError('BULLET_PERFORMANCE', 
            `Sistema de balas lento: ${this.performanceMonitor.averageTime.toFixed(2)}ms promedio`, 'medium');
        }
      }
      
      // Reset
      this.performanceMonitor.totalUpdateTime = 0;
      this.performanceMonitor.frameCount = 0;
    }
  }
  
  emergencyCleanup() {
    console.warn('🚨 Limpieza de emergencia del sistema de balas');
    this.bullets = [];
    this.bulletHoles = [];
    
    if (this.memorySystem) {
      this.memorySystem.reportError('BULLET_EMERGENCY_CLEANUP', 'Sistema de balas limpiado por emergencia', 'medium');
    }
  }

  // Renderizar balas y efectos
  render(ctx, player) {
    try {
      this.renderBullets(ctx, player);
      this.renderBulletHoles(ctx, player);
      
    } catch (error) {
      console.error('❌ Error renderizando sistema de balas:', error);
    }
  }
  
  renderBullets(ctx, player) {
    // Renderizado simple y eficiente de balas
    ctx.fillStyle = '#FFFF00'; // Amarillo
    
    this.bullets.forEach(bullet => {
      try {
        const dx = bullet.x - player.x;
        const dz = bullet.z - player.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance > (CONFIG.world?.maxRenderDistance || 500)) return;
        
        const angle = Math.atan2(dz, dx) - player.angle;
        let normalizedAngle = angle;
        while (normalizedAngle > Math.PI) normalizedAngle -= 2 * Math.PI;
        while (normalizedAngle < -Math.PI) normalizedAngle += 2 * Math.PI;
        
        if (Math.abs(normalizedAngle) > CONFIG.world.fov / 2) return;
        
        const screenX = ctx.canvas.width * 0.5 + (normalizedAngle / (CONFIG.world.fov / 2)) * (ctx.canvas.width * 0.5);
        const bulletSize = Math.max(2, 10 / distance * 100);
        
        ctx.fillRect(screenX - bulletSize/2, ctx.canvas.height * 0.5 - bulletSize/2, bulletSize, bulletSize);
        
      } catch (error) {
        console.error('❌ Error renderizando bala:', error);
      }
    });
  }
  
  renderBulletHoles(ctx, player) {
    // Renderizado simple de agujeros de bala en paredes
    ctx.fillStyle = '#222222';
    
    this.bulletHoles.forEach(hole => {
      try {
        const dx = hole.x - player.x;
        const dz = hole.z - player.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance > 200) return; // Solo renderizar agujeros cercanos
        
        // Renderizado simplificado en el mapa 2D si está disponible
        // (esto se puede expandir según sea necesario)
        
      } catch (error) {
        console.error('❌ Error renderizando agujero de bala:', error);
      }
    });
  }
  
  // Métodos de utilidad
  getBulletCount() {
    return this.bullets.length;
  }
  
  clearAllBullets() {
    this.bullets = [];
    console.log('🧹 Todas las balas limpiadas');
  }
  
  getBulletHoleCount() {
    return this.bulletHoles.length;
  }
}

// Exponer globalmente
window.BulletSystem = OptimizedBulletSystem;

// Reemplazar sistema de balas existente
if (window.BulletSystem) {
  console.log('🔄 Reemplazando sistema de balas con versión optimizada');
}

window.BulletSystem = OptimizedBulletSystem;
window.OptimizedBulletSystem = OptimizedBulletSystem;

console.log('✅ Sistema de Balas Optimizado Anti-Cuelgues cargado');
