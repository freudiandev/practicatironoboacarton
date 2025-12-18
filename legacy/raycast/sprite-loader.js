/**
 * Cargador de Sprites de Emergencia
 * Este script intenta cargar los sprites como elementos HTML regulares
 * para asegurar que estén disponibles para el juego.
 */
(function() {
  console.log('🚨 Iniciando cargador de sprites de emergencia...');
  
  // Sprites que necesitamos cargar
  const spritesToLoad = [
    { name: 'casual', url: 'noboa-casual.png' },
    { name: 'deportivo', url: 'noboa-deportivo.png' },
    { name: 'presidencial', url: 'noboa-presidencial.png' }
  ];
  
  // Posibles prefijos de ruta
  const pathPrefixes = [
    '',                    // Raíz del proyecto
    'assets/images/',
    'assets/img/',
    'img/',
    'images/',
    'assets/',
    './'                   // Directorio actual
  ];
  
  // Crear un contenedor oculto para almacenar las imágenes
  function createHiddenContainer() {
    const container = document.createElement('div');
    container.id = 'hidden-sprite-container';
    container.style.position = 'absolute';
    container.style.width = '1px';
    container.style.height = '1px';
    container.style.overflow = 'hidden';
    container.style.opacity = '0.01';  // Casi invisible pero no del todo para que se cargue
    container.style.pointerEvents = 'none';
    container.style.zIndex = '-1000';
    document.body.appendChild(container);
    return container;
  }
  
  // Intentar cargar un sprite desde múltiples rutas
  function loadSprite(sprite, container) {
    let loadedImg = null;
    let loadAttempts = 0;
    
    // Intentar cargar desde diferentes rutas
    pathPrefixes.forEach((prefix, index) => {
      const path = prefix + sprite.url;
      const img = document.createElement('img');
      img.id = `sprite-${sprite.name}-${index}`;
      img.dataset.name = sprite.name;
      img.dataset.path = path;
      img.alt = `Sprite ${sprite.name}`;
      
  // Evento de carga exitosa
      img.onload = function() {
        if (!loadedImg) {
          loadedImg = this;
          console.log(`✅ Sprite ${sprite.name} cargado desde ${path}`);
          
          // Destacar el éxito en la consola
          console.log(`%c ✅ SPRITE HTML CARGADO: ${path} `, 'background: #080; color: white; font-size: 14px; padding: 5px;');
          
          // Almacenar referencia global para que sea accesible desde el sistema de sprites
          window[`htmlSprite_${sprite.name}`] = this;
          
          // Si está disponible el sistema de sprites, actualizar directamente
          if (window.EnemySpriteSystem && window.EnemySpriteSystem.sprites) {
            if (!window.EnemySpriteSystem.sprites[sprite.name]) {
              // Procesar el sprite si el sistema ya está inicializado
              if (typeof window.EnemySpriteSystem.processSprite === 'function') {
                window.EnemySpriteSystem.sprites[sprite.name] = 
                  window.EnemySpriteSystem.processSprite(this, sprite.name);
                window.EnemySpriteSystem.loadedCount++;
                
                // Actualizar estado de carga
                if (window.EnemySpriteSystem.loadedCount >= window.EnemySpriteSystem.totalSprites) {
                  window.EnemySpriteSystem.loading = false;
                }
              }
            }
          }
          
          // Notificar mediante evento personalizado
          const event = new CustomEvent('spriteLoaded', { 
            detail: { name: sprite.name, path: path, element: this } 
          });
          document.dispatchEvent(event);
        }
        
  // Estilizar para indicar que se cargó correctamente
  this.style.border = '2px solid green';
      };
      
      // Evento de error
      img.onerror = function() {
        loadAttempts++;
  this.style.border = '2px solid red';
        if (loadAttempts >= pathPrefixes.length) {
          console.warn(`❌ No se pudo cargar el sprite ${sprite.name} desde ninguna ruta`);
        }
      };
      
      // Añadir al contenedor
      container.appendChild(img);
      
      // Intentar cargar la imagen
      img.src = path;
    });
  }
  
  // Función principal para iniciar la carga
  function initEmergencyLoader() {
    console.log('🔄 Iniciando carga de sprites como elementos HTML...');
    
    // Crear contenedor oculto
    const container = createHiddenContainer();
    
    // Cargar cada sprite
    spritesToLoad.forEach(sprite => {
      loadSprite(sprite, container);
    });
    
    // Verificar después de un tiempo si se han cargado los sprites
    setTimeout(checkLoadStatus, 3000);
  }
  
  // Verificar estado de carga
  function checkLoadStatus() {
    const container = document.getElementById('hidden-sprite-container');
    if (!container) return;
    
    const loadedSprites = Array.from(container.querySelectorAll('img'))
      .filter(img => img.complete && img.naturalWidth > 0);
    
    console.log(`📊 Estado de carga: ${loadedSprites.length} sprites cargados mediante HTML`);
    
    // Si no se cargó ninguno, mostrar un mensaje de ayuda
    if (loadedSprites.length === 0) {
      console.error('❌ No se pudo cargar ningún sprite mediante HTML');
      
      // Crear un contenedor visual para permitir carga manual
      createManualUploader();
    }
  }
  
  // Crear un uploader manual para permitir al usuario cargar las imágenes
  function createManualUploader() {
    // Solo crear si no existe ya
    if (document.getElementById('manual-sprite-uploader')) return;
    
    console.log('🆘 Creando cargador manual de sprites...');
    
    // Crear contenedor
    const uploader = document.createElement('div');
    uploader.id = 'manual-sprite-uploader';
    uploader.style.position = 'fixed';
    uploader.style.top = '50%';
    uploader.style.left = '50%';
    uploader.style.transform = 'translate(-50%, -50%)';
    uploader.style.backgroundColor = 'rgba(0,0,0,0.9)';
    uploader.style.color = 'white';
    uploader.style.padding = '20px';
    uploader.style.borderRadius = '10px';
    uploader.style.zIndex = '10000';
    uploader.style.maxWidth = '400px';
    uploader.style.textAlign = 'center';
    uploader.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
    
    // Título
    const title = document.createElement('h2');
    title.textContent = 'Carga manual de sprites';
    title.style.margin = '0 0 15px 0';
    title.style.color = '#ff0';
    uploader.appendChild(title);
    
    // Descripción
    const desc = document.createElement('p');
    desc.textContent = 'No se pudieron cargar los sprites automáticamente. Por favor, selecciona las imágenes manualmente:';
    desc.style.marginBottom = '20px';
    uploader.appendChild(desc);
    
    // Formulario para cada sprite
    spritesToLoad.forEach(sprite => {
      const spriteContainer = document.createElement('div');
      spriteContainer.style.marginBottom = '15px';
      spriteContainer.style.padding = '10px';
      spriteContainer.style.backgroundColor = 'rgba(255,255,255,0.1)';
      spriteContainer.style.borderRadius = '5px';
      
      // Etiqueta
      const label = document.createElement('label');
      label.textContent = `Sprite ${sprite.name} (${sprite.url}): `;
      label.style.display = 'block';
      label.style.marginBottom = '5px';
      label.style.fontWeight = 'bold';
      spriteContainer.appendChild(label);
      
      // Input de archivo
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.dataset.spriteName = sprite.name;
      input.style.marginBottom = '10px';
      
      // Evento de cambio
      input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(event) {
            // Crear imagen con el archivo seleccionado
            const img = new Image();
            img.onload = function() {
              console.log(`✅ Sprite ${sprite.name} cargado manualmente`);
              
              // Almacenar globalmente
              window[`htmlSprite_${sprite.name}`] = this;
              
              // Actualizar en el sistema de sprites si está disponible
              if (window.EnemySpriteSystem && window.EnemySpriteSystem.sprites) {
                if (!window.EnemySpriteSystem.sprites[sprite.name]) {
                  if (typeof window.EnemySpriteSystem.processSprite === 'function') {
                    window.EnemySpriteSystem.sprites[sprite.name] = 
                      window.EnemySpriteSystem.processSprite(this, sprite.name);
                    window.EnemySpriteSystem.loadedCount++;
                    
                    if (window.EnemySpriteSystem.loadedCount >= window.EnemySpriteSystem.totalSprites) {
                      window.EnemySpriteSystem.loading = false;
                    }
                  }
                }
              }
              
              // Mostrar vista previa
              preview.src = event.target.result;
              preview.style.display = 'block';
              
              // Marcar como completado
              spriteContainer.style.backgroundColor = 'rgba(0,255,0,0.2)';
              spriteContainer.style.borderLeft = '4px solid #0f0';
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(file);
        }
      };
      
      spriteContainer.appendChild(input);
      
      // Vista previa
      const preview = document.createElement('img');
      preview.style.maxWidth = '100%';
      preview.style.maxHeight = '100px';
      preview.style.display = 'none';
      preview.style.marginTop = '5px';
      preview.style.border = '1px solid #666';
      spriteContainer.appendChild(preview);
      
      uploader.appendChild(spriteContainer);
    });
    
    // Botón para cerrar
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Cerrar';
    closeBtn.style.padding = '8px 15px';
    closeBtn.style.backgroundColor = '#f00';
    closeBtn.style.color = 'white';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '5px';
    closeBtn.style.marginTop = '10px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = function() {
      uploader.style.display = 'none';
    };
    uploader.appendChild(closeBtn);
    
    // Añadir al documento
    document.body.appendChild(uploader);
  }
  
  // Iniciar cargador cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmergencyLoader);
  } else {
    initEmergencyLoader();
  }
  
  // Exponer funciones útiles globalmente
  window.spriteEmergency = {
    reload: initEmergencyLoader,
    check: checkLoadStatus,
    manual: createManualUploader
  };
})();
