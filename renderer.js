// Sistema de renderizado DOOM clásico
window.DoomRenderer = {
  
  init() {
    console.log('🎨 DoomRenderer inicializado');
  },

  renderGame() {
    // Limpiar pantalla
    background(0);
    
    // Renderizar escena 3D
    this.drawSkyAndFloor();
    this.renderClassicDoom();
    
    // CRÍTICO: Renderizar enemigos
    this.drawEnemies();
    
    // Efectos y UI
    this.drawCrosshair();
    
    // DEBUG TEMPORAL - mostrar información
    this.drawDebugInfo();
    
    // Renderizar efectos - CORREGIDO
    if (window.Effects && typeof window.Effects.render === 'function') {
      window.Effects.render();
    } else if (window.VisualEffects && typeof window.VisualEffects.renderEffects === 'function') {
      window.VisualEffects.renderEffects();
    }
  },

  renderClassicDoom() {
    if (!window.player || !window.labyrinth) return;
    
    const screenWidth = width;
    const screenHeight = height;
    
    // Simplificar el raycasting - renderizar solo cada 2 píxeles para debug
    for (let x = 0; x < screenWidth; x += 2) {
      const rayAngle = window.player.angle + (x - screenWidth/2) * 0.001;
      
      // Dirección del rayo
      const rayDirX = Math.cos(rayAngle);
      const rayDirZ = Math.sin(rayAngle);
      
      // Posición inicial
      let rayX = window.player.x;
      let rayZ = window.player.z;
      
      // Avanzar el rayo paso a paso
      const stepSize = 5;
      let distance = 0;
      let hit = false;
      let maxDistance = 800;
      
      while (distance < maxDistance && !hit) {
        rayX += rayDirX * stepSize;
        rayZ += rayDirZ * stepSize;
        distance += stepSize;
        
        // Convertir a coordenadas del grid
        const gridX = Math.floor(rayX / window.GAME_CONFIG.cellSize);
        const gridZ = Math.floor(rayZ / window.GAME_CONFIG.cellSize);
        
        // Verificar límites
        if (gridX < 0 || gridX >= window.GAME_CONFIG.gridCols || 
            gridZ < 0 || gridZ >= window.GAME_CONFIG.gridRows) {
          hit = true;
          break;
        }
        
        // Verificar pared
        if (window.labyrinth[gridZ][gridX] === 1) {
          hit = true;
          break;
        }
      }
      
      // Si no golpeamos nada, mostrar el fondo
      if (!hit) {
        continue; // El cielo y suelo ya están dibujados
      }
      
      // Calcular altura de la pared en pantalla
      const wallHeight = (window.GAME_CONFIG.cellSize * screenHeight) / Math.max(distance, 1);
      const wallTop = (screenHeight - wallHeight) / 2;
      const wallBottom = wallTop + wallHeight;
      
      // Determinar color de la pared
      const gridX = Math.floor(rayX / window.GAME_CONFIG.cellSize);
      const gridZ = Math.floor(rayZ / window.GAME_CONFIG.cellSize);
      const wallColor = this.getSimpleWallColor(gridX, gridZ, distance);
      
      // Dibujar línea vertical de la pared
      stroke(wallColor.r, wallColor.g, wallColor.b);
      strokeWeight(2);
      line(x, Math.max(0, wallTop), x, Math.min(screenHeight, wallBottom));
    }
    
    noStroke();
  },
  
  getSimpleWallColor(gridX, gridZ, distance) {
    // Colores diferentes según posición
    const wallType = (gridX + gridZ) % 3;
    let r, g, b;
    
    switch (wallType) {
      case 0:
        r = 150; g = 100; b = 100; // Rojo ladrillo
        break;
      case 1:
        r = 100; g = 150; b = 100; // Verde
        break;
      case 2:
        r = 100; g = 100; b = 150; // Azul
        break;
      default:
        r = 120; g = 120; b = 120; // Gris
        break;
    }
    
    // Aplicar atenuación por distancia
    const brightness = Math.max(0.3, 1.0 - distance / 600);
    
    return {
      r: Math.floor(r * brightness),
      g: Math.floor(g * brightness),
      b: Math.floor(b * brightness)
    };
  },

  // Función de debug mejorada
  drawDebugInfo() {
    if (!window.player) return;
    
    push();
    
    const gridX = Math.floor(window.player.x / window.GAME_CONFIG.cellSize);
    const gridZ = Math.floor(window.player.z / window.GAME_CONFIG.cellSize);
    const cellValue = window.labyrinth[gridZ] ? window.labyrinth[gridZ][gridX] : 'N/A';
    
    // Información básica
    fill(0, 0, 0, 180);
    noStroke();
    rect(5, 5, 400, 120);
    
    fill(255, 255, 255);
    textAlign(LEFT, TOP);
    textSize(12);
    text(`Pos: (${window.player.x.toFixed(1)}, ${window.player.z.toFixed(1)})`, 10, 20);
    text(`Grid: (${gridX}, ${gridZ})`, 10, 35);
    text(`Cell: ${cellValue} ${cellValue === 0 ? '✅ LIBRE' : cellValue === 1 ? '❌ PARED' : '❓ ERROR'}`, 10, 50);
    text(`Angle: ${(window.player.angle * 180 / Math.PI).toFixed(1)}°`, 10, 65);
    text(`Map size: ${window.GAME_CONFIG.gridCols}x${window.GAME_CONFIG.gridRows}`, 10, 80);
    text(`Cell size: ${window.GAME_CONFIG.cellSize}`, 10, 95);
    
    // Mini mapa con colores claros
    if (window.labyrinth) {
      const mapStartX = 420;
      const mapStartY = 20;
      const cellSize = 6;
      const viewRadius = 8;
      
      // Fondo del mini mapa
      fill(0, 0, 0, 150);
      rect(mapStartX - 5, mapStartY - 5, (viewRadius * 2 + 1) * cellSize + 10, (viewRadius * 2 + 1) * cellSize + 10);
      
      for (let dy = -viewRadius; dy <= viewRadius; dy++) {
        for (let dx = -viewRadius; dx <= viewRadius; dx++) {
          const mapY = gridZ + dy;
          const mapX = gridX + dx;
          
          let cellColor;
          if (mapY >= 0 && mapY < window.labyrinth.length && 
              mapX >= 0 && mapX < window.labyrinth[0].length) {
            if (window.labyrinth[mapY][mapX] === 0) {
              cellColor = color(100, 255, 100); // Verde claro para suelo
            } else {
              cellColor = color(200, 100, 100); // Rojo claro para paredes
            }
          } else {
            cellColor = color(80, 80, 80); // Gris para fuera del mapa
          }
          
          // Destacar posición del jugador
          if (dx === 0 && dy === 0) {
            cellColor = color(255, 255, 0); // Amarillo para jugador
          }
          
          fill(cellColor);
          noStroke();
          rect(mapStartX + (dx + viewRadius) * cellSize, 
               mapStartY + (dy + viewRadius) * cellSize, 
               cellSize, cellSize);
        }
      }
      
      // Dirección del jugador
      stroke(255, 255, 0);
      strokeWeight(2);
      const centerX = mapStartX + viewRadius * cellSize + cellSize/2;
      const centerY = mapStartY + viewRadius * cellSize + cellSize/2;
      const dirLength = cellSize * 2;
      line(centerX, centerY, 
           centerX + Math.cos(window.player.angle) * dirLength, 
           centerY + Math.sin(window.player.angle) * dirLength);
    }
    
    pop();
  },

  // Desactivado para evitar cualquier fallback rectangular si este renderer se inyecta por error
  drawEnemies() { /* no-op */ },
  
  drawEnemy3D(enemy, index) {
    if (!window.player) return;
    
    const relX = enemy.x - window.player.x;
    const relZ = enemy.z - window.player.z;
    const distance = Math.sqrt(relX * relX + relZ * relZ);
    
    // RANGO DE VISIÓN EXTENDIDO
    if (distance > 1000) return;
    
    // Transformación de coordenadas mundo a pantalla
    const dirX = Math.cos(window.player.angle);
    const dirZ = Math.sin(window.player.angle);
    const planeX = -Math.sin(window.player.angle) * 0.66;
    const planeZ = Math.cos(window.player.angle) * 0.66;
    
    const invDet = 1.0 / (planeX * dirZ - dirX * planeZ);
    const transformX = invDet * (dirZ * relX - dirX * relZ);
    const transformY = invDet * (-planeZ * relX + planeX * relZ);
    
    // Si está detrás del jugador, no renderizar
    if (transformY <= 0.1) return;
    
    const spriteScreenX = Math.floor((width / 2) * (1 + transformX / transformY));
    
    // TAMAÑO BASADO EN DISTANCIA - EFECTO DE PERSPECTIVA REAL
    const baseSpriteSize = 120; // Tamaño base cuando está cerca
    const perspectiveSize = Math.floor(baseSpriteSize / transformY);
    const spriteHeight = Math.floor(perspectiveSize * (enemy.scale || 1.5));
    const spriteWidth = Math.floor(spriteHeight * 0.8);
    
    // POSICIONAMIENTO EN EL SUELO - NIVEL DEL JUGADOR
    const centerY = height / 2;
    const pitchOffset = window.player.pitch || 0;
    const horizonY = centerY + pitchOffset;
    
    // El enemigo está en el suelo, su base toca el horizonte
    const spriteBottom = horizonY;
    const spriteTop = spriteBottom - spriteHeight;
    const spriteLeft = Math.floor(spriteScreenX - spriteWidth / 2);
    
    // Verificar límites de pantalla
    if (spriteLeft + spriteWidth < 0 || spriteLeft >= width || spriteTop > height || spriteBottom < 0) return;
    
    // RENDERIZADO DEL ENEMIGO
    let enemyImage = null;
    if (window.AssetManager) {
      enemyImage = window.AssetManager.getImage(enemy.config.image);
    }
    
    if (enemyImage && enemyImage.width > 0) {
      // ✅ RENDERIZAR IMAGEN PNG
      push();
      
      // Efecto de distancia en la opacidad
      const distanceAlpha = Math.max(0.4, Math.min(1.0, 1.0 - (distance / 800)));
      tint(255, 255, 255, distanceAlpha * 255);
      
      imageMode(CORNER);
      image(enemyImage, spriteLeft, spriteTop, spriteWidth, spriteHeight);
      imageMode(CENTER);
      
      noTint();
      pop();
      
    } else {
      // ❌ FALLBACK: sprite de color
      push();
      
      const displayColor = enemy.getDisplayColor ? enemy.getDisplayColor() : enemy.config.color;
      
      // Efecto de distancia en el color
      const distanceFactor = Math.max(0.3, Math.min(1.0, 1.0 - (distance / 600)));
      fill(
        displayColor[0] * distanceFactor,
        displayColor[1] * distanceFactor,
        displayColor[2] * distanceFactor,
        200
      );
      noStroke();
      
      // SPRITE RECTANGULAR
      rect(spriteLeft, spriteTop, spriteWidth, spriteHeight);
      
      // Características visuales básicas
      fill(255, 255, 0, 200 * distanceFactor);
      const eyeSize = Math.max(4, spriteWidth / 4);
      ellipse(spriteLeft + spriteWidth * 0.3, spriteTop + spriteHeight * 0.3, eyeSize);
      ellipse(spriteLeft + spriteWidth * 0.7, spriteTop + spriteHeight * 0.3, eyeSize);
      
      pop();
    }

    // UI SOLO SI ESTÁ CERCA
    if (distance < 200) {
      push();
      fill(255, 255, 255, 200);
      textAlign(CENTER);
      textSize(Math.max(10, spriteWidth / 6));
      textStyle(BOLD);
      
      const shortName = enemy.type.substring(0, 3);
      text(shortName, spriteScreenX, spriteTop - 15);
      pop();
      
      // Barra de vida SOLO si está dañado y cerca
      if (enemy.health < enemy.maxHealth) {
        const barWidth = spriteWidth * 0.8;
        const barHeight = 6;
        const healthPercent = enemy.health / enemy.maxHealth;
        
        push();
        fill(0, 0, 0, 150);
        rect(spriteScreenX - barWidth/2, spriteTop - 10, barWidth, barHeight);
        
        if (healthPercent > 0.6) {
          fill(0, 255, 0);
        } else if (healthPercent > 0.3) {
          fill(255, 255, 0);
        } else {
          fill(255, 0, 0);
        }
        rect(spriteScreenX - barWidth/2, spriteTop - 10, barWidth * healthPercent, barHeight);
        pop();
      }
    }
  },

  drawSkyAndFloor() {
    // Dibujar cielo (parte superior)
    push();
    fill(135, 206, 235); // Azul cielo
    noStroke();
    rect(0, 0, width, height / 2);
    
    // Dibujar suelo (parte inferior)
    fill(101, 67, 33); // Marrón tierra
    rect(0, height / 2, width, height / 2);
    pop();
  },

  drawCrosshair() {
    // Cruz roja fija en la posición del mouse
    push();
    stroke(255, 0, 0);
    strokeWeight(3);
    
    // Obtener posición del mouse relativa al canvas
    let crosshairX = mouseX || width/2;
    let crosshairY = mouseY || height/2;
    
    // Verificar que esté dentro del canvas
    if (crosshairX >= 0 && crosshairX <= width && crosshairY >= 0 && crosshairY <= height) {
      // Cruz principal
      line(crosshairX - 15, crosshairY, crosshairX + 15, crosshairY);
      line(crosshairX, crosshairY - 15, crosshairX, crosshairY + 15);
      
      // Punto central
      strokeWeight(5);
      point(crosshairX, crosshairY);
      
      // Anillo exterior
      strokeWeight(2);
      noFill();
      circle(crosshairX, crosshairY, 30);
    }
    
    noStroke();
    pop();
  }
};

console.log('DoomRenderer cargado y disponible');
