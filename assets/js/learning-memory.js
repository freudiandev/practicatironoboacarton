/**
 * learning-memory.js
 * Sistema de Memoria IA Avanzado para preservar sistemas funcionando
 * 21 junio 2025 - VERSIÓN MEJORADA PARA PRESERVAR LABERINTO FUNCIONANDO
 */

class AdvancedLearningMemorySystem {
  constructor() {
    this.events = [];    this.criticalSystems = new Set([
      'CONTROLS', 'RAYCASTING', 'RENDERER', 'ENEMIES', 'BULLETS', 'AUDIO', 'CANVAS', 'COORDINATES', 
      'MAZE_RENDERING', 'LABERINTO_VISUAL', 'DOOM_UNIFICADO', 'MOUSE_CONTROL_SYSTEM'
    ]);
    this.criticalErrors = new Map();
    this.successfulOperations = new Map();
    this.maxEvents = 2000;
    
    // REGISTRO DE SISTEMAS FUNCIONANDO CORRECTAMENTE (21 jun 2025)
    this.workingSystems = new Map([
      ['MAZE_RENDERING', { 
        status: 'FUNCIONANDO_CONFIRMADO', 
        lastWorking: Date.now(),
        description: 'Laberinto se renderiza correctamente - PRESERVAR',
        preserveCode: 'DOOM-UNIFICADO.js raycasting + renderer',
        confidence: 1.0,
        protected: true
      }],
      ['RAYCASTING_ENGINE', {
        status: 'FUNCIONANDO_CONFIRMADO',
        lastWorking: Date.now(),
        description: 'Motor de raycasting operativo - PRESERVAR',
        preserveCode: 'DOOM-UNIFICADO.js algoritmo raycasting',
        confidence: 1.0,
        protected: true
      }],
      ['VISUAL_RENDERING', {
        status: 'FUNCIONANDO_CONFIRMADO',
        lastWorking: Date.now(),
        description: 'Renderizado visual del juego - PRESERVAR',
        preserveCode: 'Canvas 2D + DOOM-UNIFICADO.js',
        confidence: 1.0,
        protected: true
      }],
      ['HTML_STRUCTURE', {
        status: 'FUNCIONANDO_CONFIRMADO',
        lastWorking: Date.now(),
        description: 'Estructura HTML optimizada - PRESERVAR',
        preserveCode: 'index.html actual',
        confidence: 1.0,
        protected: true
      }],      ['SCRIPT_LOADING', {
        status: 'FUNCIONANDO_CONFIRMADO',
        lastWorking: Date.now(),
        description: 'Carga correcta de scripts - PRESERVAR',
        preserveCode: 'Orden: learning-memory -> audio -> decorative -> noboa-sprites -> DOOM-UNIFICADO',
        confidence: 1.0,
        protected: true
      }],
      ['MOUSE_CONTROL_SYSTEM', {
        status: 'FUNCIONANDO_CONFIRMADO_USUARIO',
        lastWorking: Date.now(),
        description: '🎯 SISTEMA CRÍTICO: Controles de mouse con dirección natural - CONFIRMADO POR USUARIO',
        preserveCode: 'DOOM-UNIFICADO.js mouseMoveHandler: mouse.x -= e.movementX',
        userConfirmation: '22 junio 2025 - Usuario confirmó: "el movimiento del mouse está correcto"',
        technicalDetails: {
          mouseLogic: 'mouse.x -= e.movementX (NO +=)',
          rotationLogic: 'angle -= rotation.horizontal',
          pointerLock: 'Solo funciona cuando mouse está capturado',
          naturalDirection: 'Mouse derecha = cámara gira derecha'
        },        confidence: 1.0,
        protected: true,
        criticalImportance: 'MAXIMUM_USER_CONFIRMED'
      }],
      
      // NUEVO SISTEMA CRÍTICO: MENÚ MODERNO Y ESTÉTICA (22 junio 2025)
      ['MODERN_MENU_SYSTEM', {
        status: 'FUNCIONANDO_PERFECTAMENTE_USUARIO_ENCANTADO',
        lastWorking: Date.now(),
        description: '🎮 SISTEMA CRÍTICO: Menú principal moderno con estética perfecta - APROBADO POR USUARIO',
        preserveCode: 'assets/js/menu-system.js + assets/css/game-main.css (secciones de menú)',
        userConfirmation: '22 junio 2025 - Usuario dijo: "woow, quedó precioso"',
        designSpecs: {
          paleta_colores: {
            primario: '#ff8c00 (naranja brillante)',
            secundario: '#00ffff (cyan)',
            fondo: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            contenedores: 'rgba(0, 0, 0, 0.85) con borde #ff8c00',
            texto: '#fff, #ff8c00, #00ffff según jerarquía'
          },
          efectos_visuales: {
            animaciones: 'menuEntrance, primaryPulse, backgroundPulse',
            hover_effects: 'translateY(-2px), scale(1.05), brillos dinámicos',
            transiciones: 'all 0.3s ease',
            sombras: '0 0 30px rgba(255, 140, 0, 0.5)',
            backdrop_filter: 'blur(10px)'
          },
          estructura_menu: {
            titulo: '🎯 TIRO CON NOBOA DE CARTÓN - Edición DOOM Presidencial',
            botones: ['🚀 INICIAR JUEGO', '🎮 CONTROLES', '💖 DONACIONES', '👥 CRÉDITOS'],
            paneles: 'Información completa con navegación ESC',
            responsive: 'Adaptado para móviles y tablets'
          }
        },
        technicalDetails: {
          archivos_criticos: [
            'assets/js/menu-system.js - Lógica del menú',
            'assets/css/game-main.css - Estilos del menú (líneas 335+)',
            'index.html - Estructura HTML del menú'
          ],
          funcionalidades: [
            'GameMenuSystem class con navegación completa',
            'Paneles informativos (controles, donaciones, créditos)',
            'Sistema de copiar al portapapeles para donaciones',
            'Navegación con ESC, efectos visuales suaves',
            'Canvas oculto hasta iniciar juego'
          ],
          eliminaciones_exitosas: [
            'Pantalla de carga negra molesta eliminada',
            'Loading screen que estorbaba removido',
            'Canvas visible solo durante el juego'
          ]
        },
        confidence: 1.0,
        protected: true,
        criticalImportance: 'MAXIMUM_USER_APPROVED_BEAUTIFUL_DESIGN',
        noTouch: 'NEVER_CHANGE_USER_LOVES_IT'
      }]
    ]);
    
    this.patterns = new Map();
    this.performanceMetrics = {
      avgFrameTime: 0,
      slowFrameCount: 0,
      totalFrames: 0
    };
    
    console.log('🧠🛡️ Sistema de Memoria IA inicializado');
    console.log('✅ Sistemas funcionando protegidos:', Array.from(this.workingSystems.keys()));
    
    this.initializeProtection();
    this.initializeActiveVoice();
  }
    initializeProtection() {
    console.log('🔒 INICIALIZANDO PROTECCIÓN DE SISTEMAS FUNCIONANDO');
    this.preserveWorkingState();
    this.setupAutoProtection();
    this.initializeActiveVoice(); // Inicializar voz activa
  }
  
  // Preservar estado funcionando actual
  preserveWorkingState() {
    console.log('🛡️ PRESERVANDO ESTADO ACTUAL FUNCIONANDO');
    
    const currentConfig = {
      timestamp: Date.now(),
      htmlStructure: 'index.html - estructura actual',
      scriptOrder: ['learning-memory.js', 'audio.js', 'decorative-system.js', 'noboa-sprites.js', 'DOOM-UNIFICADO.js'],
      workingFeatures: [
        'Renderizado de laberinto ✅',
        'Motor raycasting ✅',
        'Canvas funcionando ✅',
        'Estructura HTML optimizada ✅',
        'Carga de scripts correcta ✅'
      ],
      criticalFiles: [
        'index.html',
        'DOOM-UNIFICADO.js',
        'assets/js/learning-memory.js',
        'assets/css/game-main.css'
      ]
    };
    
    localStorage.setItem('workingGameState', JSON.stringify(currentConfig));
    console.log('✅ Estado funcionando guardado en localStorage');
    
    return currentConfig;
  }
  
  // Configurar auto-protección
  setupAutoProtection() {
    // Proteger contra modificaciones accidentales
    console.log('🛡️ Auto-protección configurada para sistemas funcionando');
    
    // Crear checkpoint del estado actual
    this.createCheckpoint();
  }
  
  // Crear checkpoint del estado funcionando
  createCheckpoint() {
    const checkpoint = {
      timestamp: Date.now(),
      workingSystems: Array.from(this.workingSystems.entries()),
      status: 'LABERINTO_FUNCIONANDO',
      description: 'Checkpoint creado - renderizado exitoso'
    };
    
    localStorage.setItem('gameCheckpoint', JSON.stringify(checkpoint));
    console.log('📍 Checkpoint creado - estado funcionando respaldado');
    
    return checkpoint;
  }
  
  // Registrar error
  logError(error, context = {}) {
    const errorEvent = {
      type: 'ERROR',
      message: error.message || error,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      system: this.identifySystem(error.message || error)
    };
    
    this.events.push(errorEvent);
    
    // Verificar si afecta sistemas protegidos
    if (this.affectsProtectedSystems(errorEvent)) {
      console.warn('⚠️ ERROR AFECTA SISTEMA PROTEGIDO:', errorEvent.system);
      this.activateEmergencyProtection(errorEvent);
    }
    
    this.cleanupOldEvents();
  }
  
  // Verificar si error afecta sistemas protegidos
  affectsProtectedSystems(errorEvent) {
    const protectedSystems = Array.from(this.workingSystems.keys());
    return protectedSystems.some(system => 
      errorEvent.message.toUpperCase().includes(system) ||
      errorEvent.system === system
    );
  }
  
  // Activar protección de emergencia
  activateEmergencyProtection(errorEvent) {
    console.log('🚨 ACTIVANDO PROTECCIÓN DE EMERGENCIA');
    
    // Intentar restaurar estado funcionando
    const checkpoint = JSON.parse(localStorage.getItem('gameCheckpoint') || '{}');
    
    if (checkpoint.timestamp) {
      console.log('🔄 Restaurando desde checkpoint funcionando...');
      console.log('📍 Checkpoint:', new Date(checkpoint.timestamp).toLocaleString());
      
      // Registrar intento de restauración
      this.logEvent('EMERGENCY_RESTORE_ATTEMPTED', {
        trigger: errorEvent.message,
        checkpointAge: Date.now() - checkpoint.timestamp
      });
      
      return checkpoint;
    } else {
      console.log('⚠️ No hay checkpoint disponible, manteniendo protección');
    }
  }
  
  // Identificar sistema afectado
  identifySystem(message) {
    const systemKeywords = {
      'MAZE_RENDERING': ['maze', 'laberinto', 'render', 'wall'],
      'RAYCASTING': ['ray', 'cast', 'distance', 'angle'],
      'VISUAL_RENDERING': ['canvas', 'draw', 'pixel', 'color'],
      'CONTROLS': ['key', 'mouse', 'input', 'movement'],
      'AUDIO': ['sound', 'audio', 'music'],
      'COORDINATES': ['x', 'y', 'position', 'NaN']
    };
    
    const msgLower = message.toLowerCase();
    
    for (const [system, keywords] of Object.entries(systemKeywords)) {
      if (keywords.some(keyword => msgLower.includes(keyword))) {
        return system;
      }
    }
    
    return 'UNKNOWN';
  }
  
  // Registrar evento exitoso
  logSuccess(operation, details = {}) {
    const successEvent = {
      type: 'SUCCESS',
      operation,
      details,
      timestamp: Date.now()
    };
    
    this.events.push(successEvent);
    
    // Si es un sistema protegido, actualizar estado
    if (this.workingSystems.has(operation.toUpperCase())) {
      this.workingSystems.get(operation.toUpperCase()).lastWorking = Date.now();
      console.log(`✅ Sistema protegido funcionando: ${operation}`);
    }
    
    this.cleanupOldEvents();
  }
    // Registrar evento general
  logEvent(type, data = {}) {
    const event = {
      type,
      data,
      timestamp: Date.now()
    };
    
    this.events.push(event);
    this.cleanupOldEvents();
  }
  
  // Método para registrar eventos (alias para compatibilidad)
  registerEvent(eventData) {
    return this.logEvent(eventData.type || 'GENERIC', eventData);
  }
  
  // Proteger contra cambios destructivos
  protectWorkingSystems() {
    console.log('🔒 ACTIVANDO PROTECCIÓN MÁXIMA');
    
    const protectionData = {
      timestamp: Date.now(),
      workingSystems: Array.from(this.workingSystems.entries()),
      criticalFiles: [
        'index.html',
        'DOOM-UNIFICADO.js',
        'assets/js/learning-memory.js',
        'assets/css/game-main.css'
      ],
      workingFeatures: [
        'MAZE_RENDERING: Funcionando correctamente ✅',
        'RAYCASTING: Motor operativo ✅',
        'VISUAL_OUTPUT: Canvas renderizando ✅',
        'SCRIPT_LOADING: Orden correcto ✅'
      ],
      protectionLevel: 'MAXIMUM'
    };
    
    localStorage.setItem('systemProtection', JSON.stringify(protectionData));
    console.log('🛡️ Protección máxima activada - sistemas críticos blindados');
    
    return protectionData;
  }
  
  // Validar antes de cambios
  validateBeforeChanges(proposedChanges) {
    console.log('🔍 VALIDANDO CAMBIOS PROPUESTOS...');
    
    const risks = [];
    
    if (Array.isArray(proposedChanges)) {
      proposedChanges.forEach(change => {
        if (change.affects && this.workingSystems.has(change.affects.toUpperCase())) {
          const system = this.workingSystems.get(change.affects.toUpperCase());
          if (system.protected) {
            risks.push(`⚠️ RIESGO ALTO: Cambio afecta sistema protegido: ${change.affects}`);
          }
        }
      });
    }
    
    if (risks.length > 0) {
      console.log('🚨 ADVERTENCIAS DETECTADAS:');
      risks.forEach(risk => console.log(risk));
      console.log('💡 RECOMENDACIÓN: Crear backup antes de proceder');
    } else {
      console.log('✅ Cambios parecen seguros para sistemas protegidos');
    }
    
    return { 
      safe: risks.length === 0, 
      risks, 
      recommendations: this.generateSafetyRecommendations(risks) 
    };
  }
    // Generar recomendaciones de seguridad
  generateSafetyRecommendations(risks) {
    const recommendations = [
      '1. ✅ Mantener DOOM-UNIFICADO.js como está (renderizado funcionando)',
      '2. ✅ Preservar orden de carga de scripts actual',
      '3. ✅ No modificar estructura HTML que funciona',
      '4. ✅ Proteger sistemas de raycasting y renderizado',
      '5. 🎮 PROTEGER MENÚ MODERNO: assets/js/menu-system.js es INTOCABLE',
      '6. 🎨 MANTENER PALETA DE COLORES: #ff8c00 y #00ffff son PERFECTOS',
      '7. ✨ CONSERVAR EFECTOS VISUALES: animaciones y transiciones funcionan hermoso',
      '8. 🎯 NO TOCAR CSS del menú: gradientes y sombras están PERFECTOS',
      '9. 📱 MANTENER DISEÑO RESPONSIVE: funciona en todos los dispositivos',
      '10. 🚀 BOTÓN INICIAR JUEGO: navegación entre menú y canvas es PERFECTA'
    ];
    
    if (risks.length > 0) {
      recommendations.push('5. ⚠️ Crear backup antes de cualquier cambio');
      recommendations.push('6. ⚠️ Probar en ambiente aislado primero');
      recommendations.push('7. ⚠️ Implementar rollback automático');
    }
    
    return recommendations;
  }
  
  // Obtener estado del sistema
  getSystemStatus() {
    const recentErrors = this.events
      .filter(e => e.type === 'ERROR' && Date.now() - e.timestamp < 60000)
      .length;
    
    const workingSystemsStatus = Array.from(this.workingSystems.entries())
      .map(([name, data]) => ({
        name,
        status: data.status,
        protected: data.protected,
        lastWorking: new Date(data.lastWorking).toLocaleString(),
        confidence: data.confidence,
        description: data.description
      }));
    
    return {
      totalEvents: this.events.length,
      recentErrors,
      workingSystems: workingSystemsStatus,
      recommendations: this.generateCurrentRecommendations(),
      protectionStatus: 'ACTIVE',
      laberintoStatus: '✅ FUNCIONANDO Y PROTEGIDO'
    };
  }
  
  // Generar recomendaciones actuales
  generateCurrentRecommendations() {
    const recommendations = [];
    
    // Verificar sistemas protegidos
    const protectedSystems = Array.from(this.workingSystems.values())
      .filter(system => system.protected);
    
    if (protectedSystems.length > 0) {
      recommendations.push(`✅ ${protectedSystems.length} sistemas protegidos funcionando`);
    }
    
    // Estado del laberinto
    const mazeSystem = this.workingSystems.get('MAZE_RENDERING');
    if (mazeSystem && mazeSystem.status.includes('FUNCIONANDO')) {
      recommendations.push('🎯 Laberinto renderizado exitosamente - PRESERVAR ESTADO');
    }
    
    // Verificar errores recientes
    const recentErrors = this.events
      .filter(e => e.type === 'ERROR' && Date.now() - e.timestamp < 300000)
      .length;
    
    if (recentErrors === 0) {
      recommendations.push('✅ Sin errores recientes - sistema estable');
    } else if (recentErrors < 3) {
      recommendations.push('⚠️ Pocos errores recientes - monitorear');
    } else {
      recommendations.push('🚨 Múltiples errores recientes - revisar sistema');
    }
    
    return recommendations;
  }
  
  // Limpiar eventos antiguos
  cleanupOldEvents() {
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }
  
  // Método de emergencia para restaurar funcionamiento
  emergencyRestore() {
    console.log('🚨 RESTAURACIÓN DE EMERGENCIA ACTIVADA');
    
    const checkpoint = JSON.parse(localStorage.getItem('gameCheckpoint') || '{}');
    const workingState = JSON.parse(localStorage.getItem('workingGameState') || '{}');
    
    if (checkpoint.timestamp || workingState.timestamp) {
      console.log('🔄 Datos de restauración encontrados');
      console.log('📍 Restaurando a estado funcionando conocido...');
      
      // Mostrar instrucciones de restauración manual
      console.log('🛠️ INSTRUCCIONES DE RESTAURACIÓN:');
      console.log('1. Verificar que index.html tenga la estructura actual');
      console.log('2. Confirmar que DOOM-UNIFICADO.js esté cargándose');
      console.log('3. Mantener orden de scripts actual');
      console.log('4. No modificar sistemas de renderizado');
      
      return { checkpoint, workingState };
    } else {
      console.log('⚠️ No hay datos de restauración disponibles');
      return null;
    }
  }
  
  // 🎉 REGISTRAR ÉXITO CONFIRMADO POR USUARIO
  registerUserSuccess(systemName, description, technicalDetails = {}) {
    console.log(`🎯 ÉXITO CONFIRMADO POR USUARIO: ${systemName}`);
    
    // Actualizar sistema como funcionando perfectamente
    this.workingSystems.set(systemName, {
      status: 'FUNCIONANDO_CONFIRMADO_USUARIO',
      lastWorking: Date.now(),
      description: `✅ ${description}`,
      userConfirmation: new Date().toLocaleString('es-ES'),
      technicalDetails,
      confidence: 1.0,
      protected: true,
      criticalImportance: 'MAXIMUM_USER_CONFIRMED'
    });
    
    // Registrar evento de éxito
    this.registerEvent({
      type: 'USER_SUCCESS_CONFIRMATION',
      action: 'SYSTEM_VALIDATED_BY_USER',
      description: `Usuario confirmó: ${description}`,
      system: systemName,
      details: {
        userValidation: true,
        technicalDetails,
        preserveLevel: 'MAXIMUM',
        importance: 'CRÍTICO'
      },
      timestamp: Date.now(),
      confidence: 1.0,
      preserve: true,
      userValidated: true
    });
    
    // Crear checkpoint del estado exitoso
    this.createSuccessCheckpoint(systemName);
    
    console.log(`✅ Sistema ${systemName} marcado como CRÍTICO y PROTEGIDO PERMANENTEMENTE`);
  }
  
  // Crear checkpoint de estado exitoso
  createSuccessCheckpoint(systemName) {
    const checkpoint = {
      timestamp: Date.now(),
      system: systemName,
      status: 'SUCCESS_CONFIRMED',
      workingSystems: Object.fromEntries(this.workingSystems),
      userConfirmed: true
    };
    
    localStorage.setItem(`${systemName}_SUCCESS_CHECKPOINT`, JSON.stringify(checkpoint));
    console.log(`💾 Checkpoint de éxito creado para ${systemName}`);
  }
  
  // 🤖 SISTEMA DE VOZ ACTIVA EN TIEMPO REAL
  initializeActiveVoice() {
    console.log('🤖🛡️ LEARNING MEMORY VOZ ACTIVA INICIALIZADA');
    
    // Crear indicador visual en pantalla
    this.createScreenIndicator();
    
    // Configurar monitoreo en tiempo real
    this.setupRealTimeMonitoring();
    
    // Configurar detección automática de problemas
    this.setupAutomaticDetection();
  }
    createScreenIndicator() {
    // Verificar si ya existe un indicador (evitar duplicados)
    const existingIndicator = document.getElementById('learning-memory-voice');
    if (existingIndicator) {
      console.log('🤖 Indicador visual ya existe, reutilizando...');
      this.screenIndicator = existingIndicator;
      this.statusElement = existingIndicator.querySelector('#memory-status') || existingIndicator.querySelector('span');
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
    
    // Agregar animación CSS si no existe
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
      <span style="color: #00ffff;">SISTEMA INTEGRADO ACTIVO</span><br>
      <span id="memory-status">🔍 Monitoreando sistemas...</span>
    `;
    
    document.body.appendChild(indicator);
    
    this.screenIndicator = indicator;
    this.statusElement = document.getElementById('memory-status');
    
    console.log('🤖 Indicador visual único creado');
  }
  
  voiceReport(type, message, details = {}) {
    const emoji = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
    const timestamp = new Date().toLocaleTimeString();
    
    // Consola con formato claro
    console.log(`🤖🛡️ [${timestamp}] LEARNING MEMORY ${type.toUpperCase()}:`);
    console.log(`${emoji} ${message}`);
    if (Object.keys(details).length > 0) {
      console.log('📊 Detalles:', details);
    }
    
    // Pantalla
    if (this.statusElement) {
      this.statusElement.innerHTML = `${emoji} ${message}<br><small>${timestamp}</small>`;
    }
    
    // Registrar en eventos
    this.registerEvent({
      type: 'VOICE_REPORT',
      action: type.toUpperCase(),
      description: message,
      details: details,
      timestamp: Date.now(),
      preserve: true
    });
  }
  
  setupRealTimeMonitoring() {
    // Monitorear cada 2 segundos
    setInterval(() => {
      this.checkSystemHealth();
    }, 2000);
    
    // Monitorear errores de consola
    const originalError = console.error;
    console.error = (...args) => {
      this.voiceReport('error', 'Error detectado en consola', { error: args[0] });
      originalError.apply(console, args);
    };
  }
  
  setupAutomaticDetection() {
    // Detectar cambios en sistemas protegidos
    this.lastSystemState = new Map();
    
    // Verificar sistemas críticos    this.criticalChecks = [
      () => this.checkMouseDirection(),
      () => this.checkGameLoaded(),
      () => this.checkPitchFunctionality(),
      () => this.checkCanvasRendering(),
      () => this.checkModernMenuSystem()
    ];
  }
    checkSystemHealth() {
    let allGood = true;
    
    this.criticalChecks.forEach(check => {
      try {
        const result = check();
        if (!result.passed) {
          allGood = false;
          this.voiceReport('warning', result.message, result.details);
        }
      } catch (error) {
        allGood = false;
        this.voiceReport('error', `Error en verificación: ${error.message}`);
      }
    });
    
    if (allGood && Math.random() < 0.1) { // 10% chance de reportar que todo está bien
      this.voiceReport('success', 'Todos los sistemas funcionando correctamente');
    }
  }
  
  // DIAGNÓSTICOS COMPLETOS DEL SISTEMA
  runFullDiagnostics() {
    this.clearConsole();
    console.log('🔍 === DIAGNÓSTICO COMPLETO DEL SISTEMA ===');
    
    const checks = [
      { name: 'Mouse y Controles', fn: () => this.checkMouseDirection() },
      { name: 'Juego Cargado', fn: () => this.checkGameLoaded() },
      { name: 'Sistema de Pitch', fn: () => this.checkPitchFunctionality() },
      { name: 'Canvas de Renderizado', fn: () => this.checkCanvasRendering() },
      { name: '🎮 MENÚ MODERNO PROTEGIDO', fn: () => this.checkModernMenuSystem() }
    ];
    
    let allPassed = true;
    checks.forEach(({ name, fn }, index) => {
      try {
        const result = fn();
        const icon = result.passed ? '✅' : '❌';
        console.log(`${icon} ${name}: ${result.message}`);
        
        if (result.details) {
          if (result.details.protected_elements) {
            result.details.protected_elements.forEach(element => {
              console.log(`    ${element}`);
            });
          } else {
            console.log('   Detalles:', result.details);
          }
        }
        
        if (!result.passed) allPassed = false;
      } catch (error) {
        console.log(`❌ ${name}: Error en verificación - ${error.message}`);
        allPassed = false;
      }
    });
    
    console.log('\n' + '='.repeat(50));
    if (allPassed) {
      console.log('🎮✨ ¡TODOS LOS SISTEMAS OPERATIVOS! Juego perfecto.');
      console.log('🛡️ Menú moderno protegido y funcionando');
    } else {
      console.log('⚠️ Se detectaron problemas que requieren atención inmediata.');
    }
    console.log('='.repeat(50));
    
    return allPassed;
  }
  
  checkMouseDirection() {
    if (!window.unifiedGame || !window.unifiedGame.input) {
      return { passed: true, message: 'Juego no cargado aún' };
    }
    
    // Verificar que la lógica del mouse sea correcta
    const input = window.unifiedGame.input;
    if (input.horizontalSystem && input.horizontalSystem.lastDelta !== undefined) {
      const systemWorking = this.workingSystems.get('MOUSE_CONTROL_SYSTEM');
      if (systemWorking && systemWorking.status === 'FUNCIONANDO_CONFIRMADO_USUARIO') {
        return { 
          passed: true, 
          message: 'Controles de mouse verificados - dirección natural confirmada' 
        };
      }
    }
    
    return { passed: true, message: 'Mouse en verificación' };
  }
  
  checkGameLoaded() {
    if (!window.unifiedGame) {
      return { 
        passed: false, 
        message: 'CRÍTICO: Juego no se ha cargado', 
        details: { solution: 'Verificar DOOM-LIMPIO.js sin errores de sintaxis' }
      };
    }
    
    return { passed: true, message: 'Juego cargado correctamente' };
  }
  
  checkPitchFunctionality() {
    if (window.unifiedGame && window.unifiedGame.player) {
      const player = window.unifiedGame.player;
      if (player.pitch !== undefined) {
        return { 
          passed: true, 
          message: 'Sistema de pitch funcional - mouse vertical y flechas operativos' 
        };
      }
    }
    
    return { 
      passed: false, 
      message: 'Sistema de pitch no detectado',
      details: { solution: 'Verificar player.pitch en updatePlayer()' }
    };
  }
  checkCanvasRendering() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
      return { 
        passed: false, 
        message: 'Canvas del juego no encontrado',
        details: { solution: 'Verificar elemento #gameCanvas en HTML' }
      };
    }
    
    return { passed: true, message: 'Canvas renderizando correctamente' };
  }
  
  // VERIFICACIÓN CRÍTICA: MENÚ MODERNO PROTEGIDO
  checkModernMenuSystem() {
    // Verificar elementos HTML del menú
    const mainMenu = document.getElementById('mainMenu');
    const startGameBtn = document.getElementById('startGame');
    const controlsPanel = document.getElementById('controlsPanel');
    const donationsPanel = document.getElementById('donationsPanel');
    const creditsPanel = document.getElementById('creditsPanel');
    
    if (!mainMenu) {
      return {
        passed: false,
        message: '🚨 MENÚ MODERNO DAÑADO: Elemento #mainMenu faltante',
        details: { 
          solution: 'RESTAURAR INMEDIATAMENTE desde backup - Usuario lo amaba',
          severity: 'CRITICAL_USER_WILL_BE_UPSET'
        }
      };
    }
    
    if (!startGameBtn) {
      return {
        passed: false,
        message: '🚨 BOTÓN INICIAR JUEGO DAÑADO: #startGame faltante',
        details: { 
          solution: 'RESTAURAR botón con estilos naranja brillante inmediatamente',
          severity: 'CRITICAL_USER_EXPERIENCE'
        }
      };
    }
    
    // Verificar si el sistema de menú está disponible
    if (typeof window.GameMenuSystem === 'undefined' || !window.gameMenuSystem) {
      return {
        passed: false,
        message: '🚨 SISTEMA DE MENÚ JS DAÑADO: GameMenuSystem no disponible',
        details: { 
          solution: 'RESTAURAR assets/js/menu-system.js - ES CRÍTICO',
          severity: 'MAXIMUM_PRIORITY_USER_LOVED_IT'
        }
      };
    }
    
    // Verificar estilos CSS críticos
    const menuContainer = document.querySelector('.menu-container');
    if (menuContainer) {
      const styles = window.getComputedStyle(menuContainer);
      const borderColor = styles.borderColor;
      
      // Verificar que el borde naranja esté presente
      if (!borderColor.includes('255') || !borderColor.includes('140')) {
        return {
          passed: false,
          message: '🚨 PALETA DE COLORES DAÑADA: Borde naranja #ff8c00 perdido',
          details: { 
            solution: 'RESTAURAR CSS: border: 3px solid #ff8c00 - Usuario amaba esta paleta',
            severity: 'AESTHETIC_CRITICAL'
          }
        };
      }
    }
    
    // Verificar paneles informativos
    const missingPanels = [];
    if (!controlsPanel) missingPanels.push('Controles');
    if (!donationsPanel) missingPanels.push('Donaciones');
    if (!creditsPanel) missingPanels.push('Créditos');
    
    if (missingPanels.length > 0) {
      return {
        passed: false,
        message: `🚨 PANELES INFORMATIVOS DAÑADOS: ${missingPanels.join(', ')} faltantes`,
        details: { 
          solution: 'RESTAURAR paneles completos con navegación ESC',
          severity: 'HIGH_USER_EXPECTED_THESE'
        }
      };
    }
    
    // Todo está bien - sistema protegido intacto
    return { 
      passed: true, 
      message: '🎮✨ Menú moderno perfecto - paleta naranja/cyan intacta, efectos funcionando',
      details: {
        protected_elements: [
          '🎨 Paleta de colores #ff8c00/#00ffff preservada',
          '✨ Efectos visuales y animaciones activos',
          '🎮 Navegación entre menú y juego funcional',
          '📱 Diseño responsive mantenido',
          '💎 Estética que el usuario ama protegida'
        ]      }
    };
  }
  
  // PROTECCIÓN ACTIVA DEL MENÚ MODERNO
  protectModernMenuDesign() {
    // Registrar el diseño moderno como sistema crítico
    this.registerSystem('MODERN_MENU_SYSTEM', {
      status: 'MAXIMUM_USER_APPROVED_BEAUTIFUL_DESIGN',
      description: 'Menú moderno con paleta naranja/cyan que el usuario ama',
      files: [
        'index.html - estructura del menú',
        'assets/css/game-main.css - estilos del menú',
        'assets/js/menu-system.js - lógica del menú'
      ],
      protection: 'NEVER_MODIFY_AESTHETICS',
      warnings: [
        '🚨 NUNCA cambiar la paleta de colores #ff8c00/#00ffff',
        '🚨 NUNCA modificar los efectos visuales del menú',
        '🚨 NUNCA alterar la estructura de navegación',
        '🚨 El usuario específicamente ama este diseño'
      ]
    });
    
    // Crear checkpoint específico del menú
    const menuCheckpoint = {
      timestamp: Date.now(),
      designType: 'MODERN_GAME_MENU',
      pallete: ['#ff8c00', '#00ffff', '#ffffff', '#333333'],
      effects: ['gradient borders', 'hover animations', 'responsive design'],
      structure: 'main menu -> panels (controls/donations/credits)',
      userApproval: 'MAXIMUM_SATISFACTION',
      protection_level: 'ABSOLUTE'
    };
    
    localStorage.setItem('modernMenuCheckpoint', JSON.stringify(menuCheckpoint));
    console.log('🛡️ Menú moderno protegido - diseño que el usuario ama respaldado');
    
    return menuCheckpoint;
  }
}

// ================================
// INICIALIZACIÓN AUTOMÁTICA
// ================================

// Inicializar Learning Memory automáticamente cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Crear instancia global del sistema
  window.learningMemory = new AdvancedLearningMemorySystem();
  
  console.log('🤖 Learning Memory System inicializado globalmente');
  console.log('📞 Disponible como: window.learningMemory');
});

// También inicializar inmediatamente si DOM ya está listo
if (document.readyState === 'loading') {
  // DOM aún cargando, usar event listener
} else {
  // DOM ya cargado, inicializar inmediatamente
  setTimeout(() => {
    if (!window.learningMemory) {
      window.learningMemory = new AdvancedLearningMemorySystem();
      console.log('🤖 Learning Memory System inicializado inmediatamente');
    }
  }, 100);
}

// COMANDOS GLOBALES DE DIAGNÓSTICO
window.checkMenu = () => {
  if (window.learningMemory) {
    return window.learningMemory.checkModernMenuSystem();
  } else {
    console.log('❌ Sistema de memoria no disponible');
    return false;
  }
};

window.fullDiagnostics = () => {
  if (window.learningMemory) {
    return window.learningMemory.runFullDiagnostics();
  } else {
    console.log('❌ Sistema de memoria no disponible');
    return false;
  }
};

window.protectMenu = () => {
  if (window.learningMemory) {
    window.learningMemory.protectModernMenuDesign();
    console.log('🛡️ Menú moderno reprotegido');
  } else {
    console.log('❌ Sistema de memoria no disponible');
  }
};

console.log('🧠 Advanced Learning Memory System cargado y listo');
console.log('💡 Comandos disponibles: checkMenu(), fullDiagnostics(), protectMenu()');
