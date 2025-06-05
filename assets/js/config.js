const CONFIG = {
  world: {
    gridRows: 25,
    gridCols: 25,
    cellSize: 64,
    fov: Math.PI / 3, // 60 grados como DOOM
    maxRenderDistance: 1000,
    wallHeight: 64
  },
  
  player: {
    health: 100,
    maxAmmo: 30,
    speed: 120,
    startX: 192, // 3 * 64
    startZ: 192, // 3 * 64
    startY: 32
  },
  
  enemy: {
    health: 100,
    speed: 40,
    maxCount: 10,
    spawnCooldown: 2500,
    detectionRange: 300,
    size: 48,
    headHeight: 0.15,
    sprites: [
      'assets/images/noboa-presidencial.png',
      'assets/images/noboa-deportivo.png',
      'assets/images/noboa-casual.png'
    ]
  },
  
  bullet: {
    speed: 800,
    bodyDamage: 25,
    headDamage: 75,
    lifetime: 3000,
    cooldown: 150,
    size: 6
  },
  
  audio: {
    volume: 0.8,
    enabled: true
  },

  ui: {
    crosshairColor: '#FF0000',
    crosshairSize: 25,
    headshotDuration: 1500
  }
};

// Generador de laberintos estilo DOOM
class MazeGenerator {
  static generateDoomMaze(width, height) {
    // Crear laberinto base lleno de paredes
    const maze = Array(height).fill().map(() => Array(width).fill(1));
    
    // Algoritmo de excavación recursiva
    function carve(x, y) {
      maze[y][x] = 0;
      
      // Direcciones: Norte, Sur, Este, Oeste
      const directions = [
        [0, -2], [0, 2], [2, 0], [-2, 0]
      ];
      
      // Mezclar direcciones aleatoriamente
      for (let i = directions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [directions[i], directions[j]] = [directions[j], directions[i]];
      }
      
      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && maze[ny][nx] === 1) {
          maze[y + dy/2][x + dx/2] = 0; // Abrir pared intermedia
          carve(nx, ny);
        }
      }
    }
    
    // Comenzar excavación desde posición impar
    carve(1, 1);
    
    // Crear áreas abiertas estilo DOOM
    MazeGenerator.createOpenAreas(maze, width, height);
    
    // Crear conexiones adicionales
    MazeGenerator.createExtraConnections(maze, width, height);
    
    return maze;
  }
  
  static createOpenAreas(maze, width, height) {
    // Crear 3-5 áreas abiertas grandes
    const numAreas = 3 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numAreas; i++) {
      const centerX = 3 + Math.floor(Math.random() * (width - 6));
      const centerY = 3 + Math.floor(Math.random() * (height - 6));
      const size = 2 + Math.floor(Math.random() * 3);
      
      for (let y = centerY - size; y <= centerY + size; y++) {
        for (let x = centerX - size; x <= centerX + size; x++) {
          if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
            maze[y][x] = 0;
          }
        }
      }
    }
  }
  
  static createExtraConnections(maze, width, height) {
    // Añadir conexiones aleatorias para hacer el laberinto menos perfecto
    const connections = Math.floor((width * height) * 0.05);
    
    for (let i = 0; i < connections; i++) {
      const x = 1 + Math.floor(Math.random() * (width - 2));
      const y = 1 + Math.floor(Math.random() * (height - 2));
      
      if (maze[y][x] === 1) {
        // Verificar si abrir esta pared conectaría áreas
        const neighbors = [
          maze[y-1] ? maze[y-1][x] : 1,
          maze[y+1] ? maze[y+1][x] : 1,
          maze[y][x-1] || 1,
          maze[y][x+1] || 1
        ];
        
        const openNeighbors = neighbors.filter(cell => cell === 0).length;
        if (openNeighbors >= 2) {
          maze[y][x] = 0;
        }
      }
    }
  }
}

// Generar laberinto DOOM
const MAZE = MazeGenerator.generateDoomMaze(CONFIG.world.gridCols, CONFIG.world.gridRows);

// Asegurar spawn point libre
MAZE[3][3] = 0;
MAZE[3][4] = 0;
MAZE[4][3] = 0;
MAZE[4][4] = 0;

// Asegurar bordes cerrados
for (let i = 0; i < CONFIG.world.gridCols; i++) {
  MAZE[0][i] = 1;
  MAZE[CONFIG.world.gridRows - 1][i] = 1;
}
for (let i = 0; i < CONFIG.world.gridRows; i++) {
  MAZE[i][0] = 1;
  MAZE[i][CONFIG.world.gridCols - 1] = 1;
}

window.CONFIG = CONFIG;
window.MAZE = MAZE;
window.MazeGenerator = MazeGenerator;

console.log('✅ Configuración DOOM y laberinto generado');
console.log('🏗️ Laberinto:', CONFIG.world.gridCols + 'x' + CONFIG.world.gridRows);
console.log('🚪 Espacios libres:', MAZE.flat().filter(cell => cell === 0).length);
