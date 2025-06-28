// DIAGNÓSTICO RÁPIDO DE CONTROLES
// Ejecutar en consola para verificar estado del sistema

function diagnosticoRapido() {
    console.log('🔍 DIAGNÓSTICO RÁPIDO DE CONTROLES');
    console.log('=====================================');
    
    // 1. Verificar motor DOOM
    console.log('\n1️⃣ Motor DOOM:');
    if (window.doomGame) {
        console.log('✅ Motor DOOM: PRESENTE');
        if (window.doomGame.player) {
            console.log(`✅ Player: x=${window.doomGame.player.x}, y=${window.doomGame.player.y}, angle=${window.doomGame.player.angle}`);
        } else {
            console.log('❌ Player: NO ENCONTRADO');
        }
        if (window.doomGame.keys) {
            console.log('✅ Sistema de teclas: PRESENTE');
        } else {
            console.log('❌ Sistema de teclas: NO ENCONTRADO');
        }
    } else {
        console.log('❌ Motor DOOM: NO ENCONTRADO');
    }
    
    // 2. Verificar corrector maestro
    console.log('\n2️⃣ Corrector Maestro:');
    if (window.correctorMaestro) {
        console.log('✅ Corrector Maestro: PRESENTE');
        const estado = window.correctorMaestro.obtenerEstado();
        console.log('📊 Estado:', estado);
    } else {
        console.log('❌ Corrector Maestro: NO ENCONTRADO');
    }
    
    // 3. Verificar controles definitivos
    console.log('\n3️⃣ Controles Definitivos:');
    if (window.controlesDefinitivos) {
        console.log('✅ Controles Definitivos: PRESENTE');
    } else {
        console.log('❌ Controles Definitivos: NO ENCONTRADO');
    }
    
    // 4. Verificar canvas y pointer lock
    console.log('\n4️⃣ Canvas y Mouse:');
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        console.log('✅ Canvas: PRESENTE');
        console.log(`📐 Dimensiones: ${canvas.width}x${canvas.height}`);
        console.log(`🔒 Pointer Lock: ${document.pointerLockElement === canvas ? 'ACTIVO' : 'INACTIVO'}`);
    } else {
        console.log('❌ Canvas: NO ENCONTRADO');
    }
    
    // 5. Verificar sistemas de juego
    console.log('\n5️⃣ Sistemas de Juego:');
    const sistemas = [
        'SistemaDisparo',
        'sistemaDisparo', 
        'EfectosBala',
        'efectosBala',
        'Audio8Bits',
        'audio8bits'
    ];
    
    sistemas.forEach(sistema => {
        if (window[sistema]) {
            console.log(`✅ ${sistema}: PRESENTE`);
        } else {
            console.log(`❌ ${sistema}: NO ENCONTRADO`);
        }
    });
    
    console.log('\n=====================================');
    console.log('🔧 COMANDOS DE REPARACIÓN:');
    console.log('   diagnosticoRapido() - Este diagnóstico');
    console.log('   window.controlesDefinitivos.inicializar() - Reiniciar controles');
    console.log('   window.controlesDefinitivos.testear() - Probar movimiento');
    console.log('   document.getElementById("gameCanvas").requestPointerLock() - Capturar mouse');
}

// Función para forzar captura de mouse
function forzarCapturaMouse() {
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        canvas.requestPointerLock();
        console.log('🔒 Intentando capturar mouse...');
    } else {
        console.log('❌ Canvas no encontrado');
    }
}

// Función para probar teclas manualmente
function probarTeclas() {
    console.log('🧪 Probando teclas manualmente...');
    
    if (!window.doomGame || !window.doomGame.player) {
        console.log('❌ Motor DOOM no disponible');
        return;
    }
    
    const posInicial = {x: window.doomGame.player.x, y: window.doomGame.player.y};
    console.log('📍 Posición inicial:', posInicial);
    
    // Simular tecla W
    const eventoW = new KeyboardEvent('keydown', {
        key: 'w',
        code: 'KeyW',
        keyCode: 87
    });
    
    document.dispatchEvent(eventoW);
    
    setTimeout(() => {
        const posFinal = {x: window.doomGame.player.x, y: window.doomGame.player.y};
        console.log('📍 Posición final:', posFinal);
        
        const seMovio = posInicial.x !== posFinal.x || posInicial.y !== posFinal.y;
        console.log(seMovio ? '✅ Las teclas funcionan' : '❌ Las teclas no responden');
        
        // Liberar tecla
        const eventoWUp = new KeyboardEvent('keyup', {
            key: 'w',
            code: 'KeyW',
            keyCode: 87
        });
        document.dispatchEvent(eventoWUp);
        
    }, 200);
}

// Exportar funciones globales
window.diagnosticoRapido = diagnosticoRapido;
window.forzarCapturaMouse = forzarCapturaMouse;
window.probarTeclas = probarTeclas;

console.log('🔍 Diagnóstico rápido disponible:');
console.log('   diagnosticoRapido() - Verificar estado completo');
console.log('   forzarCapturaMouse() - Capturar mouse manualmente');
console.log('   probarTeclas() - Probar teclas WASD');
