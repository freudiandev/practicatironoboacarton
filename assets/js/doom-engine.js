// Motor de renderizado DOOM simple - VERSIÓN LIMPIA

console.log('🎮 Iniciando carga de DOOM Engine...');

window.DoomEngine = {
  ctx: null,
  width: 1067,
  height: 800,
  
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
    
    // Calcular offset de altura de cámara Y pitch (vista arriba/abajo)
    const playerHeight = window.player?.y || 32;
    const playerPitch = window.player?.pitch || 0; // Ángulo de vista vertical
    
    // El pitch afecta dónde se ve el horizonte
    const cameraOffset = (playerHeight - 32) * 2;
    const pitchOffset = playerPitch * (this.height * 0.3); // El pitch mueve el horizonte
    const horizonLine = this.height / 2 - cameraOffset - pitchOffset;
    
    // Renderizar cielo (ajustado por altura de cámara Y pitch)
    this.ctx.fillStyle = '#4a90e2';
    this.ctx.fillRect(0, 0, this.width, Math.max(0, horizonLine));
    
    // Renderizar suelo (ajustado por altura de cámara Y pitch)
    this.ctx.fillStyle = '#8b4513';
    this.ctx.fillRect(0, Math.max(0, horizonLine), this.width, this.height - Math.max(0, horizonLine));
      // Renderizar walls simples
    this.renderWalls();
    
    // Renderizar sprites/enemigos
    this.renderSprites();
    
    // Renderizar crosshair
    this.renderCrosshair();
    
    // Renderizar mensaje de escape si es necesario
    this.renderEscapeMessage();
    
    // Renderizar info debug
    this.renderDebugInfo();
  },
  renderWalls() {
    if (!window.player || !window.MAZE) return;
    
    const { x, z, angle, y, pitch } = window.player;
    const playerHeight = y || 32; // Altura de la cámara del jugador
    const playerPitch = pitch || 0; // Ángulo de vista vertical
    
    // Raycasting simple con altura de cámara y pitch
    for (let screenX = 0; screenX < this.width; screenX += 4) {
      const rayAngle = angle + (screenX - this.width/2) * 0.001;
      const hit = this.castRay(x, z, rayAngle);
      
      if (hit.distance > 0) {
        const wallHeight = (this.height * 100) / hit.distance;
        
        // Ajustar posición vertical basada en la altura de la cámara Y el pitch
        const wallMidpoint = this.height / 2;
        const cameraOffset = (playerHeight - 32) * 2; // Factor de escala para el offset
        const pitchOffset = playerPitch * (this.height * 0.3); // El pitch mueve las paredes
        const wallTop = wallMidpoint - wallHeight / 2 - cameraOffset - pitchOffset;
        
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
  this.ctx.fillText(`Altura: ${window.player.y.toFixed(1)}`, 10, 50);
  this.ctx.fillText(`Ángulo: ${(window.player.angle * 180 / Math.PI).toFixed(1)}°`, 10, 70);
},

getWallColor(distance, side) {
  let r = 200, g = 150, b = 100;
  
  // Sombra en lados perpendiculares
  if (side === 1) {
    r *= 0.8;
    g *= 0.8;
    b *= 0.8;
  }
  
  // Atenuación por distancia
  const brightness = Math.max(0.3, 1.0 - distance / window.GAME_CONFIG.renderDistance * 0.7);
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
    const { x: playerX, z: playerZ, angle, pitch } = window.player;
    const playerPitch = pitch || 0; // Ángulo de vista vertical
    
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
    
    // Aplicar pitch al renderizado del sprite
    const pitchOffset = playerPitch * (this.height * 0.3); // El pitch mueve los sprites
    const drawStartY = Math.max(0, (this.screenHeight - spriteHeight) / 2 - pitchOffset);
    const drawEndY = Math.min(this.screenHeight, (this.screenHeight + spriteHeight) / 2 - pitchOffset);
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
    // Crosshair - SIEMPRE en la posición del mouse
    stroke(255, 0, 0);
    strokeWeight(3);
    
    // Obtener posición del mouse desde el sistema de input
    let crosshairX = width / 2;
    let crosshairY = height / 2;
    
    if (window.inputSystem && window.inputSystem.getCrosshairPosition()) {
      const crosshairPos = window.inputSystem.getCrosshairPosition();
      crosshairX = crosshairPos.x;
      crosshairY = crosshairPos.y;
    }
    
    // Cruz roja siempre en la posición exacta del mouse
    line(crosshairX - 12, crosshairY, crosshairX + 12, crosshairY);
    line(crosshairX, crosshairY - 12, crosshairX, crosshairY + 12);
    
    // Punto central para mayor precisión
    strokeWeight(5);
    point(crosshairX, crosshairY);
    
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
    text('1/2/3: Cambiar arma | R: Recargar', 10, height - 20);  },

  renderEscapeMessage() {
    // Mostrar mensaje de escape cuando el mouse está bloqueado
    if (window.inputSystem && window.inputSystem.shouldShowEscapeMessage()) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(10, 10, 350, 60);
      
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '14px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText('🔒 Mouse bloqueado - Presiona ESC para liberar', 20, 35);
      this.ctx.fillText('💡 Haz clic en el juego para volver a bloquear', 20, 55);
    }
  },

  getDistance(x1, z1, x2, z2) {
    return Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
  }
};

console.log('🎮 DOOM Engine definido en window.DoomEngine');
console.log('🎮 Verificación inmediata - DoomEngine disponible:', !!window.DoomEngine);
console.log('🎮 DOOM Engine cargado');
