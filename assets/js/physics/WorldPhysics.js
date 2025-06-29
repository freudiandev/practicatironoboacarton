// =============================================================================
// Módulo WorldPhysics: Gestiona la física del mundo independiente de la cámara
// =============================================================================
(function(window) {
    'use strict';

    // Registrar en learningMemory antes de iniciar
    if (window.learningMemory && window.learningMemory.registrarEvento) {
        window.learningMemory.registrarEvento('WORLD_PHYSICS_INIT', { timestamp: Date.now() });
    }

    // WorldPhysics desactivado: físicas y colisiones anuladas para evitar conflictos
    const WorldPhysics = {
        gravity: 0,
        entities: [],
        map: null,
        init(mapData) { this.map = mapData; },
        addEntity(entity) { return entity.id; },
        removeEntity(entityId) {},
        update() {},
        checkCollision(x, y) { return false; },
        raycast(angle, ox, oy) { if (typeof window.castRay === 'function') return window.castRay(angle, ox, oy); return null; }
    };

    // Exponer globalmente
    window.WorldPhysics = WorldPhysics;
})(window);
