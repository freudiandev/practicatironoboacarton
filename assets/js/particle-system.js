// Sistema de partículas para efectos visuales

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.sparks = [];
    this.bulletHoles = [];
    this.muzzleFlashes = [];
  }
  
  // Crear chispas cuando se dispara
  createMuzzleSparks(x, z, angle) {
    const sparkCount = 8 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < sparkCount; i++) {
      const spread = 0.3;
      const sparkAngle = angle + (Math.random() - 0.5) * spread;
      const speed = 150 + Math.random() * 100;
      
      this.sparks.push({
        x: x + Math.cos(angle) * 40, // Delante del jugador
        z: z + Math.sin(angle) * 40,
        y: 20 + Math.random() * 10, // Altura inicial
        vx: Math.cos(sparkAngle) * speed,
        vz: Math.sin(sparkAngle) * speed,
        vy: 50 + Math.random() * 100, // Velocidad vertical inicial
        life: 1.0,
        decay: 0.02 + Math.random() * 0.01,
        size: 2 + Math.random() * 3,
        color: this.getSparkColor()
      });
    }
  }
  
  // Crear chispas de impacto en paredes/enemigos
  createImpactSparks(x, z, y, normal) {
    const sparkCount = 6 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < sparkCount; i++) {
      const randomAngle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 60;
      
      this.sparks.push({
        x: x,
        z: z,
        y: y || 25,
        vx: Math.cos(randomAngle) * speed * 0.5,
        vz: Math.sin(randomAngle) * speed * 0.5,
        vy: 30 + Math.random() * 50,
        life: 0.8,
        decay: 0.03 + Math.random() * 0.02,
        size: 1 + Math.random() * 2,
        color: '#FFA500' // Chispas naranjas para impactos
      });
    }
  }
  
  // CORREGIDO: Crear orificio de bala con mejor manejo de superficies
  createBulletHole(x, z, y = null, surface = 'wall') {
    this.bulletHoles.push({
      x: x,
      z: z,
      y: y !== null ? y : 30, // Usar altura real o default
      surface: surface,
      size: 3 + Math.random() * 2,
      age: 0,
      maxAge: 45000,
      opacity: 1.0
    });
    
    // Limitar número de orificios para performance
    if (this.bulletHoles.length > 80) {
      this.bulletHoles.shift();
    }
  }
  
  // Crear flash de disparo
  createMuzzleFlash(x, z, angle) {
    this.muzzleFlashes.push({
      x: x + Math.cos(angle) * 35,
      z: z + Math.sin(angle) * 35,
      angle: angle,
      life: 1.0,
      size: 20 + Math.random() * 10,
      decay: 0.15
    });
  }
  
  getSparkColor() {
    const colors = ['#FFFF00', '#FFA500', '#FF6347', '#FFD700', '#FF4500'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  update(deltaTime) {
    // Actualizar chispas
    this.sparks = this.sparks.filter(spark => {
      // Física de chispas
      spark.x += spark.vx * deltaTime;
      spark.z += spark.vz * deltaTime;
      spark.y += spark.vy * deltaTime;
      
      // Gravedad
      spark.vy -= 300 * deltaTime; // Gravedad fuerte
      
      // Fricción del aire
      spark.vx *= 0.98;
      spark.vz *= 0.98;
      
      // Reducir vida
      spark.life -= spark.decay;
      
      // Rebote en el suelo
      if (spark.y <= 0) {
        spark.y = 0;
        spark.vy *= -0.3; // Rebote amortiguado
        spark.vx *= 0.7;
        spark.vz *= 0.7;
      }
      
      return spark.life > 0;
    });
    
    // Actualizar flashes de disparo
    this.muzzleFlashes = this.muzzleFlashes.filter(flash => {
      flash.life -= flash.decay;
      return flash.life > 0;
    });
    
    // Actualizar orificios de bala (envejecimiento)
    this.bulletHoles = this.bulletHoles.filter(hole => {
      hole.age += deltaTime * 1000;
      if (hole.age > hole.maxAge * 0.8) {
        hole.opacity = 1.0 - ((hole.age - hole.maxAge * 0.8) / (hole.maxAge * 0.2));
      }
      return hole.age < hole.maxAge;
    });
  }
  
  render(ctx, player) {
    // Renderizar chispas
    this.sparks.forEach(spark => {
      const dx = spark.x - player.x;
      const dz = spark.z - player.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance < 500) {
        const spriteAngle = Math.atan2(dz, dx);
        const relativeAngle = spriteAngle - player.angle;
        
        let normalizedAngle = relativeAngle;
        while (normalizedAngle > Math.PI) normalizedAngle -= 2 * Math.PI;
        while (normalizedAngle < -Math.PI) normalizedAngle += 2 * Math.PI;
        
        if (Math.abs(normalizedAngle) < Math.PI / 3) {
          const screenX = ctx.canvas.width / 2 + (normalizedAngle / (Math.PI / 3)) * (ctx.canvas.width / 2);
          const heightOffset = (spark.y - 30) * (200 / distance);
          const screenY = ctx.canvas.height / 2 - heightOffset + (player.verticalLook || 0) * ctx.canvas.height * 0.6;
          const size = (spark.size * 100) / distance * spark.life;
          
          if (size > 0.5) {
            ctx.save();
            ctx.globalAlpha = spark.life;
            ctx.fillStyle = spark.color;
            ctx.shadowColor = spark.color;
            ctx.shadowBlur = size;
            ctx.fillRect(screenX - size/2, screenY - size/2, size, size);
            ctx.restore();
          }
        }
      }
    });
    
    // Renderizar flashes de disparo
    this.muzzleFlashes.forEach(flash => {
      const dx = flash.x - player.x;
      const dz = flash.z - player.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance < 200) {
        const spriteAngle = Math.atan2(dz, dx);
        const relativeAngle = spriteAngle - player.angle;
        
        let normalizedAngle = relativeAngle;
        while (normalizedAngle > Math.PI) normalizedAngle -= 2 * Math.PI;
        while (normalizedAngle < -Math.PI) normalizedAngle += 2 * Math.PI;
        
        if (Math.abs(normalizedAngle) < Math.PI / 4) {
          const screenX = ctx.canvas.width / 2 + (normalizedAngle / (Math.PI / 3)) * (ctx.canvas.width / 2);
          const screenY = ctx.canvas.height / 2 + (player.verticalLook || 0) * ctx.canvas.height * 0.6;
          const size = (flash.size * 100) / distance * flash.life;
          
          ctx.save();
          ctx.globalAlpha = flash.life * 0.8;
          ctx.fillStyle = '#FFFF88';
          ctx.shadowColor = '#FFFF88';
          ctx.shadowBlur = size * 2;
          ctx.fillRect(screenX - size/2, screenY - size/2, size, size/3);
          ctx.fillRect(screenX - size/3, screenY - size/2, size/3, size);
          ctx.restore();
        }
      }
    });
  }
  
  renderBulletHoles(ctx, player) {
    // Renderizar orificios con altura real
    this.bulletHoles.forEach(hole => {
      const dx = hole.x - player.x;
      const dz = hole.z - player.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance < 400 && distance > 1) {
        const spriteAngle = Math.atan2(dz, dx);
        const relativeAngle = spriteAngle - player.angle;
        
        let normalizedAngle = relativeAngle;
        while (normalizedAngle > Math.PI) normalizedAngle -= 2 * Math.PI;
        while (normalizedAngle < -Math.PI) normalizedAngle += 2 * Math.PI;
        
        if (Math.abs(normalizedAngle) < Math.PI / 3) {
          const screenX = ctx.canvas.width / 2 + (normalizedAngle / (Math.PI / 3)) * (ctx.canvas.width / 2);
          
          // CORREGIDO: Usar altura real del orificio para posición Y
          const heightDifference = (hole.y || 30) - 30;
          const projectedHeight = (heightDifference * ctx.canvas.height) / (distance * 2);
          let screenY = ctx.canvas.height / 2 - projectedHeight;
          
          // Aplicar offset de mirada vertical
          screenY += (player.verticalLook || 0) * ctx.canvas.height * 0.6;
          
          const radius = Math.max(1, (hole.size * 12) / distance);
          
          if (radius > 0.5 && screenY > -radius && screenY < ctx.canvas.height + radius) {
            ctx.save();
            ctx.globalAlpha = hole.opacity;
            
            // Crear orificio redondo con gradiente
            const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, radius);
            gradient.addColorStop(0, '#0a0a0a');
            gradient.addColorStop(0.7, '#2a2a2a');
            gradient.addColorStop(0.9, '#4a4a4a');
            gradient.addColorStop(1, '#6a6a6a');
            
            // Dibujar círculo del orificio
            ctx.beginPath();
            ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
            
            // Borde sutil
            ctx.beginPath();
            ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
            ctx.strokeStyle = '#8a8a8a';
            ctx.lineWidth = 0.5;
            ctx.stroke();
            
            ctx.restore();
          }
        }
      }
    });
  }
}

window.ParticleSystem = ParticleSystem;
console.log('✨ Sistema de partículas cargado');
