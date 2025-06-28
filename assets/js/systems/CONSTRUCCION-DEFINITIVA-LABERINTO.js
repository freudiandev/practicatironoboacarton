/**
 * 🏗️ CONSTRUCCIÓN DEFINITIVA DEL LABERINTO COMPACTO
 * 
 * Solución unificada que reemplaza todos los archivos de corrección del laberinto:
 * - Elimina conflictos entre múltiples correcciones
 * - Crea un laberinto compacto y navegable
 * - Distribuye correctamente los carteles de Noboa
 * - Configuración optimizada y final
 * 
 * Fecha: 23 de junio de 2025
 * Desarrollado por: Samy y Álex con GitHub Copilot
 */

console.log('🏗️ === CONSTRUCCIÓN DEFINITIVA DEL LABERINTO ===');

// 1. CONSULTA CON LEARNING MEMORY
if (window.learningMemory && window.learningMemory.logEvent) {
    window.learningMemory.logEvent('CONSTRUCCION_DEFINITIVA_LABERINTO', 'Aplicando solución unificada del laberinto');
}

// 2. CONFIGURACIÓN DEFINITIVA Y OPTIMIZADA
const LABERINTO_DEFINITIVO = {
    // Configuración del mundo más compacta
    WORLD_CONFIG: {
        gridRows: 10,         // Reducido de 13 a 10 filas
        gridCols: 14,         // Reducido de 20 a 14 columnas
        cellSize: 40,         // Compacto: 40px por celda
        wallHeight: 35,       // Altura proporcional
        fov: Math.PI / 2.5,   // 72° campo de visión amplio
        maxRenderDistance: 300 // Distancia optimizada
    },
    
    // Configuración del jugador ajustada
    PLAYER_CONFIG: {
        startX: 2.5 * 40,     // Posición inicial ajustada
        startY: 25,           
        startZ: 2.5 * 40,     
        speed: 100,           // Velocidad proporcional
        cameraHeight: 25      // Altura de cámara ajustada
    },
    
    // Sensibilidades de control optimizadas
    CONTROLS_CONFIG: {
        mouseRotationSensitivity: 0.002,
        mousePitchSensitivity: 0.0012,
        keyboardRotationSpeed: 3.0,
        keyboardPitchSpeed: 1.2
    }
};

// 3. MAPA COMPACTO CON CARTELES BIEN DISTRIBUIDOS
const MAPA_COMPACTO_DEFINITIVO = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,2,0,0,3,0,0,0,0,1],
    [1,0,1,0,1,1,0,1,1,0,1,0,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,4,1,0,1,0,1,0,1,0,1,0,5,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,1,0,1,1,0,1,0,1,1],
    [1,0,0,0,0,6,0,0,7,0,0,0,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// 4. FUNCIÓN PARA APLICAR LA CONFIGURACIÓN DEFINITIVA
function aplicarLaberintoDefinitivo() {
    console.log('🔧 Aplicando configuración definitiva del laberinto...');
    
    try {
        // Verificar que GAME_CONFIG existe
        if (typeof GAME_CONFIG !== 'undefined') {
            console.log('📝 Actualizando GAME_CONFIG con configuración definitiva...');
            
            // Backup de configuración actual
            window.GAME_CONFIG_BACKUP = JSON.parse(JSON.stringify(GAME_CONFIG));
            
            // Aplicar nueva configuración del mundo
            GAME_CONFIG.world.gridRows = LABERINTO_DEFINITIVO.WORLD_CONFIG.gridRows;
            GAME_CONFIG.world.gridCols = LABERINTO_DEFINITIVO.WORLD_CONFIG.gridCols;
            GAME_CONFIG.world.cellSize = LABERINTO_DEFINITIVO.WORLD_CONFIG.cellSize;
            GAME_CONFIG.world.wallHeight = LABERINTO_DEFINITIVO.WORLD_CONFIG.wallHeight;
            GAME_CONFIG.world.fov = LABERINTO_DEFINITIVO.WORLD_CONFIG.fov;
            GAME_CONFIG.world.maxRenderDistance = LABERINTO_DEFINITIVO.WORLD_CONFIG.maxRenderDistance;
            
            // Aplicar nueva configuración del jugador
            GAME_CONFIG.player.startX = LABERINTO_DEFINITIVO.PLAYER_CONFIG.startX;
            GAME_CONFIG.player.startY = LABERINTO_DEFINITIVO.PLAYER_CONFIG.startY;
            GAME_CONFIG.player.startZ = LABERINTO_DEFINITIVO.PLAYER_CONFIG.startZ;
            GAME_CONFIG.player.speed = LABERINTO_DEFINITIVO.PLAYER_CONFIG.speed;
            GAME_CONFIG.player.cameraHeight = LABERINTO_DEFINITIVO.PLAYER_CONFIG.cameraHeight;
            
            // Aplicar configuración de controles
            GAME_CONFIG.controls.mouseRotationSensitivity = LABERINTO_DEFINITIVO.CONTROLS_CONFIG.mouseRotationSensitivity;
            GAME_CONFIG.controls.mousePitchSensitivity = LABERINTO_DEFINITIVO.CONTROLS_CONFIG.mousePitchSensitivity;
            GAME_CONFIG.controls.keyboardRotationSpeed = LABERINTO_DEFINITIVO.CONTROLS_CONFIG.keyboardRotationSpeed;
            GAME_CONFIG.controls.keyboardPitchSpeed = LABERINTO_DEFINITIVO.CONTROLS_CONFIG.keyboardPitchSpeed;
            
            console.log('✅ GAME_CONFIG actualizado exitosamente');
        }
        
        // Reemplazar el mapa si GAME_MAZE existe
        if (typeof GAME_MAZE !== 'undefined') {
            console.log('🗺️ Reemplazando GAME_MAZE con mapa compacto...');
            
            // Backup del mapa actual
            window.GAME_MAZE_BACKUP = JSON.parse(JSON.stringify(GAME_MAZE));
            
            // Reemplazar el mapa
            GAME_MAZE.length = 0; // Limpiar array existente
            MAPA_COMPACTO_DEFINITIVO.forEach(fila => {
                GAME_MAZE.push([...fila]); // Copiar cada fila
            });
            
            console.log('✅ GAME_MAZE reemplazado con mapa compacto');
            console.log(`📊 Nuevo tamaño: ${GAME_MAZE.length} x ${GAME_MAZE[0].length}`);
        } else {
            console.log('🆕 Creando GAME_MAZE con mapa compacto...');
            window.GAME_MAZE = MAPA_COMPACTO_DEFINITIVO.map(fila => [...fila]);
        }
        
        // Mostrar configuración aplicada
        console.log('📋 Configuración definitiva aplicada:');
        console.log(`   Tamaño del mundo: ${LABERINTO_DEFINITIVO.WORLD_CONFIG.gridRows} x ${LABERINTO_DEFINITIVO.WORLD_CONFIG.gridCols}`);
        console.log(`   Tamaño de celda: ${LABERINTO_DEFINITIVO.WORLD_CONFIG.cellSize}px`);
        console.log(`   Altura de pared: ${LABERINTO_DEFINITIVO.WORLD_CONFIG.wallHeight}px`);
        console.log(`   Campo de visión: ${Math.round(LABERINTO_DEFINITIVO.WORLD_CONFIG.fov * 180 / Math.PI)}°`);
        console.log(`   Velocidad: ${LABERINTO_DEFINITIVO.PLAYER_CONFIG.speed}`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Error aplicando configuración definitiva:', error);
        return false;
    }
}

// 5. VERIFICAR DISTRIBUCIÓN DE CARTELES
function verificarCartelesEnMapaCompacto() {
    console.log('🖼️ Verificando distribución de carteles en mapa compacto...');
    
    const carteles = new Map();
    let totalCarteles = 0;
    
    MAPA_COMPACTO_DEFINITIVO.forEach((fila, y) => {
        fila.forEach((celda, x) => {
            if (celda >= 2 && celda <= 7) {
                if (!carteles.has(celda)) {
                    carteles.set(celda, []);
                }
                carteles.get(celda).push([x, y]);
                totalCarteles++;
            }
        });
    });
    
    console.log('📍 Distribución de carteles:');
    for (let i = 2; i <= 7; i++) {
        if (carteles.has(i)) {
            const posiciones = carteles.get(i);
            console.log(`   Cartel ${i}: ${posiciones.length} instancia(s) en posiciones ${JSON.stringify(posiciones)}`);
        } else {
            console.log(`   Cartel ${i}: No encontrado`);
        }
    }
    
    console.log(`📊 Total de carteles: ${totalCarteles}`);
    return carteles;
}

// 6. REINICIALIZAR EL JUEGO CON NUEVA CONFIGURACIÓN
function reinicializarJuegoConLaberintoCompacto() {
    console.log('🔄 Reinicializando juego con laberinto compacto...');
    
    try {
        // Si hay una instancia del juego activa, reiniciarla
        if (window.gameInstance) {
            if (window.gameInstance.restart) {
                console.log('🎮 Reiniciando instancia existente...');
                window.gameInstance.restart();
            } else if (window.gameInstance.init) {
                console.log('🎮 Re-inicializando instancia...');
                const canvas = document.getElementById('gameCanvas');
                if (canvas) {
                    window.gameInstance.init(canvas);
                }
            }
        }
        
        // Si hay función global de inicialización
        if (window.initGame) {
            console.log('🎮 Ejecutando initGame global...');
            setTimeout(() => {
                window.initGame();
            }, 500);
        }
        
        // Si hay objeto game global
        if (window.game && window.game.init) {
            console.log('🎮 Reinicializando objeto game...');
            const canvas = document.getElementById('gameCanvas');
            if (canvas) {
                setTimeout(() => {
                    window.game.init(canvas);
                }, 300);
            }
        }
        
        console.log('✅ Reinicialización programada exitosamente');
        return true;
        
    } catch (error) {
        console.error('❌ Error en reinicialización:', error);
        return false;
    }
}

// 7. FUNCIÓN DE ROLLBACK POR SI HAY PROBLEMAS
function rollbackLaberintoDefinitivo() {
    console.log('🔄 Realizando rollback de configuración definitiva...');
    
    try {
        if (window.GAME_CONFIG_BACKUP && typeof GAME_CONFIG !== 'undefined') {
            Object.assign(GAME_CONFIG, window.GAME_CONFIG_BACKUP);
            console.log('✅ GAME_CONFIG restaurado');
        }
        
        if (window.GAME_MAZE_BACKUP && typeof GAME_MAZE !== 'undefined') {
            GAME_MAZE.length = 0;
            window.GAME_MAZE_BACKUP.forEach(fila => {
                GAME_MAZE.push([...fila]);
            });
            console.log('✅ GAME_MAZE restaurado');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error en rollback:', error);
        return false;
    }
}

// 8. FUNCIONES GLOBALES PARA CONTROL MANUAL
window.aplicarLaberintoCompacto = function() {
    console.log('🏗️ Aplicando laberinto compacto manualmente...');
    const resultado = aplicarLaberintoDefinitivo();
    if (resultado) {
        verificarCartelesEnMapaCompacto();
        reinicializarJuegoConLaberintoCompacto();
    }
    return resultado;
};

window.mostrarMapaCompacto = function() {
    console.log('🗺️ === MAPA COMPACTO DEFINITIVO ===');
    MAPA_COMPACTO_DEFINITIVO.forEach((fila, y) => {
        const filaStr = fila.map(celda => {
            if (celda === 0) return ' ';
            if (celda === 1) return '█';
            return celda.toString();
        }).join('');
        console.log(`${y.toString().padStart(2)}: ${filaStr}`);
    });
    verificarCartelesEnMapaCompacto();
};

window.rollbackLaberinto = function() {
    return rollbackLaberintoDefinitivo();
};

// 9. APLICACIÓN AUTOMÁTICA AL CARGAR
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM cargado - Aplicando laberinto definitivo...');
    
    setTimeout(() => {
        console.log('🏗️ Iniciando aplicación de laberinto definitivo...');
        const resultado = aplicarLaberintoDefinitivo();
        
        if (resultado) {
            verificarCartelesEnMapaCompacto();
            
            setTimeout(() => {
                reinicializarJuegoConLaberintoCompacto();
            }, 1000);
        }
    }, 2000); // Delay mayor para asegurar que otros scripts hayan cargado
});

// Si ya estamos cargados, aplicar inmediatamente
if (document.readyState !== 'loading') {
    console.log('📄 Aplicando laberinto definitivo inmediatamente...');
    setTimeout(() => {
        const resultado = aplicarLaberintoDefinitivo();
        if (resultado) {
            verificarCartelesEnMapaCompacto();
            setTimeout(() => {
                reinicializarJuegoConLaberintoCompacto();
            }, 800);
        }
    }, 1500);
}

// 10. LOGGING FINAL
console.log('✅ CONSTRUCCIÓN DEFINITIVA DEL LABERINTO CARGADA');
console.log('💡 Funciones disponibles:');
console.log('   - aplicarLaberintoCompacto() - Aplicar manualmente');
console.log('   - mostrarMapaCompacto() - Ver el mapa y carteles');
console.log('   - rollbackLaberinto() - Restaurar configuración anterior');

// Registro en Learning Memory
if (window.learningMemory && window.learningMemory.logEvent) {
    window.learningMemory.logEvent('LABERINTO_DEFINITIVO_LOADED', {
        tamaño: '10x14',
        cellSize: 40,
        carteles: '6 tipos distribuidos',
        funciones: ['aplicarLaberintoCompacto', 'mostrarMapaCompacto', 'rollbackLaberinto']
    });
}
