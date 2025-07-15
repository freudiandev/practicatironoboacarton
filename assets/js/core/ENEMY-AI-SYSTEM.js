// ================================
// ENEMY AI AND MOVEMENT ENHANCEMENT
// Adds better enemy behavior and collision detection
// ================================

console.log('🤖 ENEMY AI: Inicializando sistema de inteligencia artificial...');

// ================================
// ENEMY AI SYSTEM
// ================================
function enhanceEnemyAI() {
    if (!window.GAME || !window.GAME.enemies) return;
    
    // Enhanced enemy movement with basic AI
    window.GAME.enemies.forEach(function(enemy, index) {
        if (!enemy.active || enemy.health <= 0) return;
        
        // Initialize AI properties if not present
        if (!enemy.aiState) {
            enemy.aiState = {
                mode: 'patrol', // patrol, chase, attack
                lastPlayerDistance: 999,
                lastDirectionChange: Date.now(),
                targetX: enemy.x,
                targetY: enemy.y,
                alertLevel: 0
            };
        }
        
        const playerDx = window.GAME.player.x - enemy.x;
        const playerDy = window.GAME.player.y - enemy.y;
        const playerDistance = Math.sqrt(playerDx * playerDx + playerDy * playerDy);
        
        // Update AI state based on player distance
        if (playerDistance < 150) {
            enemy.aiState.mode = 'chase';
            enemy.aiState.alertLevel = Math.min(100, enemy.aiState.alertLevel + 2);
        } else if (playerDistance < 300 && enemy.aiState.alertLevel > 0) {
            enemy.aiState.mode = 'search';
            enemy.aiState.alertLevel = Math.max(0, enemy.aiState.alertLevel - 1);
        } else {
            enemy.aiState.mode = 'patrol';
            enemy.aiState.alertLevel = Math.max(0, enemy.aiState.alertLevel - 1);
        }
        
        // Movement behavior based on AI state
        let moveSpeed = 0.8;
        let newDir = enemy.dir;
        
        switch (enemy.aiState.mode) {
            case 'chase':
                // Move towards player
                newDir = Math.atan2(playerDy, playerDx);
                moveSpeed = 1.5;
                break;
                
            case 'search':
                // Move towards last known player position
                const searchDx = enemy.aiState.targetX - enemy.x;
                const searchDy = enemy.aiState.targetY - enemy.y;
                if (Math.abs(searchDx) > 5 || Math.abs(searchDy) > 5) {
                    newDir = Math.atan2(searchDy, searchDx);
                } else {
                    // Random direction when reached target
                    newDir = Math.random() * 2 * Math.PI;
                    enemy.aiState.targetX = enemy.x + (Math.random() - 0.5) * 200;
                    enemy.aiState.targetY = enemy.y + (Math.random() - 0.5) * 200;
                }
                break;
                
            case 'patrol':
            default:
                // Random patrol movement
                if (Date.now() - enemy.aiState.lastDirectionChange > 3000 + Math.random() * 4000) {
                    newDir = Math.random() * 2 * Math.PI;
                    enemy.aiState.lastDirectionChange = Date.now();
                }
                moveSpeed = 0.5;
                break;
        }
        
        // Update direction smoothly
        enemy.dir = newDir;
        
        // Calculate new position
        const nextX = enemy.x + Math.cos(enemy.dir) * moveSpeed;
        const nextY = enemy.y + Math.sin(enemy.dir) * moveSpeed;
        
        // Check collisions with walls and boundaries
        if (typeof isWalkable === 'function') {
            if (isWalkable(nextX, enemy.y)) {
                enemy.x = nextX;
            } else {
                // Bounce off walls
                enemy.dir = enemy.dir + Math.PI + (Math.random() - 0.5) * 0.5;
                enemy.aiState.lastDirectionChange = Date.now();
            }
            
            if (isWalkable(enemy.x, nextY)) {
                enemy.y = nextY;
            } else {
                // Bounce off walls
                enemy.dir = enemy.dir + Math.PI + (Math.random() - 0.5) * 0.5;
                enemy.aiState.lastDirectionChange = Date.now();
            }
        }
        
        // Store last known player position for search mode
        if (enemy.aiState.mode === 'chase') {
            enemy.aiState.targetX = window.GAME.player.x;
            enemy.aiState.targetY = window.GAME.player.y;
        }
        
        enemy.aiState.lastPlayerDistance = playerDistance;
    });
}

// ================================
// ENHANCED COLLISION DETECTION
// ================================
function enhanceCollisionDetection() {
    if (!window.GAME || !window.GAME.enemies || !window.GAME.player) return;
    
    // Check player-enemy collisions
    window.GAME.enemies.forEach(function(enemy) {
        if (!enemy.active || enemy.health <= 0) return;
        
        const dx = enemy.x - window.GAME.player.x;
        const dy = enemy.y - window.GAME.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If enemy touches player
        if (distance < 30) {
            // Damage player (limited rate)
            if (!enemy.lastDamage || Date.now() - enemy.lastDamage > 1000) {
                window.GAME.player.health = Math.max(0, window.GAME.player.health - 10);
                enemy.lastDamage = Date.now();
                
                // Push player away
                const pushForce = 20;
                const pushX = (window.GAME.player.x - enemy.x) / distance * pushForce;
                const pushY = (window.GAME.player.y - enemy.y) / distance * pushForce;
                
                if (typeof isWalkable === 'function') {
                    const newPlayerX = window.GAME.player.x + pushX;
                    const newPlayerY = window.GAME.player.y + pushY;
                    
                    if (isWalkable(newPlayerX, window.GAME.player.y)) {
                        window.GAME.player.x = newPlayerX;
                    }
                    if (isWalkable(window.GAME.player.x, newPlayerY)) {
                        window.GAME.player.y = newPlayerY;
                    }
                }
                
                console.log('💥 ¡Enemigo te atacó! Salud:', window.GAME.player.health);
            }
        }
    });
    
    // Check bullet-enemy collisions
    if (window.GAME.bullets) {
        window.GAME.bullets.forEach(function(bullet, bulletIndex) {
            window.GAME.enemies.forEach(function(enemy, enemyIndex) {
                if (!enemy.active || enemy.health <= 0) return;
                
                const dx = enemy.x - bullet.x;
                const dy = enemy.y - bullet.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 25) {
                    // Hit enemy
                    enemy.health -= 25;
                    console.log(`🎯 ¡Impacto en ${enemy.type}! Salud restante:`, enemy.health);
                    
                    // Remove bullet
                    if (window.GAME.bullets[bulletIndex]) {
                        window.GAME.bullets.splice(bulletIndex, 1);
                    }
                    
                    // Increase score
                    if (!window.GAME.score) window.GAME.score = 0;
                    window.GAME.score += 10;
                    
                    // Remove enemy if dead
                    if (enemy.health <= 0) {
                        enemy.active = false;
                        window.GAME.score += 50;
                        console.log(`💀 ¡${enemy.type} eliminado! Score:`, window.GAME.score);
                    }
                }
            });
        });
    }
}

// ================================
// GAME STATE CHECKS
// ================================
function checkGameState() {
    if (!window.GAME || !window.GAME.player) return;
    
    // Check if player is dead
    if (window.GAME.player.health <= 0) {
        console.log('💀 GAME OVER - Jugador eliminado');
        // Could show game over screen here
    }
    
    // Check if all enemies are dead
    const aliveEnemies = window.GAME.enemies.filter(e => e.active && e.health > 0).length;
    if (aliveEnemies === 0) {
        console.log('🎉 ¡VICTORIA! Todos los enemigos eliminados');
        // Could show victory screen here
    }
}

// ================================
// START AI SYSTEM
// ================================
function startEnemyAI() {
    if (window.enemyAIRunning) return;
    window.enemyAIRunning = true;
    
    function aiLoop() {
        if (!window.GAME || !window.GAME.running) return;
        
        enhanceEnemyAI();
        enhanceCollisionDetection();
        checkGameState();
        
        setTimeout(aiLoop, 100); // Run AI at 10fps for performance
    }
    
    aiLoop();
    console.log('✅ ENEMY AI: Sistema de inteligencia artificial iniciado');
}

// ================================
// AUTO-START WHEN GAME IS READY
// ================================
function waitForGameAndStartAI() {
    if (window.GAME && window.GAME.enemies && window.GAME.running) {
        startEnemyAI();
    } else {
        setTimeout(waitForGameAndStartAI, 1000);
    }
}

waitForGameAndStartAI();

console.log('✅ ENEMY AI: Sistema cargado y esperando inicio del juego');