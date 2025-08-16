/**
 * Sprite Tester - Verifica que los sprites se carguen correctamente
 */
(function() {
  // Verificar si el sistema de sprites ya está cargado
  if (!window.EnemySpriteSystem) {
    console.error('❌ El sistema de sprites no está cargado');
    return;
  }
  
  console.log('🧪 Iniciando prueba de carga de sprites...');
  
  // Función para verificar y mostrar imágenes
  function checkSprites() {
    const spriteSystem = window.EnemySpriteSystem;
    
    // Verificar el estado de carga
    if (spriteSystem.loading) {
      console.log('⏳ Los sprites aún se están cargando...');
      setTimeout(checkSprites, 1000);
      return;
    }
    
    console.log('✅ Verificación de sprites completada');
    
    // Mostrar información sobre los sprites cargados
    const types = ['casual', 'deportivo', 'presidencial'];
    types.forEach(type => {
      const sprite = spriteSystem.sprites[type];
      if (sprite) {
        console.log(`✅ Sprite "${type}" cargado - Tamaño: ${sprite.width}x${sprite.height}`);
      } else {
        console.error(`❌ Sprite "${type}" no pudo cargarse`);
      }
    });
    
    // Verificar la integración con DoomGame
    if (window.DoomGame) {
      if (typeof window.DoomGame.renderSprites === 'function') {
        console.log('✅ Función renderSprites integrada correctamente');
      } else {
        console.error('❌ La función renderSprites no se integró correctamente');
      }
      
      // Verificar si hay enemigos para renderizar
      if (window.DoomGame.enemies && window.DoomGame.enemies.length > 0) {
        console.log(`✅ Hay ${window.DoomGame.enemies.length} enemigos disponibles para renderizar`);
      } else {
        console.warn('⚠️ No hay enemigos para renderizar');
      }
    }
  }
  
  // Iniciar verificación después de un breve retraso
  setTimeout(checkSprites, 2000);
  
  // Crear también un pequeño visor de prueba para los sprites
  function createSpriteTester() {
    // Sólo crear si estamos en modo desarrollo/debug
    if (!window.location.href.includes('debug') && !window.location.href.includes('test')) {
      return;
    }
    
    console.log('🔍 Creando visor de prueba para sprites...');
    
    // Crear el elemento para mostrar los sprites
    const tester = document.createElement('div');
    tester.style.position = 'fixed';
    tester.style.top = '10px';
    tester.style.right = '10px';
    tester.style.backgroundColor = 'rgba(0,0,0,0.8)';
    tester.style.padding = '10px';
    tester.style.border = '1px solid white';
    tester.style.borderRadius = '5px';
    tester.style.zIndex = '9999';
    tester.style.color = 'white';
    tester.style.fontFamily = 'monospace';
    tester.style.fontSize = '12px';
    
    // Título
    const title = document.createElement('h4');
    title.textContent = 'Visor de Sprites';
    title.style.margin = '0 0 10px 0';
    title.style.color = '#00ff00';
    tester.appendChild(title);
    
    // Contenedor para los sprites
    const spriteContainer = document.createElement('div');
    spriteContainer.style.display = 'flex';
    spriteContainer.style.flexDirection = 'column';
    spriteContainer.style.gap = '10px';
    tester.appendChild(spriteContainer);
    
    // Agregar al documento
    document.body.appendChild(tester);
    
    // Función para actualizar los sprites
    function updateSpriteTester() {
      // Limpiar contenedor
      spriteContainer.innerHTML = '';
      
      if (!window.EnemySpriteSystem || window.EnemySpriteSystem.loading) {
        const loading = document.createElement('p');
        loading.textContent = 'Cargando sprites...';
        spriteContainer.appendChild(loading);
        return;
      }
      
      // Mostrar cada tipo de sprite
      const types = ['casual', 'deportivo', 'presidencial'];
      types.forEach(type => {
        const sprite = window.EnemySpriteSystem.sprites[type];
        if (!sprite) return;
        
        // Crear contenedor para este sprite
        const spriteItem = document.createElement('div');
        spriteItem.style.textAlign = 'center';
        
        // Etiqueta
        const label = document.createElement('div');
        label.textContent = type.toUpperCase();
        label.style.marginBottom = '5px';
        spriteItem.appendChild(label);
        
        // Canvas del sprite (clonar para no afectar el original)
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 256;
        canvas.style.border = '1px solid #666';
        const ctx = canvas.getContext('2d');
        ctx.drawImage(sprite, 0, 0, canvas.width, canvas.height);
        spriteItem.appendChild(canvas);
        
        // Agregar al contenedor
        spriteContainer.appendChild(spriteItem);
      });
    }
    
    // Actualizar inicialmente y luego cada 2 segundos
    updateSpriteTester();
    setInterval(updateSpriteTester, 2000);
  }
  
  // Crear el visor de prueba cuando el DOM esté listo
  if (document.readyState === 'complete') {
    createSpriteTester();
  } else {
    window.addEventListener('load', createSpriteTester);
  }
})();
