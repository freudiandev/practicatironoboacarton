// Sistema de gestión de assets con JavaScript puro
window.AssetManager = {
  images: new Map(),
  loadingPromises: new Map(),
  loadedAssets: 0,
  totalAssets: 3,
  loadingComplete: false,
  
  // Configuración de assets
  ASSETS: {
    casual: 'noboa-casual.png',
    deportivo: 'noboa-deportivo.png',
    presidencial: 'noboa-presidencial.png'
  },
  
  init() {
    console.log('🎨 AssetManager inicializado (JavaScript puro)');
    this.loadedAssets = 0;
    this.loadingComplete = false;
    this.totalAssets = Object.keys(this.ASSETS).length;
  },
  
  async loadImage(name, path) {
    console.log(`📥 Intentando cargar imagen: ${name} desde ${path}`);
    
    if (this.images.has(name)) {
      console.log(`✅ ${name} ya está cargada`);
      return this.images.get(name);
    }
    
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name);
    }
    
    const promise = this.loadImageWithFallback(name, path);
    this.loadingPromises.set(name, promise);
    
    try {
      const image = await promise;
      this.images.set(name, image);
      this.loadingPromises.delete(name);
      this.loadedAssets++;
      
      console.log(`✅ ${name} disponible: ${image.width}x${image.height}`);
      return image;
    } catch (error) {
      console.error(`❌ Error cargando ${name}:`, error);
      this.loadingPromises.delete(name);
      this.loadedAssets++;
      throw error;
    }
  },
  
  async loadImageWithFallback(name, path) {
    try {
      // Intentar cargar imagen real
      const image = await this.loadImageNative(name, path);
      return image;
    } catch (error) {
      console.warn(`⚠️ No se pudo cargar ${name}, generando placeholder`);
      // Generar imagen placeholder
      return this.createPlaceholderImage(name);
    }
  },
  
  loadImageNative(key, path) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        console.log(`✅ ${key} cargado desde archivo: ${img.width}x${img.height}`);
        resolve(img);
      };
      
      img.onerror = (error) => {
        console.warn(`⚠️ No se encontró archivo ${key}: ${path}`);
        reject(error);
      };
      
      img.crossOrigin = 'anonymous';
      img.src = path;
      
      // Timeout más corto
      setTimeout(() => {
        if (img.width === 0) {
          console.warn(`⏰ Timeout para ${key} - usando fallback`);
          reject(new Error(`Timeout loading ${key}`));
        }
      }, 2000);
    });
  },
  
  createPlaceholderImage(name) {
    console.log(`🎨 Generando imagen placeholder para ${name}`);
    
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Colores según el tipo
    let color;
    switch (name) {
      case 'casual':
        color = '#ff6b6b'; // Rojo
        break;
      case 'deportivo':
        color = '#4ecdc4'; // Verde azulado
        break;
      case 'presidencial':
        color = '#45b7d1'; // Azul
        break;
      default:
        color = '#95a5a6'; // Gris
    }
    
    // Dibujar círculo con borde
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(32, 32, 25, 0, 2 * Math.PI);
    ctx.fill();
    
    // Borde negro
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Texto identificativo
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(name.charAt(0).toUpperCase(), 32, 37);
    
    // Convertir canvas a imagen
    const img = new Image();
    img.src = canvas.toDataURL();
    img.width = 64;
    img.height = 64;
    
    console.log(`✅ Placeholder generado para ${name}`);
    return img;
  },
  
  async forcePreload() {
    console.log('🚀 === PRECARGA CON FALLBACKS INICIADA ===');
    
    const imageList = [
      { name: 'casual', path: this.ASSETS.casual },
      { name: 'deportivo', path: this.ASSETS.deportivo },
      { name: 'presidencial', path: this.ASSETS.presidencial }
    ];
    
    // Cargar todas las imágenes (con fallbacks)
    for (const { name, path } of imageList) {
      try {
        await this.loadImage(name, path);
      } catch (error) {
        // Error ya manejado en loadImage
        console.warn(`⚠️ Continuando sin ${name}`);
      }
    }
    
    this.loadingComplete = true;
    console.log('🎉 PRECARGA COMPLETADA (con placeholders si es necesario)');
    this.reportStatus();
  },
  
  // Método SÍNCRONO para verificar si las imágenes están listas
  areImagesReady() {
    return this.loadingComplete && this.loadedAssets >= this.totalAssets;
  },
  
  // Método para obtener imagen con garantía de disponibilidad
  getImageReady(type) {
    if (!this.areImagesReady()) {
      console.warn(`⚠️ Imágenes no están listas, usando fallback para ${type}`);
      return null;
    }
    
    const image = this.getImage(type);
    if (image && image.width > 0) {
      return image;
    }
    
    return null;
  },
  
  getImage(name) {
    const image = this.images.get(name);
    if (!image) {
      console.warn(`⚠️ Imagen '${name}' no encontrada en AssetManager`);
      return null;
    }
    return image;
  },
  
  reportStatus() {
    console.log('📊 === REPORTE FINAL DE IMÁGENES ===');
    
    if (this.images.size === 0) {
      console.log('❌ No hay imágenes cargadas');
      return 0;
    }
    
    let workingCount = 0;
    Object.keys(this.ASSETS).forEach(key => {
      const img = this.getImage(key);
      if (img && img.width > 0) {
        console.log(`✅ ${key}: ${img.width}x${img.height} DISPONIBLE`);
        workingCount++;
      } else {
        console.log(`❌ ${key}: NO DISPONIBLE`);
      }
    });
    
    console.log(`📊 Total funcionando: ${workingCount}/${this.totalAssets}`);
    
    if (workingCount === 0) {
      console.warn('🚨 === DIAGNÓSTICO DE ARCHIVOS ===');
      console.warn('Verifica que estos archivos existan:');
      Object.values(this.ASSETS).forEach(path => {
        console.warn(`📁 ${path}`);
      });
      console.warn('En la carpeta raíz del proyecto (mismo nivel que index.html)');
    }
    
    return workingCount;
  },
  
  // FUNCIÓN FALTANTE - checkImageStatus (alias de reportStatus)
  checkImageStatus() {
    return this.reportStatus();
  },
  
  // Función para forzar recarga
  forceReload() {
    console.log('🔄 Forzando recarga de imágenes...');
    this.loadedAssets = 0;
    this.loadingComplete = false;
    this.images.clear();
    this.loadingPromises.clear();
    
    // Reiniciar carga
    setTimeout(() => {
      this.forcePreload();
    }, 100);
  },
  
  // Función de emergencia para verificar archivos
  testImagePaths() {
    console.log('🔍 === PRUEBA DE RUTAS DE IMÁGENES ===');
    
    Object.keys(this.ASSETS).forEach(key => {
      const path = this.ASSETS[key];
      const testImg = new Image();
      
      testImg.onload = () => {
        console.log(`✅ RUTA VÁLIDA: ${path}`);
      };
      
      testImg.onerror = () => {
        console.error(`❌ RUTA INVÁLIDA: ${path}`);
        console.log(`   Verifica que ${path} existe en la carpeta raíz`);
      };
      
      testImg.src = path;
    });
  }
};

console.log('🎨 AssetManager (JavaScript puro) cargado y disponible');