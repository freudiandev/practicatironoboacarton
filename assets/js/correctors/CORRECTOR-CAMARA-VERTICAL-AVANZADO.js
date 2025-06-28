// ============================================================================
// CORRECTOR CRÍTICO: CÁMARA VERTICAL RAYCASTING AVANZADO
// Integración completa del pitch en el motor de raycasting DOOM-INTERMEDIO
// ============================================================================

(function() {
    'use strict';
    
    console.log('📹 CORRECTOR CRÍTICO: Cámara vertical raycasting iniciado');
    
    // Esperar a que el motor DOOM esté cargado
    function esperarMotorDoom() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (window.GAME && window.doomGame && window.render3D && window.castRay) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }
    
    // Variables globales para pitch
    let pitchActual = 0;
    const maxPitch = Math.PI / 4; // 45 grados
    const sensibilidadPitch = 0.002;
    
    // Función principal de corrección
    async function aplicarCorrecionCamaraVertical() {
        try {
            await esperarMotorDoom();
            
            console.log('🎯 Integrando sistema de pitch avanzado en motor DOOM...');
            
            // 1. Añadir propiedad pitch al jugador
            if (!window.GAME.player.pitch) {
                window.GAME.player.pitch = 0;
            }
            
            // 2. Mejorar el handler de mouse existente
            mejorarControlMouse();
            
            // 3. Añadir controles de teclado
            añadirControlesTeclado();
            
            // 4. Modificar el renderizado 3D para usar pitch
            modificarRender3D();
            
            console.log('✅ Sistema de cámara vertical avanzado integrado');
            
            // Registrar en learning memory
            if (window.learningMemoryAdvanced) {
                window.learningMemoryAdvanced.registrarEvento('CAMERA_VERTICAL_ADVANCED_INTEGRATED', {
                    descripcion: 'Sistema de pitch avanzado integrado en raycasting',
                    timestamp: new Date().toISOString(),
                    estado: 'EXITOSO',
                    tipo: 'MEJORA_CRITICA'
                });
            }
            
        } catch (error) {
            console.error('❌ Error integrando cámara vertical avanzada:', error);
        }
    }
    
    // Mejorar el control de mouse para incluir pitch
    function mejorarControlMouse() {
        // Buscar el handler de mousemove existente y mejorarlo
        document.addEventListener('mousemove', (e) => {
            if (window.GAME && window.GAME.mouseLocked) {
                // Movimiento horizontal (existente)
                window.GAME.player.angle += e.movementX * 0.003;
                
                // NUEVO: Movimiento vertical (pitch)
                pitchActual -= e.movementY * sensibilidadPitch;
                pitchActual = Math.max(-maxPitch, Math.min(maxPitch, pitchActual));
                window.GAME.player.pitch = pitchActual;
                
                // Debug visual
                if (Math.abs(e.movementY) > 0) {
                    console.log(`📹 Pitch: ${(pitchActual * 180 / Math.PI).toFixed(1)}°`);
                }
            }
        });
        
        console.log('🖱️ Control de mouse mejorado con pitch');
    }
    
    // Añadir controles de teclado para pitch
    function añadirControlesTeclado() {
        document.addEventListener('keydown', (e) => {
            if (!window.GAME || !window.GAME.running) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    pitchActual += 0.05;
                    pitchActual = Math.min(maxPitch, pitchActual);
                    window.GAME.player.pitch = pitchActual;
                    console.log(`⬆️ Pitch: ${(pitchActual * 180 / Math.PI).toFixed(1)}°`);
                    break;
                    
                case 'ArrowDown':
                    e.preventDefault();
                    pitchActual -= 0.05;
                    pitchActual = Math.max(-maxPitch, pitchActual);
                    window.GAME.player.pitch = pitchActual;
                    console.log(`⬇️ Pitch: ${(pitchActual * 180 / Math.PI).toFixed(1)}°`);
                    break;
            }
        });
        
        console.log('⌨️ Controles de teclado para pitch añadidos (flechas ↑↓)');
    }
    
    // Modificar el renderizado 3D para incluir el pitch
    function modificarRender3D() {
        const render3DOriginal = window.render3D;
        
        if (!render3DOriginal) {
            console.warn('⚠️ Función render3D no encontrada');
            return;
        }
        
        window.render3D = function() {
            const ctx = window.GAME.ctx;
            const canvas = window.GAME.canvas;
            
            if (!ctx || !canvas) {
                render3DOriginal.call(this);
                return;
            }
            
            // Limpiar canvas
            ctx.clearRect(0, 0, window.GAME.width, window.GAME.height);
            
            // CIELO con gradiente vaporwave (ajustado por pitch)
            const pitchOffset = Math.sin(pitchActual) * (canvas.height * 0.3);
            renderizarCieloConPitch(ctx, canvas, pitchOffset);
            
            // PISO con gradiente vaporwave (ajustado por pitch)  
            renderizarPisoConPitch(ctx, canvas, pitchOffset);
            
            // Raycasting con pitch integrado
            renderizarRaycastingConPitch(ctx, canvas);
            
            // Renderizar sprites (enemigos)
            if (window.renderSprites) {
                window.renderSprites();
            }
            
            // HUD vaporwave
            if (window.drawVaporwaveHUD) {
                window.drawVaporwaveHUD();
            }
            
            // Debug de pitch
            mostrarDebugPitch(ctx);
        };
        
        console.log('🎨 Renderizado 3D modificado para soportar pitch completo');
    }
    
    // Renderizar cielo con pitch
    function renderizarCieloConPitch(ctx, canvas, pitchOffset) {
        const skyHeight = (canvas.height / 2) + pitchOffset;
        
        const skyGradient = ctx.createLinearGradient(0, 0, 0, skyHeight);
        skyGradient.addColorStop(0, '#ff006e');    // Rosa neón superior
        skyGradient.addColorStop(0.7, '#8338ec');  // Morado inferior
        skyGradient.addColorStop(1, '#0f0f23');    // Azul oscuro base
        
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, skyHeight);
    }
    
    // Renderizar piso con pitch
    function renderizarPisoConPitch(ctx, canvas, pitchOffset) {
        const floorY = (canvas.height / 2) + pitchOffset;
        const floorHeight = canvas.height - floorY;
        
        if (floorHeight > 0) {
            const floorGradient = ctx.createLinearGradient(0, floorY, 0, canvas.height);
            floorGradient.addColorStop(0, '#00f5ff');  // Cyan brillante
            floorGradient.addColorStop(0.5, '#06ffa5'); // Verde neón
            floorGradient.addColorStop(1, '#0f0f23');  // Azul oscuro
            
            ctx.fillStyle = floorGradient;
            ctx.fillRect(0, floorY, canvas.width, floorHeight);
            
            // Grilla vaporwave en el piso
            renderizarGrillaVaporwave(ctx, canvas, floorY);
        }
    }
    
    // Renderizar raycasting con pitch integrado
    function renderizarRaycastingConPitch(ctx, canvas) {
        const rayStepAngle = window.GAME.fov / window.GAME.numRays;
        const columnWidth = canvas.width / window.GAME.numRays;
        const horizonY = (canvas.height / 2) + (Math.sin(pitchActual) * (canvas.height * 0.3));
        
        for (let i = 0; i < window.GAME.numRays; i++) {
            const rayAngle = window.GAME.player.angle - window.GAME.fov / 2 + i * rayStepAngle;
            const ray = window.castRay(rayAngle);
            
            const correctedDistance = ray.distance * Math.cos(rayAngle - window.GAME.player.angle);
            const wallHeight = (window.GAME.tileSize / correctedDistance) * (canvas.height / 2);
            
            // Ajustar posición de la pared basado en pitch
            const wallTop = horizonY - (wallHeight / 2);
            const wallBottom = horizonY + (wallHeight / 2);
            
            if (ray.type === 'wall') {
                renderizarColumnaParadConPitch(ctx, i * columnWidth, wallTop, columnWidth, wallHeight, ray.wallType, correctedDistance);
            } else if (ray.type === 'poster') {
                renderizarColumnaPosterConPitch(ctx, i * columnWidth, wallTop, columnWidth, wallHeight, ray.posterType, correctedDistance);
            }
        }
    }
    
    // Renderizar columna de pared con pitch
    function renderizarColumnaParadConPitch(ctx, x, wallTop, width, height, wallType, distance) {
        // Color base vaporwave para paredes
        const brightness = Math.max(0.3, 1 - distance / 400);
        const baseColor = [255, 0, 110]; // Rosa neón vaporwave
        
        const r = Math.floor(baseColor[0] * brightness);
        const g = Math.floor(baseColor[1] * brightness);
        const b = Math.floor(baseColor[2] * brightness);
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, wallTop, width, height);
        
        // Efecto glow vaporwave
        ctx.shadowBlur = 5;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
        ctx.fillRect(x, wallTop, width, height);
        ctx.shadowBlur = 0;
    }
    
    // Renderizar columna de poster con pitch
    function renderizarColumnaPosterConPitch(ctx, x, wallTop, width, height, posterType, distance) {
        // Color especial para posters
        const brightness = Math.max(0.5, 1 - distance / 300);
        const posterColors = {
            2: [255, 215, 0],   // Dorado
            3: [255, 107, 107], // Rojo coral
            4: [76, 175, 80],   // Verde
            5: [33, 150, 243],  // Azul
            6: [255, 152, 0],   // Naranja
            7: [156, 39, 176]   // Morado
        };
        
        const color = posterColors[posterType] || [255, 255, 255];
        const r = Math.floor(color[0] * brightness);
        const g = Math.floor(color[1] * brightness);
        const b = Math.floor(color[2] * brightness);
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, wallTop, width, height);
        
        // Efecto especial para posters
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
        ctx.fillRect(x, wallTop, width, height);
        ctx.shadowBlur = 0;
    }
    
    // Renderizar grilla vaporwave deshabilitada para mantener suelo fijo
    function renderizarGrillaVaporwave(ctx, canvas, startY) {
        // Grid fixed no se renderiza aquí
        return;
    }
    
    // Mostrar debug de pitch
    function mostrarDebugPitch(ctx) {
        if (Math.abs(pitchActual) > 0.01) {
            ctx.save();
            ctx.fillStyle = '#00FF00';
            ctx.font = '16px monospace';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            
            const texto = `Pitch: ${(pitchActual * 180 / Math.PI).toFixed(1)}°`;
            ctx.strokeText(texto, 10, 30);
            ctx.fillText(texto, 10, 30);
            ctx.restore();
        }
    }
    
    // API pública
    window.CamaraVerticalAvanzada = {
        obtenerPitch: () => pitchActual,
        establecerPitch: (pitch) => {
            pitchActual = Math.max(-maxPitch, Math.min(maxPitch, pitch));
            if (window.GAME && window.GAME.player) {
                window.GAME.player.pitch = pitchActual;
            }
        },
        resetearPitch: () => {
            pitchActual = 0;
            if (window.GAME && window.GAME.player) {
                window.GAME.player.pitch = 0;
            }
            console.log('🔄 Pitch reseteado a 0°');
        },
        obtenerEstado: () => ({
            pitch: pitchActual,
            pitchGrados: (pitchActual * 180 / Math.PI).toFixed(1),
            maxPitch: maxPitch,
            sensibilidad: sensibilidadPitch
        })
    };
    
    // Inicializar la corrección
    function inicializar() {
        console.log('🚀 Iniciando corrección de cámara vertical avanzada...');
        aplicarCorrecionCamaraVertical();
    }
    
    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializar);
    } else {
        setTimeout(inicializar, 100);
    }
    
    console.log('✅ Corrector de cámara vertical avanzado cargado');
    
})();
