// Como el libro de reglas del juego - aquí están todas las configuraciones
const CONFIG = {
  world: {
    gridRows: 25, // Cuántas filas tiene el laberinto (como una cuadrícula)
    gridCols: 25, // Cuántas columnas tiene el laberinto
    cellSize: 64, // Qué tan grande es cada casilla del mapa
    fov: Math.PI / 3, // Cuánto vemos a los lados (como un campo de visión de 60 grados)
    maxRenderDistance: 1000, // Qué tan lejos podemos ver
    wallHeight: 64 // Qué tan altas son las paredes
  },

  player: {
    health: 100, // Cuánta vida tiene nuestro héroe
    maxAmmo: 30, // Cuántas balas puede tener máximo
    speed: 120, // Qué tan rápido puede correr
    startX: 192, // Dónde empieza en el mapa (lado a lado) - como 3 casillas
    startZ: 192, // Dónde empieza en el mapa (adelante/atrás) - como 3 casillas
    startY: 32, // Qué tan alto está del suelo al empezar
    minCameraHeight: -30,  // Qué tan abajo puede mirar la cámara
    maxCameraHeight: 100,  // Qué tan arriba puede mirar la cámara
    cameraHeight: 32,      // Altura normal de los ojos
    minPitch: -Math.PI/3,  // Límite para mirar hacia abajo (como -60 grados)
    maxPitch: Math.PI/3,   // Límite para mirar hacia arriba (como 60 grados)
    pitch: 0               // Hacia dónde mira verticalmente (0 = horizonte)
  },

  controls: {
    mouseSensitivity: 0.2,              // Qué tan sensible es el mouse para apuntar
    mouseRotationSensitivity: 0.002,    // Qué tan sensible es para girar la vista
    rotationSpeed: 2.5,                 // Qué tan rápido giramos con las flechas
    pitchSpeed: 1.5,                    // Qué tan rápido miramos arriba/abajo con flechas
    mousePitchSensitivity: 0.001,       // Sensibilidad para mirar arriba/abajo con mouse
    crosshairPrecision: true,           // La cruceta sigue exactamente el mouse
    hideCursor: true,                   // Ocultar el cursor normal del mouse
    enableMouseCamera: true,            // Permitir controlar la cámara con el mouse
    enablePointerLock: true             // Bloquear el mouse en el juego como FPS
  },

  enemy: {
    health: 100, // Cuánta vida tiene cada enemigo
    speed: 40, // Qué tan rápido caminan los enemigos
    maxCount: 10, // Cuántos enemigos máximo puede haber al mismo tiempo
    spawnCooldown: 2500, // Cuánto tiempo esperar antes de crear un nuevo enemigo
    detectionRange: 300, // Qué tan lejos pueden ver a nuestro héroe
    size: 48, // Qué tan grandes son (ancho)
    heightMultiplier: 1.5625, // Cuánto más altos son (56.25% más altos)
    headHeight: 0.15, // La cabeza es el 15% de arriba del enemigo
    sprites: [ // Lista de imágenes para los enemigos
      'assets/images/noboa-presidencial.png', // Noboa en traje
      'assets/images/noboa-deportivo.png', // Noboa en ropa deportiva
      'assets/images/noboa-casual.png' // Noboa en ropa casual
    ]
  },

  bullet: {
    speed: 800, // Qué tan rápido vuelan las balas
    bodyDamage: 25, // Cuánto daño hacen las balas al cuerpo
    headDamage: 100, // Daño a la cabeza (mata instantáneamente)
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
    headshotDuration: 1500,
    headshotColor: '#FF0000',
    headshotFontSize: 48,
    headshotText: 'HEADSHOT!'
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
