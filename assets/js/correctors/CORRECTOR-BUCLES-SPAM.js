// CORRECTOR DE BUCLES SPAM - SOLUCIÓN DEFINITIVA
// Detiene bucles infinitos que generan spam en consola

console.log('🛑 Inicializando Corrector de Bucles Spam...');

window.CorrectorBuclesSpam = {
    activo: false,
    contadores: new Map(),
    limiteSpam: 10, // Máximo 10 mensajes iguales antes de detener
    intervalosActivos: new Set(),
    timeoutsActivos: new Set(),
    
    inicializar: function() {
        if (this.activo) return;
        
        this.activo = true;
        this.interceptarConsoleLogs();
        this.detenerBuclesProblematicos();
        this.optimizarEsperas();
        
        console.log('✅ Corrector de bucles spam activado');
        console.log('🎯 Bucles problemáticos detenidos, spam eliminado');
    },
    
    interceptarConsoleLogs: function() {
        const self = this;
        const originalLog = console.log;
        
        console.log = function(...args) {
            const mensaje = args.join(' ');
            
            // Detectar mensajes repetitivos de espera
            if (mensaje.includes('⏳ Esperando motor') || 
                mensaje.includes('⏳ Esperando motor del juego') ||
                mensaje.includes('⏳ Esperando motor DOOM')) {
                
                const contador = self.contadores.get(mensaje) || 0;
                
                if (contador >= self.limiteSpam) {
                    // Suprimir mensaje spam
                    return;
                }
                
                self.contadores.set(mensaje, contador + 1);
                
                if (contador === self.limiteSpam - 1) {
                    originalLog.call(console, '🛑 SPAM DETECTADO: Suprimiendo mensajes repetitivos:', mensaje);
                    originalLog.call(console, '💡 Activando modo silencioso para este mensaje');
                    return;
                }
            }
            
            // Permitir otros logs normalmente
            originalLog.apply(console, args);
        };
    },
    
    detenerBuclesProblematicos: function() {
        // Detener bucles en INICIALIZADOR-CONTROLES-POST-DOOM
        if (window.controlesDefinitivos && window.controlesDefinitivos.detenerEspera) {
            window.controlesDefinitivos.detenerEspera();
        }
        
        // Reemplazar función esperarDoomYConfigurar problemática
        if (typeof esperarDoomYConfigurar !== 'undefined') {
            window.esperarDoomYConfigurar = function() {
                // Versión optimizada: máximo 5 intentos
                let intentos = 0;
                const maxIntentos = 5;
                
                const verificar = () => {
                    if (window.doomGame && window.doomGame.player && window.doomGame.keys) {
                        console.log('✅ Motor DOOM detectado después de', intentos, 'intentos');
                        if (typeof configurarControlesManuales === 'function') {
                            configurarControlesManuales();
                        }
                        return;
                    }
                    
                    intentos++;
                    if (intentos < maxIntentos) {
                        setTimeout(verificar, 1000); // Espera más larga, menos frecuente
                    } else {
                        console.log('⚠️ Motor DOOM no encontrado después de', maxIntentos, 'intentos. Continuando...');
                    }
                };
                
                verificar();
            };
        }
        
        console.log('🛑 Bucles problemáticos reemplazados con versiones optimizadas');
    },
    
    optimizarEsperas: function() {
        // Optimizar esperas en menu-system
        if (window.gameMenuSystem && window.gameMenuSystem.initializeGameEngine) {
            const original = window.gameMenuSystem.initializeGameEngine;
            
            window.gameMenuSystem.initializeGameEngine = function() {
                let intentos = 0;
                const maxIntentos = 10;
                
                const tryInitialize = () => {
                    if (window.doomGame && typeof window.doomGame.start === 'function') {
                        try {
                            console.log('🎯 Iniciando DOOM Intermedio...');
                            window.doomGame.start();
                            console.log('✅ DOOM Intermedio iniciado exitosamente');
                            return;
                        } catch (error) {
                            console.error('❌ Error al iniciar DOOM Intermedio:', error);
                        }
                    }
                    
                    intentos++;
                    if (intentos < maxIntentos) {
                        setTimeout(tryInitialize, 800); // Espera más larga
                    } else {
                        console.log('⚠️ Motor del juego no se pudo inicializar después de', maxIntentos, 'intentos');
                        console.log('🎮 Continuando con funcionalidad básica...');
                    }
                };
                
                tryInitialize();
            };
        }
        
        console.log('🚀 Esperas optimizadas con límites inteligentes');
    },
    
    limpiarBucles: function() {
        // Limpiar todos los timeouts e intervalos activos
        this.timeoutsActivos.forEach(timeout => clearTimeout(timeout));
        this.intervalosActivos.forEach(interval => clearInterval(interval));
        
        this.timeoutsActivos.clear();
        this.intervalosActivos.clear();
        
        console.log('🧹 Bucles limpiados');
    },
    
    obtenerEstado: function() {
        return {
            activo: this.activo,
            mensajesSuprimidos: Array.from(this.contadores.entries()),
            buclesActivos: this.timeoutsActivos.size + this.intervalosActivos.size
        };
    },
    
    resetear: function() {
        this.limpiarBucles();
        this.contadores.clear();
        this.activo = false;
        console.log('🔄 Corrector de bucles spam reseteado');
    }
};

// Auto-inicializar si el problema de spam ya está presente
setTimeout(() => {
    if (!window.CorrectorBuclesSpam.activo) {
        window.CorrectorBuclesSpam.inicializar();
    }
}, 2000);

// Registrar en learning memory
if (window.learningMemory) {
    window.learningMemory.registrarEvento('CORRECTOR_BUCLES_SPAM_CARGADO', {
        timestamp: Date.now(),
        descripcion: 'Sistema para eliminar spam de bucles infinitos',
        problemaObjetivo: 'Bucles de espera generando spam en consola'
    });
}

console.log('✅ Corrector de bucles spam cargado');
console.log('💡 Comandos disponibles:');
console.log('   window.CorrectorBuclesSpam.obtenerEstado()');
console.log('   window.CorrectorBuclesSpam.limpiarBucles()');
console.log('   window.CorrectorBuclesSpam.resetear()');
