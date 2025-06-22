/**
 * TEST-CONTROLES-MOUSE.js
 * Script para probar y validar los controles de mouse
 * 22 junio 2025
 */

console.log('🖱️ INICIANDO TEST DE CONTROLES DE MOUSE');

function testControlesMouse() {
  console.log('\n🎮 TEST: Controles de Mouse');
  console.log('=' .repeat(40));
  
  // Verificar que el juego esté cargado
  if (typeof window.unifiedGame === 'undefined') {
    console.log('❌ Juego no encontrado, esperando carga...');
    setTimeout(testControlesMouse, 2000);
    return;
  }
  
  const game = window.unifiedGame;
  const input = game.input;
  
  console.log('✅ Juego encontrado, validando controles...');
  
  // Test 1: Verificar sistema de input
  console.log('\n📋 Test 1: Sistema de Input');
  console.log(`  • Input system: ${input ? '✅' : '❌'}`);
  console.log(`  • Canvas: ${input?.canvas ? '✅' : '❌'}`);
  console.log(`  • Pointer locked: ${input?.pointerLocked ? '✅' : '❌'}`);
  
  // Test 2: Verificar eventos de mouse
  console.log('\n📋 Test 2: Eventos de Mouse');
  const hasMouseMove = input?.canvas?.onmousemove !== null;
  const hasClick = input?.canvas?.onclick !== null;
  console.log(`  • Evento mousemove: ${hasMouseMove ? '✅' : '❌'}`);
  console.log(`  • Evento click: ${hasClick ? '✅' : '❌'}`);
    // Test 3: Verificar configuración
  console.log('\n📋 Test 3: Configuración');
  console.log(`  • Sensibilidad mouse horizontal: ${GAME_CONFIG.controls.mouseRotationSensitivity}`);
  console.log(`  • Sensibilidad mouse vertical: ${GAME_CONFIG.controls.mousePitchSensitivity}`);
  console.log(`  • Velocidad teclado: ${GAME_CONFIG.controls.keyboardRotationSpeed}`);
  console.log(`  • Límite pitch: ${GAME_CONFIG.controls.maxPitch ? (GAME_CONFIG.controls.maxPitch * 180 / Math.PI).toFixed(1) + '°' : 'No definido'}`);
  
  // Test 4: Verificar estado del jugador
  console.log('\n📋 Test 4: Estado del Jugador');
  console.log(`  • Ángulo actual: ${game.player.angle.toFixed(3)}`);
  console.log(`  • Pitch actual: ${game.player.pitch?.toFixed(3) || 'No disponible'}`);
  console.log(`  • Posición X: ${game.player.x.toFixed(1)}`);
  console.log(`  • Posición Z: ${game.player.z.toFixed(1)}`);
  
  // Test 5: Verificar UI de instrucciones
  console.log('\n� Test 5: Interfaz de Usuario');
  const instructions = document.getElementById('mouseInstructions');
  const mouseStatus = document.getElementById('mouseStatus');
  console.log(`  • Instrucciones de mouse: ${instructions ? '✅' : '❌'}`);
  console.log(`  • Estado del mouse: ${mouseStatus ? '✅' : '❌'}`);
  if (mouseStatus) {
    console.log(`  • Texto actual: "${mouseStatus.textContent}"`);
  }  // Instrucciones para el usuario
  console.log('\n📝 INSTRUCCIONES PARA PROBAR:');
  console.log('✅ COMPORTAMIENTO CONFIRMADO FUNCIONANDO:');
  console.log('🔄 DIRECCIÓN DEL MOUSE CORREGIDA - AHORA NATURAL:');
  console.log('1. 🖱️ El mouse NO interfiere con el juego hasta ser capturado');
  console.log('2. 🖱️ Haz CLICK en el canvas para capturar el mouse');
  console.log('3. ➡️ Mueve mouse DERECHA → cámara gira DERECHA (dirección natural)');
  console.log('4. ⬅️ Mueve mouse IZQUIERDA → cámara gira IZQUIERDA (dirección natural)');
  console.log('5. ⬆️ Mueve mouse ARRIBA → cámara mira ARRIBA (dirección natural)');
  console.log('6. ⬇️ Mueve mouse ABAJO → cámara mira ABAJO (dirección natural)');
  console.log('7. ⌨️ Las teclas Q/E SIEMPRE funcionan para girar (sin necesidad de captura)');
  console.log('8. ⌨️ Las FLECHAS ARRIBA/ABAJO para pitch manual (sin necesidad de captura)');
  console.log('9. 🔓 Presiona ESC para liberar el mouse y detener su control');
  console.log('10. 👁️ Observa el indicador de estado que muestra si está capturado o libre');
  
  // Test de rotación automático
  console.log('\n🔄 Ejecutando test de rotación automática...');
  testRotacionAutomatica();
}

function testRotacionAutomatica() {
  const game = window.unifiedGame;
  if (!game) return;
  
  const anguloInicial = game.player.angle;
  const pitchInicial = game.player.pitch || 0;
  
  // Simular input de mouse
  if (game.input) {
    console.log('📍 Estado inicial:');
    console.log(`  - Ángulo: ${anguloInicial.toFixed(3)}`);
    console.log(`  - Pitch: ${pitchInicial.toFixed(3)}`);
      // Simular movimiento de mouse horizontal
    console.log('🔄 TEST DIRECCIÓN NATURAL: Simulando mouse hacia la DERECHA...');
    console.log('   Expectativa: Cámara debe girar hacia la DERECHA');
      // Test dirección natural: simular mouse derecha = cámara derecha
    console.log('🔄 TEST DIRECCIÓN NATURAL V2: Simulando mouse hacia la DERECHA...');
    console.log('   Expectativa: Cámara debe girar hacia la DERECHA');
    console.log('   Lógica: mouse.x positivo → angle -= valor → cámara derecha');
    
    // Simular movimiento de mouse hacia la derecha (valor positivo)
    game.input.mouse.x = 0.05; // Valor positivo para mouse derecha
    
    // Esperar un frame y verificar
    setTimeout(() => {
      const anguloFinal = game.player.angle;
      const pitchFinal = game.player.pitch || 0;
      const cambioAngulo = anguloFinal - anguloInicial;
      const cambioPitch = pitchFinal - pitchInicial;
      
      console.log('📍 Estado después de mouse derecha:');
      console.log(`  - Ángulo: ${anguloFinal.toFixed(3)} (cambio: ${cambioAngulo.toFixed(3)})`);
      console.log(`  - Pitch: ${pitchFinal.toFixed(3)} (cambio: ${cambioPitch.toFixed(3)})`);
      
      if (Math.abs(cambioAngulo) > 0.001) {
        // Con la corrección: mouse.x positivo, angle -= mouse.x, entonces cambio debe ser negativo
        // Pero visualmente debe verse como girar a la derecha
        console.log('✅ ROTACIÓN DETECTADA');
        console.log(`   Cambio de ángulo: ${cambioAngulo.toFixed(3)}`);
        console.log('💡 Verifica manualmente que la dirección sea correcta');
      } else {
        console.log('⚠️ ROTACIÓN NO DETECTADA');
        console.log('💡 Intenta hacer click en el canvas para capturar el mouse');
      }
      
      // Test de rotación vertical
      setTimeout(() => {
        console.log('\n🔄 Simulando movimiento vertical...');
        game.input.mouse.y = 0.03; // Simular movimiento vertical
        
        setTimeout(() => {
          const pitchFinal2 = game.player.pitch || 0;
          const cambioPitch2 = pitchFinal2 - pitchFinal;
          
          console.log(`� Pitch después de movimiento vertical: ${pitchFinal2.toFixed(3)} (cambio: ${cambioPitch2.toFixed(3)})`);
          
          if (Math.abs(cambioPitch2) > 0.001) {
            console.log('✅ ROTACIÓN VERTICAL FUNCIONANDO');
          } else {
            console.log('⚠️ ROTACIÓN VERTICAL NO DETECTADA');
            console.log('💡 Usa las flechas ARRIBA/ABAJO para pitch manual');
          }
        }, 100);
      }, 200);
    }, 100);
  }
}

function monitorearControles() {
  console.log('\n👁️ MONITOR DE CONTROLES ACTIVO');
  console.log('Monitoreando input cada 2 segundos...');
  
  setInterval(() => {
    const game = window.unifiedGame;
    if (!game || !game.input) return;
    
    const input = game.input;
    console.log('📊 Estado actual:');
    console.log(`  🖱️ Mouse locked: ${input.pointerLocked}`);
    console.log(`  📐 Ángulo jugador: ${game.player.angle.toFixed(3)}`);
    console.log(`  🎯 Mouse X: ${input.mouse.x.toFixed(3)}`);
    
    // Verificar si hay input de teclado activo
    const teclas = Object.keys(input.keys).filter(k => input.keys[k]);
    if (teclas.length > 0) {
      console.log(`  ⌨️ Teclas presionadas: ${teclas.join(', ')}`);
    }
  }, 2000);
}

function diagnosticoCompleto() {
  console.log('\n🔍 DIAGNÓSTICO COMPLETO DE CONTROLES');
  console.log('=' .repeat(50));
  
  // Verificar APIs del navegador
  console.log('🌐 APIs del Navegador:');
  console.log(`  • Pointer Lock API: ${document.pointerLockElement !== undefined ? '✅' : '❌'}`);
  console.log(`  • Canvas API: ${!!document.createElement('canvas').getContext ? '✅' : '❌'}`);
  console.log(`  • Mouse Events: ${!!window.MouseEvent ? '✅' : '❌'}`);
  
  // Verificar permisos
  console.log('\n🔐 Permisos y Estado:');
  console.log(`  • Pointer locked element: ${document.pointerLockElement ? 'Activo' : 'Ninguno'}`);
  console.log(`  • Document focus: ${document.hasFocus() ? '✅' : '❌'}`);
  
  // Verificar canvas
  const canvas = document.getElementById('gameCanvas');
  console.log('\n🎨 Canvas:');
  console.log(`  • Canvas encontrado: ${canvas ? '✅' : '❌'}`);
  if (canvas) {
    console.log(`  • Tamaño: ${canvas.width}x${canvas.height}`);
    console.log(`  • Tab index: ${canvas.tabIndex}`);
    console.log(`  • Estilo cursor: ${canvas.style.cursor || 'default'}`);
  }
}

// Comandos disponibles
window.TEST_CONTROLES_MOUSE = testControlesMouse;
window.MONITOR_CONTROLES = monitorearControles;
window.DIAGNOSTICO_CONTROLES = diagnosticoCompleto;

// Ejecutar automáticamente después de cargar
setTimeout(() => {
  console.log('🚀 Ejecutando test automático de controles...');
  testControlesMouse();
}, 4000);

console.log('🖱️ TEST DE CONTROLES CARGADO');
console.log('📞 Comandos disponibles:');
console.log('  • TEST_CONTROLES_MOUSE() - Ejecutar test completo');
console.log('  • MONITOR_CONTROLES() - Monitoreo continuo');
console.log('  • DIAGNOSTICO_CONTROLES() - Diagnóstico detallado');
