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
  }
  
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
