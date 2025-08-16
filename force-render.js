/**
 * Forzador de Renderizado - Script de emergencia para asegurar que los sprites se muestren
 */
(function() {
  console.log('🚀 Iniciando sistema de forzado de renderizado de sprites...');
  
  // Variables para seguimiento
  let renderAttempts = 0;
  const MAX_ATTEMPTS = 10;
  let renderInterval = null;
  
  // Función principal de forzado de renderizado
  function forceRender() {
    if (renderAttempts >= MAX_ATTEMPTS) {
      console.log('✋ Deteniendo intentos de renderizado forzado después de ' + MAX_ATTEMPTS + ' intentos');
      clearInterval(renderInterval);
      return;
    }
    
    renderAttempts++;
    console.log(`🔄 Intento de renderizado forzado #${renderAttempts}...`);
    
    // Verificar si el sistema de sprites está listo
    if (!window.EnemySpriteSystem || window.EnemySpriteSystem.loading) {
      console.log('⏳ Sistema de sprites aún no está listo, esperando...');
      return;
    }
    
    // Verificar si DoomGame está disponible
    if (!window.DoomGame) {
      console.warn('⚠️ DoomGame no está disponible, intentando renderizar sprites independientemente');
      
      // Crear un canvas temporal para demostración
      createDemoCanvas();
      return;
    }
    
    // Intentar forzar un renderizado completo del juego
    console.log('🔄 Forzando renderizado completo del juego...');
    
    try {
      // Realizar un renderizado completo
      if (typeof window.DoomGame.render === 'function') {
        window.DoomGame.render();
      }
      
      // Forzar renderizado de sprites
      if (typeof window.DoomGame.renderSprites === 'function') {
        window.DoomGame.renderSprites();
      }
      
      console.log('✅ Renderizado forzado completado');
      
      // Verificar si hay enemigos
      if (window.DoomGame.enemies && window.DoomGame.enemies.length > 0) {
        console.log(`ℹ️ Hay ${window.DoomGame.enemies.length} enemigos disponibles para renderizar`);
        
        // Verificar si todos los enemigos tienen tipo
        const enemiesWithoutType = window.DoomGame.enemies.filter(e => !e.type).length;
        if (enemiesWithoutType > 0) {
          console.warn(`⚠️ ${enemiesWithoutType} enemigos no tienen tipo definido`);
          
          // Asignar tipos
          const types = ['casual', 'deportivo', 'presidencial'];
          window.DoomGame.enemies.forEach((enemy, index) => {
            if (!enemy.type) {
              enemy.type = types[index % 3];
              console.log(`Asignado tipo ${enemy.type} a enemigo #${index}`);
            }
          });
        }
      } else {
        console.warn('⚠️ No hay enemigos para renderizar');
      }
      
    } catch (e) {
      console.error('❌ Error al forzar renderizado:', e);
    }
  }
  
  // Crear un canvas de demostración para mostrar los sprites si DoomGame no está disponible
  function createDemoCanvas() {
    if (document.getElementById('sprite-demo-canvas')) {
      return; // Ya existe
    }
    
    console.log('🖼️ Creando canvas de demostración para mostrar sprites...');
    
    // Crear contenedor
    const demoContainer = document.createElement('div');
    demoContainer.id = 'sprite-demo-container';
    demoContainer.style.position = 'fixed';
    demoContainer.style.top = '50%';
    demoContainer.style.left = '50%';
    demoContainer.style.transform = 'translate(-50%, -50%)';
    demoContainer.style.backgroundColor = '#000';
    demoContainer.style.padding = '10px';
    demoContainer.style.border = '2px solid #fff';
    demoContainer.style.zIndex = '9999';
    demoContainer.style.textAlign = 'center';
    
    // Título
    const title = document.createElement('h2');
    title.textContent = 'Demostración de Sprites';
    title.style.color = '#fff';
    title.style.margin = '0 0 10px 0';
    demoContainer.appendChild(title);
    
    // Descripción
    const desc = document.createElement('p');
    desc.textContent = 'DoomGame no está disponible. Mostrando sprites cargados:';
    desc.style.color = '#fff';
    desc.style.margin = '0 0 15px 0';
    demoContainer.appendChild(desc);
    
    // Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'sprite-demo-canvas';
    canvas.width = 800;
    canvas.height = 400;
    canvas.style.border = '1px solid #333';
    canvas.style.backgroundColor = '#222';
    demoContainer.appendChild(canvas);
    
    // Botón de cerrar
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Cerrar';
    closeBtn.style.marginTop = '10px';
    closeBtn.style.padding = '5px 10px';
    closeBtn.style.backgroundColor = '#c00';
    closeBtn.style.color = '#fff';
    closeBtn.style.border = 'none';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = function() {
      document.body.removeChild(demoContainer);
    };
    demoContainer.appendChild(closeBtn);
    
    // Agregar al body
    document.body.appendChild(demoContainer);
    
    // Renderizar sprites en el canvas
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar mensaje si no hay sistema de sprites
    if (!window.EnemySpriteSystem) {
      ctx.fillStyle = '#f00';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Sistema de sprites no disponible', canvas.width / 2, canvas.height / 2);
      return;
    }
    
    // Dibujar cada sprite disponible
    const types = ['casual', 'deportivo', 'presidencial'];
    const spriteSystem = window.EnemySpriteSystem;
    
    // Posiciones para cada sprite
    const positions = [
      {x: canvas.width * 0.25, y: canvas.height * 0.5},
      {x: canvas.width * 0.5, y: canvas.height * 0.5},
      {x: canvas.width * 0.75, y: canvas.height * 0.5}
    ];
    
    // Renderizar cada sprite
    types.forEach((type, index) => {
      const sprite = spriteSystem.sprites[type];
      if (!sprite) {
        // Dibujar mensaje de error
        ctx.fillStyle = '#f00';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Sprite '${type}' no disponible`, positions[index].x, positions[index].y);
        return;
      }
      
      // Dibujar sprite
      const spriteWidth = 150;
      const spriteHeight = spriteWidth * SPRITE_CONFIG.HUMAN_RATIO;
      ctx.drawImage(
        sprite,
        positions[index].x - spriteWidth / 2,
        positions[index].y - spriteHeight / 2,
        spriteWidth,
        spriteHeight
      );
      
      // Etiqueta
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(type.toUpperCase(), positions[index].x, positions[index].y + spriteHeight / 2 + 30);
    });
    
    // Instrucciones
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Estos sprites deberían verse en el juego cuando DoomGame esté disponible', canvas.width / 2, canvas.height - 20);
  }
  
  // Iniciar el proceso de forzado de renderizado después de un tiempo
  setTimeout(() => {
    renderInterval = setInterval(forceRender, 1500);
  }, 3000);
  
  // Crear una función global para forzar el renderizado manualmente
  window.forceGameRender = function() {
    console.log('🔄 Forzando renderizado manual...');
    renderAttempts = 0; // Reiniciar contador
    forceRender();
  };
  
  // Crear un botón flotante para forzar el renderizado
  function createForceRenderButton() {
    const btn = document.createElement('button');
    btn.textContent = '🔄 Forzar Renderizado';
    btn.style.position = 'fixed';
    btn.style.bottom = '10px';
    btn.style.right = '10px';
    btn.style.zIndex = '9999';
    btn.style.padding = '10px';
    btn.style.backgroundColor = '#007bff';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '5px';
    btn.style.cursor = 'pointer';
    btn.style.fontWeight = 'bold';
    
    btn.onclick = function() {
      window.forceGameRender();
    };
    
    document.body.appendChild(btn);
  }
  
  // Crear el botón cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createForceRenderButton);
  } else {
    createForceRenderButton();
  }
})();
