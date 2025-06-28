// ================================
// SISTEMA DOOM UNIFICADO - MINIMALISTA Y FUNCIONAL
// Basado en análisis científico del Learning Memory
// Reemplaza todos los sistemas conflictivos
// ================================

console.log('🎮 Cargando Sistema DOOM Unificado v1.0...');

window.SistemaDoomUnificado = {
    // ================================
    // ESTADO CENTRALIZADO
    // ================================
    estado: {
        iniciado: false,
        juegoActivo: false,
        mouseCapturado: false,
        debug: false
    },
    
    // Referencias principales
    canvas: null,
    ctx: null,
    player: null,
    
    // Sistema de disparo
    disparo: {
        municion: 50,
        maxMunicion: 50,
        ultimoDisparo: 0,
        cadencia: 250, // ms entre disparos
        balas: []
    },
    
    // Sistema de controles
    controles: {
        teclas: {},
        mouseSensibilidad: 0.003
    },
    
    // ================================
    // INICIALIZACIÓN PRINCIPAL
    // ================================
    init: function() {
        console.log('🚀 Inicializando Sistema DOOM Unificado...');
        
        if (!this.buscarReferencias()) {
            console.error('❌ No se pudieron encontrar referencias críticas');
            return false;
        }
        
        this.configurarControles();
        this.configurarDisparo();
        this.iniciarBucleJuego();
        
        this.estado.iniciado = true;
        
        // Registrar en Learning Memory
        this.registrarEnMemoria('Sistema DOOM Unificado inicializado correctamente');
        
        console.log('✅ Sistema DOOM Unificado listo');
        return true;
    },
    
    buscarReferencias: function() {
        // Canvas
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('❌ Canvas no encontrado');
            return false;
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('❌ Contexto 2D no disponible');
            return false;
        }
        
        // Player del motor DOOM
        const buscarPlayer = () => {
            if (window.GAME && window.GAME.player) {
                this.player = window.GAME.player;
                return true;
            }
            if (window.doomGame && window.doomGame.player) {
                this.player = window.doomGame.player;
                return true;
            }
            return false;
        };
        
        if (!buscarPlayer()) {
            console.warn('⚠️ Player no encontrado, reintentando...');
            // Reintentar después de un momento
            setTimeout(() => {
                if (buscarPlayer()) {
                    console.log('✅ Player encontrado en reintento');
                }
            }, 1000);
        }
        
        console.log(`✅ Referencias: Canvas OK, Contexto OK, Player ${this.player ? 'OK' : 'PENDIENTE'}`);
        return true;
    },
    
    // ================================
    // SISTEMA DE CONTROLES UNIFICADO
    // ================================
    configurarControles: function() {
        console.log('⌨️ Configurando controles unificados...');
        
        // Captura de mouse
        this.canvas.addEventListener('click', () => {
            this.canvas.requestPointerLock();
            console.log('🖱️ Solicitando captura de mouse...');
        });
        
        // Detección de captura exitosa
        document.addEventListener('pointerlockchange', () => {
            this.estado.mouseCapturado = document.pointerLockElement === this.canvas;
            console.log(`🖱️ Mouse ${this.estado.mouseCapturado ? 'capturado' : 'liberado'}`);
        });
        
        // Movimiento del mouse (rotación horizontal)
        document.addEventListener('mousemove', (e) => {
            if (this.estado.mouseCapturado && this.player) {
                this.player.angle += e.movementX * this.controles.mouseSensibilidad;
                
                if (this.estado.debug) {
                    console.log(`🔄 Rotación: ${(this.player.angle * 180 / Math.PI).toFixed(1)}°`);
                }
            }
        });
        
        // Controles de teclado
        document.addEventListener('keydown', (e) => this.manejarTeclaPresionada(e));
        document.addEventListener('keyup', (e) => this.manejarTeclaLiberada(e));
        
        // Disparo con mouse
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.estado.mouseCapturado) {
                this.disparar();
            }
        });
        
        // Escape para liberar mouse
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.exitPointerLock();
            }
        });
        
        console.log('✅ Controles unificados configurados');
    },
    
    manejarTeclaPresionada: function(e) {
        const tecla = e.key.toLowerCase();
        this.controles.teclas[tecla] = true;
        
        // Acciones inmediatas
        switch(tecla) {
            case ' ': // Espacio
                e.preventDefault();
                this.disparar();
                break;
                
            case 'r': // Recargar
                e.preventDefault();
                this.recargarMunicion();
                break;
                
            case 'f': // Debug
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.alternarDebug();
                }
                break;
        }
        
        // Aplicar movimiento inmediatamente
        this.aplicarMovimiento();
    },
    
    manejarTeclaLiberada: function(e) {
        const tecla = e.key.toLowerCase();
        this.controles.teclas[tecla] = false;
    },
    
    aplicarMovimiento: function() {
        if (!this.player) return;
        
        const velocidad = 3;
        let deltaX = 0;
        let deltaY = 0;
        
        // WASD para movimiento
        if (this.controles.teclas['w']) {
            deltaX += Math.cos(this.player.angle) * velocidad;
            deltaY += Math.sin(this.player.angle) * velocidad;
        }
        if (this.controles.teclas['s']) {
            deltaX -= Math.cos(this.player.angle) * velocidad;
            deltaY -= Math.sin(this.player.angle) * velocidad;
        }
        if (this.controles.teclas['a']) {
            deltaX += Math.cos(this.player.angle - Math.PI/2) * velocidad;
            deltaY += Math.sin(this.player.angle - Math.PI/2) * velocidad;
        }
        if (this.controles.teclas['d']) {
            deltaX += Math.cos(this.player.angle + Math.PI/2) * velocidad;
            deltaY += Math.sin(this.player.angle + Math.PI/2) * velocidad;
        }
        
        // Aplicar movimiento con verificación de límites
        const nuevaX = this.player.x + deltaX;
        const nuevaY = this.player.y + deltaY;
        
        // Límites del mapa (ajustar según el mapa real)
        if (nuevaX > 32 && nuevaX < 400 - 32 && nuevaY > 32 && nuevaY < 300 - 32) {
            this.player.x = nuevaX;
            this.player.y = nuevaY;
            
            if (this.estado.debug && (deltaX !== 0 || deltaY !== 0)) {
                console.log(`🚶 Posición: (${this.player.x.toFixed(1)}, ${this.player.y.toFixed(1)})`);
            }
        }
    },
    
    // ================================
    // SISTEMA DE DISPARO UNIFICADO
    // ================================
    configurarDisparo: function() {
        console.log('🔫 Configurando sistema de disparo...');
        // El disparo se configura junto con los controles
        console.log('✅ Sistema de disparo listo');
    },
    
    disparar: function() {
        if (!this.player || !this.canvas) return;
        
        const ahora = Date.now();
        if (ahora - this.disparo.ultimoDisparo < this.disparo.cadencia) return;
        
        if (this.disparo.municion <= 0) {
            this.reproducirSonidoVacio();
            return;
        }
        
        // Crear bala desde el centro de la pantalla (crosshair)
        const bala = {
            id: Date.now(),
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            worldX: this.player.x,
            worldY: this.player.y,
            angle: this.player.angle,
            velocidad: 800,
            distanciaRecorrida: 0,
            maxDistancia: 1000,
            activa: true,
            tiempoCreacion: ahora
        };
        
        this.disparo.balas.push(bala);
        this.disparo.municion--;
        this.disparo.ultimoDisparo = ahora;
        
        // Efectos
        this.reproducirSonidoDisparo();
        this.crearEfectoDisparo();
        
        console.log(`🔫 ¡Disparo! Munición: ${this.disparo.municion}/${this.disparo.maxMunicion}`);
        
        // Registrar en memoria
        this.registrarEnMemoria(`Disparo ejecutado. Munición restante: ${this.disparo.municion}`);
    },
    
    reproducirSonidoDisparo: function() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            // Sonido de escopeta 8-bit
            oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            
            oscillator.type = 'sawtooth';
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.1);
            
        } catch (e) {
            console.warn('⚠️ Audio no disponible:', e.message);
        }
    },
    
    reproducirSonidoVacio: function() {
        console.log('🔫 *click* - Sin munición');
        // TODO: Sonido de disparo en vacío
    },
    
    crearEfectoDisparo: function() {
        // TODO: Efectos visuales simples (opcional)
    },
    
    recargarMunicion: function() {
        this.disparo.municion = this.disparo.maxMunicion;
        console.log('🔄 Munición recargada');
        this.registrarEnMemoria('Munición recargada manualmente');
    },
    
    // ================================
    // BUCLE PRINCIPAL DEL JUEGO
    // ================================
    iniciarBucleJuego: function() {
        let ultimoFrame = performance.now();
        
        const bucle = (tiempoActual) => {
            const deltaTime = tiempoActual - ultimoFrame;
            ultimoFrame = tiempoActual;
            
            this.actualizar(deltaTime);
            this.renderizar();
            
            requestAnimationFrame(bucle);
        };
        
        requestAnimationFrame(bucle);
        console.log('🔄 Bucle principal iniciado');
    },
    
    actualizar: function(deltaTime) {
        if (!this.estado.iniciado) return;
        
        // Aplicar movimiento continuo si hay teclas presionadas
        if (Object.values(this.controles.teclas).some(t => t)) {
            this.aplicarMovimiento();
        }
        
        // Actualizar balas
        this.actualizarBalas(deltaTime);
    },
    
    actualizarBalas: function(deltaTime) {
        const dt = deltaTime / 1000; // Convertir a segundos
        
        for (let i = this.disparo.balas.length - 1; i >= 0; i--) {
            const bala = this.disparo.balas[i];
            
            // Mover bala
            bala.x += Math.cos(bala.angle) * bala.velocidad * dt;
            bala.y += Math.sin(bala.angle) * bala.velocidad * dt;
            bala.distanciaRecorrida += bala.velocidad * dt;
            
            // Eliminar balas fuera de rango
            if (bala.x < 0 || bala.x > this.canvas.width ||
                bala.y < 0 || bala.y > this.canvas.height ||
                bala.distanciaRecorrida > bala.maxDistancia) {
                
                this.disparo.balas.splice(i, 1);
                continue;
            }
        }
    },
    
    renderizar: function() {
        if (!this.ctx) return;
        
        this.renderizarBalas();
        this.renderizarUI();
    },
    
    renderizarBalas: function() {
        if (this.disparo.balas.length === 0) return;
        
        this.ctx.save();
        
        // Dibujar balas como círculos negros
        this.ctx.fillStyle = '#000000';
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        
        this.disparo.balas.forEach(bala => {
            this.ctx.beginPath();
            this.ctx.arc(bala.x, bala.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        });
        
        this.ctx.restore();
    },
    
    renderizarUI: function() {
        if (!this.estado.debug) return;
        
        this.ctx.save();
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = '12px monospace';
        
        // Info de debug
        this.ctx.fillText(`Munición: ${this.disparo.municion}/${this.disparo.maxMunicion}`, 10, 20);
        this.ctx.fillText(`Balas activas: ${this.disparo.balas.length}`, 10, 35);
        this.ctx.fillText(`Mouse: ${this.estado.mouseCapturado ? 'Capturado' : 'Libre'}`, 10, 50);
        
        if (this.player) {
            this.ctx.fillText(`Posición: (${this.player.x.toFixed(1)}, ${this.player.y.toFixed(1)})`, 10, 65);
            this.ctx.fillText(`Ángulo: ${(this.player.angle * 180 / Math.PI).toFixed(1)}°`, 10, 80);
        }
        
        this.ctx.restore();
    },
    
    // ================================
    // UTILIDADES Y DEBUG
    // ================================
    alternarDebug: function() {
        this.estado.debug = !this.estado.debug;
        console.log(`🐛 Debug ${this.estado.debug ? 'activado' : 'desactivado'}`);
    },
    
    registrarEnMemoria: function(evento) {
        if (window.LearningMemoryAdvanced && window.LearningMemoryAdvanced.registrarEvento) {
            window.LearningMemoryAdvanced.registrarEvento({
                timestamp: new Date().toISOString(),
                categoria: 'sistema_doom_unificado',
                evento: evento,
                detalles: {
                    municion: this.disparo.municion,
                    balasActivas: this.disparo.balas.length,
                    mouseCapturado: this.estado.mouseCapturado,
                    playerConectado: !!this.player
                }
            });
        }
    },
    
    // ================================
    // API PÚBLICA
    // ================================
    obtenerEstado: function() {
        return {
            iniciado: this.estado.iniciado,
            mouseCapturado: this.estado.mouseCapturado,
            municion: this.disparo.municion,
            balasActivas: this.disparo.balas.length,
            playerConectado: !!this.player,
            debug: this.estado.debug
        };
    },
    
    reiniciar: function() {
        this.disparo.balas = [];
        this.disparo.municion = this.disparo.maxMunicion;
        this.controles.teclas = {};
        console.log('🔄 Sistema reiniciado');
    }
};

// ================================
// INICIALIZACIÓN AUTOMÁTICA
// ================================
function inicializarSistemaDoomUnificado() {
    function intentarInicializar() {
        if (document.getElementById('gameCanvas')) {
            window.SistemaDoomUnificado.init();
            console.log('✅ Sistema DOOM Unificado inicializado');
        } else {
            console.log('⏳ Esperando canvas para Sistema DOOM Unificado...');
            setTimeout(intentarInicializar, 500);
        }
    }
    
    // Esperar un poco para que otros sistemas se carguen
    setTimeout(intentarInicializar, 1000);
}

// ================================
// COMPATIBILIDAD CON SISTEMAS ANTERIORES
// ================================
// Proporcionar interfaces compatibles para evitar errores
window.SistemaDisparo = {
    disparar: () => window.SistemaDoomUnificado.disparar()
};

window.controlesDefinitivos = {
    inicializar: () => console.log('✅ Controles manejados por Sistema DOOM Unificado'),
    testear: () => window.SistemaDoomUnificado.obtenerEstado()
};

// ================================
// EXPORTACIÓN GLOBAL
// ================================
window.SistemaDoomUnificado = window.SistemaDoomUnificado;

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarSistemaDoomUnificado);
} else {
    inicializarSistemaDoomUnificado();
}

console.log('✅ Sistema DOOM Unificado cargado');
console.log('💡 Comandos disponibles:');
console.log('   window.SistemaDoomUnificado.obtenerEstado()');
console.log('   window.SistemaDoomUnificado.recargarMunicion()');
console.log('   window.SistemaDoomUnificado.alternarDebug()');
