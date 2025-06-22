/**
 * SOLUCIÓN RÁPIDA PARA ERRORES DETECTADOS
 * Corrige todos los problemas identificados en los logs
 */

console.log('🚨 === SOLUCIÓN RÁPIDA DE ERRORES ===');

class ErrorQuickFix {
  constructor() {
    console.log('🔧 Iniciando corrección automática de errores...');
    this.fixErrors();
  }
  
  fixErrors() {
    // 1. Asegurar que registerEvent existe en learning-memory
    this.ensureRegisterEventMethod();
    
    // 2. Limpiar indicadores duplicados
    this.cleanDuplicateIndicators();
    
    // 3. Forzar inicialización del juego si no existe
    this.forceGameInitialization();
    
    // 4. Reportar estado final
    setTimeout(() => {
      this.reportFinalStatus();
    }, 3000);
  }
  
  ensureRegisterEventMethod() {
    console.log('🔧 Verificando método registerEvent...');
    
    if (window.learningMemory && !window.learningMemory.registerEvent) {
      console.log('🔧 Agregando método registerEvent faltante...');
      
      window.learningMemory.registerEvent = function(eventData) {
        return this.logEvent(eventData.type || 'GENERIC', eventData);
      };
      
      console.log('✅ Método registerEvent agregado');
    } else if (window.learningMemory && window.learningMemory.registerEvent) {
      console.log('✅ Método registerEvent ya existe');
    } else {
      console.log('⚠️ learning-memory no disponible aún');
    }
  }
  
  cleanDuplicateIndicators() {
    console.log('🧹 Limpiando indicadores duplicados...');
    
    const indicators = document.querySelectorAll('[id*="learning-memory"], [class*="learning-memory"]');
    const voiceIndicators = document.querySelectorAll('[id*="memory-voice"], [class*="memory-voice"]');
    
    const allIndicators = [...indicators, ...voiceIndicators];
    
    if (allIndicators.length > 1) {
      console.log(`🧹 Encontrados ${allIndicators.length} indicadores, manteniendo solo el mejor...`);
      
      // Mantener solo el primero con ID correcto, o el primero en general
      let bestIndicator = allIndicators.find(ind => ind.id === 'learning-memory-voice') || allIndicators[0];
      
      allIndicators.forEach(indicator => {
        if (indicator !== bestIndicator) {
          indicator.remove();
          console.log('🗑️ Indicador duplicado eliminado');
        }
      });
      
      console.log('✅ Solo un indicador mantenido');
    } else {
      console.log('✅ No hay indicadores duplicados');
    }
  }
  
  forceGameInitialization() {
    console.log('🎮 Verificando inicialización del juego...');
    
    if (!window.unifiedGame && !window.game) {
      console.log('🔧 Juego no iniciado, intentando inicialización forzada...');
      
      // Esperar a que DOOM-LIMPIO.js esté disponible
      const checkGameAvailable = () => {
        if (typeof UnifiedGame !== 'undefined') {
          try {
            console.log('🚀 Iniciando juego manualmente...');
            window.unifiedGame = new UnifiedGame();
            window.unifiedGame.start();
            console.log('✅ Juego iniciado exitosamente');
          } catch (error) {
            console.error('❌ Error al iniciar juego:', error);
          }
        } else {
          console.log('⏳ Esperando que UnifiedGame esté disponible...');
          setTimeout(checkGameAvailable, 1000);
        }
      };
      
      checkGameAvailable();
    } else {
      console.log('✅ Juego ya inicializado');
    }
  }
  
  reportFinalStatus() {
    console.log('\n🏁 === REPORTE FINAL DE CORRECCIONES ===');
    
    // Verificar estado de learning-memory
    const memoryOk = window.learningMemory && window.learningMemory.registerEvent;
    console.log(`🧠 Learning Memory: ${memoryOk ? '✅ Funcional' : '❌ Con problemas'}`);
    
    // Verificar indicadores
    const indicators = document.querySelectorAll('[id*="learning-memory"], [class*="learning-memory"]');
    console.log(`👁️ Indicadores visuales: ${indicators.length === 1 ? '✅ Único' : indicators.length === 0 ? '❌ Ninguno' : '⚠️ ' + indicators.length + ' (verificar duplicados)'}`);
    
    // Verificar juego
    const gameOk = window.unifiedGame || window.game;
    console.log(`🎮 Motor de juego: ${gameOk ? '✅ Inicializado' : '❌ No inicializado'}`);
    
    // Estado general
    const allOk = memoryOk && indicators.length === 1 && gameOk;
    console.log(`\n🎯 Estado general: ${allOk ? '✅ TODO CORREGIDO' : '⚠️ Algunos problemas persisten'}`);
    
    if (allOk) {
      console.log('🎉 ¡Todos los errores han sido corregidos!');
      console.log('💡 El sistema debería funcionar correctamente ahora');
    } else {
      console.log('🔧 Algunas correcciones pueden requerir recarga de página');
    }
    
    // Comandos útiles
    console.log('\n📞 COMANDOS ÚTILES:');
    console.log('  window.errorQuickFix.fixErrors() - Ejecutar correcciones nuevamente');
    console.log('  window.duplicateCleaner?.forceCleanup() - Limpiar duplicados manualmente');
    console.log('  window.lastSystemVerification - Ver último reporte de verificación');
  }
}

// Ejecutar correcciones inmediatamente
const errorQuickFix = new ErrorQuickFix();

// Hacer disponible globalmente
window.errorQuickFix = errorQuickFix;

// También ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      new ErrorQuickFix();
    }, 1000);
  });
}

console.log('🔧 Sistema de corrección rápida cargado');
console.log('📞 Comando manual: window.errorQuickFix.fixErrors()');
