// Motor de renderizado DOOM simple - VERSIÓN LIMPIA

console.log('🎮 Iniciando carga de DOOM Engine...');

window.DoomEngine = {
  ctx: null,
  width: 800,
  height: 600,
  
  init() {
    console.log('🎮 DoomEngine.init() ejecutándose...');
    
    if (!window.CanvasSystem) {
      console.error('❌ CanvasSystem no disponible para DoomEngine');
      return false;
    }
    
    this.ctx = window.CanvasSystem.getContext();
    if (!this.ctx) {
      console.error('❌ No se pudo obtener contexto del canvas');
      return false;
    }
    
    this.width = window.CanvasSystem.width;
    this.height = window.CanvasSystem.height;
    
    console.log('✅ DOOM Engine inicializado');
    return true;
  },
  
  render() {
    if (!this.ctx) return;
    
    // Limpiar pantalla
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Renderizar cielo
    this.ctx.fillStyle = '#4a90e2';
    this.ctx.fillRect(0, 0, this.width, this.height / 2);
    
    // Renderizar suelo
    this.ctx.fillStyle = '#8b4513';
    this.ctx.fillRect(0, this.height / 2, this.width, this.height / 2);
    
    // Renderizar walls simples
    this.renderWalls();
    
    // Renderizar crosshair
    this.renderCrosshair();
    
    // Renderizar info debug
    this.renderDebugInfo();
  },
  
  renderWalls() {
    if (!window.player || !window.MAZE) return;
    
    const { x, z, angle } = window.player;
    
    // Raycasting simple
    for (let screenX = 0; screenX < this.width; screenX += 4) {
      const rayAngle = angle + (screenX - this.width/2) * 0.001;
      const hit = this.castRay(x, z, rayAngle);
      
      if (hit.distance > 0) {
        const wallHeight = (this.height * 100) / hit.distance;
        const wallTop = (this.height - wallHeight) / 2;
        
        // Color basado en distancia
        const brightness = Math.max(50, 255 - hit.distance);
        this.ctx.fillStyle = `rgb(${brightness}, ${brightness/2}, ${brightness/4})`;
        this.ctx.fillRect(screenX, wallTop, 4, wallHeight);
      }
    }
  },
  
  castRay(startX, startZ, angle) {
    const stepSize = 5;
    const maxDistance = 500;
    
    for (let distance = 0; distance < maxDistance; distance += stepSize) {
      const x = startX + Math.cos(angle) * distance;
      const z = startZ + Math.sin(angle) * distance;
      
      const mapX = Math.floor(x / window.GAME_CONFIG.cellSize);
      const mapZ = Math.floor(z / window.GAME_CONFIG.cellSize);
      
      if (mapX < 0 || mapX >= window.GAME_CONFIG.gridCols ||
          mapZ < 0 || mapZ >= window.GAME_CONFIG.gridRows ||
          window.MAZE[mapZ][mapX] === 1) {
        return { distance, hit: true };
      }
    }
    
    return { distance: maxDistance, hit: false };
  },
  
  renderCrosshair() {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - 10, centerY);
    this.ctx.lineTo(centerX + 10, centerY);
    this.ctx.moveTo(centerX, centerY - 10);
    this.ctx.lineTo(centerX, centerY + 10);
    this.ctx.stroke();
  },
  
  renderDebugInfo() {
    if (!window.player) return;
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Pos: ${window.player.x.toFixed(1)}, ${window.player.z.toFixed(1)}`, 10, 30);
    this.ctx.fillText(`Angle: ${(window.player.angle * 180 / Math.PI).toFixed(1)}°`, 10, 50);
  }
};

console.log('🎮 DOOM Engine definido en window.DoomEngine');
console.log('🎮 Verificación inmediata - DoomEngine disponible:', !!window.DoomEngine);
      case 0: r = 180; g = 100; b = 100; break; // Rojo
      case 1: r = 100; g = 180; b = 100; break; // Verde
      case 2: r = 100; g = 100; b = 180; break; // Azul
      default: r = 140; g = 140; b = 140; break;
    }
    
    // Sombra en lados perpendiculares
    if (side === 1) {
      r *= 0.8;
      g *= 0.8;
      b *= 0.8;
    }
    
    // Atenuación por distancia
    const brightness = Math.max(0.3, 1.0 - distance / GAME_CONFIG.renderDistance * 0.7);
    
    return {
      r: Math.floor(r * brightness),
      g: Math.floor(g * brightness),
      b: Math.floor(b * brightness)
    };
  },

  renderSprites() {
    if (!window.enemies || window.enemies.length === 0) return;
    
    // Ordenar enemigos por distancia
    const sortedEnemies = window.enemies.slice().sort((a, b) => {
      const distA = this.getDistance(a.x, a.z, window.player.x, window.player.z);
      const distB = this.getDistance(b.x, b.z, window.player.x, window.player.z);
      return distB - distA;
    });
    
    sortedEnemies.forEach(enemy => this.renderSprite(enemy));
  },

  renderSprite(enemy) {
    const { x: playerX, z: playerZ, angle } = window.player;
    
    const spriteX = enemy.x - playerX;
    const spriteZ = enemy.z - playerZ;
    const distance = Math.sqrt(spriteX * spriteX + spriteZ * spriteZ);
    
    if (distance > GAME_CONFIG.renderDistance) return;
    
    // Transformar a coordenadas de cámara
    const invDet = 1.0 / (Math.cos(angle) * GAME_CONFIG.fov - Math.sin(angle) * 1.0);
    const transformX = invDet * (GAME_CONFIG.fov * spriteX - 1.0 * spriteZ);
    const transformY = invDet * (-Math.sin(angle) * spriteX + Math.cos(angle) * spriteZ);
    
    if (transformY <= 0.1) return;
    
    const spriteScreenX = Math.floor((this.screenWidth / 2) * (1 + transformX / transformY));
    const spriteHeight = Math.abs(Math.floor(this.screenHeight / transformY));
    const spriteWidth = spriteHeight;
    
    const drawStartY = Math.max(0, (this.screenHeight - spriteHeight) / 2);
    const drawEndY = Math.min(this.screenHeight, (this.screenHeight + spriteHeight) / 2);
    const drawStartX = Math.max(0, spriteScreenX - spriteWidth / 2);
    const drawEndX = Math.min(this.screenWidth, spriteScreenX + spriteWidth / 2);
    
    // Verificar Z-buffer y dibujar sprite
    for (let stripe = drawStartX; stripe < drawEndX; stripe++) {
      if (transformY < this.zBuffer[stripe]) {
        const color = enemy.getColor ? enemy.getColor() : [255, 100, 100];
        stroke(color[0], color[1], color[2]);
        line(stripe, drawStartY, stripe, drawEndY);
      }
    }
  },

  renderUI() {
    // Crosshair
    stroke(255, 0, 0);
    strokeWeight(2);
    const centerX = width / 2;
    const centerY = height / 2;
    line(centerX - 10, centerY, centerX + 10, centerY);
    line(centerX, centerY - 10, centerX, centerY + 10);
    
    // Stats
    fill(255);
    noStroke();
    textSize(16);
    textAlign(LEFT);
    
    if (window.player) {
      text(`HP: ${Math.floor(window.player.health)}`, 10, 25);
    }
    
    if (window.Weapons) {
      // Información del arma mejorada
      const weaponInfo = window.Weapons.getWeaponInfo();
      text(`${weaponInfo.name}: ${weaponInfo.ammo}/${weaponInfo.maxAmmo}`, 10, 45);
      
      if (weaponInfo.reloading) {
        const progress = Math.floor(weaponInfo.reloadProgress * 100);
        text(`Recargando: ${progress}%`, 10, 65);
      }
    }
    
    text(`Enemies: ${window.enemies ? window.enemies.length : 0}`, 10, 85);
    
    // Instrucciones
    textSize(12);
    text('1/2/3: Cambiar arma | R: Recargar', 10, height - 20);
  },

  getDistance(x1, z1, x2, z2) {
    return Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
  }
};

console.log('🎮 DOOM Engine cargado');
