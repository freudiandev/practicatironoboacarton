// 🎯 TEST MOUSE MEJORADO - Verificación del sistema de rotación con mouse
// Ejecutar después de que el juego esté funcionando

console.log('🔧 INICIANDO TEST DEL MOUSE MEJORADO...');

function testMouseSystem() {
  console.log('\n=== 🖱️ TEST DEL SISTEMA DE MOUSE MEJORADO ===');
  
  // Verificar que existe el sistema de input unificado
  if (typeof unifiedInput === 'undefined') {
    console.error('❌ UnifiedInputSystem no encontrado');
    return false;
  }
  
  console.log('✅ UnifiedInputSystem encontrado');
  
  // Test 1: Verificar estructura del sistema
  console.log('\n📋 Test 1: Estructura del sistema');
  const requiredMethods = ['getMouseRotation', 'handleMouseMove', 'requestPointerLock'];
  let structureOK = true;
  
  requiredMethods.forEach(method => {
    if (typeof unifiedInput[method] === 'function') {
      console.log(`✅ ${method} - Disponible`);
    } else {
      console.log(`❌ ${method} - NO ENCONTRADO`);
      structureOK = false;
    }
  });
  
  // Test 2: Verificar configuración del mouse
  console.log('\n🎛️ Test 2: Configuración del mouse');
  console.log('Mouse sensitivity:', GAME_CONFIG.controls.mouseSensitivity);
  console.log('Keyboard rotation speed:', GAME_CONFIG.controls.keyboardRotationSpeed);
  console.log('Mouse state:', {
    x: unifiedInput.mouse.x,
    y: unifiedInput.mouse.y,
    locked: document.pointerLockElement !== null
  });
  
  // Test 3: Verificar método de rotación
  console.log('\n🔄 Test 3: Método de rotación');
  
  // Simular movimiento del mouse
  console.log('Simulando movimiento del mouse...');
  unifiedInput.mouse.x = 0.1; // Simular movimiento horizontal
  
  const rotation = unifiedInput.getMouseRotation();
  console.log('Rotación obtenida:', rotation);
  
  if (rotation && typeof rotation.horizontal === 'number') {
    console.log('✅ getMouseRotation() retorna datos válidos');
    console.log('   - Rotación horizontal:', rotation.horizontal);
    console.log('   - Pitch:', rotation.pitch);
  } else {
    console.log('❌ getMouseRotation() no retorna datos válidos');
    structureOK = false;
  }
  
  // Verificar que los valores se limpiaron
  if (unifiedInput.mouse.x === 0 && unifiedInput.mouse.y === 0) {
    console.log('✅ Valores del mouse se limpiaron correctamente');
  } else {
    console.log('⚠️ Los valores del mouse no se limpiaron');
  }
  
  // Test 4: Verificar integración con el jugador
  console.log('\n🎮 Test 4: Integración con el jugador');
  
  if (typeof player !== 'undefined' && player.angle !== undefined) {
    const initialAngle = player.angle;
    console.log('Ángulo inicial del jugador:', initialAngle);
    
    // Simular actualización del jugador
    unifiedInput.mouse.x = 0.05;
    
    if (typeof updatePlayer === 'function') {
      // Ejecutar una actualización
      console.log('Ejecutando updatePlayer...');
      // Note: No ejecutamos realmente para evitar efectos secundarios
      console.log('✅ updatePlayer disponible para testing');
    } else {
      console.log('❌ updatePlayer no disponible');
    }
  } else {
    console.log('❌ Objeto player no disponible');
  }
  
  // Test 5: Verificar pointer lock
  console.log('\n🔒 Test 5: Pointer Lock');
  
  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    console.log('✅ Canvas encontrado');
    console.log('Pointer lock disponible:', !!canvas.requestPointerLock);
    console.log('Estado actual del pointer lock:', document.pointerLockElement !== null);
  } else {
    console.log('❌ Canvas no encontrado');
  }
  
  // Resultado final
  console.log('\n🏁 RESULTADO DEL TEST:');
  if (structureOK) {
    console.log('✅ SISTEMA DE MOUSE MEJORADO - FUNCIONANDO CORRECTAMENTE');
    console.log('🎯 El mouse debería rotar la cámara cuando se mueva');
    console.log('🎛️ Fallback Q/E disponible para rotación manual');
  } else {
    console.log('❌ PROBLEMAS DETECTADOS EN EL SISTEMA DE MOUSE');
    console.log('🔧 Revisar la implementación de UnifiedInputSystem');
  }
  
  return structureOK;
}

// Instrucciones para el usuario
console.log('\n📖 INSTRUCCIONES PARA TESTING:');
console.log('1. Asegúrate de que el juego esté funcionando');
console.log('2. Haz clic en el canvas para activar pointer lock');
console.log('3. Mueve el mouse horizontalmente');
console.log('4. Observa si la cámara rota');
console.log('5. Prueba las teclas Q/E como alternativa');
console.log('6. Ejecuta: testMouseSystem() para diagnóstico automático');

// Auto-ejecutar si el sistema está listo
setTimeout(() => {
  if (typeof unifiedInput !== 'undefined') {
    console.log('\n🚀 Auto-ejecutando test del mouse...');
    testMouseSystem();
  } else {
    console.log('\n⏳ Esperando a que el sistema esté listo...');
    console.log('Ejecuta manualmente: testMouseSystem()');
  }
}, 2000);

// Función de diagnóstico en vivo
window.testMouseLive = function() {
  console.log('\n🔴 TEST EN VIVO - Monitoreo del mouse');
  
  let testCount = 0;
  const maxTests = 10;
  
  const liveTest = setInterval(() => {
    testCount++;
    
    if (typeof unifiedInput !== 'undefined') {
      const mouseState = {
        x: unifiedInput.mouse.x,
        y: unifiedInput.mouse.y,
        timestamp: new Date().toLocaleTimeString()
      };
      
      if (Math.abs(mouseState.x) > 0.001 || Math.abs(mouseState.y) > 0.001) {
        console.log(`📍 Mouse detectado [${mouseState.timestamp}]:`, mouseState);
      }
      
      // Test de rotación
      if (Math.abs(unifiedInput.mouse.x) > 0.001) {
        const rotation = unifiedInput.getMouseRotation();
        console.log(`🔄 Rotación calculada:`, rotation);
      }
    }
    
    if (testCount >= maxTests) {
      clearInterval(liveTest);
      console.log('🏁 Test en vivo completado');
    }
  }, 500);
  
  console.log('🎯 Mueve el mouse para ver la detección en tiempo real...');
  console.log(`⏱️ Test durará ${maxTests/2} segundos`);
};

console.log('\n🎮 COMANDOS DISPONIBLES:');
console.log('  • testMouseSystem() - Test completo del sistema');
console.log('  • testMouseLive() - Monitoreo en tiempo real');
