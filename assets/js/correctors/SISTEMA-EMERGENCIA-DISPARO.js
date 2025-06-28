// ============================================================================
// SISTEMA DISPARO EMERGENCIA - RESPALDO TEMPORAL
// Para usar mientras se corrige el sistema unificado
// ============================================================================

console.log('🚨 SISTEMA DISPARO EMERGENCIA: Inicializando...');

// Sistema de disparo de emergencia super simple
window.SistemaEmergencia = {
    balas: [],
    impactos: [],
    ultimoDisparo: 0,
    
    disparar: function() {
        console.log('🚨 DISPARO DE EMERGENCIA ejecutado');
        
        const ahora = Date.now();
        if (ahora - this.ultimoDisparo < 200) {
            console.log('⏱️ Cadencia de emergencia');
            return false;
        }
        
        // Verificar GAME
        if (!window.GAME || !window.GAME.player) {
            console.log('❌ GAME no disponible en emergencia');
            
            // Crear player temporal para testing
            if (!window.GAME) {
                window.GAME = {
                    player: { x: 200, z: 200, angle: 0 },
                    ctx: null
                };
            }
            if (!window.GAME.player) {
                window.GAME.player = { x: 200, z: 200, angle: 0 };
            }
        }
        
        const player = window.GAME.player;
        
        // Crear bala de emergencia
        const bala = {
            x: player.x,
            z: player.z,
            dx: Math.cos(player.angle) * 8,
            dz: Math.sin(player.angle) * 8,
            vida: 50,
            id: 'emergencia_' + ahora
        };
        
        this.balas.push(bala);
        this.ultimoDisparo = ahora;
        
        console.log(`🚨 BALA EMERGENCIA: ${bala.id} en (${bala.x}, ${bala.z})`);
        
        // Simular sonido
        console.log('🔊 ¡BANG! (Sonido simulado)');
        
        return true;
    },
    
    actualizar: function() {
        // Actualizar balas
        for (let i = this.balas.length - 1; i >= 0; i--) {
            const bala = this.balas[i];
            
            bala.x += bala.dx;
            bala.z += bala.dz;
            bala.vida--;
            
            if (bala.vida <= 0) {
                this.balas.splice(i, 1);
                continue;
            }
            
            // Verificar colisión (simulada)
            const tileX = Math.floor(bala.x / 64);
            const tileZ = Math.floor(bala.z / 64);
            
            if (tileX < 0 || tileX >= 16 || tileZ < 0 || tileZ >= 12) {
                this.balas.splice(i, 1);
                continue;
            }
            
            // Simular impacto cada 20 frames
            if (bala.vida % 20 === 0) {
                this.impactos.push({
                    x: bala.x,
                    z: bala.z,
                    timestamp: Date.now()
                });
                
                this.balas.splice(i, 1);
                console.log(`💥 IMPACTO EMERGENCIA en (${bala.x.toFixed(1)}, ${bala.z.toFixed(1)})`);
            }
        }
        
        // Limitar impactos
        if (this.impactos.length > 10) {
            this.impactos.shift();
        }
    },
    
    estado: function() {
        return {
            balas: this.balas.length,
            impactos: this.impactos.length,
            ultimoDisparo: this.ultimoDisparo,
            activo: true
        };
    },
    
    renderizar: function() {
        // Renderizado básico en consola
        if (this.balas.length > 0) {
            console.log(`🎯 Balas activas: ${this.balas.length}`);
        }
        if (this.impactos.length > 0) {
            console.log(`💥 Impactos: ${this.impactos.length}`);
        }
    }
};

// Configurar controles de emergencia
function configurarControlsEmergencia() {
    console.log('🚨 Configurando controles de emergencia...');
    
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            console.log('🚨 ESPACIO presionado - EMERGENCIA');
            window.SistemaEmergencia.disparar();
        }
        
        if (e.key === 'F2') {
            e.preventDefault();
            console.log('📊 ESTADO EMERGENCIA:', window.SistemaEmergencia.estado());
        }
    });
    
    console.log('✅ Controles de emergencia configurados');
    console.log('🎮 ESPACIO = Disparar emergencia');
    console.log('🎮 F2 = Estado emergencia');
}

// Bucle de actualización de emergencia
function bucleEmergencia() {
    window.SistemaEmergencia.actualizar();
    window.SistemaEmergencia.renderizar();
    setTimeout(bucleEmergencia, 50); // 20 FPS
}

// Inicializar sistema de emergencia
setTimeout(() => {
    configurarControlsEmergencia();
    bucleEmergencia();
    
    console.log('🚨 SISTEMA EMERGENCIA LISTO');
    console.log('🔫 Presiona ESPACIO para disparar');
    console.log('📊 Presiona F2 para ver estado');
    console.log('🧪 Usa: window.SistemaEmergencia.disparar()');
    
}, 1000);

console.log('✅ SISTEMA DISPARO EMERGENCIA: Cargado');
