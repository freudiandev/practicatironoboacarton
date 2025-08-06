// =============================================================================
// WorldPhysics v2.0.0 - Sistema de física integrado con MapCartographer
// =============================================================================
(function(window) {
    'use strict';

    // Registrar en learningMemory antes de iniciar
    if (window.learningMemory && window.learningMemory.registrarEvento) {
        window.learningMemory.registrarEvento('WORLD_PHYSICS_V2_INIT', { timestamp: Date.now() });
    }

    const WorldPhysics = {
        version: '2.0.0',
        mapData: null,
        cartographer: null,
        
        /**
         * Inicializar con integración de cartografía
         */
        init(mapData) {
            this.mapData = mapData || (window.GAME ? window.GAME.mapaColisiones : null);
            
            if (this.mapData) {
                // Integrar con MapCartographer si está disponible
                if (window.MapCartographer) {
                    if (window.MapCartographer.initialize(this.mapData)) {
                        this.cartographer = window.MapCartographer;
                        console.log('🌍 WorldPhysics v2.0.0 - Integrado con MapCartographer');
                    }
                } else {
                    console.warn('🌍 WorldPhysics: MapCartographer no disponible, usando lógica básica');
                }
                return true;
            }
            console.error('🌍 WorldPhysics: No se pudo inicializar - falta mapa de colisiones');
            return false;
        },
        
        /**
         * Verificación de colisión mejorada con 16 puntos + centro
         */
        checkCollision(x, y, radio = 0.2) {
            // Obtener el mapa del juego (usar GAME_MAZE para consistencia)
            const mapa = window.GAME_MAZE || (window.GAME ? window.GAME.mapaColisiones : null);
            if (!mapa) return true; // Si no hay mapa, asumir colisión
            
            const ancho = mapa[0] ? mapa[0].length : 0;
            const alto = mapa.length;
            
            // Verificación simplificada - 5 puntos para máximo rendimiento
            const puntos = [
                {dx: 0, dy: 0},     // Centro
                {dx: radio, dy: 0},  // Derecha
                {dx: -radio, dy: 0}, // Izquierda
                {dx: 0, dy: radio},  // Abajo
                {dx: 0, dy: -radio}  // Arriba
            ];
            
            for (let i = 0; i < puntos.length; i++) {
                const checkX = x + puntos[i].dx;
                const checkY = y + puntos[i].dy;
                const mapX = Math.floor(checkX);
                const mapY = Math.floor(checkY);
                
                if (mapX < 0 || mapY < 0 || mapX >= ancho || mapY >= alto) return true;
                if (mapa[mapY][mapX] === 1) return true;
            }
            return false;
        },

        /**
         * Raycast mejorado con suavizado avanzado
         */
        raycast(x0, y0, x1, y1) {
            if (!window.GAME || !window.GAME.mapaColisiones) return true;
            var mapa = window.GAME.mapaColisiones;
            var ancho = mapa[0] ? mapa[0].length : 0;
            var alto = mapa.length;
            
            // Calcular distancia y usar menos pasos para mayor rendimiento
            var dx = x1 - x0;
            var dy = y1 - y0;
            var distancia = Math.sqrt(dx*dx + dy*dy);
            var pasos = Math.ceil(distancia / 16); // Un paso cada 16 píxeles para máximo rendimiento
            
            // Interpolación simple con menos verificaciones
            for (var i = 1; i <= pasos; i++) {
                var t = i / pasos;
                var x = x0 + dx * t;
                var y = y0 + dy * t;
                
                // Verificar solo el punto central para máxima eficiencia
                var cx = Math.floor(x / 32);
                var cy = Math.floor(y / 32);
                
                if (cx < 0 || cy < 0 || cx >= ancho || cy >= alto) {
                    return true;
                } else if (mapa[cy][cx] === 1) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Verificación de visibilidad
         */
        isVisible(x0, y0, x1, y1) {
            return !this.raycast(x0, y0, x1, y1);
        },
        
        /**
         * Obtener posición de spawn segura usando cartografía
         */
        getSafeSpawnPosition() {
            // Inicializar si no se ha hecho
            if (!this.cartographer && window.MapCartographer && this.mapData) {
                this.init(this.mapData);
            }
            
            // Usar cartógrafo si está disponible
            if (this.cartographer) {
                const position = this.cartographer.getBestSpawnPosition();
                console.log('🌍 WorldPhysics: Posición de spawn desde cartógrafo:', position);
                return position;
            }
            
            // Fallback a método básico
            return this.findBasicSafePosition();
        },
        
        /**
         * Método básico de búsqueda de posición segura
         */
        findBasicSafePosition() {
            if (!this.mapData && window.GAME && window.GAME.mapaColisiones) {
                this.mapData = window.GAME.mapaColisiones;
            }
            
            if (!this.mapData) return {x: 96, y: 96};
            
            const width = this.mapData[0] ? this.mapData[0].length : 0;
            const height = this.mapData.length;
            const centerX = Math.floor(width / 2);
            const centerY = Math.floor(height / 2);
            
            // Buscar en espiral desde el centro
            for (let radius = 1; radius < Math.min(width, height) / 2; radius++) {
                for (let angle = 0; angle < 360; angle += 30) {
                    const rad = angle * Math.PI / 180;
                    const x = Math.floor(centerX + Math.cos(rad) * radius);
                    const y = Math.floor(centerY + Math.sin(rad) * radius);
                    
                    if (this.isAreaSafe(x, y, 3)) {
                        return {
                            x: x * 32 + 16,
                            y: y * 32 + 16,
                            gridX: x,
                            gridY: y,
                            safety: 'basic'
                        };
                    }
                }
            }
            
            return {x: 128, y: 128};
        },
        
        /**
         * Verificar si área es segura
         */
        isAreaSafe(centerX, centerY, radius) {
            if (!this.mapData && window.GAME && window.GAME.mapaColisiones) {
                this.mapData = window.GAME.mapaColisiones;
            }
            
            if (!this.mapData) return false;
            
            const width = this.mapData[0] ? this.mapData[0].length : 0;
            const height = this.mapData.length;
            
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    const x = centerX + dx;
                    const y = centerY + dy;
                    
                    if (x < 0 || y < 0 || x >= width || y >= height) return false;
                    if (this.mapData[y][x] === 1) return false;
                }
            }
            return true;
        },
        
        /**
         * Verificar si posición mundial es segura
         */
        isWorldPositionSafe(worldX, worldY, safetyRadius = 2) {
            if (this.cartographer) {
                return this.cartographer.isPositionSafe(worldX, worldY, safetyRadius);
            }
            
            // Fallback básico
            return !this.checkCollision(worldX, worldY);
        },
        
        /**
         * Obtener información del análisis del mapa
         */
        getMapAnalysis() {
            if (this.cartographer) {
                return this.cartographer.getAnalysis();
            }
            return null;
        },
        
        // Métodos legacy para compatibilidad
        gravity: 0,
        entities: [],
        map: null,
        addEntity(entity) { return entity.id; },
        removeEntity(entityId) {},
        update() {}
    };

    // Exponer globalmente
    window.WorldPhysics = WorldPhysics;
    
    console.log('🌍 WorldPhysics v2.0.0 cargado');

})(window);
