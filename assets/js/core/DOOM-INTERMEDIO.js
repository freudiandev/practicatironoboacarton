// Variables globales para el juego
let GAME_MAZE; // Declaración anticipada

// Permitir reiniciar enemigos desde el botón flotante
if (typeof window !== 'undefined') {
  window.doomGame = window.doomGame || {};
  window.doomGame.respawnEnemies = function() {
    if (typeof initEnemies === 'function') initEnemies();
    if (typeof initPosters === 'function') initPosters();
    if (typeof renderEnemiesHTML === 'function') renderEnemiesHTML();
    if (typeof window.GAME !== 'undefined' && typeof window.GAME.ctx !== 'undefined') {
      render3D();
    }
    console.log('🔄 Enemigos y posters reiniciados');
  };
}
// ================================
// DIAGNÓSTICO AVANZADO DE SPRITES ENEMIGOS
// ================================
if (!window.ENEMY_SPRITE_DIAGNOSED) {
  window.ENEMY_SPRITE_DIAGNOSED = true;
  (function(){
    const tipos = ['casual','deportivo','presidencial'];
    if (!window.GAME) window.GAME = {};
    if (!window.GAME.enemySprites) window.GAME.enemySprites = {};
    if (!window.GAME.enemySpritesReady) window.GAME.enemySpritesReady = {};
    tipos.forEach(function(tipo) {
      let img = window.GAME.enemySprites[tipo];
      if (!img) {
        img = new window.Image();
      img.onload = function() {
        if (!window.GAME) window.GAME = {};
        if (!window.GAME.enemySprites) window.GAME.enemySprites = {};
        if (!window.GAME.enemySpritesReady) window.GAME.enemySpritesReady = {};
        window.GAME.enemySprites[tipo] = img;
        window.GAME.enemySpritesReady[tipo] = true;
        console.log(`[DIAG] onload '${tipo}':`, img.src, `(${img.naturalWidth}x${img.naturalHeight})`);
      };
      img.onerror = function(e) {
        if (!window.GAME) window.GAME = {};
        if (!window.GAME.enemySpritesReady) window.GAME.enemySpritesReady = {};
        window.GAME.enemySpritesReady[tipo] = false;
        console.error(`[DIAG] onerror '${tipo}':`, img.src, e);
      };
        img.src = `assets/images/noboa-${tipo}.png`;
        window.GAME.enemySprites[tipo] = img;
        window.GAME.enemySpritesReady[tipo] = false;
        console.log(`[DIAG] Creando sprite '${tipo}' con src:`, img.src);
      } else {
        console.log(`[DIAG] Sprite '${tipo}' ya existe, src:`, img.src);
        // Asegura que los handlers estén siempre presentes
        img.onload = function() {
          if (window.GAME && window.GAME.enemySprites && window.GAME.enemySpritesReady) {
            window.GAME.enemySprites[tipo] = img;
            window.GAME.enemySpritesReady[tipo] = true;
            console.log(`[DIAG] onload '${tipo}':`, img.src, `(${img.naturalWidth}x${img.naturalHeight})`);
          } else {
            console.warn(`[WARN] enemySprites o enemySpritesReady no existen al cargar '${tipo}'`);
          }
        };
        img.onerror = function(e) {
          if (window.GAME && window.GAME.enemySpritesReady) {
            window.GAME.enemySpritesReady[tipo] = false;
          }
          console.error(`[DIAG] onerror '${tipo}':`, img.src, e);
        };
      }
    });
    // Overlay visual en canvas
    function drawSpriteDiagOverlay() {
      try {
        const ctx = window.GAME && window.GAME.ctx;
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = '#222';
        ctx.fillRect(10, 10, 340, 90);
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = '#fff';
        ctx.fillText('DIAGNÓSTICO SPRITES PNG', 20, 30);
        tipos.forEach(function(tipo, i) {
          const img = window.GAME.enemySprites[tipo];
          const ready = window.GAME.enemySpritesReady[tipo];
          let status = ready ? '✅' : '❌';
          let dim = (img && img.naturalWidth) ? `${img.naturalWidth}x${img.naturalHeight}` : '0x0';
          ctx.fillStyle = ready ? '#06ffa5' : '#ff2222';
          ctx.fillText(`${status} ${tipo}: ${dim}`, 30, 55 + i*18);
        });
        ctx.restore();
      } catch(e) { console.error('[DIAG] Error overlay:', e); }
    }
    // Hook al render3D para overlay
    // Hook al render3D para overlay (solo asignación directa, sin defineProperty)
    const oldRender3D = window.render3D;
    window.render3D = function() {
      if (typeof oldRender3D === 'function') oldRender3D();
      drawSpriteDiagOverlay();
    };
    console.log('[DIAG] Diagnóstico avanzado de sprites PNG ACTIVADO');
  })();
}
// ================================
// SISTEMA ÚNICO Y ROBUSTO DE SPRITES Y ENEMIGOS
// ================================

if (!window.GAME) window.GAME = {};

// --- SPRITES ---
window.GAME.enemySprites = {};
window.GAME.enemySpritesReady = {};
window.GAME.allEnemySpritesReady = false;

window.GAME.initEnemySprites = function(callback) {
  const tipos = ['casual','deportivo','presidencial'];
  let readyCount = 0;
  let total = tipos.length;
  window.GAME.allEnemySpritesReady = false;
  tipos.forEach(tipo => {
    if (!window.GAME.enemySprites[tipo]) {
      const img = new window.Image();
      img.onload = function() {
        window.GAME.enemySpritesReady[tipo] = true;
        readyCount++;
        if (readyCount === total) {
          window.GAME.allEnemySpritesReady = true;
          if (typeof callback === 'function') callback();
        }
      };
      img.onerror = function() {
        window.GAME.enemySpritesReady[tipo] = false;
        console.error(`[SPRITE] Error al cargar: ${tipo} (${img.src})`);
      };
      img.src = `assets/images/noboa-${tipo}.png`;
      window.GAME.enemySprites[tipo] = img;
      window.GAME.enemySpritesReady[tipo] = false;
    } else {
      // Si ya existe, verificar si está cargado
      if (window.GAME.enemySprites[tipo].complete && window.GAME.enemySprites[tipo].naturalWidth > 0) {
        window.GAME.enemySpritesReady[tipo] = true;
        readyCount++;
        if (readyCount === total) {
          window.GAME.allEnemySpritesReady = true;
          if (typeof callback === 'function') callback();
        }
      }
    }
  });
};

// --- ENEMIGOS ---
window.GAME.enemies = [];
window.GAME.initEnemies = function() {
  // Esperar a que los sprites estén listos
  if (!window.GAME.allEnemySpritesReady) {
    window.GAME.initEnemySprites(() => window.GAME.initEnemies());
    return;
  }
  // Posiciones y tipos
  const enemyTypes = ['casual', 'deportivo', 'presidencial'];
    // Generar posiciones libres automáticamente para el tamaño del laberinto actual
    const mapa = window.GAME_MAZE;
    const libres = [];
    for (let y = 0; y < mapa.length; y++) {
      for (let x = 0; x < mapa[0].length; x++) {
        if (mapa[y][x] === 0) {
          libres.push({ x: x * GAME.tileSize + GAME.tileSize / 2, y: y * GAME.tileSize + GAME.tileSize / 2 });
        }
      }
    }
    
    // Distribuir muy pocos enemigos de manera espaciada por el mapa
    const shuffle = arr => arr.sort(() => Math.random() - 0.5);
    const cellsPerEnemy = 12; // Aún más espaciado entre enemigos
    const enemyCount = Math.min(5, Math.floor(libres.length / cellsPerEnemy)); // Máximo 5 enemigos
    
    // Obtener posiciones bien distribuidas
    const shuffledPositions = shuffle(libres);
    const enemyPositions = [];
    
    // Algoritmo de distribución: asegurar distancia mínima entre enemigos
    const minDistanceBetweenEnemies = GAME.tileSize * 10; // 10 tiles de distancia mínima
    
    for (let i = 0; i < shuffledPositions.length && enemyPositions.length < enemyCount; i++) {
      const pos = shuffledPositions[i];
      let tooClose = false;
      
      // Verificar si esta posición está demasiado cerca de otro enemigo
      for (let j = 0; j < enemyPositions.length; j++) {
        const existingPos = enemyPositions[j];
        const dx = existingPos.x - pos.x;
        const dy = existingPos.y - pos.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance < minDistanceBetweenEnemies) {
          tooClose = true;
          break;
        }
      }
      
      // Si esta posición está bien separada, usarla
      if (!tooClose) {
        enemyPositions.push(pos);
      }
    }
    
    // Crear los enemigos con las posiciones distribuidas
    window.GAME.enemies = enemyPositions.map(function(pos, i) {
      return {
        x: pos.x,
        y: pos.y,
        health: 100,
        type: enemyTypes[i % enemyTypes.length],
        lastHit: 0,
        id: `noboa_${i}_${enemyTypes[i % enemyTypes.length]}`,
        active: true,
        spawnTime: Date.now(),
        forceVisible: true,
        scale: 1.0,
        dir: Math.random() * 2 * Math.PI, // Dirección aleatoria inicial
        hitRadius: 72 // hitbox coherente con sprite de 144px
      };
    });
// --- MOVIMIENTO AUTOMÁTICO DE ENEMIGOS ---
setInterval(function() {
  if (!window.GAME || !window.GAME.enemies || !window.GAME_MAZE) return;
  const speed = 0.5; // Reducido drásticamente para mejor rendimiento
  
  // Solo procesar un subconjunto de enemigos por frame para ahorrar CPU
  const maxEnemiesPerFrame = 2;
  const activeEnemies = window.GAME.enemies.filter(e => e.active);
  const processEnemies = activeEnemies.slice(0, maxEnemiesPerFrame);
  
  processEnemies.forEach(enemy => {
    // Determinar si el enemigo debe perseguir al jugador
    const pursuePlayer = Math.random() < 0.01; // Reducido al 1% de probabilidad
    
    if (pursuePlayer && window.GAME.player) {
      // Calcular dirección hacia el jugador
      const dx = window.GAME.player.x - enemy.x;
      const dy = window.GAME.player.y - enemy.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist > 100 && dist < 500) { // Reducido de 800 a 500
        enemy.dir = Math.atan2(dy, dx);
        enemy.dir += (Math.random() - 0.5) * 0.1; // Reducida la aleatoriedad
      }
    }
    
    // Calcular siguiente posición
    const nextX = enemy.x + Math.cos(enemy.dir) * speed;
    const nextY = enemy.y + Math.sin(enemy.dir) * speed;
    
    // Intentar mover en X
    const canMoveX = isWalkable(nextX, enemy.y);
    if (canMoveX) {
      enemy.x = nextX;
    } else {
      enemy.dir = Math.PI - enemy.dir;
    }
    
    // Intentar mover en Y
    const canMoveY = isWalkable(enemy.x, nextY);
    if (canMoveY) {
      enemy.y = nextY;
    } else {
      enemy.dir = -enemy.dir;
    }
  });
}, 100); // Aumentado a 100ms (10 fps) en lugar de 40ms (25 fps)
  window.GAME.enemyManager = {
    enemies: window.GAME.enemies,
    log: function(msg) { console.log('[EnemyManager]', msg); }
  };
  console.log('👾 Enemigos Noboa inicializados:', window.GAME.enemies.length);
};

// --- RENDERIZADO DE ENEMIGOS ---
window.GAME.renderEnemies = function(ctx) {
  if (!window.GAME.allEnemySpritesReady) {
    ctx.save();
    ctx.fillStyle = '#ff006e';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Cargando sprites de enemigos...', 20, 40);
    ctx.restore();
    return;
  }
  
  // Constantes para renderizado de enemigos
  const FOV = window.GAME.player.fov || Math.PI / 3;
  const canvas = ctx.canvas;
  const player = window.GAME.player;
  const spriteSize = 0.5; // Factor de tamaño de los sprites
  const maxRenderDistance = 10; // Distancia máxima para renderizar
  
  // Ordenamos enemigos por distancia (los más lejanos primero para Z-order correcto)
  const enemies = [...(window.GAME.enemies || [])].sort((a, b) => {
    if (!a.active || !b.active) return 0;
    
    const distA = Math.pow(a.x - player.x, 2) + Math.pow(a.y - player.y, 2);
    const distB = Math.pow(b.x - player.x, 2) + Math.pow(b.y - player.y, 2);
    return distB - distA;  // Orden descendente (lejanos primero)
  });
  
  // Obtenemos las imágenes de sprite
  const spriteImages = {
    'casual': window.GAME.enemySprites.casual,
    'deportivo': window.GAME.enemySprites.deportivo,
    'presidencial': window.GAME.enemySprites.presidencial
  };
  
  // Renderizamos cada enemigo
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    if (!enemy.active) continue;
    
    // Cálculos simplificados de distancia
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // No renderizar enemigos demasiado lejanos
    if (distance > maxRenderDistance) continue;
    
    // Calculamos el ángulo relativo
    let angle = Math.atan2(dy, dx) - player.angle;
    // Normalizamos el ángulo
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    
    // Si está fuera del campo de visión, no lo renderizamos
    if (Math.abs(angle) > FOV / 2) continue;
    
    // Calculamos posición en pantalla
    const screenX = (0.5 + angle / FOV) * canvas.width;
    
    // Tamaño proporcional del sprite basado en la distancia
    const scale = 0.3; // Factor de escala reducido
    const spriteHeight = (spriteSize / distance * canvas.height) * scale;
    const spriteWidth = spriteHeight * 0.6; // Proporción más estrecha
    
    // Obtenemos la imagen según tipo
    const spriteImage = spriteImages[enemy.type] || spriteImages.casual;
    
    // Posicionamiento vertical para que parezcan estar de pie
    const screenY = canvas.height / 2 - spriteHeight / 2 + (canvas.height * 0.05);
    
    // Verificamos colisión con paredes
    let visible = true;
    const rayStep = 0.1;
    let checkX = player.x;
    let checkY = player.y;
    const rayDirX = (enemy.x - player.x) / distance;
    const rayDirY = (enemy.y - player.y) / distance;
    
    // Lanzamos un rayo hacia el enemigo
    for (let j = 0; j < distance; j += rayStep) {
      checkX += rayDirX * rayStep;
      checkY += rayDirY * rayStep;
      const mapX = Math.floor(checkX);
      const mapY = Math.floor(checkY);
      
      if (mapX >= 0 && mapY >= 0 && 
          mapX < window.GAME.map.width && mapY < window.GAME.map.height) {
        if (window.GAME.map.data[mapY][mapX] === 1) {
          visible = false;
          break;
        }
      }
    }
    
    // Solo dibujamos si es visible
    if (visible && spriteImage) {
      try {
        ctx.drawImage(
          spriteImage,
          screenX - spriteWidth / 2,
          screenY,
          spriteWidth,
          spriteHeight
        );
      } catch (err) {
        // Fallback si hay error con la imagen
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(screenX - spriteWidth / 2, screenY, spriteWidth, spriteHeight);
      }
    }
  };
};
// ================================
// DOOM INTERMEDIO - SIMPLE + ENEMIGOS + POSTERS
// Raycasting simple con elementos del juego
// ================================

console.log('🎮 DOOM INTERMEDIO - Simple + Enemigos + Posters');

// ================================
// CONFIGURACIÓN MEJORADA - BAJA RESOLUCIÓN PARA RENDIMIENTO
// ================================
const GAME = {
    // Canvas - RESOLUCIÓN REDUCIDA
    canvas: null,
    ctx: null,
    width: 320,   // RESOLUCIÓN ULTRA-BAJA para mejor rendimiento
    height: 240,   // RESOLUCIÓN ULTRA-BAJA para mejor rendimiento
    
    // Mundo - Dimensiones corregidas y sincronizadas con el mapa real
    mapWidth: 14,  // 14 columnas (ancho)
    mapHeight: 10, // 10 filas (altura)
    tileSize: 50, // Sincronizado con cellSize del laberinto definitivo
    
    // Jugador - La posición se inicializa dinámicamente usando la zona de spawneo
    player: {
        x: 320, // Temporal - se actualizará con findPlayerSpawnPosition()
        y: 288, // Temporal - se actualizará con findPlayerSpawnPosition()
        angle: 0,
        speed: 3,
        rotSpeed: 0.1,
        health: 100,
        ammo: 50
    },
    
    // Raycasting - RESOLUCIÓN REDUCIDA
    fov: Math.PI / 3,
    numRays: 160, // REDUCIDO drásticamente de 640 a 160 para rendimiento máximo
    maxDistance: 500, // REDUCIDO para mejor rendimiento
    
    // Control
    keys: {},
    mouseLocked: false,
    
    // Estado
    running: false,
    score: 0,
    
    // Elementos del juego
    enemies: [],
    bullets: [],
    posters: [],
    
    // Configuración debug y visualización
    config: {
        showHitboxes: false,         // Mostrar hitboxes de enemigos
        showEnemyIDs: false,         // Mostrar IDs de enemigos
        showFPS: true,               // Mostrar FPS
        showMinimap: true,           // Mostrar minimapa
        debug: false                 // Modo debug general
    }
};

// ================================
// MAPA TIPO CASTILLO CON CUARTOS - DISEÑO ESTRUCTURADO
// ================================
// 0 = Pasillo/Espacio libre
// 1 = Pared
// 2 = Zona de spawneo del jugador
const MAP = [
    // Fila 0 - Muro perimetral
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    // Fila 1 - Entrada principal
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
    // Fila 2 - Corredor principal horizontal
    [1,0,1,0,1,0,1,1,1,0,0,1,1,1,0,1,0,1,0,1],
    // Fila 3 - Cuarto A (izquierda) | Pasillo central | Cuarto B (derecha)
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
    // Fila 4 - Divisiones de cuartos
    [1,0,1,1,0,1,1,0,1,1,1,1,0,1,1,0,1,1,0,1],
    // Fila 5 - Cuartos internos
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    // Fila 6 - Corredor central vertical
    [1,1,1,0,1,1,1,0,0,0,0,0,0,1,1,1,0,1,1,1],
    // Fila 7 - Zona de spawneo especial
    [1,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,1],
    // Fila 8 - Zona de spawneo ampliada
    [1,0,1,0,0,0,0,0,2,2,2,2,0,0,0,0,0,1,0,1],
    // Fila 9 - Centro del castillo
    [1,0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,1],
    // Fila 10 - Pasillos hacia cuartos inferiores
    [1,0,1,1,0,1,1,0,0,2,2,0,0,1,1,0,1,1,0,1],
    // Fila 11 - Cuartos inferiores
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    // Fila 12 - Separaciones de cuartos inferiores
    [1,0,1,0,1,1,1,0,0,1,1,0,0,1,1,1,0,1,0,1],
    // Fila 13 - Cuartos finales
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
    // Fila 14 - Corredor de salida
    [1,0,0,0,1,0,1,1,1,0,0,1,1,1,0,1,0,0,0,1],
    // Fila 15 - Muro perimetral final
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Inicializar GAME_MAZE con el mapa principal
if (typeof window !== 'undefined') {
  window.GAME_MAZE = MAP;
  console.log('🗺️ Mapa del castillo inicializado con dimensiones:', window.GAME_MAZE.length + 'x' + window.GAME_MAZE[0].length);
  console.log('🧱 La renderización ahora depende directamente del mapa de 0 y 1 para definir paredes y pasillos');
}

// Definir la zona de spawneo del jugador
const PLAYER_SPAWN_AREA = {
    x: 10, // Coordenada X del centro de spawneo (en tiles)
    y: 9,  // Coordenada Y del centro de spawneo (en tiles) 
    radius: 2 // Radio de la zona de spawneo
};

// Función para verificar si una celda es zona de spawneo
function isPlayerSpawnArea(x, y) {
    return MAP[y] && (MAP[y][x] === 2 || MAP[y][x] === 0);
}

// Función mejorada para encontrar posición de spawneo del jugador
function findPlayerSpawnPosition() {
    console.log('🏰 Buscando posición de spawneo en zona designada del castillo...');
    
    // Intentar primero las celdas marcadas como zona de spawneo (valor 2)
    for (let y = 0; y < MAP.length; y++) {
        for (let x = 0; x < MAP[y].length; x++) {
            if (MAP[y][x] === 2) {
                const worldX = (x + 0.5) * 32; // Centro de la celda en coordenadas del mundo
                const worldY = (y + 0.5) * 32;
                console.log(`✅ Spawneo del jugador en zona designada: tile(${x},${y}) -> mundo(${worldX},${worldY})`);
                return { x: worldX, y: worldY };
            }
        }
    }
    
    // Fallback: buscar cualquier celda libre cerca del centro
    console.log('🔄 No se encontró zona de spawneo marcada, buscando cerca del centro...');
    const centerX = Math.floor(MAP[0].length / 2);
    const centerY = Math.floor(MAP.length / 2);
    
    for (let radius = 1; radius <= 5; radius++) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const checkX = centerX + dx;
                const checkY = centerY + dy;
                
                if (checkY >= 0 && checkY < MAP.length && 
                    checkX >= 0 && checkX < MAP[checkY].length && 
                    MAP[checkY][checkX] === 0) {
                    
                    const worldX = (checkX + 0.5) * 32;
                    const worldY = (checkY + 0.5) * 32;
                    console.log(`✅ Spawneo del jugador (fallback): tile(${checkX},${checkY}) -> mundo(${worldX},${worldY})`);
                    return { x: worldX, y: worldY };
                }
            }
        }
    }
    
    // Último recurso: esquina conocida como segura
    console.log('⚠️ Usando posición de spawneo de emergencia');
    return { x: 64, y: 64 };
}

function init() {
    console.log('🚀 Inicializando DOOM intermedio...');
    
    try {
        // Asegurarnos de que GAME ya esté definido antes de usarlo
        if (typeof window !== 'undefined') {
            // Crear canvas
            const canvas = document.getElementById('gameCanvas');
            if (canvas) {
                GAME.canvas = canvas;
                GAME.canvas.width = GAME.width;
                GAME.canvas.height = GAME.height;
                GAME.ctx = GAME.canvas.getContext('2d');
                
                // Hacer globalmente accesible
                window.GAME = GAME;
                
                // Estilo del canvas
                GAME.canvas.style.border = '2px solid #333';
                GAME.canvas.style.margin = '10px auto';
                GAME.canvas.style.background = '#000';
                
                // Calcular posición inicial del jugador
                const spawnPos = findPlayerSpawnPosition();
                GAME.player.x = spawnPos.x;
                GAME.player.y = spawnPos.y;
                
                // Inicializar elementos
                if (typeof initEnemies === 'function') initEnemies();
                if (typeof initPosters === 'function') initPosters();
                if (typeof setupControls === 'function') setupControls();
                
                // NO INICIAR EL BUCLE AUTOMÁTICAMENTE
                GAME.running = false;
                
                console.log('✅ DOOM intermedio listo - Esperando inicio desde menú');
            } else {
                console.error('❌ No se encontró el canvas del juego');
            }
        } else {
            console.error('❌ Error al inicializar el juego: window no está definido');
        }
    } catch (error) {
        console.error('❌ Error al inicializar DOOM:', error);
    }
}

// ================================
// INICIAR JUEGO (DESDE MENÚ)
// ================================
function startGame() {
    console.log('🎮 Iniciando juego desde menú...');
    
    try {
        // Verificar que esté inicializado
        if (!window.GAME || !window.GAME.canvas || !window.GAME.ctx) {
            console.log('⚠️ Inicializando primero...');
            init();
            
            // Si sigue sin estar inicializado, salir
            if (!window.GAME || !window.GAME.canvas || !window.GAME.ctx) {
                console.error('❌ No se pudo inicializar el juego');
                return;
            }
        }
        
        // Reinicializar enemigos y posters cada vez que se inicia el juego
        if (typeof initEnemies === 'function') initEnemies();
        if (typeof initPosters === 'function') initPosters();
        
        // Inicializar posición del jugador usando la zona de spawneo específica
        const spawnPos = findPlayerSpawnPosition();
        window.GAME.player.x = spawnPos.x;
        window.GAME.player.y = spawnPos.y;
        window.GAME.player.angle = 0; // Mirando hacia el norte inicialmente
        console.log(`🏰 Jugador spawneado en zona del castillo: (${spawnPos.x}, ${spawnPos.y})`);
        
        // Iniciar bucle del juego
        window.GAME.running = true;
        gameLoop();
        console.log('✅ Juego iniciado correctamente');
    } catch (error) {
        console.error('❌ Error al iniciar el juego:', error);
    }
}

// ================================
// PANTALLA DE ESPERA
// ================================
function renderWaitingScreen() {
    if (!window.GAME || !window.GAME.ctx) return;
    
    const ctx = window.GAME.ctx;
    
    // Limpiar
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, GAME.width, GAME.height);
    
    // Título
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('DOOM: NOBOA DE CARTÓN', GAME.width/2, GAME.height/2 - 50);
    
    // Instrucciones
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.fillText('Presiona "INICIAR JUEGO" en el menú', GAME.width/2, GAME.height/2);
    ctx.fillText('para comenzar a jugar', GAME.width/2, GAME.height/2 + 25);
    
    // Mira
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(GAME.width/2 - 10, GAME.height/2 + 80);
    ctx.lineTo(GAME.width/2 + 10, GAME.height/2 + 80);
    ctx.moveTo(GAME.width/2, GAME.height/2 + 70);
    ctx.lineTo(GAME.width/2, GAME.height/2 + 90);
    ctx.stroke();
    
    console.log('🎨 Pantalla de espera renderizada');
}

// ================================
// INICIALIZAR ENEMIGOS (OPTIMIZADO PARA EL NUEVO MAPA CASTILLO)
// ================================
function initEnemies() {
    console.log('👾 Inicializando enemigos en el castillo...');
    
    // Usar los 3 sprites PNG de Noboa y crear enemigos grandes y visibles
    const enemyTypes = ['casual', 'deportivo', 'presidencial'];
    
    // Usar el mapa actualizado
    const mapa = MAP;
    const libres = [];
    
    // Buscar posiciones libres evitando la zona de spawneo del jugador
    for (let y = 0; y < mapa.length; y++) {
        for (let x = 0; x < mapa[y].length; x++) {
            // Solo usar celdas libres (0) que NO sean zona de spawneo del jugador (2)
            if (mapa[y][x] === 0) {
                // Verificar que no esté demasiado cerca de la zona de spawneo
                const distanceFromSpawn = Math.sqrt(
                    Math.pow(x - PLAYER_SPAWN_AREA.x, 2) + 
                    Math.pow(y - PLAYER_SPAWN_AREA.y, 2)
                );
                
                // Solo agregar si está fuera del radio de spawneo del jugador
                if (distanceFromSpawn > PLAYER_SPAWN_AREA.radius + 1) {
                    libres.push({ 
                        x: x * GAME.tileSize + GAME.tileSize / 2, 
                        y: y * GAME.tileSize + GAME.tileSize / 2,
                        tileX: x,
                        tileY: y
                    });
                }
            }
        }
    }
    
    console.log(`🏰 Posiciones libres para enemigos encontradas: ${libres.length} (excluyendo zona de spawneo)`);
    
    // Elegir hasta 15 posiciones aleatorias para los enemigos (más enemigos para el mapa más grande)
    const shuffle = arr => arr.sort(() => Math.random() - 0.5);
    const enemyPositions = shuffle(libres).slice(0, 15);
    
    GAME.enemies = enemyPositions.map(function(pos, i) {
        return {
            x: pos.x,
            y: pos.y,
            health: 100,
            type: enemyTypes[i % enemyTypes.length],
            lastHit: 0,
            id: `noboa_${i}_${enemyTypes[i % enemyTypes.length]}`,
            active: true,
            spawnTime: Date.now(),
            forceVisible: true,
            scale: 5.0,
            tileX: pos.tileX,
            tileY: pos.tileY
        };
    });
    
    // DEBUG: Mostrar en consola las posiciones de los enemigos
    console.log('👾 Enemigos Noboa inicializados:', GAME.enemies.length);
    GAME.enemies.forEach((e, idx) => {
        console.log(`Enemigo #${idx}: tile(${e.tileX},${e.tileY}) -> mundo(${e.x}, ${e.y}) tipo: ${e.type}`);
    });
    
    // Forzar renderizado HTML de enemigos tras inicialización
    if (typeof renderEnemiesHTML === 'function') renderEnemiesHTML();
    // Cargar sprites PNG de Noboa con control de carga asíncrona (mantener por compatibilidad)
    var enemySprites = {};
    var spritesReady = { casual: false, deportivo: false, presidencial: false };
    var spritesLoadedCount = 0;
    var totalSprites = 3;
    function spriteLoaded(type) {
        spritesReady[type] = true;
        spritesLoadedCount++;
        console.log(`✅ Sprite '${type}' cargado correctamente.`);
        if (spritesLoadedCount === totalSprites) {
            GAME.allEnemySpritesReady = true;
            console.log('✅ Todos los sprites de enemigos están listos para renderizar.');
        }
    }
    function spriteError(type, img) {
        spritesReady[type] = false;
        console.error(`❌ Error cargando sprite '${type}': src=${img.src}`);
    }
    ['casual','deportivo','presidencial'].forEach(function(type) {
        var img = new Image();
        img.onload = function() { spriteLoaded(type); };
        img.onerror = function() { spriteError(type, img); };
        if(type==='casual') img.src = 'assets/images/noboa-casual.png';
        if(type==='deportivo') img.src = 'assets/images/noboa-deportivo.png';
        if(type==='presidencial') img.src = 'assets/images/noboa-presidencial.png';
        enemySprites[type] = img;
    });
    GAME.enemySprites = enemySprites;
    GAME.enemySpritesReady = spritesReady;
    GAME.allEnemySpritesReady = false;
    console.log('🎯 Tipos de Noboa disponibles:', enemyTypes);
}

// ================================
// INICIALIZAR POSTERS
// ================================
function initPosters() {
    GAME.posters = [];
    for (let y = 0; y < GAME.mapHeight; y++) {
        for (let x = 0; x < GAME.mapWidth; x++) {
            const tile = MAP[y][x];
            if (tile >= 2 && tile <= 7) {
                GAME.posters.push({
                    x: x * GAME.tileSize + GAME.tileSize/2,
                    y: y * GAME.tileSize + GAME.tileSize/2,
                    type: tile,
                    found: false
                });
            }
        }
    }
    console.log('🖼️ Posters inicializados:', GAME.posters.length);
}

// ================================
// CONTROLES
// ================================
// Los controles y listeners de teclado/mouse han sido centralizados en INICIALIZADOR-CONTROLES-POST-DOOM.js
// Esta función queda vacía para evitar conflictos y duplicidad.
function setupControls() {
    // Control centralizado en INICIALIZADOR-CONTROLES-POST-DOOM.js
}

// Cargar sprites y overlays de enemigos
GAME.textOverlays = [];

// ================================
// ACTUALIZAR JUGADOR
// ================================
function updatePlayer() {
    const player = GAME.player;
    let moveX = 0;
    let moveY = 0;
    
    // Movimiento y rotación del jugador ahora se controlan desde INICIALIZADOR-CONTROLES-POST-DOOM.js
    // Sistema de movimiento DESHABILITADO - Se usa el de index.html con WorldPhysics
    // para evitar conflictos y garantizar colisión robusta
    
    // Movimiento deshabilitado: el sistema robusto de index.html maneja todo
    // const newX = player.x + moveX;
    // const newY = player.y + moveY;
    // if (isWalkable(newX, player.y)) player.x = newX;
    // if (isWalkable(player.x, newY)) player.y = newY;
    
    // Verificar colisión con posters
    checkPosterCollision();
    
    // Verificar colisión con enemigos
    checkEnemyCollision();
}

// ================================
// VERIFICAR COLISIÓN CON POSTERS
// ================================
function checkPosterCollision() {
    GAME.posters.forEach(poster => {
        const dx = poster.x - GAME.player.x;
        const dy = poster.y - GAME.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 40 && !poster.found) {
            poster.found = true;
            GAME.score += 50;
            showPosterMessage(poster.type);
        }
    });
}

// ================================
// MOSTRAR MENSAJE DE POSTER
// ================================
function showPosterMessage(type) {
    const data = POSTER_DATA[type];
    if (data) {
        console.log(`🖼️ Poster encontrado: ${data.text.replace('\n', ' ')}`);
        // Aquí podrías mostrar un overlay temporal
    }
}

// ================================
// SISTEMA DE DISPAROS
// ================================
function shoot() {
    if (GAME.player.ammo <= 0) return;
    
    GAME.bullets.push({
        x: GAME.player.x,
        y: GAME.player.y,
        angle: GAME.player.angle,
        speed: 8,
        distance: 0
    });
    
    GAME.player.ammo--;
    console.log('💥 ¡Disparo! Munición:', GAME.player.ammo);
}

// ================================
// ACTUALIZAR BALAS con headshot
// ================================
function updateBullets() {
    GAME.bullets = GAME.bullets.filter(function(bullet) {
        bullet.x += Math.cos(bullet.angle) * bullet.speed;
        bullet.y += Math.sin(bullet.angle) * bullet.speed;
        bullet.distance += bullet.speed;
        if (bullet.distance > 500) return false;
        if (!isWalkable(bullet.x, bullet.y)) return false;
        for (var i = 0; i < GAME.enemies.length; i++) {
            var enemy = GAME.enemies[i];
            var dx = enemy.x - bullet.x;
            var dy = enemy.y - bullet.y;
            var dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < GAME.tileSize/2) {
                // headshot zona 15% superior
                var headThresh = enemy.y - GAME.tileSize/2 + GAME.tileSize*0.15;
                if (bullet.y < headThresh) {
                    enemy.health -= enemy.health; // kill
                    GAME.textOverlays.push({text:'HEADSHOT', x:bullet.x, y:bullet.y, timer:30});
                } else {
                    enemy.health -= 25;
                }
                if (enemy.health <= 0) {
                    GAME.enemies.splice(i,1);
                }
                return false;
            }
        }
        return true;
    });
}

// ================================
// VERIFICAR SI ES CAMINABLE
// ================================
function isWalkable(x, y) {
    // Verificación de parámetros
    if (x === undefined || y === undefined) {
        console.error("❌ Error en isWalkable: coordenadas indefinidas");
        return false;
    }
    
    // Unificar con la lógica robusta de colisión global
    if (window.WorldPhysics && typeof window.WorldPhysics.checkCollision === 'function') {
        return !window.WorldPhysics.checkCollision(x, y);
    }
    
    // Fallback legacy (por si no está cargado WorldPhysics)
    // Aplicamos un margen de colisión para evitar atravesar paredes
    const COLLISION_MARGIN = 0.2; // Margen reducido para colisión precisa
    
    // Obtener mapa
    const mapa = window.GAME_MAZE;
    if (!mapa) return false;
    
    // Verificar el punto central y puntos alrededor (con margen)
    const positions = [
        {x: x, y: y},                             // Centro
        {x: x + COLLISION_MARGIN, y: y},          // Derecha
        {x: x - COLLISION_MARGIN, y: y},          // Izquierda
        {x: x, y: y + COLLISION_MARGIN},          // Abajo
        {x: x, y: y - COLLISION_MARGIN},          // Arriba
        {x: x + COLLISION_MARGIN, y: y + COLLISION_MARGIN}, // Esquina inferior derecha
        {x: x - COLLISION_MARGIN, y: y + COLLISION_MARGIN}, // Esquina inferior izquierda
        {x: x + COLLISION_MARGIN, y: y - COLLISION_MARGIN}, // Esquina superior derecha
        {x: x - COLLISION_MARGIN, y: y - COLLISION_MARGIN}  // Esquina superior izquierda
    ];
    
    // Verificar todos los puntos contra el mapa
    for (const pos of positions) {
        const mapX = Math.floor(pos.x / GAME.tileSize);
        const mapY = Math.floor(pos.y / GAME.tileSize);
        
        // Usar siempre GAME_MAZE para la colisión
        const mapa = window.GAME_MAZE;
        
        // Validación básica del mapa
        if (!mapa || !Array.isArray(mapa) || !mapa.length) {
            console.error("❌ Error crítico: GAME_MAZE no está definido o no es un array válido");
            return false;
        }
        
        const mapW = mapa[0].length;
        const mapH = mapa.length;
        
        // Verificar límites del mapa
        if (mapX < 0 || mapX >= mapW || mapY < 0 || mapY >= mapH) {
            return false;
        }
        
        // Verificar si es una pared (valor 1)
        if (mapa[mapY][mapX] === 1) {
            return false;
        }
    }
    
    // Si todos los puntos son válidos, es caminable
    return true;
}

// ================================
// RAYCASTING - VERSIÓN HD MEJORADA
// ================================
function castRay(angle) {
    const stepSize = 0.05; // Reducido para mejor precisión
    let distance = 0;
    let hitWall = false;
    let wallType = 1;
    const rayDirX = Math.cos(angle);
    const rayDirY = Math.sin(angle);
    let hitX, hitY;
    
    // Usar siempre GAME_MAZE para la renderización
    const mapa = window.GAME_MAZE;
    const mapW = mapa[0].length;
    const mapH = mapa.length;
    
    while (!hitWall && distance < GAME.maxDistance) {
        distance += stepSize;
        const testX = GAME.player.x + rayDirX * distance;
        const testY = GAME.player.y + rayDirY * distance;
        const mapX = Math.floor(testX);
        const mapY = Math.floor(testY);
        
        // Verificar límites del mapa
        if (mapX < 0 || mapX >= mapW || mapY < 0 || mapY >= mapH) {
            hitWall = true;
            distance = GAME.maxDistance;
            hitX = mapX; hitY = mapY;
        } else {
            // Verificar colisión con pared basándose exclusivamente en el valor del mapa
            const tile = mapa[mapY][mapX];
            if (tile === 1) { // Solo 1 es pared sólida
                hitWall = true;
                wallType = tile;
                hitX = mapX; hitY = mapY;
            }
        }
    }
    
    // Return the ray information
    return {
        distance: distance,
        type: hitWall ? 'wall' : 'none',
        wallType: wallType,
        hitX: hitX,
        hitY: hitY
    };
}

// ================================
// RENDERIZAR 3D - VERSIÓN HD CON EFECTOS MEJORADOS
// ================================
function render3D() {
    const ctx = GAME.ctx;
    
    // OPTIMIZACIÓN: Activar doble buffer para mejor rendimiento
    ctx.imageSmoothingEnabled = false; // Desactivar suavizado para estilo pixelado y mejor rendimiento
    
    // Limpiar canvas con mejor resolución
    ctx.clearRect(0, 0, GAME.width, GAME.height);
    
    // CIELO VAPORWAVE HD con gradiente mejorado
    const skyGradient = ctx.createLinearGradient(0, 0, 0, GAME.height / 2);
    skyGradient.addColorStop(0, '#4a148c');  // Morado más oscuro arriba
    skyGradient.addColorStop(0.7, '#8338ec'); // Morado medio
    skyGradient.addColorStop(1, '#ab47bc');   // Morado más claro abajo
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, GAME.width, GAME.height / 2);
    
    // PISO VAPORWAVE HD con gradiente mejorado y grilla
    const floorGradient = ctx.createLinearGradient(0, GAME.height / 2, 0, GAME.height);
    floorGradient.addColorStop(0, '#2a2a2a'); // Gris oscuro arriba (para mejor visibilidad)
    floorGradient.addColorStop(0.5, '#1a1a1a'); // Gris medio 
    floorGradient.addColorStop(1, '#0a0a0a');   // Negro abajo
    ctx.fillStyle = floorGradient;
    ctx.fillRect(0, GAME.height / 2, GAME.width, GAME.height / 2);
    
    // Añadir grilla al piso para mejor percepción de profundidad
    renderVaporwaveGrid(ctx);
    
    // Raycasting HD - Configuración optimizada
    const rayStepAngle = GAME.fov / GAME.numRays;
    const columnWidth = GAME.width / GAME.numRays;
    
    // Optimización: ajuste de resolución para mejor rendimiento
    const renderSkip = 2; // Renderizar cada 2 columnas para un buen balance entre calidad y rendimiento
    
    for (let i = 0; i < GAME.numRays; i += renderSkip) {
        const rayAngle = GAME.player.angle - GAME.fov / 2 + i * rayStepAngle;
        const ray = castRay(rayAngle);
        const correctedDistance = ray.distance * Math.cos(rayAngle - GAME.player.angle);
        const wallHeight = (GAME.tileSize / correctedDistance) * (GAME.height / 2);
        const wallTop = (GAME.height - wallHeight) / 2;
        if (ray.type === 'wall') {
            // Renderizar columna más ancha para compensar el skip
            renderVaporwaveWallHD(ctx, i * columnWidth, wallTop, columnWidth * renderSkip, wallHeight, ray.wallType, correctedDistance);
        }
    }
    
    // Renderizar sprites con mejor calidad
    renderSpritesHD();

    // --- PARCHE: Renderizado de enemigos encapsulados ---
    if (window.GAME && window.GAME.renderEnemies && window.GAME.ctx) {
        window.GAME.renderEnemies(window.GAME.ctx);
    }
    // --- FIN PARCHE ---

    // HUD mejorado
    drawVaporwaveHUDHD();
}

// ================================
// GRILLA VAPORWAVE PARA EL PISO
// ================================
function renderVaporwaveGrid(ctx) {
    // Añadir grid al piso para mejor percepción de profundidad
    // Usando menos líneas para mejorar rendimiento
    const gridSize = 48; // Tamaño más grande para menos líneas
    ctx.strokeStyle = 'rgba(60, 60, 60, 0.15)'; // Líneas más sutiles
    ctx.lineWidth = 0.5;
    
    // Dibujar solo algunas líneas horizontales para dar sensación de profundidad
    for (let y = GAME.height/2 + gridSize; y < GAME.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(GAME.width, y);
        ctx.stroke();
    }
    
    // Menos líneas verticales
    const verticalLines = 6; // Reducido de 10 a 6
    const spacing = GAME.width / verticalLines;
    
    for (let x = 0; x < GAME.width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, GAME.height/2);
        ctx.lineTo(x, GAME.height);
        ctx.stroke();
    }
}

// ================================
// RENDERIZAR PAREDES VAPORWAVE HD
// ================================
function renderVaporwaveWallHD(ctx, x, wallTop, width, height, wallType, distance) {
    const brightness = Math.max(0.3, 1 - distance / GAME.maxDistance);
    
    // Paleta de colores vaporwave HD mejorada
    const vaporwaveColors = [
        '#ff006e', // Rosa neón
        '#8338ec', // Morado
        '#06ffa5', // Verde cyan
        '#00f5ff', // Cyan brillante
        '#ff9f1c', // Amarillo neón
        '#ff073a', // Rojo neón
        '#ffbe0b'  // Dorado neón
    ];
    
    const baseColor = vaporwaveColors[wallType % vaporwaveColors.length];
    
    // Crear gradiente vertical para efecto 3D mejorado
    const wallGradient = ctx.createLinearGradient(0, wallTop, 0, wallTop + height);
    const brightColor = adjustVaporwaveBrightnessHD(baseColor, brightness * 1.2);
    const darkColor = adjustVaporwaveBrightnessHD(baseColor, brightness * 0.8);
    
    wallGradient.addColorStop(0, brightColor);
    wallGradient.addColorStop(0.5, baseColor);
    wallGradient.addColorStop(1, darkColor);
    
    // Renderizar columna de pared HD
    ctx.fillStyle = wallGradient;
    ctx.fillRect(x, wallTop, width + 1, height);
    
    // Efecto de iluminación adicional para paredes cercanas
    if (distance < GAME.maxDistance * 0.3) {
        ctx.save();
        ctx.globalAlpha = (1 - distance / (GAME.maxDistance * 0.3)) * 0.2;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, wallTop, width + 1, height);
        ctx.restore();
    }
}

// ================================
// AJUSTAR BRILLO VAPORWAVE HD
// ================================
function adjustVaporwaveBrightnessHD(hexColor, brightness) {
    // Convertir hex a RGB para cálculo preciso
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Aplicar brillo manteniendo el carácter vaporwave
    const newR = Math.floor(Math.min(255, r * brightness));
    const newG = Math.floor(Math.min(255, g * brightness));
    const newB = Math.floor(Math.min(255, b * brightness));
    
    // Convertir de vuelta a hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// ================================
// RENDERIZAR SPRITES HD
// ================================
function renderSpritesHD() {
    if (!GAME.enemies || GAME.enemies.length === 0) {
        // Mostrar overlay de error mejorado
        if (GAME.ctx) {
            GAME.ctx.save();
            GAME.ctx.fillStyle = '#ff2222';
            GAME.ctx.font = 'bold 48px Arial';
            GAME.ctx.textAlign = 'center';
            GAME.ctx.fillText('ERROR: No hay enemigos para renderizar', GAME.width/2, GAME.height/2);
            GAME.ctx.font = 'bold 24px monospace';
            GAME.ctx.fillText('Usa window.doomGame.initEnemies() o respawnEnemies() para reiniciar.', GAME.width/2, GAME.height/2 + 60);
            GAME.ctx.restore();
        }
        console.error('❌ No hay enemigos para renderizar. No se reinicializa automáticamente.');
        return;
    }

    if (!GAME.enemySprites || !GAME.enemySpritesReady) {
        console.log('⚠️ Sprites de enemigos no cargados');
        // Diagnóstico visual HD
        GAME.ctx.save();
        GAME.ctx.fillStyle = '#ff006e';
        GAME.ctx.font = 'bold 42px Arial';
        GAME.ctx.textAlign = 'center';
        GAME.ctx.fillText('Diagnóstico: Sprites de enemigos no cargados', GAME.width/2, GAME.height/2);
        GAME.ctx.restore();
        return;
    }

    if (!GAME.allEnemySpritesReady) {
        // Diagnóstico visual HD mejorado
        GAME.ctx.save();
        GAME.ctx.fillStyle = '#ff006e';
        GAME.ctx.font = 'bold 48px Arial';
        GAME.ctx.textAlign = 'center';
        GAME.ctx.fillText('Cargando sprites de enemigos...', GAME.width/2, GAME.height/2);
        GAME.ctx.font = 'bold 28px monospace';
        let y = GAME.height/2 + 60;
        Object.keys(GAME.enemySpritesReady).forEach(function(type) {
            let img = GAME.enemySprites[type];
            let ready = GAME.enemySpritesReady[type];
            let status = ready ? 'OK' : 'FALTA';
            let color = ready ? '#00ff00' : '#ff2222';
            let dim = (img && img.naturalWidth) ? `${img.naturalWidth}x${img.naturalHeight}` : '0x0';
            GAME.ctx.fillStyle = color;
            GAME.ctx.textAlign = 'center';
            GAME.ctx.fillText(`Sprite '${type}': ${status} (${dim})`, GAME.width/2, y);
            y += 40;
        });
        GAME.ctx.restore();
        return;
    }
    
    const maxRenderDistance = GAME.maxDistance;
    let enemiesRendered = 0;
    
    GAME.enemies.forEach(function(enemy, index) {
        if (!enemy.active) return;
        
        var dx = enemy.x - GAME.player.x;
        var dy = enemy.y - GAME.player.y;
        var distance = Math.sqrt(dx*dx + dy*dy);
        var angle = Math.atan2(dy, dx) - GAME.player.angle;
        
        // Normalizar ángulo
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        
        // Proyectar en pantalla HD
        var screenX = GAME.width/2 + (angle/(GAME.fov/2))*(GAME.width/2);
        
        // Escalado HD mejorado
        const projPlaneDist = (GAME.width / 2) / Math.tan(GAME.fov / 2);
        const scale = enemy.scale || 1.0;
        const spriteScale = (GAME.tileSize / Math.max(distance, 1)) * projPlaneDist * scale;
        
        // Tamaño HD mejorado pero más realista
        const spriteW = Math.max(32, Math.min(400, spriteScale));
        const spriteH = Math.max(32, Math.min(400, spriteScale));
        const spriteY = (GAME.height / 2) - spriteH / 2;

        const img = GAME.enemySprites[enemy.type];

        // Renderizar sprite HD
        if (!img || !img.complete) {
            console.error(`❌ Sprite de enemigo tipo '${enemy.type}' no cargado o incompleto.`);
            GAME.ctx.fillStyle = '#ff00ff';
            GAME.ctx.fillRect(screenX - 16, GAME.height / 2 - 16, 32, 32);
        } else {
            try {
                if (img.naturalWidth === 0 || img.naturalHeight === 0) {
                    console.error(`❌ Sprite de enemigo tipo '${enemy.type}' está vacío o corrupto.`);
                    GAME.ctx.fillStyle = '#ff00ff';
                    GAME.ctx.fillRect(screenX - 16, GAME.height / 2 - 16, 32, 32);
                } else {
                    // Renderizado HD con mejor calidad
                    GAME.ctx.save();
                    GAME.ctx.imageSmoothingEnabled = true;
                    GAME.ctx.imageSmoothingQuality = 'high';
                    GAME.ctx.drawImage(img, screenX - spriteW / 2, spriteY, spriteW, spriteH);
                    GAME.ctx.restore();
                    
                    enemiesRendered++;
                }
            } catch (error) {
                console.error('Error renderizando sprite:', error);
                GAME.ctx.fillStyle = '#ff00ff';
                GAME.ctx.fillRect(screenX - 16, GAME.height / 2 - 16, 32, 32);
            }
        }
    });
    
    // overlays de texto HD
    if (GAME.textOverlays) {
        GAME.textOverlays = GAME.textOverlays.filter(function(o){
            if (o.timer > 0) {
                GAME.ctx.save();
                GAME.ctx.fillStyle = 'red';
                GAME.ctx.font = 'bold 24px Arial';
                GAME.ctx.textAlign = 'center';
                GAME.ctx.fillText(o.text, o.x, o.y);
                GAME.ctx.restore();
                o.timer--;
                return true;
            }
            return false;
        });
    }
}

// ================================
// HUD OPTIMIZADO
// ================================
function drawOptimizedHUD() {
    const ctx = GAME.ctx;
    
    // CROSSHAIR simple (sin efectos costosos)
    const centerX = GAME.width / 2;
    const centerY = GAME.height / 2;
    
    const crosshairColor = '#ff006e'; // Rosa neón
    
    ctx.strokeStyle = crosshairColor;
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(centerX - 10, centerY);
    ctx.lineTo(centerX + 10, centerY);
    ctx.moveTo(centerX, centerY - 10);
    ctx.lineTo(centerX, centerY + 10);
    ctx.stroke();
    
    // Punto central
    ctx.fillStyle = crosshairColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // PANEL HUD simplificado
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, GAME.height - 80, GAME.width, 80);
    
    // TEXTO HUD sin efectos
    ctx.font = 'bold 14px Arial';
    
    // Información básica
    ctx.fillStyle = '#ff006e';
    ctx.fillText(`SALUD: ${GAME.player.health}`, 10, GAME.height - 50);
    
    ctx.fillStyle = '#06ffa5';
    ctx.fillText(`MUNICIÓN: ${GAME.player.ammo}`, 10, GAME.height - 30);
    
    ctx.fillStyle = '#ffbe0b';
    ctx.fillText(`SCORE: ${GAME.score}`, 10, GAME.height - 10);
    
    ctx.fillStyle = '#8338ec';
    ctx.fillText(`ENEMIGOS: ${GAME.enemies ? GAME.enemies.length : 0}`, 200, GAME.height - 50);
    
    // Información de rendimiento si está habilitada
    if (window.OptimizacionRendimiento && window.OptimizacionRendimiento.config.showPerformanceInfo) {
        const estado = window.OptimizacionRendimiento.estado();
        ctx.fillStyle = '#00f5ff';
        ctx.fillText(`FPS: ${estado.fps}`, 200, GAME.height - 30);
        ctx.fillText(`Render: ${estado.renderTime}ms`, 200, GAME.height - 10);
    }
}

// ================================
// HUD
// ================================
function drawHUD() {
    drawOptimizedHUD();
}

// ================================
// HUD VAPORWAVE HD
// ================================
function drawVaporwaveHUDHD() {
    const ctx = GAME.ctx;
    
    // CROSSHAIR VAPORWAVE HD con efecto glow mejorado
    const centerX = GAME.width / 2;
    const centerY = GAME.height / 2;
    
    // Efecto pulsante mejorado para la mira
    const pulseIntensity = (Math.sin(Date.now() * 0.01) + 1) / 2;
    const crosshairColor = '#ff006e'; // Rosa neón
    
    ctx.strokeStyle = crosshairColor;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 8 + pulseIntensity * 8;
    ctx.shadowColor = crosshairColor;
    
    ctx.beginPath();
    ctx.moveTo(centerX - 16, centerY);
    ctx.lineTo(centerX + 16, centerY);
    ctx.moveTo(centerX, centerY - 16);
    ctx.lineTo(centerX, centerY + 16);
    ctx.stroke();
    
    // Círculo central de la mira HD
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fillStyle = crosshairColor;
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // PANEL HUD VAPORWAVE HD
    // Fondo semi-transparente con borde neón mejorado
    const hudHeight = 120; // Aumentado para HD
    ctx.fillStyle = 'rgba(15, 15, 35, 0.85)';
    ctx.fillRect(0, GAME.height - hudHeight, GAME.width, hudHeight);
    
    // Borde superior neón HD
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#00f5ff';
    ctx.beginPath();
    ctx.moveTo(0, GAME.height - hudHeight);
    ctx.lineTo(GAME.width, GAME.height - hudHeight);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // TEXTO HUD HD con colores vaporwave
    ctx.font = 'bold 24px "Courier New"'; // Aumentado de 16px a 24px
    
    // Información del jugador
    ctx.fillStyle = '#ff006e'; // Rosa neón
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#ff006e';
    ctx.fillText(`SALUD: ${GAME.player.health}`, 20, GAME.height - 80);
    
    ctx.fillStyle = '#06ffa5'; // Verde cyan
    ctx.shadowColor = '#06ffa5';
    ctx.fillText(`MUNICIÓN: ${GAME.player.ammo}`, 20, GAME.height - 55);
    
    ctx.fillStyle = '#ffbe0b'; // Dorado neón
    ctx.shadowColor = '#ffbe0b';
    ctx.fillText(`SCORE: ${GAME.score}`, 20, GAME.height - 30);
    
    // Información del juego
    ctx.fillStyle = '#8338ec'; // Morado
    ctx.shadowColor = '#8338ec';
    ctx.fillText(`ENEMIGOS: ${GAME.enemies ? GAME.enemies.length : 0}`, 400, GAME.height - 80);
    
    ctx.fillStyle = '#00f5ff'; // Cyan brillante
    ctx.shadowColor = '#00f5ff';
    const postersFound = GAME.posters ? GAME.posters.filter(p => p.found).length : 0;
    const totalPosters = GAME.posters ? GAME.posters.length : 0;
    ctx.fillText(`POSTERS: ${postersFound}/${totalPosters}`, 400, GAME.height - 55);
    
    ctx.fillStyle = '#ff9f1c'; // Amarillo neón
    ctx.shadowColor = '#ff9f1c';
    ctx.fillText(`POS: ${Math.floor(GAME.player.x)}, ${Math.floor(GAME.player.y)}`, 400, GAME.height - 30);
    
    // Mostrar resolución HD en el HUD
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.font = 'bold 18px "Courier New"';
    ctx.fillText(`RESOLUCIÓN HD: ${GAME.width}x${GAME.height} | RAYS: ${GAME.numRays}`, 700, GAME.height - 55);
    
    // Indicadores especiales vaporwave HD
    renderVaporwaveIndicatorsHD(ctx);
    
    ctx.shadowBlur = 0;
}

// ================================
// INDICADORES ESPECIALES VAPORWAVE HD
// ================================
function renderVaporwaveIndicatorsHD(ctx) {
    // Barra de salud vaporwave HD
    const healthBarX = GAME.width - 300; // Aumentado para HD
    const healthBarY = GAME.height - 90;
    const healthBarWidth = 280; // Aumentado para HD
    const healthBarHeight = 12; // Aumentado para HD
    
    // Fondo de la barra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
    
    // Barra de salud con gradiente vaporwave HD
    const healthPercent = GAME.player.health / 100;
    const healthGradient = ctx.createLinearGradient(healthBarX, 0, healthBarX + healthBarWidth, 0);
    healthGradient.addColorStop(0, '#ff073a'); // Rojo neón
    healthGradient.addColorStop(0.5, '#ff9f1c'); // Amarillo neón
    healthGradient.addColorStop(1, '#06ffa5'); // Verde neón
    
    ctx.fillStyle = healthGradient;
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercent, healthBarHeight);
    
    // Borde de la barra HD
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
    
    // Minimapa vaporwave HD
    renderVaporwaveMinimapHD(ctx);
}

// ================================
// MINIMAPA VAPORWAVE HD
// ================================
function renderVaporwaveMinimapHD(ctx) {
    const minimapSize = 120; // Aumentado para HD
    const minimapX = GAME.width - minimapSize - 15;
    const minimapY = 15;
    
    // SINCRONIZACIÓN DINÁMICA: Obtener dimensiones reales del mapa
    let mapWidth = GAME.mapWidth;
    let mapHeight = GAME.mapHeight;
    
    // Si existe mapaColisiones, usar sus dimensiones reales
    if (GAME.mapaColisiones && Array.isArray(GAME.mapaColisiones) && GAME.mapaColisiones.length > 0) {
        mapHeight = GAME.mapaColisiones.length;        // Número de filas
        mapWidth = GAME.mapaColisiones[0].length;      // Número de columnas
        
        // Actualizar GAME para futuras referencias
        if (GAME.mapWidth !== mapWidth || GAME.mapHeight !== mapHeight) {
            console.log(`🗺️ [MINIMAPA HD] Sincronizando dimensiones: ${GAME.mapWidth}x${GAME.mapHeight} → ${mapWidth}x${mapHeight}`);
            GAME.mapWidth = mapWidth;
            GAME.mapHeight = mapHeight;
        }
    }
    
    // Fondo del minimapa HD
    ctx.fillStyle = 'rgba(15, 15, 35, 0.9)';
    ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
    
    // Borde neón HD
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00f5ff';
    ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);
    ctx.shadowBlur = 0;
    
    // RENDERIZAR MAPA DE COLISIONES HD
    if (GAME.mapaColisiones && Array.isArray(GAME.mapaColisiones)) {
        const cellWidth = minimapSize / mapWidth;
        const cellHeight = minimapSize / mapHeight;
        
        for (let row = 0; row < mapHeight; row++) {
            for (let col = 0; col < mapWidth; col++) {
                if (GAME.mapaColisiones[row] && GAME.mapaColisiones[row][col] === 1) {
                    // Dibujar paredes HD
                    ctx.fillStyle = 'rgba(150, 150, 150, 0.8)';
                    ctx.fillRect(
                        minimapX + col * cellWidth,
                        minimapY + row * cellHeight,
                        cellWidth,
                        cellHeight
                    );
                }
            }
        }
    }
    
    // Dibujar posición del jugador HD
    const playerMapX = minimapX + (GAME.player.x / (mapWidth * GAME.tileSize)) * minimapSize;
    const playerMapY = minimapY + (GAME.player.y / (mapHeight * GAME.tileSize)) * minimapSize;
    ctx.fillStyle = '#ff006e';
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#ff006e';
    ctx.beginPath();
    ctx.arc(playerMapX, playerMapY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Dirección del jugador HD
    const dirLength = 12;
    const dirX = playerMapX + Math.cos(GAME.player.angle) * dirLength;
    const dirY = playerMapY + Math.sin(GAME.player.angle) * dirLength;
    ctx.strokeStyle = '#ff006e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(playerMapX, playerMapY);
    ctx.lineTo(dirX, dirY);
    ctx.stroke();

    // DEBUG HD: Dibujar todos los enemigos en el minimapa
    if (GAME.enemies && GAME.enemies.length > 0) {
        GAME.enemies.forEach(function(enemy, idx) {
            if (!enemy.active) return; // Solo enemigos activos
            const ex = minimapX + (enemy.x / (mapWidth * GAME.tileSize)) * minimapSize;
            const ey = minimapY + (enemy.y / (mapHeight * GAME.tileSize)) * minimapSize;
            ctx.fillStyle = '#00ff00';
            ctx.shadowBlur = 3;
            ctx.shadowColor = '#00ff00';
            ctx.beginPath();
            ctx.arc(ex, ey, 6, 0, Math.PI * 2); // Aumentado para HD
            ctx.fill();
            ctx.shadowBlur = 0;
            // Mostrar el índice encima HD
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial'; // Aumentado para HD
            ctx.fillText(idx+1, ex+7, ey);
        });
    }
    
    // Información de debug en el minimapa HD
    ctx.fillStyle = '#00f5ff';
    ctx.font = '12px Arial'; // Aumentado para HD
    ctx.fillText(`${mapWidth}x${mapHeight}`, minimapX + 3, minimapY + minimapSize - 5);
}

// ================================
// BUCLE PRINCIPAL (OPTIMIZADO)
// ================================
let lastFrameTime = 0;
const targetFrameTime = 1000 / 60; // 60 FPS target

function gameLoop(currentTime = 0) {
    if (!GAME.running) return;
    
    // Control de framerate
    const deltaTime = currentTime - lastFrameTime;
    
    if (deltaTime >= targetFrameTime) {
        updatePlayer();
        updateBullets();
        render3D();
        
        lastFrameTime = currentTime;
    }
    
    requestAnimationFrame(gameLoop);
}

// ================================
// DETENER JUEGO
// ================================
function stopGame() {
    console.log('🛑 Deteniendo juego...');
    GAME.running = false;
    
    // Limpiar canvas
    if (GAME.ctx) {
        GAME.ctx.fillStyle = '#000';
        GAME.ctx.fillRect(0, 0, GAME.width, GAME.height);
    }
    
    console.log('✅ Juego detenido correctamente');
}


// ================================
// API GLOBAL UNIFICADA
// ================================
window.GAME = GAME;
// Proxy para compatibilidad: doomGame apunta siempre a GAME y sus métodos
window.doomGame = new Proxy({}, {
    get(target, prop) {
        // Métodos principales
        if (prop === 'init') return init;
        if (prop === 'start' || prop === 'startGame') return startGame;
        if (prop === 'stop' || prop === 'stopGame') return stopGame;
        if (prop === 'restart') return function() {
            GAME.player.x = 3 * 64 + 32;
            GAME.player.y = 3 * 64 + 32;
            GAME.player.angle = 0;
            GAME.player.health = 100;
            GAME.player.ammo = 50;
            GAME.score = 0;
            initEnemies();
            initPosters();
            if (!GAME.running) {
                GAME.running = true;
                gameLoop();
            }
            console.log('🔄 Juego reiniciado');
        };
        if (prop === 'isRunning') return () => GAME.running;
        if (prop === 'getPlayer') return () => GAME.player;
        if (prop === 'getGame' || prop === 'state') return () => GAME;
        if (prop === 'addAmmo') return () => { GAME.player.ammo += 20; };
        if (prop === 'addHealth') return () => { GAME.player.health = 100; };
        // Acceso directo a propiedades de GAME
        if (GAME.hasOwnProperty(prop)) return GAME[prop];
        // Fallback
        return undefined;
    },
    set(target, prop, value) {
        // Permitir setear propiedades en GAME
        GAME[prop] = value;
        return true;
    }
});

console.log('🎯 DOOM intermedio cargado - window.GAME y window.doomGame unificados');
console.log('⚠️ Auto-inicio deshabilitado - usar menú para iniciar');

// ================================
// PROTECCIÓN DE render3D CONTRA SOBRESCRITURAS
// ================================
if (!window._originalRender3D) {
    window._originalRender3D = window.render3D;
}
// Protección simple: solo reasignar si no está protegido
window.render3D = function(...args) {
    if (typeof window._originalRender3D === 'function') {
        window._originalRender3D.apply(this, args);
    }
};

// ================================
// VERIFICAR COLISIÓN CON ENEMIGOS (stub)
// ================================
function checkEnemyCollision() {
    // Detectar colisión simple por proximidad
    let colisiono = false;
    let colisionInvisible = false;
    GAME.enemies.forEach(function(enemy) {
        const dx = enemy.x - GAME.player.x;
        const dy = enemy.y - GAME.player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        // Si está cerca y tiene salud
        if (dist < GAME.tileSize/2 && enemy.health > 0) {
            colisiono = true;
            // Si el enemigo no se ve en pantalla, marcarlo
            if (typeof isEnemyVisible === 'function' && !isEnemyVisible(enemy)) {
                colisionInvisible = true;
            }
        }
    });
    if (colisiono) {
        GAME.player.health -= 10;
        if (GAME.player.health < 0) GAME.player.health = 0;
        GAME.textOverlays.push({ text: '-10', x: GAME.width/2, y: GAME.height/2 - 20, timer: 30 });
        if (colisionInvisible) {
            GAME.textOverlays.push({ text: '¡PELIGRO: ENEMIGO INVISIBLE!', x: GAME.width/2-80, y: GAME.height/2-60, timer: 60 });
            console.warn('⚠️ Colisión con enemigo invisible cerca del jugador. Revisa posiciones de enemigos.');
            // Mostrar info de enemigos en consola
            GAME.enemies.forEach(function(enemy, idx) {
                const dx = enemy.x - GAME.player.x;
                const dy = enemy.y - GAME.player.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < GAME.tileSize/2 && enemy.health > 0 && !isEnemyVisible(enemy)) {
                    console.warn(`Enemigo invisible #${idx+1} en (${enemy.x},${enemy.y}) tipo:${enemy.type}`);
                }
            });
        }
    }

    // Función auxiliar para saber si el enemigo está en pantalla (campo de visión)
    // DEBUG: Forzar visibilidad de todos los enemigos
    function isEnemyVisible(enemy) {
        return true;
    }
}
