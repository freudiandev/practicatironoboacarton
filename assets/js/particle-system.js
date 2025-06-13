// Como una caja mágica que hace fuegos artificiales y efectos especiales
class ParticleSystem {
  constructor() {
    this.particles = []; // Lista de todas las partículas volando
    this.sparks = []; // Chispas como cuando se quema algo
    this.bulletHoles = []; // Hoyos que dejan las balas en las paredes
    this.muzzleFlashes = []; // El flash de luz cuando disparamos
    console.log('✅ ParticleSystem inicializado correctamente');
  }

  // Crear chispas cuando disparamos - como fuegos artificiales de pólvora
  createMuzzleSparks(x, z, angle) {
    // CHISPAS GRANDES como cuando explota pólvora de verdad
    const mainSparkCount = 20 + Math.floor(Math.random() * 15); // Entre 20 y 35 chispas
    
    for (let i = 0; i < mainSparkCount; i++) {
      const spread = 0.9; // Qué tan dispersas salen (como un abanico)
      const sparkAngle = angle + (Math.random() - 0.5) * spread; // Dirección aleatoria
      const speed = 600 + Math.random() * 500; // Velocidad súper rápida
      
      this.sparks.push({
        x: x + Math.cos(angle) * 45, // Empezar desde la punta del arma
        z: z + Math.sin(angle) * 45,
        y: 28 + Math.random() * 15, // Altura donde sale el disparo
        vx: Math.cos(sparkAngle) * speed, // Velocidad hacia los lados
        vz: Math.sin(sparkAngle) * speed, // Velocidad hacia adelante/atrás
        vy: 120 + Math.random() * 180, // Velocidad hacia arriba (como saltar)
        life: 1.0, // Cuánta vida le queda (empieza al máximo)
        maxLife: 1.0, // Cuánta vida tenía al principio
        decay: 0.012 + Math.random() * 0.008, // Qué tan rápido se apaga
        size: 2.5 + Math.random() * 4, // Qué tan grande es
        color: this.getGunpowderSparkColor(), // Color de pólvora ardiendo
        glowSize: 15 + Math.random() * 10, // Qué tan brillante es
        trail: [], // Rastro que deja al moverse
        trailIntensity: 1.0, // Qué tan intenso es el rastro
        sparkType: 'gunpowder', // Tipo de chispa (pólvora)
        temperature: 1.0, // Qué tan caliente está
        fireIntensity: 0.9 + Math.random() * 0.1, // Intensidad del fuego
        burnRate: 0.015 + Math.random() * 0.01, // Velocidad de quemado
        isMainSpark: true // Si es una chispa principal
      });
    }
    
    // CHISPAS PEQUEÑAS como brasitas que saltan
    const secondarySparkCount = 12 + Math.floor(Math.random() * 8); // Entre 12 y 20
    
    for (let i = 0; i < secondarySparkCount; i++) {
      const spread = 1.3; // Se dispersan más
      const sparkAngle = angle + (Math.random() - 0.5) * spread;
      const speed = 350 + Math.random() * 300; // Más lentas que las principales
      
      this.sparks.push({
        x: x + Math.cos(angle) * 35,
        z: z + Math.sin(angle) * 35,
        y: 26 + Math.random() * 10,
        vx: Math.cos(sparkAngle) * speed,
        vz: Math.sin(sparkAngle) * speed,
        vy: 80 + Math.random() * 100,
        life: 0.8,
        maxLife: 0.8,
        decay: 0.020 + Math.random() * 0.012,
        size: 1.5 + Math.random() * 2,
        color: this.getGunpowderSparkColor(), // Colores de pólvora ardiendo
        glowSize: 8 + Math.random() * 6,
        trail: [],
        trailIntensity: 0.7,
        sparkType: 'gunpowder',
        temperature: 0.7 + Math.random() * 0.3,
        burnRate: 0.025 + Math.random() * 0.015
      });
    }
    
    // MICRO-PARTÍCULAS DE PÓLVORA (efecto de residuos ardiendo)
    const microSparkCount = 25 + Math.floor(Math.random() * 20);
    
    for (let i = 0; i < microSparkCount; i++) {
      const spread = 1.6; // Máxima dispersión
      const sparkAngle = angle + (Math.random() - 0.5) * spread;
      const speed = 180 + Math.random() * 250;
      
      this.sparks.push({
        x: x + Math.cos(angle) * 30,
        z: z + Math.sin(angle) * 30,
        y: 25 + Math.random() * 12,
        vx: Math.cos(sparkAngle) * speed,
        vz: Math.sin(sparkAngle) * speed,
        vy: 40 + Math.random() * 70,
        life: 0.6,
        maxLife: 0.6,
        decay: 0.035 + Math.random() * 0.025,
        size: 0.8 + Math.random() * 1.2,
        color: this.getGunpowderSparkColor(), // Colores de pólvora micro
        glowSize: 4 + Math.random() * 3,
        trail: [],
        trailIntensity: 0.4,
        sparkType: 'gunpowder-micro',
        temperature: 0.5 + Math.random() * 0.4,
        burnRate: 0.045 + Math.random() * 0.025
      });
    }
    
    // Crear flash de disparo más agresivo
    this.createMuzzleFlash(x, z, angle);
    
    // Crear ondas de calor
    this.createHeatWave(x, z, angle);
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
  
  // Crear orificio de bala con mejor manejo de superficies
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

  // Crear flash de disparo más agresivo y realista
  createMuzzleFlash(x, z, angle) {
    this.muzzleFlashes.push({
      x: x + Math.cos(angle) * 30,
      z: z + Math.sin(angle) * 30,
      angle: angle,
      life: 1.0,
      size: 25 + Math.random() * 15, // Flash más grande
      decay: 0.25 // Desaparece más rápido
    });
  }

  // Colores de chispas realistas de pólvora ardiendo
  getGunpowderSparkColor() {
    const colors = [
      '#FF4500', // Rojo naranja brillante
      '#FF6347', // Rojo tomate ardiente
      '#FFA500', // Naranja intenso
      '#FFD700', // Amarillo dorado caliente
      '#FF8C00', // Naranja oscuro
      '#DC143C', // Carmesí
      '#FF0000', // Rojo puro
      '#FFFF00', // Amarillo brillante
      '#FF1493', // Rosa caliente
      '#FF69B4'  // Rosa intenso
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Colores de chispas metálicas (mantenido para otros efectos)
  getGunSparkColor() {
    const colors = [
      '#FFFFFF', // Blanco metálico brillante
      '#C0C0C0', // Plata
      '#FFD700', // Oro metálico
      '#FFA500', // Naranja metálico
      '#FF6347', // Rojo metálico caliente
      '#B8860B', // Oro oscuro
      '#CD853F', // Bronce
      '#D2691E', // Chocolate/cobre
      '#FF8C00', // Naranja oscuro
      '#F4A460'  // Arena/cobre claro
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Colores de chispas dulces antiguos (mantenido para otros efectos)
  getSparkColor() {
    const colors = [
      '#FFFF00', // Amarillo brillante
      '#FFA500', // Naranja
      '#FF6347', // Rojo tomate
      '#FFD700', // Oro
      '#FF4500', // Rojo naranja
      '#FFFF99', // Amarillo claro
      '#FF8C00', // Naranja oscuro
      '#FFEAA7', // Amarillo pastel
      '#F39C12', // Oro oscuro
      '#E67E22', // Zanahoria
      '#FDCB6E', // Amarillo miel
      '#FF7675'  // Rojo coral
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Colores de chispas de fuego intenso
  getFireSparkColor() {
    const colors = [
      '#FF0000', // Rojo puro fuego
      '#FF4500', // Rojo naranja intenso
      '#FF6600', // Naranja fuego
      '#FFD700', // Amarillo dorado caliente
      '#FF8C00', // Naranja oscuro
      '#DC143C', // Carmesí ardiente
      '#B22222', // Ladrillo de fuego
      '#CD5C5C', // Rojo indio
      '#FF1493', // Rosa fuego
      '#FF69B4'  // Rosa intenso
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Colores de brasas ardientes
  getEmberColor() {
    const colors = [
      '#8B0000', // Rojo oscuro brasa
      '#A0522D', // Marrón siena
      '#CD853F', // Bronce
      '#D2691E', // Chocolate
      '#B8860B', // Oro oscuro
      '#CD5C5C', // Rojo indio
      '#A0522D', // Marrón siena
      '#8B4513', // Marrón silla
      '#654321', // Marrón oscuro
      '#DAA520'  // Vara de oro
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Colores de chispas muy calientes
  getHotSparkColor() {
    const colors = [
      '#FFFF00', // Amarillo brillante
      '#FFFF99', // Amarillo claro
      '#FFFACD', // Amarillo cremoso
      '#FFD700', // Oro
      '#FFA500', // Naranja
      '#FF8C00', // Naranja oscuro
      '#FFEAA7', // Amarillo pastel
      '#F39C12', // Oro oscuro
      '#E67E22', // Zanahoria
      '#FDCB6E'  // Amarillo miel
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Crear ondas de calor para efecto de disparo
  createHeatWave(x, z, angle) {
    // Crear una onda de calor sutil
    this.particles.push({
      x: x + Math.cos(angle) * 20,
      z: z + Math.sin(angle) * 20,
      y: 28,
      vx: Math.cos(angle) * 100,
      vz: Math.sin(angle) * 100,
      vy: 0,
      life: 0.5,
      decay: 0.02,
      size: 40,
      color: '#FFD700',
      type: 'heatwave',
      opacity: 0.1
    });
  }
  
  update(deltaTime) {
    // Actualizar chispas con física más realista para chispas de pólvora ardiendo
    this.sparks = this.sparks.filter(spark => {
      // Guardar posición anterior para rastro de fuego
      if (!spark.trail) spark.trail = [];
      spark.trail.push({ 
        x: spark.x, 
        z: spark.z, 
        y: spark.y, 
        life: spark.life,
        size: spark.size * 0.3 // Rastro más delgado como fuego
      });
      if (spark.trail.length > 8) spark.trail.shift(); // Rastro más largo para fuego
      
      // Física de chispas de pólvora ardiendo
      spark.x += spark.vx * deltaTime;
      spark.z += spark.vz * deltaTime;
      spark.y += spark.vy * deltaTime;
      
      // Gravedad (las chispas de pólvora caen mientras arden)
      spark.vy -= 400 * deltaTime;
      
      // Resistencia del aire para chispas ardiendo
      const airFriction = 0.98;
      spark.vx *= airFriction;
      spark.vz *= airFriction;
        // Enfriamiento y cambio de color según temperatura (PÓLVORA REALISTA)
      if (spark.temperature && spark.burnRate) {
        spark.temperature -= deltaTime * spark.burnRate; // Se enfría gradualmente según velocidad de combustión
        
        // Cambios de color progresivos según temperatura de pólvora ardiendo
        if (spark.temperature > 0.8) {
          // Temperatura muy alta: blanco amarillento brillante
          const hotColors = ['#FFFFFF', '#FFFACD', '#FFFF00', '#FFD700'];
          spark.color = hotColors[Math.floor(Math.random() * hotColors.length)];
        } else if (spark.temperature > 0.6) {
          // Temperatura alta: naranjas y amarillos intensos
          const mediumHotColors = ['#FFD700', '#FFA500', '#FF8C00', '#FF4500'];
          spark.color = mediumHotColors[Math.floor(Math.random() * mediumHotColors.length)];
        } else if (spark.temperature > 0.4) {
          // Temperatura media: rojos y naranjas
          const mediumColors = ['#FF4500', '#FF6347', '#DC143C', '#B22222'];
          spark.color = mediumColors[Math.floor(Math.random() * mediumColors.length)];
        } else if (spark.temperature > 0.2) {
          // Temperatura baja: rojos oscuros y marrones
          const coolColors = ['#8B0000', '#A0522D', '#CD853F', '#654321'];
          spark.color = coolColors[Math.floor(Math.random() * coolColors.length)];
        } else {
          // Temperatura muy baja: grises y marrones oscuros (cenizas)
          const ashColors = ['#696969', '#808080', '#A9A9A9', '#2F4F4F'];
          spark.color = ashColors[Math.floor(Math.random() * ashColors.length)];
        }
        
        // Ajustar tamaño según temperatura (se contrae al enfriarse)
        if (spark.isMainSpark) {
          spark.size = (2.5 + Math.random() * 4) * Math.max(0.3, spark.temperature);
        }
      }
      
      // Desvanecer la chispa
      spark.life -= spark.decay;
      
      // Efecto de rebote en el suelo para algunas chispas
      if (spark.y <= 0 && spark.vy < 0) {
        spark.y = 0;
        spark.vy = -spark.vy * 0.4; // Rebote amortiguado
        spark.vx *= 0.8;
        spark.vz *= 0.8;
        
        // Crear pequeñas chispas de rebote ocasionalmente
        if (Math.random() < 0.3 && spark.sparkType === 'gunpowder') {
          this.createTinySparkBounce(spark.x, spark.z);
        }
      }
      
      // Eliminar si la vida se agota o si cae demasiado
      return spark.life > 0 && spark.y > -10;
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
  // Crear pequeñas chispas de rebote más realistas
  createTinySparkBounce(x, z) {
    const bounceSparkCount = 3 + Math.floor(Math.random() * 2);
    
    for (let i = 0; i < bounceSparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 25 + Math.random() * 35;
      
      this.sparks.push({
        x: x + (Math.random() - 0.5) * 5, // Dispersión al rebotar
        z: z + (Math.random() - 0.5) * 5,
        y: 1 + Math.random() * 3,
        vx: Math.cos(angle) * speed,
        vz: Math.sin(angle) * speed,  
        vy: 20 + Math.random() * 30,
        life: 0.4 + Math.random() * 0.3,
        decay: 0.06 + Math.random() * 0.04,
        size: 0.8 + Math.random() * 1.2,
        color: this.getGunpowderSparkColor(),
        sparkType: 'bounce',
        temperature: 0.3 + Math.random() * 0.2,
        burnRate: 0.08 + Math.random() * 0.04,
        glowSize: 2 + Math.random() * 2
      });
    }
  }
  render(ctx, player) {
    // Renderizar chispas con efectos espectaculares de pólvora ardiendo
    this.sparks.forEach(spark => {
      const position = this.worldToScreen(spark.x, spark.z, spark.y, player, ctx.canvas);
      if (!position) return;

      ctx.save();
      
      // Renderizar rastro de fuego intenso primero (detrás de la chispa)
      if (spark.trail && spark.trail.length > 1) {
        // Rastro con gradiente de temperatura
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        for (let i = 1; i < spark.trail.length; i++) {
          const currentPoint = spark.trail[i];
          const prevPoint = spark.trail[i - 1];
          
          const currentPos = this.worldToScreen(currentPoint.x, currentPoint.z, currentPoint.y, player, ctx.canvas);
          const prevPos = this.worldToScreen(prevPoint.x, prevPoint.z, prevPoint.y, player, ctx.canvas);
          
          if (!currentPos || !prevPos) continue;
          
          // Color del rastro según la vida de la partícula en ese punto
          const trailAlpha = (currentPoint.life || 0.5) * spark.life * 0.6;
          const trailSize = Math.max(0.5, (currentPoint.size || spark.size) * 0.4);
          
          ctx.globalAlpha = trailAlpha;
          ctx.strokeStyle = spark.color;
          ctx.lineWidth = trailSize;
          
          ctx.beginPath();
          ctx.moveTo(prevPos.screenX, prevPos.screenY);
          ctx.lineTo(currentPos.screenX, currentPos.screenY);
          ctx.stroke();
        }
      }

      // Renderizar la chispa principal con múltiples capas de brillo
      ctx.globalAlpha = spark.life;
      
      // Capa 1: Halo exterior (resplandor)
      if (spark.glowSize && spark.glowSize > 0) {
        const outerGradient = ctx.createRadialGradient(
          position.screenX, position.screenY, 0,
          position.screenX, position.screenY, spark.glowSize
        );
        outerGradient.addColorStop(0, spark.color + '40'); // 25% opacidad
        outerGradient.addColorStop(0.5, spark.color + '20'); // 12% opacidad  
        outerGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = outerGradient;
        ctx.beginPath();
        ctx.arc(position.screenX, position.screenY, spark.glowSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Capa 2: Gradiente principal (cuerpo de la chispa)
      const mainGradient = ctx.createRadialGradient(
        position.screenX, position.screenY, 0,
        position.screenX, position.screenY, spark.size * 2.5
      );
      mainGradient.addColorStop(0, spark.color);
      mainGradient.addColorStop(0.3, spark.color + 'CC'); // 80% opacidad
      mainGradient.addColorStop(0.7, spark.color + '66'); // 40% opacidad
      mainGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = mainGradient;
      ctx.beginPath();
      ctx.arc(position.screenX, position.screenY, spark.size * 2.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Capa 3: Núcleo súper brillante (temperatura alta)
      if (spark.temperature && spark.temperature > 0.5) {
        const coreColor = spark.temperature > 0.8 ? '#FFFFFF' : spark.color;
        ctx.fillStyle = coreColor;
        ctx.beginPath();
        ctx.arc(position.screenX, position.screenY, spark.size * spark.temperature, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Capa 4: Chispa parpadeante (efecto de combustión)
      if (spark.sparkType === 'gunpowder' && Math.random() < 0.3) {
        ctx.globalAlpha = spark.life * (0.5 + Math.random() * 0.5);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(
          position.screenX + (Math.random() - 0.5) * 2, 
          position.screenY + (Math.random() - 0.5) * 2, 
          spark.size * 0.3, 0, Math.PI * 2
        );
        ctx.fill();
      }

      ctx.restore();
    });

    // Renderizar flashes de disparo con mejor efecto
    this.muzzleFlashes.forEach(flash => {
      const position = this.worldToScreen(flash.x, flash.z, 30, player, ctx.canvas);
      if (!position) return;

      ctx.save();
      ctx.globalAlpha = flash.life;
      
      // Flash principal
      const gradient = ctx.createRadialGradient(
        position.screenX, position.screenY, 0,
        position.screenX, position.screenY, flash.size
      );
      gradient.addColorStop(0, '#FFFFFF');
      gradient.addColorStop(0.3, '#FFFF00');
      gradient.addColorStop(0.6, '#FF6600');
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(position.screenX, position.screenY, flash.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Núcleo super brillante
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(position.screenX, position.screenY, flash.size * 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  renderBulletHoles(ctx, player) {
    // Renderizar orificios con altura real
    this.bulletHoles.forEach(hole => {
      const position = this.worldToScreen(hole.x, hole.z, hole.y, player, ctx.canvas);
      if (!position) return;

      ctx.save();
      ctx.globalAlpha = hole.opacity;
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(position.screenX, position.screenY, hole.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Borde más oscuro
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    });
  }

  // Proyectar coordenadas del mundo 3D a coordenadas de pantalla 2D
  worldToScreen(worldX, worldZ, worldY, player, canvas) {
    const dx = worldX - player.x;
    const dz = worldZ - player.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance > 800) return null; // Fuera de rango de renderizado
    
    const angle = Math.atan2(dz, dx) - player.angle;
    let normalizedAngle = angle;
    while (normalizedAngle > Math.PI) normalizedAngle -= 2 * Math.PI;
    while (normalizedAngle < -Math.PI) normalizedAngle += 2 * Math.PI;
    
    if (Math.abs(normalizedAngle) > Math.PI / 3) return null; // Fuera del campo de visión
    
    const screenX = canvas.width * 0.5 + (normalizedAngle / (Math.PI / 3)) * (canvas.width * 0.5);
    
    // Aplicar pitch para calcular Y
    const pitchOffset = (player.pitch || 0) * (canvas.height / 3);
    const baseY = canvas.height * 0.5 + pitchOffset;
    const heightDifference = worldY - 30; // 30 es la altura del jugador
    const perspectiveY = baseY - (heightDifference * (canvas.height * 0.4) / distance);
    
    return {
      screenX: screenX,
      screenY: perspectiveY,
      distance: distance
    };
  }
}

// Hacer la clase disponible globalmente
window.ParticleSystem = ParticleSystem;
console.log('✅ ParticleSystem cargado correctamente');
