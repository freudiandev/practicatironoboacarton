class BulletSystem {
  constructor() {
    this.bullets = [];
    this.bulletHoles = [];
    this.maxHoles = 50;
  }

  createBullet(x, z, y, angle, shooter = 'player') {
    return {
      id: Date.now() + Math.random(),
      x, z, y,
      angle,
      speed: CONFIG.bullet.speed,
      damage: shooter === 'player' ? CONFIG.bullet.bodyDamage : 10,
      lifetime: CONFIG.bullet.lifetime,
      startTime: Date.now(),
      shooter,
      traveled: 0
    };
  }

  addBullet(x, z, y, angle, shooter = 'player') {
    this.bullets.push(this.createBullet(x, z, y, angle, shooter));
  }

  update(currentTime) {
    const deltaTime = 0.016;
    
    this.bullets = this.bullets.filter(bullet => {
      const moveDistance = bullet.speed * deltaTime;
      bullet.x += Math.cos(bullet.angle) * moveDistance;
      bullet.z += Math.sin(bullet.angle) * moveDistance;
      bullet.traveled += moveDistance;
      
      if (currentTime - bullet.startTime > bullet.lifetime) {
        return false;
      }
      
      if (!Utils.canMoveTo(bullet.x, bullet.z)) {
        this.createBulletHole(bullet.x, bullet.z, bullet.angle);
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
  }

  renderBullet(ctx, bullet, player) {
    const dx = bullet.x - player.x;
    const dz = bullet.z - player.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance > CONFIG.world.maxRenderDistance) return;
    
    const angle = Utils.normalizeAngle(Math.atan2(dz, dx) - player.angle);
    
    if (Math.abs(angle) > CONFIG.world.fov / 2) return;
    
    const screenX = ctx.canvas.width * 0.5 + (angle / (CONFIG.world.fov / 2)) * (ctx.canvas.width * 0.5);
    const screenY = ctx.canvas.height * 0.5;
    
    ctx.save();
    ctx.shadowColor = '#FFFF00';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(screenX, screenY, CONFIG.bullet.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  checkCollisions(enemies) {
    const hits = [];
    
    this.bullets.forEach((bullet, bulletIndex) => {
      if (bullet.shooter !== 'player') return;
      
      enemies.forEach(enemy => {
        if (enemy.health <= 0) return;
        
        const distance = Utils.distance(bullet.x, bullet.z, enemy.x, enemy.z);
        if (distance < 30) {
          const isHeadshot = this.checkHeadshot(bullet, enemy);
          const damage = isHeadshot ? CONFIG.bullet.headDamage : CONFIG.bullet.bodyDamage;
          
          hits.push({
            bulletIndex,
            enemy,
            damage,
            isHeadshot,
            impact: { x: bullet.x, z: bullet.z, y: bullet.y }
          });
        }
      });
    });
    
    return hits;
  }

  checkHeadshot(bullet, enemy) {
    const relativeY = bullet.y - enemy.y;
    const spriteHeight = enemy.size;
    const headZone = spriteHeight * CONFIG.enemy.headHeight;
    
    return relativeY <= headZone && relativeY >= 0;
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
