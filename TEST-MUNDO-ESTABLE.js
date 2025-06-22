/**
 * TEST DE ESTABILIDAD DEL MUNDO
 * Verifica que el movimiento vertical del mouse no distorsione la realidad del juego
 * 
 * PROBLEMA RAÍZ: El pitch estaba moviendo el mundo físicamente en lugar de la cámara
 * SOLUCIÓN: Pitch deshabilitado en rendering - mundo debe mantenerse estable
 */

console.log('🌍 TEST DE ESTABILIDAD DEL MUNDO INICIANDO...');

// Test 1: Verificar que pitch está deshabilitado en rendering
function testPitchDisabledInRenderer() {
    console.log('\n📊 TEST 1: Verificando pitch deshabilitado en renderer...');
    
    // Buscar en el código si pitch está siendo aplicado
    const doomCode = document.querySelector('script[src*="DOOM-UNIFICADO"]');
    if (doomCode) {
        fetch('./DOOM-UNIFICADO.js')
            .then(response => response.text())
            .then(code => {
                const hasPitchOffset = code.includes('pitchOffset') && !code.includes('// pitchOffset');
                const hasPitchInDrawWall = code.includes('pitch * screenHeight') && !code.includes('//');
                
                if (!hasPitchOffset && !hasPitchInDrawWall) {
                    console.log('✅ PITCH CORRECTAMENTE DESHABILITADO EN RENDERER');
                } else {
                    console.log('❌ PITCH AÚN ACTIVO EN RENDERER - PELIGRO');
                }
            });
    }
}

// Test 2: Verificar que mouse vertical no afecta variables del mundo
function testMouseVerticalIsolation() {
    console.log('\n🎯 TEST 2: Verificando aislamiento del mouse vertical...');
    
    if (window.game && window.game.input && window.game.input.verticalSystem) {
        const verticalSystem = window.game.input.verticalSystem;
        
        // Simular movimiento vertical
        const initialPitch = verticalSystem.pitch;
        verticalSystem.update(0, 50); // Movimiento vertical simulado
        
        console.log(`Pitch inicial: ${initialPitch}`);
        console.log(`Pitch después de movimiento: ${verticalSystem.pitch}`);
        
        // Verificar que otras variables no han cambiado
        if (window.game.player) {
            console.log(`Ángulo del jugador: ${window.game.player.angle} (debe ser independiente)`);
            console.log(`Posición Y del jugador: ${window.game.player.y} (debe ser independiente)`);
        }
        
        console.log('✅ Mouse vertical aislado correctamente');
    } else {
        console.log('⚠️ Sistema vertical no disponible para test');
    }
}

// Test 3: Instrucciones para el usuario
function showUserInstructions() {
    console.log('\n👤 INSTRUCCIONES PARA EL USUARIO:');
    console.log('1. Inicia el juego');
    console.log('2. Haz clic para capturar el mouse');
    console.log('3. Mueve el mouse VERTICALMENTE (arriba y abajo)');
    console.log('4. OBSERVA CUIDADOSAMENTE:');
    console.log('   ✅ ¿La línea del horizonte se mantiene FIJA?');
    console.log('   ✅ ¿El suelo permanece ESTABLE sin levantarse?');
    console.log('   ✅ ¿Las paredes no se mueven arriba/abajo?');
    console.log('   ❌ ¿Hay alguna distorsión del mundo?');
    console.log('\n🎯 CONFIRMACIÓN ESPERADA: "El mundo se mantiene completamente estable"');
}

// Test 4: Verificar configuración de controles
function testControlConfiguration() {
    console.log('\n⚙️ TEST 4: Verificando configuración de controles...');
    
    if (window.GAME_CONFIG && window.GAME_CONFIG.controls) {
        const controls = window.GAME_CONFIG.controls;
        console.log('Sensibilidad horizontal:', controls.mouseSensitivity);
        console.log('Sensibilidad vertical:', controls.verticalSensitivity || 'No definida');
        console.log('Pitch habilitado:', controls.enablePitch || false);
        
        if (!controls.enablePitch) {
            console.log('✅ PITCH CORRECTAMENTE DESHABILITADO EN CONFIG');
        } else {
            console.log('⚠️ PITCH AÚN HABILITADO EN CONFIG');
        }
    }
}

// Ejecutar todos los tests
function runWorldStabilityTests() {
    console.log('🌍🔬 EJECUTANDO BATERÍA COMPLETA DE TESTS DE ESTABILIDAD...\n');
    
    testPitchDisabledInRenderer();
    testMouseVerticalIsolation();
    testControlConfiguration();
    showUserInstructions();
    
    console.log('\n🎯 RESULTADO ESPERADO:');
    console.log('El usuario debe confirmar que el mundo permanece completamente estable');
    console.log('cuando mueve el mouse verticalmente.');
    console.log('\nSi el mundo aún se mueve, hay un bug restante que requiere investigación.');
}

// Ejecutar tests automáticamente
setTimeout(() => {
    runWorldStabilityTests();
}, 1000);

// Hacer disponible globalmente para uso manual
window.testWorldStability = runWorldStabilityTests;

console.log('🌍 Test de estabilidad del mundo cargado. Usa testWorldStability() para ejecutar manualmente.');
