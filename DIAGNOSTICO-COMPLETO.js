/**
 * DIAGNÓSTICO COMPLETO FINAL
 * Resumen completo de todos los sistemas implementados y su estado
 */

console.log('🔬 === DIAGNÓSTICO COMPLETO DEL SISTEMA ===');

class CompleteDiagnostic {
  constructor() {
    this.diagnosticResults = {
      systemStatus: {},
      fileStructure: {},
      functionalityTests: {},
      performance: {},
      recommendations: []
    };
    
    this.expectedFiles = [
      'index.html',
      'DOOM-LIMPIO.js',
      'assets/js/learning-memory.js',
      'learning-memory-voice.js',
      'integrador-voz.js',
      'EMERGENCIA-AUTOCORRECCION.js',
      'REPARACION-AUTOMATICA.js',
      'VALIDACION-VOZ-ACTIVA.js',
      'CONSOLIDACION-FINAL.js'
    ];
    
    console.log('🔍 Iniciando diagnóstico completo en 3 segundos...');
    setTimeout(() => {
      this.runCompleteDiagnostic();
    }, 3000);
  }
  
  async runCompleteDiagnostic() {
    console.log('\n🧪 EJECUTANDO DIAGNÓSTICO COMPLETO...');
    
    try {
      // 1. Verificar estado de sistemas principales
      await this.checkSystemStatus();
      
      // 2. Verificar estructura de archivos
      await this.checkFileStructure();
      
      // 3. Ejecutar tests de funcionalidad
      await this.runFunctionalityTests();
      
      // 4. Medir rendimiento
      await this.measurePerformance();
      
      // 5. Generar recomendaciones
      await this.generateRecommendations();
      
      // 6. Crear reporte final
      this.generateFinalDiagnosticReport();
      
    } catch (error) {
      console.error('💥 ERROR EN DIAGNÓSTICO:', error);
      this.generateErrorReport(error);
    }
  }
  
  async checkSystemStatus() {
    console.log('🔧 Verificando estado de sistemas...');
    
    const systems = {
      'Learning Memory': {
        available: !!window.learningMemory,
        functional: !!(window.learningMemory && window.learningMemory.registerEvent),
        protectedSystems: window.learningMemory ? window.learningMemory.workingSystems?.size || 0 : 0
      },
      'Voice System': {
        available: !!window.learningMemoryVoice,
        functional: !!(window.learningMemoryVoice && window.learningMemoryVoice.voiceReport),
        indicator: !!document.getElementById('learning-memory-voice')
      },
      'Voice Integrator': {
        available: !!window.voiceIntegrator,
        functional: !!(window.voiceIntegrator && window.voiceIntegrator.getIntegrationStatus),
        integrated: window.learningMemory?.voice === window.learningMemoryVoice
      },
      'Emergency System': {
        available: !!window.emergencySystem,
        functional: !!(window.emergencySystem && window.emergencySystem.getEmergencyStats),
        protocols: window.emergencySystem ? window.emergencySystem.emergencyProtocols?.size || 0 : 0
      },
      'Game Engine': {
        available: !!window.unifiedGame,
        functional: !!(window.unifiedGame && window.unifiedGame.player),
        canvas: !!document.getElementById('gameCanvas')
      }
    };
    
    this.diagnosticResults.systemStatus = systems;
    
    Object.entries(systems).forEach(([name, status]) => {
      const available = status.available ? '✅' : '❌';
      const functional = status.functional ? '✅' : '❌';
      console.log(`  ${available} ${name}: Disponible | ${functional} Funcional`);
    });
  }
  
  async checkFileStructure() {
    console.log('📁 Verificando estructura de archivos...');
    
    const fileChecks = {};
    
    // Verificar scripts en DOM
    const scripts = document.querySelectorAll('script[src]');
    const loadedScripts = Array.from(scripts).map(script => {
      const src = script.src;
      const filename = src.split('/').pop();
      return filename;
    });
    
    this.expectedFiles.forEach(file => {
      const filename = file.split('/').pop();
      const isLoaded = loadedScripts.includes(filename);
      fileChecks[file] = {
        loaded: isLoaded,
        element: !!document.querySelector(`script[src*="${filename}"]`)
      };
    });
    
    this.diagnosticResults.fileStructure = fileChecks;
    
    console.log('📋 ARCHIVOS ESPERADOS:');
    Object.entries(fileChecks).forEach(([file, status]) => {
      const loaded = status.loaded ? '✅' : '❌';
      console.log(`  ${loaded} ${file}`);
    });
  }
  
  async runFunctionalityTests() {
    console.log('🧪 Ejecutando tests de funcionalidad...');
    
    const tests = {
      'Learning Memory Registration': this.testLearningMemoryRegistration(),
      'Voice System Communication': this.testVoiceSystemCommunication(),
      'Emergency Protocol Detection': this.testEmergencyProtocolDetection(),
      'Canvas Rendering': this.testCanvasRendering(),
      'Input System': this.testInputSystem(),
      'Protected Systems': this.testProtectedSystems()
    };
    
    const results = {};
    for (const [testName, testFunction] of Object.entries(tests)) {
      try {
        const result = await testFunction;
        results[testName] = {
          passed: result.passed,
          message: result.message,
          details: result.details || {}
        };
      } catch (error) {
        results[testName] = {
          passed: false,
          message: `Error en test: ${error.message}`,
          details: { error: error.stack }
        };
      }
    }
    
    this.diagnosticResults.functionalityTests = results;
    
    console.log('📊 RESULTADOS DE TESTS:');
    Object.entries(results).forEach(([test, result]) => {
      const status = result.passed ? '✅' : '❌';
      console.log(`  ${status} ${test}: ${result.message}`);
    });
  }
  
  testLearningMemoryRegistration() {
    if (!window.learningMemory) {
      return { passed: false, message: 'Learning Memory no disponible' };
    }
    
    try {
      window.learningMemory.registerEvent({
        type: 'DIAGNOSTIC_TEST',
        description: 'Test de registro de eventos',
        timestamp: Date.now()
      });
      return { passed: true, message: 'Registro de eventos funcional' };
    } catch (error) {
      return { passed: false, message: `Error en registro: ${error.message}` };
    }
  }
  
  testVoiceSystemCommunication() {
    if (!window.learningMemoryVoice) {
      return { passed: false, message: 'Sistema de voz no disponible' };
    }
    
    try {
      window.learningMemoryVoice.voiceReport('success', 'Test de comunicación');
      return { passed: true, message: 'Comunicación de voz funcional' };
    } catch (error) {
      return { passed: false, message: `Error en comunicación: ${error.message}` };
    }
  }
  
  testEmergencyProtocolDetection() {
    if (!window.emergencySystem) {
      return { passed: false, message: 'Sistema de emergencia no disponible' };
    }
    
    const stats = window.emergencySystem.getEmergencyStats ? 
                  window.emergencySystem.getEmergencyStats() : null;
    
    if (stats && stats.totalProtocols > 0) {
      return { 
        passed: true, 
        message: `${stats.totalProtocols} protocolos de emergencia configurados`,
        details: stats
      };
    } else {
      return { passed: false, message: 'Protocolos de emergencia no configurados' };
    }
  }
  
  testCanvasRendering() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
      return { passed: false, message: 'Canvas no encontrado' };
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return { passed: false, message: 'Contexto 2D no disponible' };
    }
    
    // Test básico de renderizado
    try {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 10, 10);
      return { 
        passed: true, 
        message: 'Canvas renderizando correctamente',
        details: { width: canvas.width, height: canvas.height }
      };
    } catch (error) {
      return { passed: false, message: `Error en renderizado: ${error.message}` };
    }
  }
  
  testInputSystem() {
    if (!window.unifiedGame) {
      return { passed: false, message: 'Juego principal no cargado' };
    }
    
    if (window.unifiedGame.input) {
      return { 
        passed: true, 
        message: 'Sistema de input disponible',
        details: { 
          hasMouseHandler: !!window.unifiedGame.input.mouseMoveHandler,
          hasKeyHandler: !!window.unifiedGame.input.keyboardHandler
        }
      };
    } else {
      return { passed: false, message: 'Sistema de input no encontrado' };
    }
  }
  
  testProtectedSystems() {
    if (!window.learningMemory || !window.learningMemory.workingSystems) {
      return { passed: false, message: 'Sistemas protegidos no disponibles' };
    }
    
    const protectedCount = window.learningMemory.workingSystems.size;
    const mouseSystem = window.learningMemory.workingSystems.get('MOUSE_CONTROL_SYSTEM');
    
    if (protectedCount > 0) {
      return {
        passed: true,
        message: `${protectedCount} sistemas protegidos`,
        details: {
          systems: Array.from(window.learningMemory.workingSystems.keys()),
          mouseConfirmed: mouseSystem?.status === 'FUNCIONANDO_CONFIRMADO_USUARIO'
        }
      };
    } else {
      return { passed: false, message: 'No hay sistemas protegidos' };
    }
  }
  
  async measurePerformance() {
    console.log('⚡ Midiendo rendimiento del sistema...');
    
    const startTime = performance.now();
    
    // Simular operaciones típicas
    const operations = [];
    
    // Test Learning Memory
    if (window.learningMemory) {
      const start = performance.now();
      window.learningMemory.registerEvent({
        type: 'PERFORMANCE_TEST',
        timestamp: Date.now()
      });
      operations.push({ operation: 'Learning Memory', time: performance.now() - start });
    }
    
    // Test Voice System
    if (window.learningMemoryVoice) {
      const start = performance.now();
      window.learningMemoryVoice.voiceReport('success', 'Performance test');
      operations.push({ operation: 'Voice System', time: performance.now() - start });
    }
    
    // Test Canvas
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
      const start = performance.now();
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 100, 100);
      operations.push({ operation: 'Canvas Rendering', time: performance.now() - start });
    }
    
    const totalTime = performance.now() - startTime;
    
    this.diagnosticResults.performance = {
      totalTime,
      operations,
      memoryUsage: this.estimateMemoryUsage()
    };
    
    console.log('📈 RENDIMIENTO:');
    console.log(`  ⏱️ Tiempo total de tests: ${totalTime.toFixed(2)}ms`);
    operations.forEach(op => {
      console.log(`  🔄 ${op.operation}: ${op.time.toFixed(2)}ms`);
    });
  }
  
  estimateMemoryUsage() {
    let totalSize = 0;
    
    try {
      // Learning Memory
      if (window.learningMemory?.events) {
        totalSize += window.learningMemory.events.length * 100;
      }
      
      // LocalStorage
      for (let key in localStorage) {
        if (key.startsWith('working') || key.startsWith('game')) {
          totalSize += localStorage.getItem(key).length;
        }
      }
    } catch (error) {
      console.warn('No se pudo estimar memoria:', error);
    }
    
    return {
      estimated: totalSize,
      readable: this.formatBytes(totalSize)
    };
  }
  
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  generateRecommendations() {
    console.log('💡 Generando recomendaciones...');
    
    const recommendations = [];
    
    // Analizar resultados y generar recomendaciones
    const systemStatus = this.diagnosticResults.systemStatus;
    const functionalityTests = this.diagnosticResults.functionalityTests;
    
    // Sistemas no disponibles
    Object.entries(systemStatus).forEach(([system, status]) => {
      if (!status.available) {
        recommendations.push(`🔧 Reparar o inicializar: ${system}`);
      } else if (!status.functional) {
        recommendations.push(`⚠️ Verificar funcionalidad de: ${system}`);
      }
    });
    
    // Tests fallidos
    Object.entries(functionalityTests).forEach(([test, result]) => {
      if (!result.passed) {
        recommendations.push(`❌ Corregir test fallido: ${test}`);
      }
    });
    
    // Recomendaciones generales
    if (systemStatus['Learning Memory']?.protectedSystems < 5) {
      recommendations.push('🛡️ Agregar más sistemas a protección');
    }
    
    if (!systemStatus['Voice System']?.indicator) {
      recommendations.push('🤖 Verificar indicador visual de sistema de voz');
    }
    
    if (this.diagnosticResults.performance?.totalTime > 100) {
      recommendations.push('⚡ Optimizar rendimiento del sistema');
    }
    
    this.diagnosticResults.recommendations = recommendations;
    
    if (recommendations.length > 0) {
      console.log('📋 RECOMENDACIONES:');
      recommendations.forEach(rec => console.log(`  ${rec}`));
    } else {
      console.log('✅ No se requieren mejoras - sistema óptimo');
    }
  }
  
  generateFinalDiagnosticReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🔬 REPORTE FINAL DE DIAGNÓSTICO COMPLETO');
    console.log('='.repeat(80));
    console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
    console.log(`🎮 Proyecto: Tiro con Noboa de Cartón v3.0`);
    
    // Resumen ejecutivo
    const systems = this.diagnosticResults.systemStatus;
    const tests = this.diagnosticResults.functionalityTests;
    
    const availableSystems = Object.values(systems).filter(s => s.available).length;
    const totalSystems = Object.keys(systems).length;
    const passedTests = Object.values(tests).filter(t => t.passed).length;
    const totalTests = Object.keys(tests).length;
    
    console.log('\n📊 RESUMEN EJECUTIVO:');
    console.log(`  🔧 Sistemas operativos: ${availableSystems}/${totalSystems} (${(availableSystems/totalSystems*100).toFixed(1)}%)`);
    console.log(`  🧪 Tests pasados: ${passedTests}/${totalTests} (${(passedTests/totalTests*100).toFixed(1)}%)`);
    console.log(`  ⚡ Rendimiento: ${this.diagnosticResults.performance.totalTime.toFixed(2)}ms`);
    console.log(`  💾 Memoria estimada: ${this.diagnosticResults.performance.memoryUsage.readable}`);
    console.log(`  💡 Recomendaciones: ${this.diagnosticResults.recommendations.length}`);
    
    // Estado detallado de sistemas
    console.log('\n🔧 ESTADO DETALLADO DE SISTEMAS:');
    Object.entries(systems).forEach(([name, status]) => {
      const available = status.available ? '✅' : '❌';
      const functional = status.functional ? '✅' : '❌';
      console.log(`  ${available}${functional} ${name}`);
      
      // Detalles específicos
      if (name === 'Learning Memory' && status.protectedSystems) {
        console.log(`    🛡️ Sistemas protegidos: ${status.protectedSystems}`);
      }
      if (name === 'Emergency System' && status.protocols) {
        console.log(`    🚨 Protocolos configurados: ${status.protocols}`);
      }
    });
    
    // Veredicto final
    let verdict, emoji;
    if (availableSystems === totalSystems && passedTests === totalTests) {
      verdict = 'SISTEMA PERFECTO - Todos los componentes operativos y funcionales';
      emoji = '🎉';
    } else if (availableSystems >= totalSystems * 0.8 && passedTests >= totalTests * 0.8) {
      verdict = 'SISTEMA ESTABLE - Funcionalidad principal completa';
      emoji = '✅';
    } else if (availableSystems >= totalSystems * 0.6) {
      verdict = 'SISTEMA FUNCIONAL - Requiere optimización';
      emoji = '⚠️';
    } else {
      verdict = 'SISTEMA COMPROMETIDO - Requiere reparación inmediata';
      emoji = '🚨';
    }
    
    console.log(`\n${emoji} VEREDICTO FINAL:`);
    console.log(`${verdict}`);
    
    // Registrar diagnóstico completo
    if (window.learningMemory && window.learningMemory.registerEvent) {
      window.learningMemory.registerEvent({
        type: 'COMPLETE_DIAGNOSTIC',
        action: 'FULL_SYSTEM_ANALYSIS',
        description: verdict,
        details: this.diagnosticResults,
        timestamp: Date.now(),
        preserve: true
      });
    }
    
    // Reportar a sistema de voz
    if (window.learningMemoryVoice && window.learningMemoryVoice.voiceReport) {
      const reportType = availableSystems === totalSystems ? 'success' : 'warning';
      window.learningMemoryVoice.voiceReport(
        reportType,
        `DIAGNÓSTICO COMPLETO: ${verdict}`,
        {
          systemsOperational: `${availableSystems}/${totalSystems}`,
          testsPasssed: `${passedTests}/${totalTests}`,
          performance: `${this.diagnosticResults.performance.totalTime.toFixed(2)}ms`
        }
      );
    }
    
    console.log('\n🔄 Diagnóstico completo finalizado. Sistemas en monitoreo continuo...');
    console.log('='.repeat(80));
  }
  
  generateErrorReport(error) {
    console.error('\n🚨 REPORTE DE ERROR EN DIAGNÓSTICO');
    console.error(`💥 Error: ${error.message}`);
    console.error(`📍 Stack: ${error.stack}`);
    console.error('🔧 Recomendación: Verificar consola del navegador para más detalles');
  }
}

// Inicializar diagnóstico completo
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    new CompleteDiagnostic();
  }, 8000); // Esperar más tiempo para que todos los sistemas se carguen
});

console.log('🔬 Sistema de diagnóstico completo cargado');
