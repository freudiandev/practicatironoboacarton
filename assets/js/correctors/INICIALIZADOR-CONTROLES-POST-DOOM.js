// INICIALIZADOR DE CONTROLES POST-DOOM
// Se ejecuta después de que el motor DOOM esté completamente cargado

console.log('🎮 Inicializando controles post-DOOM...');

function inicializarControlesDefinitivos() {
    console.log('🔧 Configurando controles definitivos...');
    
    // Esperar a que el motor DOOM esté completamente listo
    function esperarDoomYConfigurar() {
        if (window.doomGame && window.doomGame.player && window.doomGame.keys) {
            console.log('✅ Motor DOOM detectado, configurando controles...');
            configurarControlesManuales();
        } else {
            console.log('⏳ Esperando motor DOOM...');
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
        
        // WASD para movimiento
        if ([87, 65, 83, 68].includes(codigo)) {
            e.preventDefault();
            teclas[codigo] = true;
            
            // Aplicar al motor DOOM directamente
            if (window.doomGame && window.doomGame.keys) {
                window.doomGame.keys[codigo] = true;
            }
            
            // Aplicar movimiento inmediato
            aplicarMovimientoDirecto(codigo);
        }
        
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
            
            if (window.doomGame && window.doomGame.keys) {
                window.doomGame.keys[codigo] = false;
            }
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
    if (!window.doomGame || !window.doomGame.player) return;
    
    const player = window.doomGame.player;
    const velocidad = 2;
    let nuevaX = player.x;
    let nuevaY = player.y;
    
    switch(keyCode) {
        case 87: // W - adelante
            nuevaX += Math.cos(player.angle) * velocidad;
            nuevaY += Math.sin(player.angle) * velocidad;
            break;
        case 83: // S - atrás
            nuevaX -= Math.cos(player.angle) * velocidad;
            nuevaY -= Math.sin(player.angle) * velocidad;
            break;
        case 65: // A - izquierda (strafe)
            nuevaX += Math.cos(player.angle - Math.PI/2) * velocidad;
            nuevaY += Math.sin(player.angle - Math.PI/2) * velocidad;
            break;
        case 68: // D - derecha (strafe)
            nuevaX += Math.cos(player.angle + Math.PI/2) * velocidad;
            nuevaY += Math.sin(player.angle + Math.PI/2) * velocidad;
            break;
    }
    
    // Verificar límites básicos
    if (nuevaX > 20 && nuevaX < 380 && nuevaY > 20 && nuevaY < 380) {
        player.x = nuevaX;
        player.y = nuevaY;
    }
}

function configurarMouseDirecto() {
    console.log('🖱️ Configurando mouse directo con cámara vertical...');
    
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    
    // Captura de pointer lock
    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
        console.log('🔒 Solicitando captura de mouse...');
    });
    
    // Movimiento de mouse (horizontal + vertical)
    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === canvas) {
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
window.controlesDefinitivos = {
    inicializar: inicializarControlesDefinitivos,
    testear: testearControles,
    configurarMouse: configurarMouseDirecto
};

console.log('✅ Inicializador de controles post-DOOM cargado');
console.log('💡 Comandos disponibles:');
console.log('   window.controlesDefinitivos.testear()');
console.log('   window.controlesDefinitivos.inicializar()');
