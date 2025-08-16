/**
 * Sprite Manager - Sistema de gestión de sprites con proporciones correctas
 * Versión: 1.0.0
 * Gestiona la carga, redimensionamiento y renderizado de sprites de enemigos
 */

const SpriteManager = {
  // Almacenamiento de sprites procesados
  sprites: {
    enemies: {
      casual: null,
      deportivo: null,
      presidencial: null
    }
  },
  
  // Configuración de proporciones
  config: {
    // Proporción humana estándar (altura:anchura)
    humanRatio: 2.5, // Una persona es aproximadamente 2.5 veces más alta que ancha
    // Tamaño base en unidades del juego
    baseWidth: 0.6,
    baseHeight: 1.8
  },
  
  /**
   * Inicializa el gestor de sprites
   * @param {Function} callback - Función a llamar cuando todos los sprites estén cargados
   */
  init(callback) {
    console.log('🖼️ Inicializando Sprite Manager...');
    this.loadEnemySprites(callback);
  },
  
  /**
   * Carga todos los sprites de enemigos con proporciones correctas
   * @param {Function} callback - Función a llamar cuando todos los sprites estén cargados
   */
  loadEnemySprites(callback) {
    const enemyTypes = ['casual', 'deportivo', 'presidencial'];
    let loadedCount = 0;
    
    enemyTypes.forEach(type => {
      const img = new Image();
      img.onload = () => {
        // Procesamos la imagen para asegurar proporciones correctas
        this.sprites.enemies[type] = this.processEnemySprite(img, type);
        
        loadedCount++;
        console.log(`✅ Sprite de enemigo "${type}" cargado y procesado`);
        
        if (loadedCount === enemyTypes.length) {
          console.log('✅ Todos los sprites de enemigos están listos');
          if (typeof callback === 'function') callback();
        }
      };
      
      img.onerror = () => {
        console.error(`❌ Error al cargar sprite de enemigo "${type}"`);
        loadedCount++;
        
        // Crear un sprite de respaldo para no bloquear el juego
        this.sprites.enemies[type] = this.createFallbackSprite(type);
        
        if (loadedCount === enemyTypes.length && typeof callback === 'function') {
          callback();
        }
      };
      
      // Ruta a la imagen
      img.src = `assets/images/noboa-${type}.png`;
    });
  },
  
  /**
   * Procesa un sprite de enemigo para asegurar proporciones humanas realistas
   * @param {HTMLImageElement} img - La imagen cargada
   * @param {string} type - El tipo de enemigo
   * @returns {HTMLCanvasElement} Canvas con el sprite procesado
   */
  processEnemySprite(img, type) {
    // Creamos un canvas temporal para procesar la imagen
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Calculamos las proporciones correctas
    const aspectRatio = img.height / img.width;
    const targetRatio = this.config.humanRatio;
    
    // Establecemos el tamaño del canvas
    canvas.width = 256;
    canvas.height = 256 * targetRatio;
    
    // Limpiamos el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Ajustamos la imagen según el tipo de enemigo
    if (type === 'casual') {
      // Para casual, recortamos un poco los laterales si es muy ancho
      ctx.drawImage(img, 0, 0, img.width, img.height, 
                   canvas.width * 0.1, 0, canvas.width * 0.8, canvas.height);
    } else if (type === 'deportivo') {
      // Para deportivo, mantenemos proporciones atléticas
      ctx.drawImage(img, 0, 0, img.width, img.height,
                   canvas.width * 0.15, 0, canvas.width * 0.7, canvas.height);
    } else {
      // Para presidencial, aspecto más formal y proporcionado
      ctx.drawImage(img, 0, 0, img.width, img.height,
                   canvas.width * 0.05, 0, canvas.width * 0.9, canvas.height);
    }
    
    console.log(`🔄 Sprite "${type}" procesado con proporción ${targetRatio.toFixed(2)}`);
    return canvas;
  },
  
  /**
   * Crea un sprite de respaldo en caso de error
   * @param {string} type - El tipo de enemigo
   * @returns {HTMLCanvasElement} Canvas con sprite de respaldo
   */
  createFallbackSprite(type) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 128;
    canvas.height = 256;
    
    // Color según tipo
    let color;
    switch(type) {
      case 'casual': color = '#ff6b6b'; break;
      case 'deportivo': color = '#4ecdc4'; break;
      case 'presidencial': 
      default: color = '#ffe66d'; break;
    }
    
    // Dibujar silueta humana básica
    ctx.fillStyle = color;
    
    // Cabeza
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height*0.15, canvas.width*0.25, 0, Math.PI * 2);
    ctx.fill();
    
    // Cuerpo
    ctx.fillRect(
      canvas.width * 0.3, 
      canvas.height * 0.25, 
      canvas.width * 0.4, 
      canvas.height * 0.45
    );
    
    // Piernas
    ctx.fillRect(
      canvas.width * 0.35, 
      canvas.height * 0.7, 
      canvas.width * 0.1, 
      canvas.height * 0.3
    );
    ctx.fillRect(
      canvas.width * 0.55, 
      canvas.height * 0.7, 
      canvas.width * 0.1, 
      canvas.height * 0.3
    );
    
    // Brazos
    ctx.fillRect(
      canvas.width * 0.15, 
      canvas.height * 0.3, 
      canvas.width * 0.15, 
      canvas.height * 0.3
    );
    ctx.fillRect(
      canvas.width * 0.7, 
      canvas.height * 0.3, 
      canvas.width * 0.15, 
      canvas.height * 0.3
    );
    
    // Texto de tipo
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(type.toUpperCase(), canvas.width/2, canvas.height*0.95);
    
    return canvas;
  },
  
  /**
   * Renderiza un sprite de enemigo en el canvas del juego
   * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
   * @param {string} type - Tipo de enemigo
   * @param {number} x - Posición X
   * @param {number} y - Posición Y
   * @param {number} width - Ancho a renderizar
   * @param {number} height - Alto a renderizar
   */
  renderEnemySprite(ctx, type, x, y, width, height) {
    const sprite = this.sprites.enemies[type] || this.sprites.enemies.casual;
    
    if (!sprite) {
      // Si no hay sprite, dibujamos un placeholder
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(x, y, width, height);
      return;
    }
    
    // Renderizar sprite con proporciones correctas
    ctx.drawImage(sprite, x, y, width, height);
  }
};

// Registrar en window para acceso global
window.SpriteManager = SpriteManager;

console.log('📚 SpriteManager cargado correctamente');
