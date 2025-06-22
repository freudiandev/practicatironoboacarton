// Como un artista que pinta carteles especiales en las paredes de la cueva
class DecorativeSystem {
  constructor() {
    this.loadedImages = new Map(); // Como un álbum de fotos cargadas
    this.loadingPromises = new Map(); // Promesas de carga para evitar duplicados
    this.fallbackColors = new Map(); // Colores de respaldo si no carga la imagen
    
    this.initFallbackColors(); // Preparar colores de emergencia
    console.log('🎨 DecorativeSystem inicializado');
  }

  // Como tener colores de respaldo si las imágenes no cargan
  initFallbackColors() {
    this.fallbackColors.set(2, '#FF6B6B'); // Rojo para cartel de amenaza
    this.fallbackColors.set(3, '#4ECDC4'); // Verde azulado para propaganda
    this.fallbackColors.set(4, '#45B7D1'); // Azul para graffiti rebelde
    this.fallbackColors.set(5, '#FFA07A'); // Salmón para cartel wanted
    this.fallbackColors.set(6, '#98D8C8'); // Verde menta para símbolo resistencia
    this.fallbackColors.set(7, '#F7DC6F'); // Amarillo para mapa zona
    this.fallbackColors.set(8, '#BB8FCE'); // Morado para cartel peligro
    this.fallbackColors.set(9, '#85C1E9'); // Azul claro para mensaje secreto
  }
  // Como cargar una imagen desde el disco duro
  async loadImage(imageUrl) {
    console.log(`🖼️ Intentando cargar imagen: ${imageUrl}`);
    
    // Si ya la tenemos cargada, devolverla
    if (this.loadedImages.has(imageUrl)) {
      console.log(`✅ Imagen ya cargada: ${imageUrl}`);
      return this.loadedImages.get(imageUrl);
    }

    // Si ya la estamos cargando, esperar a que termine
    if (this.loadingPromises.has(imageUrl)) {
      console.log(`⏳ Esperando carga en progreso: ${imageUrl}`);
      return this.loadingPromises.get(imageUrl);
    }

    // Empezar a cargar la imagen nueva
    const loadingPromise = new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        console.log(`✅ Imagen decorativa cargada exitosamente: ${imageUrl} (${img.width}x${img.height})`);
        this.loadedImages.set(imageUrl, img);
        this.loadingPromises.delete(imageUrl);
        resolve(img);
      };
      
      img.onerror = (error) => {
        console.error(`❌ Error cargando imagen decorativa: ${imageUrl}`, error);
        this.loadingPromises.delete(imageUrl);
        reject(new Error(`No se pudo cargar: ${imageUrl}`));
      };
      
      img.src = imageUrl;
      console.log(`⬇️ Iniciando descarga: ${imageUrl}`);
    });

    this.loadingPromises.set(imageUrl, loadingPromise);
    return loadingPromise;
  }
  // Como preparar todas las imágenes decorativas del juego
  async preloadDecorativeImages() {
    console.log('🎨 Iniciando precarga de imágenes decorativas...');
    const decorativeElements = CONFIG.world.decorativeElements;
    const loadPromises = [];

    // Mostrar qué imágenes vamos a cargar
    for (const [elementType, config] of Object.entries(decorativeElements)) {
      console.log(`📋 Elemento ${elementType}: ${config.image} - ${config.description}`);
    }

    // Cargar todas las imágenes en paralelo
    for (const [elementType, config] of Object.entries(decorativeElements)) {
      if (config.image) {
        console.log(`⬇️ Cargando imagen para elemento ${elementType}: ${config.image}`);
        const promise = this.loadImage(config.image).catch(error => {
          console.warn(`⚠️ Fallo al cargar imagen para elemento ${elementType}:`, error);
          return null; // Continuar aunque falle
        });
        loadPromises.push(promise);
      }
    }

    // Esperar a que todas terminen (exitosas o no)
    const results = await Promise.allSettled(loadPromises);
    
    let loadedCount = 0;
    let failedCount = 0;
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        loadedCount++;
      } else {
        failedCount++;
      }
    });
    
    console.log(`🖼️ Precarga completada: ${loadedCount} exitosas, ${failedCount} fallidas`);
    console.log(`📊 Total imágenes cargadas en memoria: ${this.loadedImages.size}`);
    
    // Mostrar qué imágenes están disponibles
    for (const [url, img] of this.loadedImages.entries()) {
      console.log(`✅ Disponible: ${url} (${img.width}x${img.height})`);
    }
  }  // Como obtener la imagen o color para un tipo de elemento
  getDecorativeDisplay(elementType) {
    const config = CONFIG.world.decorativeElements[elementType];
    if (!config) {
      console.warn(`⚠️ No hay configuración para elemento decorativo ${elementType}`);
      return { type: 'color', value: '#8B4513' }; // Color marrón por defecto
    }

    // Intentar devolver la imagen si está cargada
    if (config.image) {
      const image = this.loadedImages.get(config.image);
      if (image) {
        return { type: 'image', value: image, description: config.description };
      }
    }

    // Si no hay imagen, usar color de respaldo
    const fallbackColor = this.fallbackColors.get(parseInt(elementType));
    return { 
      type: 'color', 
      value: fallbackColor || '#8B4513',
      description: config.description || `Elemento decorativo ${elementType}`
    };
  }

  // Como crear una imagen de respaldo si no hay archivo
  createPlaceholderImage(elementType, size = 64) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;

    // Fondo con color del elemento
    const color = this.fallbackColors.get(elementType) || '#8B4513';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);

    // Borde
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, size - 4, size - 4);

    // Número del elemento en el centro
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${size * 0.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(elementType.toString(), size / 2, size / 2);

    return canvas;
  }

  // Como verificar si todas las imágenes están listas
  areAllImagesLoaded() {
    const decorativeElements = CONFIG.world.decorativeElements;
    for (const [elementType, config] of Object.entries(decorativeElements)) {
      if (config.image && !this.loadedImages.has(config.image)) {
        return false;
      }
    }
    return true;
  }

  // Como obtener información de un elemento decorativo
  getElementInfo(elementType) {
    const config = CONFIG.world.decorativeElements[elementType];
    return config || { 
      name: `elemento_${elementType}`, 
      description: `Elemento decorativo ${elementType}`,
      image: null 
    };
  }
}

// Hacer el sistema disponible globalmente
window.DecorativeSystem = DecorativeSystem;
console.log('✅ DecorativeSystem cargado');
