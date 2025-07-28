/**
 * SISTEMA DE SPAWN INTELIGENTE
 * Gestión avanzada de aparición de jugadores y enemigos
 * Versión: 1.0.0
 */

(function(window) {
  'use strict';

  const SpawnManager = {
    version: '1.0.0',
    worldPhysics: null,
    cartographer: null,
    spawnHistory: [],
    
    /**
     * Inicializar el gestor de spawn
     */
    initialize() {
      this.worldPhysics = window.WorldPhysics;
      this.cartographer = window.MapCartographer;
      
      // Inicializar WorldPhysics si no está listo
      if (this.worldPhysics && typeof this.worldPhysics.init === 'function') {
        this.worldPhysics.init();
      }
      
      console.log('🎯 SpawnManager v1.0.0 inicializado');
      return true;
    },
    
    /**
     * Buscar posición segura para el jugador
     */
    buscarCeldaVacia() {
      console.log('🔍 === BÚSQUEDA DE SPAWN SEGURO ===');
      
      // Método 1: Usar WorldPhysics con cartografía
      if (this.worldPhysics && typeof this.worldPhysics.getSafeSpawnPosition === 'function') {
        const safePos = this.worldPhysics.getSafeSpawnPosition();
        if (safePos && this.validateSpawnPosition(safePos.x, safePos.y)) {
          console.log('✅ Spawn encontrado por WorldPhysics:', safePos);
          this.recordSpawn(safePos, 'worldphysics');
          return safePos;
        }
      }
      
      // Método 2: Usar cartógrafo directamente
      if (this.cartographer && typeof this.cartographer.getBestSpawnPosition === 'function') {
        const cartPos = this.cartographer.getBestSpawnPosition();
        if (cartPos && this.validateSpawnPosition(cartPos.x, cartPos.y)) {
          console.log('✅ Spawn encontrado por Cartógrafo:', cartPos);
          this.recordSpawn(cartPos, 'cartographer');
          return cartPos;
        }
      }
      
      // Método 3: Búsqueda manual inteligente
      const manualPos = this.findManualSafePosition();
      if (manualPos && this.validateSpawnPosition(manualPos.x, manualPos.y)) {
        console.log('✅ Spawn encontrado manualmente:', manualPos);
        this.recordSpawn(manualPos, 'manual');
        return manualPos;
      }
      
      // Método 4: Posiciones de emergencia predefinidas
      const emergencyPos = this.getEmergencyPosition();
      console.warn('⚠️ Usando posición de emergencia:', emergencyPos);
      this.recordSpawn(emergencyPos, 'emergency');
      return emergencyPos;
    },
    
    /**
     * Búsqueda manual de posición segura
     */
    findManualSafePosition() {
      if (!window.GAME || !window.GAME.mapaColisiones) {
        return null;
      }
      
      const mapa = window.GAME.mapaColisiones;
      const ancho = mapa[0] ? mapa[0].length : 0;
      const alto = mapa.length;
      
      // Buscar en zonas interiores primero
      const zones = this.defineSearchZones(ancho, alto);
      
      for (const zone of zones) {
        console.log(`🔍 Buscando en zona: ${zone.name}`);
        
        for (let y = zone.startY; y < zone.endY; y++) {
          for (let x = zone.startX; x < zone.endX; x++) {
            if (this.isCellUltraSafe(x, y, mapa, ancho, alto)) {
              return {
                x: x * 32 + 16,
                y: y * 32 + 16,
                gridX: x,
                gridY: y,
                zone: zone.name
              };
            }
          }
        }
      }
      
      return null;
    },
    
    /**
     * Definir zonas de búsqueda por prioridad
     */
    defineSearchZones(ancho, alto) {
      const centerX = Math.floor(ancho / 2);
      const centerY = Math.floor(alto / 2);
      
      return [
        // Zona 1: Centro del mapa
        {
          name: 'centro',
          startX: Math.floor(centerX - ancho * 0.1),
          endX: Math.floor(centerX + ancho * 0.1),
          startY: Math.floor(centerY - alto * 0.1),
          endY: Math.floor(centerY + alto * 0.1),
          priority: 10
        },
        // Zona 2: Centro expandido
        {
          name: 'centro-expandido',
          startX: Math.floor(centerX - ancho * 0.2),
          endX: Math.floor(centerX + ancho * 0.2),
          startY: Math.floor(centerY - alto * 0.2),
          endY: Math.floor(centerY + alto * 0.2),
          priority: 8
        },
        // Zona 3: Interior del mapa
        {
          name: 'interior',
          startX: Math.floor(ancho * 0.25),
          endX: Math.floor(ancho * 0.75),
          startY: Math.floor(alto * 0.25),
          endY: Math.floor(alto * 0.75),
          priority: 6
        },
        // Zona 4: Todo el mapa (menos bordes)
        {
          name: 'general',
          startX: 4,
          endX: ancho - 4,
          startY: 4,
          endY: alto - 4,
          priority: 4
        }
      ];
    },
    
    /**
     * Verificar si celda es ultra segura
     */
    isCellUltraSafe(x, y, mapa, ancho, alto) {
      const radius = 3; // Radio de seguridad
      
      // Verificar área 7x7 alrededor
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const checkX = x + dx;
          const checkY = y + dy;
          
          // Verificar límites
          if (checkX < 0 || checkY < 0 || checkX >= ancho || checkY >= alto) {
            return false;
          }
          
          // Verificar que esté libre
          if (mapa[checkY][checkX] === 1) {
            return false;
          }
        }
      }
      
      return true;
    },
    
    /**
     * Validar posición de spawn antes de usar
     */
    validateSpawnPosition(x, y) {
      // Verificar con WorldPhysics si está disponible
      if (this.worldPhysics && typeof this.worldPhysics.checkCollision === 'function') {
        if (this.worldPhysics.checkCollision(x, y)) {
          console.warn('❌ Posición de spawn rechazada por colisión:', x, y);
          return false;
        }
      }
      
      // Verificar que no esté demasiado cerca de spawns anteriores
      if (this.isTooCloseToRecentSpawns(x, y)) {
        console.warn('❌ Posición de spawn muy cercana a spawn anterior:', x, y);
        return false;
      }
      
      return true;
    },
    
    /**
     * Verificar distancia a spawns anteriores
     */
    isTooCloseToRecentSpawns(x, y) {
      const minDistance = 64; // Distancia mínima entre spawns
      const recentSpawns = this.spawnHistory.slice(-5); // Últimos 5 spawns
      
      for (const spawn of recentSpawns) {
        const distance = Math.sqrt(
          Math.pow(x - spawn.x, 2) + Math.pow(y - spawn.y, 2)
        );
        
        if (distance < minDistance) {
          return true;
        }
      }
      
      return false;
    },
    
    /**
     * Posiciones de emergencia predefinidas
     */
    getEmergencyPosition() {
      const emergencyPositions = [
        {x: 128, y: 128, name: 'esquina-superior-izquierda'},
        {x: 256, y: 128, name: 'superior-centro'},
        {x: 128, y: 256, name: 'izquierda-centro'},
        {x: 256, y: 256, name: 'centro-absoluto'},
        {x: 384, y: 256, name: 'derecha-centro'},
        {x: 256, y: 384, name: 'inferior-centro'},
        {x: 96, y: 96, name: 'fallback-absoluto'}
      ];
      
      // Intentar cada posición de emergencia
      for (const pos of emergencyPositions) {
        if (this.validateSpawnPosition(pos.x, pos.y)) {
          return pos;
        }
      }
      
      // Último recurso
      return emergencyPositions[emergencyPositions.length - 1];
    },
    
    /**
     * Registrar spawn en historial
     */
    recordSpawn(position, method) {
      this.spawnHistory.push({
        x: position.x,
        y: position.y,
        method: method,
        timestamp: Date.now(),
        validated: true
      });
      
      // Mantener solo los últimos 10 spawns
      if (this.spawnHistory.length > 10) {
        this.spawnHistory.shift();
      }
    },
    
    /**
     * Obtener posiciones para enemigos
     */
    getEnemySpawnPositions(count = 1) {
      const positions = [];
      
      // Usar cartógrafo si está disponible
      if (this.cartographer && typeof this.cartographer.getSpawnPositions === 'function') {
        const cartPositions = this.cartographer.getSpawnPositions(count * 2); // Pedir el doble para tener opciones
        
        for (let i = 0; i < Math.min(count, cartPositions.length); i++) {
          const pos = cartPositions[i];
          if (this.validateSpawnPosition(pos.x, pos.y)) {
            positions.push(pos);
          }
        }
      }
      
      // Completar con búsqueda manual si es necesario
      while (positions.length < count) {
        const pos = this.findManualSafePosition();
        if (pos && this.validateSpawnPosition(pos.x, pos.y)) {
          positions.push(pos);
        } else {
          // Usar posición de emergencia si no encuentra nada
          positions.push(this.getEmergencyPosition());
        }
      }
      
      return positions;
    },
    
    /**
     * Diagnosticar sistema de spawn
     */
    diagnosticar() {
      console.log('🔧 === DIAGNÓSTICO SPAWN MANAGER ===');
      console.log('WorldPhysics disponible:', !!this.worldPhysics);
      console.log('MapCartographer disponible:', !!this.cartographer);
      console.log('Spawns registrados:', this.spawnHistory.length);
      
      if (this.cartographer && typeof this.cartographer.getAnalysis === 'function') {
        const analysis = this.cartographer.getAnalysis();
        if (analysis) {
          console.log('Zonas de spawn disponibles:', analysis.safeSpawnZones.length);
          console.log('Áreas abiertas:', analysis.openAreas.length);
        }
      }
      
      // Probar posición actual
      const testPos = this.buscarCeldaVacia();
      console.log('Posición de prueba:', testPos);
      
      return {
        worldPhysics: !!this.worldPhysics,
        cartographer: !!this.cartographer,
        spawnHistory: this.spawnHistory.length,
        testPosition: testPos
      };
    }
  };

  // Exponer globalmente
  window.SpawnManager = SpawnManager;
  
  console.log('🎯 SpawnManager v1.0.0 cargado');

})(window);
