// Permitir reiniciar enemigos desde el botón flotante
if (typeof window !== 'undefined') {
  window.doomGame = window.doomGame || {};
  window.doomGame.respawnEnemies = function() {
    if (typeof initEnemies === 'function') initEnemies();
    if (typeof initPosters === 'function') initPosters();
    if (typeof renderEnemiesHTML === 'function') renderEnemiesHTML();
    if (typeof GAME !== 'undefined' && typeof GAME.ctx !== 'undefined') {
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
    const mapa = (typeof window !== 'undefined' && window.GAME_MAZE) ? window.GAME_MAZE : MAP;
    const libres = [];
    for (let y = 0; y < mapa.length; y++) {
      for (let x = 0; x < mapa[0].length; x++) {
        if (mapa[y][x] === 0) {
          libres.push({ x: x * GAME.tileSize + GAME.tileSize / 2, y: y * GAME.tileSize + GAME.tileSize / 2 });
        }
      }
    }
    // Elegir hasta 12 posiciones aleatorias para los enemigos
    const shuffle = arr => arr.sort(() => Math.random() - 0.5);
    const enemyPositions = shuffle(libres).slice(0, 12);
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
  const speed = 1.2; // velocidad px/frame
  window.GAME.enemies.forEach(enemy => {
    if (!enemy.active) return;
    // Calcular siguiente posición
    const nextX = enemy.x + Math.cos(enemy.dir) * speed;
    const nextY = enemy.y + Math.sin(enemy.dir) * speed;
    // Comprobar colisión con paredes
    const mapX = Math.floor(nextX / GAME.tileSize);
    const mapY = Math.floor(nextY / GAME.tileSize);
    if (
      mapX < 0 || mapY < 0 ||
      mapY >= window.GAME_MAZE.length || mapX >= window.GAME_MAZE[0].length ||
      window.GAME_MAZE[mapY][mapX] !== 0
    ) {
      // Cambiar dirección aleatoriamente si choca
      enemy.dir = Math.random() * 2 * Math.PI;
    } else {
      // Avanzar
      enemy.x = nextX;
      enemy.y = nextY;
      // Cambiar dirección aleatoriamente a veces
      if (Math.random() < 0.01) enemy.dir = Math.random() * 2 * Math.PI;
    }
  });
}, 40);
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
    ctx.font = 'bold 32px Arial';
    ctx.fillText('Cargando sprites de enemigos...', 40, 80);
    ctx.restore();
    return;
  }
  (window.GAME.enemies || []).forEach(enemy => {
    if (!enemy.active) return;
    const tipo = enemy.type || 'casual';
    const img = window.GAME.enemySprites[tipo];
    const x = Math.floor(enemy.x);
    const y = Math.floor(enemy.y);
    const size = 48;
    if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
      ctx.drawImage(img, x - size/2, y - size/2, size, size);
    } else {
      ctx.save();
      ctx.fillStyle = 'rgba(255,0,0,0.7)';
      ctx.fillRect(x - size/2, y - size/2, size, size);
      ctx.restore();
    }
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.fillText('E'+enemy.id, x - 10, y - size/2 - 2);
    ctx.restore();
  });
};
// ================================
// DOOM INTERMEDIO - SIMPLE + ENEMIGOS + POSTERS
// Raycasting simple con elementos del juego
// ================================

console.log('🎮 DOOM INTERMEDIO - Simple + Enemigos + Posters');

// ================================
// CONFIGURACIÓN
// ================================
const GAME = {
    // Canvas
    canvas: null,
    ctx: null,
    width: 800,
    height: 600,
    
    // Mundo - Dimensiones corregidas y sincronizadas con el mapa real
    mapWidth: 14,  // 14 columnas (ancho)
    mapHeight: 10, // 10 filas (altura)
    tileSize: 50, // Sincronizado con cellSize del laberinto definitivo
    
    // Jugador
    player: {
        x: 3 * 64 + 32,
        y: 3 * 64 + 32,
        angle: 0,
        speed: 3,
        rotSpeed: 0.1,
        health: 100,
        ammo: 50
    },
    
    // Raycasting (OPTIMIZADO PARA RENDIMIENTO)
    fov: Math.PI / 3,
    numRays: 200, // Reducido de 400 a 200 para mejor performance
    maxDistance: 600, // Reducido de 800 a 600
    
    // Control
    keys: {},
    mouseLocked: false,
    
    // Estado
    running: false,
    score: 0,
    
    // Elementos del juego
    enemies: [],
    bullets: [],
    posters: []
};

// ================================
// MAPA SIN POSTERS
// ================================
const MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,1,1,0,0,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,0,1,1,0,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,0,0,0,1,1,0,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,1,1,0,0,0,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,0,0,0,0,0,0,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];
typeof window !== 'undefined' && (window.MAP = MAP);
function init() {
    console.log('🚀 Inicializando DOOM intermedio...');
    
    // Crear canvas
    GAME.canvas = document.getElementById('gameCanvas');
    if (!GAME.canvas) {
        GAME.canvas = document.createElement('canvas');
        GAME.canvas.id = 'gameCanvas';
        document.body.appendChild(GAME.canvas);
    }
    
    GAME.canvas.width = GAME.width;
    GAME.canvas.height = GAME.height;
    GAME.canvas.style.border = '2px solid #333';
    // Removed: prevent showing canvas before user starts game
    // GAME.canvas.style.display = 'block';
    GAME.canvas.style.margin = '10px auto';
    GAME.canvas.style.background = '#000';
    
    GAME.ctx = GAME.canvas.getContext('2d');
    
    // Inicializar elementos
    initEnemies();
    initPosters();
    setupControls();
    
    // NO INICIAR EL BUCLE AUTOMÁTICAMENTE
    GAME.running = false;
    
    
    console.log('✅ DOOM intermedio listo - Esperando inicio desde menú');
}

// ================================
// INICIAR JUEGO (DESDE MENÚ)
// ================================
function startGame() {
    console.log('🎮 Iniciando juego desde menú...');
    
    // Verificar que esté inicializado
    if (!GAME.canvas || !GAME.ctx) {
        console.log('⚠️ Inicializando primero...');
        init();
    }
    
    // Reinicializar enemigos y posters cada vez que se inicia el juego
    if (typeof initEnemies === 'function') initEnemies();
    if (typeof initPosters === 'function') initPosters();
    // Iniciar bucle del juego
    GAME.running = true;
    gameLoop();
    // Spawn aleatorio usando mapa global MAP
    if (window.MAP && Array.isArray(MAP) && GAME.tileSize) {
      var free = [];
      for (var yy = 0; yy < MAP.length; yy++) {
        for (var xx = 0; xx < MAP[yy].length; xx++) {
          if (MAP[yy][xx] === 0) {
            free.push({ x: xx * GAME.tileSize + GAME.tileSize / 2, y: yy * GAME.tileSize + GAME.tileSize / 2 });
          }
        }
      }
      if (free.length > 0) {
        var pick = free[Math.floor(Math.random() * free.length)];
        GAME.player = { x: pick.x, y: pick.y, angle: 0 };
        console.log('🚀 Spawn DOOM-INTERMEDIO desde MAP:', pick);
      }
    }
    console.log('✅ Juego iniciado correctamente');
}

// ================================
// PANTALLA DE ESPERA
// ================================
function renderWaitingScreen() {
    if (!GAME.ctx) return;
    
    const ctx = GAME.ctx;
    
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
// INICIALIZAR ENEMIGOS (OPTIMIZADO)
// ================================
function initEnemies() {
    // Usar los 3 sprites PNG de Noboa y crear enemigos grandes y visibles
    const enemyTypes = ['casual', 'deportivo', 'presidencial'];
    // Generar posiciones libres automáticamente para el tamaño del laberinto actual
    const mapa = (typeof window !== 'undefined' && window.GAME_MAZE) ? window.GAME_MAZE : MAP;
    const libres = [];
    for (let y = 0; y < mapa.length; y++) {
      for (let x = 0; x < mapa[0].length; x++) {
        if (mapa[y][x] === 0) {
          libres.push({ x: x * GAME.tileSize + GAME.tileSize / 2, y: y * GAME.tileSize + GAME.tileSize / 2 });
        }
      }
    }
    // Elegir hasta 12 posiciones aleatorias para los enemigos
    const shuffle = arr => arr.sort(() => Math.random() - 0.5);
    const enemyPositions = shuffle(libres).slice(0, 12);
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
        scale: 5.0
      };
    });
    // DEBUG: Mostrar en consola las posiciones de los enemigos
    console.log('👾 Enemigos Noboa inicializados:', GAME.enemies.length);
    GAME.enemies.forEach((e, idx) => {
      console.log(`Enemigo #${idx}: (${e.x}, ${e.y}) tipo: ${e.type}`);
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
    // Unificar con la lógica robusta de colisión global
    if (window.WorldPhysics && typeof window.WorldPhysics.checkCollision === 'function') {
        return window.WorldPhysics.checkCollision(x, y);
    }
    // Fallback legacy (por si no está cargado WorldPhysics)
    const mapX = Math.floor(x / GAME.tileSize);
    const mapY = Math.floor(y / GAME.tileSize);
    const mapa = (typeof window !== 'undefined' && window.GAME_MAZE) ? window.GAME_MAZE : MAP;
    const mapW = mapa[0].length;
    const mapH = mapa.length;
    if (mapX < 0 || mapX >= mapW || mapY < 0 || mapY >= mapH) {
        return false;
    }
    const tile = mapa[mapY][mapX];
    return tile !== 1;
}

// ================================
// RAYCASTING (OPTIMIZADO)
// ================================
function castRay(angle) {
    const stepSize = 1.0; // Paso optimizado
    let distance = 0;
    let hitWall = false;
    let wallType = 1;
    const rayDirX = Math.cos(angle);
    const rayDirY = Math.sin(angle);
    let hitX, hitY;
    // Usar GAME_MAZE si existe, si no MAP
    const mapa = (typeof window !== 'undefined' && window.GAME_MAZE) ? window.GAME_MAZE : MAP;
    const mapW = mapa[0].length;
    const mapH = mapa.length;
    while (!hitWall && distance < GAME.maxDistance) {
        distance += stepSize;
        const testX = GAME.player.x + rayDirX * distance;
        const testY = GAME.player.y + rayDirY * distance;
        const mapX = Math.floor(testX / GAME.tileSize);
        const mapY = Math.floor(testY / GAME.tileSize);
        // Mejorar: usar la colisión robusta de WorldPhysics si está disponible
        if (window.WorldPhysics && typeof window.WorldPhysics.checkCollision === 'function') {
            if (!window.WorldPhysics.checkCollision(testX, testY)) {
                hitWall = true;
                hitX = mapX; hitY = mapY;
            }
        } else {
            if (mapX < 0 || mapX >= mapW || mapY < 0 || mapY >= mapH) {
                hitWall = true;
                distance = GAME.maxDistance;
                hitX = mapX; hitY = mapY;
            } else {
                const tile = mapa[mapY][mapX];
                if (tile === 1) { // Solo 1 es pared sólida
                    hitWall = true;
                    wallType = tile;
                    hitX = mapX; hitY = mapY;
                }
            }
        }
    }
    return { distance, type: 'wall', wallType, mapX: hitX, mapY: hitY };
}

// ================================
// RENDERIZAR 3D CON COLORES VAPORWAVE (OPTIMIZADO)
// ================================
function render3D() {
    const ctx = GAME.ctx;
    
    // Limpiar (optimizado)
    ctx.clearRect(0, 0, GAME.width, GAME.height);
    
    // CIELO VAPORWAVE simplificado (sin gradiente costoso)
    ctx.fillStyle = '#8338ec';  // Color sólido para mejor rendimiento
    ctx.fillRect(0, 0, GAME.width, GAME.height / 2);
    
    // PISO VAPORWAVE simplificado (sin gradiente costoso)
    ctx.fillStyle = '#06ffa5'; // Color sólido para mejor rendimiento
    ctx.fillRect(0, GAME.height / 2, GAME.width, GAME.height / 2);
    
    // Raycasting optimizado SOLO para paredes (sin carteles ni objetos 2-7)
    const rayStepAngle = GAME.fov / GAME.numRays;
    const columnWidth = GAME.width / GAME.numRays;
    for (let i = 0; i < GAME.numRays; i++) {
        const rayAngle = GAME.player.angle - GAME.fov / 2 + i * rayStepAngle;
        const ray = castRay(rayAngle);
        const correctedDistance = ray.distance * Math.cos(rayAngle - GAME.player.angle);
        const wallHeight = (GAME.tileSize / correctedDistance) * (GAME.height / 2);
        const wallTop = (GAME.height - wallHeight) / 2;
        if (ray.type === 'wall') {
            renderVaporwaveWallOptimized(ctx, i * columnWidth, wallTop, columnWidth, wallHeight, ray.wallType, correctedDistance);
        }
        // No más posters ni objetos especiales
    }
    
    // Renderizar sprites optimizados
    renderSpritesOptimized();

    // --- PARCHE: Renderizado de enemigos encapsulados ---
    if (window.GAME && window.GAME.renderEnemies && window.GAME.ctx) {
        window.GAME.renderEnemies(window.GAME.ctx);
    }
    // --- FIN PARCHE ---

    // HUD optimizado
    drawOptimizedHUD();
}

// ================================
// GRILLA VAPORWAVE PARA EL PISO
// ================================
function renderVaporwaveGrid(ctx) {
    // Función vacía: grid deshabilitada
}

// ================================
// RENDERIZAR PAREDES VAPORWAVE (OPTIMIZADO)
// ================================
function renderVaporwaveWallOptimized(ctx, x, wallTop, width, height, wallType, distance) {
    const brightness = Math.max(0.2, 1 - distance / GAME.maxDistance);
    
    // Paleta de colores vaporwave simplificada
    const vaporwaveColors = [
        '#ff006e', // Rosa neón
        '#8338ec', // Morado
        '#06ffa5', // Verde cyan
        '#00f5ff', // Cyan brillante
        '#ff9f1c'  // Amarillo neón
    ];
    
    const baseColor = vaporwaveColors[wallType % vaporwaveColors.length];
    const wallColor = adjustVaporwaveBrightnessOptimized(baseColor, brightness);
    
    // Renderizar columna de pared (sin efectos costosos)
    ctx.fillStyle = wallColor;
    ctx.fillRect(x, wallTop, width + 1, height);
}

// ================================
// RENDERIZAR POSTERS VAPORWAVE (OPTIMIZADO)
// ================================
function renderVaporwavePosterOptimized(ctx, x, wallTop, width, height, posterType, distance) {
    const posterData = POSTER_DATA[posterType];
    if (!posterData) return;
    
    // Colores especiales para posters vaporwave simplificados
    const posterVaporwaveColors = [
        '#ffbe0b', // Dorado neón
        '#ff006e', // Rosa neón
        '#06ffa5', // Verde cyan
        '#ff073a', // Rojo neón
        '#8338ec', // Morado
        '#00f5ff'  // Cyan brillante
    ];
    
    const posterColor = posterVaporwaveColors[posterType % posterVaporwaveColors.length];
    
    ctx.fillStyle = posterColor;
    ctx.fillRect(x, wallTop, width + 1, height);
}

// ================================
// AJUSTAR BRILLO VAPORWAVE (OPTIMIZADO)
// ================================
function adjustVaporwaveBrightnessOptimized(hexColor, brightness) {
    // Versión optimizada que evita conversiones costosas
    const minBrightness = 0.3; // Mantener más color para mejor visibilidad
    const adjustedBrightness = Math.max(minBrightness, brightness);
    
    // Usar interpolación más simple
    if (adjustedBrightness > 0.7) {
        return hexColor; // Color completo si está cerca
    } else {
        // Versión oscurecida simple
        return hexColor + '80'; // Agregar transparencia en lugar de calcular RGB
    }
}

// ================================
// RENDERIZAR SPRITES OPTIMIZADO Y MEJORADO
// ================================
function renderSpritesOptimized() {
    if (!GAME.enemies || GAME.enemies.length === 0) {
        // Mostrar overlay de error en vez de reinicializar
        if (GAME.ctx) {
            GAME.ctx.save();
            GAME.ctx.fillStyle = '#ff2222';
            GAME.ctx.font = 'bold 32px Arial';
            GAME.ctx.fillText('ERROR: No hay enemigos para renderizar', GAME.width/2 - 260, GAME.height/2);
            GAME.ctx.font = 'bold 20px monospace';
            GAME.ctx.fillText('Usa window.doomGame.initEnemies() o respawnEnemies() para reiniciar.', GAME.width/2 - 320, GAME.height/2 + 40);
            GAME.ctx.restore();
        }
        console.error('❌ No hay enemigos para renderizar. No se reinicializa automáticamente.');
        return;
    }

    if (!GAME.enemySprites || !GAME.enemySpritesReady) {
        console.log('⚠️ Sprites de enemigos no cargados');
        // Diagnóstico visual: mostrar mensaje en pantalla
        GAME.ctx.save();
        GAME.ctx.fillStyle = '#ff006e';
        GAME.ctx.font = 'bold 28px Arial';
        GAME.ctx.fillText('Diagnóstico: Sprites de enemigos no cargados', 40, 80);
        GAME.ctx.restore();
        return;
    }
    if (!GAME.allEnemySpritesReady) {
        // Diagnóstico visual: mostrar estado de cada sprite
        GAME.ctx.save();
        GAME.ctx.fillStyle = '#ff006e';
        GAME.ctx.font = 'bold 32px Arial';
        GAME.ctx.fillText('Cargando sprites de enemigos...', GAME.width/2 - 200, GAME.height/2);
        GAME.ctx.font = 'bold 20px monospace';
        let y = GAME.height/2 + 40;
        Object.keys(GAME.enemySpritesReady).forEach(function(type) {
            let img = GAME.enemySprites[type];
            let ready = GAME.enemySpritesReady[type];
            let status = ready ? 'OK' : 'FALTA';
            let color = ready ? '#00ff00' : '#ff2222';
            let dim = (img && img.naturalWidth) ? `${img.naturalWidth}x${img.naturalHeight}` : '0x0';
            GAME.ctx.fillStyle = color;
            GAME.ctx.fillText(`Sprite '${type}': ${status} (${dim})`, GAME.width/2 - 200, y);
            y += 28;
        });
        GAME.ctx.restore();
        return;
    }
    
    const maxRenderDistance = GAME.maxDistance;
    let enemiesRendered = 0;
    
    GAME.enemies.forEach(function(enemy, index) {
        if (!enemy.active) return;
        // Forzar renderizado de todos los enemigos, sin filtrar por FOV ni distancia
        var dx = enemy.x - GAME.player.x;
        var dy = enemy.y - GAME.player.y;
        var distance = Math.sqrt(dx*dx + dy*dy);
        var angle = Math.atan2(dy, dx) - GAME.player.angle;
        // Normalizar ángulo
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        // Proyectar en pantalla aunque esté fuera de FOV
        var screenX = GAME.width/2 + (angle/(GAME.fov/2))*(GAME.width/2);
        // Escalado de sprite basado en perspectiva (usar scale del enemigo si existe)
        const projPlaneDist = (GAME.width / 2) / Math.tan(GAME.fov / 2);
        const scale = enemy.scale || 1.0;
        const spriteScale = (GAME.tileSize / Math.max(distance, 1)) * projPlaneDist * scale;
        // Forzar tamaño gigante para debug visual (50rem = 800px)
        const spriteW = 800;
        const spriteH = 800;
        const img = GAME.enemySprites[enemy.type];
        const spriteY = (GAME.height / 2) - spriteH / 2;

        // Overlay de debug: dibujar rectángulo rojo y coordenadas
        GAME.ctx.save();
        GAME.ctx.strokeStyle = '#ff2222';
        GAME.ctx.lineWidth = 4;
        GAME.ctx.strokeRect(screenX - spriteW / 2, spriteY, spriteW, spriteH);
        GAME.ctx.fillStyle = '#ff2222';
        GAME.ctx.font = 'bold 18px monospace';
        GAME.ctx.fillText(`(${Math.round(screenX)},${Math.round(spriteY)})`, screenX - spriteW / 2 + 10, spriteY + 30);
        GAME.ctx.fillText(`enemy: ${enemy.type}`, screenX - spriteW / 2 + 10, spriteY + 60);
        GAME.ctx.restore();

        // 1. Si no hay sprite, dibujar cuadrado magenta
        if (!img || !img.complete) {
            console.error(`❌ Sprite de enemigo tipo '${enemy.type}' no cargado o incompleto.`);
            GAME.ctx.fillStyle = '#ff00ff';
            GAME.ctx.fillRect(screenX - 12, GAME.height / 2 - 12, 24, 24);
        } else {
            try {
                if (img.naturalWidth === 0 || img.naturalHeight === 0) {
                    console.error(`❌ Sprite de enemigo tipo '${enemy.type}' está vacío o corrupto.`);
                    GAME.ctx.fillStyle = '#ff00ff';
                    GAME.ctx.fillRect(screenX - 12, GAME.height / 2 - 12, 24, 24);
                } else {
                    GAME.ctx.drawImage(img, screenX - spriteW / 2, spriteY, spriteW, spriteH);
                    enemiesRendered++;
                    if (typeof GameConfig !== 'undefined' && GameConfig.debug && GameConfig.debug.showEnemyCount) {
                        GAME.ctx.fillStyle = '#00ff00';
                        GAME.ctx.font = '10px Arial';
                        GAME.ctx.fillText(`${enemy.type}`, screenX - 20, spriteY - 5);
                    }
                }
            } catch (error) {
                console.error('Error renderizando sprite:', error);
                GAME.ctx.fillStyle = '#ff00ff';
                GAME.ctx.fillRect(screenX - 12, GAME.height / 2 - 12, 24, 24);
            }
        }

        // 2. Si el enemigo NO es visible según isEnemyVisible, dibujar contorno amarillo
        if (typeof isEnemyVisible === 'function' && !isEnemyVisible(enemy)) {
            GAME.ctx.save();
            GAME.ctx.strokeStyle = '#ffff00';
            GAME.ctx.lineWidth = 4;
            GAME.ctx.beginPath();
            GAME.ctx.arc(screenX, spriteY + spriteH / 2, Math.max(spriteW, spriteH) / 2 + 8, 0, Math.PI * 2);
            GAME.ctx.stroke();
            GAME.ctx.restore();
        }
    });
    
    // Debug: Mostrar estadísticas de renderizado
    if (enemiesRendered > 0) {
        console.log(`👾 Renderizados: ${enemiesRendered}/${GAME.enemies.length} enemigos`);
    }
    
    // overlays de texto
    if (GAME.textOverlays) {
        GAME.textOverlays = GAME.textOverlays.filter(function(o){
            if (o.timer > 0) {
                GAME.ctx.fillStyle = 'red';
                GAME.ctx.font = 'bold 16px Arial';
                GAME.ctx.fillText(o.text, o.x, o.y);
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

function drawVaporwaveHUD() {
    const ctx = GAME.ctx;
    
    // CROSSHAIR VAPORWAVE con efecto glow
    const centerX = GAME.width / 2;
    const centerY = GAME.height / 2;
    
    // Efecto pulsante para la mira
    const pulseIntensity = (Math.sin(Date.now() * 0.01) + 1) / 2;
    const crosshairColor = '#ff006e'; // Rosa neón
    
    ctx.strokeStyle = crosshairColor;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 5 + pulseIntensity * 5;
    ctx.shadowColor = crosshairColor;
    
    ctx.beginPath();
    ctx.moveTo(centerX - 12, centerY);
    ctx.lineTo(centerX + 12, centerY);
    ctx.moveTo(centerX, centerY - 12);
    ctx.lineTo(centerX, centerY + 12);
    ctx.stroke();
    
    // Círculo central de la mira
    ctx.beginPath();
    ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
    ctx.fillStyle = crosshairColor;
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // PANEL HUD VAPORWAVE
    // Fondo semi-transparente con borde neón
    ctx.fillStyle = 'rgba(15, 15, 35, 0.9)';
    ctx.fillRect(0, GAME.height - 90, GAME.width, 90);
    
    // Borde superior neón
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00f5ff';
    ctx.beginPath();
    ctx.moveTo(0, GAME.height - 90);
    ctx.lineTo(GAME.width, GAME.height - 90);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // TEXTO HUD con colores vaporwave
    ctx.font = 'bold 16px "Courier New"';
    
    // Información del jugador
    ctx.fillStyle = '#ff006e'; // Rosa neón
    ctx.shadowBlur = 3;
    ctx.shadowColor = '#ff006e';
    ctx.fillText(`SALUD: ${GAME.player.health}`, 15, GAME.height - 60);
    
    ctx.fillStyle = '#06ffa5'; // Verde cyan
    ctx.shadowColor = '#06ffa5';
    ctx.fillText(`MUNICIÓN: ${GAME.player.ammo}`, 15, GAME.height - 40);
    
    ctx.fillStyle = '#ffbe0b'; // Dorado neón
    ctx.shadowColor = '#ffbe0b';
    ctx.fillText(`SCORE: ${GAME.score}`, 15, GAME.height - 20);
    
    // Información del juego
    ctx.fillStyle = '#8338ec'; // Morado
    ctx.shadowColor = '#8338ec';
    ctx.fillText(`ENEMIGOS: ${GAME.enemies ? GAME.enemies.length : 0}`, 250, GAME.height - 60);
    
    ctx.fillStyle = '#00f5ff'; // Cyan brillante
    ctx.shadowColor = '#00f5ff';
    const postersFound = GAME.posters ? GAME.posters.filter(p => p.found).length : 0;
    const totalPosters = GAME.posters ? GAME.posters.length : 0;
    ctx.fillText(`POSTERS: ${postersFound}/${totalPosters}`, 250, GAME.height - 40);
    
    ctx.fillStyle = '#ff9f1c'; // Amarillo neón
    ctx.shadowColor = '#ff9f1c';
    ctx.fillText(`POS: ${Math.floor(GAME.player.x)}, ${Math.floor(GAME.player.y)}`, 250, GAME.height - 20);
    
    // Indicadores especiales vaporwave
    renderVaporwaveIndicators(ctx);
    
    ctx.shadowBlur = 0;
}

// ================================
// INDICADORES ESPECIALES VAPORWAVE
// ================================
function renderVaporwaveIndicators(ctx) {
    // Barra de salud vaporwave
    const healthBarX = GAME.width - 220;
    const healthBarY = GAME.height - 70;
    const healthBarWidth = 200;
    const healthBarHeight = 8;
    
    // Fondo de la barra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
    
    // Barra de salud con gradiente vaporwave
    const healthPercent = GAME.player.health / 100;
    const healthGradient = ctx.createLinearGradient(healthBarX, 0, healthBarX + healthBarWidth, 0);
    healthGradient.addColorStop(0, '#ff073a'); // Rojo neón
    healthGradient.addColorStop(0.5, '#ff9f1c'); // Amarillo neón
    healthGradient.addColorStop(1, '#06ffa5'); // Verde neón
    
    ctx.fillStyle = healthGradient;
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercent, healthBarHeight);
    
    // Borde de la barra
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
    
    // Minimapa vaporwave (opcional)
    renderVaporwaveMinimap(ctx);
}

// ================================
// MINIMAPA VAPORWAVE - VERSIÓN SINCRONIZADA
// ================================
function renderVaporwaveMinimap(ctx) {
    const minimapSize = 80;
    const minimapX = GAME.width - minimapSize - 10;
    const minimapY = 10;
    
    // SINCRONIZACIÓN DINÁMICA: Obtener dimensiones reales del mapa
    let mapWidth = GAME.mapWidth;
    let mapHeight = GAME.mapHeight;
    
    // Si existe mapaColisiones, usar sus dimensiones reales
    if (GAME.mapaColisiones && Array.isArray(GAME.mapaColisiones) && GAME.mapaColisiones.length > 0) {
        mapHeight = GAME.mapaColisiones.length;        // Número de filas
        mapWidth = GAME.mapaColisiones[0].length;      // Número de columnas
        
        // Actualizar GAME para futuras referencias
        if (GAME.mapWidth !== mapWidth || GAME.mapHeight !== mapHeight) {
            console.log(`🗺️ [MINIMAPA] Sincronizando dimensiones: ${GAME.mapWidth}x${GAME.mapHeight} → ${mapWidth}x${mapHeight}`);
            GAME.mapWidth = mapWidth;
            GAME.mapHeight = mapHeight;
        }
    }
    
    // Fondo del minimapa
    ctx.fillStyle = 'rgba(15, 15, 35, 0.8)';
    ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
    
    // Borde neón
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);
    
    // RENDERIZAR MAPA DE COLISIONES (opcional para debug)
    if (GAME.mapaColisiones && Array.isArray(GAME.mapaColisiones)) {
        const cellWidth = minimapSize / mapWidth;
        const cellHeight = minimapSize / mapHeight;
        
        for (let row = 0; row < mapHeight; row++) {
            for (let col = 0; col < mapWidth; col++) {
                if (GAME.mapaColisiones[row] && GAME.mapaColisiones[row][col] === 1) {
                    // Dibujar paredes
                    ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
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
    
    // Dibujar posición del jugador
    const playerMapX = minimapX + (GAME.player.x / (mapWidth * GAME.tileSize)) * minimapSize;
    const playerMapY = minimapY + (GAME.player.y / (mapHeight * GAME.tileSize)) * minimapSize;
    ctx.fillStyle = '#ff006e';
    ctx.beginPath();
    ctx.arc(playerMapX, playerMapY, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Dirección del jugador
    const dirLength = 8;
    const dirX = playerMapX + Math.cos(GAME.player.angle) * dirLength;
    const dirY = playerMapY + Math.sin(GAME.player.angle) * dirLength;
    ctx.strokeStyle = '#ff006e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playerMapX, playerMapY);
    ctx.lineTo(dirX, dirY);
    ctx.stroke();

    // DEBUG: Dibujar todos los enemigos en el minimapa
    if (GAME.enemies && GAME.enemies.length > 0) {
        GAME.enemies.forEach(function(enemy, idx) {
            if (!enemy.active) return; // Solo enemigos activos
            const ex = minimapX + (enemy.x / (mapWidth * GAME.tileSize)) * minimapSize;
            const ey = minimapY + (enemy.y / (mapHeight * GAME.tileSize)) * minimapSize;
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(ex, ey, 4, 0, Math.PI * 2);
            ctx.fill();
            // Mostrar el índice encima
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.fillText(idx+1, ex+5, ey);
        });
    }
    
    // Información de debug en el minimapa
    ctx.fillStyle = '#00f5ff';
    ctx.font = '8px Arial';
    ctx.fillText(`${mapWidth}x${mapHeight}`, minimapX + 2, minimapY + minimapSize - 2);
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
