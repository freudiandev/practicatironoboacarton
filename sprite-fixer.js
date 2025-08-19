/**
 * SISTEMA DE CORRECCIÓN Y REPARACIÓN DE SPRITES
 * Versión: 1.0.0
 * 
 * Este sistema se ejecuta después de que el juego ha cargado
 * y verifica si los sprites están mostrándose correctamente.
 * Si no lo están, intenta repararlos mediante varias técnicas.
 */

(function() {
  console.log('%c 🔧 INICIANDO SISTEMA DE CORRECCIÓN DE SPRITES ', 'background: #a50; color: white; font-size: 14px; padding: 5px;');
  
  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpriteFixer);
  } else {
    // El DOM ya está listo
    initSpriteFixer();
  }
  
  function initSpriteFixer() {
    console.log('🔍 Iniciando verificación de sprites...');
    
    // Configuración de sprites
    const SPRITE_TYPES = ['casual', 'deportivo', 'presidencial'];
    const SPRITE_FILES = {
      'casual': 'noboa-casual.png',
      'deportivo': 'noboa-deportivo.png',
      'presidencial': 'noboa-presidencial.png'
    };
    
    // Esperar a que el juego se inicialice
    setTimeout(() => {
      verifySprites();
    }, 2000);
    
    // Programar verificaciones periódicas
    setInterval(verifySprites, 5000);
    
    /**
     * Verifica si los sprites están mostrándose correctamente
     */
    function verifySprites() {
      console.log('🔍 Verificando estado de sprites...');
      
      // Verificar si existe el sistema de sprites
      const spriteSystem = window.EnemySpriteSystem || window.SpriteSystem;
      
      if (!spriteSystem) {
        console.warn('⚠️ No se encontró sistema de sprites');
        fixSpritesManually();
        return;
      }
      
      // Verificar si los sprites están cargados
      let loadedCount = 0;
      let missingTypes = [];
      
      SPRITE_TYPES.forEach(type => {
        if (spriteSystem.sprites && spriteSystem.sprites[type]) {
          loadedCount++;
        } else {
          missingTypes.push(type);
        }
      });
      
      console.log(`📊 Estado de sprites: ${loadedCount}/${SPRITE_TYPES.length} cargados`);
      
      // Si faltan sprites, intentar repararlos
      if (loadedCount < SPRITE_TYPES.length) {
        console.warn(`⚠️ Faltan ${SPRITE_TYPES.length - loadedCount} sprites: ${missingTypes.join(', ')}`);
        fixMissingSprites(missingTypes, spriteSystem);
      } else {
        // Todos los sprites están cargados, verificar si se están mostrando
        verifyRendering();
      }
    }
    
    /**
     * Verifica si los sprites se están mostrando correctamente
     */
    function verifyRendering() {
      // Verificar si el juego está renderizando sprites
      const DoomGame = window.DoomGame;
      
      if (!DoomGame || !DoomGame.enemies || !Array.isArray(DoomGame.enemies)) {
        console.warn('⚠️ No se encontró juego o enemigos');
        return;
      }
      
      // Verificar si hay enemigos
      if (DoomGame.enemies.length === 0) {
        console.warn('⚠️ No hay enemigos en el juego');
        return;
      }
      
      // Verificar si los enemigos tienen tipos válidos
      let validTypes = 0;
      
      DoomGame.enemies.forEach(enemy => {
        if (enemy && SPRITE_TYPES.includes(enemy.type)) {
          validTypes++;
        }
      });
      
      if (validTypes < DoomGame.enemies.length) {
        console.warn('⚠️ Algunos enemigos no tienen tipos válidos, reparando...');
        
        // Asignar tipos válidos a los enemigos
        DoomGame.enemies.forEach((enemy, index) => {
          if (!enemy.type || !SPRITE_TYPES.includes(enemy.type)) {
            enemy.type = SPRITE_TYPES[index % SPRITE_TYPES.length];
          }
        });
      }
      
      // Forzar re-renderizado
      if (typeof DoomGame.render === 'function') {
        DoomGame.render();
      }
    }
    
    /**
     * Intenta reparar sprites faltantes
     * @param {Array} missingTypes - Tipos de sprites que faltan
     * @param {Object} spriteSystem - Sistema de sprites
     */
    function fixMissingSprites(missingTypes, spriteSystem) {
      console.log('🔧 Intentando reparar sprites faltantes...');
      
      // Buscar sprites en el DOM
      const foundInDOM = findSpritesInDOM(missingTypes);
      
      if (foundInDOM > 0) {
        console.log(`✅ Se encontraron ${foundInDOM} sprites en el DOM`);
        return;
      }
      
      // Intentar cargar desde URLs absolutas
      loadFromAbsoluteURLs(missingTypes, spriteSystem);
      
      // Crear sprites de respaldo si es necesario
      if (spriteSystem && typeof spriteSystem.createFallbackSprite === 'function') {
        missingTypes.forEach(type => {
          if (!spriteSystem.sprites[type]) {
            console.log(`🔧 Creando sprite de respaldo para '${type}'`);
            spriteSystem.sprites[type] = spriteSystem.createFallbackSprite(type);
            
            if (typeof spriteSystem.loadedCount === 'number') {
              spriteSystem.loadedCount++;
            }
          }
        });
        
        // Actualizar estado de carga
        if (spriteSystem.loading) {
          spriteSystem.loading = false;
        }
      }
    }
    
    /**
     * Busca sprites en el DOM
     * @param {Array} types - Tipos de sprites a buscar
     * @returns {number} Número de sprites encontrados
     */
    function findSpritesInDOM(types) {
      let foundCount = 0;
      
      // Buscar todas las imágenes en el documento
      const allImages = document.querySelectorAll('img');
      
      types.forEach(type => {
        const fileName = SPRITE_FILES[type];
        
        // Buscar coincidencias
        for (let i = 0; i < allImages.length; i++) {
          const img = allImages[i];
          const src = img.src.toLowerCase();
          
          if (src.includes(fileName.toLowerCase()) || 
              src.includes(type.toLowerCase()) || 
              src.includes('noboa') && src.includes(type.toLowerCase())) {
            
            console.log(`✅ Encontrado sprite '${type}' en el DOM: ${img.src}`);
            
            // Verificar si el sistema de sprites existe
            const spriteSystem = window.EnemySpriteSystem || window.SpriteSystem;
            
            if (spriteSystem && spriteSystem.sprites) {
              // Actualizar en el sistema de sprites
              if (typeof spriteSystem.processSprite === 'function') {
                spriteSystem.sprites[type] = spriteSystem.processSprite(img, type);
              } else {
                // Asignar directamente si no hay función de procesamiento
                spriteSystem.sprites[type] = img;
              }
              
              if (typeof spriteSystem.loadedCount === 'number') {
                spriteSystem.loadedCount++;
              }
              
              foundCount++;
              break;
            }
          }
        }
      });
      
      return foundCount;
    }
    
    /**
     * Intenta cargar sprites desde URLs absolutas
     * @param {Array} types - Tipos de sprites a cargar
     * @param {Object} spriteSystem - Sistema de sprites
     */
    function loadFromAbsoluteURLs(types, spriteSystem) {
      if (!spriteSystem || !spriteSystem.sprites) return;
      
      console.log('🔄 Intentando cargar sprites desde URLs absolutas...');
      
      // URLs base a probar
      const baseURLs = [
        window.location.origin + '/',
        window.location.origin + '/assets/images/',
        window.location.origin + '/images/',
        window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1),
        ''
      ];
      
      types.forEach(type => {
        const fileName = SPRITE_FILES[type];
        
        baseURLs.forEach(baseURL => {
          const fullURL = baseURL + fileName;
          console.log(`🔍 Intentando cargar '${type}' desde: ${fullURL}`);
          
          const img = new Image();
          
          img.onload = function() {
            console.log(`✅ Sprite '${type}' cargado desde: ${fullURL}`);
            
            // Actualizar en el sistema de sprites
            if (typeof spriteSystem.processSprite === 'function') {
              spriteSystem.sprites[type] = spriteSystem.processSprite(img, type);
            } else {
              // Asignar directamente si no hay función de procesamiento
              spriteSystem.sprites[type] = img;
            }
            
            if (typeof spriteSystem.loadedCount === 'number') {
              spriteSystem.loadedCount++;
            }
            
            // Añadir al DOM para futuras referencias
            addImageToDOM(img, type);
          };
          
          img.onerror = function() {
            // No hacer nada en caso de error
          };
          
          img.src = fullURL;
        });
      });
    }
    
    /**
     * Intenta reparar los sprites manualmente cuando no hay sistema de sprites
     */
    function fixSpritesManually() {
      console.log('🔧 Intentando reparación manual de sprites...');
      
      // Verificar si existe el objeto DoomGame
      if (!window.DoomGame) {
        console.warn('⚠️ No se encontró objeto DoomGame');
        return;
      }
      
      // Crear un sistema básico de sprites si no existe
      if (!window.EnemySpriteSystem && !window.SpriteSystem) {
        console.log('🔧 Creando sistema básico de sprites...');
        
        window.EnemySpriteSystem = {
          sprites: {},
          loadedCount: 0,
          totalSprites: SPRITE_TYPES.length,
          loading: true,
          
          renderEnemySprite: function(ctx, enemy, player) {
            if (!enemy || !player || !ctx || !this.sprites[enemy.type]) return;
            
            // Cálculos básicos para renderizado
            const dx = enemy.x - player.x;
            const dz = enemy.z - player.z;
            const distance = Math.sqrt(dx*dx + dz*dz);
            
            // No renderizar si está demasiado lejos
            if (distance > 15) return;
            
            // Calcular ángulo relativo al jugador
            let angle = Math.atan2(dz, dx) - player.angle;
            while (angle > Math.PI) angle -= Math.PI * 2;
            while (angle < -Math.PI) angle += Math.PI * 2;
            
            // Verificar si está en el campo de visión
            const fov = player.fov || Math.PI/3;
            if (Math.abs(angle) > fov/2) return;
            
            // Calcular posición en pantalla
            const canvasWidth = ctx.canvas.width;
            const canvasHeight = ctx.canvas.height;
            const screenX = (canvasWidth/2) + (angle/(fov/2)) * (canvasWidth/2);
            
            // Calcular tamaño basado en distancia
            const spriteHeight = (canvasHeight * 1.75) / distance;
            const spriteWidth = spriteHeight / 2.5;
            
            // Calcular posición Y
            const screenY = (canvasHeight/2) - (spriteHeight/2);
            
            // Dibujar sprite
            const sprite = this.sprites[enemy.type];
            
            ctx.save();
            
            // Ajustar transparencia según distancia
            const alpha = Math.max(0.4, Math.min(1.0, 1.2 - distance/15));
            ctx.globalAlpha = alpha;
            
            // Dibujar sprite
            ctx.drawImage(
              sprite,
              screenX - spriteWidth/2,
              screenY,
              spriteWidth,
              spriteHeight
            );
            
            ctx.restore();
          }
        };
        
        // Integrar con DoomGame
        if (!DoomGame.originalRenderSprites) {
          DoomGame.originalRenderSprites = DoomGame.renderSprites || function(){};
        }
        
        DoomGame.renderSprites = function() {
          // Primero ejecutar el renderizado original si existe
          if (typeof DoomGame.originalRenderSprites === 'function') {
            DoomGame.originalRenderSprites.call(DoomGame);
          }
          
          // Luego renderizar con nuestro sistema
          if (this.ctx && this.enemies && this.player) {
            this.enemies.forEach(enemy => {
              if (enemy.health > 0) {
                window.EnemySpriteSystem.renderEnemySprite(this.ctx, enemy, this.player);
              }
            });
          }
        };
      }
      
      // Cargar sprites manualmente
      loadSpritesManually();
    }
    
    /**
     * Carga sprites manualmente cuando no hay sistema de sprites
     */
  function loadSpritesManually() {
      console.log('🔄 Cargando sprites manualmente...');
      
      const spriteSystem = window.EnemySpriteSystem || window.SpriteSystem;
      
      if (!spriteSystem || !spriteSystem.sprites) {
        console.warn('⚠️ No hay sistema de sprites para cargar');
        return;
      }
      
      // Primero intentar encontrar en el DOM
      const foundInDOM = findSpritesInDOM(SPRITE_TYPES);
      
      if (foundInDOM === SPRITE_TYPES.length) {
        console.log('✅ Todos los sprites encontrados en el DOM');
        spriteSystem.loading = false;
        return;
      }
      
      // Si no encontramos todos, crear respaldos SIN dibujo (totalmente transparentes)
      SPRITE_TYPES.forEach(type => {
        if (!spriteSystem.sprites[type]) {
          console.log(`🔧 Creando respaldo TRANSPARENTE para '${type}'`);

          // Si existe el creador oficial de respaldos, usarlo (ya es transparente)
          if (typeof spriteSystem.createFallbackSprite === 'function') {
            spriteSystem.sprites[type] = spriteSystem.createFallbackSprite(type);
          } else {
            // Crear un canvas transparente como respaldo neutral
            const canvas = document.createElement('canvas');
            // Mantener proporciones humanas aproximadas si hay config global
            const baseW = 256;
            const humanRatio = (window.SPRITE_CONFIG && window.SPRITE_CONFIG.HUMAN_RATIO) || 2.5;
            canvas.width = baseW;
            canvas.height = Math.floor(baseW * humanRatio);
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Marcar bandera para reconocerlo como fallback
            canvas.__isFallback = true;
            spriteSystem.sprites[type] = canvas;
          }

          if (typeof spriteSystem.loadedCount === 'number') {
            spriteSystem.loadedCount++;
          }
        }
      });
      
      // Actualizar estado
      spriteSystem.loading = false;
      
      // Asegurarse de que los enemigos tengan tipos válidos
      if (window.DoomGame && window.DoomGame.enemies) {
        window.DoomGame.enemies.forEach((enemy, index) => {
          if (!enemy.type || !SPRITE_TYPES.includes(enemy.type)) {
            enemy.type = SPRITE_TYPES[index % SPRITE_TYPES.length];
          }
        });
      }
      
      // Forzar renderizado
      if (window.DoomGame && typeof window.DoomGame.render === 'function') {
        window.DoomGame.render();
      }
    }
    
    /**
     * Añade una imagen al DOM
     * @param {HTMLImageElement} img - La imagen a añadir
     * @param {string} type - El tipo de sprite
     */
    function addImageToDOM(img, type) {
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
    }
  }
})();

console.log('%c 🔧 SISTEMA DE CORRECCIÓN DE SPRITES CARGADO ', 'background: #a50; color: white; font-size: 14px; padding: 5px;');
