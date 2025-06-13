// Generador de sprites del juego
class SpriteSystem {
  constructor() {
    this.cache = new Map();
    this.loadedImages = new Map();
    this.loadingPromises = new Map();
    this.loadEnemySprites();
  }
  async loadEnemySprites() {
    console.log('🖼️ Cargando sprites de Noboa...');
    const spritePromises = CONFIG.enemy.sprites.map(async (src, index) => {
      try {
        const img = await this.loadImage(src);
        this.loadedImages.set(`enemy_${index}`, img);
        const variantNames = ['Presidencial', 'Deportivo', 'Casual'];
        console.log(`✅ Sprite cargado: Noboa ${variantNames[index]} (${src})`);
      } catch (error) {
        console.warn(`⚠️ Error cargando sprite ${src}, usando placeholder`);
        this.loadedImages.set(`enemy_${index}`, this.createEnemyPlaceholder(index + 1));
      }
    });

    await Promise.all(spritePromises);
    console.log('✅ Todos los sprites de Noboa cargados correctamente');
  }

  loadImage(src) {
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src);
    }

    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load ${src}`));
      img.src = src;
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  createEnemyPlaceholder(variant = 1, size = 64) {
    const cacheKey = `placeholder_${variant}_${size}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    const colors = ['#FF6600', '#0066FF', '#6600FF', '#FF0066'];
    const color = colors[variant - 1] || colors[0];
    
    // Cuerpo
    ctx.fillStyle = color;
    ctx.fillRect(size * 0.2, size * 0.3, size * 0.6, size * 0.6);
    
    // Cabeza (15% superior)
    ctx.fillStyle = '#FFCCAA';
    ctx.fillRect(size * 0.25, size * 0.1, size * 0.5, size * 0.2);
    
    // Zona de headshot visible
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 1;
    ctx.strokeRect(size * 0.25, size * 0.1, size * 0.5, size * 0.15);
    
    // Ojos
    ctx.fillStyle = '#000000';
    ctx.fillRect(size * 0.3, size * 0.13, size * 0.08, size * 0.06);
    ctx.fillRect(size * 0.62, size * 0.13, size * 0.08, size * 0.06);
    
    // Etiqueta
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${size * 0.15}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(`NOBOA ${variant}`, size * 0.5, size * 0.9);
    
    this.cache.set(cacheKey, canvas);
    return canvas;
  }

  getEnemySprite(variant = 0) {
    const imageKey = `enemy_${variant}`;
    if (this.loadedImages.has(imageKey)) {
      return this.loadedImages.get(imageKey);
    }
    
    // Fallback a placeholder
    return this.createEnemyPlaceholder(variant + 1);
  }

  createDeadSprite(size = 64) {
    const cacheKey = `dead_${size}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Cuerpo caído
    ctx.fillStyle = '#444444';
    ctx.fillRect(size * 0.1, size * 0.7, size * 0.8, size * 0.2);
    
    // Sangre
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.arc(size * 0.3, size * 0.75, size * 0.05, 0, Math.PI * 2);
    ctx.arc(size * 0.7, size * 0.78, size * 0.03, 0, Math.PI * 2);
    ctx.fill();
    
    // X en los ojos
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(size * 0.25, size * 0.3);
    ctx.lineTo(size * 0.35, size * 0.4);
    ctx.moveTo(size * 0.35, size * 0.3);
    ctx.lineTo(size * 0.25, size * 0.4);
    ctx.moveTo(size * 0.65, size * 0.3);
    ctx.lineTo(size * 0.75, size * 0.4);
    ctx.moveTo(size * 0.75, size * 0.3);
    ctx.lineTo(size * 0.65, size * 0.4);
    ctx.stroke();
    
    this.cache.set(cacheKey, canvas);
    return canvas;
  }

  // Método para limpiar cache si es necesario
  clearCache() {
    this.cache.clear();
  }
}

window.SpriteSystem = SpriteSystem;
