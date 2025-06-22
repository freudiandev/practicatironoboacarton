/**
 * REPARACIÓN RÁPIDA DE EMERGENCIA
 * Soluciona todos los problemas críticos de carga detectados
 */

console.log('🚨 === REPARACIÓN RÁPIDA DE EMERGENCIA ACTIVADA ===');

class EmergencyRepair {
  constructor() {
    this.repairs = [];
    this.startTime = Date.now();
    
    console.log('🔧 Iniciando reparación de emergencia...');
    this.runAllRepairs();
  }
  
  async runAllRepairs() {
    // 1. Reparar Learning Memory si no está disponible
    await this.repairLearningMemory();
    
    // 2. Reparar carga del juego principal
    await this.repairGameLoading();
    
    // 3. Inicializar sistemas de voz si no están activos
    await this.initializeVoiceSystems();
    
    // 4. Verificar canvas y controles
    await this.repairCanvasAndControls();
    
    // 5. Reportar resultados
    this.generateRepairReport();
    
    // 6. Ejecutar validación post-reparación
    setTimeout(() => {
      this.postRepairValidation();
    }, 2000);
  }
  
  async repairLearningMemory() {
    console.log('🧠 Reparando Learning Memory...');
    
    if (!window.learningMemory) {
      if (typeof AdvancedLearningMemorySystem === 'function') {
        try {
          window.learningMemory = new AdvancedLearningMemorySystem();
          this.repairs.push('✅ Learning Memory inicializado exitosamente');
          console.log('✅ Learning Memory reparado y operativo');
        } catch (error) {
          this.repairs.push(`❌ Error al inicializar Learning Memory: ${error.message}`);
          console.error('❌ Error al reparar Learning Memory:', error);
        }
      } else {
        this.repairs.push('⚠️ Clase AdvancedLearningMemorySystem no disponible');
        console.warn('⚠️ Clase AdvancedLearningMemorySystem no encontrada');
      }
    } else {
      this.repairs.push('✅ Learning Memory ya estaba operativo');
      console.log('✅ Learning Memory ya operativo');
    }
  }
  
  async repairGameLoading() {
    console.log('🎮 Verificando carga del juego principal...');
    
    if (!window.unifiedGame) {
      // Verificar si el script del juego se cargó correctamente
      const scripts = document.querySelectorAll('script[src*="DOOM"]');
      let doomScriptFound = false;
      
      scripts.forEach(script => {
        if (script.src.includes('DOOM-LIMPIO.js') || script.src.includes('DOOM-UNIFICADO.js')) {
          doomScriptFound = true;
        }
      });
      
      if (doomScriptFound) {
        this.repairs.push('⚠️ Script del juego cargado pero window.unifiedGame no disponible');
        console.warn('⚠️ Script cargado pero juego no inicializado');
        
        // Intentar forzar inicialización si la función existe
        if (typeof initializeUnifiedGame === 'function') {
          try {
            initializeUnifiedGame();
            this.repairs.push('🔧 Inicialización del juego forzada');
          } catch (error) {
            this.repairs.push(`❌ Error al forzar inicialización: ${error.message}`);
          }
        }
      } else {
        this.repairs.push('❌ Script del juego no encontrado');
        console.error('❌ No se encontró script del juego principal');
      }
    } else {
      this.repairs.push('✅ Juego principal ya cargado');
      console.log('✅ Juego principal operativo');
    }
  }
  
  async initializeVoiceSystems() {
    console.log('🤖 Inicializando sistemas de voz...');
    
    // Verificar sistema de voz extendido
    if (!window.learningMemoryVoice) {
      if (typeof LearningMemoryVoice === 'function') {
        try {
          window.learningMemoryVoice = new LearningMemoryVoice();
          this.repairs.push('✅ Sistema de voz extendido inicializado');
        } catch (error) {
          this.repairs.push(`❌ Error al inicializar sistema de voz: ${error.message}`);
        }
      } else {
        this.repairs.push('⚠️ Clase LearningMemoryVoice no disponible');
      }
    } else {
      this.repairs.push('✅ Sistema de voz ya operativo');
    }
    
    // Verificar integrador de voz
    if (!window.voiceIntegrator) {
      if (typeof VoiceSystemIntegrator === 'function') {
        try {
          window.voiceIntegrator = new VoiceSystemIntegrator();
          this.repairs.push('✅ Integrador de voz inicializado');
        } catch (error) {
          this.repairs.push(`❌ Error al inicializar integrador: ${error.message}`);
        }
      } else {
        this.repairs.push('⚠️ Clase VoiceSystemIntegrator no disponible');
      }
    } else {
      this.repairs.push('✅ Integrador de voz ya operativo');
    }
    
    // Verificar sistema de emergencia
    if (!window.emergencySystem) {
      if (typeof EmergencyAutoCorrection === 'function') {
        try {
          window.emergencySystem = new EmergencyAutoCorrection();
          this.repairs.push('✅ Sistema de emergencia inicializado');
        } catch (error) {
          this.repairs.push(`❌ Error al inicializar sistema de emergencia: ${error.message}`);
        }
      } else {
        this.repairs.push('⚠️ Clase EmergencyAutoCorrection no disponible');
      }
    } else {
      this.repairs.push('✅ Sistema de emergencia ya operativo');
    }
  }
  
  async repairCanvasAndControls() {
    console.log('🎨 Verificando canvas y controles...');
    
    // Verificar canvas
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
      // Crear canvas si no existe
      const newCanvas = document.createElement('canvas');
      newCanvas.id = 'gameCanvas';
      newCanvas.width = 800;
      newCanvas.height = 600;
      newCanvas.style.cssText = `
        width: 800px;
        height: 600px;
        border: 1px solid #333;
        background: #000;
        cursor: crosshair;
      `;
      document.body.appendChild(newCanvas);
      
      this.repairs.push('🔧 Canvas recreado exitosamente');
      console.log('🔧 Canvas recreado');
    } else {
      // Verificar contexto 2D
      const ctx = canvas.getContext('2d');
      if (ctx) {
        this.repairs.push('✅ Canvas y contexto 2D operativos');
        console.log('✅ Canvas operativo');
      } else {
        this.repairs.push('❌ Contexto 2D no disponible');
        console.error('❌ Contexto 2D no disponible');
      }
    }
  }
  
  generateRepairReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('🔧 REPORTE DE REPARACIÓN DE EMERGENCIA');
    console.log('='.repeat(60));
    console.log(`⏱️ Duración: ${duration}ms`);
    console.log(`🔧 Reparaciones realizadas: ${this.repairs.length}`);
    console.log('\n📋 DETALLES DE REPARACIÓN:');
    
    this.repairs.forEach(repair => {
      console.log(`  ${repair}`);
    });
    
    // Evaluar estado general
    const successRepairs = this.repairs.filter(r => r.includes('✅')).length;
    const errorRepairs = this.repairs.filter(r => r.includes('❌')).length;
    const warningRepairs = this.repairs.filter(r => r.includes('⚠️')).length;
    
    let status;
    if (errorRepairs === 0 && warningRepairs === 0) {
      status = '🎉 REPARACIÓN PERFECTA - Todos los sistemas operativos';
    } else if (errorRepairs === 0) {
      status = '✅ REPARACIÓN EXITOSA - Advertencias menores';
    } else if (errorRepairs <= 2) {
      status = '⚠️ REPARACIÓN PARCIAL - Algunos errores persistentes';
    } else {
      status = '🚨 REPARACIÓN INCOMPLETA - Múltiples errores críticos';
    }
    
    console.log(`\n🏁 RESULTADO FINAL: ${status}`);
    console.log(`✅ Éxitos: ${successRepairs} | ❌ Errores: ${errorRepairs} | ⚠️ Advertencias: ${warningRepairs}`);
    
    // Registrar en Learning Memory si está disponible
    if (window.learningMemory && window.learningMemory.registerEvent) {
      window.learningMemory.registerEvent({
        type: 'EMERGENCY_REPAIR',
        action: 'COMPLETE_SYSTEM_REPAIR',
        description: status,
        details: {
          duration: duration,
          successRepairs: successRepairs,
          errorRepairs: errorRepairs,
          warningRepairs: warningRepairs,
          repairs: this.repairs
        },
        timestamp: Date.now(),
        preserve: true
      });
    }
    
    console.log('\n🔄 Reparación completada. Iniciando validación...');
  }
  
  postRepairValidation() {
    console.log('\n🔍 === VALIDACIÓN POST-REPARACIÓN ===');
    
    const validations = {
      learningMemory: !!window.learningMemory,
      voiceSystem: !!window.learningMemoryVoice,
      voiceIntegrator: !!window.voiceIntegrator,
      emergencySystem: !!window.emergencySystem,
      gameSystem: !!window.unifiedGame,
      canvas: !!document.getElementById('gameCanvas')
    };
    
    const validCount = Object.values(validations).filter(Boolean).length;
    const totalCount = Object.keys(validations).length;
    
    console.log('📊 ESTADO DE SISTEMAS POST-REPARACIÓN:');
    Object.entries(validations).forEach(([system, isValid]) => {
      const status = isValid ? '✅' : '❌';
      console.log(`  ${status} ${system}: ${isValid ? 'OPERATIVO' : 'NO DISPONIBLE'}`);
    });
    
    console.log(`\n📈 EFECTIVIDAD DE REPARACIÓN: ${validCount}/${totalCount} (${(validCount/totalCount*100).toFixed(1)}%)`);
    
    if (validCount === totalCount) {
      console.log('🎉 ¡TODOS LOS SISTEMAS REPARADOS Y OPERATIVOS!');
      
      // Activar monitoreo si está disponible
      if (window.learningMemoryVoice && window.learningMemoryVoice.voiceReport) {
        window.learningMemoryVoice.voiceReport(
          'success',
          'REPARACIÓN DE EMERGENCIA COMPLETADA - Todos los sistemas operativos',
          { systemsRepaired: validCount, effectiveness: `${(validCount/totalCount*100).toFixed(1)}%` }
        );
      }
    } else {
      console.log('⚠️ Algunos sistemas requieren atención adicional');
      
      if (window.learningMemoryVoice && window.learningMemoryVoice.voiceReport) {
        window.learningMemoryVoice.voiceReport(
          'warning',
          `REPARACIÓN PARCIAL - ${validCount}/${totalCount} sistemas operativos`,
          { systemsOperational: validCount, systemsDown: totalCount - validCount }
        );
      }
    }
    
    console.log('='.repeat(60));
  }
}

// Ejecutar reparación de emergencia inmediatamente
console.log('🚨 Iniciando reparación de emergencia en 1 segundo...');
setTimeout(() => {
  new EmergencyRepair();
}, 1000);

console.log('🔧 Sistema de reparación de emergencia cargado');
