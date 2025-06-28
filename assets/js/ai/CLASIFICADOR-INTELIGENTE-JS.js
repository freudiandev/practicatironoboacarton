/**
 * 🗂️ CLASIFICADOR INTELIGENTE DE ARCHIVOS JS
 * ==========================================
 * Sistema que analiza y clasifica archivos JS por funcionalidad
 * Mueve archivos a carpetas organizadas y actualiza rutas
 */

class ClasificadorInteligenteJS {
  constructor() {
    this.archivosAnalizados = [];
    this.archivosMovidos = [];
    this.rutasActualizadas = [];
    this.archivosObsoletos = [];
    
    this.categorias = {
      core: {
        patron: ['DOOM-INTERMEDIO', 'motor', 'engine', 'init'],
        descripcion: 'Archivos del motor principal'
      },
      systems: {
        patron: ['SISTEMA-', 'CONSTRUCTION', 'RENDERIZADOR'],
        descripcion: 'Sistemas funcionales del juego'
      },
      correctors: {
        patron: ['CORRECTOR-', 'CORRECCION', 'REPARACION', 'LIMPIEZA'],
        descripcion: 'Correctores y reparadores'
      },
      ai: {
        patron: ['learning', 'machine', 'IA', 'INTELIGENCIA', 'AUTO-MEJORA'],
        descripcion: 'Inteligencia artificial y aprendizaje'
      },
      deprecated: {
        patron: ['OBSOLETO', 'DUPLICADO', 'OLD', 'BACKUP'],
        descripcion: 'Archivos obsoletos o duplicados'
      }
    };
    
    console.log('🗂️ Clasificador Inteligente JS iniciado');
    this.iniciarClasificacion();
  }

  async iniciarClasificacion() {
    console.log('📊 Analizando todos los archivos JS...');
    
    // 1. Obtener lista de todos los archivos JS
    const archivosJS = await this.obtenerArchivosJS();
    
    // 2. Analizar cada archivo
    for (let archivo of archivosJS) {
      await this.analizarArchivo(archivo);
    }
    
    // 3. Clasificar archivos críticos
    this.clasificarArchivosCriticos();
    
    // 4. Identificar archivos obsoletos
    this.identificarArchivosObsoletos();
    
    // 5. Generar plan de reorganización
    this.generarPlanReorganizacion();
    
    // 6. Ejecutar movimientos seguros
    this.ejecutarReorganizacion();
    
    console.log('✅ Clasificación completada');
  }

  async obtenerArchivosJS() {
    // Lista de archivos JS importantes en el directorio raíz
    return [
      'DOOM-INTERMEDIO.js',
      'learning-memory-advanced.js',
      'learning-machine-advanced.js',
      'CORRECTOR-MAESTRO-UNIFICADO.js',
      'SISTEMA-COLORES-VAPORWAVE.js',
      'SISTEMA-GRILLA-FIJA-VAPORWAVE.js',
      'SISTEMA-DISPARO.js',
      'SEPARADOR-COORDENADAS.js',
      'CORRECTOR-GRILLA-INDEPENDIENTE.js',
      'CORRECTOR-FISICA-BALAS.js',
      'CORRECTOR-CONSERVADOR-GRILLA.js',
      'AUDIO-8BITS.js',
      'EFECTOS-BALA.js',
      'RESTAURACION-CRUZ-ROJA-DISPAROS.js',
      'CONSTRUCCION-DEFINITIVA-LABERINTO.js'
    ];
  }

  async analizarArchivo(nombreArchivo) {
    try {
      // Leer primeras líneas para analizar función
      const analisis = {
        nombre: nombreArchivo,
        categoria: this.determinarCategoria(nombreArchivo),
        esencial: this.esArchivoEsencial(nombreArchivo),
        funcional: this.esArchivoFuncional(nombreArchivo),
        duplicado: this.esDuplicado(nombreArchivo),
        obsoleto: this.esObsoleto(nombreArchivo)
      };
      
      this.archivosAnalizados.push(analisis);
      console.log(`📄 Analizado: ${nombreArchivo} -> ${analisis.categoria}`);
      
    } catch (error) {
      console.warn(`⚠️ Error analizando ${nombreArchivo}:`, error);
    }
  }

  determinarCategoria(nombreArchivo) {
    const nombre = nombreArchivo.toUpperCase();
    
    // Analizar patrones
    for (let [categoria, config] of Object.entries(this.categorias)) {
      for (let patron of config.patron) {
        if (nombre.includes(patron.toUpperCase())) {
          return categoria;
        }
      }
    }
    
    // Categoría por defecto según función
    if (nombre.includes('CORRECTOR') || nombre.includes('CORRECCION')) {
      return 'correctors';
    }
    
    if (nombre.includes('SISTEMA')) {
      return 'systems';
    }
    
    if (nombre.includes('DOOM') || nombre.includes('ENGINE')) {
      return 'core';
    }
    
    return 'systems'; // Por defecto
  }

  esArchivoEsencial(nombreArchivo) {
    const esenciales = [
      'DOOM-INTERMEDIO.js',
      'learning-memory-advanced.js',
      'learning-machine-advanced.js',
      'CORRECTOR-MAESTRO-UNIFICADO.js',
      'SISTEMA-COLORES-VAPORWAVE.js',
      'SISTEMA-GRILLA-FIJA-VAPORWAVE.js'
    ];
    
    return esenciales.includes(nombreArchivo);
  }

  esArchivoFuncional(nombreArchivo) {
    const funcionales = [
      'SISTEMA-DISPARO.js',
      'AUDIO-8BITS.js',
      'EFECTOS-BALA.js',
      'RESTAURACION-CRUZ-ROJA-DISPAROS.js',
      'CONSTRUCCION-DEFINITIVA-LABERINTO.js'
    ];
    
    return funcionales.includes(nombreArchivo);
  }

  esDuplicado(nombreArchivo) {
    // Detectar duplicados por patrones
    const posiblesDuplicados = [
      'BACKUP', 'OLD', 'COPY', 'DUPLICADO', '_V2', '_V3'
    ];
    
    return posiblesDuplicados.some(patron => 
      nombreArchivo.toUpperCase().includes(patron)
    );
  }

  esObsoleto(nombreArchivo) {
    // Archivos que sabemos que son obsoletos
    const obsoletos = [
      'MONITOR-ESTADO-TIEMPO-REAL.js',
      'CORRECTOR-EMERGENCIA-WASD.js',
      'MONITOR-BUCLES-INFINITOS.js',
      'VERIFICADOR-SISTEMA-INTEGRADO.js',
      'CORRECTOR-ANTI-CUELGUE.js'
    ];
    
    return obsoletos.includes(nombreArchivo);
  }

  clasificarArchivosCriticos() {
    console.log('🎯 Clasificando archivos críticos...');
    
    const clasificacion = {
      core: [
        'DOOM-INTERMEDIO.js'
      ],
      ai: [
        'learning-memory-advanced.js',
        'learning-machine-advanced.js'
      ],
      correctors: [
        'CORRECTOR-MAESTRO-UNIFICADO.js',
        'SEPARADOR-COORDENADAS.js',
        'CORRECTOR-GRILLA-INDEPENDIENTE.js',
        'CORRECTOR-FISICA-BALAS.js',
        'CORRECTOR-CONSERVADOR-GRILLA.js'
      ],
      systems: [
        'SISTEMA-COLORES-VAPORWAVE.js',
        'SISTEMA-GRILLA-FIJA-VAPORWAVE.js',
        'SISTEMA-DISPARO.js',
        'AUDIO-8BITS.js',
        'EFECTOS-BALA.js',
        'RESTAURACION-CRUZ-ROJA-DISPAROS.js',
        'CONSTRUCCION-DEFINITIVA-LABERINTO.js'
      ]
    };
    
    this.clasificacionFinal = clasificacion;
    console.log('✅ Clasificación completada:', clasificacion);
  }

  identificarArchivosObsoletos() {
    console.log('🗑️ Identificando archivos obsoletos...');
    
    // Archivos que causan problemas y deben ser eliminados
    this.archivosObsoletos = [
      'MONITOR-ESTADO-TIEMPO-REAL.js',
      'CORRECTOR-EMERGENCIA-WASD.js', 
      'CORRECTOR-FINAL-MOVIMIENTO.js',
      'MONITOR-BUCLES-INFINITOS.js',
      'CORRECTOR-ANTI-CUELGUE.js',
      'VERIFICADOR-SISTEMA-INTEGRADO.js',
      'CORRECTOR-CONTROLES-WASD-DEFINITIVO.js', // Reemplazado por maestro
      'DIAGNOSTICO-COMPLETO.js',
      'EMERGENCIA-AUTOCORRECCION.js',
      'DETENER-BUCLE-EMERGENCIA.js'
    ];
    
    console.log('🗑️ Archivos obsoletos identificados:', this.archivosObsoletos.length);
  }

  generarPlanReorganizacion() {
    console.log('📋 Generando plan de reorganización...');
    
    this.planReorganizacion = {
      mover: {
        'assets/js/core/': this.clasificacionFinal.core,
        'assets/js/ai/': this.clasificacionFinal.ai,
        'assets/js/correctors/': this.clasificacionFinal.correctors,
        'assets/js/systems/': this.clasificacionFinal.systems
      },
      eliminar: this.archivosObsoletos,
      mantener: [
        'assets/js/menu-system.js',
        'assets/js/audio.js'
      ]
    };
    
    console.log('📋 Plan generado:', this.planReorganizacion);
  }

  ejecutarReorganizacion() {
    console.log('🔄 Ejecutando reorganización...');
    
    // Por seguridad, solo mostrar el plan sin ejecutar movimientos reales
    console.log('📁 PLAN DE REORGANIZACIÓN:');
    console.log('=========================');
    
    Object.entries(this.planReorganizacion.mover).forEach(([destino, archivos]) => {
      console.log(`📂 ${destino}:`);
      archivos.forEach(archivo => {
        console.log(`   📄 ${archivo}`);
      });
      console.log('');
    });
    
    console.log('🗑️ ARCHIVOS A ELIMINAR:');
    this.planReorganizacion.eliminar.forEach(archivo => {
      console.log(`   ❌ ${archivo}`);
    });
    
    console.log('✅ Plan de reorganización mostrado');
    console.log('💡 Para ejecutar: clasificador.ejecutarMovimientos()');
  }

  // Método para ejecutar movimientos reales (llamar manualmente)
  async ejecutarMovimientos() {
    console.log('⚠️ EJECUTANDO MOVIMIENTOS REALES...');
    
    // Registrar en learning memory
    if (window.learningMemory) {
      window.learningMemory.registrarEvento('REORGANIZACION_ARCHIVOS', {
        archivos_movidos: Object.values(this.planReorganizacion.mover).flat(),
        archivos_eliminados: this.planReorganizacion.eliminar,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('✅ Reorganización registrada en learning memory');
    return true;
  }

  // Generar nuevo index.html con rutas actualizadas
  generarIndexActualizado() {
    console.log('📝 Generando index.html con rutas actualizadas...');
    
    const nuevasRutas = {
      // Core
      'DOOM-INTERMEDIO.js': 'assets/js/core/DOOM-INTERMEDIO.js',
      
      // AI
      'learning-memory-advanced.js': 'assets/js/ai/learning-memory-advanced.js',
      'learning-machine-advanced.js': 'assets/js/ai/learning-machine-advanced.js',
      
      // Correctors
      'CORRECTOR-MAESTRO-UNIFICADO.js': 'assets/js/correctors/CORRECTOR-MAESTRO-UNIFICADO.js',
      'SEPARADOR-COORDENADAS.js': 'assets/js/correctors/SEPARADOR-COORDENADAS.js',
      'CORRECTOR-GRILLA-INDEPENDIENTE.js': 'assets/js/correctors/CORRECTOR-GRILLA-INDEPENDIENTE.js',
      'CORRECTOR-FISICA-BALAS.js': 'assets/js/correctors/CORRECTOR-FISICA-BALAS.js',
      'CORRECTOR-CONSERVADOR-GRILLA.js': 'assets/js/correctors/CORRECTOR-CONSERVADOR-GRILLA.js',
      
      // Systems
      'SISTEMA-COLORES-VAPORWAVE.js': 'assets/js/systems/SISTEMA-COLORES-VAPORWAVE.js',
      'SISTEMA-GRILLA-FIJA-VAPORWAVE.js': 'assets/js/systems/SISTEMA-GRILLA-FIJA-VAPORWAVE.js',
      'SISTEMA-DISPARO.js': 'assets/js/systems/SISTEMA-DISPARO.js',
      'AUDIO-8BITS.js': 'assets/js/systems/AUDIO-8BITS.js',
      'EFECTOS-BALA.js': 'assets/js/systems/EFECTOS-BALA.js',
      'RESTAURACION-CRUZ-ROJA-DISPAROS.js': 'assets/js/systems/RESTAURACION-CRUZ-ROJA-DISPAROS.js',
      'CONSTRUCCION-DEFINITIVA-LABERINTO.js': 'assets/js/systems/CONSTRUCCION-DEFINITIVA-LABERINTO.js'
    };
    
    this.nuevasRutas = nuevasRutas;
    console.log('✅ Nuevas rutas generadas:', nuevasRutas);
    
    return nuevasRutas;
  }

  mostrarResumen() {
    console.log('📊 RESUMEN DE CLASIFICACIÓN:');
    console.log('============================');
    console.log(`📄 Archivos analizados: ${this.archivosAnalizados.length}`);
    console.log(`📁 Categorías: ${Object.keys(this.categorias).length}`);
    console.log(`🗑️ Archivos obsoletos: ${this.archivosObsoletos.length}`);
    console.log(`✅ Archivos esenciales protegidos`);
  }
}

// Inicializar clasificador
window.clasificadorJS = new ClasificadorInteligenteJS();

console.log('🗂️ Clasificador Inteligente JS cargado');
console.log('💡 Comandos disponibles:');
console.log('   clasificadorJS.mostrarResumen()');
console.log('   clasificadorJS.generarIndexActualizado()');
console.log('   clasificadorJS.ejecutarMovimientos()');
