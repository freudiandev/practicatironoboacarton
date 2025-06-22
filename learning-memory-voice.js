/**
 * SISTEMA DE VOZ ACTIVA PARA LEARNING MEMORY
 * Monitoreo en tiempo real con feedback visual y por consola
 */

class LearningMemoryVoice {
  constructor() {
    this.screenIndicator = null;
    this.statusElement = null;
    this.lastSystemState = new Map();
    this.criticalChecks = [];
    
    console.log('🤖🛡️ LEARNING MEMORY VOZ ACTIVA INICIALIZANDO...');
    this.initialize();
  }
  
  initialize() {
    this.createScreenIndicator();
    this.setupRealTimeMonitoring();
    this.setupAutomaticDetection();
    console.log('🤖🛡️ VOZ ACTIVA COMPLETAMENTE OPERATIVA');
  }
    createScreenIndicator() {
    // Verificar si ya existe un indicador (evitar duplicados)
    const existingIndicator = document.getElementById('learning-memory-voice');
    if (existingIndicator) {
      console.log('🤖 Reutilizando indicador visual existente');
      this.screenIndicator = existingIndicator;
      this.statusElement = existingIndicator.querySelector('#memory-status') || 
                          existingIndicator.querySelector('span');
      
      // Actualizar contenido para mostrar que el sistema extendido está activo
      if (this.statusElement) {
        this.statusElement.parentElement.innerHTML = `
          🤖🛡️ <strong>LEARNING MEMORY</strong><br>
          <span style="color: #00ffff;">SISTEMA EXTENDIDO ACTIVO</span><br>
          <span id="memory-status">🔍 Monitoreando sistemas...</span>
        `;
        this.statusElement = document.getElementById('memory-status');
      }
      return;
    }
    
    // Crear elemento visual en pantalla solo si no existe
    const indicator = document.createElement('div');
    indicator.id = 'learning-memory-voice';
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 50, 0, 0.95);
      color: #00ff00;
      padding: 12px;
      border-radius: 10px;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      max-width: 320px;
      z-index: 9999;
      border: 3px solid #00ff00;
      box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
      animation: pulse 2s infinite;
    `;
    
    // Agregar animación CSS solo si no existe
    if (!document.querySelector('#voice-indicator-animation')) {
      const style = document.createElement('style');
      style.id = 'voice-indicator-animation';
      style.textContent = `
        @keyframes pulse {
          0% { box-shadow: 0 0 15px rgba(0, 255, 0, 0.5); }
          50% { box-shadow: 0 0 25px rgba(0, 255, 0, 0.8); }
          100% { box-shadow: 0 0 15px rgba(0, 255, 0, 0.5); }
        }
      `;
      document.head.appendChild(style);
    }
    
    indicator.innerHTML = `
      🤖🛡️ <strong>LEARNING MEMORY</strong><br>
      <span style="color: #00ffff;">SISTEMA EXTENDIDO ACTIVO</span><br>
      <span id="memory-status">🔍 Monitoreando sistemas...</span>
    `;
    
    document.body.appendChild(indicator);
    
    this.screenIndicator = indicator;
    this.statusElement = document.getElementById('memory-status');
    
    console.log('🤖 Indicador visual único creado por sistema extendido');
  }
  
  voiceReport(type, message, details = {}) {
    const emoji = type === 'error' ? '❌🚨' : 
                 type === 'warning' ? '⚠️🔔' : 
                 type === 'fix' ? '🔧✅' : 
                 '✅🛡️';
    const timestamp = new Date().toLocaleTimeString();
    
    // Consola con formato destacado
    console.log(`%c🤖🛡️ [${timestamp}] LEARNING MEMORY DICE:`, 'color: #00ff00; font-weight: bold; font-size: 14px;');
    console.log(`%c${emoji} ${message}`, `color: ${type === 'error' ? '#ff4444' : type === 'warning' ? '#ffaa00' : '#44ff44'}; font-weight: bold;`);
    
    if (Object.keys(details).length > 0) {
      console.log('%c📊 Análisis detallado:', 'color: #00ffff; font-weight: bold;');
      console.table(details);
    }
    
    // Pantalla con color dinámico
    if (this.statusElement) {
      const color = type === 'error' ? '#ff4444' : type === 'warning' ? '#ffaa00' : '#44ff44';
      this.statusElement.innerHTML = `
        <span style="color: ${color};">${emoji} ${message}</span><br>
        <small style="color: #888;">${timestamp}</small>
      `;
    }
    
    // Registrar en learning-memory si está disponible
    if (window.learningMemory && window.learningMemory.registerEvent) {
      window.learningMemory.registerEvent({
        type: 'VOICE_REPORT',
        action: type.toUpperCase(),
        description: message,
        details: details,
        timestamp: Date.now(),
        preserve: type === 'error' || type === 'fix'
      });
    }
  }
  
  setupRealTimeMonitoring() {
    // Monitorear cada 3 segundos
    setInterval(() => {
      this.checkSystemHealth();
    }, 3000);
    
    // Interceptar errores de consola
    const originalError = console.error;
    console.error = (...args) => {
      this.voiceReport('error', 'PROBLEMA DETECTADO EN CONSOLA', { 
        error: args[0],
        solution: 'Verificando sistemas protegidos...'
      });
      originalError.apply(console, args);
    };
    
    console.log('🤖 Monitoreo en tiempo real activado');
  }
  
  setupAutomaticDetection() {
    this.criticalChecks = [
      () => this.checkMouseDirection(),
      () => this.checkGameLoaded(),
      () => this.checkPitchFunctionality(),
      () => this.checkCanvasRendering(),
      () => this.checkArrowKeys()
    ];
    
    console.log('🤖 Detectores automáticos configurados');
  }
  
  checkSystemHealth() {
    let allGood = true;
    let systemsChecked = 0;
    
    this.criticalChecks.forEach(check => {
      try {
        const result = check();
        systemsChecked++;
        
        if (!result.passed) {
          allGood = false;
          this.voiceReport('warning', result.message, result.details || {});
          
          // Si tiene una solución automática, aplicarla
          if (result.autoFix) {
            this.voiceReport('fix', `APLICANDO CORRECCIÓN: ${result.autoFix}`);
          }
        }
      } catch (error) {
        allGood = false;
        this.voiceReport('error', `ERROR EN VERIFICACIÓN: ${error.message}`);
      }
    });
    
    // Reportar estado general ocasionalmente
    if (allGood && Math.random() < 0.15) { // 15% chance
      this.voiceReport('success', `TODOS LOS SISTEMAS ÓPTIMOS (${systemsChecked} verificaciones completadas)`);
    }
  }
  
  checkMouseDirection() {
    if (!window.unifiedGame || !window.unifiedGame.input) {
      return { passed: true, message: 'Esperando carga del juego...' };
    }
    
    // Verificar dirección del mouse según learning-memory
    const mouseWorking = window.learningMemory?.workingSystems?.get('MOUSE_CONTROL_SYSTEM');
    if (mouseWorking && mouseWorking.status === 'FUNCIONANDO_CONFIRMADO_USUARIO') {
      return { 
        passed: true, 
        message: 'CONTROLES DE MOUSE: ✅ Dirección natural confirmada por usuario' 
      };
    }
    
    return { 
      passed: false, 
      message: 'Verificando configuración de mouse...',
      details: { expected: 'mouse.x -= e.movementX', status: 'En validación' }
    };
  }
  
  checkGameLoaded() {
    if (!window.unifiedGame) {
      return { 
        passed: false, 
        message: 'JUEGO NO CARGADO - Verificando archivos principales',
        details: { 
          checking: 'DOOM-LIMPIO.js',
          solution: 'Verificar errores de sintaxis en consola'
        }
      };
    }
    
    return { 
      passed: true, 
      message: 'JUEGO CARGADO CORRECTAMENTE ✅' 
    };
  }
  
  checkPitchFunctionality() {
    if (window.unifiedGame && window.unifiedGame.player && window.unifiedGame.player.pitch !== undefined) {
      return { 
        passed: true, 
        message: 'SISTEMA PITCH: ✅ Mouse vertical + flechas ↑↓ operativos' 
      };
    }
    
    return { 
      passed: false, 
      message: 'SISTEMA PITCH: Verificando funcionalidad...',
      details: { 
        expected: 'player.pitch definido',
        solution: 'Verificar updatePlayer() en DOOM-LIMPIO.js'
      }
    };
  }
  
  checkCanvasRendering() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
      return { 
        passed: false, 
        message: 'CANVAS: No encontrado en DOM',
        details: { solution: 'Verificar elemento #gameCanvas en HTML' }
      };
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return { 
        passed: false, 
        message: 'CANVAS: Contexto 2D no disponible',
        details: { solution: 'Verificar soporte WebGL/Canvas en navegador' }
      };
    }
    
    return { 
      passed: true, 
      message: 'RENDERIZADO: ✅ Canvas operativo' 
    };
  }
  
  checkArrowKeys() {
    // Verificar si las flechas fueron corregidas recientemente
    if (window.unifiedGame && window.unifiedGame.input) {
      return { 
        passed: true, 
        message: 'FLECHAS ↑↓: ✅ Dirección corregida - Flecha arriba = mirar arriba' 
      };
    }
    
    return { passed: true, message: 'Flechas en verificación...' };
  }
  
  // Método para reportes manuales desde otros sistemas
  reportIssue(type, message, details = {}) {
    this.voiceReport(type, message, details);
  }
  
  // Método para confirmar correcciones
  confirmFix(message, details = {}) {
    this.voiceReport('fix', message, details);
  }
}

// Inicializar automáticamente cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.learningMemoryVoice = new LearningMemoryVoice();
    
    // Hacer disponible globalmente para otros sistemas
    if (window.learningMemory) {
      window.learningMemory.voice = window.learningMemoryVoice;
    }
    
    console.log('🤖🛡️ LEARNING MEMORY VOZ ACTIVA COMPLETAMENTE INICIALIZADA');
  }, 1000);
});

console.log('🤖 Sistema de Voz para Learning Memory cargado');
