// Sistema de Sprites para Enemigos - Noboa de Cartón
// Maneja la carga y renderizado de las imágenes de Noboa como sprites

class NoboaSpriteSystem {
  constructor() {
    this.sprites = new Map();
    this.loadingPromises = [];
    this.isLoaded = false;
    
    // Configuración de sprites de Noboa
    this.spriteConfig = {
      'presidencial': {
        path: 'assets/images/noboa-presidencial.png',
        description: 'Noboa en traje presidencial',
        scale: 1.0
      },
      'casual': {
        path: 'assets/images/noboa-casual.png',
        description: 'Noboa en ropa casual',
        scale: 1.1
      },
      'deportivo': {
        path: 'assets/images/noboa-deportivo.png',
        description: 'Noboa en ropa deportiva',
        scale: 0.9
      }
    };
    
    console.log('🖼️ Sistema de Sprites de Noboa inicializado');
    this.preloadSprites();
  }
  
  // Precargar todos los sprites
  async preloadSprites() {
    console.log('🔄 Precargando sprites de Noboa...');
    
    for (const [type, config] of Object.entries(this.spriteConfig)) {
      const promise = this.loadSprite(type, config.path);
      this.loadingPromises.push(promise);
    }
    
    try {
      await Promise.all(this.loadingPromises);
      this.isLoaded = true;
      console.log('✅ Todos los sprites de Noboa cargados');
      
      // Reportar éxito al sistema de memoria
      if (window.memorySystem) {
        window.memorySystem.reportSuccess('NOBOA_SPRITES', 'Sprites de enemigos cargados correctamente');
      }
      
    } catch (error) {
      console.error('❌ Error cargando sprites de Noboa:', error);
      
      // Reportar error al sistema de memoria
      if (window.memorySystem) {
        window.memorySystem.reportError('NOBOA_SPRITES', `Error cargando sprites: ${error.message}`);
      }
    }
  }
  
  // Cargar un sprite individual
  async loadSprite(type, path) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.sprites.set(type, {
          image: img,
          width: img.width,
          height: img.height,
          config: this.spriteConfig[type]
        });
        
        console.log(`✅ Sprite ${type} cargado: ${img.width}x${img.height}`);
        resolve(img);
      };
      
      img.onerror = () => {
        console.error(`❌ Error cargando sprite ${type} desde ${path}`);
        reject(new Error(`Failed to load sprite: ${path}`));
      };
      
      img.src = path;
    });
  }
  
  // Obtener sprite por tipo
  getSprite(type) {
    return this.sprites.get(type);
  }
  
  // Obtener sprite aleatorio
  getRandomSprite() {
    const types = Array.from(this.sprites.keys());
    if (types.length === 0) return null;
    
    const randomType = types[Math.floor(Math.random() * types.length)];
    return this.sprites.get(randomType);
  }
  
  // Renderizar sprite en el canvas
  renderSprite(ctx, spriteType, x, y, size = 64, distance = 1) {
    const sprite = this.getSprite(spriteType);
    if (!sprite) {
      // Fallback: dibujar un rectángulo de color si no hay sprite
      this.renderFallback(ctx, x, y, size);
      return;
    }
    
    try {
      const scale = sprite.config.scale || 1.0;
      const adjustedSize = size * scale;
      
      // Aplicar efecto de distancia (sprites más pequeños a mayor distancia)
      const distanceScale = Math.max(0.1, 1 / (distance * 0.01 + 1));
      const finalSize = adjustedSize * distanceScale;
      
      // Centrar el sprite
      const drawX = x - finalSize / 2;
      const drawY = y - finalSize / 2;
      
      // Renderizar con filtro de pixelado
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(sprite.image, drawX, drawY, finalSize, finalSize);
      ctx.imageSmoothingEnabled = true;
      
    } catch (error) {
      console.warn('⚠️ Error renderizando sprite:', error);
      this.renderFallback(ctx, x, y, size);
    }
  }
  
  // Renderizado de fallback cuando no hay sprite
  renderFallback(ctx, x, y, size) {
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(x - size/2, y - size/2, size, size);
    
    // Añadir una "cara" simple
    ctx.fillStyle = '#000';
    ctx.fillRect(x - size/4, y - size/3, size/8, size/8); // Ojo izquierdo
    ctx.fillRect(x + size/8, y - size/3, size/8, size/8); // Ojo derecho
    ctx.fillRect(x - size/6, y + size/6, size/3, size/12); // Boca
  }
  
  // Obtener información de sprites cargados
  getLoadedSprites() {
    const info = {
      total: this.sprites.size,
      loaded: this.isLoaded,
      types: Array.from(this.sprites.keys())
    };
    
    return info;
  }
  
  // Asignar sprite según tipo de enemigo
  getSpriteForEnemyType(enemyType) {
    const spriteMapping = {
      'basic': 'casual',
      'fast': 'deportivo',
      'strong': 'presidencial'
    };
    
    const spriteType = spriteMapping[enemyType] || 'casual';
    return this.getSprite(spriteType);
  }
}

// Integración con el sistema de enemigos existente
if (window.OptimizedEnemy) {
  // Añadir método para renderizar sprite al enemigo
  window.OptimizedEnemy.prototype.renderSprite = function(ctx, screenX, screenY, size, distance) {
    if (window.noboaSpriteSystem) {
      const spriteType = this.getSpriteType();
      window.noboaSpriteSystem.renderSprite(ctx, spriteType, screenX, screenY, size, distance);
    }
  };
  
  // Añadir método para obtener tipo de sprite
  window.OptimizedEnemy.prototype.getSpriteType = function() {
    const spriteMapping = {
      'basic': 'casual',
      'fast': 'deportivo', 
      'strong': 'presidencial'
    };
    
    return spriteMapping[this.type] || 'casual';
  };
}

// Crear instancia global del sistema de sprites
window.NoboaSpriteSystem = NoboaSpriteSystem;
window.noboaSpriteSystem = new NoboaSpriteSystem();

// Comando de consola para verificar sprites
window.checkSprites = function() {
  if (window.noboaSpriteSystem) {
    const info = window.noboaSpriteSystem.getLoadedSprites();
    console.log('🖼️ INFORMACIÓN DE SPRITES DE NOBOA');
    console.log('================================');
    console.log(`Total cargados: ${info.total}`);
    console.log(`Estado: ${info.loaded ? '✅ Completo' : '🔄 Cargando'}`);
    console.log(`Tipos disponibles: ${info.types.join(', ')}`);
    console.log('================================');
    return info;
  } else {
    console.log('❌ Sistema de sprites no disponible');
    return null;
  }
};

console.log('🖼️ Sistema de Sprites de Noboa cargado');
console.log('💡 Comando: checkSprites() - Ver estado de los sprites');
