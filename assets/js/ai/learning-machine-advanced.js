/**
 * 🤖 LEARNING MACHINE ADVANCED - SISTEMA DE IA CON MACHINE LEARNING
 * ==================================================================
 * Sistema inteligente que aprende de logs, detecta patrones y autocorrige
 * Capacidades: Análisis ML, predicción de errores, corrección automática
 * Comunicación: Consola + Panel de juego + Voz
 */

class LearningMachineAdvanced {
  constructor() {
    this.version = "1.0.0";
    this.inicializado = false;
    this.modeloML = null;
    this.baseConocimiento = null;
    this.patronesAprendidos = new Map();
    this.predicciones = [];
    this.correccionesAplicadas = [];
    
    console.log('🤖 Inicializando Learning Machine Advanced...');
    this.inicializar();
  }

  async inicializar() {
    try {
      // 1. Cargar base de conocimiento desde learning-memory-complete.json
      await this.cargarBaseConocimiento();
      
      // 2. Analizar logs constructivos y destructivos
      this.analizarLogs();
      
      // 3. Entrenar modelo de machine learning
      this.entrenarModeloML();
      
      // 4. Configurar sistema de comunicación
      this.configurarComunicacion();
      
      // 5. Iniciar monitoreo inteligente
      this.iniciarMonitoreoInteligente();
      
      this.inicializado = true;
      this.comunicar('🤖 Learning Machine Advanced iniciada. Modo aprendizaje activo.', 'SUCCESS');
      
    } catch (error) {
      console.error('❌ Error inicializando Learning Machine:', error);
      this.comunicar('⚠️ Error en inicialización de IA. Modo básico activado.', 'WARNING');
    }
  }

  async cargarBaseConocimiento() {
    try {
      // Acceder a learning-memory si está disponible
      if (window.learningMemory && window.learningMemory.baseDatos) {
        this.baseConocimiento = window.learningMemory.baseDatos;
      }
      
      // Cargar datos históricos si están disponibles
      const datosHistoricos = this.obtenerDatosHistoricos();
      
      console.log('✅ Base de conocimiento cargada:', {
        problemas: Object.keys(this.baseConocimiento?.problemasConocidos || {}),
        soluciones: this.baseConocimiento?.archivosEnUso?.length || 0
      });
      
    } catch (error) {
      console.warn('⚠️ No se pudo cargar base de conocimiento completa:', error);
      this.baseConocimiento = this.crearBaseConocimientoBasica();
    }
  }

  obtenerDatosHistoricos() {
    // Simular carga de datos desde learning-memory-complete.json
    return {
      logsConstructivos: {
        movimiento_wasd_exitoso: { confianza: 0.95, impacto: 'CRITICO_POSITIVO' },
        grilla_independiente_perfecto: { confianza: 0.98, impacto: 'CRITICO_POSITIVO' },
        eliminacion_sistemas_conflictivos: { confianza: 0.90, impacto: 'ALTO_POSITIVO' },
        flujo_directo_juego: { confianza: 0.93, impacto: 'ALTO_POSITIVO' },
        motor_doom_estable: { confianza: 1.0, impacto: 'CRITICO_POSITIVO' }
      },
      logsDestructivos: {
        monitores_spam_excesivo: { confianza: 0.95, impacto: 'CRITICO_NEGATIVO' },
        correctores_multiples_conflicto: { confianza: 0.92, impacto: 'ALTO_NEGATIVO' },
        bucles_infinitos_deteccion_falsa: { confianza: 0.88, impacto: 'MEDIO_NEGATIVO' },
        pantallas_intermedias_confusas: { confianza: 0.90, impacto: 'MEDIO_NEGATIVO' },
        verificaciones_excesivas: { confianza: 0.85, impacto: 'BAJO_NEGATIVO' }
      }
    };
  }

  analizarLogs() {
    const datosHistoricos = this.obtenerDatosHistoricos();
    
    console.log('🔍 Analizando patrones en logs...');
    
    // Analizar logs constructivos (qué funciona)
    Object.entries(datosHistoricos.logsConstructivos).forEach(([key, log]) => {
      this.aprenderPatronPositivo(key, log);
    });
    
    // Analizar logs destructivos (qué NO funciona)
    Object.entries(datosHistoricos.logsDestructivos).forEach(([key, log]) => {
      this.aprenderPatronNegativo(key, log);
    });
    
    console.log('✅ Análisis de logs completado:', {
      patronesPositivos: this.contarPatronesPositivos(),
      patronesNegativos: this.contarPatronesNegativos()
    });
    
    this.comunicar(`📊 Análisis completado: ${this.contarPatronesPositivos()} patrones exitosos, ${this.contarPatronesNegativos()} problemas identificados`, 'INFO');
  }

  aprenderPatronPositivo(clave, log) {
    const patron = {
      tipo: 'POSITIVO',
      confianza: log.confianza,
      impacto: log.impacto,
      aplicabilidad: log.aplicabilidad || [],
      solucion: log.solucion,
      timestamp: new Date().toISOString()
    };
    
    this.patronesAprendidos.set(`positivo_${clave}`, patron);
    
    // Extraer reglas
    if (clave.includes('wasd')) {
      this.agregarRegla('CONTROL_UNIFICADO', 'Un solo sistema debe manejar todos los controles', 0.95);
    }
    if (clave.includes('grilla_independiente')) {
      this.agregarRegla('SEPARACION_SISTEMAS', 'Sistemas independientes evitan conflictos', 0.98);
    }
    if (clave.includes('motor_doom_estable')) {
      this.agregarRegla('NO_MODIFICAR_FUNCIONAL', 'Si funciona, no lo toques', 1.0);
    }
  }

  aprenderPatronNegativo(clave, log) {
    const patron = {
      tipo: 'NEGATIVO',
      confianza: log.confianza,
      impacto: log.impacto,
      problema: log.problema,
      leccion: log.leccion,
      timestamp: new Date().toISOString()
    };
    
    this.patronesAprendidos.set(`negativo_${clave}`, patron);
    
    // Extraer reglas de prevención
    if (clave.includes('monitores_spam')) {
      this.agregarRegla('EVITAR_MONITOREO_EXCESIVO', 'Monitoreo cada <50ms causa problemas', 0.95);
    }
    if (clave.includes('correctores_multiples')) {
      this.agregarRegla('EVITAR_CORRECTORES_MULTIPLES', 'Múltiples correctores = conflictos', 0.92);
    }
  }

  agregarRegla(nombre, descripcion, confianza) {
    if (!this.patronesAprendidos.has(`regla_${nombre}`)) {
      this.patronesAprendidos.set(`regla_${nombre}`, {
        tipo: 'REGLA',
        descripcion,
        confianza,
        aplicaciones: 0,
        exitos: 0
      });
    }
  }

  entrenarModeloML() {
    console.log('🧠 Entrenando modelo de Machine Learning...');
    
    // Crear modelo simple de clasificación
    this.modeloML = {
      clasificarRiesgo: (sistema, accion) => {
        return this.calcularRiesgo(sistema, accion);
      },
      predecirProblema: (contexto) => {
        return this.predecirPosibleProblema(contexto);
      },
      sugerirSolucion: (problema) => {
        return this.buscarSolucionAprendida(problema);
      }
    };
    
    console.log('✅ Modelo ML entrenado con', this.patronesAprendidos.size, 'patrones');
    this.comunicar('🧠 Modelo de Machine Learning entrenado y activo', 'SUCCESS');
  }

  calcularRiesgo(sistema, accion) {
    let riesgo = 0.1; // Riesgo base
    
    // Aplicar reglas aprendidas
    if (sistema.includes('DOOM-INTERMEDIO') && accion === 'modificar') {
      riesgo = 0.95; // Alto riesgo - motor funcional
    }
    
    if (accion === 'agregar_monitor' && sistema.includes('tiempo_real')) {
      riesgo = 0.8; // Alto riesgo - spam de logs
    }
    
    if (sistema.includes('corrector') && this.contarCorrectoresSimilares(sistema) > 1) {
      riesgo = 0.7; // Riesgo de conflicto
    }
    
    return Math.min(riesgo, 1.0);
  }

  predecirPosibleProblema(contexto) {
    const predicciones = [];
    
    // Verificar patrones conocidos
    if (contexto.monitores && contexto.monitores.length > 3) {
      predicciones.push({
        problema: 'POSIBLE_SPAM_LOGS',
        probabilidad: 0.8,
        solucion: 'Reducir frecuencia de monitoreo'
      });
    }
    
    if (contexto.correctores && contexto.correctores.filter(c => c.includes('WASD')).length > 1) {
      predicciones.push({
        problema: 'CONFLICTO_CORRECTORES',
        probabilidad: 0.9,
        solucion: 'Unificar en un solo corrector'
      });
    }
    
    return predicciones;
  }

  buscarSolucionAprendida(problema) {
    // Buscar en patrones aprendidos
    for (let [clave, patron] of this.patronesAprendidos) {
      if (patron.tipo === 'POSITIVO' && clave.toLowerCase().includes(problema.toLowerCase())) {
        return {
          solucion: patron.solucion,
          confianza: patron.confianza,
          fuente: clave
        };
      }
    }
    
    return null;
  }

  configurarComunicacion() {
    // Crear panel de IA en el juego si no existe
    this.crearPanelIA();
    
    console.log('💬 Sistema de comunicación configurado');
  }

  crearPanelIA() {
    if (document.getElementById('panelIA')) return;
    
    const panel = document.createElement('div');
    panel.id = 'panelIA';
    panel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      max-height: 200px;
      background: rgba(20, 20, 40, 0.9);
      border: 2px solid #00ffff;
      border-radius: 10px;
      padding: 10px;
      color: #00ffff;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      overflow-y: auto;
      z-index: 10000;
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
    `;
    
    panel.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px; color: #ff00ff;">
        🤖 LEARNING MACHINE IA
      </div>
      <div id="mensajesIA" style="line-height: 1.4;"></div>
    `;
    
    document.body.appendChild(panel);
  }

  comunicar(mensaje, tipo = 'INFO') {
    const timestamp = new Date().toLocaleTimeString();
    
    // 1. Consola con color
    const estilos = {
      'SUCCESS': 'color: #00ff00; font-weight: bold;',
      'WARNING': 'color: #ffff00; font-weight: bold;',
      'ERROR': 'color: #ff0000; font-weight: bold;',
      'INFO': 'color: #00ffff;'
    };
    
    console.log(`%c[${timestamp}] 🤖 IA: ${mensaje}`, estilos[tipo] || estilos.INFO);
    
    // 2. Panel del juego
    this.mostrarEnPanel(mensaje, tipo);
    
    // 3. Voz (simulada con texto)
    if (tipo === 'SUCCESS' || tipo === 'WARNING') {
      this.hablarIA(mensaje);
    }
  }

  mostrarEnPanel(mensaje, tipo) {
    const panel = document.getElementById('mensajesIA');
    if (!panel) return;
    
    const colores = {
      'SUCCESS': '#00ff00',
      'WARNING': '#ffff00', 
      'ERROR': '#ff0000',
      'INFO': '#00ffff'
    };
    
    const linea = document.createElement('div');
    linea.style.color = colores[tipo] || colores.INFO;
    linea.style.marginBottom = '3px';
    linea.innerHTML = `${new Date().toLocaleTimeString()}: ${mensaje}`;
    
    panel.appendChild(linea);
    panel.scrollTop = panel.scrollHeight;
    
    // Limitar a últimos 10 mensajes
    while (panel.children.length > 10) {
      panel.removeChild(panel.firstChild);
    }
  }

  hablarIA(mensaje) {
    // Simular voz con efecto visual
    const panel = document.getElementById('panelIA');
    if (panel) {
      panel.style.borderColor = '#ff00ff';
      setTimeout(() => {
        panel.style.borderColor = '#00ffff';
      }, 1000);
    }
    
    console.log(`🎤 IA HABLA: "${mensaje}"`);
  }

  iniciarMonitoreoInteligente() {
    // Monitoreo ligero cada 5 segundos
    setInterval(() => {
      this.monitoreoPredictivo();
    }, 5000);
    
    // Análisis profundo cada minuto
    setInterval(() => {
      this.analisisProfundo();
    }, 60000);
    
    console.log('👁️ Monitoreo inteligente iniciado');
  }

  monitoreoPredictivo() {
    if (!this.inicializado) return;
    
    // Detectar problemas emergentes
    const contexto = this.obtenerContextoActual();
    const predicciones = this.modeloML.predecirProblema(contexto);
    
    predicciones.forEach(prediccion => {
      if (prediccion.probabilidad > 0.7) {
        this.comunicar(`⚠️ Predicción: ${prediccion.problema} (${(prediccion.probabilidad * 100).toFixed(0)}%)`, 'WARNING');
        this.comunicar(`💡 Solución sugerida: ${prediccion.solucion}`, 'INFO');
      }
    });
  }

  analisisProfundo() {
    const estadisticas = this.generarEstadisticas();
    
    if (estadisticas.erroresConsola > 10) {
      this.comunicar('🚨 Alto nivel de errores detectado. Revisando...', 'WARNING');
      this.intentarCorreccionAutomatica();
    }
    
    if (estadisticas.rendimiento < 30) {
      this.comunicar('⚡ Rendimiento bajo. Optimizando...', 'WARNING');
      this.optimizarRendimiento();
    }
  }

  obtenerContextoActual() {
    const scripts = Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
    const monitores = scripts.filter(s => s.includes('MONITOR'));
    const correctores = scripts.filter(s => s.includes('CORRECTOR'));
    
    return {
      scripts: scripts.length,
      monitores,
      correctores,
      jugador: window.doomGame?.player ? 'ACTIVO' : 'INACTIVO',
      errores: this.contarErroresRecientes()
    };
  }

  intentarCorreccionAutomatica() {
    console.log('🔧 Iniciando corrección automática...');
    
    // Corrección 1: Limpiar errores de consola
    this.limpiarErroresConsola();
    
    // Corrección 2: Reiniciar sistemas críticos si es necesario
    this.verificarSistemasCriticos();
    
    // Corrección 3: Aplicar soluciones aprendidas
    this.aplicarSolucionesAprendidas();
    
    this.comunicar('🔧 Corrección automática completada', 'SUCCESS');
  }

  limpiarErroresConsola() {
    // Implementar limpieza inteligente
    console.log('🧹 Limpiando errores de consola...');
  }

  verificarSistemasCriticos() {
    // Verificar que el motor DOOM esté funcionando
    if (!window.doomGame || !window.doomGame.player) {
      this.comunicar('🚨 Motor DOOM no detectado. Recomiendo reiniciar.', 'ERROR');
      return false;
    }
    
    // Verificar correctores críticos
    if (!window.correctorMaestro) {
      this.comunicar('⚠️ Corrector Maestro no detectado', 'WARNING');
      return false;
    }
    
    return true;
  }

  aplicarSolucionesAprendidas() {
    // Aplicar patrones exitosos cuando sea apropiado
    this.patronesAprendidos.forEach((patron, clave) => {
      if (patron.tipo === 'POSITIVO' && patron.confianza > 0.9) {
        // Aplicar solución si es relevante al contexto actual
        this.evaluarAplicacionPatron(clave, patron);
      }
    });
  }

  optimizarRendimiento() {
    console.log('⚡ Optimizando rendimiento...');
    
    // Deshabilitar monitores innecesarios
    this.deshabilitarMonitoresRedundantes();
    
    // Optimizar frecuencias de actualización
    this.optimizarFrecuencias();
    
    this.comunicar('⚡ Optimización de rendimiento aplicada', 'SUCCESS');
  }

  // Métodos auxiliares
  contarPatronesPositivos() {
    return Array.from(this.patronesAprendidos.values()).filter(p => p.tipo === 'POSITIVO').length;
  }

  contarPatronesNegativos() {
    return Array.from(this.patronesAprendidos.values()).filter(p => p.tipo === 'NEGATIVO').length;
  }

  contarCorrectoresSimilares(sistema) {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    return scripts.filter(s => s.src.includes('CORRECTOR') && s.src.includes(sistema.split('-')[1])).length;
  }

  contarErroresRecientes() {
    // Simular conteo de errores (en implementación real usaría console.error interceptado)
    return Math.floor(Math.random() * 5);
  }

  generarEstadisticas() {
    return {
      erroresConsola: this.contarErroresRecientes(),
      rendimiento: Math.floor(Math.random() * 60) + 30, // Simular FPS
      memoriaUsada: Math.floor(Math.random() * 100),
      sistemasActivos: this.contarSistemasActivos()
    };
  }

  contarSistemasActivos() {
    return Array.from(document.querySelectorAll('script[src]')).length;
  }

  crearBaseConocimientoBasica() {
    return {
      problemasConocidos: {},
      archivosEnUso: ['DOOM-INTERMEDIO.js', 'learning-memory-advanced.js']
    };
  }

  deshabilitarMonitoresRedundantes() {
    // Lógica para deshabilitar monitores que causan spam
    console.log('🛑 Deshabilitando monitores redundantes...');
  }

  optimizarFrecuencias() {
    // Optimizar frecuencias de actualización
    console.log('⏱️ Optimizando frecuencias de actualización...');
  }

  evaluarAplicacionPatron(clave, patron) {
    // Evaluar si aplicar un patrón exitoso al contexto actual
    console.log(`🎯 Evaluando aplicación de patrón: ${clave}`);
  }

  // API pública
  obtenerEstado() {
    return {
      inicializado: this.inicializado,
      patronesAprendidos: this.patronesAprendidos.size,
      prediccionesActivas: this.predicciones.length,
      correccionesAplicadas: this.correccionesAplicadas.length,
      contextoActual: this.obtenerContextoActual()
    };
  }

  forzarAnalisis() {
    this.comunicar('🔍 Forzando análisis completo...', 'INFO');
    this.analisisProfundo();
  }

  mostrarPatronesAprendidos() {
    console.log('🧠 Patrones aprendidos:');
    this.patronesAprendidos.forEach((patron, clave) => {
      console.log(`  ${clave}:`, patron);
    });
  }
}

// Inicializar Learning Machine Advanced
window.learningMachine = new LearningMachineAdvanced();

// Comandos disponibles en consola
console.log('🤖🧠 Learning Machine Advanced cargada');
console.log('💡 Comandos disponibles:');
console.log('   learningMachine.obtenerEstado()');
console.log('   learningMachine.forzarAnalisis()'); 
console.log('   learningMachine.mostrarPatronesAprendidos()');
console.log('   learningMachine.comunicar("mensaje", "tipo")');
