// ============================================================================
// SISTEMA BALA UNIFICADO DEFINITIVO - REEMPLAZO COMPLETO
// Registrado en Learning Memory como sistema ÚNICO y FINAL
// Reemplaza TODOS los sistemas anteriores de balas
// ============================================================================

console.log('🎯 SISTEMA BALA UNIFICADO DEFINITIVO: Inicializando...');

// REGISTRO EN LEARNING MEMORY
if (window.learningMemory && window.learningMemory.registrarEvento) {
    window.learningMemory.registrarEvento('ANALISIS_SISTEMAS_BALAS', {
        sistemasEncontrados: [
            'SISTEMA-DEFINITIVO-BALAS.js',
            'CORRECTOR-BALA-RECTA-IMPACTOS.js', 
            'CORRECTOR-BALA-RECTA-IMPACTOS-V3.js',
            'CORRECTOR-ULTRA-SIMPLE.js',
            'CORRECTOR-DIRECCION-CRUZ-ROJA.js',
            'EFECTOS-BALA.js (multiple versions)',
            'SISTEMA-DISPARO.js',
            'SISTEMA-DISPARO-AVANZADO-CLEAN.js'
        ],
        problemasDetectados: [
            'Múltiples sistemas modificando GAME.bullets al mismo tiempo',
            'Conflictos entre render3D interceptors',
            'Duplicación de event listeners para disparos',
            'Sistemas sobrescribiendo funciones del motor DOOM',
            'Configuraciones conflictivas de velocity y rendering'
        ],
        solucionImplementada: 'Sistema único que intercepta updateBullets y render3D del motor original'
    });
}

// ============================================================================
// CONFIGURACIÓN ÚNICA Y DEFINITIVA (MEJORADA VISUALMENTE)
// ============================================================================
const CONFIG_BALA_FINAL = {
    velocidad: 24,           // Velocidad duplicada (doble) para mejor trayectoria
    cadenciaMs: 200,         // Cadencia más realista
    radioImpacto: 4,         // Impactos más pequeños y precisos
    radioBalas: 2,           // Balas pequeñas y negras
    colorBala: '#000000',    // Balas negras como solicita
    colorImpactoNegro: '#000000',     // Centro negro del impacto
    colorImpactoGris: '#AAAAAA',      // Borde gris claro del impacto
    colorCruzRoja: '#FF0000',         // Cruz roja para apuntar
    tamañoCruz: 15,          // Tamaño de la cruz roja
    maxImpactos: 30,         // Más impactos visibles
    vidaBala: 100,           // Vida más larga para trayectorias visibles
    efectosHumo: true,       // Activar efectos de humo
    efectosChispas: true     // Activar efectos de chispas
};

// Variables globales ÚNICAS
const GRAVEDAD = 0.1;  // ligero decaimiento vertical
let balasUnificadas = [];
let impactosUnificados = [];
let ultimoDisparoUnificado = 0;
let efectosDisparo = [];      // Para humo y chispas
let mouseCapturado = false;   // Estado del mouse
let sistemaInicializado = false;

// ============================================================================
// INTERCEPTACIÓN DEL MOTOR DOOM ORIGINAL
// ============================================================================
function inicializarSistemaUnificado() {
    if (sistemaInicializado) {
        console.log('⚠️ Sistema ya inicializado');
        return;
    }
    
    console.log('🔧 Interceptando motor DOOM original...');
    
    // 1. INTERCEPTAR updateBullets del motor original
    if (window.updateBullets && typeof window.updateBullets === 'function') {
        const updateBulletsOriginal = window.updateBullets;
        
        window.updateBullets = function() {
            // Llamar al original para mantener compatibilidad
            updateBulletsOriginal.call(this);
            
            // Agregar nuestro sistema unificado
            actualizarBalasUnificadas();
        };
        
        console.log('✅ updateBullets interceptado');
    }
    
    // 2. INTERCEPTAR render3D del motor original
    if (window.render3D && typeof window.render3D === 'function') {
        const render3DOriginal = window.render3D;
        
        window.render3D = function() {
            // Llamar al original
            render3DOriginal.call(this);
            
            // Agregar nuestro renderizado
            renderizarSistemaUnificado();
        };
        
        console.log('✅ render3D interceptado');
    }
    
    // 3. INTERCEPTAR shoot del motor original
    if (window.shoot && typeof window.shoot === 'function') {
        const shootOriginal = window.shoot;
        
        window.shoot = function() {
            // Llamar al original si es necesario
            if (window.GAME && window.GAME.player && window.GAME.player.ammo > 0) {
                window.GAME.player.ammo--;
            }
            
            // Usar nuestro disparo unificado
            disparoUnificado();
        };
        
        console.log('✅ shoot interceptado');
    }
    
    // 4. CONFIGURAR CONTROLES UNIFICADOS
    configurarControlesUnificados();
    
    // 5. CONFIGURAR DETECCIÓN DE MOUSE
    configurarDeteccionMouse();
    
    sistemaInicializado = true;
    console.log('✅ SISTEMA BALA UNIFICADO: Completamente inicializado');
}

// ============================================================================
// SISTEMA DE DISPARO UNIFICADO (CON DEBUG EXTENDIDO)
// ============================================================================
function disparoUnificado() {
    console.log('🔫 disparoUnificado() llamado');
    
    const ahora = Date.now();
    
    // Control de cadencia
    if (ahora - ultimoDisparoUnificado < CONFIG_BALA_FINAL.cadenciaMs) {
        console.log(`⏱️ Cadencia: esperando ${CONFIG_BALA_FINAL.cadenciaMs - (ahora - ultimoDisparoUnificado)}ms más`);
        return false;
    }
    
    // Verificar motor DOOM con debugging detallado
    console.log('🔍 Verificando motor DOOM...');
    console.log('window.GAME existe:', !!window.GAME);
    
    if (window.GAME) {
        console.log('GAME.player existe:', !!window.GAME.player);
        console.log('GAME.running:', window.GAME.running);
        console.log('GAME.canvas existe:', !!window.GAME.canvas);
    }
    
    if (!window.GAME || !window.GAME.player) {
        console.log('❌ Motor DOOM no disponible - GAME:', !!window.GAME, 'player:', !!(window.GAME && window.GAME.player));
        return false;
    }
    
    const player = window.GAME.player;
    
    // CORRECCIÓN CRÍTICA: El motor DOOM usa player.y, no player.z
    const playerX = player.x || 0;
    const playerY = player.y || 0;  // ¡Usar Y, no Z!
    const playerAngle = player.angle || 0;
    
    console.log(`🎯 Player en posición: (${playerX.toFixed(1)}, ${playerY.toFixed(1)}) ángulo: ${playerAngle.toFixed(3)}`);
    
    // Crear bala que dispara desde la cruz del centro en dirección del jugador
    const bala = {
        x: playerX,
        y: playerY,
        angle: playerAngle,                      // ángulo de disparo
        dx: Math.cos(playerAngle) * CONFIG_BALA_FINAL.velocidad,
        dy: Math.sin(playerAngle) * CONFIG_BALA_FINAL.velocidad,
        originX: playerX,
        originY: playerY,
        vida: CONFIG_BALA_FINAL.vidaBala,
        timestamp: ahora,
        id: 'bala_' + ahora + '_' + Math.random().toString(36).substr(2, 9)
    };
    
    balasUnificadas.push(bala);
    ultimoDisparoUnificado = ahora;
    
    console.log(`💥 BALA CREADA: ${bala.id}`);
    console.log(`   Posición: (${bala.x.toFixed(1)}, ${bala.y.toFixed(1)})`);
    console.log(`   Velocidad: (${bala.dx.toFixed(2)}, ${bala.dy.toFixed(2)})`);
    console.log(`   Ángulo jugador: ${(playerAngle * 180/Math.PI).toFixed(1)}°`);
    console.log(`   Total balas activas: ${balasUnificadas.length}`);
    
    // Sonido si está disponible
    try {
        if (window.Audio8Bits && window.Audio8Bits.sonidoEscopeta) {
            window.Audio8Bits.sonidoEscopeta();
            console.log('🔊 Sonido de disparo reproducido');
        } else {
            console.log('🔇 Audio no disponible');
        }
    } catch (e) {
        console.log('⚠️ Error de audio:', e.message);
    }
    
    // Crear efectos visuales de disparo
    crearEfectosDisparo(playerX, playerY);
    
    return true;
}

// ============================================================================
// ACTUALIZACIÓN DE BALAS UNIFICADA (CORREGIDA PARA Y)
// ============================================================================
function actualizarBalasUnificadas() {
    // Actualizar efectos de disparo
    actualizarEfectosDisparo();
    
    for (let i = balasUnificadas.length - 1; i >= 0; i--) {
        const bala = balasUnificadas[i];
        // Colisión 3D real usando castRay del motor DOOM
        try {
            const ray = castRay(bala.angle);
            if (ray.type === 'wall') {
                // Calcular impacto en coordenadas del mundo
                const impactX = bala.originX + Math.cos(bala.angle) * ray.distance;
                const impactY = bala.originY + Math.sin(bala.angle) * ray.distance;
                crearImpactoUnificado(impactX, impactY, 'env');
                balasUnificadas.splice(i, 1);
                if (window.learningMemory && window.learningMemory.registrarEvento) {
                    window.learningMemory.registrarEvento('COLISION_RAYCAST_3D', {
                        id: bala.id,
                        x: impactX,
                        y: impactY,
                        distance: ray.distance,
                        timestamp: Date.now()
                    });
                }
                continue;
            }
        } catch (e) {
            console.warn('Falló castRay en bala:', e);
        }
        
        // Aplicar gravedad ligera
        bala.dy += GRAVEDAD;
        // Mover bala
        bala.x += bala.dx;
        bala.y += bala.dy;
        bala.vida--;

        // 1. Colisión con enemigos: crear impacto y eliminar bala y enemigo
        let hitEnemy = false;
        if (window.GAME && Array.isArray(window.GAME.enemies)) {
            for (let j = 0; j < window.GAME.enemies.length; j++) {
                const enemy = window.GAME.enemies[j];
                const ex = enemy.x || 0;
                const ey = enemy.y || 0;
                const distE = Math.hypot(bala.x - ex, bala.y - ey);
                const hitRadius = enemy.hitRadius || 72;
                if (distE < hitRadius) {
                    crearImpactoUnificado(bala.x, bala.y);
                    balasUnificadas.splice(i, 1);
                    // Bajar vida en vez de eliminar de inmediato
                    enemy.health -= 50; // Daño por bala
                    enemy.lastHit = Date.now();
                    if (enemy.health <= 0) {
                        window.GAME.enemies.splice(j, 1);
                        if (typeof window.renderEnemiesHTML === 'function') window.renderEnemiesHTML();
                        console.log(`💥 ENEMIGO ELIMINADO por bala ${bala.id} en (${bala.x.toFixed(1)}, ${bala.y.toFixed(1)})`);
                    } else {
                        if (typeof window.renderEnemiesHTML === 'function') window.renderEnemiesHTML();
                        console.log(`💢 ENEMIGO DAÑADO por bala ${bala.id} en (${bala.x.toFixed(1)}, ${bala.y.toFixed(1)}), vida restante: ${enemy.health}`);
                    }
                    hitEnemy = true;
                    break;
                }
            }
        }
        if (hitEnemy) {
            continue;
        }

        // 2. Vida terminada: crear impacto en el suelo
        if (bala.vida <= 0) {
            crearImpactoUnificado(bala.x, bala.y);
            balasUnificadas.splice(i, 1);
            console.log(`💥 BALA ${bala.id} terminó y creó impacto en el suelo en (${bala.x.toFixed(1)}, ${bala.y.toFixed(1)})`);
            continue;
        }

        // 3. Colisión con mundo (paredes): crear impacto
        if (verificarColisionUnificada(bala.x, bala.y)) {
            crearImpactoUnificado(bala.x, bala.y);
            balasUnificadas.splice(i, 1);
            console.log(`💥 IMPACTO UNIFICADO: ${bala.id} en pared en (${bala.x.toFixed(1)}, ${bala.y.toFixed(1)})`);
            if (window.learningMemory && window.learningMemory.registrarEvento) {
                window.learningMemory.registrarEvento('COLISION_RAYCAST_BALA', { id: bala.id, x: bala.x, y: bala.y, timestamp: Date.now() });
            }
            continue;
        }
    }
    
    // Limitar número de impactos
    while (impactosUnificados.length > CONFIG_BALA_FINAL.maxImpactos) {
        impactosUnificados.shift();
    }
}

// ============================================================================
// VERIFICACIÓN DE COLISIONES UNIFICADA (CORREGIDA PARA Y)
// ============================================================================
function verificarColisionUnificada(x, y) {  // Cambiar z por y
    const tileX = Math.floor(x / 64);
    const tileY = Math.floor(y / 64);  // Cambiar z por y
    
    // Verificar límites del mapa
    if (tileX < 0 || tileX >= 16 || tileY < 0 || tileY >= 12) {  // Cambiar z por y
        return true;
    }
    
    // Verificar pared en múltiples fuentes
    let esPared = false;
    
    // Verificar MAP global
    if (window.MAP && window.MAP[tileY] && window.MAP[tileY][tileX] === 1) {  // Cambiar z por y
        esPared = true;
    }
    
    // Verificar GAME.map
    if (window.GAME && window.GAME.map && window.GAME.map[tileY] && window.GAME.map[tileY][tileX] === 1) {  // Cambiar z por y
        esPared = true;
    }
    
    return esPared;
}

// ============================================================================
// CREACIÓN DE IMPACTOS UNIFICADA (CORREGIDA PARA Y)
// ============================================================================
function crearImpactoUnificado(x, y, tipo = 'env') {
    const impacto = {
        x: x,
        y: y,
        type: tipo,
        timestamp: Date.now(),
        id: 'impacto_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    };
    // Calcular posición estática en pantalla
    // No almacenar screenX/screenY; se calculará en renderizado
    
    impactosUnificados.push(impacto);
    // Registrar decal en GRID de impactos (MAP_HOLES)
    try {
        const tileX = Math.floor(x / window.GAME.tileSize);
        const tileY = Math.floor(y / window.GAME.tileSize);
        const u = (x % window.GAME.tileSize) / window.GAME.tileSize;
        const v = (y % window.GAME.tileSize) / window.GAME.tileSize;
        window.MAP_HOLES = window.MAP_HOLES || [];
        window.MAP_HOLES[tileY] = window.MAP_HOLES[tileY] || [];
        window.MAP_HOLES[tileY][tileX] = window.MAP_HOLES[tileY][tileX] || [];
        window.MAP_HOLES[tileY][tileX].push({u, v, time: impacto.timestamp});
    } catch (e) {
        console.warn('Error registrando decal:', e);
    }
}

// ============================================================================
// RENDERIZADO UNIFICADO
// ============================================================================
// ============================================================================
// RENDERIZADO UNIFICADO MEJORADO CON EFECTOS VISUALES
// ============================================================================
function renderizarSistemaUnificado() {
    // Removed LearningMemory decal failure logging (caused spam)
    /*
    if (window.learningMemory && window.learningMemory.consultarMemoria) {
        const historial = window.learningMemory.consultarMemoria('FALLO_DECALS_PANTALLA');
        console.log('🧠 Historial de fallos decals:', historial);
    }
    if (window.learningMemory && window.learningMemory.registrarEvento) {
        window.learningMemory.registrarEvento('FALLO_DECALS_PANTALLA', {
            descripcion: 'Decals quedan fijos en pantalla en lugar de sobre paredes/pisos',
            timestamp: Date.now()
        });
    }
    */
    if (!window.GAME || !window.GAME.ctx || !window.GAME.player) {
        return;
    }
    
    // Detectar estado del mouse
    detectarMouseCapturado();
    
    const ctx = window.GAME.ctx;
    const player = window.GAME.player;
    const canvas = window.GAME.canvas;
    
    if (!canvas) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // ============================================================================
    // 1. RENDERIZAR BALAS NEGRAS PEQUEÑAS
    // ============================================================================
    ctx.save();
    ctx.fillStyle = CONFIG_BALA_FINAL.colorBala; // Negro
    
    // Evitar dibujar balas en la cámara (distancias muy pequeñas)
    balasUnificadas.forEach(bala => {
        const dx = bala.x - player.x;
        const dy = bala.y - player.y;
        const minDist = CONFIG_BALA_FINAL.radioBalas * 2;
        if (Math.sqrt(dx*dx + dy*dy) < minDist) return;  // no dibujar cerca de la cámara
        const distancia = Math.sqrt(dx * dx + dy * dy);
        
        if (distancia < 400) {
            const anguloABala = Math.atan2(dy, dx);
            const anguloRelativo = anguloABala - player.angle;
            
            // Normalizar ángulo
            let angulo = anguloRelativo;
            while (angulo > Math.PI) angulo -= 2 * Math.PI;
            while (angulo < -Math.PI) angulo += 2 * Math.PI;
            
            // Renderizar si está en campo de visión
            if (Math.abs(angulo) < Math.PI / 1.5) {
                const screenX = centerX + angulo * 300;
                const screenY = centerY - (distancia * 0.1); // Perspectiva vertical
                
                // Dibujar bala negra pequeña
                ctx.beginPath();
                ctx.arc(screenX, screenY, CONFIG_BALA_FINAL.radioBalas, 0, Math.PI * 2);
                ctx.fill();
                
                // Trazado de trayectoria (línea sutil desde la cruz)
                if (mouseCapturado) {
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.lineTo(centerX, screenY);
                    ctx.stroke();
                }
            }
        }
    });
    ctx.restore();
    
    // ============================================================================
    // 2. RENDERIZAR ORIFICIO DE IMPACTO
    // ============================================================================
    // 2. RENDERIZAR ORIFICIO DE IMPACTO EN POSICIÓN MUNDIAL
    ctx.save();
    impactosUnificados.forEach(impacto => {
        const dx = impacto.x - player.x;
        const dy = impacto.y - player.y;
        const dist = Math.hypot(dx, dy);
        const angleTo = Math.atan2(dy, dx);
        let angleRel = angleTo - player.angle;
        while (angleRel > Math.PI) angleRel -= 2 * Math.PI;
        while (angleRel < -Math.PI) angleRel += 2 * Math.PI;
        if (Math.abs(angleRel) < Math.PI / 1.5) {
            const screenX = centerX + angleRel * 300;
            const screenY = centerY - dist * 0.1;
            // borde gris claro
            ctx.fillStyle = CONFIG_BALA_FINAL.colorImpactoGris;
            ctx.beginPath(); ctx.arc(screenX, screenY, CONFIG_BALA_FINAL.radioImpacto + 1, 0, Math.PI * 2); ctx.fill();
            // centro negro
            ctx.fillStyle = CONFIG_BALA_FINAL.colorImpactoNegro;
            ctx.beginPath(); ctx.arc(screenX, screenY, CONFIG_BALA_FINAL.radioImpacto - 1, 0, Math.PI * 2); ctx.fill();
            if (window.learningMemory && window.learningMemory.registrarEvento) {
                window.learningMemory.registrarEvento('ORIFICIO_IMPACTO_REAL', { id: impacto.id, x: impacto.x, y: impacto.y, timestamp: Date.now() });
            }
        }
    });
    ctx.restore();

    // ============================================================================
    // 3. RENDERIZAR EFECTOS DE DISPARO (HUMO Y CHISPAS)
    // ============================================================================
    ctx.save();
    
    efectosDisparo.forEach(efecto => {
        const alpha = efecto.vida / efecto.vidaMax;
        
        if (efecto.tipo === 'humo') {
            ctx.fillStyle = `rgba(128, 128, 128, ${alpha * 0.6})`;
            ctx.beginPath();
            ctx.arc(centerX + efecto.x, centerY + efecto.y, efecto.tamaño * alpha, 0, Math.PI * 2);
            ctx.fill();
        } else if (efecto.tipo === 'chispa') {
            ctx.fillStyle = `rgba(255, ${200 * alpha}, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(centerX + efecto.x, centerY + efecto.y, efecto.tamaño, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    ctx.restore();
    
    // ============================================================================
    // 4. RENDERIZAR CRUZ ROJA (SOLO SI MOUSE ESTÁ CAPTURADO)
    // ============================================================================
    if (mouseCapturado) {
        ctx.save();
        ctx.strokeStyle = CONFIG_BALA_FINAL.colorCruzRoja;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        const cruz = CONFIG_BALA_FINAL.tamañoCruz;
        
        // Línea horizontal
        ctx.beginPath();
        ctx.moveTo(centerX - cruz, centerY);
        ctx.lineTo(centerX + cruz, centerY);
        ctx.stroke();
        
        // Línea vertical
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - cruz);
        ctx.lineTo(centerX, centerY + cruz);
        ctx.stroke();
        
        // Punto central
        ctx.fillStyle = CONFIG_BALA_FINAL.colorCruzRoja;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// ============================================================================
// CONTROLES UNIFICADOS (REVISADO)
// ============================================================================
function configurarControlesUnificados() {
    console.log('🎮 Configurando controles unificados...');
    
    // Remover eventos duplicados si existen
    document.removeEventListener('keydown', manejarTeclado);
    
    // Agregar manejador único
    // Listener de teclado eliminado para evitar duplicidad. Control centralizado en INICIALIZADOR-CONTROLES-POST-DOOM.js
    
    console.log('✅ Controles unificados configurados correctamente');
}

// Manejador de teclado separado para evitar duplicados
function manejarTeclado(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        console.log('🔫 ESPACIO presionado - Disparando...');
        const exito = disparoUnificado();
        if (exito) {
            console.log('✅ Disparo ejecutado correctamente');
        } else {
            console.log('❌ Disparo falló');
        }
    }
}

// Configurar click del canvas cuando esté disponible
function configurarClickCanvas() {
    if (window.GAME && window.GAME.canvas) {
        // Remover listener anterior si existe
        window.GAME.canvas.removeEventListener('click', manejarClick);
        
        // Agregar nuevo listener
        window.GAME.canvas.addEventListener('click', manejarClick);
        
        console.log('🖱️ Click del canvas configurado');
        return true;
    }
    return false;
}

// Manejador de click separado
function manejarClick(e) {
    console.log('🖱️ Click detectado - Disparando...');
    const exito = disparoUnificado();
    if (exito) {
        console.log('✅ Disparo por click ejecutado');
    } else {
        console.log('❌ Disparo por click falló');
    }
}

// ============================================================================
// API DE DEBUGGING UNIFICADA (MEJORADA)
// ============================================================================
window.BalasUnificadas = {
    estado: () => {
        const estado = {
            balasActivas: balasUnificadas.length,
            impactosActivos: impactosUnificados.length,
            sistemaInicializado: sistemaInicializado,
            ultimoDisparo: ultimoDisparoUnificado,
            configuracion: CONFIG_BALA_FINAL,
            motorDOOM: {
                existe: !!window.GAME,
                player: !!(window.GAME && window.GAME.player),
                running: !!(window.GAME && window.GAME.running),
                canvas: !!(window.GAME && window.GAME.canvas)
            }
        };
        
        if (window.GAME && window.GAME.player) {
            estado.posicionJugador = {
                x: window.GAME.player.x,
                z: window.GAME.player.z,
                angle: window.GAME.player.angle,
                angleDegrees: (window.GAME.player.angle * 180 / Math.PI).toFixed(1)
            };
        }
        
        return estado;
    },
    
    limpiar: () => {
        balasUnificadas = [];
        impactosUnificados = [];
        console.log('🧹 Sistema unificado limpiado');
        return 'Limpiado correctamente';
    },
    
    disparar: () => {
        console.log('🔫 DISPARO MANUAL desde API');
        return disparoUnificado();
    },
    
    reinicializar: () => {
        sistemaInicializado = false;
        inicializarSistemaUnificado();
        return 'Sistema reinicializado';
    },
    
    // Nueva función para testing
    test: () => {
        console.log('🧪 EJECUTANDO TEST COMPLETO DEL SISTEMA');
        console.log('=====================================');
        
        const estado = window.BalasUnificadas.estado();
        console.log('📊 Estado actual:', estado);
        
        if (!estado.sistemaInicializado) {
            console.log('⚠️ Sistema no inicializado, intentando inicializar...');
            window.BalasUnificadas.reinicializar();
        }
        
        if (!estado.motorDOOM.existe) {
            console.log('❌ Motor DOOM no encontrado');
            return 'ERROR: Motor DOOM no disponible';
        }
        
        if (!estado.motorDOOM.player) {
            console.log('❌ Player no encontrado');
            return 'ERROR: Player no disponible';
        }
        
        console.log('✅ Motor DOOM OK, intentando disparar...');
        const disparo = window.BalasUnificadas.disparar();
        
        if (disparo) {
            console.log('✅ Disparo exitoso');
            setTimeout(() => {
                const nuevoEstado = window.BalasUnificadas.estado();
                console.log(`📈 Balas activas después del disparo: ${nuevoEstado.balasActivas}`);
            }, 100);
            return 'TEST EXITOSO';
        } else {
            console.log('❌ Disparo falló');
            return 'TEST FALLIDO';
        }
    }
};

// ============================================================================
// INICIALIZACIÓN AUTOMÁTICA (REVISADA)
// ============================================================================
// Inicializar cuando el motor DOOM esté listo
function intentarInicializacion() {
    console.log('🔄 Intentando inicializar sistema unificado...');
    
    if (window.GAME && window.GAME.player && window.GAME.running) {
        console.log('✅ Motor DOOM detectado, inicializando...');
        inicializarSistemaUnificado();
        
        // Configurar click del canvas con reintentos
        setTimeout(() => {
            if (!configurarClickCanvas()) {
                console.log('⚠️ Canvas no disponible, reintentando...');
                setTimeout(configurarClickCanvas, 1000);
            }
        }, 500);
        
    } else {
        // Eliminado mensaje de reintento spam
        setTimeout(intentarInicializacion, 500);
    }
}

// Iniciar proceso con delay
console.log('🚀 Programando inicialización del sistema unificado...');
setTimeout(intentarInicializacion, 1000);

// TAMBIÉN intentar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(intentarInicializacion, 2000);
    });
} else {
    setTimeout(intentarInicializacion, 2000);
}

// Registro final en Learning Memory
if (window.learningMemory && window.learningMemory.registrarEvento) {
    window.learningMemory.registrarEvento('SISTEMA_BALA_UNIFICADO_CREADO', {
        reemplaza: [
            'SISTEMA-DEFINITIVO-BALAS.js',
            'CORRECTOR-BALA-RECTA-IMPACTOS.js',
            'CORRECTOR-BALA-RECTA-IMPACTOS-V3.js',
            'CORRECTOR-ULTRA-SIMPLE.js',
            'CORRECTOR-DIRECCION-CRUZ-ROJA.js'
        ],
        metodo: 'Interceptación del motor DOOM original',
        caracteristicas: [
            'Sistema único sin conflictos',
            'Intercepta updateBullets y render3D',
            'Controles unificados Space + Click',
            'Impactos negros con borde gris',
            'API de debugging completa'
        ]
    });
}

console.log('✅ SISTEMA BALA UNIFICADO DEFINITIVO: Completamente cargado');

// ============================================================================
// SISTEMA DE DETECCIÓN DE MOUSE Y EFECTOS VISUALES
// ============================================================================

// Detectar cuando el mouse está capturado
function detectarMouseCapturado() {
    try {
        // Verificar si el pointer está locked
        if (document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement) {
            mouseCapturado = true;
        } else {
            mouseCapturado = false;
        }
    } catch (e) {
        mouseCapturado = false;
    }
    
    return mouseCapturado;
}

// Crear efectos de disparo (humo y chispas)
function crearEfectosDisparo(x, y) {
    if (!CONFIG_BALA_FINAL.efectosHumo && !CONFIG_BALA_FINAL.efectosChispas) return;
    
    const ahora = Date.now();
    
    // Humo
    if (CONFIG_BALA_FINAL.efectosHumo) {
        for (let i = 0; i < 5; i++) {
            efectosDisparo.push({
                tipo: 'humo',
                x: x + (Math.random() - 0.5) * 10,
                y: y + (Math.random() - 0.5) * 10,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                vida: 40 + Math.random() * 20,
                vidaMax: 60,
                tamaño: 3 + Math.random() * 3,
                timestamp: ahora
            });
        }
    }
    
    // Chispas
    if (CONFIG_BALA_FINAL.efectosChispas) {
        for (let i = 0; i < 8; i++) {
            efectosDisparo.push({
                tipo: 'chispa',
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                vida: 20 + Math.random() * 15,
                vidaMax: 35,
                tamaño: 1 + Math.random() * 2,
                timestamp: ahora
            });
        }
    }
}

// Actualizar efectos de disparo
function actualizarEfectosDisparo() {
    for (let i = efectosDisparo.length - 1; i >= 0; i--) {
        const efecto = efectosDisparo[i];
        
        // Mover efecto
        efecto.x += efecto.vx;
        efecto.y += efecto.vy;
        efecto.vida--;
        
        // Aplicar gravedad y fricción
        if (efecto.tipo === 'humo') {
            efecto.vy -= 0.1; // El humo sube
            efecto.vx *= 0.98; // Fricción
            efecto.vy *= 0.98;
        } else if (efecto.tipo === 'chispa') {
            efecto.vy += 0.2; // Las chispas caen
            efecto.vx *= 0.95;
            efecto.vy *= 0.95;
        }
        
        // Eliminar efectos muertos
        if (efecto.vida <= 0) {
            efectosDisparo.splice(i, 1);
        }
    }
}

// ============================================================================
// SISTEMA DE DETECCIÓN DE MOUSE CAPTURADO
// ============================================================================
function configurarDeteccionMouse() {
    // Listener para cuando se captura el mouse
    document.addEventListener('pointerlockchange', () => {
        detectarMouseCapturado();
        console.log('🖱️ Estado mouse capturado:', mouseCapturado);
    });
    
    document.addEventListener('mozpointerlockchange', () => {
        detectarMouseCapturado();
        console.log('🖱️ Estado mouse capturado (Firefox):', mouseCapturado);
    });
    
    document.addEventListener('webkitpointerlockchange', () => {
        detectarMouseCapturado();
        console.log('🖱️ Estado mouse capturado (Webkit):', mouseCapturado);
    });
    
    console.log('✅ Detección de mouse configurada');
}

// ============================================================================
