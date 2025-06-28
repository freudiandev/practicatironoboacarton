// =============================================================================
// Módulo WorldPhysics: Gestiona la física del mundo independiente de la cámara
// =============================================================================
(function(window) {
    'use strict';

    // Registrar en learningMemory antes de iniciar
    if (window.learningMemory && window.learningMemory.registrarEvento) {
        window.learningMemory.registrarEvento('WORLD_PHYSICS_INIT', { timestamp: Date.now() });
    }

    const WorldPhysics = {
        gravity: 0.1,
        entities: [], // { id, x, y, vx, vy, onUpdate }
        map: null,

        // Inicializar con el mapa del laberinto
        init(mapData) {
            this.map = mapData;
            if (window.learningMemory && window.learningMemory.registrarEvento) {
                window.learningMemory.registrarEvento('WORLD_PHYSICS_MAP_LOADED', { sizeY: mapData.length, sizeX: mapData[0].length });
            }
        },

        addEntity(entity) {
            this.entities.push(entity);
            return entity.id;
        },

        removeEntity(entityId) {
            this.entities = this.entities.filter(e => e.id !== entityId);
        },

        // Actualiza posición y aplica gravedad y colisiones
        update() {
            this.entities.forEach(e => {
                // Física básica
                e.vy += this.gravity;
                e.x += e.vx;
                e.y += e.vy;

                // Colisión con paredes/piso
                if (this.checkCollision(e.x, e.y)) {
                    if (typeof e.onImpact === 'function') e.onImpact(e);
                }

                // Callback opcional
                if (typeof e.onUpdate === 'function') e.onUpdate(e);
            });
        },

        // Chequeo de colisión (1=wall) en grid
        checkCollision(x, y) {
            const tx = Math.floor(x / 64);
            const ty = Math.floor(y / 64);
            if (!this.map || ty < 0 || ty >= this.map.length || tx < 0 || tx >= this.map[0].length) return true;
            return this.map[ty][tx] === 1;
        },

        // Raycast nativo reutilizable
        raycast(angle, ox, oy) {
            if (typeof window.castRay === 'function') {
                return window.castRay(angle, ox, oy);
            }
            return null;
        }
    };

    // Exponer globalmente
    window.WorldPhysics = WorldPhysics;
})(window);
