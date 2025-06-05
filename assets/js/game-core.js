// Núcleo principal del juego - Coordinador de sistemas
window.GameCore = {
  initialized: false,
  gameStarted: false,

  init() {
    console.log('🎮 Núcleo del juego inicializando...');
    
    // Inicializar todos los sistemas en orden
    if (window.AssetManager) {
      window.AssetManager.init();
      console.log('✅ AssetManager inicializado');
    }
    
    if (window.PlayerSystem) {
      window.PlayerSystem.init();
    }
    
    if (window.Controls) {
      window.Controls.init();
      console.log('✅ Controls inicializado');
    }
    
    if (window.DoomRenderer) {
      window.DoomRenderer.init();
      console.log('✅ DoomRenderer inicializado');
    }
    
    if (window.Effects) {
      window.Effects.init();
      console.log('✅ Effects inicializado');
    }
    
    if (window.Weapons) {
      window.Weapons.init();
      console.log('✅ Weapons inicializado');
    }

    if (!window.player) {
      console.log('🎮 Creando jugador por defecto...');
      window.player = {
        x: 200,
        z: 200,
        y: 0,
        health: 100,
        angle: 0,
        pitch: 0,
        speed: 3,
        radius: 15
      };
    }
    
    // Asegurar que existe array de enemigos
    if (!window.enemies) {
      window.enemies = [];
    }
    
    this.initialized = true;
    console.log('✅ Núcleo del juego inicializado correctamente');
  },

  startGame() {
    console.log('🎮 Iniciando partida...');
    
    try {
      if (!this.initialized) {
        this.init();
      }
      
      // Verificar que CanvasSystem está disponible
      if (!window.CanvasSystem) {
        console.error('❌ CanvasSystem no disponible');
        return false;
      }
      
      this.gameStarted = true;
      
      // Crear enemigos básicos
      this.createBasicEnemies();
      
      console.log('✅ Partida iniciada correctamente');
      return true;
      
    } catch (error) {
      console.error('Error crítico al iniciar juego:', error);
      return false;
    }
  },

  createBasicEnemies() {
    console.log('🤖 Creando enemigos básicos...');
    
    window.enemies = [];
    const positions = [
      {x: 300, z: 100}, {x: 500, z: 150}, {x: 100, z: 400},
      {x: 600, z: 300}, {x: 200, z: 500}, {x: 450, z: 450}
    ];
    
    positions.forEach((pos, index) => {
      const types = ['casual', 'deportivo', 'presidencial'];
      const type = types[index % types.length];
      
      const enemy = {
        x: pos.x,
        z: pos.z,
        y: 0,
        type: type,
        health: 100,
        speed: 1 + Math.random(),
        dx: (Math.random() - 0.5) * 2,
        dz: (Math.random() - 0.5) * 2,
        lastMoveTime: Date.now(),
        radius: 12
      };
      
      window.enemies.push(enemy);
    });
    
    console.log(`✅ ${window.enemies.length} enemigos básicos creados`);
  },

  stopGame() {
    console.log('=== DETENIENDO JUEGO DESDE NÚCLEO ===');
    this.gameStarted = false;
    
    if (window.GameState) window.GameState.setActive(false);
    
    if (this.gameCanvas) {
      try {
        this.gameCanvas.remove();
        this.gameCanvas = null;
      } catch (error) {
        console.error('Error al remover canvas:', error);
      }
    }
    
    window.enemies = [];
    window.sparks = [];
    if (window.Controls) window.Controls.keys = {};
    
    console.log('Juego detenido desde núcleo');
  },

  preload() {
    console.log('🎮 GameCore preload ejecutado');
    if (window.AssetManager) {
      window.AssetManager.preloadAssets();
    }
  },

  update() {
    if (!this.gameStarted) return;

    try {
      // Actualizar controles PRIMERO
      if (window.InputHandler && typeof window.InputHandler.update === 'function') {
        window.InputHandler.update();
      }
      
      // Actualizar controles
      if (window.Controls && window.Controls.handleInput) {
        window.Controls.handleInput();
      }
      
      // Actualizar enemigos básicos
      if (window.enemies) {
        window.enemies.forEach(enemy => {
          // Movimiento simple
          if (Date.now() - enemy.lastMoveTime > 2000) {
            enemy.dx = (Math.random() - 0.5) * 2;
            enemy.dz = (Math.random() - 0.5) * 2;
            enemy.lastMoveTime = Date.now();
          }
          
          const newX = enemy.x + enemy.dx * enemy.speed;
          const newZ = enemy.z + enemy.dz * enemy.speed;
          
          if (window.Utils && !window.Utils.collides(newX, newZ)) {
            enemy.x = newX;
            enemy.z = newZ;
          } else {
            enemy.dx = -enemy.dx;
            enemy.dz = -enemy.dz;
          }
        });
      }
      
      // Actualizar efectos
      if (window.Effects && typeof window.Effects.update === 'function') {
        window.Effects.update();
      }
      
    } catch (error) {
      console.error('Error en update():', error);
      this.gameStarted = false;
    }
  },

  render() {
    if (!window.CanvasSystem) return;
    
    try {
      if (!this.gameStarted) {
        // Pantalla de espera
        window.CanvasSystem.background(50, 50, 70);
        window.CanvasSystem.fill(255, 255, 255);
        window.CanvasSystem.textAlign('center', 'middle');
        window.CanvasSystem.textSize(24);
        window.CanvasSystem.text('Preparando juego...', window.CanvasSystem.width/2, window.CanvasSystem.height/2 - 20);
        window.CanvasSystem.textSize(16);
        window.CanvasSystem.text('WASD para mover, Mouse para disparar', window.CanvasSystem.width/2, window.CanvasSystem.height/2 + 20);
        return;
      }
      
      // Usar el DoomRenderer para renderizado 3D
      if (window.DoomRenderer) {
        window.DoomRenderer.render();
      } else {
        // Fallback básico
        this.renderBasic();
      }
      
      // Renderizar efectos encima
      if (window.Effects && typeof window.Effects.render === 'function') {
        window.Effects.render();
      }
      
    } catch (error) {
      console.error('Error en render:', error);
      this.renderError();
    }
  },

  renderBasic() {
    // Renderizado básico de emergencia
    window.CanvasSystem.background(50, 50, 70);
    window.CanvasSystem.fill(255, 255, 255);
    window.CanvasSystem.textAlign('center', 'middle');
    window.CanvasSystem.textSize(20);
    window.CanvasSystem.text('Modo básico - DoomRenderer no disponible', window.CanvasSystem.width/2, window.CanvasSystem.height/2);
  },

  renderError() {
    window.CanvasSystem.background(100, 0, 0);
    window.CanvasSystem.fill(255, 255, 255);
    window.CanvasSystem.textAlign('center', 'middle');
    window.CanvasSystem.textSize(20);
    window.CanvasSystem.text('Error en renderizado', window.CanvasSystem.width/2, window.CanvasSystem.height/2);
  },

  gameOver() {
    console.log('💀 GAME OVER');
    this.gameStarted = false;
    
    // Mostrar pantalla de game over
    setTimeout(() => {
      window.CanvasSystem.background(0, 0, 0);
      window.CanvasSystem.fill(255, 0, 0);
      window.CanvasSystem.textAlign('center', 'middle');
      window.CanvasSystem.textSize(48);
      window.CanvasSystem.text('GAME OVER', window.CanvasSystem.width/2, window.CanvasSystem.height/2);
      
      window.CanvasSystem.fill(255, 255, 255);
      window.CanvasSystem.textSize(16);
      window.CanvasSystem.text('Presiona F5 para reiniciar', window.CanvasSystem.width/2, window.CanvasSystem.height/2 + 50);
    }, 100);
  },

  manualEnemySpawn() {
    console.log('🔧 SPAWN MANUAL DE EMERGENCIA ACTIVADO');
    
    const manualPositions = [
      [4, 4], [16, 4], [4, 16], [16, 16],
      [7, 7], [13, 13], [7, 13], [13, 7],
      [10, 4], [10, 16], [4, 10], [16, 10]
    ];
    
    const types = ['CASUAL', 'DEPORTIVO', 'PRESIDENCIAL'];
    
    manualPositions.forEach((pos, index) => {
      const x = pos[0] * GAME_CONFIG.cellSize;
      const z = pos[1] * GAME_CONFIG.cellSize;
      const type = types[index % types.length];
      
      try {
        if (window.Enemy) {
          const enemy = new window.Enemy(x, z, type);
          window.enemies.push(enemy);
          console.log(`🔧 Enemigo manual ${type} en (${pos[0]}, ${pos[1]})`);
        }
      } catch (error) {
        console.error(`Error en spawn manual ${index}:`, error);
      }
    });
    
    console.log(`🔧 Spawn manual completado: ${window.enemies.length} enemigos total`);
  },

  generateWorld() {
    console.log('🌍 Generando mundo...');
    
    // Usar el laberinto de Utils en lugar de generar uno nuevo
    if (window.Utils && typeof window.Utils.syncWithGlobalLabyrinth === 'function') {
      window.Utils.syncWithGlobalLabyrinth();
      console.log('✅ Usando laberinto desde Utils');
    } else if (window.MazeGenerator) {
      // Fallback: generar nuevo laberinto solo si Utils no está disponible
      window.labyrinth = window.MazeGenerator.generateMaze(
        window.GAME_CONFIG.gridCols, 
        window.GAME_CONFIG.gridRows
      );
    } else {
      // Último recurso: crear laberinto simple
      console.warn('⚠️ Ni Utils ni MazeGenerator disponibles, usando laberinto por defecto');
      this.createDefaultMaze();
    }
    
    // Verificar el laberinto
    this.validateLabyrinth();
    
    // Posicionar jugador en el centro
    this.setupPlayer();
    
    console.log('✅ Mundo generado correctamente');
  },
  
  createDefaultMaze() {
    const rows = window.GAME_CONFIG.gridRows;
    const cols = window.GAME_CONFIG.gridCols;
    
    window.labyrinth = Array(rows).fill().map(() => Array(cols).fill(1));
    
    // Crear pasillos básicos
    for (let y = 1; y < rows - 1; y += 2) {
      for (let x = 1; x < cols - 1; x++) {
        window.labyrinth[y][x] = 0; // Suelo transitable
      }
    }
    
    for (let x = 1; x < cols - 1; x += 2) {
      for (let y = 1; y < rows - 1; y++) {
        window.labyrinth[y][x] = 0; // Suelo transitable
      }
    }
  },
  
  validateLabyrinth() {
    if (!window.labyrinth) {
      console.error('❌ Laberinto no existe');
      return;
    }
    
    const rows = window.labyrinth.length;
    const cols = window.labyrinth[0].length;
    
    console.log(`🗺️ Laberinto: ${cols}x${rows}`);
    
    // Verificar que el centro está libre usando Utils si está disponible
    if (window.Utils && typeof window.Utils.validateLabyrinth === 'function') {
      window.Utils.validateLabyrinth();
    } else {
      // Validación básica
      const centerX = Math.floor(cols / 2);
      const centerY = Math.floor(rows / 2);
      
      if (window.labyrinth[centerY][centerX] !== 0) {
        console.warn('⚠️ Centro no está libre, corrigiendo...');
        window.labyrinth[centerY][centerX] = 0;
      }
    }
  },
  
  setupPlayer() {
    // SPAWN EN POSICIÓN ABSOLUTAMENTE SEGURA
    // Usar coordenadas del centro de una celda libre conocida
    const safeGridX = 10; // Centro del mapa
    const safeGridY = 7;  // Centro del mapa
    
    // Forzar que esta posición esté libre
    if (window.labyrinth) {
      window.labyrinth[safeGridY][safeGridX] = 0;
      // Limpiar área alrededor
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const y = safeGridY + dy;
          const x = safeGridX + dx;
          if (y >= 0 && y < window.labyrinth.length && 
              x >= 0 && x < window.labyrinth[0].length) {
            window.labyrinth[y][x] = 0;
          }
        }
      }
    }
    
    window.player = {
      x: safeGridX * window.GAME_CONFIG.cellSize + window.GAME_CONFIG.cellSize / 2,
      z: safeGridY * window.GAME_CONFIG.cellSize + window.GAME_CONFIG.cellSize / 2,
      angle: 0,
      pitch: 0,
      health: 100,
      maxHealth: 100
    };
    
    console.log(`👤 SPAWN FORZADO en grid (${safeGridX}, ${safeGridY})`);
    console.log(`👤 Posición en píxeles: (${window.player.x}, ${window.player.z})`);
    console.log(`🕳️ Celda: ${window.labyrinth[safeGridY][safeGridX]} (debe ser 0)`);
  }
};

console.log('GameCore cargado y disponible');
