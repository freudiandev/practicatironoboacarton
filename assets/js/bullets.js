// Como un administrador de todas las balas que vuelan por el aire
class BulletSystem {
  constructor() {
    this.bullets = []; // Lista de todas las balas volando
    this.bulletHoles = []; // Marcas que dejan las balas en las paredes
    this.maxHoles = 50; // Máximo de hoyos que guardamos (como borrar marcas viejas)
  }

  createBullet(x, z, y, angle, shooter = 'player', pitchAngle = 0) {
    // Como crear una bala nueva con todas sus características
    return {
      id: Date.now() + Math.random(), // Como el nombre único de la bala
      x, z, y, // Dónde está parada ahora
      angle, // Hacia dónde apunta (como una brújula)
      pitchAngle: pitchAngle || 0, // Si va hacia arriba o abajo
      speed: CONFIG.bullet.speed, // Qué tan rápido vuela
      damage: shooter === 'player' ? CONFIG.bullet.bodyDamage : 10, // Cuánto daño hace
      lifetime: CONFIG.bullet.lifetime, // Cuánto tiempo vive antes de desaparecer
      startTime: Date.now(), // Cuándo nació la bala
      shooter, // Quién la disparó
      traveled: 0, // Qué tan lejos ha viajado
      vx: Math.cos(angle) * CONFIG.bullet.speed, // Velocidad hacia los lados
      vz: Math.sin(angle) * CONFIG.bullet.speed, // Velocidad hacia adelante/atrás
      vy: Math.sin(pitchAngle || 0) * CONFIG.bullet.speed // Velocidad hacia arriba/abajo
    };
  }

  addBullet(x, z, y, angle, shooter = 'player', pitchAngle = 0) {
    // Como crear una nueva bala y añadirla a la lista
    const bullet = this.createBullet(x, z, y, angle, shooter, pitchAngle);
    this.bullets.push(bullet);
    console.log(`🔫 Bala creada: x=${x.toFixed(2)}, z=${z.toFixed(2)}, y=${y.toFixed(2)}, angle=${angle.toFixed(2)}, pitch=${(pitchAngle || 0).toFixed(2)}, shooter=${shooter}`);
    console.log(`📊 Total de balas activas: ${this.bullets.length}`);
  }

  update(currentTime) {
    const deltaTime = 0.016; // Como el tic del reloj (60 veces por segundo)
    
    // Hacer que todas las balas se muevan como palomitas volando
    this.bullets = this.bullets.filter(bullet => {
      // Mover la bala usando su velocidad en todas las direcciones
      if (bullet.vx !== undefined && bullet.vz !== undefined && bullet.vy !== undefined) {
        bullet.x += bullet.vx * deltaTime; // Mover hacia los lados
        bullet.z += bullet.vz * deltaTime; // Mover hacia adelante/atrás
        bullet.y += bullet.vy * deltaTime; // Mover hacia arriba/abajo
        bullet.traveled += CONFIG.bullet.speed * deltaTime; // Contar cuánto ha viajado
      } else {
        // Si es una bala vieja, moverla de la forma simple
        const moveDistance = bullet.speed * deltaTime;
        bullet.x += Math.cos(bullet.angle) * moveDistance;
        bullet.z += Math.sin(bullet.angle) * moveDistance;
        bullet.traveled += moveDistance;
      }
      
      // Si la bala es muy vieja, hacerla desaparecer como humo
      if (currentTime - bullet.startTime > bullet.lifetime) {
        return false;
      }

      // Si la bala choca con una pared, hacer un hoyo y chispas
      if (!Utils.canMoveTo(bullet.x, bullet.z)) {
        this.createBulletHole(bullet.x, bullet.z, bullet.angle);
        
        // Crear chispas de impacto en pared - usar instancia correcta
        if (window.game && window.game.particleSystem && window.game.particleSystem.createImpactSparks) {
          window.game.particleSystem.createImpactSparks(bullet.x, bullet.z, bullet.y);
          // También crear orificio usando el nuevo sistema de partículas
          window.game.particleSystem.createBulletHole(bullet.x, bullet.z, bullet.y, 'wall');
        }
        
        return false;
      }
      
      return true;
    });
  }

  createBulletHole(x, z, angle) {
    this.bulletHoles.push({
      x, z, angle,
      createdTime: Date.now(),
      alpha: 1.0
    });
    
    if (this.bulletHoles.length > this.maxHoles) {
      this.bulletHoles.shift();
    }
  }

  render(ctx, player) {
    this.bullets.forEach(bullet => {
      if (bullet.shooter === 'player') {
        this.renderBullet(ctx, bullet, player);
      }
    });
  }  renderBullet(ctx, bullet, player) {
    const dx = bullet.x - player.x;
    const dz = bullet.z - player.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance > CONFIG.world.maxRenderDistance) return;
    
    const angle = Utils.normalizeAngle(Math.atan2(dz, dx) - player.angle);
    
    if (Math.abs(angle) > CONFIG.world.fov / 2) return;
    
    const screenX = ctx.canvas.width * 0.5 + (angle / (CONFIG.world.fov / 2)) * (ctx.canvas.width * 0.5);
    
    // CORREGIDO: Altura de bala fija, basada en la altura Y de la bala en el mundo 3D
    // No aplicar pitch - las balas deben volar en línea recta en el espacio 3D
    const bulletWorldHeight = bullet.y || 30; // Altura de la bala en el mundo
    const screenBaseHeight = ctx.canvas.height * 0.5; // Línea base de pantalla
    const heightOffset = (bulletWorldHeight - 30) * (100 / distance); // Offset por altura
    const screenY = screenBaseHeight - heightOffset; // Posición final SIN pitch
    
    // Animación de bala más espectacular
    ctx.save();
    
    // Efecto de brillo y rastro
    const age = Date.now() - bullet.startTime;
    const maxAge = 200; // ms
    const alpha = Math.max(0, 1 - (age / maxAge));
    
    // Bala principal (amarilla brillante)
    ctx.shadowColor = '#FFFF00';
    ctx.shadowBlur = 12;
    ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
    ctx.beginPath();
    ctx.arc(screenX, screenY, CONFIG.bullet.size * 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Núcleo central (blanco)
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
    ctx.beginPath();
    ctx.arc(screenX, screenY, CONFIG.bullet.size * 0.8, 0, Math.PI * 2);
    ctx.fill();
    
    // Rastro de movimiento
    const prevX = screenX - Math.cos(bullet.angle) * 15;
    const prevY = screenY - Math.sin(bullet.angle) * 15;
    
    ctx.strokeStyle = `rgba(255, 200, 0, ${alpha * 0.6})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(screenX, screenY);
    ctx.stroke();
    
    ctx.restore();  }  checkCollisions(enemies) {
    const hits = [];
    
    console.log(`🔍 === INICIO VERIFICACIÓN COLISIONES ===`);
    console.log(`📊 Balas activas: ${this.bullets.length}`);
    console.log(`👾 Enemigos disponibles: ${enemies.length}`);
    
    this.bullets.forEach((bullet, bulletIndex) => {
      if (bullet.shooter !== 'player') return;
      
      console.log(`🔫 Bala ${bulletIndex}: x=${bullet.x.toFixed(2)}, z=${bullet.z.toFixed(2)}`);
      
      enemies.forEach((enemy, enemyIndex) => {
        if (enemy.health <= 0 || !enemy.alive) {
          console.log(`❌ Enemigo ${enemyIndex} muerto/inactivo (vida: ${enemy.health}, vivo: ${enemy.alive})`);
          return;
        }
        
        console.log(`👾 Enemigo ${enemyIndex}: x=${enemy.x.toFixed(2)}, z=${enemy.z.toFixed(2)}, vida=${enemy.health}`);
        
        const distance = Utils.distance(bullet.x, bullet.z, enemy.x, enemy.z);
        const hitThreshold = CONFIG.enemy.size / 2;
        
        console.log(`📏 Distancia: ${distance.toFixed(2)}, Umbral: ${hitThreshold}, ¿Impacto?: ${distance < hitThreshold}`);
        
        if (distance < hitThreshold) {
          const isHeadshot = this.checkHeadshot(bullet, enemy);
          const damage = isHeadshot ? CONFIG.bullet.headDamage : CONFIG.bullet.bodyDamage;
          
          hits.push({
            bulletIndex,
            enemy,
            damage,
            isHeadshot,
            impact: { x: bullet.x, z: bullet.z, y: bullet.y }
          });
          
          console.log(`💥 ¡¡¡IMPACTO CONFIRMADO!!! Daño: ${damage}, Headshot: ${isHeadshot}`);
        }
      });
    });
      console.log(`🎯 === RESULTADO: ${hits.length} impactos detectados ===`);
    return hits;
  }
  checkHeadshot(bullet, enemy) {
    console.log(`🎯 Verificando headshot para enemigo...`);
    
    // MÉTODO PRINCIPAL: Detección basada en posición de pantalla del sprite PNG
    if (enemy.screenHeight && enemy.headHeight && enemy.screenY !== undefined) {
      const player = window.player || window.game?.player;
      if (player && player.shootY !== undefined) {
        // Calcular áreas del sprite PNG
        const spriteTop = enemy.screenY; // Parte superior del sprite
        const spriteBottom = enemy.screenY + enemy.screenHeight; // Parte inferior del sprite
        const spriteHeight = enemy.screenHeight;
        
        // 85% desde la base hacia arriba = área del cuerpo (25 daño)
        const bodyAreaTop = spriteTop;
        const bodyAreaBottom = spriteBottom - (spriteHeight * 0.15); // Excluye el 15% superior
        
        // 15% superior del sprite = área de la cabeza (100 daño)
        const headAreaTop = bodyAreaTop;
        const headAreaBottom = bodyAreaTop + (spriteHeight * 0.15);
        
        const shootY = player.shootY;
        
        console.log(`📐 Sprite: top=${spriteTop.toFixed(1)}, bottom=${spriteBottom.toFixed(1)}, height=${spriteHeight.toFixed(1)}`);
        console.log(`🎯 Cabeza: ${headAreaTop.toFixed(1)} - ${headAreaBottom.toFixed(1)} (15% superior)`);
        console.log(`👤 Cuerpo: ${bodyAreaBottom.toFixed(1)} - ${spriteBottom.toFixed(1)} (85% inferior)`);
        console.log(`🔫 Disparo Y: ${shootY.toFixed(1)}`);
        
        // Verificar si el disparo impacta en la cabeza (15% superior)
        const isHeadshot = shootY >= headAreaTop && shootY <= headAreaBottom;
        
        console.log(`💀 ¿Es headshot? ${isHeadshot}`);
        return isHeadshot;
      }
    }
    
    // MÉTODO FALLBACK: Detección basada en altura 3D
    console.log(`⚠️ Usando detección 3D fallback`);
    const bulletHeight = bullet.y || CONFIG.player.cameraHeight;
    const enemyBaseHeight = enemy.y || 0;
    const enemyTotalHeight = CONFIG.enemy.size * CONFIG.enemy.heightMultiplier;
    const headThreshold = enemyBaseHeight + (enemyTotalHeight * (1 - CONFIG.enemy.headHeight));
    
    const isHeadshot3D = bulletHeight > headThreshold;
    console.log(`🎯 3D: bulletY=${bulletHeight.toFixed(1)}, threshold=${headThreshold.toFixed(1)}, headshot=${isHeadshot3D}`);
      return isHeadshot3D;
  }

  removeBullet(index) {
    if (index >= 0 && index < this.bullets.length) {
      this.bullets.splice(index, 1);
    }
  }

  clear() {
    this.bullets = [];
    this.bulletHoles = [];
  }
}

window.BulletSystem = BulletSystem;
