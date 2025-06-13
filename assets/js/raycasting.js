// Como ojos láser mágicos que crean un mundo 3D desde un mapa plano
class RaycastingEngine {
  constructor(canvas, ctx) {
    this.canvas = canvas; // El papel donde dibujamos
    this.ctx = ctx; // Los lápices para dibujar
    this.width = canvas.width; // Qué tan ancho es el papel
    this.height = canvas.height; // Qué tan alto es el papel
    this.numRays = Math.floor(this.width / 2); // Cuántos rayos láser usar
    
    // Colores de las paredes según hacia dónde miran (como DOOM clásico)
    this.wallColors = {
      north: '#8B4513',   // Pared mirando al norte (marrón oscuro)
      south: '#A0522D',   // Pared mirando al sur (marrón claro)
      east: '#CD853F',    // Pared mirando al este (beige)
      west: '#5D4037'     // Pared mirando al oeste (marrón muy oscuro)
    };
    
    this.floorColor = '#2F2F2F'; // Color del suelo (gris oscuro)
    this.ceilingColor = '#1A1A1A'; // Color del techo (casi negro)
    
    console.log('🎯 RaycastingEngine inicializado con', this.numRays, 'rayos');
  }

  castRay(startX, startZ, angle) {
    // Como lanzar un rayo láser desde nuestros ojos hasta tocar una pared
    const stepSize = 1; // Qué tan pequeños son los pasos del rayo
    let distance = 0; // Cuánto ha viajado el rayo
    let x = startX; // Posición actual del rayo (lado a lado)
    let z = startZ; // Posición actual del rayo (adelante/atrás)
    
    // Calcular en qué dirección avanza el rayo
    const deltaX = Math.cos(angle) * stepSize; // Pasos hacia los lados
    const deltaZ = Math.sin(angle) * stepSize; // Pasos hacia adelante/atrás
    
    // Seguir lanzando el rayo hasta que toque algo o llegue muy lejos
    while (distance < CONFIG.world.maxRenderDistance) {
      x += deltaX; // Mover el rayo hacia los lados
      z += deltaZ; // Mover el rayo hacia adelante/atrás
      distance += stepSize; // Contar cuánto ha avanzado
      
      // Convertir la posición del rayo a casillas del mapa
      const gridX = Math.floor(x / CONFIG.world.cellSize);
      const gridZ = Math.floor(z / CONFIG.world.cellSize);
      
      // Si el rayo sale del mapa, parar (como llegar al borde del mundo)
      if (gridX < 0 || gridX >= CONFIG.world.gridCols || 
          gridZ < 0 || gridZ >= CONFIG.world.gridRows) {
        return {
          distance, // Qué tan lejos llegó
          wallSide: 'north', // Qué lado de la pared tocó
          hitX: x, // Dónde tocó exactamente (lado a lado)
          hitZ: z, // Dónde tocó exactamente (adelante/atrás)
          wallType: 1 // Tipo de pared que tocó
        };
      }
      
      // Verificar colisión con pared
      if (MAZE[gridZ][gridX] === 1) {
        return {
          distance,
          wallSide: this.getWallSide(x, z, gridX, gridZ),
          hitX: x,
          hitZ: z,
          wallType: MAZE[gridZ][gridX]
        };
      }
    }
    
    return { 
      distance: CONFIG.world.maxRenderDistance, 
      wallSide: 'north', 
      hitX: x, 
      hitZ: z,
      wallType: 0
    };
  }

  getWallSide(x, z, gridX, gridZ) {
    const cellCenterX = gridX * CONFIG.world.cellSize + CONFIG.world.cellSize / 2;
    const cellCenterZ = gridZ * CONFIG.world.cellSize + CONFIG.world.cellSize / 2;
    
    const deltaX = Math.abs(x - cellCenterX);
    const deltaZ = Math.abs(z - cellCenterZ);
    
    // Determinar qué cara de la celda se golpeó
    if (deltaX > deltaZ) {
      return x < cellCenterX ? 'west' : 'east';
    } else {
      return z < cellCenterZ ? 'north' : 'south';
    }
  }

  render(player) {
    // Limpiar pantalla
    this.ctx.fillStyle = this.ceilingColor;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Renderizar cielo y suelo
    this.renderBackground();
    
    // Configuración del FOV
    const startAngle = player.angle - CONFIG.world.fov / 2;
    const angleStep = CONFIG.world.fov / this.numRays;
    const columnWidth = this.width / this.numRays;
    
    // Array para almacenar profundidades (Z-buffer)
    const depthBuffer = new Array(this.numRays);
    
    // Lanzar rayos y renderizar paredes
    for (let i = 0; i < this.numRays; i++) {
      const rayAngle = startAngle + i * angleStep;
      const hit = this.castRay(player.x, player.z, rayAngle);
      
      // Corrección del efecto ojo de pez
      const correctedDistance = hit.distance * Math.cos(rayAngle - player.angle);
      depthBuffer[i] = correctedDistance;
        // Calcular altura de la pared en pantalla
      const wallHeight = (CONFIG.world.wallHeight / correctedDistance) * (this.height * 0.6);
      
      // APLICAR PITCH: Desplazar la pared verticalmente según el ángulo de vista
      const pitchOffset = (player.pitch || 0) * (this.height / 3); // Amplificar el efecto
      const wallTop = (this.height - wallHeight) / 2 + pitchOffset;
      const wallBottom = wallTop + wallHeight;
      
      // Aplicar sombreado por distancia
      const brightness = this.calculateBrightness(correctedDistance);
      const wallColor = this.getWallColor(hit.wallSide, brightness);
      
      // Renderizar columna de pared
      this.renderWallColumn(i * columnWidth, wallTop, columnWidth, wallHeight, wallColor);
      
      // Renderizar textura si está cerca
      if (correctedDistance < 200) {
        this.renderWallTexture(i * columnWidth, wallTop, columnWidth, wallHeight, hit, correctedDistance);
      }
    }
    
    // Guardar depth buffer para renderizado de sprites
    this.depthBuffer = depthBuffer;
  }
  renderBackground() {
    // APLICAR PITCH al fondo
    const pitchOffset = (window.player?.pitch || 0) * (this.height / 3);
    const horizonY = this.height / 2 + pitchOffset;
    
    // Cielo
    const gradient = this.ctx.createLinearGradient(0, 0, 0, Math.max(0, horizonY));
    gradient.addColorStop(0, '#4A90E2');
    gradient.addColorStop(1, '#2E3440');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, Math.max(0, horizonY));
    
    // Suelo
    const floorGradient = this.ctx.createLinearGradient(0, Math.min(this.height, horizonY), 0, this.height);
    floorGradient.addColorStop(0, '#3E2723');
    floorGradient.addColorStop(1, '#1B1B1B');
    
    this.ctx.fillStyle = floorGradient;
    this.ctx.fillRect(0, Math.min(this.height, horizonY), this.width, this.height - Math.min(this.height, horizonY));
  }

  calculateBrightness(distance) {
    // Cálculo de brillo basado en distancia (fog)
    const maxDistance = CONFIG.world.maxRenderDistance;
    const minBrightness = 0.1;
    const maxBrightness = 1.0;
    
    const brightness = maxBrightness - (distance / maxDistance) * (maxBrightness - minBrightness);
    return Math.max(minBrightness, Math.min(maxBrightness, brightness));
  }

  getWallColor(wallSide, brightness) {
    const baseColor = this.wallColors[wallSide] || this.wallColors.north;
    return this.adjustBrightness(baseColor, brightness);
  }

  adjustBrightness(hexColor, brightness) {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    
    return `rgb(${Math.floor(r * brightness)}, ${Math.floor(g * brightness)}, ${Math.floor(b * brightness)})`;
  }

  renderWallColumn(x, y, width, height, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  renderWallTexture(x, y, width, height, hit, distance) {
    // Simular textura con líneas verticales
    const brightness = this.calculateBrightness(distance);
    
    if (brightness > 0.5) {
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${brightness * 0.3})`;
      this.ctx.lineWidth = 1;
      
      for (let i = 0; i < width; i += 4) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + i, y);
        this.ctx.lineTo(x + i, y + height);
        this.ctx.stroke();
      }
    }
  }

  // Método para que otros sistemas puedan usar el depth buffer
  getDepthAtScreenX(screenX) {
    const index = Math.floor((screenX / this.width) * this.numRays);
    return this.depthBuffer ? this.depthBuffer[index] : Infinity;
  }

  // Proyectar coordenadas del mundo a coordenadas de pantalla
  worldToScreen(worldX, worldZ, player) {
    const dx = worldX - player.x;
    const dz = worldZ - player.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    const angle = Math.atan2(dz, dx) - player.angle;
    const normalizedAngle = this.normalizeAngle(angle);
    
    if (Math.abs(normalizedAngle) > CONFIG.world.fov / 2) {
      return null; // Fuera del campo de visión
    }
    
    const screenX = this.width * 0.5 + (normalizedAngle / (CONFIG.world.fov / 2)) * (this.width * 0.5);
    const scale = (this.height * 0.6) / distance;
    
    return {
      screenX,
      screenY: this.height * 0.5,
      scale,
      distance
    };
  }

  normalizeAngle(angle) {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  }
}

window.RaycastingEngine = RaycastingEngine;
console.log('✅ RaycastingEngine estilo DOOM cargado');
