// 🚀 TEST SISTEMA DE ARQUITECTURA SEPARADA
// Verifica que los sistemas horizontal y vertical están completamente aislados

console.log('🧪 INICIANDO TEST DE ARQUITECTURA SEPARADA');

function TEST_ARQUITECTURA_SEPARADA() {
  console.log('📋 === TEST DE SISTEMAS COMPLETAMENTE SEPARADOS ===');
  
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
  console.log('🔍 Verificando nueva arquitectura...');
  
  // Verificar que los sistemas separados existen
  if (inputSystem.horizontalSystem && inputSystem.verticalSystem) {
    console.log('✅ Sistemas separados detectados:');
    console.log('   🔄 Sistema horizontal:', inputSystem.horizontalSystem);
    console.log('   ↕️ Sistema vertical:', inputSystem.verticalSystem);
  } else {
    console.log('❌ Sistemas separados NO encontrados');
    return;
  }
  
  console.log('\n🎯 INSTRUCCIONES DE TEST DEFINITIVO:');
  console.log('1. 🖱️ Haz CLIC en el canvas para capturar el mouse');
  console.log('2. 📏 Mueve el mouse SOLO HORIZONTALMENTE (muy lentamente)');
  console.log('3. 👀 VERIFICA en consola que solo se activa "Sistema H procesado"');
  console.log('4. 📏 Mueve el mouse SOLO VERTICALMENTE (muy lentamente)');
  console.log('5. 👀 VERIFICA en consola que solo se activa "Sistema V procesado"');
  console.log('6. 🚫 SI ves interferencia cruzada, el problema persiste');
  
  let monitoring = false;
  let crossInterferences = 0;
  
  function startArchitectureTest() {
    if (monitoring) return;
    
    console.log('\n🔄 Iniciando monitoreo de arquitectura separada...');
    console.log('💡 Haz movimientos puros y observa los logs:');
    console.log('   - "Sistema H procesado" = Solo horizontal ✅');
    console.log('   - "Sistema V procesado" = Solo vertical ✅');
    console.log('   - Ambos mensajes juntos = Interferencia ❌');
    
    monitoring = true;
    
    // Monitor simple de logs
    const originalLog = console.log;
    console.log = function(...args) {
      const message = args.join(' ');
      
      // Detectar activaciones simultáneas (interferencia)
      if (message.includes('Sistema H procesado') && 
          inputSystem.verticalSystem.active) {
        crossInterferences++;
        originalLog('⚠️ INTERFERENCIA DETECTADA: Horizontal activado mientras vertical está activo');
      }
      
      if (message.includes('Sistema V procesado') && 
          inputSystem.horizontalSystem.active) {
        crossInterferences++;
        originalLog('⚠️ INTERFERENCIA DETECTADA: Vertical activado mientras horizontal está activo');
      }
      
      originalLog.apply(console, args);
    };
    
    setTimeout(() => {
      monitoring = false;
      console.log = originalLog;
      console.log('\n📊 === RESULTADOS ARQUITECTURA SEPARADA ===');
      console.log(`🔄 Interferencias detectadas: ${crossInterferences}`);
      
      if (crossInterferences === 0) {
        console.log('✅ PERFECTO: Arquitectura separada funcionando correctamente');
        console.log('🎯 Los sistemas horizontal y vertical están completamente aislados');
      } else {
        console.log('❌ PROBLEMA: Aún hay interferencia entre sistemas');
        console.log('💡 Necesita más trabajo en la separación');
      }
    }, 30000); // 30 segundos de monitoreo
  }
  
  function stopArchitectureTest() {
    monitoring = false;
    console.log('⏹️ Test de arquitectura detenido');
  }
  
  return {
    start: startArchitectureTest,
    stop: stopArchitectureTest,
    checkSystems: () => {
      console.log('🔍 Estado actual de sistemas:');
      console.log('🔄 Horizontal:', {
        enabled: inputSystem.horizontalSystem.enabled,
        active: inputSystem.horizontalSystem.active,
        lastDelta: inputSystem.horizontalSystem.lastDelta
      });
      console.log('↕️ Vertical:', {
        enabled: inputSystem.verticalSystem.enabled,
        active: inputSystem.verticalSystem.active,
        lastDelta: inputSystem.verticalSystem.lastDelta
      });
    }
  };
}

// Ejecutar automáticamente información
setTimeout(() => {
  console.log('\n🚀 TEST DE ARQUITECTURA SEPARADA DISPONIBLE:');
  console.log('• TEST_ARQUITECTURA_SEPARADA().start() - Iniciar test de 30 segundos');
  console.log('• TEST_ARQUITECTURA_SEPARADA().checkSystems() - Ver estado actual');
  console.log('• TEST_ARQUITECTURA_SEPARADA().stop() - Detener test');
}, 1000);

// Exportar para uso manual
window.TEST_ARQUITECTURA_SEPARADA = TEST_ARQUITECTURA_SEPARADA;
