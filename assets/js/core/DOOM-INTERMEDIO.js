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
    
    // Mundo
    mapWidth: 16,
    mapHeight: 12,
    tileSize: 64,
    
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
// MAPA CON POSTERS
// ================================
const MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,1,1,0,0,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,0,1,1,2,1,1,0,1,1,0,1], // 2 = poster
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,0,3,0,1,1,0,1,1,1], // 3 = poster
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,1,1,4,0,5,1,1,0,1,0,1], // 4,5 = posters
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,0,6,0,7,0,0,1,1,1,1], // 6,7 = posters
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];
// Exponer MAP globalmente para WorldPhysics
typeof window !== 'undefined' && (window.MAP = MAP);

// ================================
// DATOS DE POSTERS
// ================================
const POSTER_DATA = {
    2: { text: 'NOBOA\nPRESIDENTE', color: '#FFD700' },
    3: { text: 'ORDEN\nY PAZ', color: '#FF6B6B' },
    4: { text: 'ECUADOR\nADELANTE', color: '#4CAF50' },
    5: { text: 'FAMILIA\nPRIMERO', color: '#2196F3' },
    6: { text: 'FUTURO\nSEGURO', color: '#FF9800' },
    7: { text: 'CAMBIO\nVERDADERO', color: '#9C27B0' }
};

// ================================
// INICIALIZACIÓN (SIN AUTO-INICIO)
// ================================
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
    GAME.canvas.style.display = 'block';
    GAME.canvas.style.margin = '10px auto';
    GAME.canvas.style.background = '#000';
    
    GAME.ctx = GAME.canvas.getContext('2d');
    
    // Inicializar elementos
    initEnemies();
    initPosters();
    setupControls();
    
    // NO INICIAR EL BUCLE AUTOMÁTICAMENTE
    GAME.running = false;
    
    // Renderizar pantalla de espera
    renderWaitingScreen();
    
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
    
    // Iniciar bucle del juego
    GAME.running = true;
    gameLoop();
    
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
// INICIALIZAR ENEMIGOS
// ================================
function initEnemies() {
    GAME.enemies = [
        { x: 5 * 64 + 32, y: 5 * 64 + 32, health: 50, type: 'noboa' },
        { x: 10 * 64 + 32, y: 7 * 64 + 32, health: 50, type: 'noboa' },
        { x: 8 * 64 + 32, y: 3 * 64 + 32, health: 50, type: 'noboa' },
        { x: 12 * 64 + 32, y: 9 * 64 + 32, health: 50, type: 'noboa' }
    ];
    console.log('👾 Enemigos Noboa inicializados:', GAME.enemies.length);
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
function setupControls() {
    document.addEventListener('keydown', (e) => {
        GAME.keys[e.code] = true;
        if (e.code === 'Space') {
            e.preventDefault();
            shoot();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        GAME.keys[e.code] = false;
    });
    
    GAME.canvas.addEventListener('click', () => {
        GAME.canvas.requestPointerLock();
    });
    
    document.addEventListener('pointerlockchange', () => {
        GAME.mouseLocked = document.pointerLockElement === GAME.canvas;
    });
    
    document.addEventListener('mousemove', (e) => {
        if (GAME.mouseLocked) {
            GAME.player.angle += e.movementX * 0.003;
        }
    });
}

// ================================
// ACTUALIZAR JUGADOR
// ================================
function updatePlayer() {
    const player = GAME.player;
    let moveX = 0;
    let moveY = 0;
    
    // Movimiento WASD
    if (GAME.keys['KeyW']) {
        moveX += Math.cos(player.angle) * player.speed;
        moveY += Math.sin(player.angle) * player.speed;
    }
    if (GAME.keys['KeyS']) {
        moveX -= Math.cos(player.angle) * player.speed;
        moveY -= Math.sin(player.angle) * player.speed;
    }
    if (GAME.keys['KeyA']) {
        moveX += Math.cos(player.angle - Math.PI/2) * player.speed;
        moveY += Math.sin(player.angle - Math.PI/2) * player.speed;
    }
    if (GAME.keys['KeyD']) {
        moveX += Math.cos(player.angle + Math.PI/2) * player.speed;
        moveY += Math.sin(player.angle + Math.PI/2) * player.speed;
    }
    
    // Rotación
    if (GAME.keys['ArrowLeft']) player.angle -= player.rotSpeed;
    if (GAME.keys['ArrowRight']) player.angle += player.rotSpeed;
    
    // Verificar colisiones
    const newX = player.x + moveX;
    const newY = player.y + moveY;
    
    if (isWalkable(newX, player.y)) player.x = newX;
    if (isWalkable(player.x, newY)) player.y = newY;
    
    // Verificar colisión con posters
    checkPosterCollision();
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
// ACTUALIZAR BALAS
// ================================
function updateBullets() {
    GAME.bullets = GAME.bullets.filter(bullet => {
        bullet.x += Math.cos(bullet.angle) * bullet.speed;
        bullet.y += Math.sin(bullet.angle) * bullet.speed;
        bullet.distance += bullet.speed;
        
        // Eliminar si viaja muy lejos
        if (bullet.distance > 500) return false;
        
        // Verificar colisión con paredes
        if (!isWalkable(bullet.x, bullet.y)) return false;
        
        // Verificar colisión con enemigos
        for (let i = 0; i < GAME.enemies.length; i++) {
            const enemy = GAME.enemies[i];
            const dx = enemy.x - bullet.x;
            const dy = enemy.y - bullet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 25) {
                enemy.health -= 25;
                if (enemy.health <= 0) {
                    GAME.enemies.splice(i, 1);
                    GAME.score += 100;
                    console.log('💀 Enemigo eliminado! Score:', GAME.score);
                }
                return false; // Eliminar bala
            }
        }
        
        return true;
    });
}

// ================================
// VERIFICAR SI ES CAMINABLE
// ================================
function isWalkable(x, y) {
    const mapX = Math.floor(x / GAME.tileSize);
    const mapY = Math.floor(y / GAME.tileSize);
    
    if (mapX < 0 || mapX >= GAME.mapWidth || mapY < 0 || mapY >= GAME.mapHeight) {
        return false;
    }
    
    const tile = MAP[mapY][mapX];
    return tile === 0 || tile >= 2; // 0 = libre, 2-7 = posters (atravesables)
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
    while (!hitWall && distance < GAME.maxDistance) {
        distance += stepSize;
        
        const testX = GAME.player.x + rayDirX * distance;
        const testY = GAME.player.y + rayDirY * distance;
        
        const mapX = Math.floor(testX / GAME.tileSize);
        const mapY = Math.floor(testY / GAME.tileSize);
        
        if (mapX < 0 || mapX >= GAME.mapWidth || mapY < 0 || mapY >= GAME.mapHeight) {
            hitWall = true;
            distance = GAME.maxDistance;
            hitX = mapX; hitY = mapY;
        }
        else {
            const tile = MAP[mapY][mapX];
            if (tile === 1) {
                hitWall = true;
                wallType = tile;
                hitX = mapX; hitY = mapY;
            }
            else if (tile >= 2 && tile <= 7) {
                // Poster - renderizar como elemento especial
                return { distance, type: 'poster', posterType: tile };
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
    
    // Raycasting optimizado
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
        else if (ray.type === 'poster') {
            renderVaporwavePosterOptimized(ctx, i * columnWidth, wallTop, columnWidth, wallHeight, ray.posterType, correctedDistance);
        }
        
        // Dibujar decals fijos en pared usando mapeo world→screen corregido
        if (ray.type === 'wall' && window.MAP_HOLES && window.MAP_HOLES[ray.mapY] && window.MAP_HOLES[ray.mapY][ray.mapX]) {
            const holes = window.MAP_HOLES[ray.mapY][ray.mapX];
            const columnX = i * columnWidth;
            holes.forEach(decal => {
                // hx: posición horizontal dentro de la columna, usando u
                const hx = columnX + decal.u * columnWidth;
                // hy: posición vertical en la pared, usando v
                const hy = wallTop + decal.v * wallHeight;
                const r = (window.CONFIG_BALA_FINAL && window.CONFIG_BALA_FINAL.radioImpacto) || 4;
                // Borde gris (sin shadow)
                ctx.fillStyle = (window.CONFIG_BALA_FINAL && window.CONFIG_BALA_FINAL.colorImpactoGris) || '#AAAAAA';
                ctx.beginPath(); ctx.arc(hx, hy, r + 1, 0, Math.PI * 2); ctx.fill();
                // Centro negro (sin shadow)
                ctx.fillStyle = (window.CONFIG_BALA_FINAL && window.CONFIG_BALA_FINAL.colorImpactoNegro) || '#000000';
                ctx.beginPath(); ctx.arc(hx, hy, r - 1, 0, Math.PI * 2); ctx.fill();
            });
        }
    }
    
    // Renderizar sprites optimizados
    renderSpritesOptimized();
    
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
// RENDERIZAR SPRITES OPTIMIZADO
// ================================
function renderSpritesOptimized() {
    if (!GAME.enemies) return;
    
    // Distance culling - solo renderizar enemigos cercanos
    const maxRenderDistance = 300;
    
    GAME.enemies.forEach(enemy => {
        const dx = enemy.x - GAME.player.x;
        const dy = enemy.y - GAME.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Skip enemigos muy lejanos o muy cercanos
        if (distance < 10 || distance > maxRenderDistance) return;
        
        const angle = Math.atan2(dy, dx) - GAME.player.angle;
        let normalizedAngle = angle;
        while (normalizedAngle < -Math.PI) normalizedAngle += 2 * Math.PI;
        while (normalizedAngle > Math.PI) normalizedAngle -= 2 * Math.PI;
        
        if (Math.abs(normalizedAngle) > GAME.fov / 2) return;
        
        const screenX = GAME.width / 2 + (normalizedAngle / (GAME.fov / 2)) * (GAME.width / 2);
        const spriteHeight = (40 / distance) * (GAME.height / 2);
        const spriteWidth = spriteHeight;
        
        // Enemigo con color vaporwave (sin efectos costosos)
        const enemyColor = '#ff073a'; // Rojo neón vaporwave
        GAME.ctx.fillStyle = enemyColor;
        
        GAME.ctx.fillRect(
            screenX - spriteWidth / 2,
            GAME.height / 2 - spriteHeight / 2,
            spriteWidth,
            spriteHeight
        );
        
        // Contorno simple
        GAME.ctx.strokeStyle = '#ffffff';
        GAME.ctx.lineWidth = 1;
        GAME.ctx.strokeRect(
            screenX - spriteWidth / 2,
            GAME.height / 2 - spriteHeight / 2,
            spriteWidth,
            spriteHeight
        );
    });
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
// MINIMAPA VAPORWAVE
// ================================
function renderVaporwaveMinimap(ctx) {
    const minimapSize = 80;
    const minimapX = GAME.width - minimapSize - 10;
    const minimapY = 10;
    
    // Fondo del minimapa
    ctx.fillStyle = 'rgba(15, 15, 35, 0.8)';
    ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
    
    // Borde neón
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);
    
    // Dibujar posición del jugador
    const playerMapX = minimapX + (GAME.player.x / (GAME.mapWidth * GAME.tileSize)) * minimapSize;
    const playerMapY = minimapY + (GAME.player.y / (GAME.mapHeight * GAME.tileSize)) * minimapSize;
    
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
// API GLOBAL
// ================================
window.doomGame = {
    init: init,
    start: startGame,  // Nueva función para iniciar desde menú
    stop: () => { 
        GAME.running = false;
        console.log('⏸️ Juego pausado');
    },
    restart: () => {
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
    },
    state: GAME,
    addAmmo: () => { GAME.player.ammo += 20; },
    addHealth: () => { GAME.player.health = 100; }
};

// ================================
// AUTO-INICIO DESHABILITADO
// El juego solo debe iniciarse desde el menú
// ================================
/*
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    setTimeout(init, 100);
}
*/

console.log('🎯 DOOM intermedio cargado - window.doomGame para control');
console.log('⚠️ Auto-inicio deshabilitado - usar menú para iniciar');

// ================================
// EXPOSICIÓN GLOBAL
// ================================
window.GAME = GAME;
window.doomGame = {
    init: init,
    startGame: startGame,
    stopGame: stopGame,
    isRunning: () => GAME.running,
    getPlayer: () => GAME.player,
    getGame: () => GAME
};

// ================================
// PREPARACIÓN INICIAL
// ================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Solo preparar, no iniciar
        init();
    });
} else {
    setTimeout(() => {
        // Solo preparar, no iniciar
        init();
    }, 100);
}
