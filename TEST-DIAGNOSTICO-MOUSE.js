// 🧪 TEST DIAGNÓSTICO ESPECÍFICO PARA MOUSE
// Este test ayuda a entender EXACTAMENTE qué está pasando con la dirección

console.log('🔍 INICIANDO DIAGNÓSTICO DE DIRECCIÓN DE MOUSE');

// Test de dirección del mouse
function TEST_DIRECCION_MOUSE() {
  console.log('📋 === TEST DE DIRECCIÓN DEL MOUSE ===');
  
  // Verificar que el juego esté cargado
  if (typeof game === 'undefined') {
    console.log('❌ Juego no encontrado. Espera a que cargue completamente.');
    return;
  }
  
  console.log('✅ Juego encontrado, verificando controles...');
  
  // Acceder al sistema de input
  const inputSystem = game.input;
  if (!inputSystem) {
    console.log('❌ Sistema de input no encontrado');
    return;
  }
  
  console.log('✅ Sistema de input encontrado');
  
  // Test manual paso a paso
  console.log('\n🎯 INSTRUCCIONES DE TEST:');
  console.log('1. 📸 Mira hacia adelante (nota la dirección de las paredes)');
  console.log('2. 🖱️ Haz CLIC en el canvas para capturar el mouse');
  console.log('3. 👉 Mueve el mouse LENTAMENTE hacia la DERECHA');
  console.log('4. 🤔 ¿La vista gira hacia la DERECHA o IZQUIERDA?');
  console.log('5. 👈 Mueve el mouse LENTAMENTE hacia la IZQUIERDA');
  console.log('6. 🤔 ¿La vista gira hacia la IZQUIERDA o DERECHA?');
  
  // Monitor en tiempo real
  let monitorInterval;
  
  function startMonitoring() {
    console.log('\n🔄 Iniciando monitoreo en tiempo real...');
    console.log('💡 Mueve el mouse y observa los valores:');
    
    monitorInterval = setInterval(() => {
      if (inputSystem.pointerLocked) {
        const rotation = inputSystem.getMouseRotation();
        if (Math.abs(rotation.horizontal) > 0.001) {
          const direction = rotation.horizontal > 0 ? 'DERECHA' : 'IZQUIERDA';
          const angleBefore = game.player.angle;
          
          console.log(`🎯 ROTACIÓN DETECTADA:`);
          console.log(`   🖱️ Valor: ${rotation.horizontal.toFixed(4)}`);
          console.log(`   🧭 Dirección calculada: ${direction}`);
          console.log(`   🔄 Ángulo antes: ${angleBefore.toFixed(4)}`);
          
          // Simular el cálculo que hace updatePlayer
          const newAngle = angleBefore - rotation.horizontal;
          console.log(`   ➡️ Ángulo después: ${newAngle.toFixed(4)}`);
          
          // Determinar dirección visual
          const deltaAngle = newAngle - angleBefore;
          const visualDirection = deltaAngle > 0 ? 'IZQUIERDA' : 'DERECHA';
          console.log(`   👁️ Dirección visual: gira hacia la ${visualDirection}`);
          console.log('   ----------------------------------------');
        }
      }
    }, 100);
  }
  
  function stopMonitoring() {
    if (monitorInterval) {
      clearInterval(monitorInterval);
      console.log('⏹️ Monitoreo detenido');
    }
  }
  
  // Controles del test
  console.log('\n🎮 CONTROLES DEL TEST:');
  console.log('• TEST_DIRECCION_MOUSE.start() - Iniciar monitoreo');
  console.log('• TEST_DIRECCION_MOUSE.stop() - Detener monitoreo');
  
  return {
    start: startMonitoring,
    stop: stopMonitoring,
    info: () => {
      console.log(`🔒 Mouse capturado: ${inputSystem.pointerLocked}`);
      console.log(`🧭 Ángulo actual: ${game.player.angle.toFixed(4)}`);
      console.log(`🖱️ Mouse X: ${inputSystem.mouse.x.toFixed(4)}`);
      console.log(`🖱️ Mouse Y: ${inputSystem.mouse.y.toFixed(4)}`);
    }
  };
}

// Test de valores específicos
function TEST_VALORES_ESPECIFICOS() {
  console.log('\n🔬 === TEST DE VALORES ESPECÍFICOS ===');
  
  // Simular valores específicos
  const testCases = [
    { movementX: 10, expected: 'DERECHA' },
    { movementX: -10, expected: 'IZQUIERDA' },
    { movementX: 5, expected: 'DERECHA' },
    { movementX: -5, expected: 'IZQUIERDA' }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`\n📝 Caso ${index + 1}: movementX = ${testCase.movementX}`);
    
    // Simular el cálculo completo
    const mouseX = testCase.movementX * 0.002; // Sensibilidad típica
    const rotationHorizontal = mouseX;
    
    console.log(`   🖱️ mouseX acumulado: ${mouseX.toFixed(4)}`);
    console.log(`   🔄 rotation.horizontal: ${rotationHorizontal.toFixed(4)}`);
    
    // Simular updatePlayer
    const initialAngle = 0;
    const newAngle = initialAngle - rotationHorizontal; // Lógica actual
    
    console.log(`   🧭 Cambio de ángulo: ${(newAngle - initialAngle).toFixed(4)}`);
    
    const actualDirection = newAngle < initialAngle ? 'DERECHA' : 'IZQUIERDA';
    const isCorrect = actualDirection === testCase.expected;
    
    console.log(`   🎯 Dirección esperada: ${testCase.expected}`);
    console.log(`   👁️ Dirección actual: ${actualDirection}`);
    console.log(`   ${isCorrect ? '✅' : '❌'} Resultado: ${isCorrect ? 'CORRECTO' : 'INCORRECTO'}`);
  });
}

// Ejecutar tests automáticamente
setTimeout(() => {
  TEST_VALORES_ESPECIFICOS();
  
  console.log('\n🚀 TEST MANUAL DISPONIBLE:');
  console.log('Ejecuta: TEST_DIRECCION_MOUSE()');
}, 1000);

// Exportar para uso manual
window.TEST_DIRECCION_MOUSE = TEST_DIRECCION_MOUSE;
window.TEST_VALORES_ESPECIFICOS = TEST_VALORES_ESPECIFICOS;
