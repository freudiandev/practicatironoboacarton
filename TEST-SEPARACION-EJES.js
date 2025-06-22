// 🔍 TEST ESPECÍFICO PARA INTERFERENCIA CRUZADA DE EJES
// Detecta si el movimiento vertical afecta el horizontal y viceversa

console.log('🧪 INICIANDO TEST DE SEPARACIÓN DE EJES');

function TEST_SEPARACION_EJES() {
  console.log('📋 === TEST DE SEPARACIÓN HORIZONTAL/VERTICAL ===');
  
  if (typeof game === 'undefined') {
    console.log('❌ Juego no encontrado. Espera a que cargue completamente.');
    return;
  }
  
  const inputSystem = game.input;
  if (!inputSystem) {
    console.log('❌ Sistema de input no encontrado');
    return;
  }
  
  console.log('✅ Sistema de input encontrado');
  console.log('\n🎯 INSTRUCCIONES ESPECÍFICAS:');
  console.log('1. 🖱️ Haz CLIC en el canvas para capturar el mouse');
  console.log('2. 📏 Mueve el mouse SOLO HORIZONTALMENTE (derecha/izquierda)');
  console.log('3. 👀 Observa si el ángulo vertical (pitch) cambia incorrectamente');
  console.log('4. 📏 Mueve el mouse SOLO VERTICALMENTE (arriba/abajo)');
  console.log('5. 👀 Observa si el ángulo horizontal cambia incorrectamente');
  
  let monitoring = false;
  let lastHorizontalAngle = 0;
  let lastVerticalAngle = 0;
  let horizontalMovements = 0;
  let verticalMovements = 0;
  let crossContamination = {
    horizontal: 0,  // Cuántas veces movimiento vertical afectó horizontal
    vertical: 0     // Cuántas veces movimiento horizontal afectó vertical
  };
  
  function startAxisSeparationTest() {
    if (monitoring) return;
    
    console.log('\n🔄 Iniciando monitoreo de separación de ejes...');
    console.log('💡 Realiza movimientos puramente horizontales y verticales:');
    
    lastHorizontalAngle = game.player.angle;
    lastVerticalAngle = game.player.pitch || 0;
    monitoring = true;
    
    const monitorInterval = setInterval(() => {
      if (!monitoring) {
        clearInterval(monitorInterval);
        return;
      }
      
      if (inputSystem.pointerLocked) {
        const currentHorizontal = game.player.angle;
        const currentVertical = game.player.pitch || 0;
        const rotation = inputSystem.getMouseRotation();
        
        // Detectar tipo de movimiento predominante
        const horizontalChange = Math.abs(currentHorizontal - lastHorizontalAngle);
        const verticalChange = Math.abs(currentVertical - lastVerticalAngle);
        
        if (horizontalChange > 0.001 || verticalChange > 0.001) {
          console.log(`\n📊 CAMBIO DETECTADO:`);
          console.log(`   🔄 Horizontal: ${horizontalChange.toFixed(4)} (${rotation.horizontal.toFixed(4)})`);
          console.log(`   ↕️ Vertical: ${verticalChange.toFixed(4)} (${rotation.pitch.toFixed(4)})`);
          
          // Detectar movimiento predominante
          if (horizontalChange > verticalChange * 3) {
            // Movimiento principalmente horizontal
            horizontalMovements++;
            if (verticalChange > 0.001) {
              crossContamination.vertical++;
              console.log(`   ⚠️ INTERFERENCIA: Movimiento horizontal afectó vertical!`);
            } else {
              console.log(`   ✅ LIMPIO: Solo movimiento horizontal`);
            }
          } else if (verticalChange > horizontalChange * 3) {
            // Movimiento principalmente vertical
            verticalMovements++;
            if (horizontalChange > 0.001) {
              crossContamination.horizontal++;
              console.log(`   ⚠️ INTERFERENCIA: Movimiento vertical afectó horizontal!`);
            } else {
              console.log(`   ✅ LIMPIO: Solo movimiento vertical`);
            }
          } else {
            console.log(`   ↗️ DIAGONAL: Movimiento mixto (normal)`);
          }
          
          lastHorizontalAngle = currentHorizontal;
          lastVerticalAngle = currentVertical;
        }
      }
    }, 50);
  }
  
  function stopAxisSeparationTest() {
    monitoring = false;
    console.log('\n📊 === RESULTADOS DEL TEST ===');
    console.log(`🔄 Movimientos horizontales: ${horizontalMovements}`);
    console.log(`↕️ Movimientos verticales: ${verticalMovements}`);
    console.log(`⚠️ Interferencias horizontal: ${crossContamination.horizontal}`);
    console.log(`⚠️ Interferencias vertical: ${crossContamination.vertical}`);
    
    const totalInterference = crossContamination.horizontal + crossContamination.vertical;
    const totalMovements = horizontalMovements + verticalMovements;
    
    if (totalInterference === 0) {
      console.log('✅ PERFECTO: Sin interferencia cruzada detectada');
    } else {
      const interferenceRate = (totalInterference / totalMovements * 100).toFixed(1);
      console.log(`❌ PROBLEMA: ${totalInterference} interferencias de ${totalMovements} movimientos (${interferenceRate}%)`);
    }
  }
  
  return {
    start: startAxisSeparationTest,
    stop: stopAxisSeparationTest,
    reset: () => {
      horizontalMovements = 0;
      verticalMovements = 0;
      crossContamination = { horizontal: 0, vertical: 0 };
      console.log('🔄 Estadísticas del test reiniciadas');
    }
  };
}

// Ejecutar automáticamente información
setTimeout(() => {
  console.log('\n🚀 TEST DE SEPARACIÓN DE EJES DISPONIBLE:');
  console.log('• TEST_SEPARACION_EJES().start() - Iniciar test');
  console.log('• TEST_SEPARACION_EJES().stop() - Finalizar y ver resultados');
  console.log('• TEST_SEPARACION_EJES().reset() - Reiniciar estadísticas');
}, 1000);

// Exportar para uso manual
window.TEST_SEPARACION_EJES = TEST_SEPARACION_EJES;
