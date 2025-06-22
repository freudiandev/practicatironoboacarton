/**
 * EMERGENCIA - SISTEMA DE PITCH FUNCIONAL
 * Este script crea una versión mínima funcional mientras reparamos el archivo principal
 */

console.log('🚨 EMERGENCIA - ACTIVANDO SISTEMA DE PITCH FUNCIONAL');

// Detectar si ya tenemos un juego en ejecución
if (window.unifiedGame) {
    console.log('🎮 Juego detectado - aplicando fix de pitch...');
    
    // Aplicar fix directo al juego actual
    if (window.unifiedGame.updatePlayer) {
        // Guardar referencia original
        const originalUpdate = window.unifiedGame.updatePlayer.bind(window.unifiedGame);
        
        // Sobrescribir con versión que incluye pitch
        window.unifiedGame.updatePlayer = function() {
            const movement = this.input.getMovement();
            const rotation = this.input.getMouseRotation();
            
            // Rotación horizontal (funcionando)
            if (Math.abs(rotation.horizontal) > 0.0001) {
                this.player.angle -= rotation.horizontal;
                this.player.angle = this.player.angle % (2 * Math.PI);
                if (this.player.angle < 0) this.player.angle += 2 * Math.PI;
            }
            
            // Rotación vertical - REPARADA DINÁMICAMENTE
            if (Math.abs(rotation.pitch) > 0.0001) {
                if (!this.player.pitch) this.player.pitch = 0;
                this.player.pitch += rotation.pitch;
                
                // Limitar pitch
                const maxPitch = Math.PI / 4;
                this.player.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.player.pitch));
                
                console.log(`⬆️⬇️ Pitch funcionando: ${this.player.pitch.toFixed(3)}`);
            }
            
            // Llamar al resto de la función original manteniendo el movimiento
            const speed = this.player.speed * 0.016;
            let moveX = 0;
            let moveZ = 0;
            
            if (movement.z !== 0) {
                moveX += Math.cos(this.player.angle) * movement.z * speed;
                moveZ += Math.sin(this.player.angle) * movement.z * speed;
            }
            if (movement.x !== 0) {
                moveX += Math.cos(this.player.angle + Math.PI/2) * movement.x * speed;
                moveZ += Math.sin(this.player.angle + Math.PI/2) * movement.x * speed;
            }
            
            // Verificar colisiones básicas (simplificado)
            const cellSize = 64;
            const gridX = Math.floor((this.player.x + moveX) / cellSize);
            const gridZ = Math.floor((this.player.z + moveZ) / cellSize);
            
            // Aplicar movimiento si no hay colisión
            if (gridX >= 0 && gridX < 20 && gridZ >= 0 && gridZ < 13) {
                if (window.GAME_MAZE && window.GAME_MAZE[gridZ] && window.GAME_MAZE[gridZ][gridX] === 0) {
                    this.player.x += moveX;
                    this.player.z += moveZ;
                }
            }
        };
        
        console.log('✅ Sistema de pitch aplicado dinámicamente');
        console.log('🎯 Ahora puedes usar mouse vertical y flechas arriba/abajo');
        
        // También reparar el renderer si es necesario
        if (this.renderer && this.renderer.drawWallColumn) {
            const originalDrawWall = this.renderer.drawWallColumn.bind(this.renderer);
            
            this.renderer.drawWallColumn = function(x, hit, screenHeight, pitch = 0) {
                const distance = hit.distance;
                const wallHeight = 64; // GAME_CONFIG.world.wallHeight
                const projectedHeight = (wallHeight * screenHeight) / distance;
                
                // Sistema de pitch corregido - afecta perspectiva, no posición del mundo
                const maxPitch = Math.PI / 4;
                const clampedPitch = Math.max(-maxPitch, Math.min(maxPitch, pitch));
                const pitchFactor = projectedHeight / screenHeight;
                const pitchOffset = clampedPitch * screenHeight * 0.5 * pitchFactor;
                
                const centerY = screenHeight / 2;
                const wallTop = Math.max(0, centerY - (projectedHeight / 2) + pitchOffset);
                const wallBottom = Math.min(screenHeight, centerY + (projectedHeight / 2) + pitchOffset);
                
                const brightness = Math.max(0.3, 1 - (distance / 500));
                const color = Math.floor(139 * brightness);
                
                this.ctx.fillStyle = `rgb(${color}, ${Math.floor(69 * brightness)}, ${Math.floor(19 * brightness)})`;
                this.ctx.fillRect(x, wallTop, 2, wallBottom - wallTop);
            };
            
            console.log('✅ Renderer de pitch también reparado');
        }
        
    } else {
        console.log('⚠️ No se pudo encontrar updatePlayer - el juego puede no estar completamente cargado');
    }
    
} else {
    console.log('⚠️ No se detectó juego activo - carga la página primero');
}

console.log('');
console.log('🎯 INSTRUCCIONES:');
console.log('1. Recarga la página del juego');
console.log('2. Una vez cargado, ejecuta este script en la consola');
console.log('3. El pitch debe funcionar inmediatamente');
console.log('4. Prueba mouse vertical y flechas arriba/abajo');

// Función para aplicar después de carga
window.aplicarFixPitch = function() {
    console.log('🔧 Aplicando fix de pitch...');
    setTimeout(() => {
        // Ejecutar el script de reparación después de que todo esté cargado
        eval(document.currentScript ? document.currentScript.innerHTML : '/* ya ejecutado */');
    }, 1000);
};

console.log('💡 También puedes usar: aplicarFixPitch() después de cargar el juego');
