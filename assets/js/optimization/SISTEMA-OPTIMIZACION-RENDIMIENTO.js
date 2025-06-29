// ============================================================================
// SISTEMA DE OPTIMIZACIÓN DE RENDIMIENTO
// Optimiza el juego para un mejor performance sin perder funcionalidad
// ============================================================================

console.log('⚡ SISTEMA DE OPTIMIZACIÓN DE RENDIMIENTO: Inicializando...');

// ============================================================================
// CONFIGURACIÓN DE OPTIMIZACIÓN
// ============================================================================
const OPTIMIZATION_CONFIG = {
    // Raycasting optimizado
    numRays: 200,           // Reducido de 400 a 200 (50% menos cálculos)
    maxDistance: 600,       // Reducido de 800 a 600
    rayStepSize: 2,         // Incrementado para menos pasos
    
    // Rendering optimizado
    targetFPS: 60,
    maxFrameTime: 16.67,    // 60 FPS target
    skipFrames: false,
    
    // Distance culling
    enemyRenderDistance: 1200,
    bulletRenderDistance: 400,
    effectRenderDistance: 200,
    
    // Simplificación de efectos
    reduceEffects: true,
    simpleShadows: true,
    disableGlow: true,
    optimizeGradients: true,
    
    // Límites de entidades
    maxBullets: 10,
    maxEffects: 20,
    maxImpacts: 15,
    
    // Memory optimization
    gcInterval: 5000,       // Garbage collection cada 5 segundos
    clearOldEffects: true,
    
    // Debug
    showPerformanceInfo: false,
    logOptimizations: true
};

// ============================================================================
// VARIABLES DE RENDIMIENTO (optimización scope)
// ============================================================================
let optLastFrameTime = 0;
let frameCount = 0;
let averageFPS = 60;
let renderTime = 0;
let lastGC = Date.now();
let skipNextFrame = false;

// ============================================================================
// INTERCEPTAR Y OPTIMIZAR MOTOR DOOM
// ============================================================================
function optimizarMotorDoom() {
    if (!window.GAME) {
        console.log('⚠️ Motor DOOM no disponible para optimización');
        return;
    }
    
    console.log('🔧 Aplicando optimizaciones al motor DOOM...');
    
    // 1. Optimizar configuración del juego
    if (window.GAME.numRays) {
        const originalRays = window.GAME.numRays;
        window.GAME.numRays = OPTIMIZATION_CONFIG.numRays;
        console.log(`📉 Rayos reducidos: ${originalRays} → ${OPTIMIZATION_CONFIG.numRays}`);
    }
    
    if (window.GAME.maxDistance) {
        const originalDistance = window.GAME.maxDistance;
        window.GAME.maxDistance = OPTIMIZATION_CONFIG.maxDistance;
        console.log(`📏 Distancia máxima reducida: ${originalDistance} → ${OPTIMIZATION_CONFIG.maxDistance}`);
    }
    
    // 2. Interceptar render3D para optimizaciones
    if (window.render3D && typeof window.render3D === 'function') {
        const originalRender3D = window.render3D;
        
        window.render3D = function() {
            const frameStart = performance.now();
            
            // Skip frame si el anterior tomó mucho tiempo
            if (skipNextFrame && OPTIMIZATION_CONFIG.skipFrames) {
                skipNextFrame = false;
                return;
            }
            
            // Aplicar optimizaciones de rendering
            aplicarOptimizacionesRender();
            
            // Llamar render original optimizado
            originalRender3D.call(this);
            
            // Medir tiempo de frame
            const frameEnd = performance.now();
            renderTime = frameEnd - frameStart;
            
            // Marcar para skip si el frame tomó mucho tiempo
            if (renderTime > OPTIMIZATION_CONFIG.maxFrameTime * 1.5) {
                skipNextFrame = true;
            }
            
            // Actualizar estadísticas
            actualizarEstadisticasRendimiento();
        };
        
        console.log('✅ render3D optimizado');
    }
    
    // 3. Optimizar castRay
    optimizarCastRay();
    
    // 4. Interceptar updateBullets para limitar entidades
    if (window.updateBullets && typeof window.updateBullets === 'function') {
        const originalUpdateBullets = window.updateBullets;
        
        window.updateBullets = function() {
            // Limitar número de balas
            if (window.GAME.bullets && window.GAME.bullets.length > OPTIMIZATION_CONFIG.maxBullets) {
                window.GAME.bullets.splice(0, window.GAME.bullets.length - OPTIMIZATION_CONFIG.maxBullets);
            }
            
            // Limpiar balas lejanas
            if (window.GAME.bullets) {
                window.GAME.bullets = window.GAME.bullets.filter(bullet => {
                    const dx = bullet.x - window.GAME.player.x;
                    const dy = bullet.y - window.GAME.player.y;
                    return Math.sqrt(dx*dx + dy*dy) < OPTIMIZATION_CONFIG.bulletRenderDistance;
                });
            }
            
            originalUpdateBullets.call(this);
        };
        
        console.log('✅ updateBullets optimizado');
    }
}

// ============================================================================
// OPTIMIZAR CASTRAY PARA MEJOR RENDIMIENTO
// ============================================================================
function optimizarCastRay() {
    if (!window.castRay || typeof window.castRay !== 'function') return;
    
    const originalCastRay = window.castRay;
    
    window.castRay = function(angle) {
        const stepSize = OPTIMIZATION_CONFIG.rayStepSize; // Pasos más grandes
        let distance = 0;
        let hitWall = false;
        let wallType = 1;
        
        const rayDirX = Math.cos(angle);
        const rayDirY = Math.sin(angle);
        
        let hitX, hitY;
        while (!hitWall && distance < OPTIMIZATION_CONFIG.maxDistance) {
            distance += stepSize;
            
            const testX = window.GAME.player.x + rayDirX * distance;
            const testY = window.GAME.player.y + rayDirY * distance;
            
            const mapX = Math.floor(testX / window.GAME.tileSize);
            const mapY = Math.floor(testY / window.GAME.tileSize);
            
            // Verificación optimizada de límites
            if (mapX < 0 || mapX >= window.GAME.mapWidth || mapY < 0 || mapY >= window.GAME.mapHeight) {
                hitWall = true;
                distance = OPTIMIZATION_CONFIG.maxDistance;
                hitX = mapX; hitY = mapY;
                break;
            }
            
            // Verificación optimizada del mapa
            const tile = window.MAP[mapY][mapX];
            if (tile === 1) {
                hitWall = true;
                wallType = tile;
                hitX = mapX; hitY = mapY;
                break;
            }
            else if (tile >= 2 && tile <= 7) {
                // Posters eliminados
                return { distance, type: 'wall', wallType: tile };
            }
        }
        
        return { distance, type: 'wall', wallType, mapX: hitX, mapY: hitY };
    };
    
    console.log('✅ castRay optimizado');
}

// ============================================================================
// APLICAR OPTIMIZACIONES DE RENDERING
// ============================================================================
function aplicarOptimizacionesRender() {
    if (!window.GAME || !window.GAME.ctx) return;
    
    const ctx = window.GAME.ctx;
    
    // 1. Optimizar calidad de rendering para velocidad
    if (OPTIMIZATION_CONFIG.reduceEffects) {
        ctx.imageSmoothingEnabled = false; // Disable antialiasing para speed
    }
    
    // 2. Simplificar shadows si están habilitadas
    if (OPTIMIZATION_CONFIG.simpleShadows) {
        const originalShadowBlur = ctx.shadowBlur;
        ctx.shadowBlur = Math.min(originalShadowBlur, 3); // Máximo blur de 3
    }
}

// ============================================================================
// OPTIMIZAR SISTEMA DE BALAS UNIFICADO
// ============================================================================
function optimizarSistemaBalas() {
    if (!window.BalasUnificadas) return;
    
    console.log('🎯 Optimizando sistema de balas...');
    
    // Interceptar la función de renderizado del sistema de balas
    if (window.balasUnificadas) {
        // Limitar balas activas
        if (window.balasUnificadas.length > OPTIMIZATION_CONFIG.maxBullets) {
            window.balasUnificadas.splice(0, window.balasUnificadas.length - OPTIMIZATION_CONFIG.maxBullets);
        }
        
        // Aplicar distance culling a balas
        window.balasUnificadas = window.balasUnificadas.filter(bala => {
            if (!window.GAME || !window.GAME.player) return true;
            
            const dx = bala.x - window.GAME.player.x;
            const dy = bala.y - window.GAME.player.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            return distance < OPTIMIZATION_CONFIG.bulletRenderDistance;
        });
    }
    
    // Limitar impactos
    if (window.impactosUnificados && window.impactosUnificados.length > OPTIMIZATION_CONFIG.maxImpacts) {
        window.impactosUnificados.splice(0, window.impactosUnificados.length - OPTIMIZATION_CONFIG.maxImpacts);
    }
    
    // Limitar efectos de disparo
    if (window.efectosDisparo && window.efectosDisparo.length > OPTIMIZATION_CONFIG.maxEffects) {
        window.efectosDisparo.splice(0, window.efectosDisparo.length - OPTIMIZATION_CONFIG.maxEffects);
    }
    
    console.log('✅ Sistema de balas optimizado');
}

// ============================================================================
// OPTIMIZAR RENDERIZADO DE SPRITES
// ============================================================================
function optimizarSprites() {
    if (!window.renderSprites || typeof window.renderSprites !== 'function') return;
    
    const originalRenderSprites = window.renderSprites;
    
    window.renderSprites = function() {
        if (!window.GAME || !window.GAME.enemies) return;
        
        // Distance culling para enemigos
        const enemigosCercanos = window.GAME.enemies.filter(enemy => {
            const dx = enemy.x - window.GAME.player.x;
            const dy = enemy.y - window.GAME.player.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            return distance < OPTIMIZATION_CONFIG.enemyRenderDistance;
        });
        
        // Temporarily replace enemies array for rendering
        const originalEnemies = window.GAME.enemies;
        window.GAME.enemies = enemigosCercanos;
        
        // Call original render
        originalRenderSprites.call(this);
        
        // Restore original enemies array
        window.GAME.enemies = originalEnemies;
    };
    
    console.log('✅ Renderizado de sprites optimizado');
}

// ============================================================================
// DESACTIVAR SISTEMAS PESADOS DE IA
// ============================================================================
function optimizarSistemasIA() {
    console.log('🤖 Optimizando sistemas de IA...');
    
    // Pausar Learning Memory en modo alto rendimiento
    if (window.learningMemory && window.learningMemory.pausar) {
        window.learningMemory.pausar();
        console.log('⏸️ Learning Memory pausado para mejor rendimiento');
    }
    
    // Reducir frecuencia de logging
    const originalConsoleLog = console.log;
    let logCount = 0;
    const maxLogsPerSecond = 10;
    
    console.log = function(...args) {
        logCount++;
        if (logCount % Math.max(1, Math.floor(60 / maxLogsPerSecond)) === 0) {
            originalConsoleLog.apply(console, args);
        }
    };
    
    console.log('✅ Sistemas de IA optimizados');
}

// ============================================================================
// GARBAGE COLLECTION Y LIMPIEZA DE MEMORIA
// ============================================================================
function limpiezaMemoria() {
    const ahora = Date.now();
    
    if (ahora - lastGC > OPTIMIZATION_CONFIG.gcInterval) {
        // Limpiar efectos viejos
        if (OPTIMIZATION_CONFIG.clearOldEffects && window.efectosDisparo) {
            const tiempoLimite = ahora - 10000; // 10 segundos
            window.efectosDisparo = window.efectosDisparo.filter(efecto => 
                efecto.timestamp > tiempoLimite
            );
        }
        
        // Limpiar impactos viejos
        if (window.impactosUnificados) {
            const tiempoLimite = ahora - 30000; // 30 segundos
            window.impactosUnificados = window.impactosUnificados.filter(impacto => 
                impacto.timestamp > tiempoLimite
            );
        }
        
        // Forzar garbage collection si está disponible
        if (window.gc && typeof window.gc === 'function') {
            window.gc();
        }
        
        lastGC = ahora;
        
        if (OPTIMIZATION_CONFIG.logOptimizations) {
            console.log('🧹 Limpieza de memoria ejecutada');
        }
    }
}

// ============================================================================
// ACTUALIZAR ESTADÍSTICAS DE RENDIMIENTO
// ============================================================================
function actualizarEstadisticasRendimiento() {
    const currentTime = performance.now();
    
    if (optLastFrameTime > 0) {
        const deltaTime = currentTime - optLastFrameTime;
        const currentFPS = 1000 / deltaTime;
        
        // Promedio móvil simple
        averageFPS = (averageFPS * 0.9) + (currentFPS * 0.1);
        
        frameCount++;
        
        // Mostrar información cada 60 frames
        if (frameCount % 60 === 0 && OPTIMIZATION_CONFIG.showPerformanceInfo) {
            console.log(`📊 Rendimiento: ${averageFPS.toFixed(1)} FPS | Render: ${renderTime.toFixed(2)}ms`);
        }
    }
    
    optLastFrameTime = currentTime;
}

// ============================================================================
// MONITOR DE RENDIMIENTO
// ============================================================================
function monitorearRendimiento() {
    setInterval(() => {
        // Aplicar optimizaciones dinámicas basadas en FPS
        if (averageFPS < 30) {
            // Rendimiento muy bajo - aplicar optimizaciones agresivas
            OPTIMIZATION_CONFIG.numRays = Math.max(100, OPTIMIZATION_CONFIG.numRays - 20);
            OPTIMIZATION_CONFIG.maxDistance = Math.max(400, OPTIMIZATION_CONFIG.maxDistance - 50);
            OPTIMIZATION_CONFIG.skipFrames = true;
            
            if (window.GAME) {
                window.GAME.numRays = OPTIMIZATION_CONFIG.numRays;
                window.GAME.maxDistance = OPTIMIZATION_CONFIG.maxDistance;
            }
            
            console.log('🔥 Rendimiento bajo detectado - aplicando optimizaciones agresivas');
        } else if (averageFPS > 50) {
            // Rendimiento bueno - relajar optimizaciones ligeramente
            OPTIMIZATION_CONFIG.skipFrames = false;
        }
        
        // Ejecutar limpieza de memoria
        limpiezaMemoria();
        
        // Optimizar sistemas activos
        optimizarSistemaBalas();
        
    }, 2000); // Cada 2 segundos
}

// ============================================================================
// API DE CONTROL DE OPTIMIZACIÓN
// ============================================================================
window.OptimizacionRendimiento = {
    // Configuración
    config: OPTIMIZATION_CONFIG,
    
    // Estado
    estado: () => ({
        fps: Math.round(averageFPS),
        renderTime: Math.round(renderTime * 100) / 100,
        frameCount: frameCount,
        optimizacionesActivas: true,
        configuracion: OPTIMIZATION_CONFIG
    }),
    
    // Controles
    activar: () => {
        inicializarOptimizaciones();
        console.log('✅ Optimizaciones activadas');
    },
    
    desactivar: () => {
        // Restaurar valores originales si es posible
        if (window.GAME) {
            window.GAME.numRays = 400;
            window.GAME.maxDistance = 800;
        }
        console.log('❌ Optimizaciones desactivadas');
    },
    
    // Presets de rendimiento
    rendimientoAlto: () => {
        OPTIMIZATION_CONFIG.numRays = 150;
        OPTIMIZATION_CONFIG.maxDistance = 500;
        OPTIMIZATION_CONFIG.reduceEffects = true;
        OPTIMIZATION_CONFIG.disableGlow = true;
        aplicarConfiguracion();
        console.log('🚀 Modo rendimiento alto activado');
    },
    
    calidadAlta: () => {
        OPTIMIZATION_CONFIG.numRays = 250;
        OPTIMIZATION_CONFIG.maxDistance = 700;
        OPTIMIZATION_CONFIG.reduceEffects = false;
        OPTIMIZATION_CONFIG.disableGlow = false;
        aplicarConfiguracion();
        console.log('🎨 Modo calidad alta activado');
    },
    
    // Debug
    mostrarInfo: (mostrar = true) => {
        OPTIMIZATION_CONFIG.showPerformanceInfo = mostrar;
        console.log(`📊 Información de rendimiento ${mostrar ? 'activada' : 'desactivada'}`);
    }
};

// ============================================================================
// APLICAR CONFIGURACIÓN
// ============================================================================
function aplicarConfiguracion() {
    if (window.GAME) {
        window.GAME.numRays = OPTIMIZATION_CONFIG.numRays;
        window.GAME.maxDistance = OPTIMIZATION_CONFIG.maxDistance;
    }
}

// ============================================================================
// INICIALIZACIÓN DE OPTIMIZACIONES
// ============================================================================
function inicializarOptimizaciones() {
    console.log('⚡ Iniciando sistema de optimización...');
    
    // Esperar a que el motor DOOM esté listo
    function intentarOptimizacion() {
        if (window.GAME && window.GAME.running) {
            console.log('🎮 Motor DOOM detectado, aplicando optimizaciones...');
            
            optimizarMotorDoom();
            optimizarSistemaBalas();
            optimizarSprites();
            optimizarSistemasIA();
            
            // Iniciar monitor de rendimiento
            monitorearRendimiento();
            
            console.log('✅ Todas las optimizaciones aplicadas');
            console.log(`📈 Rayos reducidos a ${OPTIMIZATION_CONFIG.numRays}`);
            console.log(`📏 Distancia máxima: ${OPTIMIZATION_CONFIG.maxDistance}`);
            console.log('🎯 Sistema optimizado para mejor rendimiento');
            
        } else {
            console.log('⏳ Esperando motor DOOM...');
            setTimeout(intentarOptimizacion, 1000);
        }
    }
    
    // Iniciar con delay
    setTimeout(intentarOptimizacion, 500);
}

// ============================================================================
// AUTO-INICIALIZACIÓN
// ============================================================================
console.log('⚡ Sistema de optimización cargado');
console.log('📊 Configuración objetivo: 60 FPS, rayos reducidos, efectos optimizados');

// Inicializar automáticamente
setTimeout(inicializarOptimizaciones, 2000);

// También inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(inicializarOptimizaciones, 3000);
    });
} else {
    setTimeout(inicializarOptimizaciones, 3000);
}
