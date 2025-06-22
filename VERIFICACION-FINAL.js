/**
 * VERIFICACIÓN FINAL DEL SISTEMA UNIFICADO
 * Confirma que solo hay un indicador visible y todos los sistemas funcionan
 */

console.log('✅ === VERIFICACIÓN FINAL DEL SISTEMA ===');

class FinalSystemVerification {
  constructor() {
    console.log('🔍 Iniciando verificación final del sistema...');
    
    // Esperar a que todo esté cargado
    setTimeout(() => {
      this.runCompleteVerification();
    }, 3000);
  }
  
  runCompleteVerification() {
    console.log('📊 EJECUTANDO VERIFICACIÓN COMPLETA...\n');
    
    const results = {
      indicatorStatus: this.verifyIndicatorStatus(),
      memorySystem: this.verifyMemorySystem(),
      voiceSystem: this.verifyVoiceSystem(),
      gameSystem: this.verifyGameSystem(),
      duplicateCleaner: this.verifyDuplicateCleaner(),
      timestamp: new Date().toISOString()
    };
    
    this.displayResults(results);
    this.generateReport(results);
  }
  
  verifyIndicatorStatus() {
    console.log('🎯 Verificando estado del indicador...');
    
    const indicators = document.querySelectorAll('[id*="learning-memory"], [class*="learning-memory"]');
    const voiceIndicators = document.querySelectorAll('[id*="memory-voice"], [class*="memory-voice"]');
    
    const totalIndicators = indicators.length + voiceIndicators.length;
    
    const status = {
      totalFound: totalIndicators,
      learningMemoryIndicators: indicators.length,
      voiceIndicators: voiceIndicators.length,
      hasDuplicates: totalIndicators > 1,
      mainIndicator: null,
      isVisible: false,
      hasCorrectPosition: false
    };
    
    if (totalIndicators === 1) {
      const mainIndicator = indicators[0] || voiceIndicators[0];
      status.mainIndicator = {
        id: mainIndicator.id,
        className: mainIndicator.className,
        position: window.getComputedStyle(mainIndicator).position,
        visibility: window.getComputedStyle(mainIndicator).visibility,
        display: window.getComputedStyle(mainIndicator).display
      };
      
      status.isVisible = mainIndicator.offsetWidth > 0 && mainIndicator.offsetHeight > 0;
      status.hasCorrectPosition = window.getComputedStyle(mainIndicator).position === 'fixed';
    }
    
    console.log(`   📈 Indicadores encontrados: ${totalIndicators}`);
    console.log(`   ${status.hasDuplicates ? '❌ HAY DUPLICADOS' : '✅ Sin duplicados'}`);
    console.log(`   ${status.isVisible ? '✅ Visible' : '❌ No visible'}`);
    
    return status;
  }
  
  verifyMemorySystem() {
    console.log('🧠 Verificando sistema de memoria...');
    
    const status = {
      globalInstanceExists: typeof window.learningMemory !== 'undefined',
      isInitialized: false,
      hasProtections: false,
      hasVoiceSystem: false,
      methodsAvailable: []
    };
    
    if (status.globalInstanceExists) {
      const memory = window.learningMemory;
      status.isInitialized = memory && typeof memory.registerChange === 'function';
      status.hasProtections = memory && memory.protectedSystems && memory.protectedSystems.length > 0;
      status.hasVoiceSystem = memory && typeof memory.voiceSystem !== 'undefined';
      
      if (memory) {
        status.methodsAvailable = Object.getOwnPropertyNames(Object.getPrototypeOf(memory))
          .filter(name => typeof memory[name] === 'function' && name !== 'constructor');
      }
    }
    
    console.log(`   ${status.globalInstanceExists ? '✅ Instancia global existe' : '❌ Instancia global faltante'}`);
    console.log(`   ${status.isInitialized ? '✅ Inicializado' : '❌ No inicializado'}`);
    console.log(`   ${status.hasProtections ? '✅ Protecciones activas' : '❌ Sin protecciones'}`);
    console.log(`   ${status.hasVoiceSystem ? '✅ Sistema de voz activo' : '❌ Sistema de voz inactivo'}`);
    
    return status;
  }
  
  verifyVoiceSystem() {
    console.log('🗣️ Verificando sistema de voz...');
    
    const status = {
      learningMemoryVoiceExists: typeof window.learningMemoryVoice !== 'undefined',
      integradorExists: typeof window.integradorVoz !== 'undefined',
      isActive: false,
      hasIndicator: false,
      lastUpdate: null
    };
    
    // Verificar si el sistema de voz está activo
    if (window.learningMemoryVoice) {
      status.isActive = window.learningMemoryVoice.isActive || false;
      status.lastUpdate = window.learningMemoryVoice.lastUpdate || null;
    }
    
    // Verificar si hay indicador de voz
    const voiceIndicator = document.getElementById('learning-memory-voice');
    status.hasIndicator = voiceIndicator !== null;
    
    console.log(`   ${status.learningMemoryVoiceExists ? '✅ Learning Memory Voice existe' : '❌ Learning Memory Voice faltante'}`);
    console.log(`   ${status.integradorExists ? '✅ Integrador existe' : '❌ Integrador faltante'}`);
    console.log(`   ${status.isActive ? '✅ Sistema activo' : '❌ Sistema inactivo'}`);
    console.log(`   ${status.hasIndicator ? '✅ Indicador presente' : '❌ Indicador ausente'}`);
    
    return status;
  }
  
  verifyGameSystem() {
    console.log('🎮 Verificando sistema de juego...');
    
    const status = {
      canvasExists: document.getElementById('gameCanvas') !== null,
      gameConfigExists: typeof window.GAME_CONFIG !== 'undefined',
      unifiedInputExists: typeof window.UnifiedInputSystem !== 'undefined',
      doomEngineExists: typeof window.DoomEngine !== 'undefined',
      isInitialized: false
    };
    
    // Verificar si el juego está inicializado
    status.isInitialized = window.game && typeof window.game.start === 'function';
    
    console.log(`   ${status.canvasExists ? '✅ Canvas existe' : '❌ Canvas faltante'}`);
    console.log(`   ${status.gameConfigExists ? '✅ Game Config existe' : '❌ Game Config faltante'}`);
    console.log(`   ${status.unifiedInputExists ? '✅ Unified Input existe' : '❌ Unified Input faltante'}`);
    console.log(`   ${status.doomEngineExists ? '✅ Doom Engine existe' : '❌ Doom Engine faltante'}`);
    console.log(`   ${status.isInitialized ? '✅ Juego inicializado' : '❌ Juego no inicializado'}`);
    
    return status;
  }
  
  verifyDuplicateCleaner() {
    console.log('🧹 Verificando sistema de limpieza...');
    
    const status = {
      cleanerExists: typeof window.duplicateCleaner !== 'undefined',
      cleanupAttempts: 0,
      isActive: false
    };
    
    if (status.cleanerExists) {
      status.cleanupAttempts = window.duplicateCleaner.cleanupAttempts || 0;
      status.isActive = window.duplicateCleaner.setupPeriodicCleanup !== undefined;
    }
    
    console.log(`   ${status.cleanerExists ? '✅ Limpiador existe' : '❌ Limpiador faltante'}`);
    console.log(`   📊 Intentos de limpieza: ${status.cleanupAttempts}`);
    console.log(`   ${status.isActive ? '✅ Sistema activo' : '❌ Sistema inactivo'}`);
    
    return status;
  }
  
  displayResults(results) {
    console.log('\n🏆 === RESULTADOS DE VERIFICACIÓN ===');
    
    const overallHealth = this.calculateOverallHealth(results);
    
    console.log(`📊 SALUD GENERAL DEL SISTEMA: ${overallHealth.percentage}%`);
    console.log(`${overallHealth.emoji} ${overallHealth.status}`);
    
    if (overallHealth.percentage >= 90) {
      console.log('🎉 ¡SISTEMA EN PERFECTO ESTADO!');
    } else if (overallHealth.percentage >= 70) {
      console.log('⚠️ Sistema mayormente funcional con algunas mejoras pendientes');
    } else {
      console.log('🚨 Sistema requiere atención inmediata');
    }
    
    // Mostrar problemas específicos
    const issues = this.identifyIssues(results);
    if (issues.length > 0) {
      console.log('\n🔧 PROBLEMAS DETECTADOS:');
      issues.forEach(issue => console.log(`   • ${issue}`));
    }
    
    // Mostrar indicador en pantalla si es posible
    this.updateOnScreenIndicator(results, overallHealth);
  }
  
  calculateOverallHealth(results) {
    let score = 0;
    let maxScore = 0;
    
    // Indicador (peso alto)
    maxScore += 30;
    if (!results.indicatorStatus.hasDuplicates) score += 15;
    if (results.indicatorStatus.isVisible) score += 10;
    if (results.indicatorStatus.hasCorrectPosition) score += 5;
    
    // Sistema de memoria (peso alto)
    maxScore += 25;
    if (results.memorySystem.globalInstanceExists) score += 10;
    if (results.memorySystem.isInitialized) score += 10;
    if (results.memorySystem.hasProtections) score += 5;
    
    // Sistema de voz (peso medio)
    maxScore += 20;
    if (results.voiceSystem.learningMemoryVoiceExists) score += 8;
    if (results.voiceSystem.isActive) score += 7;
    if (results.voiceSystem.hasIndicator) score += 5;
    
    // Sistema de juego (peso medio)
    maxScore += 15;
    if (results.gameSystem.canvasExists) score += 3;
    if (results.gameSystem.gameConfigExists) score += 4;
    if (results.gameSystem.unifiedInputExists) score += 4;
    if (results.gameSystem.isInitialized) score += 4;
    
    // Limpiador (peso bajo)
    maxScore += 10;
    if (results.duplicateCleaner.cleanerExists) score += 5;
    if (results.duplicateCleaner.isActive) score += 5;
    
    const percentage = Math.round((score / maxScore) * 100);
    
    let status, emoji;
    if (percentage >= 95) {
      status = 'EXCELENTE';
      emoji = '🏆';
    } else if (percentage >= 85) {
      status = 'MUY BUENO';
      emoji = '🟢';
    } else if (percentage >= 70) {
      status = 'BUENO';
      emoji = '🟡';
    } else if (percentage >= 50) {
      status = 'REGULAR';
      emoji = '🟠';
    } else {
      status = 'CRÍTICO';
      emoji = '🔴';
    }
    
    return { percentage, status, emoji, score, maxScore };
  }
  
  identifyIssues(results) {
    const issues = [];
    
    if (results.indicatorStatus.hasDuplicates) {
      issues.push('Indicadores duplicados detectados');
    }
    
    if (!results.indicatorStatus.isVisible) {
      issues.push('Indicador principal no visible');
    }
    
    if (!results.memorySystem.globalInstanceExists) {
      issues.push('Sistema de memoria no disponible globalmente');
    }
    
    if (!results.memorySystem.isInitialized) {
      issues.push('Sistema de memoria no inicializado');
    }
    
    if (!results.voiceSystem.isActive) {
      issues.push('Sistema de voz inactivo');
    }
    
    if (!results.gameSystem.isInitialized) {
      issues.push('Motor de juego no inicializado');
    }
    
    if (!results.duplicateCleaner.cleanerExists) {
      issues.push('Sistema de limpieza no disponible');
    }
    
    return issues;
  }
  
  updateOnScreenIndicator(results, health) {
    const indicator = document.getElementById('learning-memory-voice');
    if (indicator) {
      const statusElement = indicator.querySelector('#memory-status');
      if (statusElement) {
        statusElement.innerHTML = `
          ${health.emoji} Sistema: ${health.status} (${health.percentage}%)<br>
          🔍 Última verificación: ${new Date().toLocaleTimeString()}
        `;
      }
    }
  }
  
  generateReport(results) {
    const report = {
      timestamp: results.timestamp,
      version: '3.0-FINAL',
      health: this.calculateOverallHealth(results),
      details: results,
      recommendations: this.generateRecommendations(results)
    };
    
    // Guardar reporte en la consola
    console.log('\n📋 REPORTE COMPLETO:', report);
    
    // Hacer disponible globalmente para análisis
    window.lastSystemVerification = report;
    
    console.log('\n📞 COMANDOS DISPONIBLES:');
    console.log('  window.lastSystemVerification - Ver último reporte');
    console.log('  window.duplicateCleaner.forceCleanup() - Limpieza manual');
    console.log('  window.learningMemory.generateReport() - Reporte de memoria');
  }
  
  generateRecommendations(results) {
    const recommendations = [];
    
    if (results.indicatorStatus.hasDuplicates) {
      recommendations.push('Ejecutar window.duplicateCleaner.forceCleanup()');
    }
    
    if (!results.memorySystem.isInitialized) {
      recommendations.push('Recargar la página para reinicializar el sistema de memoria');
    }
    
    if (!results.voiceSystem.isActive) {
      recommendations.push('Verificar carga de learning-memory-voice.js');
    }
    
    if (!results.gameSystem.isInitialized) {
      recommendations.push('Verificar carga de DOOM-LIMPIO.js');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Sistema funcionando correctamente - no se requieren acciones');
    }
    
    return recommendations;
  }
}

// Inicializar verificación cuando esté todo listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new FinalSystemVerification();
  });
} else {
  new FinalSystemVerification();
}

console.log('✅ Sistema de verificación final cargado');
