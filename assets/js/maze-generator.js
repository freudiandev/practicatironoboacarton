class MazeGenerator {
  generateMaze(width, height) {
    console.log(`🏗️ Generando laberinto ${width}x${height}`);
    
    // Inicializar con todas las celdas como paredes (1)
    const maze = Array(height).fill().map(() => Array(width).fill(1));
    
    // Crear espacios transitables (0) - patrón de laberinto válido
    this.carvePaths(maze, width, height);
    
    // Asegurar que hay un camino desde el spawn
    this.ensureSpawnAccess(maze, width, height);
    
    // Verificar integridad del laberinto
    this.validateMaze(maze, width, height);
    
    console.log('✅ Laberinto generado correctamente');
    return maze;
  }
  
  carvePaths(maze, width, height) {
    // Crear pasillos horizontales principales
    for (let y = 1; y < height - 1; y += 4) {
      for (let x = 1; x < width - 1; x++) {
        maze[y][x] = 0; // Espacio transitable
      }
    }
    
    // Crear pasillos verticales principales
    for (let x = 1; x < width - 1; x += 4) {
      for (let y = 1; y < height - 1; y++) {
        maze[y][x] = 0; // Espacio transitable
      }
    }
    
    // Conectar pasillos con conexiones aleatorias
    for (let y = 2; y < height - 2; y += 4) {
      for (let x = 2; x < width - 2; x += 4) {
        // Crear conexiones aleatorias
        if (Math.random() > 0.5) {
          maze[y][x] = 0;
          maze[y][x + 1] = 0;
        }
        if (Math.random() > 0.5) {
          maze[y][x] = 0;
          maze[y + 1][x] = 0;
        }
      }
    }
    
    // Crear algunas habitaciones
    this.createRooms(maze, width, height);
  }
  
  createRooms(maze, width, height) {
    const numRooms = Math.floor((width * height) / 200);
    
    for (let i = 0; i < numRooms; i++) {
      const roomWidth = 3 + Math.floor(Math.random() * 4);
      const roomHeight = 3 + Math.floor(Math.random() * 4);
      
      const startX = 1 + Math.floor(Math.random() * (width - roomWidth - 2));
      const startY = 1 + Math.floor(Math.random() * (height - roomHeight - 2));
      
      // Crear la habitación
      for (let y = startY; y < startY + roomHeight; y++) {
        for (let x = startX; x < startX + roomWidth; x++) {
          if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
            maze[y][x] = 0; // Espacio transitable
          }
        }
      }
    }
  }
  
  ensureSpawnAccess(maze, width, height) {
    // Asegurar que el área de spawn (centro) esté libre
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    // Crear un área de 5x5 libre alrededor del spawn
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const x = centerX + dx;
        const y = centerY + dy;
        
        if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
          maze[y][x] = 0; // Espacio transitable
        }
      }
    }
    
    // Crear caminos desde el spawn hacia los bordes
    this.createSpawnPaths(maze, width, height, centerX, centerY);
  }
  
  createSpawnPaths(maze, width, height, centerX, centerY) {
    // Camino hacia arriba
    for (let y = centerY; y > 1; y--) {
      maze[y][centerX] = 0;
      if (maze[y - 1][centerX - 1] === 0 || maze[y - 1][centerX + 1] === 0) break;
    }
    
    // Camino hacia abajo
    for (let y = centerY; y < height - 2; y++) {
      maze[y][centerX] = 0;
      if (maze[y + 1][centerX - 1] === 0 || maze[y + 1][centerX + 1] === 0) break;
    }
    
    // Camino hacia la izquierda
    for (let x = centerX; x > 1; x--) {
      maze[centerY][x] = 0;
      if (maze[centerY - 1][x - 1] === 0 || maze[centerY + 1][x - 1] === 0) break;
    }
    
    // Camino hacia la derecha
    for (let x = centerX; x < width - 2; x++) {
      maze[centerY][x] = 0;
      if (maze[centerY - 1][x + 1] === 0 || maze[centerY + 1][x + 1] === 0) break;
    }
  }
  
  validateMaze(maze, width, height) {
    let wallCount = 0;
    let floorCount = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (maze[y][x] === 1) {
          wallCount++;
        } else if (maze[y][x] === 0) {
          floorCount++;
        }
      }
    }
    
    console.log(`🧱 Paredes (1): ${wallCount}`);
    console.log(`🚶 Suelos (0): ${floorCount}`);
    console.log(`📊 Ratio suelo/total: ${(floorCount / (width * height) * 100).toFixed(1)}%`);
    
    // Verificar que hay suficiente espacio transitable
    if (floorCount < (width * height) * 0.2) {
      console.warn('⚠️ Pocas áreas transitables en el laberinto');
    }
    
    // Verificar spawn point
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    if (maze[centerY][centerX] !== 0) {
      console.error('❌ El punto de spawn no está libre!');
      maze[centerY][centerX] = 0; // Forzar spawn libre
    } else {
      console.log('✅ Punto de spawn verificado');
    }
  }
  
  // Método simple para testing - laberinto básico garantizado
  generateSimpleMaze(width, height) {
    console.log(`🏗️ Generando laberinto simple ${width}x${height}`);
    
    const maze = Array(height).fill().map(() => Array(width).fill(1));
    
    // Crear pasillos cada 2 celdas
    for (let y = 1; y < height - 1; y += 2) {
      for (let x = 1; x < width - 1; x++) {
        maze[y][x] = 0;
      }
    }
    
    for (let x = 1; x < width - 1; x += 2) {
      for (let y = 1; y < height - 1; y++) {
        maze[y][x] = 0;
      }
    }
    
    // Asegurar spawn
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    maze[centerY][centerX] = 0;
    
    console.log('✅ Laberinto simple generado');
    return maze;
  }
}