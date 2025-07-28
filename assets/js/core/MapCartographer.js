/**
 * SISTEMA DE CARTOGRAFÍA AVANZADA
 * Sistema completo de análisis y mapeo del laberinto para WorldPhysics
 * Versión: 1.0.0
 */

(function(window) {
  'use strict';

  const MapCartographer = {
    version: '1.0.0',
    mapData: null,
    analysis: null,
    
    /**
     * Inicializar el cartógrafo con datos del mapa
     */
    initialize(mapaColisiones) {
      if (!mapaColisiones || !Array.isArray(mapaColisiones)) {
        console.error('🗺️ MapCartographer: Datos de mapa inválidos');
        return false;
      }
      
      this.mapData = {
        grid: mapaColisiones,
        width: mapaColisiones[0] ? mapaColisiones[0].length : 0,
        height: mapaColisiones.length,
        cellSize: 32
      };
      
      console.log(`🗺️ MapCartographer: Mapa cargado - ${this.mapData.width}x${this.mapData.height} celdas`);
      this.analyzeMap();
      return true;
    },
    
    /**
     * Análisis completo del mapa
     */
    analyzeMap() {
      if (!this.mapData) return;
      
      console.log('🔍 Analizando cartografía del mapa...');
      
      this.analysis = {
        // Estadísticas básicas
        totalCells: this.mapData.width * this.mapData.height,
        wallCells: 0,
        emptyCells: 0,
        
        // Análisis de espacios
        openAreas: [],
        corridors: [],
        deadEnds: [],
        intersections: [],
        
        // Zonas de spawn
        safeSpawnZones: [],
        centerArea: null,
        borderSafeZones: [],
        
        // Límites y bordes
        boundaries: this.analyzeBoundaries(),
        
        // Rutas y caminos
        mainPaths: [],
        isolatedAreas: []
      };
      
      this.findCellTypes();
      this.findOpenAreas();
      this.findSafeSpawnZones();
      this.findPaths();
      this.generateReport();
    },
    
    /**
     * Analizar límites del mapa
     */
    analyzeBoundaries() {
      const boundaries = {
        top: [],
        bottom: [],
        left: [],
        right: [],
        internal: []
      };
      
      for (let y = 0; y < this.mapData.height; y++) {
        for (let x = 0; x < this.mapData.width; x++) {
          if (this.mapData.grid[y][x] === 1) {
            // Clasificar tipo de pared
            if (y === 0) boundaries.top.push({x, y});
            if (y === this.mapData.height - 1) boundaries.bottom.push({x, y});
            if (x === 0) boundaries.left.push({x, y});
            if (x === this.mapData.width - 1) boundaries.right.push({x, y});
            
            if (x > 0 && x < this.mapData.width - 1 && y > 0 && y < this.mapData.height - 1) {
              boundaries.internal.push({x, y});
            }
          }
        }
      }
      
      return boundaries;
    },
    
    /**
     * Clasificar tipos de celdas
     */
    findCellTypes() {
      for (let y = 0; y < this.mapData.height; y++) {
        for (let x = 0; x < this.mapData.width; x++) {
          if (this.mapData.grid[y][x] === 1) {
            this.analysis.wallCells++;
          } else {
            this.analysis.emptyCells++;
            this.classifyEmptyCell(x, y);
          }
        }
      }
    },
    
    /**
     * Clasificar celda vacía según su entorno
     */
    classifyEmptyCell(x, y) {
      const neighbors = this.getNeighbors(x, y);
      const emptyNeighbors = neighbors.filter(n => this.isCellEmpty(n.x, n.y)).length;
      
      if (emptyNeighbors <= 1) {
        this.analysis.deadEnds.push({x, y, neighbors: emptyNeighbors});
      } else if (emptyNeighbors === 2) {
        this.analysis.corridors.push({x, y});
      } else if (emptyNeighbors >= 3) {
        this.analysis.intersections.push({x, y, connections: emptyNeighbors});
      }
    },
    
    /**
     * Encontrar áreas abiertas grandes
     */
    findOpenAreas() {
      const visited = new Set();
      
      for (let y = 1; y < this.mapData.height - 1; y++) {
        for (let x = 1; x < this.mapData.width - 1; x++) {
          const key = `${x},${y}`;
          if (!visited.has(key) && this.isCellEmpty(x, y)) {
            const area = this.floodFillArea(x, y, visited);
            if (area.size >= 9) { // Áreas de al menos 3x3
              this.analysis.openAreas.push({
                startX: x, startY: y,
                size: area.size,
                cells: Array.from(area),
                center: this.calculateAreaCenter(area)
              });
            }
          }
        }
      }
      
      // Ordenar por tamaño
      this.analysis.openAreas.sort((a, b) => b.size - a.size);
    },
    
    /**
     * Encontrar zonas seguras para spawn
     */
    findSafeSpawnZones() {
      // Zona central del mapa
      const centerX = Math.floor(this.mapData.width / 2);
      const centerY = Math.floor(this.mapData.height / 2);
      
      this.analysis.centerArea = {
        x: centerX,
        y: centerY,
        safety: this.calculateSafety(centerX, centerY, 3)
      };
      
      // Buscar zonas ultra seguras (7x7 libres)
      for (let y = 3; y < this.mapData.height - 3; y++) {
        for (let x = 3; x < this.mapData.width - 3; x++) {
          if (this.isAreaSafe(x, y, 3)) {
            const distanceToCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            this.analysis.safeSpawnZones.push({
              x, y,
              worldX: x * 32 + 16,
              worldY: y * 32 + 16,
              safetyRadius: 3,
              distanceToCenter,
              priority: 100 - distanceToCenter
            });
          }
        }
      }
      
      // Ordenar por prioridad (más cerca del centro = mejor)
      this.analysis.safeSpawnZones.sort((a, b) => b.priority - a.priority);
    },
    
    /**
     * Encontrar rutas principales
     */
    findPaths() {
      // Conectar intersecciones principales
      const mainIntersections = this.analysis.intersections
        .filter(i => i.connections >= 3)
        .slice(0, 10);
        
      this.analysis.mainPaths = mainIntersections.map(intersection => ({
        x: intersection.x,
        y: intersection.y,
        connections: intersection.connections,
        routes: this.findRoutesFrom(intersection.x, intersection.y)
      }));
    },
    
    /**
     * Verificar si un área es segura para spawn
     */
    isAreaSafe(centerX, centerY, radius) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const x = centerX + dx;
          const y = centerY + dy;
          if (!this.isCellEmpty(x, y)) {
            return false;
          }
        }
      }
      return true;
    },
    
    /**
     * Calcular nivel de seguridad de una posición
     */
    calculateSafety(x, y, checkRadius) {
      let safetyScore = 0;
      let totalChecked = 0;
      
      for (let dy = -checkRadius; dy <= checkRadius; dy++) {
        for (let dx = -checkRadius; dx <= checkRadius; dx++) {
          const checkX = x + dx;
          const checkY = y + dy;
          totalChecked++;
          
          if (this.isCellEmpty(checkX, checkY)) {
            safetyScore++;
          }
        }
      }
      
      return safetyScore / totalChecked;
    },
    
    /**
     * Flood fill para encontrar áreas conectadas
     */
    floodFillArea(startX, startY, visited) {
      const area = new Set();
      const stack = [{x: startX, y: startY}];
      
      while (stack.length > 0) {
        const {x, y} = stack.pop();
        const key = `${x},${y}`;
        
        if (visited.has(key) || !this.isCellEmpty(x, y)) continue;
        
        visited.add(key);
        area.add(key);
        
        // Agregar vecinos
        this.getNeighbors(x, y).forEach(neighbor => {
          const neighborKey = `${neighbor.x},${neighbor.y}`;
          if (!visited.has(neighborKey)) {
            stack.push(neighbor);
          }
        });
      }
      
      return area;
    },
    
    /**
     * Obtener vecinos de una celda
     */
    getNeighbors(x, y) {
      return [
        {x: x-1, y}, {x: x+1, y},
        {x, y: y-1}, {x, y: y+1}
      ].filter(n => 
        n.x >= 0 && n.x < this.mapData.width && 
        n.y >= 0 && n.y < this.mapData.height
      );
    },
    
    /**
     * Verificar si celda está vacía
     */
    isCellEmpty(x, y) {
      if (x < 0 || y < 0 || x >= this.mapData.width || y >= this.mapData.height) {
        return false;
      }
      return this.mapData.grid[y][x] === 0;
    },
    
    /**
     * Calcular centro de un área
     */
    calculateAreaCenter(area) {
      let sumX = 0, sumY = 0;
      area.forEach(cell => {
        const [x, y] = cell.split(',').map(Number);
        sumX += x;
        sumY += y;
      });
      
      return {
        x: Math.round(sumX / area.size),
        y: Math.round(sumY / area.size)
      };
    },
    
    /**
     * Encontrar rutas desde una posición
     */
    findRoutesFrom(x, y) {
      const routes = [];
      const directions = [
        {dx: 0, dy: -1, name: 'norte'},
        {dx: 1, dy: 0, name: 'este'},
        {dx: 0, dy: 1, name: 'sur'},
        {dx: -1, dy: 0, name: 'oeste'}
      ];
      
      directions.forEach(dir => {
        let steps = 0;
        let currentX = x + dir.dx;
        let currentY = y + dir.dy;
        
        while (this.isCellEmpty(currentX, currentY) && steps < 20) {
          steps++;
          currentX += dir.dx;
          currentY += dir.dy;
        }
        
        if (steps > 2) {
          routes.push({
            direction: dir.name,
            length: steps,
            endX: currentX - dir.dx,
            endY: currentY - dir.dy
          });
        }
      });
      
      return routes;
    },
    
    /**
     * Generar reporte completo
     */
    generateReport() {
      console.log('📊 === REPORTE DE CARTOGRAFÍA COMPLETO ===');
      console.log(`🗺️ Dimensiones: ${this.mapData.width} x ${this.mapData.height} (${this.analysis.totalCells} celdas)`);
      console.log(`🧱 Paredes: ${this.analysis.wallCells} (${(this.analysis.wallCells/this.analysis.totalCells*100).toFixed(1)}%)`);
      console.log(`⬜ Espacios libres: ${this.analysis.emptyCells} (${(this.analysis.emptyCells/this.analysis.totalCells*100).toFixed(1)}%)`);
      console.log(`🏠 Áreas abiertas: ${this.analysis.openAreas.length}`);
      console.log(`🛡️ Zonas de spawn seguras: ${this.analysis.safeSpawnZones.length}`);
      console.log(`🔗 Intersecciones: ${this.analysis.intersections.length}`);
      console.log(`📍 Callejones sin salida: ${this.analysis.deadEnds.length}`);
      console.log(`🛤️ Corredores: ${this.analysis.corridors.length}`);
      
      if (this.analysis.safeSpawnZones.length > 0) {
        const bestSpawn = this.analysis.safeSpawnZones[0];
        console.log(`🎯 Mejor zona de spawn: (${bestSpawn.x}, ${bestSpawn.y}) - Mundo: (${bestSpawn.worldX}, ${bestSpawn.worldY})`);
      }
      
      return this.analysis;
    },
    
    /**
     * API: Obtener mejor posición de spawn
     */
    getBestSpawnPosition() {
      if (!this.analysis || this.analysis.safeSpawnZones.length === 0) {
        console.warn('🗺️ No hay zonas de spawn seguras. Usando posición por defecto.');
        return {x: 96, y: 96};
      }
      
      const bestZone = this.analysis.safeSpawnZones[0];
      return {
        x: bestZone.worldX,
        y: bestZone.worldY,
        gridX: bestZone.x,
        gridY: bestZone.y,
        safety: bestZone.priority
      };
    },
    
    /**
     * API: Obtener múltiples posiciones de spawn
     */
    getSpawnPositions(count = 5) {
      if (!this.analysis) return [];
      
      return this.analysis.safeSpawnZones
        .slice(0, count)
        .map(zone => ({
          x: zone.worldX,
          y: zone.worldY,
          gridX: zone.x,
          gridY: zone.y,
          safety: zone.priority
        }));
    },
    
    /**
     * API: Verificar si posición es segura
     */
    isPositionSafe(worldX, worldY, safetyRadius = 2) {
      if (!this.mapData) return false;
      
      const gridX = Math.floor(worldX / 32);
      const gridY = Math.floor(worldY / 32);
      
      return this.isAreaSafe(gridX, gridY, safetyRadius);
    },
    
    /**
     * API: Obtener análisis completo
     */
    getAnalysis() {
      return this.analysis;
    }
  };

  // Exponer globalmente
  window.MapCartographer = MapCartographer;
  
  console.log('🗺️ MapCartographer v1.0.0 cargado');

})(window);
