/**
 * DOOM: Sistema Avanzado de Sprites Enemigos (VERSIÓN MEJORADA)
 * Versión: 1.1.0
 * 
 * Sistema mejorado que se encarga de cargar, procesar y renderizar sprites de enemigos
 * con proporciones humanas realistas.
 */

// Constantes de configuración
const SPRITE_CONFIG = {
  // Proporciones humanas reales
  HUMAN_RATIO: 2.5,        // Relación altura/anchura para una persona
  HUMAN_WIDTH: 0.5,         // Ancho de persona en unidades del juego
  HUMAN_HEIGHT: 1.75,       // Altura estándar en unidades del juego (1.75m)
  
  // Configuración visual
  // Distancia máxima de renderizado en "celdas" (tiles) del mapa
  // En este juego, las posiciones están en píxeles; convertiremos a tiles usando cellSize
  MAX_RENDER_DISTANCE: 24,
  SPRITE_QUALITY: 'high',   // Calidad de renderizado (high/medium/low)
  
  // Tipos de enemigos y sus características
  ENEMY_TYPES: {
    'casual': {
      spriteUrl: 'noboa-casual.png',
      width: 0.5,           // Ancho relativo (multiplicador)
      height: 1.0,          // Altura relativa (multiplicador)
      walkSpeed: 1.0        // Velocidad relativa
    },
    'deportivo': {
      spriteUrl: 'noboa-deportivo.png',
      width: 0.45,          // Más delgado por ser deportista
      height: 1.05,         // Ligeramente más alto
      walkSpeed: 1.2        // Más rápido
    },
    'presidencial': {
      spriteUrl: 'noboa-presidencial.png',
      width: 0.55,          // Más ancho por el traje
      height: 1.0,          // Altura estándar
      walkSpeed: 0.9        // Más lento por ser formal
    }
  }
};

// Sistema de gestión de sprites
const SpriteSystem = {
  // Almacenamiento de sprites procesados
  sprites: {
    casual: null,
    deportivo: null,
    presidencial: null
  },
  
  // Mensajes de debug
  debug: true,              // Activar/desactivar mensajes de debug
  
  // Estado de carga
  loading: true,
  loadedCount: 0,
  totalSprites: 3,
  
  // Registro de errores
  errors: [],
  
  // Prefijos de ruta para buscar imágenes
  pathPrefixes: [
    '',                    // Raíz del proyecto
    'assets/images/',
    'assets/img/',
    'img/',
    'images/',
    'assets/',
    './'                   // Directorio actual
  ],

  // Intenta reemplazar cualquier sprite de respaldo con PNG real desde preload
  hydrateFromPreloads() {
    try {
      const tryOne = (type) => {
        if (this.sprites[type] && !this.sprites[type].__isFallback) return false;
        // Preferir variable global creada por index.html
        const g = window[`preloaded_${type}`];
        const byId = document.getElementById(`preload-${type}`);
        const byId2 = document.getElementById(`preload-${type}-2`);
        const byId3 = document.getElementById(`preload-${type}-3`);
        const candidate = (g && g.naturalWidth > 0 && g) || (byId && byId.complete && byId.naturalWidth > 0 && byId) || (byId2 && byId2.complete && byId2.naturalWidth > 0 && byId2) || (byId3 && byId3.complete && byId3.naturalWidth > 0 && byId3) || null;
        if (candidate) {
          this.sprites[type] = this.processSprite(candidate, type);
          this.loadedCount = Math.max(this.loadedCount, Object.values(this.sprites).filter(s=>s).length);
          this.logSuccess(`Reemplazado fallback de '${type}' con PNG precargado`);
          return true;
        }
        return false;
      };
      let replaced = false;
      Object.keys(SPRITE_CONFIG.ENEMY_TYPES).forEach(t => { replaced = tryOne(t) || replaced; });
      if (replaced) {
        this.loading = Object.values(this.sprites).filter(s=>s && !s.__isFallback).length < this.totalSprites;
      }
      return replaced;
    } catch (e) {
      this.logWarning('hydrateFromPreloads error: ' + e.message);
      return false;
    }
  },
  
  /**
   * Precarga imágenes y encuentra la ruta correcta antes de inicializar
   * @param {function} callback - Función a ejecutar después de la precarga
   */
  preloadImages(callback) {
    this.logInfo('🔍 Precargando imágenes para encontrar la ruta correcta...');
    
    // Lista de todas las posibles rutas a probar
    let allPaths = [];
    
    // Generar todas las posibles rutas
    Object.keys(SPRITE_CONFIG.ENEMY_TYPES).forEach(type => {
      const config = SPRITE_CONFIG.ENEMY_TYPES[type];
      
      this.pathPrefixes.forEach(prefix => {
        allPaths.push({
          type: type,
          path: prefix + config.spriteUrl
        });
      });
    });
    
    this.logInfo(`Probando ${allPaths.length} posibles rutas para las imágenes...`);
    
    // Función para probar una ruta específica
    const testPath = (pathInfo) => {
      return new Promise((resolve) => {
        const img = new Image();
        
        img.onload = () => {
          this.logSuccess(`✅ Encontrada imagen ${pathInfo.type} en: ${pathInfo.path}`);
          resolve({
            success: true,
            type: pathInfo.type,
            path: pathInfo.path,
            img: img
          });
        };
        
        img.onerror = () => {
          resolve({
            success: false,
            type: pathInfo.type,
            path: pathInfo.path
          });
        };
        
        img.src = pathInfo.path;
      });
    };
    
    // Probar todas las rutas en paralelo
    Promise.all(allPaths.map(testPath))
      .then(results => {
        // Filtrar resultados exitosos
        const successfulPaths = results.filter(r => r.success);
        
        if (successfulPaths.length > 0) {
          this.logSuccess(`✅ Se encontraron ${successfulPaths.length} imágenes válidas`);
          
          // Actualizar las rutas en la configuración
          successfulPaths.forEach(result => {
            // Extraer el prefijo de la ruta
            const path = result.path;
            const fileName = SPRITE_CONFIG.ENEMY_TYPES[result.type].spriteUrl;
            const prefix = path.substring(0, path.length - fileName.length);
            
            // Actualizar la ruta preferida
            this.pathPrefixes = [prefix, ...this.pathPrefixes];
            
            // Usar la imagen precargada
            this.sprites[result.type] = this.processSprite(result.img, result.type);
            this.loadedCount++;
            
            // Registrar en consola con estilo destacado
            console.log(`%c ✅ SPRITE ENCONTRADO: ${path} `, 'background: #080; color: white; font-size: 14px; padding: 5px;');
          });
          
          // Mostrar información detallada de los sprites cargados
          console.log('%c 🔍 SPRITES CARGADOS: ', 'background: #080; color: white; font-size: 14px; padding: 5px;');
          Object.keys(this.sprites).forEach(type => {
            if (this.sprites[type]) {
              console.log(`%c ✅ SPRITE ${type.toUpperCase()} CARGADO `, 'background: #084; color: white; font-size: 12px; padding: 3px;');
            } else {
              console.log(`%c ❌ SPRITE ${type.toUpperCase()} NO CARGADO `, 'background: #840; color: white; font-size: 12px; padding: 3px;');
            }
          });
          
          // Si encontramos todos los sprites, actualizar estado
          if (this.loadedCount === this.totalSprites) {
            this.logSuccess('✅ Todos los sprites precargados con éxito');
            this.loading = false;
          }
        } else {
          this.logWarning('⚠️ No se encontró ninguna imagen válida durante la precarga');
        }
        
        // Continuar con la inicialización normal
        if (typeof callback === 'function') callback();
      });
  },
  
  /**
   * Inicializa el sistema de sprites
   * @param {function} callback - Función a ejecutar cuando todos los sprites estén cargados
   */
  init(callback) {
    this.logInfo('🖼️ Inicializando sistema de sprites con proporciones humanas reales...');
    
    // Añadir mensaje destacado en consola
    console.log('%c 🚀 INICIANDO SISTEMA DE SPRITES AVANZADO ', 'background: #00a; color: white; font-size: 16px; padding: 5px;');
    
    // Limpiar errores previos
    this.errors = [];
    
    // Verificar la existencia del objeto DoomGame
    if (!window.DoomGame) {
      this.logError('No se encontró el objeto DoomGame. El sistema de sprites funcionará en modo independiente');
    }
    
    // Buscar imágenes que ya existan en el documento inmediatamente
    this.logInfo('Buscando imágenes precargadas en el documento...');
    const precargados = this.checkPreloadedImages();
    if (precargados > 0) {
      this.logSuccess(`✅ Se encontraron ${precargados} imágenes precargadas en el documento`);
    }
    
    // Primero intentar precargar imágenes para encontrar la ruta correcta
    this.preloadImages(() => {
  // Hidratar desde preloads por si ya están listos
  this.hydrateFromPreloads();
      // Si ya encontramos todos los sprites durante la precarga, llamar al callback
      if (!this.loading) {
        this.logSuccess('✅ Sprites completamente cargados en precarga');
        if (typeof callback === 'function') callback();
        return;
      }
      
      // Si no, continuar con la carga normal
      this.loadSprites(callback);
      
      // Programar reintentos si la carga falla
      setTimeout(() => {
        if (this.loading && this.loadedCount < this.totalSprites) {
          this.logWarning('⚠️ Algunos sprites no se cargaron. Reintentando...');
          this.loadSprites(callback);
        }
      }, 5000);
    });
    
    // Crear una instancia de depuración visual si estamos en modo debug
    if (this.debug) {
      this.createDebugDisplay();
    }
  },
  
  /**
   * Crea un panel de depuración visual para los sprites
   */
  createDebugDisplay() {
    // Sólo crear si no existe ya
    if (document.getElementById('sprite-debug-panel')) return;
    
    // Crear contenedor
    const panel = document.createElement('div');
    panel.id = 'sprite-debug-panel';
    panel.style.position = 'fixed';
    panel.style.bottom = '10px';
    panel.style.left = '10px';
    panel.style.zIndex = '9999';
    panel.style.backgroundColor = 'rgba(0,0,0,0.8)';
    panel.style.color = 'white';
    panel.style.padding = '10px';
    panel.style.borderRadius = '5px';
    panel.style.maxWidth = '400px';
    panel.style.maxHeight = '200px';
    panel.style.overflow = 'auto';
    panel.style.fontSize = '12px';
    panel.style.fontFamily = 'monospace';
    
    // Título
    const title = document.createElement('h3');
    title.textContent = 'Debug Sprites';
    title.style.margin = '0 0 5px 0';
    title.style.fontSize = '14px';
    title.style.color = '#0cf';
    panel.appendChild(title);
    
    // Contenido de estado
    const content = document.createElement('div');
    content.id = 'sprite-debug-content';
    panel.appendChild(content);
    
    // Botones
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '10px';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '5px';
    
    // Botón para recargar sprites
    const reloadBtn = document.createElement('button');
    reloadBtn.textContent = '🔄 Recargar';
    reloadBtn.style.padding = '3px 8px';
    reloadBtn.style.backgroundColor = '#00a';
    reloadBtn.style.color = 'white';
    reloadBtn.style.border = 'none';
    reloadBtn.style.borderRadius = '3px';
    reloadBtn.style.cursor = 'pointer';
    reloadBtn.onclick = () => {
      this.loading = true;
      this.loadedCount = 0;
      this.errors = [];
      this.loadSprites(() => {
        this.updateDebugDisplay();
      });
    };
    buttonContainer.appendChild(reloadBtn);
    
    // Botón para forzar sprites de respaldo
    const fallbackBtn = document.createElement('button');
    fallbackBtn.textContent = '🛠️ Usar respaldos';
    fallbackBtn.style.padding = '3px 8px';
    fallbackBtn.style.backgroundColor = '#a50';
    fallbackBtn.style.color = 'white';
    fallbackBtn.style.border = 'none';
    fallbackBtn.style.borderRadius = '3px';
    fallbackBtn.style.cursor = 'pointer';
    fallbackBtn.onclick = () => {
      Object.keys(SPRITE_CONFIG.ENEMY_TYPES).forEach(type => {
        this.sprites[type] = this.createFallbackSprite(type);
      });
      this.loading = false;
      this.loadedCount = this.totalSprites;
      this.updateDebugDisplay();
    };
    buttonContainer.appendChild(fallbackBtn);
    
    // Botón para cerrar
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✖️';
    closeBtn.style.padding = '3px 8px';
    closeBtn.style.backgroundColor = '#a00';
    closeBtn.style.color = 'white';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '3px';
    closeBtn.style.marginLeft = 'auto';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => {
      panel.style.display = 'none';
    };
    buttonContainer.appendChild(closeBtn);
    
    panel.appendChild(buttonContainer);
    
    // Añadir al documento
    document.body.appendChild(panel);
    
    // Función para actualizar el estado
    this.updateDebugDisplay = () => {
      const content = document.getElementById('sprite-debug-content');
      if (!content) return;
      
      let html = '';
      
      // Estado general
      html += `<div>Estado: ${this.loading ? '⏳ Cargando...' : '✅ Completo'}</div>`;
      html += `<div>Sprites cargados: ${this.loadedCount}/${this.totalSprites}</div>`;
      
      // Estado de cada sprite
      html += '<div style="margin-top:5px;border-top:1px solid #444;padding-top:5px;">Sprites:</div>';
      Object.keys(this.sprites).forEach(type => {
        const sprite = this.sprites[type];
        const status = sprite ? '✅' : '❌';
        html += `<div>${status} ${type}: ${sprite ? 'Cargado' : 'No disponible'}</div>`;
      });
      
      // Errores
      if (this.errors.length > 0) {
        html += '<div style="margin-top:5px;border-top:1px solid #444;padding-top:5px;color:#f55;">Errores:</div>';
        this.errors.forEach(err => {
          html += `<div style="color:#f55;">- ${err}</div>`;
        });
      }
      
      content.innerHTML = html;
    };
    
    // Actualizar el panel cada segundo
    setInterval(this.updateDebugDisplay, 1000);
    
    // Actualización inicial
    this.updateDebugDisplay();
  },
  
  /**
   * Carga todos los sprites de enemigos
   */
  loadSprites(callback) {
    if (!this.loading) {
      // Si ya terminó de cargar, no intentar cargar de nuevo
      if (typeof callback === 'function') callback();
      return;
    }
    
    this.loading = true;
    
    // Verificar si hay soporte de canvas en el navegador
    if (!document.createElement('canvas').getContext) {
      this.logError('Este navegador no soporta canvas, no se pueden cargar sprites');
      this.loading = false;
      if (typeof callback === 'function') callback();
      return;
    }
    
    // Mensaje destacado sobre la carga de sprites
    console.log('%c 🔄 INICIANDO CARGA DE SPRITES... ', 'background: #00f; color: white; font-size: 14px; padding: 5px;');
    
    // Imprimir la ubicación actual para debug
    this.logInfo(`URL actual: ${window.location.href}`);
    this.logInfo(`Ruta base: ${window.location.origin}`);
    
    // Primero buscar sprites en el DOM que pueden estar precargados
    const domSprites = this.checkPreloadedImages();
    if (domSprites === this.totalSprites) {
      // Si encontramos todos en el DOM, terminar
      this.logSuccess('✅ Todos los sprites encontrados en el DOM');
      this.loading = false;
      if (typeof callback === 'function') callback();
      return;
    }
    
    // Cargar cada tipo de enemigo que falte
    Object.keys(SPRITE_CONFIG.ENEMY_TYPES).forEach(type => {
      // Si ya tenemos este sprite cargado, omitir
      if (this.sprites[type]) {
        this.logInfo(`Sprite '${type}' ya está cargado, omitiendo...`);
        return;
      }
      
      const config = SPRITE_CONFIG.ENEMY_TYPES[type];
      const img = new Image();
      
      img.onload = () => {
        this.logSuccess(`Sprite '${type}' cargado correctamente (${img.width}x${img.height})`);
        this.sprites[type] = this.processSprite(img, type);
        this.loadedCount++;
        
        // Guardar la imagen en una variable global para debug
        window[`sprite_${type}`] = img;
        
        // También añadir al DOM para que esté disponible para futuros intentos
        this.addImageToDOM(img, type);
        
        if (this.loadedCount === this.totalSprites) {
          this.aliasFallbacks();
          this.logSuccess('✅ Todos los sprites cargados y procesados');
          this.loading = false;
          
          // Mensaje destacado cuando todos los sprites se han cargado
          console.log('%c ✅ SPRITES CARGADOS EXITOSAMENTE ', 'background: #080; color: white; font-size: 14px; padding: 5px;');
          
          if (typeof callback === 'function') callback();
        }
      };
      
      img.onerror = (e) => {
        this.logError(`Error al cargar sprite '${type}' desde '${config.spriteUrl}'`);
        this.errors.push(`No se pudo cargar ${config.spriteUrl}`);
        
        // Crear sprite de respaldo temporalmente
        this.sprites[type] = this.createFallbackSprite(type);
        this.loadedCount++;
        
        // Intentar con rutas alternativas
        this.tryAlternativePaths(type, config, callback);
        
        if (this.loadedCount === this.totalSprites) {
          this.aliasFallbacks();
          this.logWarning('⚠️ Sistema de sprites inicializado con errores');
          this.loading = false;
          if (typeof callback === 'function') callback();
        }
      };
      
      // Evitar la caché del navegador
      const cacheBuster = '?v=' + new Date().getTime();
      const imgUrl = config.spriteUrl + cacheBuster;
      
      // Mostrar la URL que se está cargando
      this.logInfo(`Cargando sprite '${type}' desde '${config.spriteUrl}'...`);
      
      // Añadir el evento load para asegurar que se dispare
      if (img.complete) {
        setTimeout(() => {
          this.logInfo(`Imagen '${type}' ya estaba en caché, disparando evento load manualmente`);
          img.onload();
        }, 100);
      }
      
      // Establecer origen cruzado para permitir CORS
      img.crossOrigin = "Anonymous";
      
      // Cargar la imagen
      img.src = imgUrl;
      
      // Forzar error después de un tiempo si no carga
      setTimeout(() => {
        if (!img.complete && this.loading) {
          this.logWarning(`La imagen '${type}' no se cargó en el tiempo esperado, buscando alternativas...`);
          img.src = ""; // Forzar error para que se cree el sprite de respaldo
        }
      }, 5000);
    });
    
    // Verificar después de un tiempo si todas las imágenes se cargaron
    setTimeout(() => {
      if (this.loading) {
        this.logWarning('⚠️ Algunas imágenes no se cargaron correctamente después de 10 segundos');
        
        // Crear cualquier sprite fallido como respaldo para no bloquear la carga
        Object.keys(SPRITE_CONFIG.ENEMY_TYPES).forEach(type => {
          if (!this.sprites[type]) {
            this.logWarning(`Creando respaldo para '${type}' que no se pudo cargar`);
            this.sprites[type] = this.createFallbackSprite(type);
            this.loadedCount++;
          }
        });
        
        // Completar la carga
        if (this.loadedCount === this.totalSprites) {
          this.aliasFallbacks();
          this.loading = false;
          this.logWarning('Sistema de sprites inicializado con sprites de respaldo');
          if (typeof callback === 'function') callback();
        }
      }
    }, 10000);
  },
  
  /**
   * Intenta cargar sprites desde rutas alternativas
   */
  tryAlternativePaths(type, config, callback) {
    const basePaths = [
      // Probar diferentes rutas comunes
      '',                   // Raíz del proyecto
      'assets/images/',
      'assets/img/',
      'img/',
      'images/',
      'assets/',
      'resources/',
      'sprites/'
    ];
    
    // Probar también nombres de archivo alternativos
    const fileNames = [
      config.spriteUrl,
      // Probar variaciones del nombre (por si hay problemas con mayúsculas/minúsculas)
      config.spriteUrl.toLowerCase(),
      config.spriteUrl.replace('.png', '.PNG'),
      // Intentar diferentes extensiones
      config.spriteUrl.replace('.png', '.jpg'),
      config.spriteUrl.replace('.png', '.jpeg')
    ];
    
    // Crear todas las combinaciones posibles
    let alternativePaths = [];
    basePaths.forEach(basePath => {
      fileNames.forEach(fileName => {
        alternativePaths.push(basePath + fileName);
      });
    });
    
    // Eliminar duplicados
    alternativePaths = [...new Set(alternativePaths)];
    
    // Intentar cada ruta alternativa
    let tried = 0;
    let success = false;
    
    const tryNextPath = () => {
      if (tried >= alternativePaths.length || success) return;
      
      const path = alternativePaths[tried];
      tried++;
      
      this.logInfo(`Intentando ruta alternativa (${tried}/${alternativePaths.length}): '${path}'`);
      
      const img = new Image();
      img.onload = () => {
        success = true;
        this.logSuccess(`✅ ÉXITO: Sprite '${type}' cargado desde '${path}'`);
        this.sprites[type] = this.processSprite(img, type);
        
        // Actualizar la configuración con la ruta correcta
        SPRITE_CONFIG.ENEMY_TYPES[type].spriteUrl = path;
        
        // Alertar del éxito en consola de forma destacada
        console.log(`%c ✅ SPRITE ENCONTRADO: ${path} `, 'background: #080; color: white; font-size: 14px; padding: 5px;');
        
        // Mostrar la imagen en consola para verificación
        if (this.debug) {
          console.log('Vista previa del sprite:');
          console.log(img);
        }
      };
      
      img.onerror = () => {
        // Intentar con la siguiente ruta
        setTimeout(tryNextPath, 50); // Reducir tiempo de espera para probar más rápido
      };
      
      img.src = path;
    };
    
    // Iniciar el proceso
    tryNextPath();
    
    // Si después de 8 segundos no se ha encontrado ninguna imagen, buscar imágenes en el documento
    setTimeout(() => {
      if (!success) {
        this.logWarning('⚠️ No se encontró el sprite en ninguna ruta. Buscando imágenes existentes en el documento...');
        this.findExistingImages(type);
      }
    }, 8000);
  },
  
  /**
   * Busca imágenes existentes en el documento que podrían usarse como sprites
   */
  findExistingImages(type) {
    const allImages = document.querySelectorAll('img');
    this.logInfo(`Buscando entre ${allImages.length} imágenes en el documento...`);
    
    // Palabras clave para buscar en las rutas de imagen
    const keywords = [type, 'noboa', 'sprite', 'enemy', 'character'];
    
    let bestMatch = null;
    
    // Revisar todas las imágenes del documento
    allImages.forEach(img => {
      const src = img.src || '';
      
      // Verificar si la URL contiene alguna palabra clave
      const matchesKeyword = keywords.some(keyword => 
        src.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (matchesKeyword && img.complete && img.naturalWidth > 0) {
        bestMatch = img;
        this.logSuccess(`✅ Encontrada imagen existente que coincide con '${type}': ${src}`);
      }
    });
    
    if (bestMatch) {
      // Usar la imagen encontrada
      this.sprites[type] = this.processSprite(bestMatch, type);
      
      // Actualizar la configuración con la ruta correcta
      SPRITE_CONFIG.ENEMY_TYPES[type].spriteUrl = bestMatch.src;
      
      console.log(`%c ✅ SPRITE ENCONTRADO EN DOCUMENTO: ${bestMatch.src} `, 'background: #080; color: white; font-size: 14px; padding: 5px;');
    } else {
      this.logWarning('⚠️ No se encontraron imágenes adecuadas en el documento');
      
      // Como último recurso, intentar cargar directamente desde la URL
      this.loadSpriteFromURL(type);
    }
  },
  
  /**
   * Intenta cargar sprite directamente desde la URL completa
   */
  loadSpriteFromURL(type) {
    // URLs potenciales (incluyendo URLs absolutas como último recurso)
    const potentialURLs = [
      // URLs relativas al origen
      `/noboa-${type}.png`,
      `/assets/images/noboa-${type}.png`,
      `/images/noboa-${type}.png`,
      // URLs absolutas (solo para pruebas, no para producción)
      `https://raw.githubusercontent.com/freudiandev/practicatironoboacarton/master/noboa-${type}.png`,
      window.location.origin + `/noboa-${type}.png`
    ];
    
    let urlIndex = 0;
    
    const tryNextURL = () => {
      if (urlIndex >= potentialURLs.length) return;
      
      const url = potentialURLs[urlIndex++];
      this.logInfo(`Intentando cargar desde URL: ${url}`);
      
      const img = new Image();
      img.crossOrigin = "Anonymous"; // Permitir CORS
      
      img.onload = () => {
        this.logSuccess(`✅ ÉXITO: Sprite '${type}' cargado desde URL: ${url}`);
        this.sprites[type] = this.processSprite(img, type);
        SPRITE_CONFIG.ENEMY_TYPES[type].spriteUrl = url;
      };
      
      img.onerror = () => {
        setTimeout(tryNextURL, 50);
      };
      
      img.src = url;
    };
    
    tryNextURL();
  },
  
  /**
   * Procesa un sprite para asegurar proporciones humanas correctas
   * @param {HTMLImageElement} img - La imagen original
   * @param {string} type - El tipo de enemigo
   * @returns {HTMLCanvasElement} Canvas con el sprite procesado
   */
  processSprite(img, type) {
    // Obtener configuración específica para este tipo
    const config = SPRITE_CONFIG.ENEMY_TYPES[type];
    
    // Crear canvas temporal para procesar el sprite
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Dimensiones del canvas
    canvas.width = 256;
    canvas.height = Math.floor(256 * SPRITE_CONFIG.HUMAN_RATIO);
    
    // Calcular proporciones ideales
    const targetWidth = canvas.width * config.width;
    const targetHeight = canvas.height * config.height;
    
    // Calcular posición para centrar
    const offsetX = (canvas.width - targetWidth) / 2;
    const offsetY = canvas.height - targetHeight; // Alinear con la base
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Añadir borde para debug
    if (this.debug) {
      ctx.strokeStyle = 'rgba(255,0,0,0.5)';
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }
    
    try {
      // Ajustar según tipo de enemigo
      switch(type) {
        case 'casual':
          // Dibujar sprite casual (ligeras correcciones para aspecto natural)
          ctx.drawImage(
            img, 
            offsetX, offsetY * 0.9, 
            targetWidth, targetHeight * 1.1
          );
          break;
          
        case 'deportivo':
          // Dibujar sprite deportivo (más esbelto)
          ctx.drawImage(
            img, 
            offsetX, offsetY * 0.85, 
            targetWidth * 0.9, targetHeight * 1.15
          );
          break;
          
        case 'presidencial':
        default:
          // Dibujar sprite presidencial (más formal, mejor proporcionado)
          ctx.drawImage(
            img, 
            offsetX, offsetY, 
            targetWidth, targetHeight
          );
          break;
      }
      
      // Añadir etiqueta para debug
      if (this.debug) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, 80, 20);
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(type, 5, 15);
      }
      
  // Marcar como sprite real (no respaldo)
  canvas.__isFallback = false;
  this.logInfo(`Sprite '${type}' procesado: ${canvas.width}x${canvas.height}`);
  return canvas;
    } catch (e) {
      this.logError(`Error al procesar sprite '${type}': ${e.message}`);
      return this.createFallbackSprite(type);
    }
  },
  
  /**
   * Crea un sprite de respaldo en caso de error de carga
   * @param {string} type - Tipo de enemigo
   * @returns {HTMLCanvasElement} Sprite de respaldo
   */
  createFallbackSprite(type) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Usar las mismas dimensiones que los sprites reales
    canvas.width = 256;
    canvas.height = Math.floor(256 * SPRITE_CONFIG.HUMAN_RATIO);
    
    // Color según tipo
    let color;
    switch(type) {
      case 'casual': color = '#ff6b6b'; break;
      case 'deportivo': color = '#4ecdc4'; break;
      case 'presidencial': 
      default: color = '#ffe66d'; break;
    }
    
    // Dibujar silueta humana
    ctx.fillStyle = color;
    
    // Cabeza
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height*0.15, canvas.width*0.12, 0, Math.PI * 2);
    ctx.fill();
    
    // Torso (trapecio)
    ctx.beginPath();
    ctx.moveTo(canvas.width/2 - canvas.width*0.15, canvas.height*0.25);
    ctx.lineTo(canvas.width/2 + canvas.width*0.15, canvas.height*0.25);
    ctx.lineTo(canvas.width/2 + canvas.width*0.2, canvas.height*0.6);
    ctx.lineTo(canvas.width/2 - canvas.width*0.2, canvas.height*0.6);
    ctx.closePath();
    ctx.fill();
    
    // Piernas
    ctx.fillRect(
      canvas.width/2 - canvas.width*0.15, 
      canvas.height*0.6, 
      canvas.width*0.12, 
      canvas.height*0.4
    );
    ctx.fillRect(
      canvas.width/2 + canvas.width*0.03, 
      canvas.height*0.6, 
      canvas.width*0.12, 
      canvas.height*0.4
    );
    
    // Brazos
    ctx.fillRect(
      canvas.width/2 - canvas.width*0.28, 
      canvas.height*0.25, 
      canvas.width*0.1, 
      canvas.height*0.3
    );
    ctx.fillRect(
      canvas.width/2 + canvas.width*0.18, 
      canvas.height*0.25, 
      canvas.width*0.1, 
      canvas.height*0.3
    );
    
    // Etiqueta con el tipo
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(type.toUpperCase(), canvas.width/2, canvas.height*0.95);
    
    // Mensaje indicando que es un respaldo
    ctx.fillStyle = 'red';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('RESPALDO', canvas.width/2, canvas.height*0.05);
    
    // Marcar como respaldo para poder sustituirlo luego si hay uno real
    canvas.__isFallback = true;
    this.logWarning(`Creado sprite de respaldo para '${type}'`);
    return canvas;
  },
  
  // Reemplaza sprites de respaldo por cualquier sprite real disponible para evitar marcadores rojos
  aliasFallbacks() {
    const anyReal = Object.values(this.sprites).find(s => s && !s.__isFallback);
    if (!anyReal) return;
    Object.keys(this.sprites).forEach(type => {
      const s = this.sprites[type];
      if (!s || s.__isFallback) {
        this.logWarning(`Sustituyendo sprite de respaldo '${type}' por uno real disponible`);
        this.sprites[type] = anyReal;
      }
    });
  },
  
  /**
   * Renderiza un sprite de enemigo en el juego
   * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
   * @param {Object} enemy - Datos del enemigo a renderizar
   * @param {Object} player - Datos del jugador para cálculos de perspectiva
   */
  renderEnemySprite(ctx, enemy, player) {
    if (!enemy || !player || !ctx) {
      return; // Salir si faltan datos esenciales
    }
    
    if (this.loading) {
      // No dibujar marcador rojo; mejor no mostrar nada para evitar cuadros rojos
      return;
    }
    
  // Reemplazar posibles fallbacks con preloads si están listos
  this.hydrateFromPreloads();

  // Asegurarse de que el enemigo tenga un tipo con sprite disponible
    const pickLoadedType = () => (Object.keys(this.sprites).find(t => this.sprites[t]) || 'casual');
    if (!enemy.type || !this.sprites[enemy.type]) {
      enemy.type = pickLoadedType();
      if (!this.sprites[enemy.type]) return; // nada que dibujar
    }
    
    // Calcular vector relativo al jugador
  const dx = enemy.x - player.x;
  const dz = enemy.z - player.z;
  const pixelDistance = Math.sqrt(dx*dx + dz*dz);
    
  // Convertir la distancia del mundo a tiles para cálculo de perspectiva más realista
  const cellSize = (window.GAME_CONFIG && window.GAME_CONFIG.cellSize) ||
           (window.Utils && window.Utils.mapConfig && window.Utils.mapConfig.cellSize) || 64;
  const distanceTiles = pixelDistance / cellSize;
    
  // No renderizar si está demasiado lejos (según tiles)
  if (distanceTiles > SPRITE_CONFIG.MAX_RENDER_DISTANCE) return;
    
    // Calcular ángulo relativo al jugador
    let angle = Math.atan2(dz, dx) - player.angle;
    // Normalizar ángulo
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    
    // Verificar si está en el campo de visión
    const fov = player.fov || Math.PI/3;
    if (Math.abs(angle) > fov/2) return;
    
    // Calcular posición en pantalla
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    const screenX = (canvasWidth/2) + (angle/(fov/2)) * (canvasWidth/2);
    
    // Calcular tamaño basado en distancia (perspectiva)
  const scaleMultiplier = 1.2; // Ajuste de escala global (aumentado para mejor visibilidad)
    const enemyConfig = SPRITE_CONFIG.ENEMY_TYPES[enemy.type || 'casual'];
  // Usar distancia en tiles para mantener escala humana a 1.75m aprox.
  const spriteHeight = (canvasHeight * SPRITE_CONFIG.HUMAN_HEIGHT * scaleMultiplier) / Math.max(distanceTiles, 0.1);
    const spriteWidth = spriteHeight / SPRITE_CONFIG.HUMAN_RATIO;
    
    // Seleccionar imagen según tipo
    let sprite = this.sprites[enemy.type];
    // Si es respaldo o inexistente, usar cualquier sprite real disponible
    if (!sprite || sprite.__isFallback) {
      const anyReal = Object.values(this.sprites).find(s => s && !s.__isFallback);
      if (anyReal) sprite = anyReal; else return;
    }
    
    // Calcular posición Y para que el sprite esté de pie sobre el suelo
    // Tomar en cuenta la mirada vertical del jugador si existe
    const verticalLook = player.verticalLook || 0;
    const screenY = (canvasHeight/2) - (spriteHeight/2) + (verticalLook * canvasHeight/4);
    
    // Verificar si hay una pared entre el jugador y el enemigo
    const isVisible = this.checkVisibility(player, enemy);
    
    if (isVisible) {
      // Guardar contexto
      ctx.save();
      
  // Ajustar transparencia según distancia en tiles
  const alpha = Math.max(0.4, Math.min(1.0, 1.2 - (distanceTiles/SPRITE_CONFIG.MAX_RENDER_DISTANCE)));
      ctx.globalAlpha = alpha;
      
      // Dibujar sprite con las proporciones calculadas (protegido)
      try {
        ctx.drawImage(
          sprite,
          screenX - spriteWidth/2,
          screenY,
          spriteWidth,
          spriteHeight
        );
      } catch (e) {
        this.logError(`drawImage falló para '${enemy.type}': ${e.message}`);
        ctx.restore();
        return;
      }
      
      // Para debug, dibujar un marco alrededor del sprite
      if (this.debug) {
        ctx.strokeStyle = 'rgba(0,255,0,0.5)';
        ctx.strokeRect(
          screenX - spriteWidth/2,
          screenY,
          spriteWidth,
          spriteHeight
        );
        
        // Mostrar distancia y tipo
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(screenX - 40, screenY - 30, 80, 20);
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
  ctx.fillText(`${enemy.type} (${distanceTiles.toFixed(1)}u)`, screenX, screenY - 15);
      }
      
      // Restaurar contexto
      ctx.restore();
    }
  },
  
  /**
   * Verifica si hay paredes entre el jugador y el enemigo
   * @param {Object} player - Datos del jugador
   * @param {Object} enemy - Datos del enemigo
   * @returns {boolean} true si el enemigo es visible
   */
  checkVisibility(player, enemy) {
    // Versión simplificada: siempre visible
    // En un juego real, aquí se implementaría el raycasting para comprobar
    // si hay paredes entre el jugador y el enemigo
    return true;
  },
  
  /**
   * Busca imágenes precargadas en el documento que puedan usarse como sprites
   * @returns {number} Número de imágenes encontradas y utilizadas
   */
  checkPreloadedImages() {
    let encontrados = 0;
    
    // Buscar en todo el documento
    const allImages = document.querySelectorAll('img');
    this.logInfo(`Buscando sprites en ${allImages.length} imágenes del documento...`);
    
    // Revisar cada imagen
    allImages.forEach(img => {
      // Verificar si la imagen está completa y visible
      if (img.complete && img.naturalWidth > 0) {
        let matchFound = false;
        
        // Comprobar cada tipo de enemigo
        Object.keys(SPRITE_CONFIG.ENEMY_TYPES).forEach(type => {
          // Si ya tenemos este sprite, no hacer nada
          if (this.sprites[type]) return;
          
          const fileName = SPRITE_CONFIG.ENEMY_TYPES[type].spriteUrl;
          const imgSrc = img.src.toLowerCase();
          
          // Comprobar si la imagen coincide con este tipo
          if (imgSrc.includes(fileName.toLowerCase()) || 
              imgSrc.includes(type.toLowerCase()) || 
              imgSrc.includes('noboa') && imgSrc.includes(type.toLowerCase())) {
            
            this.logSuccess(`✅ Encontrada imagen precargada para '${type}': ${img.src}`);
            this.sprites[type] = this.processSprite(img, type);
            this.loadedCount++;
            matchFound = true;
            encontrados++;
            
            // Destacar en consola
            console.log(`%c ✅ SPRITE PRECARGADO ENCONTRADO: ${type} `, 'background: #080; color: white; font-size: 14px; padding: 5px;');
          }
        });
        
        if (matchFound) {
          // Si encontramos una coincidencia, actualizar estado
          if (this.loadedCount === this.totalSprites) {
            this.logSuccess('✅ Todos los sprites encontrados precargados');
            this.loading = false;
          }
        }
      }
    });
    
    return encontrados;
  },
  
  /**
   * Fuerza la visibilidad de los sprites ya cargados
   * y realiza intentos adicionales para los que faltan
   */
  forceVisibility() {
    console.log('%c 🔄 FORZANDO VISIBILIDAD DE SPRITES... ', 'background: #00a; color: white; font-size: 14px; padding: 5px;');
    
    // Verificar cuáles sprites están cargados y cuáles no
    let spritesLoaded = 0;
    let spritesMissing = [];
    
    Object.keys(this.sprites).forEach(type => {
      if (this.sprites[type]) {
        spritesLoaded++;
        console.log(`%c ✅ SPRITE ${type.toUpperCase()} YA CARGADO `, 'background: #080; color: white; font-size: 12px; padding: 3px;');
      } else {
        spritesMissing.push(type);
        console.log(`%c ❌ SPRITE ${type.toUpperCase()} FALTA `, 'background: #800; color: white; font-size: 12px; padding: 3px;');
      }
    });
    
    // Si ya están todos cargados, no hacer nada más
    if (spritesLoaded === this.totalSprites) {
      console.log('%c ✅ TODOS LOS SPRITES ESTÁN CARGADOS ', 'background: #080; color: white; font-size: 14px; padding: 5px;');
      return;
    }
    
    // Si al menos uno está cargado, intentar usar ese como base para los demás
    if (spritesLoaded > 0) {
      const loadedType = Object.keys(this.sprites).find(type => this.sprites[type]);
      const loadedSprite = this.sprites[loadedType];
      
      if (loadedSprite && spritesMissing.length > 0) {
        console.log(`%c 🔄 USANDO SPRITE ${loadedType.toUpperCase()} COMO BASE PARA LOS DEMÁS `, 'background: #00a; color: white; font-size: 12px; padding: 3px;');
        
        // Crear copias del sprite cargado con colores diferentes para los que faltan
        spritesMissing.forEach(type => {
          this.sprites[type] = this.createVariantFromSprite(loadedSprite, type);
          this.loadedCount++;
          console.log(`%c ✅ CREADO SPRITE ${type.toUpperCase()} BASADO EN ${loadedType.toUpperCase()} `, 'background: #080; color: white; font-size: 12px; padding: 3px;');
        });
        
        // Actualizar estado
        this.loading = false;
      }
    }
    
    // Si tenemos DoomGame, forzar actualización
    if (window.DoomGame) {
      // Forzar actualización de enemigos
      if (DoomGame.enemies && Array.isArray(DoomGame.enemies)) {
        DoomGame.enemies.forEach(enemy => {
          // Asegurarse de que tenga un tipo válido
          if (!enemy.type || !this.sprites[enemy.type]) {
            enemy.type = Object.keys(this.sprites).find(type => this.sprites[type]) || 'casual';
          }
        });
      }
      
      // Forzar renderizado
      if (typeof DoomGame.render === 'function') {
        setTimeout(() => DoomGame.render(), 500);
        setTimeout(() => DoomGame.render(), 1000);
        setTimeout(() => DoomGame.render(), 2000);
      }
    }
    
    // Programar verificación periódica
    this.visibilityInterval = setInterval(() => {
      if (window.DoomGame && typeof DoomGame.render === 'function') {
        DoomGame.render();
      }
    }, 3000);
  },
  
  /**
   * Crea una variante de un sprite existente
   * @param {HTMLCanvasElement} baseSprite - Sprite base
   * @param {string} type - Tipo de enemigo para la variante
   * @returns {HTMLCanvasElement} Nueva variante del sprite
   */
  createVariantFromSprite(baseSprite, type) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Copiar dimensiones
    canvas.width = baseSprite.width;
    canvas.height = baseSprite.height;
    
    // Dibujar sprite original
    ctx.drawImage(baseSprite, 0, 0);
    
    // Aplicar filtro de color según tipo
    const filter = {
      'casual': 'hue-rotate(0deg)',
      'deportivo': 'hue-rotate(120deg)',
      'presidencial': 'hue-rotate(240deg)'
    }[type] || '';
    
    if (filter) {
      ctx.filter = filter;
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.filter = 'none';
    }
    
    // Añadir etiqueta para identificar
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, 80, 20);
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText(type, 5, 15);
    
    return canvas;
  },
  
  /**
   * Añade una imagen al DOM para asegurar que está disponible
   * @param {HTMLImageElement} img - Imagen a añadir
   * @param {string} type - Tipo de enemigo
   */
  addImageToDOM(img, type) {
    // Verificar si ya existe un contenedor
    let container = document.getElementById('preloaded-sprites');
    if (!container) {
      container = document.createElement('div');
      container.id = 'preloaded-sprites';
      container.style.position = 'absolute';
      container.style.top = '0';
      container.style.left = '0';
      container.style.visibility = 'hidden';
      container.style.pointerEvents = 'none';
      container.style.width = '1px';
      container.style.height = '1px';
      container.style.overflow = 'hidden';
      document.body.appendChild(container);
    }
    
    // Crear una copia de la imagen para el DOM
    const domImg = new Image();
    domImg.src = img.src;
    domImg.id = `sprite-${type}`;
    domImg.dataset.type = type;
    domImg.alt = `Sprite ${type}`;
    
    // Añadir al contenedor
    container.appendChild(domImg);
    this.logInfo(`Imagen '${type}' añadida al DOM para acceso futuro`);
  },
  
  // Funciones de logging
  logInfo(message) {
    if (this.debug) console.log(`ℹ️ [Sprites] ${message}`);
  },
  
  logSuccess(message) {
    if (this.debug) console.log(`✅ [Sprites] ${message}`);
  },
  
  logWarning(message) {
    if (this.debug) console.warn(`⚠️ [Sprites] ${message}`);
  },
  
  logError(message) {
    if (this.debug) console.error(`❌ [Sprites] ${message}`);
    this.errors.push(message);
  }
};

// Exportar el sistema para uso global
window.EnemySpriteSystem = SpriteSystem;

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSprites);
} else {
  // El DOM ya está listo
  initSprites();
}

function initSprites() {
  console.log('🎮 Inicializando sistema de sprites enemigos con proporciones humanas...');
  SpriteSystem.init(() => {
    console.log('✅ Sistema de sprites enemigos listo');
    
    // Forzar visibilidad de los sprites después de la carga
    SpriteSystem.forceVisibility();
    
    // Verificar integración con DoomGame
    if (window.DoomGame) {
      console.log('🔄 Integrando con sistema DoomGame existente...');
      
      // Asegurarse de que todos los enemigos tengan un tipo
      if (DoomGame.enemies && Array.isArray(DoomGame.enemies)) {
        const types = ['casual', 'deportivo', 'presidencial'];
        DoomGame.enemies.forEach((enemy, index) => {
          if (!enemy.type) {
            enemy.type = types[index % 3];
          }
        });
      }
      
      // Extender el renderizado de sprites
      if (!DoomGame.originalRenderSprites) {
        DoomGame.originalRenderSprites = DoomGame.renderSprites || function(){};
      }
      
      DoomGame.renderSprites = function() {
        // Primero ejecutar el renderizado original si existe
        if (typeof DoomGame.originalRenderSprites === 'function') {
          DoomGame.originalRenderSprites.call(DoomGame);
        }
        
        // Luego renderizar con nuestro sistema mejorado
        if (this.ctx && this.enemies && this.player) {
          SpriteSystem.debug && console.log(`Renderizando ${this.enemies.length} enemigos con sprites mejorados`);
          this.enemies.forEach(enemy => {
            if (enemy.health > 0) {
              SpriteSystem.renderEnemySprite(this.ctx, enemy, this.player);
            }
          });
        }
      };
      
      // Verificar si necesitamos agregar una función de renderizado al bucle principal
      if (typeof window.DoomGame.gameLoop === 'function' && !window.DoomGame.gameLoopPatched) {
        const originalGameLoop = window.DoomGame.gameLoop;
        window.DoomGame.gameLoop = function() {
          // Llamar al bucle original
          const result = originalGameLoop.apply(this, arguments);
          
          // Asegurar que se rendericen los sprites
          if (typeof this.renderSprites === 'function' && this.running) {
            this.renderSprites();
          }
          
          return result;
        };
        window.DoomGame.gameLoopPatched = true;
        console.log('✅ Sistema de sprites integrado con el bucle principal');
      }
      
      // Crear una función para actualizar el juego y forzar un nuevo renderizado
      window.refreshGame = function() {
        if (window.DoomGame) {
          if (typeof window.DoomGame.render === 'function') {
            window.DoomGame.render();
          }
          if (typeof window.DoomGame.renderSprites === 'function') {
            window.DoomGame.renderSprites();
          }
        }
      };
      
      // Forzar un renderizado inicial
      setTimeout(window.refreshGame, 1000);
      setTimeout(window.refreshGame, 2000);
      setTimeout(window.refreshGame, 3000);
      
      console.log('✅ Sistema de sprites integrado con DoomGame');
    } else {
      console.warn('⚠️ DoomGame no está disponible, los sprites no se mostrarán automáticamente');
      console.log('Para mostrar los sprites manualmente, llama a EnemySpriteSystem.renderEnemySprite(ctx, enemy, player)');
    }
  });
}

console.log('📚 Sistema de sprites enemigos (versión mejorada) cargado correctamente');
