// Utilidades del juego
window.Utils = {
  // Configuración del mapa (debe coincidir con GAME_CONFIG)
  mapConfig: {
    cellSize: 40,
    gridCols: 20,
    gridRows: 15
  },

  // Mapa de colisiones (1 = pared, 0 = espacio libre)
  collisionMap: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,1,1,0,1,0,0,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
    [1,1,1,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,1,1,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,1,1],
    [1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,1,1,0,1,0,0,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ],

  init() {
    console.log('🔧 Sistema de utilidades inicializado');
    
    // Sincronizar configuración si GAME_CONFIG existe
    if (window.GAME_CONFIG) {
      this.mapConfig = {
        cellSize: window.GAME_CONFIG.cellSize || 40,
        gridCols: window.GAME_CONFIG.gridCols || 20,
        gridRows: window.GAME_CONFIG.gridRows || 15
      };
    }
    
    // IMPORTANTE: Sincronizar con el laberinto global
    this.syncWithGlobalLabyrinth();
    
    console.log('📐 Configuración del mapa:', this.mapConfig);
  },

  // Nueva función para sincronizar laberintos
  syncWithGlobalLabyrinth() {
    // Si no existe laberinto global, usar el de utils
    if (!window.labyrinth) {
      window.labyrinth = JSON.parse(JSON.stringify(this.collisionMap)); // Copia profunda
      console.log('🔄 Laberinto global establecido desde utils');
    } else {
      // Si existe, verificar si son compatibles
      if (window.labyrinth.length !== this.collisionMap.length ||
          window.labyrinth[0].length !== this.collisionMap[0].length) {
        console.warn('⚠️ Conflicto de tamaños de laberinto, usando el de utils');
        window.labyrinth = JSON.parse(JSON.stringify(this.collisionMap)); // Copia profunda
      }
    }
    
    // Validar que el laberinto tenga el formato correcto
    this.validateLabyrinth();
    
    // Mostrar algunas posiciones clave para debug
    console.log('🗺️ Verificando posiciones clave del laberinto:');
    console.log(`   [1][1] = ${window.labyrinth[1][1]} (debe ser 0)`);
    console.log(`   [3][1] = ${window.labyrinth[3][1]} (debe ser 0)`);
    console.log(`   [7][10] = ${window.labyrinth[7][10]} (debe ser 0)`);
  },

  validateLabyrinth() {
    const maze = window.labyrinth || this.collisionMap;
    let walls = 0, floors = 0, errors = 0;
    
    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[y].length; x++) {
        const cell = maze[y][x];
        if (cell === 1) walls++;
        else if (cell === 0) floors++;
        else {
          console.warn(`⚠️ Valor inválido en laberinto [${y}][${x}]: ${cell}`);
          errors++;
          maze[y][x] = 1; // Convertir a pared por seguridad
        }
      }
    }
    
    console.log(`🧱 Paredes (1): ${walls}`);
    console.log(`🚶 Suelos (0): ${floors}`);
    if (errors > 0) console.warn(`❌ Errores corregidos: ${errors}`);
    
    // Encontrar y asegurar un buen spawn point
    const spawnPos = this.findBestSpawnPosition();
    if (spawnPos) {
      console.log(`🎯 Spawn point establecido en grid (${spawnPos.gridX}, ${spawnPos.gridY})`);
      this.ensureSpawnArea(spawnPos.gridX, spawnPos.gridY);
    }
    
    console.log('✅ Laberinto validado');
  },

  // Nueva función para encontrar el mejor spawn point
  findBestSpawnPosition() {
    const maze = this.getLabyrinth();
    const candidates = [];
    
    // Buscar todas las posiciones libres (0) en el laberinto
    for (let y = 1; y < maze.length - 1; y++) {
      for (let x = 1; x < maze[y].length - 1; x++) {
        if (maze[y][x] === 0) {
          // Verificar que hay espacio alrededor
          let freeAround = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (maze[y + dy] && maze[y + dy][x + dx] === 0) {
                freeAround++;
              }
            }
          }
          
          if (freeAround >= 5) { // Al menos 5 celdas libres alrededor
            candidates.push({ gridX: x, gridY: y, score: freeAround });
          }
        }
      }
    }
    
    if (candidates.length === 0) {
      console.error('❌ No se encontraron posiciones válidas para spawn');
      return null;
    }
    
    // Seleccionar el candidato con más espacio libre
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0];
  },

  // Asegurar que el área de spawn esté completamente libre
  ensureSpawnArea(gridX, gridY) {
    const maze = this.getLabyrinth();
    
    // Limpiar un área de 3x3 alrededor del spawn
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const x = gridX + dx;
        const y = gridY + dy;
        
        if (y >= 0 && y < maze.length && x >= 0 && x < maze[0].length) {
          maze[y][x] = 0; // Forzar espacio libre
        }
      }
    }
    
    console.log(`🛠️ Área de spawn limpiada en (${gridX}, ${gridY})`);
  },

  // Nueva función para obtener posición de spawn en píxeles
  getSpawnPosition() {
    const spawnPos = this.findBestSpawnPosition();
    
    if (!spawnPos) {
      // Fallback: usar el centro y forzar que esté libre
      const centerX = Math.floor(this.mapConfig.gridCols / 2);
      const centerY = Math.floor(this.mapConfig.gridRows / 2);
      this.ensureSpawnArea(centerX, centerY);
      
      return {
        x: centerX * this.mapConfig.cellSize + this.mapConfig.cellSize / 2,
        z: centerY * this.mapConfig.cellSize + this.mapConfig.cellSize / 2,
        gridX: centerX,
        gridY: centerY
      };
    }
    
    return {
      x: spawnPos.gridX * this.mapConfig.cellSize + this.mapConfig.cellSize / 2,
      z: spawnPos.gridY * this.mapConfig.cellSize + this.mapConfig.cellSize / 2,
      gridX: spawnPos.gridX,
      gridY: spawnPos.gridY
    };
  },

  // Método para obtener el laberinto actual
  getLabyrinth() {
    return window.labyrinth || this.collisionMap;
  },

  // Método para establecer un nuevo laberinto
  setLabyrinth(newMaze) {
    if (!newMaze || !Array.isArray(newMaze)) {
      console.error('❌ Laberinto inválido');
      return false;
    }
    
    this.collisionMap = newMaze;
    window.labyrinth = newMaze;
    this.validateLabyrinth();
    console.log('🔄 Laberinto actualizado');
    return true;
  },

  // === FUNCIONES DE COLISIÓN ===
  
  /**
   * Verifica si una posición (x, z) colisiona con una pared
   * @param {number} x - Coordenada X en píxeles
   * @param {number} z - Coordenada Z en píxeles
   * @param {number} radius - Radio del objeto (opcional)
   * @returns {boolean} true si hay colisión
   */
  collides(x, z, radius = 15) {
    // Usar el laberinto sincronizado
    const maze = this.getLabyrinth();
    
    // Convertir coordenadas de píxeles a grid
    const gridX = Math.floor(x / this.mapConfig.cellSize);
    const gridZ = Math.floor(z / this.mapConfig.cellSize);
    
    // Verificar límites del mapa
    if (gridX < 0 || gridX >= this.mapConfig.gridCols || 
        gridZ < 0 || gridZ >= this.mapConfig.gridRows) {
      return true; // Fuera del mapa = colisión
    }
    
    // Verificar colisión básica
    if (maze[gridZ] && maze[gridZ][gridX] === 1) {
      return true;
    }
    
    // Verificar colisiones con radio (esquinas)
    if (radius > 0) {
      const corners = [
        [x - radius, z - radius],
        [x + radius, z - radius],
        [x - radius, z + radius],
        [x + radius, z + radius]
      ];
      
      for (const [cornerX, cornerZ] of corners) {
        const cornerGridX = Math.floor(cornerX / this.mapConfig.cellSize);
        const cornerGridZ = Math.floor(cornerZ / this.mapConfig.cellSize);
        
        if (cornerGridX < 0 || cornerGridX >= this.mapConfig.gridCols || 
            cornerGridZ < 0 || cornerGridZ >= this.mapConfig.gridRows) {
          return true;
        }
        
        if (maze[cornerGridZ] && maze[cornerGridZ][cornerGridX] === 1) {
          return true;
        }
      }
    }
    
    return false;
  },

  /**
   * Verifica si una línea entre dos puntos intersecta con paredes (para disparos)
   * @param {number} x1 - X inicial
   * @param {number} z1 - Z inicial
   * @param {number} x2 - X final
   * @param {number} z2 - Z final
   * @returns {Object|null} Punto de intersección o null
   */
  raycast(x1, z1, x2, z2) {
    const maze = this.getLabyrinth();
    const dx = x2 - x1;
    const dz = z2 - z1;
    const distance = Math.sqrt(dx * dx + dz * dz);
    const steps = Math.ceil(distance / 5); // Verificar cada 5 píxeles
    
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = x1 + dx * t;
      const z = z1 + dz * t;
      
      if (this.collides(x, z, 2)) {
        return { x, z, distance: distance * t };
      }
    }
    
    return null; // No hay intersección
  },

  // === FUNCIONES MATEMÁTICAS ===
  
  /**
   * Calcula la distancia entre dos puntos
   */
  distance(x1, z1, x2, z2) {
    return Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
  },

  /**
   * Calcula el ángulo entre dos puntos
   */
  angle(x1, z1, x2, z2) {
    return Math.atan2(z2 - z1, x2 - x1);
  },

  /**
   * Normaliza un ángulo entre -π y π
   */
  normalizeAngle(angle) {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  },

  /**
   * Interpolación lineal
   */
  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  /**
   * Limita un valor entre min y max
   */
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  // === FUNCIONES DE CONVERSIÓN ===
  
  /**
   * Convierte coordenadas de píxeles a grid
   */
  pixelsToGrid(x, z) {
    return {
      x: Math.floor(x / this.mapConfig.cellSize),
      z: Math.floor(z / this.mapConfig.cellSize)
    };
  },

  /**
   * Convierte coordenadas de grid a píxeles (centro de la celda)
   */
  gridToPixels(gridX, gridZ) {
    return {
      x: (gridX + 0.5) * this.mapConfig.cellSize,
      z: (gridZ + 0.5) * this.mapConfig.cellSize
    };
  },

  // === FUNCIONES DE SPAWN ===
  
  /**
   * Encuentra una posición libre para spawn
   */
  findFreePosition(attempts = 50) {
    for (let i = 0; i < attempts; i++) {
      const x = (1 + Math.random() * (this.mapConfig.gridCols - 2)) * this.mapConfig.cellSize;
      const z = (1 + Math.random() * (this.mapConfig.gridRows - 2)) * this.mapConfig.cellSize;
      
      if (!this.collides(x, z, 20)) {
        return { x, z };
      }
    }
    
    console.warn('⚠️ No se pudo encontrar posición libre después de', attempts, 'intentos');
    return null;
  },

  /**
   * Verifica si una posición está libre (para enemigos/items)
   */
  isPositionFree(x, z, radius = 20) {
    return !this.collides(x, z, radius);
  },

  // === FUNCIONES DE VALIDACIÓN ===
  
  /**
   * Verifica si las coordenadas están dentro del mapa
   */
  isInBounds(x, z) {
    const gridX = Math.floor(x / this.mapConfig.cellSize);
    const gridZ = Math.floor(z / this.mapConfig.cellSize);
    
    return gridX >= 0 && gridX < this.mapConfig.gridCols && 
           gridZ >= 0 && gridZ < this.mapConfig.gridRows;
  },

  /**
   * Obtiene información de una celda del mapa
   */
  getCellInfo(gridX, gridZ) {
    if (gridX < 0 || gridX >= this.mapConfig.gridCols || 
        gridZ < 0 || gridZ >= this.mapConfig.gridRows) {
      return { type: 'wall', solid: true };
    }
    
    const cellValue = this.collisionMap[gridZ][gridX];
    return {
      type: cellValue === 1 ? 'wall' : 'floor',
      solid: cellValue === 1,
      gridX,
      gridZ
    };
  },

  debugDrawCollisionMap(canvasSystem) {
    if (!canvasSystem) return;
    
    canvasSystem.push();
    
    for (let z = 0; z < this.mapConfig.gridRows; z++) {
      for (let x = 0; x < this.mapConfig.gridCols; x++) {
        const isWall = this.collisionMap[z][x] === 1;
        
        if (isWall) {
          canvasSystem.fill(255, 0, 0, 100); // Rojo transparente para paredes
        } else {
          canvasSystem.fill(0, 255, 0, 50); // Verde transparente para espacios libres
        }
        
        canvasSystem.rect(
          x * this.mapConfig.cellSize,
          z * this.mapConfig.cellSize,
          this.mapConfig.cellSize,
          this.mapConfig.cellSize
        );
      }
    }
    
    canvasSystem.pop();
  },

  /**
   * Información del sistema para debug
   */
  getDebugInfo() {
    return {
      mapConfig: this.mapConfig,
      collisionMapSize: {
        width: this.mapConfig.gridCols,
        height: this.mapConfig.gridRows
      },
      totalCells: this.mapConfig.gridCols * this.mapConfig.gridRows,
      wallCells: this.collisionMap.flat().filter(cell => cell === 1).length
    };
  },

  // Función para debug - mostrar el laberinto en consola
  debugPrintLabyrinth() {
    const maze = this.getLabyrinth();
    console.log('🗺️ Laberinto actual:');
    for (let y = 0; y < maze.length; y++) {
      let row = '';
      for (let x = 0; x < maze[y].length; x++) {
        row += maze[y][x] === 1 ? '█' : ' ';
      }
      console.log(`${y.toString().padStart(2, '0')}: ${row}`);
    }
  }
};

// Inicializar automáticamente
window.Utils.init();

console.log('🔧 Utils cargado y disponible');
