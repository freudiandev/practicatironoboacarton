/**
 * SCRIPT DE CONSOLIDACIÓN FINAL
 * Verifica que todos los sistemas estén operativos y genera reporte completo
 */

console.log('🏁 INICIANDO CONSOLIDACIÓN FINAL DEL SISTEMA...');

class FinalConsolidation {
  constructor() {
    this.consolidationResults = {
      systems: {},
      integration: {},
      performance: {},
      errors: [],
      warnings: [],
      recommendations: []
    };
    
    this.startTime = Date.now();
    this.expectedSystems = [
      'learningMemory',
      'learningMemoryVoice', 
      'voiceIntegrator',
      'emergencySystem',
      'unifiedGame'
    ];
    
    // Esperar a que todos los sistemas se inicialicen
    setTimeout(() => {
      this.runConsolidation();
    }, 5000);
  }
  
  async runConsolidation() {
    console.log('🔄 EJECUTANDO CONSOLIDACIÓN COMPLETA...');
    
    try {
      // 1. Verificar sistemas principales
      await this.checkMainSystems();
      
      // 2. Verificar integración
      await this.checkSystemIntegration();
      
      // 3. Verificar rendimiento
      await this.checkPerformance();
      
      // 4. Verificar protecciones
      await this.checkProtections();
      
      // 5. Verificar funcionalidad del juego
      await this.checkGameFunctionality();
      
      // 6. Generar reporte final
      this.generateFinalReport();
      
    } catch (error) {
      console.error('💥 ERROR EN CONSOLIDACIÓN:', error);
      this.consolidationResults.errors.push(`Error crítico: ${error.message}`);
      this.generateEmergencyReport();
    }
  }
  
  async checkMainSystems() {
    console.log('🧪 Verificando sistemas principales...');
    
    for (const systemName of this.expectedSystems) {
      const system = window[systemName];
      
      if (system) {
        this.consolidationResults.systems[systemName] = {
          status: 'LOADED',
          type: typeof system,
          methods: this.getSystemMethods(system),
          timestamp: Date.now()
        };
        
        console.log(`✅ ${systemName}: CARGADO`);
        
        // Verificaciones específicas por sistema
        switch (systemName) {
          case 'learningMemory':
            await this.checkLearningMemorySpecific(system);
            break;
          case 'learningMemoryVoice':
            await this.checkVoiceSystemSpecific(system);
            break;
          case 'emergencySystem':
            await this.checkEmergencySystemSpecific(system);
            break;
          case 'unifiedGame':
            await this.checkGameSystemSpecific(system);
            break;
        }
        
      } else {
        this.consolidationResults.systems[systemName] = {
          status: 'NOT_LOADED',
          error: 'Sistema no encontrado en window object'
        };
        
        console.error(`❌ ${systemName}: NO CARGADO`);
        this.consolidationResults.errors.push(`Sistema crítico ${systemName} no cargado`);
      }
    }
  }
  
  async checkLearningMemorySpecific(system) {
    // Verificar sistemas protegidos
    if (system.workingSystems && system.workingSystems.size > 0) {
      this.consolidationResults.systems.learningMemory.protectedSystems = Array.from(system.workingSystems.keys());
      
      // Verificar sistema de mouse específicamente
      const mouseSystem = system.workingSystems.get('MOUSE_CONTROL_SYSTEM');
      if (mouseSystem && mouseSystem.status === 'FUNCIONANDO_CONFIRMADO_USUARIO') {
        this.consolidationResults.systems.learningMemory.mouseSystemConfirmed = true;
        console.log('🎯 Sistema de mouse confirmado por usuario: ✅');
      } else {
        this.consolidationResults.warnings.push('Sistema de mouse no confirmado por usuario');
      }
    } else {
      this.consolidationResults.warnings.push('No hay sistemas protegidos en Learning Memory');
    }
    
    // Verificar métodos críticos
    const criticalMethods = ['registerEvent', 'voiceReport', 'protectWorkingSystems'];
    const availableMethods = criticalMethods.filter(method => typeof system[method] === 'function');
    
    this.consolidationResults.systems.learningMemory.criticalMethods = {
      available: availableMethods,
      missing: criticalMethods.filter(method => !availableMethods.includes(method))
    };
  }
  
  async checkVoiceSystemSpecific(system) {
    // Verificar indicador visual
    const indicator = document.getElementById('learning-memory-voice');
    this.consolidationResults.systems.learningMemoryVoice.visualIndicator = {
      exists: !!indicator,
      visible: indicator ? getComputedStyle(indicator).display !== 'none' : false,
      position: indicator ? getComputedStyle(indicator).position : null
    };
    
    // Verificar verificaciones críticas
    if (system.criticalChecks && Array.isArray(system.criticalChecks)) {
      this.consolidationResults.systems.learningMemoryVoice.criticalChecks = system.criticalChecks.length;
    }
  }
  
  async checkEmergencySystemSpecific(system) {
    const stats = system.getEmergencyStats ? system.getEmergencyStats() : {};
    this.consolidationResults.systems.emergencySystem.stats = stats;
    
    // Verificar protocolos de emergencia
    if (system.emergencyProtocols) {
      this.consolidationResults.systems.emergencySystem.protocols = Array.from(system.emergencyProtocols.keys());
    }
  }
  
  async checkGameSystemSpecific(system) {
    // Verificar componentes del juego
    const gameComponents = ['player', 'input', 'renderer', 'gameState'];
    const availableComponents = gameComponents.filter(component => system[component]);
    
    this.consolidationResults.systems.unifiedGame.components = {
      available: availableComponents,
      missing: gameComponents.filter(component => !availableComponents.includes(component))
    };
    
    // Verificar canvas
    const canvas = document.getElementById('gameCanvas');
    this.consolidationResults.systems.unifiedGame.canvas = {
      exists: !!canvas,
      context2D: canvas ? !!canvas.getContext('2d') : false,
      dimensions: canvas ? { width: canvas.width, height: canvas.height } : null
    };
  }
  
  async checkSystemIntegration() {
    console.log('🔗 Verificando integración entre sistemas...');
    
    // Verificar conexión Learning Memory <-> Voz
    if (window.learningMemory && window.learningMemoryVoice) {
      this.consolidationResults.integration.memoryVoiceConnection = {
        connected: window.learningMemory.voice === window.learningMemoryVoice,
        bidirectional: !!window.learningMemoryVoice.memory
      };
    }
    
    // Verificar integrador de voz
    if (window.voiceIntegrator) {
      const status = window.voiceIntegrator.getIntegrationStatus ? 
                    window.voiceIntegrator.getIntegrationStatus() : {};
      this.consolidationResults.integration.voiceIntegratorStatus = status;
    }
    
    // Verificar comunicación entre sistemas
    this.consolidationResults.integration.crossSystemComm = {
      memoryToVoice: !!(window.learningMemory && window.learningMemory.advancedVoiceReport),
      voiceToMemory: !!(window.learningMemoryVoice && window.learningMemoryVoice.registerInMemory),
      emergencyToVoice: !!(window.emergencySystem && window.emergencySystem.reportToVoiceSystems)
    };
  }
  
  async checkPerformance() {
    console.log('⚡ Verificando rendimiento del sistema...');
    
    const now = Date.now();
    const initTime = now - this.startTime;
    
    this.consolidationResults.performance = {
      initializationTime: initTime,
      memoryUsage: this.estimateMemoryUsage(),
      systemResponsiveness: await this.testSystemResponsiveness(),
      timestamp: now
    };
  }
  
  async checkProtections() {
    console.log('🛡️ Verificando protecciones del sistema...');
    
    if (window.learningMemory && window.learningMemory.workingSystems) {
      const protections = Array.from(window.learningMemory.workingSystems.entries()).map(([key, value]) => ({
        system: key,
        status: value.status,
        protected: value.protected,
        confidence: value.confidence,
        lastWorking: value.lastWorking
      }));
      
      this.consolidationResults.protections = protections;
    }
  }
  
  async checkGameFunctionality() {
    console.log('🎮 Verificando funcionalidad del juego...');
    
    const gameTests = {
      gameLoaded: !!window.unifiedGame,
      canvasRendering: false,
      inputSystem: false,
      mouseControls: false,
      pitchSystem: false
    };
    
    if (window.unifiedGame) {
      // Test canvas
      const canvas = document.getElementById('gameCanvas');
      if (canvas && canvas.getContext('2d')) {
        gameTests.canvasRendering = true;
      }
      
      // Test input system
      if (window.unifiedGame.input) {
        gameTests.inputSystem = true;
        
        // Test mouse controls
        if (window.unifiedGame.input.mouseMoveHandler) {
          gameTests.mouseControls = true;
        }
      }
      
      // Test pitch system
      if (window.unifiedGame.player && window.unifiedGame.player.pitch !== undefined) {
        gameTests.pitchSystem = true;
      }
    }
    
    this.consolidationResults.gameTests = gameTests;
  }
  
  getSystemMethods(system) {
    if (typeof system !== 'object') return [];
    
    return Object.getOwnPropertyNames(system)
      .filter(prop => typeof system[prop] === 'function')
      .slice(0, 10); // Limitar a primeros 10 métodos
  }
  
  estimateMemoryUsage() {
    // Estimación básica del uso de memoria
    let totalSize = 0;
    
    try {
      // Contar eventos en learning memory
      if (window.learningMemory && window.learningMemory.events) {
        totalSize += window.learningMemory.events.length * 100; // ~100 bytes por evento
      }
      
      // Contar sistemas protegidos
      if (window.learningMemory && window.learningMemory.workingSystems) {
        totalSize += window.learningMemory.workingSystems.size * 500; // ~500 bytes por sistema
      }
      
      // LocalStorage
      if (localStorage.getItem('workingGameState')) {
        totalSize += localStorage.getItem('workingGameState').length;
      }
      
    } catch (error) {
      console.warn('No se pudo estimar uso de memoria:', error);
    }
    
    return {
      estimated: totalSize,
      unit: 'bytes',
      readable: this.formatBytes(totalSize)
    };
  }
  
  async testSystemResponsiveness() {
    const tests = [];
    
    // Test Learning Memory
    if (window.learningMemory && window.learningMemory.registerEvent) {
      const start = performance.now();
      window.learningMemory.registerEvent({
        type: 'PERFORMANCE_TEST',
        timestamp: Date.now()
      });
      const end = performance.now();
      tests.push({ system: 'learningMemory', responseTime: end - start });
    }
    
    // Test Voice System
    if (window.learningMemoryVoice && window.learningMemoryVoice.voiceReport) {
      const start = performance.now();
      window.learningMemoryVoice.voiceReport('success', 'Test de rendimiento');
      const end = performance.now();
      tests.push({ system: 'voiceSystem', responseTime: end - start });
    }
    
    return tests;
  }
  
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  generateFinalReport() {
    const endTime = Date.now();
    const totalTime = endTime - this.startTime;
    
    console.log('\n' + '='.repeat(80));
    console.log('🏁 REPORTE FINAL DE CONSOLIDACIÓN');
    console.log('='.repeat(80));
    console.log(`⏱️ Tiempo total de consolidación: ${totalTime}ms`);
    console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
    
    // Estado de sistemas
    console.log('\n🔧 ESTADO DE SISTEMAS:');
    Object.entries(this.consolidationResults.systems).forEach(([name, data]) => {
      const status = data.status === 'LOADED' ? '✅' : '❌';
      console.log(`  ${status} ${name}: ${data.status}`);
      
      if (data.protectedSystems && data.protectedSystems.length > 0) {
        console.log(`    🛡️ Sistemas protegidos: ${data.protectedSystems.length}`);
      }
    });
    
    // Estado de integración
    console.log('\n🔗 ESTADO DE INTEGRACIÓN:');
    if (this.consolidationResults.integration.memoryVoiceConnection) {
      const conn = this.consolidationResults.integration.memoryVoiceConnection;
      console.log(`  🤖 Memory ↔ Voice: ${conn.connected ? '✅ Conectado' : '❌ Desconectado'}`);
      console.log(`  💬 Bidireccional: ${conn.bidirectional ? '✅ Sí' : '❌ No'}`);
    }
    
    // Rendimiento
    console.log('\n⚡ RENDIMIENTO:');
    const perf = this.consolidationResults.performance;
    console.log(`  ⏱️ Inicialización: ${perf.initializationTime}ms`);
    console.log(`  💾 Memoria estimada: ${perf.memoryUsage.readable}`);
    
    if (perf.systemResponsiveness && perf.systemResponsiveness.length > 0) {
      console.log('  🚀 Tiempos de respuesta:');
      perf.systemResponsiveness.forEach(test => {
        console.log(`    - ${test.system}: ${test.responseTime.toFixed(2)}ms`);
      });
    }
    
    // Funcionalidad del juego
    console.log('\n🎮 FUNCIONALIDAD DEL JUEGO:');
    if (this.consolidationResults.gameTests) {
      Object.entries(this.consolidationResults.gameTests).forEach(([test, passed]) => {
        const status = passed ? '✅' : '❌';
        console.log(`  ${status} ${test}`);
      });
    }
    
    // Errores y advertencias
    if (this.consolidationResults.errors.length > 0) {
      console.log('\n❌ ERRORES DETECTADOS:');
      this.consolidationResults.errors.forEach(error => {
        console.log(`  • ${error}`);
      });
    }
    
    if (this.consolidationResults.warnings.length > 0) {
      console.log('\n⚠️ ADVERTENCIAS:');
      this.consolidationResults.warnings.forEach(warning => {
        console.log(`  • ${warning}`);
      });
    }
    
    // Veredicto final
    const systemsLoaded = Object.values(this.consolidationResults.systems)
                               .filter(s => s.status === 'LOADED').length;
    const totalSystems = Object.keys(this.consolidationResults.systems).length;
    const loadPercentage = (systemsLoaded / totalSystems) * 100;
    
    let verdict, emoji;
    if (this.consolidationResults.errors.length === 0 && loadPercentage === 100) {
      verdict = 'SISTEMA PERFECTO - Todos los componentes operativos';
      emoji = '🎉';
    } else if (this.consolidationResults.errors.length === 0 && loadPercentage >= 80) {
      verdict = 'SISTEMA ESTABLE - Funcionalidad completa';
      emoji = '✅';
    } else if (this.consolidationResults.errors.length <= 2) {
      verdict = 'SISTEMA FUNCIONAL - Errores menores';
      emoji = '⚠️';
    } else {
      verdict = 'SISTEMA COMPROMETIDO - Requiere atención';
      emoji = '🚨';
    }
    
    console.log(`\n${emoji} VEREDICTO FINAL:`);
    console.log(`${verdict}`);
    console.log(`Sistemas cargados: ${systemsLoaded}/${totalSystems} (${loadPercentage.toFixed(1)}%)`);
    
    // Registrar en Learning Memory
    if (window.learningMemory && window.learningMemory.registerEvent) {
      window.learningMemory.registerEvent({
        type: 'FINAL_CONSOLIDATION',
        action: 'COMPLETE_SYSTEM_CHECK',
        description: verdict,
        details: {
          systemsLoaded: systemsLoaded,
          totalSystems: totalSystems,
          loadPercentage: loadPercentage,
          errors: this.consolidationResults.errors.length,
          warnings: this.consolidationResults.warnings.length,
          consolidationTime: totalTime
        },
        timestamp: Date.now(),
        preserve: true
      });
    }
    
    // Reportar a sistema de voz
    if (window.learningMemoryVoice && window.learningMemoryVoice.voiceReport) {
      const reportType = this.consolidationResults.errors.length === 0 ? 'success' : 'warning';
      window.learningMemoryVoice.voiceReport(
        reportType,
        `CONSOLIDACIÓN COMPLETADA: ${verdict}`,
        {
          systemsLoaded: `${systemsLoaded}/${totalSystems}`,
          time: `${totalTime}ms`,
          errors: this.consolidationResults.errors.length,
          warnings: this.consolidationResults.warnings.length
        }
      );
    }
    
    console.log('\n🔄 Consolidación completada. Sistemas en monitoreo continuo...');
    console.log('='.repeat(80));
  }
  
  generateEmergencyReport() {
    console.error('\n🚨 REPORTE DE EMERGENCIA - CONSOLIDACIÓN FALLÓ');
    console.error('💥 Errores críticos detectados:');
    this.consolidationResults.errors.forEach(error => {
      console.error(`  • ${error}`);
    });
    console.error('\n🔧 Intentar recargar la página o verificar consola del navegador');
  }
}

// Inicializar consolidación
document.addEventListener('DOMContentLoaded', () => {
  // Esperar un poco más para asegurar que todos los sistemas estén listos
  setTimeout(() => {
    new FinalConsolidation();
  }, 6000);
});

console.log('🏁 Sistema de consolidación final cargado');
