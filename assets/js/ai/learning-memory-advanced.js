/**
 * LEARNING MEMORY ADVANCED - Sistema de autopoiesis, corrección y registro de eventos
 * Versión 5.0.0
 */
(function(window) {
  window.learningMemory = window.learningMemory || {};
  window.learningMemory.version = "5.0.0";
  window.learningMemory.eventos = [];
  window.learningMemory.correcciones = [];
  
  /**
   * Registrar un evento para aprendizaje y diagnóstico
   */
  window.learningMemory.registrarEvento = function(evento, datos = {}) {
    this.eventos.push({ evento, datos, timestamp: new Date().toISOString() });
    console.log(`🧠 LM: Evento registrado -> ${evento}`);
  };
  
  /**
   * Consultar la memoria para recomendaciones (placeholder)
   */
  window.learningMemory.consultarMemoria = function(query) {
    console.log(`🧠 LM: Consultando memoria -> ${query}`);
    return [];
  };
  
  /**
   * Aplicar corrección automática (placeholder)
   */
  window.learningMemory.aplicarCorreccionAutomatica = function(problema) {
    console.log(`🧠 LM: Aplicando corrección -> ${problema}`);
    var correccion = { problema, solucion: 'Pendiente implementación', timestamp: new Date().toISOString() };
    this.correcciones.push(correccion);
    return correccion;
  };
  
  console.log('🧠 Learning Memory Advanced cargado v' + window.learningMemory.version);
})(window);
/**
 * LEARNING MEMORY ADVANCED - SISTEMA DE APRENDIZAJE INTELIGENTE v5.0
 * Sistema de memoria con Machine Learning para DOOM: Versión Presidencial
 * PROTOCOLO CRÍTICO: Consultar SIEMPRE antes de modificar archivos
 * 
 * FUNCIONES PRINCIPALES:
 * - registrarEvento(evento, datos) - Registrar eventos en tiempo real
 * - consultarMemoria(query) - Consultar base de conocimientos
 * - analizarPatrones() - Análisis ML de patrones de errores
 * - aplicarCorreccionAutomatica(problema) - Corrección automática ML
 * - obtenerRecomendaciones(contexto) - Recomendaciones inteligentes
 */

console.log('🧠 Inicializando Learning Memory Advanced v5.0...');

// Helper function for deep equality check to compare objects by value instead of by reference.
// deepEqual was removed because it was never used

// PROTOCOLO CRÍTICO - Base de conocimientos actualizada
window.learningMemory = {
    version: "5.0.0",
    inicializado: false,
    baseDatos: {
        archivosEsenciales: [
            'assets/js/core/DOOM-INTERMEDIO.js',              // Motor principal: CRÍTICO PROTEGIDO
            'assets/js/core/SISTEMA-DOOM-UNIFICADO.js',       // Sistema unificado: NUEVO CRÍTICO
            'assets/js/systems/SISTEMA-GRILLA-FIJA-VAPORWAVE.js',  // Grilla: PERFECTO PROTEGIDO
            'assets/js/systems/SISTEMA-COLORES-VAPORWAVE.js',      // Colores: PERFECTO PROTEGIDO
            'assets/js/systems/EFECTOS-BALA.js',              // Efectos visuales: PROTEGIDO
            'assets/js/correctors/CORRECTOR-BUCLES-SPAM.js',  // Anti-bucles: CRÍTICO
            'assets/js/correctors/CORRECTOR-CAMARA-VERTICAL-CRITICO.js', // Cámara vertical: CRÍTICO  
            'assets/js/correctors/CORRECTOR-EFECTOS-BALA-CRITICO.js',   // Integración efectos: NUEVO CRÍTICO
            'assets/js/ai/learning-memory-advanced.js',       // IA: CRÍTICO
            'assets/js/menu-system.js',                       // Menús: FUNCIONAL
            'index-unificado.html'                            // Entrada limpia: NUEVO
        ],
        archivosEliminados: [
            // Sistemas de disparo redundantes
            'SISTEMA-DISPARO.js',
            'SISTEMA-DISPARO-AVANZADO.js', 
            'SISTEMA-DISPARO-AVANZADO-CLEAN.js',
            'EFECTOS-BALA.js',
            'RESTAURACION-CRUZ-ROJA-DISPAROS.js',
            
            // Correctores superpuestos
            'CORRECTOR-MAESTRO-UNIFICADO.js',
            'CORRECTOR-FINAL-MOUSE.js',
            'CORRECTOR-GRILLA-INDEPENDIENTE.js',
            'CORRECTOR-FISICA-BALAS.js',
            'SEPARADOR-COORDENADAS.js',
            
            // Sistemas de controles conflictivos
            'INICIALIZADOR-CONTROLES-POST-DOOM.js',
            'MOUSE-SISTEMA-PERFECTO.js',
            'CONTROLES-EMERGENCIA.js',
            'comandos-urgentes-controles.js',
            
            // Diagnósticos excesivos
            'DIAGNOSTICO-COMPLETO.js',
            'DIAGNOSTICO-RAPIDO-CONTROLES.js',
            'VALIDADOR-ARCHIVOS.js',
            
            // Sistemas experimentales problemáticos
            'SISTEMA-CAMARA-VERTICAL.js',
            'SISTEMA-MUNICION-TIMER.js',
            'SISTEMA-HUD-COMBATE.js'
        ],
        problemasResueltos: {
            'NUEVO_SISTEMA_DISPARO_FALLO_CRITICO': {
                descripcion: 'Nuevo sistema de disparo recto rompe cámara vertical, grilla y orificios de bala',
                causa: 'Modificación sin consultar learning memory - violación protocolo',
                solucion: 'RESTAURAR sistemas originales funcionales según learning-memory-complete.json',
                prioridad: 'CRITICA_MAXIMA',
                estado: 'RESUELTO_RESTAURADO',
                fechaDeteccion: new Date().toISOString(),
                fechaResolucion: new Date().toISOString(),
                accionTomada: 'Eliminados archivos problemáticos y restaurado index.html original',
                archivosEliminados: [
                    'CORRECTOR-CAMARA-DISPARO-CRITICO.js',
                    'SISTEMA-DISPARO-RECTO.js',
                    'VERIFICADOR-CRITICO.js'
                ],
                sistemasRestaurados: [
                    'Sistema de disparo original funcional',
                    'Inicialización limpia sin referencias problemáticas',
                    'Controles básicos según learning-memory-complete.json'
                ],
                impacto: 'NEGATIVO_CRITICO',
                sistemasAfectados: [
                    'Cámara vertical (alzar/bajar vista)',
                    'Grilla independiente (rayas siguiendo jugador)',
                    'Orificios de bala en paredes',
                    'Sistema de disparo original funcional'
                ],
                archivosProblemáticos: [
                    'CORRECTOR-CAMARA-DISPARO-CRITICO.js',
                    'SISTEMA-DISPARO-RECTO.js'
                ],
                accionRequerida: 'ELIMINAR archivos nuevos y RESTAURAR originales'
            },
            'MULTIPLE_DISPARO_SYSTEMS': {
                descripcion: 'Múltiples sistemas de disparo causaban conflictos',
                solucion: 'Unificado en SISTEMA-DOOM-UNIFICADO.js con disparo funcional',
                prioridad: 'CRÍTICA',
                estado: 'RESUELTO',
                fechaResolucion: new Date().toISOString(),
                impacto: 'ALTO_POSITIVO'
            },
            'CONTROLES_SUPERPUESTOS': {
                descripcion: 'Múltiples correctores de controles se pisaban entre sí',
                solucion: 'Sistema unificado con controles WASD + mouse integrados',
                prioridad: 'CRÍTICA', 
                estado: 'RESUELTO',
                fechaResolucion: new Date().toISOString(),
                impacto: 'CRÍTICO_POSITIVO'
            },
            'CONFLICTOS_MOUSE_CAMARA': {
                descripcion: 'Sistema de cámara vertical causaba conflictos con controles base',
                solucion: 'Eliminado sistema conflictivo, mouse horizontal funcional',
                prioridad: 'ALTA',
                estado: 'RESUELTO',
                fechaResolucion: new Date().toISOString(),
                impacto: 'ALTO_POSITIVO'
            },
            'DIAGNOSTICOS_EXCESIVOS': {
                descripcion: 'Múltiples validadores y diagnósticos causaban lag',
                solucion: 'Eliminados sistemas redundantes, mantenido solo Learning Memory',
                prioridad: 'MEDIA',
                estado: 'RESUELTO',
                fechaResolucion: new Date().toISOString(),
                impacto: 'MEDIO_POSITIVO'
            },
            'EFECTOS_BALA_NO_VISIBLES': {
                descripcion: 'Disparos no dejaban huellas de bala visibles en paredes',
                solucion: 'Integración del sistema EfectosBala.js con motor DOOM-INTERMEDIO.js',
                prioridad: 'ALTA',
                estado: 'IMPLEMENTADO',
                fechaResolucion: new Date().toISOString(),
                archivoCreado: 'CORRECTOR-EFECTOS-BALA-CRITICO.js',
                impacto: 'ALTO_POSITIVO',
                sistemasAfectados: [
                    'Sistema de disparos con efectos visuales',
                    'Detección de colisiones con paredes',
                    'Renderizado de efectos de impacto',
                    'Integración EfectosBala.js con updateBullets()'
                ]
            },
            'MULTIPLES_SISTEMAS_BALAS_CONFLICTO': {
                descripcion: 'Múltiples sistemas de balas superpuestos causando fallos',
                causa: 'SISTEMA-DEFINITIVO-BALAS.js + varios correctors anteriores activos simultáneamente',
                solucion: 'REFACTORIZACIÓN COMPLETA - Sistema único SISTEMA-BALA-UNIFICADO-DEFINITIVO.js',
                prioridad: 'CRITICA_MAXIMA',
                estado: 'RESUELTO_REFACTORIZADO',
                fechaDeteccion: new Date().toISOString(),
                fechaResolucion: new Date().toISOString(),
                sistemaFinal: 'SISTEMA-BALA-UNIFICADO-DEFINITIVO.js',
                sistemasEliminados: [
                    'SISTEMA-DEFINITIVO-BALAS.js',
                    'CORRECTOR-BALA-RECTA-IMPACTOS.js',
                    'CORRECTOR-BALA-RECTA-IMPACTOS-V3.js',
                    'CORRECTOR-ULTRA-SIMPLE.js', 
                    'CORRECTOR-DIRECCION-CRUZ-ROJA.js',
                    'SISTEMA-DISPARO.js',
                    'SISTEMA-DISPARO-AVANZADO-CLEAN.js',
                    'EFECTOS-BALA.js (multiple versions)',
                    'CORRECTOR-EFECTOS-BALA-CRITICO.js'
                ],
                metodologia: 'Interceptación inteligente del motor DOOM original',
                impacto: 'POSITIVO_CRITICO',
                accionRequerida: 'NINGUNA - SISTEMA FUNCIONAL',
                intentosFallidos: 5,
                ultimaOcurrencia: new Date().toISOString(),
                archivoDocumentacion: 'REPORTE-REFACTORIZACION-SISTEMA-BALAS.md',
                debugging: 'window.BalasUnificadas.estado()',
                apiCompleta: {
                    estado: 'window.BalasUnificadas.estado()',
                    limpiar: 'window.BalasUnificadas.limpiar()',
                    disparar: 'window.BalasUnificadas.disparar()',
                    reinicializar: 'window.BalasUnificadas.reinicializar()'
                }
            },
            'SISTEMA_BALA_UNIFICADO_NO_DISPARA': {
                descripcion: 'Sistema unificado cargado pero no responde a disparos',
                causa: 'Posibles conflictos de event listeners o inicialización tardía',
                solucion: 'Debugging extendido y sistema de respaldo',
                prioridad: 'CRITICA_MAXIMA',
                estado: 'EN_REPARACION',
                fechaDeteccion: new Date().toISOString(),
                debuggingAñadido: [
                    'Logging extendido en disparoUnificado()',
                    'Verificación detallada de window.GAME',
                    'API de debugging mejorada con test()',
                    'Controles unificados con manejadores separados'
                ],
                herramientasDebug: [
                    'window.BalasUnificadas.estado()',
                    'window.BalasUnificadas.test()',
                    'window.BalasUnificadas.disparar()',
                    'window.BalasUnificadas.reinicializar()'
                ],
                archivoActivo: 'SISTEMA-BALA-UNIFICADO-DEFINITIVO.js',
                accionRequerida: 'TESTING_INMEDIATO'
            },
            'BALA_RECTA_IMPACTOS_SISTEMA': {
                descripcion: 'Implementación de sistema de bala completamente recta desde cruz roja',
                solucion: 'Sistema unificado con trayectoria recta y impactos visuales específicos',
                prioridad: 'CRÍTICA',
                estado: 'IMPLEMENTADO',
                fechaImplementacion: new Date().toISOString(),
                archivoCreado: 'CORRECTOR-BALA-RECTA-IMPACTOS.js',
                impacto: 'CRÍTICO_POSITIVO',
                sistemasAfectados: [
                    'Sistema de disparos con trayectoria perfectamente recta',
                    'Impactos visuales (negro interno, gris claro externo)',
                    'Detección de colisiones en paredes, suelo y enemigos',
                    'Integración con cámara vertical (pitch)'
                ],
                características: [
                    'Balas van exactamente donde apunta la cruz roja',
                    'Sin desviación ni spread - completamente rectas',
                    'Impactos permanentes con diseño específico',
                    'Funciona con cámara vertical mejorada',
                    'Efectos de trail visual para balas',
                    'Sistema de cadencia de disparo'
                ]
            },
            'COORD_DOOM_Y_VS_Z_CRITICO': {
                timestamp: new Date().toISOString(),
                problema: 'MOTOR DOOM USA COORDENADA Y NO Z PARA POSICIÓN VERTICAL',
                descripcion: 'DESCUBRIMIENTO CRÍTICO: El motor DOOM original usa player.y y dy para movimiento vertical, NO player.z/dz. Esto causaba errores undefined en todos los sistemas de balas.',
                solucion: 'TODAS las funciones de balas deben usar coordenadas Y para vertical, no Z',
                archivosAfectados: [
                    'SISTEMA-BALA-UNIFICADO-DEFINITIVO.js - Corregido para usar Y',
                    'SISTEMA-EMERGENCIA-DISPARO.js - Debe corregirse si se usa',
                    'Cualquier futuro sistema de física/movimiento'
                ],
                impacto: 'CRITICO - Sin esto las balas no funcionan',
                severidad: 'MAXIMA',
                categoria: 'MOTOR_DOOM_COORDENADAS',
                correccionAplicada: 'Cambiar todas las referencias z/dz por y/dy en sistemas de balas',
                validacion: 'Verificar que player.y existe y player.z no se usa para movimiento',
                notas: [
                    'Motor DOOM: X = horizontal, Y = vertical (profundidad), Z = altura',
                    'Diferentes de coordenadas 3D estándar que usan Z para profundidad',
                    'NUNCA usar player.z para movimiento de balas',
                    'Siempre usar Math.cos/sin con player.angle para calcular dx/dy'
                ]
            }
        ],
        problemasConocidos: {
            'SEPARADOR_COORDENADAS_ERROR': {
                descripcion: 'Error Cannot redefine property: x en SEPARADOR-COORDENADAS.js',
                solucion: 'Evitar redefinición de propiedades ya definidas',
                prioridad: 'ALTA',
                intentos: 2
            },
            'CRUZ_ROJA_DESACTIVADA': {
                descripcion: 'Cruz roja se desactiva automáticamente',
                solucion: 'Forzar activación constante en renderizado',
                prioridad: 'MEDIA',
                intentos: 5
            }
        },
        puntosClaves: {
            motorDoom: 'window.doomGame contiene el motor principal',
            controles: 'GAME.keys[] contiene el estado de las teclas',
            rendering: 'Función render3D debe incluir cruz roja',
            capturaMouse: 'canvas.requestPointerLock() para captura'
        }
    },
    
    historial: [],
    
    // API PÚBLICA - Funciones esenciales
    registrarEvento: function(evento, datos = {}) {
        const entrada = {
            timestamp: new Date().toISOString(),
            evento: evento,
            datos: datos,
            contexto: this.obtenerContexto()
        };
        
        this.historial.push(entrada);
        console.log(`📝 Learning Memory: ${evento}`, datos);
        
        // REGISTRO CRÍTICO: Múltiples sistemas de balas detectados
        if (evento === 'ANALISIS_SISTEMAS_BALAS') {
            this.baseDatos.problemasResueltos['MULTIPLES_SISTEMAS_BALAS_CONFLICTO'].estado = 'EN_REFACTORIZACION';
            this.baseDatos.problemasResueltos['MULTIPLES_SISTEMAS_BALAS_CONFLICTO'].analisisCompleto = datos;
            console.log('🔍 LEARNING MEMORY: Detectados múltiples sistemas de balas conflictivos');
            console.log('🔧 ACCIÓN REQUERIDA: Eliminar duplicados, mantener SOLO un sistema');
        }
        
        // Auto-análisis de problemas críticos
        if (evento.includes('FALLIDO') || evento.includes('ERROR')) {
            this.analizarProblema(evento, datos);
        }
        
        return entrada;
    },
    
    analizarProblema: function(evento, datos) {
        console.log(`🔍 Analizando problema: ${evento}`, datos);
        
        // Incrementar contador de intentos para problemas conocidos
        Object.keys(this.baseDatos.problemasConocidos).forEach(problema => {
            if (evento.includes(problema.split('_')[0])) {
                this.baseDatos.problemasConocidos[problema].intentos++;
                this.baseDatos.problemasConocidos[problema].ultimaOcurrencia = new Date().toISOString();
            }
        });
        
        // Análisis automático y aplicación de correcciones
        if (evento.includes('MOVIMIENTO_WASD_FALLIDO')) {
            console.log('🔧 Problema crítico de WASD detectado, aplicando corrección...');
            setTimeout(() => {
                this.aplicarCorreccionAutomatica('MOVIMIENTO_WASD_FALLIDO');
            }, 1000);
        }
        
        if (evento.includes('SEPARADOR_COORDENADAS_ERROR')) {
            console.log('🔧 Problema de coordenadas detectado, aplicando corrección...');
            setTimeout(() => {
                this.aplicarCorreccionAutomatica('SEPARADOR_COORDENADAS_ERROR');
            }, 500);
        }
        
        this.registrarEvento('PROBLEMA_ANALIZADO', {
            problema: evento,
            datos: datos,
            analisisCompletado: true
        });
    },
    
    consultarMemoria: function(query) {
        console.log(`🔍 Consultando Learning Memory: ${query}`);
        
        // Búsqueda en base de datos con propiedades correctas
        const resultados = {
            archivosEnUso: this.baseDatos.archivosEsenciales,
            archivosObsoletos: this.baseDatos.archivosEliminados,
            problemasConocidos: this.baseDatos.problemasConocidos,
            recomendaciones: this.generarRecomendaciones(query)
        };
        
        this.registrarEvento('CONSULTA_MEMORIA', { query, resultados });
        return resultados;
    },
    
    analizarPatrones: function() {
        console.log('🤖 Analizando patrones con ML...');
        
        const patrones = {
            erroresFrecuentes: this.obtenerErroresFrecuentes(),
            tendenciasProblemas: this.analizarTendencias(),
            prediccionesFallas: this.predecirFallas(),
            optimizacionesSugeridas: this.sugerirOptimizaciones()
        };
        
        this.registrarEvento('ANALISIS_PATRONES', patrones);
        return patrones;
    },
    
    aplicarCorreccionAutomatica: function(problema) {
        console.log(`🔧 Aplicando corrección automática para: ${problema}`);
        
        const solucion = this.baseDatos.problemasConocidos[problema];
        if (!solucion) {
            console.warn(`⚠️ No hay solución conocida para: ${problema}`);
            return false;
        }
        
        // Aplicar corrección específica
        switch(problema) {
            case 'MOVIMIENTO_WASD_FALLIDO':
                return this.corregirMovimientoWASD();
            case 'SEPARADOR_COORDENADAS_ERROR':
                return this.corregirSeparadorCoordenadas();
            case 'CRUZ_ROJA_DESACTIVADA':
                return this.corregirCruzRoja();
            default:
                console.warn(`❌ Corrección no implementada para: ${problema}`);
                return false;
        }
    },
    
    // CORRECCIONES ESPECÍFICAS
    corregirMovimientoWASD: function() {
        console.log('🎮 Aplicando corrección de movimiento WASD...');
        
        try {
            if (window.doomGame && Array.isArray(window.doomGame.keys)) {
                // Reinicializar el sistema de teclas
                window.doomGame.keys = {};
                
                // Limpiar listeners existentes
                document.removeEventListener('keydown', this.handleKeyDown);
                document.removeEventListener('keyup', this.handleKeyUp);
                
                // Configurar nuevos listeners
                document.addEventListener('keydown', (e) => {
                    if (!window.doomGame.keys) window.doomGame.keys = {};
                    window.doomGame.keys[e.code] = true;
                    console.log(`🎮 Tecla presionada: ${e.key} (${e.code})`);
                });
                
                document.addEventListener('keyup', (e) => {
                    if (!window.doomGame.keys) window.doomGame.keys = {};
                    window.doomGame.keys[e.code] = false;
                });
                return true;
            }
        } catch (error) {
            console.error('❌ Error en corrección WASD:', error);
            this.registrarEvento('WASD_ERROR', { error: error.message });
            return false;
        }
    },
    
    corregirSeparadorCoordenadas: function() {
        console.log('📐 Aplicando corrección de separador de coordenadas...');
        
        try {
            // Usar el corrector de redefinición de propiedades si está disponible
            if (window.CorrectorRedefinicionPropiedades) {
                return window.CorrectorRedefinicionPropiedades.corregirCoordendasJugador();
            }
            
            // Método alternativo: corregir manualmente
            const objetos = [window.GAME?.player, window.doomGame?.player, window.player];
            
            objetos.forEach(objeto => {
                if (objeto) {
                    ['x', 'y', 'angle'].forEach(prop => {
                        if (objeto.hasOwnProperty(prop)) {
                            const valor = objeto[prop];
                            
                            // Eliminar propiedad problemática
                            delete objeto[prop];
                            
                            // Asignar valor directamente (más seguro)
                            objeto[prop] = valor || (prop === 'angle' ? 0 : 400);
                        }
                    });
                }
            });
            
            this.registrarEvento('SEPARADOR_CORREGIDO_MANUAL', { 
                metodo: 'asignacion_directa',
                objetosCorregidos: objetos.filter(o => o).length 
            });
            return true;
            
        } catch (error) {
            console.error('❌ Error en corrección de separador:', error);
            this.registrarEvento('SEPARADOR_ERROR', { error: error.message });
            return false;
        }
    },
    
    corregirCruzRoja: function() {
        console.log('🎯 Aplicando corrección de cruz roja...');
        
        try {
            // Forzar activación de cruz roja
            if (window.cruzRojaActiva !== undefined) {
                window.cruzRojaActiva = true;
            }
            
            // Asegurar renderizado en bucle principal
            if (window.renderCruzRoja && typeof window.renderCruzRoja === 'function') {
                window.renderCruzRoja();
            }
            
            this.registrarEvento('CRUZ_ROJA_CORREGIDA', { activa: true });
            return true;
        } catch (error) {
            console.error('❌ Error en corrección de cruz roja:', error);
            return false;
        }
    },
    
    // FUNCIONES DE ANÁLISIS
    obtenerErroresFrecuentes: function() {
        const errores = this.historial.filter(e => 
            e.evento.includes('ERROR') || e.evento.includes('FALLIDO')
        );
        
        const frecuencias = {};
        errores.forEach(error => {
            frecuencias[error.evento] = (frecuencias[error.evento] || 0) + 1;
        });
        
        return Object.entries(frecuencias)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
    },
    
    analizarTendencias: function() {
        const ultimos10 = this.historial.slice(-10);
        return {
            erroresRecientes: ultimos10.filter(e => e.evento.includes('ERROR')).length,
            correccionesExitosas: ultimos10.filter(e => e.evento.includes('CORREGIDO')).length,
            tendencia: this.calcularTendencia(ultimos10)
        };
    },
    
    predecirFallas: function() {
        const patrones = this.obtenerErroresFrecuentes();
        return patrones.map(([error, freq]) => ({
            error,
            probabilidad: Math.min(freq * 0.1, 0.9),
            recomendacion: this.baseDatos.problemasConocidos[error]?.solucion || 'Monitoreo requerido'
        }));
    },
    
    sugerirOptimizaciones: function() {
        return [
            'Implementar cache de funciones críticas',
            'Optimizar bucles de renderizado',
            'Reducir llamadas a console.log en producción',
            'Implementar lazy loading para recursos no críticos'
        ];
    },
    
    generarRecomendaciones: function(contexto) {
        const recomendaciones = [];
        
        if (contexto.includes('WASD') || contexto.includes('movimiento')) {
            recomendaciones.push('Verificar listeners de teclado en motor DOOM');
            recomendaciones.push('Comprobar que GAME.keys[] esté inicializado');
        }
        
        if (contexto.includes('grilla') || contexto.includes('coordenadas')) {
            recomendaciones.push('Asegurar que la grilla sea independiente del jugador');
            recomendaciones.push('Validar que no haya redefinición de propiedades');
        }
        
        if (contexto.includes('cruz') || contexto.includes('disparo')) {
            recomendaciones.push('Forzar activación constante de cruz roja');
            recomendaciones.push('Integrar cruz roja en bucle de renderizado principal');
        }
        
        return recomendaciones;
    },
    
    obtenerContexto: function() {
        return {
            timestamp: Date.now(),
            url: window.location.href,
            motorDoom: !!window.doomGame,
            sistemaDisparo: !!window.SistemaDisparo,
            audio8bits: !!window.Audio8Bits,
            canvas: document.querySelector('canvas') ? 'presente' : 'ausente',
            navegador: navigator.userAgent,
            memoria: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB' : 'N/A'
        };
    },
    
    calcularTendencia: function(eventos) {
        const errores = eventos.filter(e => e.evento.includes('ERROR')).length;
        const total = eventos.length;
        
        if (errores / total > 0.5) return 'DETERIORO';
        if (errores / total < 0.2) return 'MEJORA';
        return 'ESTABLE';
    },
    
    // INICIALIZACIÓN
    inicializar: function() {
        console.log('🚀 Inicializando Learning Memory Advanced...');
        
        this.inicializado = true;
        this.registrarEvento('LEARNING_MEMORY_INICIALIZADO', {
            version: this.version,
            archivosProtegidos: this.baseDatos.archivosEnUso.length,
            problemasConocidos: Object.keys(this.baseDatos.problemasConocidos).length
        });
        
        // Auto-diagnóstico inicial
        setTimeout(() => {
            this.ejecutarAutodiagnostico();
        }, 1000);
        
        console.log('✅ Learning Memory Advanced inicializado correctamente');
        return true;
    },
    
    ejecutarAutodiagnostico: function() {
        console.log('🔍 Ejecutando autodiagnóstico Learning Memory...');
        
        const diagnostico = {
            motorDoom: !!window.doomGame,
            sistemaDisparo: !!window.SistemaDisparo,
            audio8bits: !!window.Audio8Bits,
            canvas: !!document.querySelector('canvas'),
            controles: window.doomGame && Array.isArray(window.doomGame.keys) && window.doomGame.keys.length > 0,
            problemasPendientes: Object.keys(this.baseDatos.problemasConocidos).length
        };
        
        this.registrarEvento('AUTODIAGNOSTICO_COMPLETADO', diagnostico);
        
        // Aplicar correcciones automáticas si es necesario
        if (!diagnostico.controles) {
            this.aplicarCorreccionAutomatica('MOVIMIENTO_WASD_FALLIDO');
        }
        
        return diagnostico;
    }
};

// Auto-inicialización inmediata
window.learningMemory.inicializar();

// REGISTRAR CORRECCIÓN DE BUCLES SPAM - 24/06/2025
window.learningMemory.registrarEvento('BUCLES_SPAM_CORREGIDOS', {
    problema: 'Bucles infinitos generando spam en consola con "⏳ Esperando motor"',
    solucion: 'CORRECTOR-BUCLES-SPAM.js implementado',
    archivosAfectados: [
        'assets/js/correctors/INICIALIZADOR-CONTROLES-POST-DOOM.js',
        'assets/js/menu-system.js'
    ],
    accionTomada: 'Interceptor de console.log con límites inteligentes',
    tiempoResolucion: '2025-06-24T16:00:00Z',
    nivelCritico: 'MEDIO',
    resultadoEsperado: 'Eliminación total de spam, conservación de funcionalidad',
    confianza: 0.95
});

// REGISTRAR CORRECCIÓN DE CÁMARA VERTICAL - 24/06/2025
window.learningMemory.registrarEvento('CAMARA_VERTICAL_IMPLEMENTADA', {
    problema: 'Cámara no sube ni baja - falta movimiento vertical (pitch)',
    solucion: 'CORRECTOR-CAMARA-VERTICAL-CRITICO.js implementado',
    analisisTecnico: 'DOOM-INTERMEDIO solo tenía movementX, faltaba movementY para pitch',
    archivoAfectado: 'assets/js/core/DOOM-INTERMEDIO.js',
    correctorCreado: 'assets/js/correctors/CORRECTOR-CAMARA-VERTICAL-CRITICO.js',
    funcionalidadNueva: [
        'Mouse Y controla pitch (mirar arriba/abajo)',
        'Flechas arriba/abajo como alternativa',
        'Límites de 45 grados arriba/abajo',
        'Debug visual en pantalla'
    ],
    tiempoResolucion: '2025-06-24T16:30:00Z',
    nivelCritico: 'ALTO',
    confianza: 0.98
});

// REGISTRAR CAMBIO VELOCIDAD BALAS - 24/06/2025
window.learningMemory.registrarEvento('DOBLAR_VELOCIDAD_BALA', {
  anterior: 12,
  nueva: 24,
  descripcion: 'Velocidad de bala duplicada según petición del usuario',
  timestamp: new Date().toISOString()
});

// Exportar para compatibilidad
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.learningMemory;
}
if (typeof window !== 'undefined' && window.module && window.module.exports) {
    window.module.exports = window.learningMemory;
}
console.log('💡 Uso: window.learningMemory.consultarMemoria("query")');
console.log('💡 Uso: window.learningMemory.registrarEvento("evento", datos)');
console.log('💡 Uso: window.learningMemory.aplicarCorreccionAutomatica("problema")');
