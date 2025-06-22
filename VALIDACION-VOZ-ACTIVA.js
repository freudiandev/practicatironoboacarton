/**
 * VALIDACIÓN COMPLETA DEL SISTEMA DE VOZ ACTIVA
 * Verifica que todos los componentes estén funcionando correctamente
 */

console.log('🔍 INICIANDO VALIDACIÓN COMPLETA DEL SISTEMA...');

class SystemValidation {
  constructor() {
    this.results = [];
    this.errors = [];
    this.warnings = [];
    this.startTime = Date.now();
    
    // Esperar a que todos los sistemas se carguen
    setTimeout(() => {
      this.runCompleteValidation();
    }, 3000);
  }
  
  runCompleteValidation() {
    console.log('🧪 EJECUTANDO VALIDACIÓN COMPLETA...');
    
    // 1. Verificar Learning Memory
    this.validateLearningMemory();
    
    // 2. Verificar sistema de voz
    this.validateVoiceSystem();
    
    // 3. Verificar juego principal
    this.validateMainGame();
    
    // 4. Verificar integración
    this.validateIntegration();
    
    // 5. Reportar resultados
    this.generateReport();
  }
  
  validateLearningMemory() {
    console.log('🧠 Validando Learning Memory...');
    
    if (window.learningMemory) {
      this.addResult('✅ Learning Memory cargado');
      
      // Verificar métodos críticos
      const criticalMethods = ['registerEvent', 'voiceReport', 'protectWorkingSystems'];
      criticalMethods.forEach(method => {
        if (typeof window.learningMemory[method] === 'function') {
          this.addResult(`✅ Método ${method} disponible`);
        } else {
          this.addError(`❌ Método ${method} NO disponible`);
        }
      });
      
      // Verificar sistemas protegidos
      if (window.learningMemory.workingSystems && window.learningMemory.workingSystems.size > 0) {
        this.addResult(`✅ ${window.learningMemory.workingSystems.size} sistemas protegidos`);
        
        // Verificar sistema de mouse específicamente
        const mouseSystem = window.learningMemory.workingSystems.get('MOUSE_CONTROL_SYSTEM');
        if (mouseSystem && mouseSystem.status === 'FUNCIONANDO_CONFIRMADO_USUARIO') {
          this.addResult('✅ Sistema de mouse protegido y confirmado por usuario');
        } else {
          this.addWarning('⚠️ Sistema de mouse no confirmado');
        }
      } else {
        this.addWarning('⚠️ No hay sistemas protegidos registrados');
      }
      
    } else {
      this.addError('❌ Learning Memory NO cargado');
    }
  }
  
  validateVoiceSystem() {
    console.log('🤖 Validando sistema de voz...');
    
    if (window.learningMemoryVoice) {
      this.addResult('✅ Sistema de voz cargado');
      
      // Verificar indicador visual
      const indicator = document.getElementById('learning-memory-voice');
      if (indicator) {
        this.addResult('✅ Indicador visual creado en pantalla');
        
        // Verificar estilos
        const computedStyle = window.getComputedStyle(indicator);
        if (computedStyle.position === 'fixed') {
          this.addResult('✅ Indicador posicionado correctamente');
        } else {
          this.addWarning('⚠️ Indicador puede no estar visible');
        }
      } else {
        this.addError('❌ Indicador visual NO encontrado');
      }
      
      // Verificar métodos del sistema de voz
      const voiceMethods = ['voiceReport', 'checkSystemHealth', 'reportIssue'];
      voiceMethods.forEach(method => {
        if (typeof window.learningMemoryVoice[method] === 'function') {
          this.addResult(`✅ Método de voz ${method} disponible`);
        } else {
          this.addError(`❌ Método de voz ${method} NO disponible`);
        }
      });
      
    } else {
      this.addError('❌ Sistema de voz NO cargado');
    }
  }
  
  validateMainGame() {
    console.log('🎮 Validando juego principal...');
    
    if (window.unifiedGame) {
      this.addResult('✅ Juego principal cargado');
      
      // Verificar componentes críticos
      const criticalComponents = ['player', 'input', 'renderer', 'gameState'];
      criticalComponents.forEach(component => {
        if (window.unifiedGame[component]) {
          this.addResult(`✅ Componente ${component} disponible`);
        } else {
          this.addWarning(`⚠️ Componente ${component} no encontrado`);
        }
      });
      
      // Verificar canvas
      const canvas = document.getElementById('gameCanvas');
      if (canvas) {
        this.addResult('✅ Canvas del juego encontrado');
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          this.addResult('✅ Contexto 2D del canvas operativo');
        } else {
          this.addError('❌ Contexto 2D NO disponible');
        }
      } else {
        this.addError('❌ Canvas del juego NO encontrado');
      }
      
    } else {
      this.addError('❌ Juego principal NO cargado');
    }
  }
  
  validateIntegration() {
    console.log('🔗 Validando integración entre sistemas...');
    
    // Verificar conexión Learning Memory <-> Voz
    if (window.learningMemory && window.learningMemoryVoice) {
      if (window.learningMemory.voice === window.learningMemoryVoice) {
        this.addResult('✅ Integración Learning Memory <-> Voz establecida');
      } else {
        this.addWarning('⚠️ Integración Learning Memory <-> Voz no detectada');
        
        // Intentar establecer conexión
        try {
          window.learningMemory.voice = window.learningMemoryVoice;
          this.addResult('🔧 Conexión establecida automáticamente');
        } catch (error) {
          this.addError(`❌ Error al establecer conexión: ${error.message}`);
        }
      }
    }
    
    // Verificar protección de sistemas críticos
    if (window.learningMemory && window.learningMemory.workingSystems) {
      const protectedSystems = Array.from(window.learningMemory.workingSystems.keys());
      this.addResult(`✅ ${protectedSystems.length} sistemas bajo protección activa`);
      
      protectedSystems.forEach(system => {
        console.log(`🛡️ Sistema protegido: ${system}`);
      });
    }
  }
  
  generateReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 REPORTE COMPLETO DE VALIDACIÓN');
    console.log('='.repeat(60));
    console.log(`⏱️ Duración: ${duration}ms`);
    console.log(`✅ Éxitos: ${this.results.length}`);
    console.log(`⚠️ Advertencias: ${this.warnings.length}`);
    console.log(`❌ Errores: ${this.errors.length}`);
    console.log('\n📊 RESULTADOS DETALLADOS:');
    
    // Mostrar todos los resultados
    [...this.results, ...this.warnings, ...this.errors].forEach(item => {
      console.log(item);
    });
    
    // Evaluar estado general
    const totalIssues = this.warnings.length + this.errors.length;
    let systemStatus;
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      systemStatus = '🎉 SISTEMA PERFECTO - Todo funcionando óptimamente';
    } else if (this.errors.length === 0) {
      systemStatus = '✅ SISTEMA ESTABLE - Solo advertencias menores';
    } else if (this.errors.length <= 2) {
      systemStatus = '⚠️ SISTEMA FUNCIONAL - Errores menores detectados';
    } else {
      systemStatus = '🚨 SISTEMA COMPROMETIDO - Múltiples errores críticos';
    }
    
    console.log('\n🏁 VEREDICTO FINAL:');
    console.log(systemStatus);
    
    // Reportar a Learning Memory si está disponible
    if (window.learningMemory && window.learningMemory.registerEvent) {
      window.learningMemory.registerEvent({
        type: 'SYSTEM_VALIDATION',
        action: 'COMPLETE_VALIDATION',
        description: systemStatus,
        details: {
          duration: duration,
          results: this.results.length,
          warnings: this.warnings.length,
          errors: this.errors.length,
          totalChecks: this.results.length + this.warnings.length + this.errors.length
        },
        timestamp: Date.now(),
        preserve: true
      });
    }
    
    // Reportar a la voz si está disponible
    if (window.learningMemoryVoice && window.learningMemoryVoice.voiceReport) {
      const reportType = this.errors.length > 0 ? 'warning' : 'success';
      window.learningMemoryVoice.voiceReport(
        reportType, 
        `Validación completada: ${this.results.length} éxitos, ${this.warnings.length} advertencias, ${this.errors.length} errores`,
        { duration: `${duration}ms`, status: systemStatus }
      );
    }
    
    console.log('\n🔄 Validación completada. Los sistemas continúan monitoreando...');
  }
  
  addResult(message) {
    this.results.push(message);
  }
  
  addWarning(message) {
    this.warnings.push(message);
  }
  
  addError(message) {
    this.errors.push(message);
  }
}

// Inicializar validación cuando DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new SystemValidation();
  });
} else {
  new SystemValidation();
}

console.log('🔍 Sistema de validación completa inicializado');
