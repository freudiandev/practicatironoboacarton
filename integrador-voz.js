/**
 * INTEGRADOR DE SISTEMAS DE VOZ LEARNING MEMORY
 * Conecta y sincroniza ambos sistemas de voz para máxima efectividad
 */

class VoiceSystemIntegrator {
  constructor() {
    this.initialized = false;
    this.integrationAttempts = 0;
    this.maxAttempts = 10;
    
    console.log('🔗 INICIANDO INTEGRADOR DE SISTEMAS DE VOZ...');
    this.initialize();
  }
  
  initialize() {
    // Intentar conectar sistemas cuando estén disponibles
    const checkAndConnect = () => {
      this.integrationAttempts++;
      
      if (window.learningMemory && window.learningMemoryVoice) {
        this.connectSystems();
        this.initialized = true;
        return;
      }
      
      if (this.integrationAttempts < this.maxAttempts) {
        setTimeout(checkAndConnect, 500);
      } else {
        console.warn('⚠️ No se pudieron conectar todos los sistemas de voz');
      }
    };
    
    checkAndConnect();
  }
  
  connectSystems() {
    console.log('🤝 CONECTANDO SISTEMAS DE VOZ...');
    
    // Establecer conexión bidireccional
    window.learningMemory.voice = window.learningMemoryVoice;
    window.learningMemoryVoice.memory = window.learningMemory;
    
    // Sincronizar métodos de reporte
    this.synchronizeReporting();
    
    // Mejorar detección de problemas
    this.enhanceDetection();
    
    // Establecer comunicación bidireccional
    this.establishBidirectionalComm();
    
    console.log('✅ SISTEMAS DE VOZ COMPLETAMENTE INTEGRADOS');
    
    // Reportar éxito
    this.reportIntegrationSuccess();
  }
  
  synchronizeReporting() {
    // Mejorar el método voiceReport de learning-memory para usar ambos sistemas
    const originalVoiceReport = window.learningMemory.voiceReport;
    
    window.learningMemory.voiceReport = (type, message, details = {}) => {
      // Llamar al método original
      if (originalVoiceReport) {
        originalVoiceReport.call(window.learningMemory, type, message, details);
      }
      
      // También reportar en el sistema de voz extendido
      if (window.learningMemoryVoice && window.learningMemoryVoice.voiceReport) {
        window.learningMemoryVoice.voiceReport(type, message, details);
      }
    };
    
    console.log('🔄 Sincronización de reportes establecida');
  }
  
  enhanceDetection() {
    // Agregar detectores adicionales específicos para la integración
    if (window.learningMemoryVoice && window.learningMemoryVoice.criticalChecks) {
      // Agregar verificación de integridad de learning-memory
      window.learningMemoryVoice.criticalChecks.push(() => {
        return this.checkLearningMemoryIntegrity();
      });
      
      // Agregar verificación de sistemas protegidos
      window.learningMemoryVoice.criticalChecks.push(() => {
        return this.checkProtectedSystems();
      });
      
      console.log('🔍 Detectores mejorados agregados');
    }
  }
  
  establishBidirectionalComm() {
    // Permitir que learning-memory use el sistema de voz avanzado
    window.learningMemory.advancedVoiceReport = (type, message, details = {}) => {
      if (window.learningMemoryVoice) {
        window.learningMemoryVoice.voiceReport(type, message, details);
      }
    };
    
    // Permitir que el sistema de voz acceda a learning-memory
    window.learningMemoryVoice.registerInMemory = (eventData) => {
      if (window.learningMemory && window.learningMemory.registerEvent) {
        window.learningMemory.registerEvent(eventData);
      }
    };
    
    console.log('💬 Comunicación bidireccional establecida');
  }
  
  checkLearningMemoryIntegrity() {
    if (!window.learningMemory) {
      return {
        passed: false,
        message: 'CRÍTICO: Learning Memory no disponible',
        details: { solution: 'Verificar carga de learning-memory.js' }
      };
    }
    
    if (!window.learningMemory.workingSystems || window.learningMemory.workingSystems.size === 0) {
      return {
        passed: false,
        message: 'ADVERTENCIA: No hay sistemas protegidos',
        details: { solution: 'Verificar configuración de sistemas protegidos' }
      };
    }
    
    return {
      passed: true,
      message: `Learning Memory íntegro con ${window.learningMemory.workingSystems.size} sistemas protegidos`
    };
  }
  
  checkProtectedSystems() {
    if (!window.learningMemory || !window.learningMemory.workingSystems) {
      return { passed: false, message: 'Sistemas protegidos no disponibles' };
    }
    
    const mouseSystem = window.learningMemory.workingSystems.get('MOUSE_CONTROL_SYSTEM');
    if (!mouseSystem) {
      return {
        passed: false,
        message: 'Sistema de mouse no protegido',
        details: { solution: 'Verificar registro en learning-memory' }
      };
    }
    
    if (mouseSystem.status !== 'FUNCIONANDO_CONFIRMADO_USUARIO') {
      return {
        passed: false,
        message: 'Sistema de mouse no confirmado por usuario',
        details: { current: mouseSystem.status, expected: 'FUNCIONANDO_CONFIRMADO_USUARIO' }
      };
    }
    
    return {
      passed: true,
      message: '✅ Sistema de mouse protegido y confirmado'
    };
  }
  
  reportIntegrationSuccess() {
    const integrationReport = {
      type: 'INTEGRATION_SUCCESS',
      action: 'VOICE_SYSTEMS_CONNECTED',
      description: 'Sistemas de voz Learning Memory completamente integrados',
      details: {
        attempts: this.integrationAttempts,
        timestamp: Date.now(),
        systems: ['learning-memory', 'learning-memory-voice'],
        features: [
          'Reporte sincronizado',
          'Detección mejorada',
          'Comunicación bidireccional',
          'Monitoreo en tiempo real'
        ]
      },
      timestamp: Date.now(),
      preserve: true
    };
    
    // Registrar en learning-memory
    if (window.learningMemory && window.learningMemory.registerEvent) {
      window.learningMemory.registerEvent(integrationReport);
    }
    
    // Reportar con voz mejorada
    if (window.learningMemoryVoice && window.learningMemoryVoice.voiceReport) {
      window.learningMemoryVoice.voiceReport(
        'success',
        '🤝 INTEGRACIÓN COMPLETA: Sistemas de voz sincronizados y operativos',
        integrationReport.details
      );
    }
    
    console.log('🎉 INTEGRACIÓN DE SISTEMAS DE VOZ COMPLETADA CON ÉXITO');
  }
  
  // Método para verificar el estado de la integración
  getIntegrationStatus() {
    return {
      initialized: this.initialized,
      attempts: this.integrationAttempts,
      learningMemoryAvailable: !!window.learningMemory,
      voiceSystemAvailable: !!window.learningMemoryVoice,
      connected: this.initialized && window.learningMemory && window.learningMemoryVoice,
      timestamp: Date.now()
    };
  }
}

// Inicializar integrador cuando DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.voiceIntegrator = new VoiceSystemIntegrator();
    console.log('🔗 Integrador de sistemas de voz inicializado');
  }, 2000);
});

console.log('🔗 Integrador de sistemas de voz cargado');
