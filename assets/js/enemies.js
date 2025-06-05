// Sistema de enemigos optimizado
class Enemy {
  constructor(x, z, type = 'basic') {
    this.x = x;
    this.z = z;
    this.type = type;
    this.health = 100;
    this.maxHealth = 100;
    this.speed = GAME_CONFIG.enemySpeed;
    this.lastAttack = 0;
    this.attackCooldown = 1000;
    this.viewDistance = 300;
    this.alive = true;
    
    this.setupType();
  }
  
  setupType() {
    switch (this.type) {
      case 'fast':
        this.speed *= 1.5;
        this.health = 75;
        this.color = [255, 150, 150];
        break;
      case 'strong':
        this.speed *= 0.7;
        this.health = 150;
        this.color = [150, 150, 255];
        break;
      default:
        this.color = [255, 100, 100];
        break;
    }
    this.maxHealth = this.health;
  }
  
  update() {
    if (!this.alive || !window.player) return;
    
    const distance = this.getDistanceToPlayer();
    
    if (distance < this.viewDistance) {
      this.moveTowardsPlayer();
      
      if (distance < 40 && Date.now() - this.lastAttack > this.attackCooldown) {
        this.attack();
      }
    }
  };
  
  moveTowardsPlayer() {
    const dx = window.player.x - this.x;
    const dz = window.player.z - this.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance > 0) {
      const moveX = (dx / distance) * this.speed;
      const moveZ = (dz / distance) * this.speed;
      
      if (this.canMoveTo(this.x + moveX, this.z + moveZ)) {
        this.x += moveX;
        this.z += moveZ;
      }
    }
  }
  
  canMoveTo(x, z) {
    const mapX = Math.floor(x / GAME_CONFIG.cellSize);
    const mapZ = Math.floor(z / GAME_CONFIG.cellSize);
    
    return mapX >= 0 && mapX < GAME_CONFIG.gridCols &&
           mapZ >= 0 && mapZ < GAME_CONFIG.gridRows &&
           MAZE[mapZ][mapX] === 0;
  }
  
  attack() {
    this.lastAttack = Date.now();
    window.player.takeDamage(20);
    console.log('👾 Enemy attacked!');
  }
  
  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.die();
    }
  }
  
  die() {
    this.alive = false;
    console.log('💀 Enemy died');
  }
  
  getDistanceToPlayer() {
    if (!window.player) return Infinity;
    const dx = this.x - window.player.x;
    const dz = this.z - window.player.z;
    return Math.sqrt(dx * dx + dz * dz);
  }
  
  getColor() {
    return this.color;
  }
}

window.EnemyManager = {
  enemies: [],
  lastSpawn: 0,
  
  init() {
    this.enemies = [];
    this.spawnInitialEnemies();
    console.log('👾 Enemy Manager inicializado');
  },
  
  spawnInitialEnemies() {
    const spawnPoints = [
      [3, 3], [20, 3], [3, 12], [20, 12],
      [12, 7], [6, 8], [18, 8]
    ];
    
    const types = ['basic', 'fast', 'strong'];
    
    spawnPoints.forEach((pos, i) => {
      const x = pos[0] * GAME_CONFIG.cellSize + GAME_CONFIG.cellSize / 2;
      const z = pos[1] * GAME_CONFIG.cellSize + GAME_CONFIG.cellSize / 2;
      const type = types[i % types.length];
      
      if (MAZE[pos[1]][pos[0]] === 0) {
        this.enemies.push(new Enemy(x, z, type));
      }
    });
    
    // Compatibilidad
    window.enemies = this.enemies;
  },
  
  update() {
    // Actualizar enemigos existentes
    this.enemies.forEach(enemy => enemy.update());
    
    // Remover enemigos muertos
    this.enemies = this.enemies.filter(enemy => enemy.alive);
    window.enemies = this.enemies;
    
    // Spawn nuevos enemigos
    if (this.enemies.length < GAME_CONFIG.maxEnemies && 
        Date.now() - this.lastSpawn > GAME_CONFIG.spawnCooldown) {
      this.spawnRandomEnemy();
    }
  },
  
  spawnRandomEnemy() {
    for (let attempts = 0; attempts < 20; attempts++) {
      const x = (2 + Math.random() * (GAME_CONFIG.gridCols - 4)) * GAME_CONFIG.cellSize;
      const z = (2 + Math.random() * (GAME_CONFIG.gridRows - 4)) * GAME_CONFIG.cellSize;
      
      const mapX = Math.floor(x / GAME_CONFIG.cellSize);
      const mapZ = Math.floor(z / GAME_CONFIG.cellSize);
      
      if (MAZE[mapZ][mapX] === 0) {
        const types = ['basic', 'fast', 'strong'];
        const type = types[Math.floor(Math.random() * types.length)];
        this.enemies.push(new Enemy(x, z, type));
        this.lastSpawn = Date.now();
        break;
      }
    }
  },
  
  getEnemyAt(x, z, radius = 30) {
    return this.enemies.find(enemy => {
      const dx = enemy.x - x;
      const dz = enemy.z - z;
      return Math.sqrt(dx * dx + dz * dz) < radius;
    });
  }
};

window.Enemy = Enemy;
console.log('👾 Enemy system cargado');

// Sistema de enemigos optimizado
class EnemySystem {
  constructor() {
    this.enemies = [];
    this.spawnTimer = 0;
    this.deadPool = [];
    console.log('👾 EnemySystem inicializado');
  }

  update(currentTime, player) {
    if (currentTime - this.spawnTimer > CONFIG.enemy.spawnCooldown) {
      this.spawnEnemy(player);
      this.spawnTimer = currentTime;
    }

    this.enemies.forEach(enemy => {
      if (enemy.health > 0) {
        this.updateAI(enemy, player);
        this.updateMovement(enemy);
      }
    });

    this.cleanup(currentTime);
  }

  spawnEnemy(player) {
    const aliveCount = this.enemies.filter(e => e.health > 0).length;
    if (aliveCount >= CONFIG.enemy.maxCount) return;

    this.enemies.push({
      id: Date.now() + Math.random(),
      x: CONFIG.player.startX + 200 + Math.random() * 400,
      z: CONFIG.player.startZ + 200 + Math.random() * 400,
      y: 30,
      health: CONFIG.enemy.health,
      maxHealth: CONFIG.enemy.health,
      angle: Math.random() * Math.PI * 2,
      moveDirection: Math.random() * Math.PI * 2,
      state: 'wandering',
      size: CONFIG.enemy.size,
      spriteVariant: Math.floor(Math.random() * 3)
    });
  }

  updateAI(enemy, player) {
    const dx = player.x - enemy.x;
    const dz = player.z - enemy.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance < CONFIG.enemy.detectionRange) {
      enemy.state = 'chasing';
      enemy.moveDirection = Math.atan2(dz, dx);
    }
  }

  updateMovement(enemy) {
    const speed = CONFIG.enemy.speed * 0.016;
    const newX = enemy.x + Math.cos(enemy.moveDirection) * speed;
    const newZ = enemy.z + Math.sin(enemy.moveDirection) * speed;
    
    if (Utils.canMoveTo(newX, newZ)) {
      enemy.x = newX;
      enemy.z = newZ;
    } else {
      enemy.moveDirection = Math.random() * Math.PI * 2;
    }
  }

  render(ctx, player, raycastingEngine) {
    this.enemies.forEach(enemy => {
      if (enemy.health <= 0) return;
      
      const screenPos = raycastingEngine.worldToScreen(enemy.x, enemy.z, player);
      if (!screenPos) return;
      
      const size = CONFIG.enemy.size * screenPos.scale;
      const y = screenPos.screenY - size * 0.5;
      
      // Dibujar enemigo
      ctx.fillStyle = '#FF6600';
      ctx.fillRect(screenPos.screenX - size * 0.5, y, size, size);
      
      // Barra de vida
      if (enemy.health < enemy.maxHealth) {
        const barWidth = size * 0.8;
        const barHeight = 4;
        const healthRatio = enemy.health / enemy.maxHealth;
        
        ctx.fillStyle = '#333333';
        ctx.fillRect(screenPos.screenX - barWidth * 0.5, y - 10, barWidth, barHeight);
        
        ctx.fillStyle = healthRatio > 0.5 ? '#00FF00' : '#FF0000';
        ctx.fillRect(screenPos.screenX - barWidth * 0.5, y - 10, barWidth * healthRatio, barHeight);
        
        // Número de vida
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(enemy.health.toString(), screenPos.screenX, y - 15);
      }
    });
  }

  takeDamage(enemy, damage) {
    enemy.health -= damage;
    if (enemy.health <= 0) {
      enemy.health = 0;
      enemy.deathTime = Date.now();
      return true;
    }
    return false;
  }

  cleanup(currentTime) {
    this.enemies = this.enemies.filter(enemy => {
      if (enemy.health <= 0 && (currentTime - (enemy.deathTime || currentTime)) >= 3000) {
        return false;
      }
      return true;
    });
  }

  getAliveCount() {
    return this.enemies.filter(e => e.health > 0).length;
  }
}

window.EnemySystem = EnemySystem;
console.log('✅ EnemySystem cargado');

// Extensión del sistema de enemigos con renderizado avanzado
EnemySystem.prototype.renderEnemy = function(ctx, enemy, player) {
    const dx = enemy.x - player.x;
    const dz = enemy.z - player.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance > 800) return;
    
    const angle = Math.atan2(dz, dx) - player.angle;
    
    if (Math.abs(angle) > (Math.PI / 3)) return;
    
    const screenX = ctx.canvas.width * 0.5 + (angle / (CONFIG.world.fov / 2)) * (ctx.canvas.width * 0.5);
    
    if (screenX < -100 || screenX > ctx.canvas.width + 100) return;
    
    const scale = Math.max(0.1, 300 / distance);
    const size = enemy.size * scale;
    const y = ctx.canvas.height * 0.7 - size * 0.5;
    
    const sprite = this.spriteSystem.getEnemySprite(enemy.spriteVariant);
    
    try {
      ctx.save();
      ctx.globalAlpha = Math.max(0.3, 1 - (distance / CONFIG.world.maxRenderDistance));
      ctx.drawImage(sprite, screenX - size * 0.5, y, size, size);
      ctx.restore();
      
      if (enemy.health < enemy.maxHealth) {
        this.renderHealthBar(ctx, screenX, y - 15, size, enemy);
      }
    } catch (e) {
      this.renderPlaceholder(ctx, screenX, y, size, enemy);
    }
  };

  EnemySystem.prototype.renderHealthBar = function(ctx, x, y, width, enemy) {
    const barWidth = width * 0.8;
    const barHeight = 6;
    const healthRatio = enemy.health / enemy.maxHealth;
    
    ctx.save();
    ctx.fillStyle = '#333333';
    ctx.fillRect(x - barWidth * 0.5, y, barWidth, barHeight);
    
    ctx.fillStyle = healthRatio > 0.5 ? '#00FF00' : healthRatio > 0.25 ? '#FFFF00' : '#FF0000';
    ctx.fillRect(x - barWidth * 0.5, y, barWidth * healthRatio, barHeight);
    
    // Mostrar número de vida
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${Math.max(10, width * 0.1)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(enemy.health.toString(), x, y - 3);
    ctx.restore();
  };

  EnemySystem.prototype.renderPlaceholder = function(ctx, x, y, size, enemy) {
      const healthRatio = enemy.health / enemy.maxHealth;
      ctx.fillStyle = `hsl(${healthRatio * 120}, 70%, 50%)`;
      ctx.fillRect(x - size * 0.5, y, size, size);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `${size * 0.3}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('N', x, y + size * 0.6);
    };
  
  EnemySystem.prototype.takeDamage = function(enemy, damage, isHeadshot = false) {
    enemy.health -= damage;
    if (enemy.health <= 0) {
      enemy.health = 0;
      enemy.deathTime = Date.now();
      return true;
    }
    return false;
  };

  EnemySystem.prototype.cleanup = function(currentTime) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy.health <= 0 && (currentTime - (enemy.deathTime || currentTime)) >= 3000) {
        this.deadPool.push(this.enemies.splice(i, 1)[0]);
        
        if (this.deadPool.length > CONFIG.enemy.maxCount * 2) {
          this.deadPool.shift();
        }
      }
    }
  }

EnemySystem.prototype.getAliveCount = function() {
    return this.enemies.filter(e => e.health > 0).length;
  };

window.EnemySystem = EnemySystem;
