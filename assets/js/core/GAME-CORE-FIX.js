// ================================
// DOOM GAME CORE FIX - SINGLE UNIFIED SYSTEM
// Fixes the infinite initialization loops and rendering issues
// ================================

console.log('🔧 CORE FIX: Iniciando corrección unificada del juego...');

// Stop all existing initialization loops
window.CORE_FIX_ACTIVE = true;

// ================================
// STOP INFINITE LOOPS
// ================================
function stopInfiniteLoops() {
    // Clear any existing intervals that might be causing loops
    if (window.unifiedSystemInterval) {
        clearInterval(window.unifiedSystemInterval);
        window.unifiedSystemInterval = null;
    }
    
    // Mark systems as initialized to prevent re-initialization
    if (window.SistemaDoomUnificado) {
        window.SistemaDoomUnificado.estado.iniciado = true;
        window.SistemaDoomUnificado.estado.juegoActivo = true;
    }
    
    console.log('✅ CORE FIX: Bucles infinitos detenidos');
}

// ================================
// ENSURE PROPER GAME INITIALIZATION
// ================================
function ensureGameInit() {
    if (!window.GAME) {
        console.error('❌ CORE FIX: GAME object not found');
        return false;
    }
    
    // Ensure canvas and context exist
    if (!window.GAME.canvas) {
        window.GAME.canvas = document.getElementById('gameCanvas');
    }
    
    if (!window.GAME.ctx && window.GAME.canvas) {
        window.GAME.ctx = window.GAME.canvas.getContext('2d');
    }
    
    if (!window.GAME.canvas || !window.GAME.ctx) {
        console.error('❌ CORE FIX: Canvas or context not available');
        return false;
    }
    
    // Set proper canvas size
    if (window.GAME.canvas.width < 100) window.GAME.canvas.width = 800;
    if (window.GAME.canvas.height < 100) window.GAME.canvas.height = 600;
    
    // Ensure game dimensions match canvas
    window.GAME.width = window.GAME.canvas.width;
    window.GAME.height = window.GAME.canvas.height;
    
    console.log('✅ CORE FIX: Canvas configurado correctamente', window.GAME.width + 'x' + window.GAME.height);
    return true;
}

// ================================
// FIX RENDER3D FUNCTION
// ================================
function fixRender3D() {
    if (!window.GAME || !window.GAME.ctx) return;
    
    // Ensure we have a working render3D function
    window.render3D = function() {
        const ctx = window.GAME.ctx;
        if (!ctx) return;
        
        // Clear canvas
        ctx.clearRect(0, 0, window.GAME.width, window.GAME.height);
        
        // Draw sky (top half)
        ctx.fillStyle = '#8338ec';  // Purple sky
        ctx.fillRect(0, 0, window.GAME.width, window.GAME.height / 2);
        
        // Draw floor (bottom half)
        ctx.fillStyle = '#06ffa5';  // Green floor
        ctx.fillRect(0, window.GAME.height / 2, window.GAME.width, window.GAME.height / 2);
        
        // Improved raycasting for walls
        if (window.GAME.player && typeof castRay === 'function') {
            const numRays = 120; // Reduced for better performance
            const fov = Math.PI / 3; // 60 degrees
            const rayStepAngle = fov / numRays;
            const columnWidth = window.GAME.width / numRays;
            
            for (let i = 0; i < numRays; i++) {
                const rayAngle = window.GAME.player.angle - fov / 2 + i * rayStepAngle;
                const ray = castRay(rayAngle);
                const correctedDistance = ray.distance * Math.cos(rayAngle - window.GAME.player.angle);
                const wallHeight = (64 / Math.max(correctedDistance, 1)) * (window.GAME.height / 2);
                const wallTop = (window.GAME.height - wallHeight) / 2;
                
                if (ray.type === 'wall') {
                    // Draw wall column with gradient effect
                    const brightness = Math.max(0.2, 1 - correctedDistance / 400);
                    const baseColor = '#ff006e'; // Pink base
                    const r = 255;
                    const g = Math.floor(0 * brightness);
                    const b = Math.floor(110 * brightness);
                    
                    // Create gradient for depth effect
                    const gradient = ctx.createLinearGradient(0, wallTop, 0, wallTop + wallHeight);
                    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${brightness})`);
                    gradient.addColorStop(1, `rgba(${Math.floor(r * 0.6)}, ${g}, ${Math.floor(b * 0.6)}, ${brightness})`);
                    
                    ctx.fillStyle = gradient;
                    ctx.fillRect(i * columnWidth, wallTop, columnWidth + 1, wallHeight);
                    
                    // Add wall edges for better definition
                    if (i % 5 === 0) {
                        ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.3})`;
                        ctx.fillRect(i * columnWidth, wallTop, 1, wallHeight);
                    }
                }
            }
        }
        
        // Draw enemies as sprites
        if (window.GAME.enemies && window.GAME.enemies.length > 0) {
            drawEnemySprites(ctx);
        }
        
        // Draw HUD
        drawSimpleHUD(ctx);
    };
    
    console.log('✅ CORE FIX: render3D function fixed');
}

// ================================
// DRAW ENEMY SPRITES
// ================================
function drawEnemySprites(ctx) {
    if (!window.GAME.enemies || window.GAME.enemies.length === 0) return;
    
    // Sort enemies by distance (far to near) for proper depth rendering
    const enemiesWithDistance = window.GAME.enemies.map(enemy => {
        const dx = enemy.x - window.GAME.player.x;
        const dy = enemy.y - window.GAME.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return { enemy, distance };
    }).sort((a, b) => b.distance - a.distance);
    
    enemiesWithDistance.forEach(function({ enemy, distance }) {
        if (!enemy.active) return;
        
        const dx = enemy.x - window.GAME.player.x;
        const dy = enemy.y - window.GAME.player.y;
        const angle = Math.atan2(dy, dx) - window.GAME.player.angle;
        
        // Normalize angle
        let normalizedAngle = angle;
        while (normalizedAngle > Math.PI) normalizedAngle -= 2 * Math.PI;
        while (normalizedAngle < -Math.PI) normalizedAngle += 2 * Math.PI;
        
        // Check if enemy is in field of view (wider FOV for sprites)
        const fov = Math.PI / 2.5; // Slightly wider than wall FOV
        if (Math.abs(normalizedAngle) > fov / 2) return;
        
        // Project to screen
        const screenX = window.GAME.width / 2 + (normalizedAngle / (fov / 2)) * (window.GAME.width / 2);
        
        // Calculate sprite size based on distance (more realistic scaling)
        const baseSize = 80; // Base sprite size
        const spriteScale = baseSize / Math.max(distance * 0.01, 0.5);
        const spriteW = Math.min(spriteScale, 200); // Cap maximum size
        const spriteH = spriteW * 1.5; // Maintain aspect ratio
        
        // Position sprite at ground level
        const spriteY = (window.GAME.height / 2) - spriteH / 4; // Slightly above ground
        
        // Get sprite image
        const img = window.GAME.enemySprites && window.GAME.enemySprites[enemy.type];
        
        if (img && img.complete && img.naturalWidth > 0) {
            try {
                // Add shadow effect
                ctx.save();
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = '#000';
                ctx.fillRect(screenX - spriteW / 2, spriteY + spriteH - 10, spriteW, 10);
                ctx.restore();
                
                // Draw the sprite with distance-based transparency
                ctx.save();
                const alpha = Math.max(0.3, 1 - distance / 500);
                ctx.globalAlpha = alpha;
                ctx.drawImage(img, screenX - spriteW / 2, spriteY, spriteW, spriteH);
                ctx.restore();
                
                // Add health bar above enemy
                if (enemy.health < 100) {
                    const barWidth = spriteW * 0.8;
                    const barHeight = 4;
                    const barX = screenX - barWidth / 2;
                    const barY = spriteY - 10;
                    
                    // Background
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    ctx.fillRect(barX, barY, barWidth, barHeight);
                    
                    // Health bar
                    const healthPercent = enemy.health / 100;
                    const healthColor = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
                    ctx.fillStyle = healthColor;
                    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
                }
                
            } catch (e) {
                // Fallback: draw colored rectangle with type indicator
                const colors = { casual: '#ff00ff', deportivo: '#00ffff', presidencial: '#ffff00' };
                ctx.fillStyle = colors[enemy.type] || '#ff00ff';
                ctx.fillRect(screenX - 15, spriteY, 30, 40);
                
                // Add type label
                ctx.fillStyle = '#fff';
                ctx.font = '10px Arial';
                ctx.fillText(enemy.type.substring(0, 4), screenX - 15, spriteY - 5);
            }
        } else {
            // Enhanced fallback with better visuals
            const colors = { casual: '#ff00ff', deportivo: '#00ffff', presidencial: '#ffff00' };
            ctx.fillStyle = colors[enemy.type] || '#ff00ff';
            ctx.fillRect(screenX - 15, spriteY, 30, 40);
            
            // Add type label
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(enemy.type.charAt(0).toUpperCase(), screenX, spriteY + 25);
            ctx.textAlign = 'left';
        }
    });
}

// ================================
// DRAW SIMPLE HUD
// ================================
function drawSimpleHUD(ctx) {
    if (!window.GAME.player) return;
    
    // Background with gradient
    const gradient = ctx.createLinearGradient(0, window.GAME.height - 100, 0, window.GAME.height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
    gradient.addColorStop(1, 'rgba(20, 20, 40, 0.9)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, window.GAME.height - 100, window.GAME.width, 100);
    
    // Top border line
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, window.GAME.height - 100);
    ctx.lineTo(window.GAME.width, window.GAME.height - 100);
    ctx.stroke();
    
    // Player stats (left side)
    ctx.font = 'bold 18px Arial';
    
    // Health with color coding
    const healthColor = window.GAME.player.health > 75 ? '#00ff00' : 
                       window.GAME.player.health > 50 ? '#ffff00' : 
                       window.GAME.player.health > 25 ? '#ff8800' : '#ff0000';
    ctx.fillStyle = healthColor;
    ctx.fillText(`SALUD: ${window.GAME.player.health}`, 15, window.GAME.height - 65);
    
    // Ammo with color coding
    const ammoColor = window.GAME.player.ammo > 20 ? '#06ffa5' : 
                     window.GAME.player.ammo > 10 ? '#ffff00' : '#ff0000';
    ctx.fillStyle = ammoColor;
    ctx.fillText(`MUNICIÓN: ${window.GAME.player.ammo}`, 15, window.GAME.height - 45);
    
    // Score
    ctx.fillStyle = '#ffbe0b';
    ctx.fillText(`SCORE: ${window.GAME.score || 0}`, 15, window.GAME.height - 25);
    
    // Game stats (center)
    ctx.fillStyle = '#8338ec';
    const aliveEnemies = window.GAME.enemies ? window.GAME.enemies.filter(e => e.active && e.health > 0).length : 0;
    ctx.fillText(`ENEMIGOS: ${aliveEnemies}`, 300, window.GAME.height - 65);
    
    ctx.fillStyle = '#00f5ff';
    ctx.fillText(`POS: ${Math.floor(window.GAME.player.x)}, ${Math.floor(window.GAME.player.y)}`, 300, window.GAME.height - 45);
    
    // FPS (if available)
    if (window.currentFPS) {
        ctx.fillStyle = '#ff9f1c';
        ctx.fillText(`FPS: ${Math.round(window.currentFPS)}`, 300, window.GAME.height - 25);
    }
    
    // Controls hint (right side)
    ctx.font = '12px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('WASD: Mover', window.GAME.width - 150, window.GAME.height - 75);
    ctx.fillText('MOUSE: Mirar', window.GAME.width - 150, window.GAME.height - 60);
    ctx.fillText('CLICK/SPACE: Disparar', window.GAME.width - 150, window.GAME.height - 45);
    ctx.fillText('ESC: Liberar mouse', window.GAME.width - 150, window.GAME.height - 30);
    
    // Crosshair with dynamic color based on enemy proximity
    const centerX = window.GAME.width / 2;
    const centerY = window.GAME.height / 2;
    
    // Check if aiming at an enemy
    let crosshairColor = '#ff006e'; // Default pink
    if (window.GAME.enemies) {
        const nearbyEnemies = window.GAME.enemies.filter(enemy => {
            if (!enemy.active) return false;
            const dx = enemy.x - window.GAME.player.x;
            const dy = enemy.y - window.GAME.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) - window.GAME.player.angle;
            let normalizedAngle = angle;
            while (normalizedAngle > Math.PI) normalizedAngle -= 2 * Math.PI;
            while (normalizedAngle < -Math.PI) normalizedAngle += 2 * Math.PI;
            return Math.abs(normalizedAngle) < 0.1 && distance < 200; // Close and in center
        });
        
        if (nearbyEnemies.length > 0) {
            crosshairColor = '#ff0000'; // Red when aiming at enemy
        }
    }
    
    ctx.strokeStyle = crosshairColor;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 5;
    ctx.shadowColor = crosshairColor;
    ctx.beginPath();
    ctx.moveTo(centerX - 12, centerY);
    ctx.lineTo(centerX + 12, centerY);
    ctx.moveTo(centerX, centerY - 12);
    ctx.lineTo(centerX, centerY + 12);
    ctx.stroke();
    
    // Center dot
    ctx.fillStyle = crosshairColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Minimap (top right)
    drawMinimap(ctx);
}

// ================================
// DRAW MINIMAP
// ================================
function drawMinimap(ctx) {
    const mapSize = 120;
    const mapX = window.GAME.width - mapSize - 10;
    const mapY = 10;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(mapX, mapY, mapSize, mapSize);
    
    // Border
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(mapX, mapY, mapSize, mapSize);
    
    // Calculate map scale
    const worldSize = 700; // Approximate world size
    const scale = mapSize / worldSize;
    
    // Draw player
    if (window.GAME.player) {
        const playerMapX = mapX + window.GAME.player.x * scale;
        const playerMapY = mapY + window.GAME.player.y * scale;
        
        // Player dot
        ctx.fillStyle = '#ff006e';
        ctx.beginPath();
        ctx.arc(playerMapX, playerMapY, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Player direction
        const dirLength = 15;
        const dirX = playerMapX + Math.cos(window.GAME.player.angle) * dirLength;
        const dirY = playerMapY + Math.sin(window.GAME.player.angle) * dirLength;
        ctx.strokeStyle = '#ff006e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(playerMapX, playerMapY);
        ctx.lineTo(dirX, dirY);
        ctx.stroke();
    }
    
    // Draw enemies
    if (window.GAME.enemies) {
        window.GAME.enemies.forEach(function(enemy, idx) {
            if (!enemy.active) return;
            const ex = mapX + enemy.x * scale;
            const ey = mapY + enemy.y * scale;
            
            // Enemy color based on type
            const colors = { casual: '#ffff00', deportivo: '#00ffff', presidencial: '#ff8800' };
            ctx.fillStyle = colors[enemy.type] || '#ffff00';
            ctx.beginPath();
            ctx.arc(ex, ey, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    // Map title
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Arial';
    ctx.fillText('MAPA', mapX + 5, mapY + 15);
}

// ================================
// FIX GAME LOOP
// ================================
function fixGameLoop() {
    // Ensure we have a proper game loop
    if (window.gameLoopFixed) return;
    window.gameLoopFixed = true;
    
    function coreGameLoop() {
        if (!window.GAME || !window.GAME.running) return;
        
        // Update player (movement handled by controls)
        if (typeof updatePlayer === 'function') {
            updatePlayer();
        }
        
        // Update bullets
        if (typeof updateBullets === 'function') {
            updateBullets();
        }
        
        // Render
        if (typeof window.render3D === 'function') {
            window.render3D();
        }
        
        requestAnimationFrame(coreGameLoop);
    }
    
    // Start the game loop if game is running
    if (window.GAME && window.GAME.running) {
        coreGameLoop();
    }
    
    console.log('✅ CORE FIX: Game loop fixed');
}

// ================================
// FIX CONTROLS
// ================================
function fixControls() {
    if (window.controlsFixed) return;
    window.controlsFixed = true;
    
    const keys = {};
    
    // Keyboard events
    document.addEventListener('keydown', function(e) {
        keys[e.code] = true;
        
        // Handle shooting
        if (e.code === 'Space') {
            e.preventDefault();
            if (typeof shoot === 'function' && window.GAME && window.GAME.player) {
                shoot();
            }
        }
    });
    
    document.addEventListener('keyup', function(e) {
        keys[e.code] = false;
    });
    
    // Mouse controls
    let mouseCapture = false;
    
    if (window.GAME && window.GAME.canvas) {
        window.GAME.canvas.addEventListener('click', function() {
            if (!mouseCapture) {
                window.GAME.canvas.requestPointerLock();
            } else {
                // Shoot on click
                if (typeof shoot === 'function' && window.GAME && window.GAME.player) {
                    shoot();
                }
            }
        });
        
        document.addEventListener('pointerlockchange', function() {
            mouseCapture = document.pointerLockElement === window.GAME.canvas;
        });
        
        document.addEventListener('mousemove', function(e) {
            if (mouseCapture && window.GAME && window.GAME.player) {
                window.GAME.player.angle += e.movementX * 0.003;
            }
        });
    }
    
    // Movement update function
    function updateMovement() {
        if (!window.GAME || !window.GAME.player || !window.GAME.running) return;
        
        const speed = 2;
        let moveX = 0;
        let moveY = 0;
        
        if (keys['KeyW']) {
            moveX += Math.cos(window.GAME.player.angle) * speed;
            moveY += Math.sin(window.GAME.player.angle) * speed;
        }
        if (keys['KeyS']) {
            moveX -= Math.cos(window.GAME.player.angle) * speed;
            moveY -= Math.sin(window.GAME.player.angle) * speed;
        }
        if (keys['KeyA']) {
            moveX += Math.cos(window.GAME.player.angle - Math.PI/2) * speed;
            moveY += Math.sin(window.GAME.player.angle - Math.PI/2) * speed;
        }
        if (keys['KeyD']) {
            moveX += Math.cos(window.GAME.player.angle + Math.PI/2) * speed;
            moveY += Math.sin(window.GAME.player.angle + Math.PI/2) * speed;
        }
        
        // Apply movement with collision detection
        if (typeof isWalkable === 'function') {
            const newX = window.GAME.player.x + moveX;
            const newY = window.GAME.player.y + moveY;
            
            if (isWalkable(newX, window.GAME.player.y)) {
                window.GAME.player.x = newX;
            }
            if (isWalkable(window.GAME.player.x, newY)) {
                window.GAME.player.y = newY;
            }
        }
    }
    
    // Run movement update
    setInterval(updateMovement, 16); // ~60fps
    
    // FPS tracking
    let frameCount = 0;
    let lastTime = performance.now();
    function trackFPS() {
        frameCount++;
        const currentTime = performance.now();
        if (currentTime - lastTime >= 1000) {
            window.currentFPS = frameCount;
            frameCount = 0;
            lastTime = currentTime;
        }
        requestAnimationFrame(trackFPS);
    }
    trackFPS();
    
    console.log('✅ CORE FIX: Controls fixed');
}

// ================================
// APPLY ALL FIXES
// ================================
function applyCoreFixes() {
    console.log('🔧 CORE FIX: Aplicando correcciones...');
    
    // Stop infinite loops first
    stopInfiniteLoops();
    
    // Ensure game is properly initialized
    if (!ensureGameInit()) {
        console.error('❌ CORE FIX: No se pudo inicializar el juego');
        return;
    }
    
    // Fix rendering
    fixRender3D();
    
    // Fix controls
    fixControls();
    
    // Fix game loop
    fixGameLoop();
    
    console.log('✅ CORE FIX: Todas las correcciones aplicadas');
}

// ================================
// AUTO-APPLY FIXES WHEN GAME IS READY
// ================================
function waitForGameAndApplyFixes() {
    if (window.GAME && window.GAME.canvas && document.getElementById('gameCanvas')) {
        applyCoreFixes();
    } else {
        setTimeout(waitForGameAndApplyFixes, 100);
    }
}

// Start the fix process
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForGameAndApplyFixes);
} else {
    waitForGameAndApplyFixes();
}

console.log('✅ CORE FIX: Sistema de corrección cargado');