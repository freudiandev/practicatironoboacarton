// Como crear un enemigo malo que camina por el mundo
class Enemy {
  constructor(x, z, type = 'basic') {
    this.x = x; // Dónde está parado (lado a lado)
    this.z = z; // Dónde está parado (adelante/atrás)
    this.y = 0; // Siempre en el suelo como nosotros
    this.type = type; // Qué tipo de enemigo es (rápido, fuerte, normal)
    this.health = CONFIG.enemy.health; // Cuánta vida tiene
    this.maxHealth = CONFIG.enemy.health; // Cuánta vida tenía al principio
    this.speed = CONFIG.enemy.speed; // Qué tan rápido camina
    this.size = CONFIG.enemy.size; // Qué tan grande es (todos iguales)
    this.lastAttack = 0; // Cuándo atacó por última vez
    this.attackCooldown = 1000; // Cuánto debe esperar para atacar otra vez
    this.viewDistance = CONFIG.enemy.detectionRange; // Qué tan lejos puede ver
    this.alive = true; // Si está vivo o muerto
    
    this.setupType(); // Configurar sus poderes especiales
    
    console.log(`👾 Enemigo '${this.type}' creado con vida: ${this.health}/${this.maxHealth}, tamaño: ${this.size}`);
  }

  setupType() {
    // Como elegir qué superpoder tiene cada enemigo
    switch (this.type) {
      case 'fast': // El enemigo rápido como un conejo
        this.speed *= 1.5; // Corre más rápido
        this.health = Math.floor(CONFIG.enemy.health * 0.75); // Pero tiene menos vida
        this.color = [255, 150, 150]; // Color rosado
        break;
      case 'strong': // El enemigo fuerte como un oso
        this.speed *= 0.7; // Camina más lento
        this.health = Math.floor(CONFIG.enemy.health * 1.5); // Pero tiene más vida
        this.color = [150, 150, 255]; // Color azul
        break;
      default: // El enemigo normal
        this.color = [255, 100, 100]; // Color rojo
        break;
    }
    this.maxHealth = this.health; // Recordar cuánta vida tenía al inicio
  }
  
  update() {
    // Solo hacer cosas si está vivo y el jugador existe
    if (!this.alive || !window.player) return;
    
    const distance = this.getDistanceToPlayer(); // Ver qué tan lejos está el jugador
    
    // Si el jugador está cerca, perseguirlo como un perro guardián
    if (distance < this.viewDistance) {
      this.moveTowardsPlayer(); // Caminar hacia el jugador
      
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
    const mapX = Math.floor(x / CONFIG.world.cellSize);
    const mapZ = Math.floor(z / CONFIG.world.cellSize);
    
    return mapX >= 0 && mapX < CONFIG.world.gridCols &&
           mapZ >= 0 && mapZ < CONFIG.world.gridRows &&
           MAZE[mapZ][mapX] === 0;
  }
  
  attack() {
    this.lastAttack = Date.now();
    window.player.takeDamage(20);
    console.log('👾 Enemy attacked!');
  }
    takeDamage(amount) {
    const prevHealth = this.health;
    this.health -= amount;
    console.log(`💥 Enemigo recibió ${amount} de daño. Vida: ${prevHealth} → ${this.health}`);
    
    if (this.health <= 0) {
      console.log(`💀 Enemigo murió! (vida final: ${this.health})`);
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
    
    spawnPoints.forEach((pos, i) => {      const x = pos[0] * CONFIG.world.cellSize + CONFIG.world.cellSize / 2;
      const z = pos[1] * CONFIG.world.cellSize + CONFIG.world.cellSize / 2;
      const type = types[i % types.length];
      
      if (MAZE[pos[1]][pos[0]] === 0) {
        // Crear enemigo con tamaño uniforme y en el suelo (y = 0)
        const enemy = new Enemy(x, z, type);
        enemy.y = 0; // ASEGURAR QUE ESTÉN EN EL SUELO
        this.enemies.push(enemy);
      }
    });
    
    // Compatibilidad
    window.enemies = this.enemies;
  },
    update() {
    console.log(`👾 EnemySystem Update: ${this.enemies.length} enemigos activos`);
    
    // Actualizar enemigos existentes
    this.enemies.forEach((enemy, index) => {
      enemy.update();
      console.log(`👾 Enemigo ${index}: x=${enemy.x.toFixed(2)}, z=${enemy.z.toFixed(2)}, vida=${enemy.health}, vivo=${enemy.alive}`);
    });
    
    // Remover enemigos muertos
    this.enemies = this.enemies.filter(enemy => enemy.alive);
    window.enemies = this.enemies;
      // Spawn nuevos enemigos
    if (this.enemies.length < CONFIG.enemy.maxCount && 
        Date.now() - this.lastSpawn > CONFIG.enemy.spawnCooldown) {
      console.log('🆕 Intentando generar nuevo enemigo...');
      this.spawnRandomEnemy();
    }
  },
    spawnRandomEnemy() {
    for (let attempts = 0; attempts < 20; attempts++) {
      const x = (2 + Math.random() * (CONFIG.world.gridCols - 4)) * CONFIG.world.cellSize;
      const z = (2 + Math.random() * (CONFIG.world.gridRows - 4)) * CONFIG.world.cellSize;
      
      const mapX = Math.floor(x / CONFIG.world.cellSize);
      const mapZ = Math.floor(z / CONFIG.world.cellSize);
      
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
    this.spriteSystem = new SpriteSystem();
    console.log('👾 EnemySystem inicializado con sistema de sprites');
  }  update(currentTime, player) {
    if (currentTime - this.spawnTimer > CONFIG.enemy.spawnCooldown) {
      this.spawnEnemy(player);
      this.spawnTimer = currentTime;
    }

    // Solo usar los métodos del EnemySystem, NO el método update() de la clase Enemy
    // para evitar duplicación de lógica y bucles infinitos
    this.enemies.forEach((enemy, index) => {
      if (enemy.alive && enemy.health > 0) {
        this.updateAI(enemy, player);
        this.updateMovement(enemy);
      }
    });

    this.cleanup(currentTime);
    
    // Log limitado cada 60 frames (1 segundo aprox)
    if (Math.floor(currentTime / 1000) % 1 === 0 && currentTime % 100 < 50) {
      console.log(`👾 EnemySystem: ${this.enemies.filter(e => e.alive).length}/${this.enemies.length} enemigos vivos`);
    }
  }spawnEnemy(player) {
    const aliveCount = this.enemies.filter(e => e.health > 0).length;
    if (aliveCount >= CONFIG.enemy.maxCount) return;

    // CREAR INSTANCIA DE LA CLASE ENEMY en vez de objeto plano
    const enemy = new Enemy(
      CONFIG.player.startX + 200 + Math.random() * 400,
      CONFIG.player.startZ + 200 + Math.random() * 400,
      'basic' // tipo básico por defecto
    );
    
    // Agregar propiedades específicas del sistema
    enemy.id = Date.now() + Math.random();
    enemy.angle = Math.random() * Math.PI * 2;
    enemy.moveDirection = Math.random() * Math.PI * 2;
    enemy.state = 'wandering';
    enemy.spriteVariant = Math.floor(Math.random() * 3);
    
    this.enemies.push(enemy);
    console.log(`👾 EnemySystem: Spawned enemy with alive=${enemy.alive}, health=${enemy.health}`);
  }
  updateAI(enemy, player) {
    // Usar método de la clase Enemy
    const distance = enemy.getDistanceToPlayer();
    
    if (distance < CONFIG.enemy.detectionRange) {
      enemy.state = 'chasing';
      const dx = player.x - enemy.x;
      const dz = player.z - enemy.z;
      enemy.moveDirection = Math.atan2(dz, dx);
    }
  }
  updateMovement(enemy) {
    const speed = CONFIG.enemy.speed * 0.016;
    const newX = enemy.x + Math.cos(enemy.moveDirection) * speed;
    const newZ = enemy.z + Math.sin(enemy.moveDirection) * speed;
    
    // Usar el método canMoveTo de la clase Enemy
    if (enemy.canMoveTo(newX, newZ)) {
      enemy.x = newX;
      enemy.z = newZ;
    } else {
      enemy.moveDirection = Math.random() * Math.PI * 2;
    }
  }render(ctx, player, raycastingEngine) {
    this.enemies.forEach(enemy => {
      // VERIFICAR QUE EL ENEMIGO ESTÉ VIVO ANTES DE RENDERIZAR
      if (!enemy.alive) return;
      
      // CALCULAR POSICIÓN MANUALMENTE SIN USAR worldToScreen (que aplica pitch)
      const dx = enemy.x - player.x;
      const dz = enemy.z - player.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      // Verificar rango de renderizado
      if (distance > CONFIG.world.maxRenderDistance) return;
      
      // VERIFICAR LINE-OF-SIGHT: No renderizar enemigos detrás de paredes
      if (!this.hasLineOfSight(player.x, player.z, enemy.x, enemy.z)) return;
      
      // Calcular ángulo relativo al jugador (solo horizontal)
      const angle = Math.atan2(dz, dx) - player.angle;
      let normalizedAngle = angle;
      while (normalizedAngle > Math.PI) normalizedAngle -= 2 * Math.PI;
      while (normalizedAngle < -Math.PI) normalizedAngle += 2 * Math.PI;
      
      // Verificar si está en el campo de visión
      if (Math.abs(normalizedAngle) > CONFIG.world.fov / 2) return;
      
      // Calcular posición X en pantalla (horizontal)
      const screenX = ctx.canvas.width * 0.5 + (normalizedAngle / (CONFIG.world.fov / 2)) * (ctx.canvas.width * 0.5);      // Calcular escala basada en distancia UNIFORME
      const baseScale = (ctx.canvas.height * 0.4) / distance; // Escala base uniforme
      const enemyWidth = CONFIG.enemy.size * baseScale; // Ancho del enemigo
      const enemyHeight = enemyWidth * CONFIG.enemy.heightMultiplier; // Altura 25% mayor
        // POSICIÓN Y CORRECTA: Los enemigos están AL NIVEL DEL SUELO DONDE CAMINA EL JUGADOR
      // El jugador está a altura CONFIG.player.cameraHeight (32), los enemigos en y=0 (suelo)
      const heightDifference = (player.y || CONFIG.player.cameraHeight) - enemy.y; // Diferencia real de altura
      
      // Calcular la proyección en pantalla basada en la diferencia de altura
      const pitchOffset = (player.pitch || 0) * (ctx.canvas.height / 3);
      const worldHorizonY = ctx.canvas.height * 0.5 + pitchOffset;
      
      // Proyectar la diferencia de altura en la pantalla
      const heightProjection = (heightDifference / distance) * (ctx.canvas.height * 0.8);
      
      // La base del enemigo debe estar por debajo del horizonte según la diferencia de altura
      const enemyBottomY = worldHorizonY + heightProjection;
      const enemyTopY = enemyBottomY - enemyHeight; // Parte superior del enemigo (ahora más alto)
      
      const x = screenX - enemyWidth * 0.5;
      const y = enemyTopY;
      
      // Guardar información para detección de headshot
      enemy.screenX = screenX;
      enemy.screenY = y;
      enemy.screenWidth = enemyWidth;
      enemy.screenHeight = enemyHeight;
      enemy.headY = y; // Parte superior del sprite
      enemy.headHeight = enemyHeight * CONFIG.enemy.headHeight; // 15% superior es la cabeza
      
      if (enemy.health <= 0) {
        // Renderizar Noboa muerto
        const deadSprite = this.spriteSystem.loadedImages.get('dead_sprite') || this.spriteSystem.createDeadSprite(64);
        if (!this.spriteSystem.loadedImages.has('dead_sprite')) {
          // Cargar imagen de Noboa muerto si no está cargada
          this.spriteSystem.loadImage('assets/images/noboa_d34d.png').then(img => {
            this.spriteSystem.loadedImages.set('dead_sprite', img);
          }).catch(() => {
            this.spriteSystem.loadedImages.set('dead_sprite', this.spriteSystem.createDeadSprite(64));
          });
        }        ctx.globalAlpha = 0.7; // Más transparente cuando está muerto
        ctx.drawImage(deadSprite, x, y, enemyWidth, enemyHeight);
        ctx.globalAlpha = 1.0;
        return;
      }
      
      // Obtener el sprite correspondiente al tipo de enemigo
      const spriteVariant = enemy.spriteVariant || 0;
      const sprite = this.spriteSystem.getEnemySprite(spriteVariant);      // Dibujar el sprite de Noboa con tamaño uniforme pero más alto
      if (sprite) {
        ctx.drawImage(sprite, x, y, enemyWidth, enemyHeight);
      } else {
        // Fallback si no se carga la imagen
        ctx.fillStyle = '#FF6600';
        ctx.fillRect(x, y, enemyWidth, enemyHeight);
      }      // Barra de vida con tamaño uniforme
      if (enemy.health < enemy.maxHealth) {
        const barWidth = enemyWidth * 0.8;
        const barHeight = 4;
        const healthRatio = enemy.health / enemy.maxHealth;        ctx.fillStyle = '#333333';
        ctx.fillRect(screenX - barWidth * 0.5, y - 10, barWidth, barHeight);
        
        ctx.fillStyle = healthRatio > 0.5 ? '#00FF00' : '#FF0000';
        ctx.fillRect(screenX - barWidth * 0.5, y - 10, barWidth * healthRatio, barHeight);
        
        // Número de vida
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';        ctx.fillText(enemy.health.toString(), screenX, y - 15);
      }
    });  }

  // Verificar si hay línea de vista directa entre jugador y enemigo (sin paredes)
  hasLineOfSight(x1, z1, x2, z2) {
    const distance = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
    const steps = Math.ceil(distance / 10); // Verificar cada 10 unidades
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const checkX = x1 + (x2 - x1) * t;
      const checkZ = z1 + (z2 - z1) * t;
      
      // Convertir a coordenadas de grid
      const gridX = Math.floor(checkX / CONFIG.world.cellSize);
      const gridZ = Math.floor(checkZ / CONFIG.world.cellSize);
      
      // Verificar si está fuera del mapa o es una pared
      if (gridX < 0 || gridX >= CONFIG.world.gridCols || 
          gridZ < 0 || gridZ >= CONFIG.world.gridRows || 
          MAZE[gridZ][gridX] === 1) {
        return false; // Hay una pared bloqueando
      }
    }
    
    return true; // Línea de vista despejada
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
      // Mantener enemigos vivos O enemigos muertos por menos de 3 segundos
      if (enemy.alive) return true;
      if (!enemy.alive && (currentTime - (enemy.deathTime || currentTime)) < 3000) return true;
      return false;
    });
  }  getAliveCount() {
    return this.enemies.filter(e => e.alive && e.health > 0).length;
  }

  renderHealthBar(ctx, x, y, enemyWidth, enemy) {
    const barWidth = enemyWidth * 0.8; // Usar ancho uniforme
    const barHeight = 6;
    const healthRatio = enemy.health / enemy.maxHealth;
    
    ctx.save();
    ctx.fillStyle = '#333333';
    ctx.fillRect(x - barWidth * 0.5, y, barWidth, barHeight);
    
    ctx.fillStyle = healthRatio > 0.5 ? '#00FF00' : healthRatio > 0.25 ? '#FFFF00' : '#FF0000';
    ctx.fillRect(x - barWidth * 0.5, y, barWidth * healthRatio, barHeight);
    
    // Mostrar número de vida
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${Math.max(10, enemyWidth * 0.1)}px Arial`; // Usar ancho uniforme
    ctx.textAlign = 'center';
    ctx.fillText(enemy.health.toString(), x, y - 3);
    ctx.restore();
  }

  renderPlaceholder(ctx, x, y, enemyWidth, enemyHeight, enemy) {
    const healthRatio = enemy.health / enemy.maxHealth;
    ctx.fillStyle = `hsl(${healthRatio * 120}, 70%, 50%)`;
    ctx.fillRect(x - enemyWidth * 0.5, y, enemyWidth, enemyHeight); // Usar dimensiones separadas
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${enemyWidth * 0.3}px Arial`; // Usar ancho para el font
    ctx.textAlign = 'center';
    ctx.fillText('N', x, y + enemyHeight * 0.6); // Usar altura para posición
  }  takeDamage(enemy, damage, isHeadshot = false) {
    console.log(`🎯 EnemySystem.takeDamage llamado - Enemigo vida actual: ${enemy.health}, Daño recibido: ${damage}, Es headshot: ${isHeadshot}`);
    
    // Calcular el daño final según si es headshot o no
    const finalDamage = isHeadshot ? CONFIG.bullet.headDamage : damage;
    
    // USAR EL MÉTODO takeDamage DE LA CLASE ENEMY
    enemy.takeDamage(finalDamage);
    
    // La clase Enemy ya maneja la muerte, solo necesitamos configurar deathTime
    if (!enemy.alive) {
      enemy.deathTime = Date.now();
      console.log(`💀 EnemySystem: Enemigo murió! ${isHeadshot ? 'HEADSHOT KILL!' : 'Body kill'}`);
      return true;
    }
    return false;
  }
}

window.EnemySystem = EnemySystem;
console.log('✅ EnemySystem cargado');
