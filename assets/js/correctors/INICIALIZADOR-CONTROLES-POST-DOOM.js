// INICIALIZADOR DE CONTROLES POST-DOOM
// Se ejecuta después de que el motor DOOM esté completamente cargado

console.log('🎮 Inicializando controles post-DOOM...');

function inicializarControlesDefinitivos() {
    console.log('🔧 Configurando controles definitivos...');
    // Consultar learningMemory antes de modificar controles
    if (window.learningMemory && typeof window.learningMemory.consultarMemoria === 'function') {
        const recomendaciones = window.learningMemory.consultarMemoria('controles_WASD');
        if (Array.isArray(recomendaciones) && recomendaciones.length > 0) {
            console.log('🧠 LM: Recomendaciones para controles:', recomendaciones);
        }
        window.learningMemory.registrarEvento('INICIALIZAR_CONTROLES', { origen: 'INICIALIZADOR-CONTROLES-POST-DOOM.js' });
    }
    // Esperar a que el motor DOOM esté completamente listo
    function esperarDoomYConfigurar() {
        if (window.doomGame && window.doomGame.player && window.doomGame.keys) {
            console.log('✅ Motor DOOM detectado, configurando controles...');
            if (window.learningMemory && typeof window.learningMemory.registrarEvento === 'function') {
                window.learningMemory.registrarEvento('CONTROLES_LISTOS', { estado: 'ok' });
            }
            configurarControlesManuales();
        } else {
            setTimeout(esperarDoomYConfigurar, 500);
        }
    }
    setTimeout(esperarDoomYConfigurar, 1000);
}

function configurarControlesManuales() {
    console.log('⌨️ Configurando controles manuales directos...');
    
    // Configurar controles WASD directos
    const teclas = {
        87: false, // W
        65: false, // A  
        83: false, // S
        68: false  // D
    };
    
    // Listener de teclas presionadas
    document.addEventListener('keydown', (e) => {
        const codigo = e.keyCode || e.which;

        // CORREGIDO: Ya no ignoramos las teclas WASD, ahora las manejamos directamente
        if ([87, 65, 83, 68].includes(e.keyCode || e.which)) {
            teclas[codigo] = true;
            
            // Compatibilidad con ambos sistemas
            if (window.doomGame && window.doomGame.keys) {
                window.doomGame.keys[codigo] = true;
            }
            if (window.GAME && window.GAME.keysPressed) {
                window.GAME.keysPressed[codigo] = true;
            }
            
            // También registrar por código de tecla
            const keyCodeMap = {
                87: 'KeyW',
                65: 'KeyA',
                83: 'KeyS',
                68: 'KeyD'
            };
            
            if (window.GAME && window.GAME.keysPressed && keyCodeMap[codigo]) {
                window.GAME.keysPressed[keyCodeMap[codigo]] = true;
            }
            
            // Registrar tecla presionada en logs para diagnóstico
            console.log(`🎮 Tecla WASD presionada: ${String.fromCharCode(codigo)} (KeyCode: ${codigo})`);
            return; // Manejada específicamente
        }

        // Otras teclas

        // Flechas para rotación y cámara vertical
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            // La rotación horizontal se maneja en el motor DOOM
            if (window.doomGame && window.doomGame.keys) {
                window.doomGame.keys[e.key] = true;
            }
            if (window.GAME && window.GAME.keys) {
                window.GAME.keys[e.key] = true;
            }
        }
        
        // Flechas arriba/abajo para cámara vertical (delegado al sistema CamaraVertical)
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            // El sistema SISTEMA-CAMARA-VERTICAL.js maneja estas teclas automáticamente
            console.log(`📹 Tecla ${e.key} para cámara vertical`);
        }
        
        // Espacio para disparar
        if (codigo === 32) { // Espacio
            e.preventDefault();
            ejecutarDisparo();
        }
    });
    
    // Listener de teclas liberadas
    document.addEventListener('keyup', (e) => {
        const codigo = e.keyCode || e.which;
        
        if ([87, 65, 83, 68].includes(codigo)) {
            teclas[codigo] = false;
            
            // Compatibilidad con todos los sistemas
            if (window.doomGame && window.doomGame.keys) {
                window.doomGame.keys[codigo] = false;
            }
            
            if (window.GAME && window.GAME.keysPressed) {
                window.GAME.keysPressed[codigo] = false;
                
                // También limpiar por código de tecla
                const keyCodeMap = {
                    87: 'KeyW',
                    65: 'KeyA',
                    83: 'KeyS',
                    68: 'KeyD'
                };
                
                if (keyCodeMap[codigo]) {
                    window.GAME.keysPressed[keyCodeMap[codigo]] = false;
                }
            }
            
            console.log(`🎮 Tecla WASD liberada: ${String.fromCharCode(codigo)} (KeyCode: ${codigo})`);
        }
    });
    
    // Configurar mouse
    configurarMouseDirecto();
    
    // Bucle de movimiento continuo
    setInterval(() => {
        Object.keys(teclas).forEach(keyCode => {
            if (teclas[keyCode]) {
                aplicarMovimientoDirecto(parseInt(keyCode));
            }
        });
    }, 16); // 60 FPS
    
    console.log('✅ Controles manuales configurados');
}

function aplicarMovimientoDirecto(keyCode) {
    // SISTEMA DE MOVIMIENTO REACTIVADO
    // Implementación corregida: Ahora funciona con ambos sistemas
    
    // Verificar sistema de LearningMemory
    if (window.learningMemory && typeof window.learningMemory.registrarEvento === 'function') {
        window.learningMemory.registrarEvento('MOVIMIENTO_REACTIVADO', { 
            keyCode, 
            fecha: new Date().toISOString(),
            sistema: 'INICIALIZADOR-CONTROLES-POST-DOOM'
        });
    }
    
    // Verificar sistemas de juego disponibles
    if (!window.GAME && !window.doomGame) {
        console.warn('⚠️ No se encontró ningún sistema de juego activo para aplicar movimiento');
        return;
    }
    
    // Buscar objeto player en cualquier sistema disponible
    const player = (window.GAME && window.GAME.player) || 
                   (window.doomGame && window.doomGame.player);
    
    if (!player) {
        console.warn('❌ No se encontró objeto player en ningún sistema de juego');
        return;
    }
    
    // MOVIMIENTO WASD COMPATIBLE CON MULTIPLE SISTEMAS
    const vel = 1.0; // Velocidad reducida para movimiento controlable
    let nx = player.x, ny = player.y;
    
    switch (keyCode) {
        case 87: // W - Avanzar en la dirección de la mirada
            nx += Math.cos(player.angle || 0) * vel;
            ny += Math.sin(player.angle || 0) * vel;
            break;
        case 83: // S - Retroceder (dirección opuesta)
            nx -= Math.cos(player.angle || 0) * vel;
            ny -= Math.sin(player.angle || 0) * vel;
            break;
        case 65: // A - Izquierda (perpendicular a la mirada)
            nx -= Math.sin(player.angle || 0) * vel;
            ny += Math.cos(player.angle || 0) * vel;
            break;
        case 68: // D - Derecha (perpendicular a la mirada)
            nx += Math.sin(player.angle || 0) * vel;
            ny -= Math.cos(player.angle || 0) * vel;
            break;
        default:
            return; // Si no es WASD, salir
    }
    
    // Verificación de colisiones con WorldPhysics si está disponible
    const worldPhysics = window.WorldPhysics || 
                         (window.GAME && window.GAME.WorldPhysics);
    
    let movimientoRealizado = false;
    
    if (worldPhysics && typeof worldPhysics.checkCollision === 'function') {
        // Mover en X si no colisiona
        if (!worldPhysics.checkCollision(nx, player.y)) {
            player.x = nx;
            movimientoRealizado = true;
        }
        
        // Mover en Y si no colisiona
        if (!worldPhysics.checkCollision(player.x, ny)) {
            player.y = ny;
            movimientoRealizado = true;
        }
    } else {
        // Sin sistema de colisiones, mover directamente
        player.x = nx;
        player.y = ny;
        movimientoRealizado = true;
        console.log('⚠️ Movimiento sin verificación de colisiones (WorldPhysics no disponible)');
    }
    
    // Registrar movimiento en learningMemory si está disponible
    if (movimientoRealizado && window.learningMemory && typeof window.learningMemory.registrarEvento === 'function') {
        window.learningMemory.registrarEvento('MOVIMIENTO_WASD', { 
            tecla: String.fromCharCode(keyCode),
            keyCode, 
            nuevaPos: { x: player.x, y: player.y }
        });
    }
    
    // Registrar en consola para diagnóstico
    if (movimientoRealizado) {
        console.log(`🚶 ${String.fromCharCode(keyCode)}: Movimiento aplicado -> (${player.x.toFixed(2)}, ${player.y.toFixed(2)})`);
    } else {
        console.log(`⛔ ${String.fromCharCode(keyCode)}: Movimiento bloqueado por colisión`);
    }
}

function configurarMouseDirecto() {
    console.log('🖱️ Configurando mouse directo con cámara vertical...');
    
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    
    // Captura de pointer lock
    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
        if (window.GAME) window.GAME.mouseLocked = true;
        console.log('🔒 Solicitando captura de mouse...');
    });
    
    // Movimiento de mouse (horizontal + vertical)
    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === canvas) {
            if (window.GAME) window.GAME.mouseLocked = true;
            // Rotación horizontal (existente)
            if (window.doomGame && window.doomGame.player) {
                const sensibilidad = 0.003;
                window.doomGame.player.angle += e.movementX * sensibilidad;
            }
            if (window.GAME && window.GAME.player) {
                const sensibilidad = 0.003;
                window.GAME.player.angle += e.movementX * sensibilidad;
            }
            // Movimiento vertical (delegado al sistema de cámara vertical)
            // El sistema CamaraVertical maneja automáticamente el movementY
        } else {
            if (window.GAME) window.GAME.mouseLocked = false;
        }
    });
    
    // Disparo con clic del mouse
    canvas.addEventListener('mousedown', (e) => {
        if (document.pointerLockElement === canvas) {
            ejecutarDisparo();
        }
    });
    
    // Escape para liberar mouse
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.exitPointerLock();
            if (window.GAME) window.GAME.mouseLocked = false;
            console.log('🔓 Mouse liberado');
        }
    });
    
    console.log('✅ Mouse configurado con soporte vertical');
}

function ejecutarDisparo() {
    console.log('💥 Ejecutando disparo...');
    
    // Activar sistemas de disparo disponibles
    if (window.SistemaDisparo) {
        window.SistemaDisparo.disparar();
    }
    
    if (window.sistemaDisparo) {
        window.sistemaDisparo.disparar();
    }
    
    // Audio de disparo
    if (window.Audio8Bits) {
        window.Audio8Bits.reproducirDisparo();
    }
    
    if (window.audio8bits) {
        window.audio8bits.reproducirDisparo();
    }
    
    // Efectos visuales
    if (window.EfectosBala) {
        window.EfectosBala.mostrarEffecto();
    }
}

// Función de test para verificar controles
function testearControles() {
    console.log('🧪 Testeando controles...');
    
    if (!window.doomGame || !window.doomGame.player) {
        console.log('❌ Motor DOOM no disponible');
        return false;
    }
    
    const posicionInicial = {
        x: window.doomGame.player.x,
        y: window.doomGame.player.y,
        angle: window.doomGame.player.angle
    };
    
    console.log('📍 Posición inicial:', posicionInicial);
    
    // Simular tecla W
    aplicarMovimientoDirecto(87);
    
    setTimeout(() => {
        const posicionFinal = {
            x: window.doomGame.player.x,
            y: window.doomGame.player.y,
            angle: window.doomGame.player.angle
        };
        
        console.log('📍 Posición final:', posicionFinal);
        
        const seMovio = posicionInicial.x !== posicionFinal.x || 
                       posicionInicial.y !== posicionFinal.y;
        
        console.log(seMovio ? '✅ Test EXITOSO - Controles funcionan' : '❌ Test FALLIDO - Controles no responden');
        
        return seMovio;
    }, 100);
}

// Inicializar cuando el documento esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarControlesDefinitivos);
} else {
    inicializarControlesDefinitivos();
}

// Exportar funciones para uso manual
// Función de diagnóstico de controles WASD
function diagnosticarControlesWASD() {
    console.log('🔎 Iniciando diagnóstico de controles WASD...');
    
    // Verificar sistemas disponibles
    console.log('📊 Sistemas detectados:');
    console.log('   - window.GAME:', window.GAME ? '✅ Disponible' : '❌ No disponible');
    console.log('   - window.doomGame:', window.doomGame ? '✅ Disponible' : '❌ No disponible');
    console.log('   - window.WorldPhysics:', window.WorldPhysics ? '✅ Disponible' : '❌ No disponible');
    console.log('   - window.SistemaControlesUnificado:', window.SistemaControlesUnificado ? '✅ Disponible' : '❌ No disponible');
    
    // Verificar variables de control de teclas
    if (window.GAME) {
        console.log('   - window.GAME.keysPressed:', window.GAME.keysPressed ? '✅ Disponible' : '❌ No disponible');
    }
    
    if (window.doomGame) {
        console.log('   - window.doomGame.keys:', window.doomGame.keys ? '✅ Disponible' : '❌ No disponible');
    }
    
    console.log('✅ Diagnóstico completado. Verifica en la consola cualquier error.');
    
    return {
        mensaje: 'Diagnóstico de controles WASD completado',
        fecha: new Date().toISOString(),
        recomendacion: 'Revisa los mensajes en consola para ver el estado de los sistemas'
    };
}

// Exponer funciones públicas
window.controlesDefinitivos = {
    inicializar: inicializarControlesDefinitivos,
    testear: testearControles,
    configurarMouse: configurarMouseDirecto,
    diagnosticar: diagnosticarControlesWASD
};

// Función para reparar controles WASD
window.repararControlesWASD = function() {
    console.log('🔧 Reparando controles WASD...');
    
    // Reactivar funciones principales
    inicializarControlesDefinitivos();
    
    // Reiniciar variables de control
    if (window.GAME) {
        window.GAME.keysPressed = window.GAME.keysPressed || {};
    }
    
    if (window.doomGame) {
        window.doomGame.keys = window.doomGame.keys || {};
    }
    
    // Mensaje para el usuario
    if (typeof mostrarMensaje === 'function') {
        mostrarMensaje('Controles WASD reparados. Presiona W,A,S,D para probar', 'success');
    }
    
    console.log('✅ Reparación de controles completada');
    
    // Ejecutar diagnóstico
    diagnosticarControlesWASD();
    
    return {
        mensaje: 'Reparación de controles WASD completada',
        fecha: new Date().toISOString()
    };
};

console.log('✅ Inicializador de controles post-DOOM cargado');
console.log('💡 Comandos disponibles:');
console.log('   window.controlesDefinitivos.testear()');
console.log('   window.controlesDefinitivos.inicializar()');
console.log('   window.controlesDefinitivos.diagnosticar()');
console.log('   window.repararControlesWASD()');

// Ejecutar diagnóstico al cargar
setTimeout(function() {
    console.log('🚀 Ejecutando diagnóstico automático de controles WASD...');
    diagnosticarControlesWASD();
}, 2000);
