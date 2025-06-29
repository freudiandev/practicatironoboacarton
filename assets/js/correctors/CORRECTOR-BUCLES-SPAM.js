// CORRECTOR DE BUCLES SPAM - SOLUCIÓN DEFINITIVA
// Detiene bucles infinitos que generan spam en consola



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
                        // Silenciar mensajes spam
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
        

    },
    
    optimizarEsperas: function() {
        // Ya no se reintenta iniciar el motor DOOM automáticamente.
        // El sistema esperará a que el usuario haga clic en 'INICIAR JUEGO'.
        // Si es necesario, puedes agregar aquí lógica para mostrar un mensaje o preparar el sistema, pero sin spam ni reintentos automáticos.

    },
    
    limpiarBucles: function() {
        // Limpiar todos los timeouts e intervalos activos
        this.timeoutsActivos.forEach(timeout => clearTimeout(timeout));
        this.intervalosActivos.forEach(interval => clearInterval(interval));
        
        this.timeoutsActivos.clear();
        this.intervalosActivos.clear();
        

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
