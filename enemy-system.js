// Sistema especializado de enemigos
window.EnemySystem = {
  enemies: [],
  spawnCooldown: 0,
  maxEnemies: 12,
  
  TYPES: {
    casual: { name: 'Casual', speed: 1.0, scale: 1.0, health: 100 },
    deportivo: { name: 'Deportivo', speed: 1.5, scale: 1.1, health: 120 },
    presidencial: { name: 'Presidencial', speed: 0.8, scale: 1.3, health: 150 }
  },
  
  init() {
    console.log('👾 Enemy System inicializado');
    this.enemies = [];
    window.enemies = this.enemies;
  },
  
  generateInitialEnemies() {
    console.log('🎯 Generando enemigos iniciales...');
    
    const targetCount = 8;
    for (let i = 0; i < targetCount; i++) {
      this.spawnRandomEnemy();
    }
    
    console.log(`✅ ${this.enemies.length} enemigos generados`);
    this.logEnemyDistribution();
  },
  
  spawnRandomEnemy() {
    if (this.enemies.length >= this.maxEnemies) return;
    
    // Encontrar posición libre
    const position = this.findValidSpawnPosition();
    if (!position) {
      console.warn('⚠️ No se pudo encontrar posición libre para enemigo');
      return;
    }
    
    const types = ['casual', 'deportivo', 'presidencial'];
    const type = types[Math.floor(Math.random() * types.length)];
    const typeConfig = this.TYPES[type];
    
    const enemy = {
      x: position.x,
      z: position.z,
      y: 0,
      type: type,
      health: typeConfig.health,
      maxHealth: typeConfig.health,
      speed: typeConfig.speed + Math.random() * 0.3,
      angle: Math.random() * Math.PI * 2,
      state: 'wandering', // wandering, chasing, attacking
      lastStateChange: Date.now(),
      lastShot: 0,
      radius: 15 * typeConfig.scale,
      
      // IA
      targetX: position.x,
      targetZ: position.z,
      pathfindingCooldown: 0,
      
      // Animación
      spriteFrame: 0,
      lastFrameTime: Date.now(),
      
      // Métodos
      takeDamage: function(damage) {
        this.health -= damage;
        console.log(`👾 ${this.type} recibe ${damage} daño! Vida: ${this.health}`);
        return this.health <= 0;
      },
      
      update: function() {
        // Actualizar este enemigo específico
        if (window.EnemySystem) {
          window.EnemySystem.updateSingleEnemy(this);
        }
      }
    };
    
    this.enemies.push(enemy);
    window.enemies = this.enemies; // Sincronizar
    console.log(`👾 Enemigo ${type} spawneado en (${Math.floor(position.x)}, ${Math.floor(position.z)})`);
  },
  
  spawnEnemy() {
    return this.spawnRandomEnemy();
  },
  
  findValidSpawnPosition() {
    const config = {
      MIN_DISTANCE_FROM_PLAYER: 100,
      MIN_DISTANCE_BETWEEN_ENEMIES: 50
    };
    
    const maxAttempts = 50;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Generar posición aleatoria
      const x = (2 + Math.random() * (window.Utils.mapConfig.gridCols - 4)) * window.Utils.mapConfig.cellSize;
      const z = (2 + Math.random() * (window.Utils.mapConfig.gridRows - 4)) * window.Utils.mapConfig.cellSize;
      
      // Verificar que no haya colisión con paredes
      if (window.Utils && window.Utils.collides(x, z, 20)) {
        continue;
      }
      
      // Verificar distancia del jugador
      let distanceFromPlayer = Infinity;
      if (window.player) {
        distanceFromPlayer = window.Utils.distance(x, z, window.player.x, window.player.z);
        if (distanceFromPlayer < config.MIN_DISTANCE_FROM_PLAYER) {
          continue;
        }
      }
      
      // Verificar distancia de otros enemigos
      let tooClose = false;
      for (const enemy of this.enemies) {
        const distanceFromEnemy = window.Utils.distance(x, z, enemy.x, enemy.z);
        if (distanceFromEnemy < config.MIN_DISTANCE_BETWEEN_ENEMIES) {
          tooClose = true;
          break;
        }
      }
      
      if (!tooClose) {
        return { x, z, distanceFromPlayer };
      }
    }
    
    console.warn('⚠️ No se pudo encontrar posición válida después de', maxAttempts, 'intentos');
    return null;
  },
  
  updateAll() {
    if (!this.enemies || this.enemies.length === 0) {
      return;
    }
    
    // Actualizar cada enemigo
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      this.updateSingleEnemy(enemy);
      
      // Remover enemigos muertos
      if (enemy.health <= 0) {
        this.enemies.splice(i, 1);
      }
    }
    
    // Sincronizar con variable global
    window.enemies = this.enemies;
    
    // Actualizar contador en UI
    this.updateEnemyCountUI();
    
    // Respawn automático
    if (this.enemies.length < 6 && Date.now() - this.spawnCooldown > 15000) {
      this.spawnRandomEnemy();
      this.spawnCooldown = Date.now();
    }
  },
  
  updateSingleEnemy(enemy) {
    if (!window.player || !enemy) return;
    
    const player = window.player;
    const distanceToPlayer = window.Utils.distance(enemy.x, enemy.z, player.x, player.z);
    
    // Actualizar estado basado en distancia al jugador
    if (distanceToPlayer < 100) {
      enemy.state = 'chasing';
    } else if (distanceToPlayer > 200) {
      enemy.state = 'wandering';
    }
    
    // Comportamiento según estado
    switch (enemy.state) {
      case 'wandering':
        this.wanderBehavior(enemy);
        break;
      case 'chasing':
        this.chaseBehavior(enemy);
        break;
      case 'attacking':
        this.attackBehavior(enemy);
        break;
    }
    
    // Actualizar animación
    if (Date.now() - enemy.lastFrameTime > 200) {
      enemy.spriteFrame = (enemy.spriteFrame + 1) % 4;
      enemy.lastFrameTime = Date.now();
    }
  },
  
  wanderBehavior(enemy) {
    // Cambiar dirección ocasionalmente
    if (Date.now() - enemy.lastStateChange > 3000) {
      enemy.angle = Math.random() * Math.PI * 2;
      enemy.lastStateChange = Date.now();
    }
    
    // Mover
    const newX = enemy.x + Math.cos(enemy.angle) * enemy.speed;
    const newZ = enemy.z + Math.sin(enemy.angle) * enemy.speed;
    
    if (window.Utils && !window.Utils.collides(newX, newZ, enemy.radius)) {
      enemy.x = newX;
      enemy.z = newZ;
    } else {
      // Cambiar dirección si choca
      enemy.angle = Math.random() * Math.PI * 2;
    }
  },
  
  chaseBehavior(enemy) {
    const player = window.player;
    
    // Calcular ángulo hacia el jugador
    const angleToPlayer = window.Utils.angle(enemy.x, enemy.z, player.x, player.z);
    enemy.angle = angleToPlayer;
    
    // Mover hacia el jugador
    const newX = enemy.x + Math.cos(enemy.angle) * enemy.speed * 1.5;
    const newZ = enemy.z + Math.sin(enemy.angle) * enemy.speed * 1.5;
    
    if (window.Utils && !window.Utils.collides(newX, newZ, enemy.radius)) {
      enemy.x = newX;
      enemy.z = newZ;
    }
    
    // Cambiar a atacar si está muy cerca
    const distance = window.Utils.distance(enemy.x, enemy.z, player.x, player.z);
    if (distance < 50) {
      enemy.state = 'attacking';
      enemy.lastStateChange = Date.now();
    }
  },
  
  attackBehavior(enemy) {
    // Atacar al jugador
    if (Date.now() - enemy.lastShot > 1500) {
      this.enemyAttack(enemy);
      enemy.lastShot = Date.now();
    }
    
    // Volver a perseguir si el jugador se aleja
    const distance = window.Utils.distance(enemy.x, enemy.z, window.player.x, window.player.z);
    if (distance > 80) {
      enemy.state = 'chasing';
    }
  },
  
  enemyAttack(enemy) {
    if (!window.player) return;
    
    console.log(`👾 ${enemy.type} ataca al jugador!`);
    
    // Verificar si tiene línea de vista
    const hit = window.Utils.raycast(enemy.x, enemy.z, window.player.x, window.player.z);
    if (!hit) {
      // Daño al jugador
      const damage = this.TYPES[enemy.type].health / 10; // Daño proporcional
      window.player.health -= damage;
      console.log(`💔 Jugador recibe ${damage} daño! Vida: ${window.player.health}`);
      
      // Efecto visual - CORREGIDO
      if (window.Effects && typeof window.Effects.addEffect === 'function') {
        window.Effects.addEffect('muzzleFlash', enemy.x, enemy.z, 300);
      } else if (window.VisualEffects && typeof window.VisualEffects.addEffect === 'function') {
        window.VisualEffects.addEffect('muzzleFlash', enemy.x, enemy.z, 300);
      }
      
      // Game over si se queda sin vida
      if (window.player.health <= 0) {
        console.log('💀 GAME OVER');
        if (window.GameCore) {
          window.GameCore.gameOver();
        }
      }
    }
  },

  damageEnemy(enemyIndex, damage) {
    if (enemyIndex < 0 || enemyIndex >= this.enemies.length) return false;
    
    const enemy = this.enemies[enemyIndex];
    enemy.health -= damage;
    
    console.log(`🎯 ${enemy.type} recibe ${damage} de daño! Vida: ${enemy.health}`);
    
    if (enemy.health <= 0) {
      console.log(`💀 ${enemy.type} eliminado!`);
      
      // Efecto de muerte - CORREGIDO
      if (window.Effects && typeof window.Effects.addEffect === 'function') {
        window.Effects.addEffect('enemyDeath', enemy.x, enemy.z, 1000);
      } else if (window.VisualEffects && typeof window.VisualEffects.addEffect === 'function') {
        window.VisualEffects.addEffect('enemyDeath', enemy.x, enemy.z, 1000);
      }
      
      // Actualizar puntuación
      if (window.GameState) {
        window.GameState.addKill();
      }
      
      return true; // Enemigo muerto
    }
    
    // Cambiar a estado de persecución
    enemy.state = 'chasing';
    enemy.lastStateChange = Date.now();
    
    return false;
  },
  
  getEnemyAt(x, z, radius = 20) {
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      const distance = window.Utils.distance(x, z, enemy.x, enemy.z);
      if (distance < radius) {
        return i;
      }
    }
    return -1;
  },
  
  manualSpawnEnemies() {
    console.log('🆘 Iniciando spawn manual de enemigos...');
    
    if (!window.enemies) {
      window.enemies = [];
    }
    
    const types = ['casual', 'deportivo', 'presidencial'];
    const spawnCount = 8;
    
    for (let i = 0; i < spawnCount; i++) {
      try {
        const type = types[Math.floor(Math.random() * types.length)];
        const x = (3 + Math.random() * 10) * 50;
        const z = (3 + Math.random() * 10) * 50;
        
        const enemy = {
          x: x,
          z: z,
          y: 0,
          type: type,
          health: this.TYPES[type].health,
          maxHealth: this.TYPES[type].health,
          speed: this.TYPES[type].speed + Math.random() * 0.5,
          angle: Math.random() * Math.PI * 2,
          state: 'wandering',
          lastStateChange: Date.now(),
          lastShot: 0,
          radius: 15,
          targetX: x,
          targetZ: z,
          pathfindingCooldown: 0,
          spriteFrame: 0,
          lastFrameTime: Date.now(),
          
          takeDamage: function(damage) {
            this.health -= damage;
            return this.health <= 0;
          },
          
          update: function() {
            if (window.EnemySystem) {
              window.EnemySystem.updateSingleEnemy(this);
            }
          }
        };
        
        this.enemies.push(enemy);
        console.log(`🔧 Enemigo manual ${type} spawneado en (${Math.floor(x)}, ${Math.floor(z)})`);
        
      } catch (error) {
        console.error(`Error en spawn manual ${i}:`, error);
      }
    }
    
    window.enemies = this.enemies;
    console.log(`🔧 Spawn manual completado: ${this.enemies.length} enemigos total`);
  },
  
  logEnemyDistribution() {
    const distribution = {};
    if (this.enemies) {
      this.enemies.forEach(enemy => {
        distribution[enemy.type] = (distribution[enemy.type] || 0) + 1;
      });
    }
    
    console.log('👾 Distribución de enemigos:');
    Object.keys(distribution).forEach(type => {
      const config = this.TYPES[type];
      console.log(`- ${config.name}: ${distribution[type]} (Vida: ${config.health}, Velocidad: ${config.speed}, Escala: ${config.scale})`);
    });
  },
  
  updateEnemyCountUI() {
    const enemyCountEl = document.getElementById('enemy-count');
    if (enemyCountEl) {
      enemyCountEl.textContent = this.enemies.length;
    }
  },
  
  clearAllEnemies() {
    this.enemies = [];
    window.enemies = [];
    console.log('🧹 Todos los enemigos eliminados');
  }
};

console.log('👾 Enemy System cargado y disponible');
