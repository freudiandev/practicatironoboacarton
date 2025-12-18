/**
 * Inspector de DoomGame - Diagnostica problemas con la integración de sprites
 */
(function() {
  console.log('🔍 INICIANDO DIAGNÓSTICO DEL SISTEMA DOOM');
  
  // Verifica la disponibilidad del objeto DoomGame
  if (!window.DoomGame) {
    console.error('❌ ERROR CRÍTICO: El objeto DoomGame no está disponible');
    console.log('Posibles causas:');
    console.log('1. El archivo game-all-in-one.js no se cargó correctamente');
    console.log('2. Hay un error de sintaxis en el código que impide la creación del objeto');
    console.log('3. El objeto DoomGame se llama con otro nombre (DOOM, Game, etc.)');
    
    // Intenta identificar nombres alternativos
    const possibleNames = ['DOOM', 'Game', 'DoomEngine', 'Engine', 'GameEngine'];
    possibleNames.forEach(name => {
      if (window[name]) {
        console.log(`⚠️ Se encontró un objeto potencial: window.${name}`);
      }
    });
    
    // Buscar cualquier propiedad que podría ser el juego
    let gameObjects = [];
    for (const prop in window) {
      if (typeof window[prop] === 'object' && window[prop] !== null) {
        // Buscar propiedades típicas de un motor de juego
        const obj = window[prop];
        if (
          (typeof obj.render === 'function' || typeof obj.draw === 'function') &&
          (typeof obj.update === 'function' || typeof obj.gameLoop === 'function') &&
          (obj.player || obj.camera || obj.enemies)
        ) {
          gameObjects.push(prop);
          console.log(`🔍 Posible objeto de juego encontrado: window.${prop}`);
        }
      }
    }
    
    if (gameObjects.length === 0) {
      console.error('❌ No se encontraron objetos alternativos del juego');
    }
    
    return;
  }
  
  // Inicia el diagnóstico del motor del juego
  console.log('✅ DoomGame encontrado, iniciando diagnóstico completo...');
  
  // 1. Verificar estructura básica
  const hasCanvas = !!document.getElementById('game-container');
  console.log(`1. Contenedor de juego: ${hasCanvas ? '✅' : '❌'}`);
  
  // 2. Verificar propiedades críticas
  const checks = {
    'canvas': !!DoomGame.canvas,
    'ctx': !!DoomGame.ctx,
    'player': !!DoomGame.player,
    'enemies': Array.isArray(DoomGame.enemies),
    'map': !!DoomGame.map,
    'gameLoop': typeof DoomGame.gameLoop === 'function',
    'render': typeof DoomGame.render === 'function' || typeof DoomGame.draw === 'function',
    'renderSprites': typeof DoomGame.renderSprites === 'function',
    'update': typeof DoomGame.update === 'function',
  };
  
  console.log('2. Propiedades críticas:');
  for (const [prop, result] of Object.entries(checks)) {
    console.log(`   - ${prop}: ${result ? '✅' : '❌'}`);
  }
  
  // 3. Verificar enemigos
  if (checks.enemies && DoomGame.enemies) {
    console.log(`3. Enemigos: ${DoomGame.enemies.length} encontrados`);
    if (DoomGame.enemies.length > 0) {
      const enemy = DoomGame.enemies[0];
      console.log('   Ejemplo de enemigo:');
      console.log(`   - Posición: (${enemy.x?.toFixed(2) || '?'}, ${enemy.z?.toFixed(2) || '?'})`);
      console.log(`   - Tipo: ${enemy.type || 'no definido'}`);
      console.log(`   - Salud: ${enemy.health || 'no definido'}`);
      
      // Verificar si los enemigos tienen la propiedad type requerida
      const enemiesWithType = DoomGame.enemies.filter(e => e.type);
      console.log(`   - Enemigos con tipo definido: ${enemiesWithType.length}/${DoomGame.enemies.length}`);
      
      if (enemiesWithType.length === 0) {
        console.error('❌ ERROR: Ningún enemigo tiene la propiedad "type" definida');
        console.log('   Esto es necesario para el sistema de sprites. Debe ser "casual", "deportivo" o "presidencial"');
        
        // Sugerir solución automática
        console.log('   Aplicando solución temporal: asignar tipos aleatorios a los enemigos...');
        const types = ['casual', 'deportivo', 'presidencial'];
        DoomGame.enemies.forEach((enemy, index) => {
          enemy.type = types[index % 3];
        });
        console.log('   ✅ Tipos asignados a los enemigos');
      }
    }
  } else {
    console.error('❌ ERROR: No hay enemigos definidos o la propiedad enemies no es un array');
  }
  
  // 4. Verificar integración de sprites
  console.log('4. Integración de sprites:');
  const hasSpriteSystem = !!window.EnemySpriteSystem;
  console.log(`   - Sistema de sprites: ${hasSpriteSystem ? '✅' : '❌'}`);
  
  if (hasSpriteSystem) {
    console.log(`   - Estado de carga: ${EnemySpriteSystem.loading ? '⏳ Cargando' : '✅ Completo'}`);
    console.log(`   - Sprites cargados: ${EnemySpriteSystem.loadedCount}/${EnemySpriteSystem.totalSprites}`);
    
    // Verificar cada sprite
    for (const type in EnemySpriteSystem.sprites) {
      const sprite = EnemySpriteSystem.sprites[type];
      console.log(`   - Sprite ${type}: ${sprite ? '✅' : '❌'}`);
    }
    
    // Verificar integración con DoomGame
    const renderSpritesExists = typeof DoomGame.renderSprites === 'function';
    console.log(`   - Función renderSprites: ${renderSpritesExists ? '✅' : '❌'}`);
    
    // Verificar si gameLoop está usando renderSprites
    if (typeof DoomGame.gameLoop === 'function') {
      const gameLoopStr = DoomGame.gameLoop.toString();
      const callsRenderSprites = gameLoopStr.includes('renderSprites');
      console.log(`   - gameLoop llama a renderSprites: ${callsRenderSprites ? '✅' : '❌'}`);
      
      if (!callsRenderSprites) {
        console.warn('⚠️ gameLoop no parece llamar a renderSprites. Los sprites podrían no mostrarse.');
        // Sugerencia: Patch manual
        console.log('   Recomendación: Agregar una llamada a renderSprites() después de render() en gameLoop');
      }
    }
  }
  
  // 5. Verificar carga de imágenes
  console.log('5. Carga de imágenes:');
  
  // Verificar si las imágenes existen
  const imageCheck = (src) => {
    const img = new Image();
    img.src = src;
    return new Promise((resolve) => {
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      // Timeout por si acaso
      setTimeout(() => resolve(false), 500);
    });
  };
  
  // Array de imágenes a verificar
  const imagesToCheck = [
    'noboa-casual.png',
    'noboa-deportivo.png',
    'noboa-presidencial.png'
  ];
  
  // Verificar todas las imágenes
  Promise.all(imagesToCheck.map(img => {
    return imageCheck(img).then(exists => {
      console.log(`   - ${img}: ${exists ? '✅' : '❌'}`);
      return exists;
    });
  })).then(results => {
    const allExist = results.every(exists => exists);
    if (!allExist) {
      console.error('❌ ERROR: No se encontraron todas las imágenes de sprites');
      console.log('   Verificar que las imágenes estén en la ruta correcta y con los nombres correctos');
    } else {
      console.log('   ✅ Todas las imágenes de sprites fueron encontradas');
    }
  });
  
  // 6. Acciones correctivas
  console.log('6. Aplicando correcciones:');
  
  // Corregir la función renderSprites si es necesario
  if (hasSpriteSystem && checks.enemies && DoomGame.enemies.length > 0) {
    if (typeof DoomGame.renderSprites !== 'function') {
      console.log('   ⚙️ Creando función renderSprites...');
      
      DoomGame.renderSprites = function() {
        if (this.ctx && this.enemies && this.player) {
          this.enemies.forEach(enemy => {
            if (enemy.health > 0) {
              EnemySpriteSystem.renderEnemySprite(this.ctx, enemy, this.player);
            }
          });
        }
      };
      
      console.log('   ✅ Función renderSprites creada');
    }
    
    // Asegurar que gameLoop llame a renderSprites
    if (typeof DoomGame.gameLoop === 'function') {
      const originalGameLoop = DoomGame.gameLoop;
      console.log('   ⚙️ Modificando gameLoop para llamar a renderSprites...');
      
      DoomGame.gameLoop = function() {
        const result = originalGameLoop.apply(this, arguments);
        
        // Llamar a renderSprites después de render
        if (typeof this.renderSprites === 'function') {
          this.renderSprites();
        }
        
        return result;
      };
      
      console.log('   ✅ Función gameLoop modificada');
    }
    
    // Verificar si los enemigos tienen tipo
    if (DoomGame.enemies.some(e => !e.type)) {
      console.log('   ⚙️ Asignando tipos a los enemigos sin tipo...');
      
      const types = ['casual', 'deportivo', 'presidencial'];
      DoomGame.enemies.forEach((enemy, index) => {
        if (!enemy.type) {
          enemy.type = types[index % 3];
        }
      });
      
      console.log('   ✅ Tipos asignados a todos los enemigos');
    }
  }
  
  console.log('🏁 DIAGNÓSTICO COMPLETO');
})();
