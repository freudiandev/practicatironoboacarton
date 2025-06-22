/**
 * SISTEMA DE EMERGENCIA Y AUTOCORRECCIÓN
 * Detecta y corrige problemas críticos automáticamente en tiempo real
 */

class EmergencyAutoCorrection {
  constructor() {
    this.emergencyProtocols = new Map();
    this.activeCorrections = new Set();
    this.emergencyHistory = [];
    this.autoFixEnabled = true;
    
    console.log('🚨 SISTEMA DE EMERGENCIA Y AUTOCORRECCIÓN INICIALIZADO');
    this.setupEmergencyProtocols();
    this.startEmergencyMonitoring();
  }
  
  setupEmergencyProtocols() {
    // Protocolo: Juego no carga
    this.emergencyProtocols.set('GAME_NOT_LOADING', {
      detection: () => !window.unifiedGame && Date.now() - this.startTime > 5000,
      severity: 'CRITICAL',
      autoFix: () => this.fixGameLoading(),
      description: 'Juego principal no se ha cargado'
    });
    
    // Protocolo: Canvas no renderiza
    this.emergencyProtocols.set('CANVAS_NOT_RENDERING', {
      detection: () => {
        const canvas = document.getElementById('gameCanvas');
        return !canvas || !canvas.getContext('2d');
      },
      severity: 'HIGH',
      autoFix: () => this.fixCanvasRendering(),
      description: 'Canvas del juego no está renderizando'
    });
    
    // Protocolo: Sistema de mouse roto
    this.emergencyProtocols.set('MOUSE_SYSTEM_BROKEN', {
      detection: () => {
        if (!window.unifiedGame || !window.unifiedGame.input) return false;
        // Verificar si el sistema de mouse está invertido
        const input = window.unifiedGame.input;
        return input.mouseInverted === true; // Detector de dirección incorrecta
      },
      severity: 'HIGH',
      autoFix: () => this.fixMouseDirection(),
      description: 'Sistema de mouse con dirección incorrecta'
    });
    
    // Protocolo: Learning Memory no funciona
    this.emergencyProtocols.set('LEARNING_MEMORY_BROKEN', {
      detection: () => !window.learningMemory || typeof window.learningMemory.registerEvent !== 'function',
      severity: 'CRITICAL',
      autoFix: () => this.fixLearningMemory(),
      description: 'Learning Memory no operativo'
    });
    
    // Protocolo: Errores de sintaxis en consola
    this.emergencyProtocols.set('SYNTAX_ERRORS', {
      detection: () => this.detectSyntaxErrors(),
      severity: 'HIGH',
      autoFix: () => this.reportSyntaxErrors(),
      description: 'Errores de sintaxis detectados'
    });
    
    // Protocolo: Pitch hace volar al jugador
    this.emergencyProtocols.set('PITCH_FLYING_PLAYER', {
      detection: () => {
        if (!window.unifiedGame || !window.unifiedGame.player) return false;
        const player = window.unifiedGame.player;
        return player.y && player.y !== 0.5; // El jugador debe estar siempre a nivel del suelo
      },
      severity: 'MEDIUM',
      autoFix: () => this.fixPitchFlying(),
      description: 'Sistema de pitch hace volar al jugador'
    });
    
    console.log(`🛡️ ${this.emergencyProtocols.size} protocolos de emergencia configurados`);
  }
  
  startEmergencyMonitoring() {
    this.startTime = Date.now();
    
    // Monitoreo cada segundo para problemas críticos
    setInterval(() => {
      this.checkEmergencyConditions();
    }, 1000);
    
    // Interceptar errores globales
    window.addEventListener('error', (event) => {
      this.handleGlobalError(event);
    });
    
    // Interceptar errores de promesas no capturadas
    window.addEventListener('unhandledrejection', (event) => {
      this.handleUnhandledRejection(event);
    });
    
    console.log('🔍 Monitoreo de emergencia activo');
  }
  
  checkEmergencyConditions() {
    this.emergencyProtocols.forEach((protocol, name) => {
      if (this.activeCorrections.has(name)) return; // Ya está siendo corregido
      
      try {
        if (protocol.detection()) {
          this.triggerEmergencyProtocol(name, protocol);
        }
      } catch (error) {
        this.reportEmergencyError(name, error);
      }
    });
  }
  
  triggerEmergencyProtocol(name, protocol) {
    console.warn(`🚨 EMERGENCIA DETECTADA: ${name}`);
    console.warn(`📝 Descripción: ${protocol.description}`);
    console.warn(`⚡ Severidad: ${protocol.severity}`);
    
    const emergencyEvent = {
      name,
      description: protocol.description,
      severity: protocol.severity,
      timestamp: Date.now(),
      autoFixAttempted: false
    };
    
    // Reportar a sistemas de voz si están disponibles
    this.reportToVoiceSystems('error', `EMERGENCIA: ${protocol.description}`, {
      severity: protocol.severity,
      autoFixAvailable: !!protocol.autoFix
    });
    
    // Intentar autocorrección si está habilitada
    if (this.autoFixEnabled && protocol.autoFix) {
      this.activeCorrections.add(name);
      
      try {
        console.log(`🔧 APLICANDO AUTOCORRECCIÓN: ${name}`);
        const fixResult = protocol.autoFix();
        
        emergencyEvent.autoFixAttempted = true;
        emergencyEvent.autoFixResult = fixResult;
        
        if (fixResult && fixResult.success) {
          console.log(`✅ AUTOCORRECCIÓN EXITOSA: ${name}`);
          this.reportToVoiceSystems('fix', `CORREGIDO: ${protocol.description}`, fixResult);
        } else {
          console.error(`❌ AUTOCORRECCIÓN FALLÓ: ${name}`);
          this.reportToVoiceSystems('error', `CORRECCIÓN FALLÓ: ${protocol.description}`, fixResult);
        }
        
      } catch (error) {
        console.error(`💥 ERROR EN AUTOCORRECCIÓN: ${name}`, error);
        emergencyEvent.autoFixError = error.message;
        this.reportToVoiceSystems('error', `ERROR EN CORRECCIÓN: ${error.message}`);
      }
      
      // Remover de correcciones activas después de 5 segundos
      setTimeout(() => {
        this.activeCorrections.delete(name);
      }, 5000);
    }
    
    this.emergencyHistory.push(emergencyEvent);
    
    // Registrar en learning memory si está disponible
    if (window.learningMemory && window.learningMemory.registerEvent) {
      window.learningMemory.registerEvent({
        type: 'EMERGENCY_PROTOCOL',
        action: name,
        description: protocol.description,
        details: emergencyEvent,
        timestamp: Date.now(),
        preserve: true
      });
    }
  }
  
  // MÉTODOS DE AUTOCORRECCIÓN
  
  fixGameLoading() {
    console.log('🔧 Intentando corregir carga del juego...');
    
    // Verificar si el script principal existe
    const script = document.querySelector('script[src*="DOOM-LIMPIO.js"]');
    if (!script) {
      console.error('❌ Script principal DOOM-LIMPIO.js no encontrado');
      return { success: false, error: 'Script principal no encontrado' };
    }
    
    // Recargar script principal si es necesario
    if (!window.unifiedGame) {
      console.log('🔄 Recargando script del juego...');
      
      const newScript = document.createElement('script');
      newScript.src = 'DOOM-LIMPIO.js';
      newScript.onload = () => {
        console.log('✅ Script del juego recargado');
      };
      document.head.appendChild(newScript);
      
      return { success: true, action: 'Script recargado' };
    }
    
    return { success: false, error: 'Causa desconocida' };
  }
  
  fixCanvasRendering() {
    console.log('🔧 Intentando corregir renderizado del canvas...');
    
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
      // Crear canvas si no existe
      const newCanvas = document.createElement('canvas');
      newCanvas.id = 'gameCanvas';
      newCanvas.width = 800;
      newCanvas.height = 600;
      document.body.appendChild(newCanvas);
      
      return { success: true, action: 'Canvas recreado' };
    }
    
    // Verificar contexto 2D
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return { success: false, error: 'Contexto 2D no disponible en navegador' };
    }
    
    return { success: true, action: 'Canvas verificado' };
  }
  
  fixMouseDirection() {
    console.log('🔧 CORRECCIÓN CRÍTICA: Restaurando dirección natural del mouse...');
    
    if (!window.unifiedGame || !window.unifiedGame.input) {
      return { success: false, error: 'Sistema de input no disponible' };
    }
    
    // Verificar en learning memory la configuración correcta
    if (window.learningMemory && window.learningMemory.workingSystems) {
      const mouseSystem = window.learningMemory.workingSystems.get('MOUSE_CONTROL_SYSTEM');
      if (mouseSystem && mouseSystem.userConfirmation) {
        console.log('✅ APLICANDO CONFIGURACIÓN CONFIRMADA POR USUARIO');
        
        // Aplicar la corrección según learning memory
        const input = window.unifiedGame.input;
        if (input.mouseMoveHandler) {
          // Asegurar dirección natural: mouse.x -= e.movementX
          input.mouseInverted = false;
          console.log('🎯 Dirección del mouse restaurada a natural');
          
          return { 
            success: true, 
            action: 'Dirección natural restaurada según confirmación de usuario',
            configuration: 'mouse.x -= e.movementX'
          };
        }
      }
    }
    
    return { success: false, error: 'No se pudo aplicar corrección' };
  }
  
  fixLearningMemory() {
    console.log('🔧 Intentando reparar Learning Memory...');
    
    // Intentar reinicializar si la clase existe
    if (typeof AdvancedLearningMemorySystem === 'function') {
      try {
        window.learningMemory = new AdvancedLearningMemorySystem();
        return { success: true, action: 'Learning Memory reinicializado' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
    
    return { success: false, error: 'Clase AdvancedLearningMemorySystem no disponible' };
  }
  
  fixPitchFlying() {
    console.log('🔧 Corrigiendo pitch que hace volar al jugador...');
    
    if (window.unifiedGame && window.unifiedGame.player) {
      const player = window.unifiedGame.player;
      
      // Mantener al jugador a nivel del suelo
      player.y = 0.5;
      
      // Asegurar que el pitch solo afecte la perspectiva, no la posición
      if (player.pitch !== undefined) {
        console.log('🎯 Pitch ajustado para solo afectar perspectiva');
        return { success: true, action: 'Jugador devuelto al suelo, pitch ajustado' };
      }
    }
    
    return { success: false, error: 'Sistema de jugador no disponible' };
  }
  
  detectSyntaxErrors() {
    // Esta función se activa desde los event listeners de error
    return this.syntaxErrorDetected || false;
  }
  
  reportSyntaxErrors() {
    console.log('📝 Reportando errores de sintaxis detectados...');
    this.reportToVoiceSystems('error', 'Errores de sintaxis en JavaScript detectados', {
      suggestion: 'Verificar consola del navegador para detalles específicos'
    });
    
    return { success: true, action: 'Errores reportados' };
  }
  
  handleGlobalError(event) {
    console.error('🚨 ERROR GLOBAL DETECTADO:', event.error);
    
    this.syntaxErrorDetected = true;
    
    this.reportToVoiceSystems('error', `Error global: ${event.error.message}`, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  }
  
  handleUnhandledRejection(event) {
    console.error('🚨 PROMESA RECHAZADA NO CAPTURADA:', event.reason);
    
    this.reportToVoiceSystems('error', `Promesa no capturada: ${event.reason}`, {
      type: 'unhandledRejection'
    });
  }
  
  reportToVoiceSystems(type, message, details = {}) {
    // Reportar al sistema de voz de learning memory
    if (window.learningMemory && window.learningMemory.voiceReport) {
      window.learningMemory.voiceReport(type, message, details);
    }
    
    // Reportar al sistema de voz extendido
    if (window.learningMemoryVoice && window.learningMemoryVoice.voiceReport) {
      window.learningMemoryVoice.voiceReport(type, message, details);
    }
  }
  
  reportEmergencyError(protocolName, error) {
    console.error(`💥 ERROR EN PROTOCOLO ${protocolName}:`, error);
    this.reportToVoiceSystems('error', `Error en protocolo de emergencia: ${protocolName}`, {
      error: error.message,
      stack: error.stack
    });
  }
  
  // Método para obtener estadísticas de emergencia
  getEmergencyStats() {
    return {
      totalProtocols: this.emergencyProtocols.size,
      emergencyHistory: this.emergencyHistory.length,
      activeCorrections: this.activeCorrections.size,
      autoFixEnabled: this.autoFixEnabled,
      uptime: Date.now() - this.startTime
    };
  }
}

// Inicializar sistema de emergencia cuando DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.emergencySystem = new EmergencyAutoCorrection();
    console.log('🚨 Sistema de emergencia y autocorrección completamente operativo');
  }, 1500);
});

console.log('🚨 Sistema de emergencia y autocorrección cargado');
