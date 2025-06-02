window.DoomRenderer = {
  // Configuración del raycasting
  rayCount: 320,        // Resolución horizontal
  rayAngleStep: 0,
  fov: Math.PI / 3,     // 60 grados campo de visión
  maxRayDistance: 800,
  wallHeight: 200,
  
  // Colores
  wallColors: {
    north: '#8B4513',   // Marrón
    south: '#A0522D',   // Marrón claro
    east: '#654321',    // Marrón oscuro  
    west: '#D2691E'     // Chocolate
  },
  
  floorColor: '#228B22',  // Verde
  ceilingColor: '#87CEEB', // Azul cielo
  
  init() {
    console.log('🎨 DoomRenderer inicializado');
    this.rayAngleStep = this.fov / this.rayCount;
  },
  
  render() {
    if (!window.CanvasSystem || !window.player) return;
    
    const canvas = window.CanvasSystem;
    
    // Limpiar pantalla
    canvas.background(50, 50, 70);
    
    // Renderizar vista 3D (raycasting)
    this.renderRaycast(canvas);
    
    // Renderizar crosshair
    this.renderCrosshair(canvas);
    
    // Renderizar HUD
    this.renderHUD(canvas);
  },
  
  renderRaycast(canvas) {
    const player = window.player;
    const startAngle = player.angle - this.fov / 2;
    
    for (let i = 0; i < this.rayCount; i++) {
      const rayAngle = startAngle + (i * this.rayAngleStep);
      const hit = this.castRay(player.x, player.z, rayAngle);
      
      if (hit) {
        this.renderWallSlice(canvas, i, hit, rayAngle - player.angle);
      }
    }
  },
  
  castRay(startX, startZ, angle) {
    const dx = Math.cos(angle);
    const dz = Math.sin(angle);
    const stepSize = 2;
    
    for (let distance = 0; distance < this.maxRayDistance; distance += stepSize) {
      const x = startX + dx * distance;
      const z = startZ + dz * distance;
      
      if (window.Utils && window.Utils.collides(x, z, 1)) {
        // Determinar qué lado de la pared
        const gridX = Math.floor(x / window.Utils.mapConfig.cellSize);
        const gridZ = Math.floor(z / window.Utils.mapConfig.cellSize);
        
        const cellCenterX = (gridX + 0.5) * window.Utils.mapConfig.cellSize;
        const cellCenterZ = (gridZ + 0.5) * window.Utils.mapConfig.cellSize;
        
        let wallSide = 'north';
        if (x < cellCenterX) wallSide = 'west';
        else if (x > cellCenterX) wallSide = 'east';
        else if (z < cellCenterZ) wallSide = 'north';
        else wallSide = 'south';
        
        return {
          distance: distance,
          x: x,
          z: z,
          wallSide: wallSide
        };
      }
    }
    
    return null;
  },
  
  renderWallSlice(canvas, rayIndex, hit, relativeAngle) {
    // Corregir distancia para evitar efecto ojo de pez
    const correctedDistance = hit.distance * Math.cos(relativeAngle);
    
    // Calcular altura de la pared en pantalla
    const wallScreenHeight = (this.wallHeight * canvas.height) / (correctedDistance + 1);
    
    // Posición vertical
    const wallTop = (canvas.height / 2) - (wallScreenHeight / 2) + (window.player.pitch || 0);
    const wallBottom = wallTop + wallScreenHeight;
    
    const x = (rayIndex / this.rayCount) * canvas.width;
    const sliceWidth = canvas.width / this.rayCount;
    
    // Renderizar techo
    canvas.fill(135, 206, 235); // Azul cielo
    canvas.rect(x, 0, sliceWidth, Math.max(0, wallTop));
    
    // Renderizar pared
    const wallColor = this.getWallColor(hit.wallSide);
    canvas.fill(wallColor.r, wallColor.g, wallColor.b);
    canvas.rect(x, Math.max(0, wallTop), sliceWidth, Math.max(0, wallBottom - wallTop));
    
    // Renderizar suelo
    canvas.fill(34, 139, 34); // Verde
    canvas.rect(x, Math.min(canvas.height, wallBottom), sliceWidth, canvas.height - wallBottom);
  },
  
  getWallColor(wallSide) {
    const colors = {
      north: { r: 139, g: 69, b: 19 },   // Marrón
      south: { r: 160, g: 82, b: 45 },   // Marrón claro
      east: { r: 101, g: 67, b: 33 },    // Marrón oscuro
      west: { r: 210, g: 105, b: 30 }    // Chocolate
    };
    
    return colors[wallSide] || colors.north;
  },
  
  renderCrosshair(canvas) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const size = 15;
    
    // Cruz roja para apuntar
    canvas.stroke(255, 0, 0);
    canvas.strokeWeight(3);
    
    // Línea horizontal
    canvas.line(centerX - size, centerY, centerX + size, centerY);
    
    // Línea vertical
    canvas.line(centerX, centerY - size, centerX, centerY + size);
    
    // Punto central
    canvas.fill(255, 0, 0);
    canvas.ellipse(centerX, centerY, 4, 4);
    
    canvas.noStroke();
  },
  
  renderHUD(canvas) {
    // Información del jugador
    canvas.fill(255, 255, 255);
    canvas.textAlign('left', 'top');
    canvas.textSize(14);
    
    if (window.player) {
      canvas.text(`Vida: ${window.player.health}`, 10, 10);
      canvas.text(`Munición: ${window.Weapons ? window.Weapons.ammo : 0}`, 10, 30);
    }
    
    // Enemigos restantes
    const enemyCount = window.enemies ? window.enemies.length : 0;
    canvas.text(`Enemigos: ${enemyCount}`, 10, 50);
    
    // Minimapa
    this.renderMinimap(canvas);
  },
  
  renderMinimap(canvas) {
    const mapSize = 150;
    const mapX = canvas.width - mapSize - 10;
    const mapY = 10;
    
    // Fondo del minimapa
    canvas.fill(0, 0, 0, 150);
    canvas.rect(mapX, mapY, mapSize, mapSize);
    
    // Renderizar mapa
    if (window.Utils && window.Utils.collisionMap) {
      const cellSize = mapSize / Math.max(window.Utils.mapConfig.gridCols, window.Utils.mapConfig.gridRows);
      
      for (let row = 0; row < window.Utils.mapConfig.gridRows; row++) {
        for (let col = 0; col < window.Utils.mapConfig.gridCols; col++) {
          if (window.Utils.collisionMap[row] && window.Utils.collisionMap[row][col] === 1) {
            canvas.fill(150, 150, 150);
            canvas.rect(mapX + col * cellSize, mapY + row * cellSize, cellSize, cellSize);
          }
        }
      }
    }
    
    // Renderizar jugador en minimapa
    if (window.player) {
      const playerMapX = mapX + (window.player.x / window.Utils.mapConfig.cellSize) * (mapSize / window.Utils.mapConfig.gridCols);
      const playerMapY = mapY + (window.player.z / window.Utils.mapConfig.cellSize) * (mapSize / window.Utils.mapConfig.gridRows);
      
      canvas.fill(0, 255, 0);
      canvas.ellipse(playerMapX, playerMapY, 6, 6);
      
      // Dirección del jugador
      const dirX = playerMapX + Math.cos(window.player.angle) * 10;
      const dirY = playerMapY + Math.sin(window.player.angle) * 10;
      canvas.stroke(0, 255, 0);
      canvas.strokeWeight(2);
      canvas.line(playerMapX, playerMapY, dirX, dirY);
      canvas.noStroke();
    }
    
    // Renderizar enemigos en minimapa
    if (window.enemies) {
      window.enemies.forEach(enemy => {
        const enemyMapX = mapX + (enemy.x / window.Utils.mapConfig.cellSize) * (mapSize / window.Utils.mapConfig.gridCols);
        const enemyMapY = mapY + (enemy.z / window.Utils.mapConfig.cellSize) * (mapSize / window.Utils.mapConfig.gridRows);
        
        canvas.fill(255, 0, 0);
        canvas.ellipse(enemyMapX, enemyMapY, 4, 4);
      });
    }
  }
};

console.log('🎨 DoomRenderer cargado y disponible');
console.log('🎨 DoomRenderer cargado y disponible');
