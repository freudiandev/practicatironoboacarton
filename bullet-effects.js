/**
 * SISTEMA DE BALAS Y EFECTOS VISUALES
 * Maneja renderizado de balas, chispas, humo y orificios en paredes
 */

class BulletEffectsSystem {
  constructor() {
    this.bullets = [];
    this.wallHoles = [];
    this.particles = [];
    this.muzzleFlashes = [];
    
    // Configuración de efectos
    this.config = {
      bulletSpeed: 15,
      bulletSize: 3,
      bulletColor: '#FFD700', // Dorado brillante
      bulletTrail: '#FFA500', // Naranja para estela
      sparkCount: 8,
      smokeParticles: 12,
      muzzleFlashDuration: 100,
      wallHoleSize: 8
    };
  }

  // Crear una nueva bala desde el jugador
  createBullet(startX, startZ, angle, verticalLook = 0) {
    const bullet = {
      id: Date.now() + Math.random(),
      x: startX,
      z: startZ,
      y: 64 + (verticalLook * 100), // Altura ajustada por mirada vertical
      angle: angle,
      speed: this.config.bulletSpeed,
      distance: 0,
      maxDistance: 1000,
      active: true,
      trail: [], // Estela de la bala
      size: this.config.bulletSize,
      startTime: Date.now()
    };
    
    this.bullets.push(bullet);
    
    // Crear efectos sutiles de disparo
    this.createShotEffects(startX, startZ);
    
    console.log(`🔫 Bala creada en (${startX.toFixed(1)}, ${startZ.toFixed(1)}) ángulo: ${(angle * 180 / Math.PI).toFixed(1)}°`);
    return bullet;
  }

  // Actualizar todas las balas
  updateBullets(game) {
    this.bullets = this.bullets.filter(bullet => {
      if (!bullet.active) return false;
      
      // Guardar posición anterior para la estela
      bullet.trail.push({ x: bullet.x, z: bullet.z });
      if (bullet.trail.length > 5) {
        bullet.trail.shift(); // Mantener solo las últimas 5 posiciones
      }
      
      // Mover bala
      const deltaX = Math.cos(bullet.angle) * bullet.speed;
      const deltaZ = Math.sin(bullet.angle) * bullet.speed;
      
      bullet.x += deltaX;
      bullet.z += deltaZ;
      bullet.distance += bullet.speed;
      
      // Verificar colisión con pared
      if (this.checkWallCollision(bullet, game)) {
        this.createWallHole(bullet);
        this.createWallImpactEffects(bullet);
        bullet.active = false;
        return false;
      }
      
      // Verificar colisión con enemigos
      if (this.checkEnemyCollision(bullet, game)) {
        bullet.active = false;
        return false;
      }
      
      // Verificar rango máximo
      if (bullet.distance >= bullet.maxDistance) {
        bullet.active = false;
        return false;
      }
      
      return true;
    });
  }

  // Verificar colisión con paredes
  checkWallCollision(bullet, game) {
    const cellSize = game.GAME_CONFIG?.cellSize || 128;
    const gridX = Math.floor(bullet.x / cellSize);
    const gridZ = Math.floor(bullet.z / cellSize);
    
    if (game.MAZE && game.MAZE[gridZ] && game.MAZE[gridZ][gridX] === 1) {
      return true;
    }
    return false;
  }

  // Verificar colisión con enemigos
  checkEnemyCollision(bullet, game) {
    if (!game.enemies) return false;
    
    for (let enemy of game.enemies) {
      if (enemy.health <= 0 || enemy.hidden) continue;
      
      const dx = bullet.x - enemy.x;
      const dz = bullet.z - enemy.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance < 25) { // Radio de colisión del enemigo
        const isHeadshot = this.checkHeadshot(bullet, enemy);
        this.handleEnemyHit(enemy, isHeadshot, game);
        this.createBloodEffect(enemy.x, enemy.z);
        return true;
      }
    }
    return false;
  }

  // Verificar si es un headshot (parte superior del sprite)
  checkHeadshot(bullet, enemy) {
    // El headshot es si la bala está en la parte superior del enemigo
    const bulletY = bullet.y;
    const enemyHeadY = 64 + 40; // Altura de la cabeza del enemigo
    return bulletY >= enemyHeadY;
  }

  // Manejar impacto en enemigo
  handleEnemyHit(enemy, isHeadshot, game) {
    if (isHeadshot) {
      enemy.health -= 100; // Headshot mata instantáneamente
      this.createHeadshotEffect();
      
      // Notificar al juego sobre el headshot
      if (game.headshots !== undefined) {
        game.headshots++;
        if (game.updateHeadshotCounter) game.updateHeadshotCounter();
      }
      
      // Reproducir sonido de headshot si está disponible
      if (game.weaponAudio && game.weaponAudio.playHeadshotSound) {
        game.weaponAudio.playHeadshotSound();
      }
      
      console.log('💀 HEADSHOT! Enemigo eliminado');
    } else {
      enemy.health -= 25; // Daño normal
      console.log(`🎯 Impacto! Vida del enemigo: ${enemy.health}`);
    }
    
    if (enemy.health <= 0 && game.enemyDeath) {
      game.enemyDeath(enemy, game.enemies.indexOf(enemy));
    }
  }

  // Crear efectos sutiles de disparo (humo y chispas)
  createShotEffects(x, z) {
    // Crear humo sutil
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        type: 'smoke',
        x: x + (Math.random() - 0.5) * 20,
        z: z + (Math.random() - 0.5) * 20,
        y: 60 + Math.random() * 20,
        vx: (Math.random() - 0.5) * 2,
        vz: (Math.random() - 0.5) * 2,
        vy: Math.random() * 3 + 1,
        size: Math.random() * 8 + 4,
        life: 1.0,
        decay: 0.02,
        color: `rgba(100, 100, 100, 0.3)`
      });
    }
    
    // Crear chispas sutiles
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        type: 'spark',
        x: x + (Math.random() - 0.5) * 15,
        z: z + (Math.random() - 0.5) * 15,
        y: 55 + Math.random() * 15,
        vx: (Math.random() - 0.5) * 4,
        vz: (Math.random() - 0.5) * 4,
        vy: Math.random() * 2 + 0.5,
        size: Math.random() * 3 + 1,
        life: 1.0,
        decay: 0.05,
        color: '#FFD700'
      });
    }
  }

  // Crear explosión de sangre cuando se golpea un enemigo
  createBloodBurst(x, z, y = 64) {
    // Crear múltiples partículas de sangre
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        type: 'blood-burst',
        x: x + (Math.random() - 0.5) * 30,
        z: z + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 6,
        vz: (Math.random() - 0.5) * 6,
        vy: Math.random() * 4 + 1,
        size: Math.random() * 6 + 2,
        life: 1.0,
        decay: 0.03,
        color: '#8B0000' // Rojo sangre oscuro
      });
    }
    console.log(`🩸 Efectos de sangre creados en (${x.toFixed(1)}, ${z.toFixed(1)})`);
  }

  // Crear orificio en la pared
  createWallHole(bullet) {
    const hole = {
      x: bullet.x,
      z: bullet.z,
      size: this.config.wallHoleSize,
      created: Date.now()
    };
    
    this.wallHoles.push(hole);
    console.log(`🕳️ Orificio creado en pared (${bullet.x.toFixed(1)}, ${bullet.z.toFixed(1)})`);
  }

  // Crear efectos de impacto en pared
  createWallImpactEffects(bullet) {
    // Chispas
    for (let i = 0; i < this.config.sparkCount; i++) {
      this.particles.push({
        type: 'spark',
        x: bullet.x,
        z: bullet.z,
        y: bullet.y,
        vx: (Math.random() - 0.5) * 8,
        vz: (Math.random() - 0.5) * 8,
        vy: Math.random() * 4,
        life: 1.0,
        decay: 0.02,
        color: `hsl(${30 + Math.random() * 20}, 100%, ${60 + Math.random() * 40}%)`
      });
    }
    
    // Humo
    for (let i = 0; i < this.config.smokeParticles; i++) {
      this.particles.push({
        type: 'smoke',
        x: bullet.x + (Math.random() - 0.5) * 10,
        z: bullet.z + (Math.random() - 0.5) * 10,
        y: bullet.y,
        vx: (Math.random() - 0.5) * 2,
        vz: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2,
        life: 1.0,
        decay: 0.008,
        size: 2 + Math.random() * 4,
        color: `rgba(128, 128, 128, ${0.3 + Math.random() * 0.4})`
      });
    }
  }

  // Crear destello del cañón
  createMuzzleFlash(x, z) {
    this.muzzleFlashes.push({
      x: x,
      z: z,
      life: 1.0,
      decay: 0.05,
      size: 20 + Math.random() * 15,
      created: Date.now()
    });
  }

  // Crear efecto de sangre
  createBloodEffect(x, z) {
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        type: 'blood',
        x: x + (Math.random() - 0.5) * 20,
        z: z + (Math.random() - 0.5) * 20,
        y: 50 + Math.random() * 30,
        vx: (Math.random() - 0.5) * 6,
        vz: (Math.random() - 0.5) * 6,
        vy: Math.random() * 3,
        life: 1.0,
        decay: 0.01,
        size: 1 + Math.random() * 3,
        color: `hsl(0, ${80 + Math.random() * 20}%, ${20 + Math.random() * 30}%)`
      });
    }
  }

  // Crear efecto de headshot
  createHeadshotEffect() {
    // Crear texto "HEADSHOT" flotante
    const headshotText = {
      type: 'headshot-text',
      text: 'HEADSHOT!',
      x: window.innerWidth / 2,
      y: window.innerHeight / 2 - 100,
      life: 1.0,
      decay: 0.005,
      size: 48,
      color: '#ff0000',
      shadow: true,
      created: Date.now()
    };
    
    this.particles.push(headshotText);
    
    // Efectos adicionales de sangre dramática
    for (let i = 0; i < 25; i++) {
      this.particles.push({
        type: 'blood-burst',
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
        y: window.innerHeight / 2 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 8,
        life: 1.0,
        decay: 0.015,
        size: 2 + Math.random() * 6,
        color: `hsl(0, 100%, ${20 + Math.random() * 30}%)`
      });
    }
  }

  // Actualizar partículas
  updateParticles() {
    this.particles = this.particles.filter(particle => {
      particle.life -= particle.decay;
      
      if (particle.type === 'spark' || particle.type === 'smoke' || particle.type === 'blood') {
        particle.x += particle.vx;
        particle.z += particle.vz;
        particle.y += particle.vy;
        particle.vy -= 0.1; // Gravedad
      }
      
      if (particle.type === 'blood-burst') {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.2; // Gravedad inversa para efecto dramático
      }
      
      return particle.life > 0;
    });
    
    // Actualizar destellos del cañón
    this.muzzleFlashes = this.muzzleFlashes.filter(flash => {
      flash.life -= flash.decay;
      return flash.life > 0;
    });
  }

  // Renderizar todo el sistema en 2D (para HUD y efectos de pantalla)
  render2D(ctx) {
    // Renderizar partículas 2D (como el texto de headshot)
    this.particles.forEach(particle => {
      if (particle.type === 'headshot-text') {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.font = `bold ${particle.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.strokeText(particle.text, particle.x, particle.y);
        ctx.fillText(particle.text, particle.x, particle.y);
        ctx.restore();
      }
      
      if (particle.type === 'blood-burst') {
        ctx.save();
        ctx.globalAlpha = particle.life * 0.8;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      
      if (particle.type === 'smoke') {
        ctx.save();
        ctx.globalAlpha = particle.life * 0.4;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      
      if (particle.type === 'spark') {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 3;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
  }

  // Método principal para actualizar todo
  update(game) {
    this.updateBullets(game);
    this.updateParticles();
  }

  // Método principal de renderizado para el juego 3D
  render(ctx, canvasWidth, canvasHeight) {
    // Renderizar efectos 2D sobre el juego 3D
    this.render2D(ctx);
    
    // Renderizar efectos adicionales si es necesario
    // (partículas de muzzle flash, etc.)
    this.renderMuzzleFlash(ctx, canvasWidth, canvasHeight);
  }

  // Renderizar destello del cañón
  renderMuzzleFlash(ctx, canvasWidth, canvasHeight) {
    // TEMPORALMENTE DESHABILITADO para evitar el "orificio extraño"
    // El muzzle flash se estaba dibujando en una posición fija molesta
    
    /*
    this.muzzleFlashes.forEach(flash => {
      ctx.save();
      ctx.globalAlpha = flash.life;
      ctx.fillStyle = flash.color;
      
      // Posición en el centro-inferior de la pantalla (donde estaría el arma)
      const x = canvasWidth * 0.85;
      const y = canvasHeight * 0.85;
      
      ctx.beginPath();
      ctx.arc(x, y, flash.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    */
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.BulletEffectsSystem = BulletEffectsSystem;
}
