/**
 * ========================================
 * MÓDULO UNIFICADO DE INICIALIZACIÓN
 * Sistema optimizado de arranque, UI y debugging
 * ========================================
 */

console.log('🎮 Inicializando DOOM: Noboa de Cartón - Sistema Unificado');

// ========================================
// CONFIGURACIÓN GLOBAL OPTIMIZADA
// ========================================
const GameConfig = {
  // Configuración de enemigos mejorada
  enemies: {
    spawnCount: 12, // Aumentado de 4 a 12 enemigos
    types: ['casual', 'deportivo', 'presidencial', 'casual', 'deportivo', 'presidencial'],
    spawnPositions: [
      { x: 5 * 64 + 32, y: 5 * 64 + 32 },
      { x: 10 * 64 + 32, y: 7 * 64 + 32 },
      { x: 8 * 64 + 32, y: 3 * 64 + 32 },
      { x: 12 * 64 + 32, y: 9 * 64 + 32 },
      { x: 6 * 64 + 32, y: 2 * 64 + 32 },
      { x: 14 * 64 + 32, y: 4 * 64 + 32 },
      { x: 3 * 64 + 32, y: 8 * 64 + 32 },
      { x: 11 * 64 + 32, y: 6 * 64 + 32 },
      { x: 7 * 64 + 32, y: 10 * 64 + 32 },
      { x: 9 * 64 + 32, y: 2 * 64 + 32 },
      { x: 4 * 64 + 32, y: 7 * 64 + 32 },
      { x: 13 * 64 + 32, y: 8 * 64 + 32 }
    ]
  },
  debug: {
    enabled: true,
    showFPS: true,
    showEnemyCount: true
  }
};

// ========================================
// SISTEMA DE ERRORES OPTIMIZADO
// ========================================
window.addEventListener('error', (e) => {
  if (!e.filename.includes('404') && !e.message.includes('Failed to load')) {
    console.log('⚠️ Error controlado:', e.message);
  }
});

// ========================================
// SISTEMA DE DEBUGGING UNIFICADO
// ========================================
const DebugSystem = {
  handleKeydown: (e) => {
    if (e.key === 'F1') {
      e.preventDefault();
      DebugSystem.showSystemStatus();
    }
    if (e.key === 'F2') {
      e.preventDefault();
      DebugSystem.showEmergencyStatus();
    }
    if (e.key === 'F3') {
      e.preventDefault();
      DebugSystem.runFullTest();
    }
  },

  showSystemStatus: () => {
    console.log('🔧 F1 - ESTADO DEL SISTEMA:');
    const status = {
      game: typeof window.GAME !== 'undefined',
      enemies: window.GAME ? window.GAME.enemies?.length || 0 : 0,
      player: window.GAME ? `(${Math.round(window.GAME.player?.x || 0)}, ${Math.round(window.GAME.player?.y || 0)})` : 'N/A',
      running: window.GAME ? window.GAME.running : false,
      sprites: window.GAME && window.GAME.enemySprites ? 'Cargados' : 'No disponibles'
    };
    console.table(status);
    
    // Información detallada de enemigos si existen
    if (window.GAME && window.GAME.enemies && window.GAME.enemies.length > 0) {
      console.log('👾 Primeros 5 enemigos:');
      window.GAME.enemies.slice(0, 5).forEach((enemy, i) => {
        console.log(`   ${i+1}. ${enemy.type} - Salud: ${enemy.health} - Pos: (${Math.round(enemy.x)}, ${Math.round(enemy.y)})`);
      });
    }
  },

  showEmergencyStatus: () => {
    console.log('🚨 F2 - SISTEMA DE EMERGENCIA:');
    if (window.SistemaEmergencia) {
      console.log('✅ Sistema de emergencia activo');
    } else {
      console.warn('⚠️ Sistema de emergencia no disponible');
    }
  },

  runFullTest: () => {
    console.log('🧪 F3 - TEST COMPLETO:');
    const test = {
      motor: typeof init === 'function',
      canvas: !!document.getElementById('gameCanvas'),
      enemigos: window.GAME ? window.GAME.enemies?.length || 0 : 0,
      sistemas: typeof window.BalasUnificadas !== 'undefined'
    };
    console.table(test);
  }
};

// ========================================
// SISTEMA DE PANELES UI SIMPLIFICADO
// ========================================
const PanelManager = {
  init: () => {
    PanelManager.setupControls();
    PanelManager.setupDonations();
    PanelManager.setupCredits();
    PanelManager.setupAutoClose();
  },

  setupControls: () => {
    const btn = document.getElementById('showControls');
    const panel = document.getElementById('controlsPanel');
    const close = document.getElementById('closeControls');
    
    if (btn && panel && close) {
      btn.onclick = () => panel.style.display = 'flex';
      close.onclick = () => panel.style.display = 'none';
    }
  },

  setupDonations: () => {
    const btn = document.getElementById('showDonations');
    const panel = document.getElementById('donationsPanel');
    const close = document.getElementById('closeDonations');
    
    if (btn && panel && close) {
      btn.onclick = () => panel.style.display = 'flex';
      close.onclick = () => panel.style.display = 'none';
    }
  },

  setupCredits: () => {
    const btn = document.getElementById('showCredits');
    const panel = document.getElementById('creditsPanel');
    const close = document.getElementById('closeCredits');
    
    if (btn && panel && close) {
      btn.onclick = () => panel.style.display = 'flex';
      close.onclick = () => panel.style.display = 'none';
    }
  },

  setupAutoClose: () => {
    document.addEventListener('click', (e) => {
      const panels = ['controlsPanel', 'donationsPanel', 'creditsPanel'];
      panels.forEach(id => {
        const panel = document.getElementById(id);
        if (panel && panel.style.display === 'flex' && 
            !panel.contains(e.target) && 
            !e.target.closest('.menu-btn')) {
          panel.style.display = 'none';
        }
      });
    });
  }
};

// ========================================
// FUNCIÓN OPTIMIZADA DE INICIALIZACIÓN DEL JUEGO
// ========================================
function iniciarJuego() {
  console.log('🚀 Iniciando juego optimizado...');
  
  try {
    // Ocultar menú
    const menu = document.getElementById('mainMenu');
    if (menu) menu.style.display = 'none';
    
    // Mostrar canvas
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
      canvas.style.display = 'block';
      canvas.style.cursor = 'crosshair';
    }
    
    // Inicializar motor DOOM
    if (typeof init === 'function') {
      init();
      console.log('✅ Motor del juego inicializado');
      // Override spawn inmediato usando MAP global
      if (window.MAP && Array.isArray(MAP)) {
        var freeM = [];
        for (var yy = 0; yy < MAP.length; yy++) {
          for (var xx = 0; xx < MAP[yy].length; xx++) {
            if (MAP[yy][xx] === 0) freeM.push({ x: xx * 32 + 16, y: yy * 32 + 16 });
          }
        }
        if (freeM.length) {
          var sp = freeM[Math.floor(Math.random() * freeM.length)];
          window.GAME.player = { x: sp.x, y: sp.y, angle: 0 };
          console.log('🚩 Spawn override post-init usando MAP:', sp);
        }
      }
    }
    

    
    // Iniciar el juego
    if (typeof startGame === 'function') {
      startGame();
      console.log('✅ Juego iniciado');
      // Posicionar jugador en una celda vacía aleatoria al iniciar
      // Intenta spawn tras carga de mapa de colisiones
      (function waitMapaSpawn(attempts) {
        if (window.GAME && window.GAME.mapaColisiones) {
          var mapa = window.GAME.mapaColisiones;
          var freeCells = [];
          for (var y = 0; y < mapa.length; y++) {
            for (var x = 0; x < mapa[y].length; x++) {
              if (mapa[y][x] === 0) {
                freeCells.push({ x: x * 32 + 16, y: y * 32 + 16 });
              }
            }
          }
          if (freeCells.length > 0) {
            var idx = Math.floor(Math.random() * freeCells.length);
            var spawn = freeCells[idx];
            window.GAME.player = window.GAME.player || { x: spawn.x, y: spawn.y, angle: 0 };
            window.GAME.player.x = spawn.x;
            window.GAME.player.y = spawn.y;
            console.log('🎲 Spawn aleatorio en celda vacía:', spawn);
          }
        } else if (attempts < 10) {
          setTimeout(function() { waitMapaSpawn(attempts + 1); }, 100);
        } else {
          console.warn('⚠️ Mapa no cargado tras varios intentos, spawn de emergencia');
          window.GAME.player = window.GAME.player || { x: 128, y: 128, angle: 0 };
        }
      })(0);
      // Forzar reposicionamiento tras inicio para asegurar spawn en celda libre
      setTimeout(function() {
        if (window.GAME && window.GAME.mapaColisiones) {
          // Spawn aleatorio basado en mapa de colisiones
          var mapa = window.GAME.mapaColisiones;
          var freeCells = [];
          for (var yy = 0; yy < mapa.length; yy++) {
            for (var xx = 0; xx < mapa[yy].length; xx++) {
              if (mapa[yy][xx] === 0) freeCells.push({ x: xx*32+16, y: yy*32+16 });
            }
          }
          if (freeCells.length > 0) {
            var idx2 = Math.floor(Math.random() * freeCells.length);
            var spawn2 = freeCells[idx2];
            window.GAME.player = window.GAME.player || { x: spawn2.x, y: spawn2.y, angle: 0 };
            window.GAME.player.x = spawn2.x;
            window.GAME.player.y = spawn2.y;
            console.log('🔄 Spawn aleatorio forzado post-inicio en celda libre:', spawn2);
          }
        }
      }, 300);
    }
    
    // Sistemas adicionales con delay reducido
    setTimeout(() => {
      initializeAdditionalSystems();
      console.log('🎮 JUEGO LISTO - Sistema optimizado activo');
      console.log(`👾 ${GameConfig.enemies.spawnCount} enemigos Noboa spawneados`);
      console.log('🖱️ Haz clic en la pantalla para capturar el mouse');
      console.log('⌨️ Usa WASD para moverte, clic para disparar, ESC para liberar mouse');
    }, 200); // Reducido de 500ms a 200ms
    
  } catch (error) {
    console.error('❌ Error al iniciar juego:', error);
    alert('Error al iniciar el juego. Revisa la consola para más detalles.');
  }
}

// ========================================
// MEJORA DEL SISTEMA DE ENEMIGOS
// ========================================
// Eliminado: La inicialización y mejora de enemigos ahora es responsabilidad de DOOM-INTERMEDIO.js

// ========================================
// INICIALIZAR SPRITES DE ENEMIGOS
// ========================================
// Eliminado: La inicialización de sprites ahora es responsabilidad de DOOM-INTERMEDIO.js

// ========================================
// VERIFICAR SPRITES DE ENEMIGOS
// ========================================
// Eliminado: El diagnóstico de sprites se realiza desde el sistema centralizado en DOOM-INTERMEDIO.js

// ========================================
// INICIALIZACIÓN DE SISTEMAS ADICIONALES
// ========================================
function initializeAdditionalSystems() {
  // Sistema de disparo
  if (window.SistemaDisparo) {
    window.SistemaDisparo.inicializar();
    console.log('✅ Sistema de disparo inicializado');
  }
  
  // Efectos visuales
  if (window.EfectosBala) {
    window.EfectosBala.inicializar();
    console.log('✅ Efectos visuales inicializados');
  }
  
  // Audio
  if (window.Audio8Bits) {
    window.Audio8Bits.inicializar();
    console.log('✅ Audio inicializado');
  }
  
  // Estadísticas de enemigos
  if (GameConfig.debug.showEnemyCount && window.GAME) {
    console.log(`📊 Enemigos activos: ${window.GAME.enemies.length}`);
  }
}

// ========================================
// INICIALIZACIÓN AUTOMÁTICA AL CARGAR DOM
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('📱 DOM cargado - Configurando interfaz optimizada...');
  
  // Configurar botón de inicio
  const startButton = document.getElementById('startGame');
  if (startButton) {
    startButton.addEventListener('click', iniciarJuego);
  }
  
  // Configurar paneles con sistema simplificado
  PanelManager.init();
  
  // Configurar debugging
  // Listener de teclado eliminado para evitar duplicidad. Control centralizado en INICIALIZADOR-CONTROLES-POST-DOOM.js
  
  console.log('✅ Interfaz optimizada configurada correctamente');
});

// ========================================
// UTILIDADES GLOBALES
// ========================================
window.iniciarJuego = iniciarJuego;
window.GameConfig = GameConfig;
window.DebugSystem = DebugSystem;
window.PanelManager = PanelManager;

// Alias para comandos rápidos
window.diag = () => DebugSystem.runFullTest();
window.enemies = () => {
  if (window.GAME && window.GAME.enemies) {
    console.log(`👾 Enemigos: ${window.GAME.enemies.length}`);
    console.table(window.GAME.enemies.map(e => ({
      tipo: e.type,
      salud: e.health,
      posicion: `(${Math.round(e.x)}, ${Math.round(e.y)})`,
      activo: e.active
    })));
  } else {
    console.log('⚠️ No hay enemigos disponibles');
  }
};

// Comando para forzar reinicialización de enemigos
window.respawnEnemies = () => {
  if (window.GAME && typeof window.GAME.initEnemies === 'function') {
    window.GAME.initEnemies();
    console.log('🔄 Enemigos reinicializados');
  } else {
    console.log('⚠️ Juego no inicializado o método no disponible');
  }
};

// Comando para verificar sprites
window.checkSprites = () => {
  if (window.GAME && window.GAME.enemyManager && typeof window.GAME.enemyManager.log === 'function') {
    window.GAME.enemyManager.log('Diagnóstico de sprites solicitado');
    // El overlay y logs avanzados ya están instrumentados en DOOM-INTERMEDIO.js
  } else {
    console.log('⚠️ Sistema de enemigos no disponible');
  }
};

// Comando para forzar spawn de enemigos visible
window.forceSpawn = () => {
  if (!window.GAME) {
    console.log('⚠️ Juego no inicializado');
    return;
  }
  
  console.log('🚀 Forzando spawn de enemigos visibles...');
  
  // Posiciones cerca del jugador para testing
  const testPositions = [
    { x: window.GAME.player.x + 200, y: window.GAME.player.y },
    { x: window.GAME.player.x - 200, y: window.GAME.player.y },
    { x: window.GAME.player.x, y: window.GAME.player.y + 200 },
    { x: window.GAME.player.x, y: window.GAME.player.y - 200 }
  ];
  
  window.GAME.enemies = [];
  
  testPositions.forEach((pos, i) => {
    const type = ['casual', 'deportivo', 'presidencial'][i % 3];
    window.GAME.enemies.push({
      x: pos.x,
      y: pos.y,
      health: 100,
      type: type,
      lastHit: 0,
      id: `test_enemy_${i}`,
      active: true,
      visible: true
    });
  });
  
  console.log(`✅ ${window.GAME.enemies.length} enemigos de prueba creados cerca del jugador`);
};

// Comando para crear enemigos MUY visibles (para testing)
window.enemigosVisibles = () => {
  if (!window.GAME) {
    console.log('⚠️ Juego no inicializado');
    return;
  }
  
  console.log('🎯 Creando enemigos MUY VISIBLES cerca del jugador...');
  
  const playerX = window.GAME.player.x;
  const playerY = window.GAME.player.y;
  const playerAngle = window.GAME.player.angle;
  
  // Calcular posición directamente frente al jugador
  const distance = 150; // Muy cerca
  const frontX = playerX + Math.cos(playerAngle) * distance;
  const frontY = playerY + Math.sin(playerAngle) * distance;
  
  // Limpiar enemigos existentes
  window.GAME.enemies = [];
  
  // Crear enemigos muy visibles
  const testEnemies = [
    // Directamente frente al jugador
    { x: frontX, y: frontY, type: 'casual', name: 'FRENTE' },
    // Un poco a la izquierda
    { x: frontX - 50, y: frontY - 50, type: 'deportivo', name: 'IZQUIERDA' },
    // Un poco a la derecha  
    { x: frontX + 50, y: frontY + 50, type: 'presidencial', name: 'DERECHA' },
    // Muy cerca del jugador
    { x: playerX + 80, y: playerY + 20, type: 'casual', name: 'CERCA' }
  ];
  
  testEnemies.forEach((enemy, i) => {
    window.GAME.enemies.push({
      x: enemy.x,
      y: enemy.y,
      health: 100,
      type: enemy.type,
      lastHit: 0,
      id: `visible_${i}_${enemy.name}`,
      active: true,
      visible: true
    });
    
    console.log(`✅ Enemigo ${enemy.name}: ${enemy.type} en (${Math.round(enemy.x)}, ${Math.round(enemy.y)})`);
  });
  
  console.log(`🎯 ${window.GAME.enemies.length} enemigos súper visibles creados`);
  console.log(`📍 Jugador en: (${Math.round(playerX)}, ${Math.round(playerY)}) mirando ${Math.round(playerAngle * 180 / Math.PI)}°`);
  
  // Forzar verificación inmediata
  setTimeout(() => {
    verifyEnemySprites();
  }, 100);
};

// Comando para debug avanzado de renderizado
window.debugRender = () => {
  if (!window.GAME) {
    console.log('⚠️ Juego no inicializado');
    return;
  }
  
  console.log('🔍 === DEBUG AVANZADO DE RENDERIZADO ===');
  
  const player = window.GAME.player;
  console.log(`🎮 Jugador: (${player.x.toFixed(1)}, ${player.y.toFixed(1)}) @ ${(player.angle * 180 / Math.PI).toFixed(1)}°`);
  console.log(`🎯 FOV: ${(window.GAME.fov * 180 / Math.PI).toFixed(1)}° | Max Distance: ${window.GAME.maxDistance}`);
  
  if (!window.GAME.enemies || window.GAME.enemies.length === 0) {
    console.error('❌ No hay enemigos para debuggear');
    return;
  }
  
  console.log(`\n👾 ANÁLISIS DETALLADO DE ${window.GAME.enemies.length} ENEMIGOS:`);
  
  window.GAME.enemies.forEach((enemy, i) => {
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const distance = Math.sqrt(dx*dx + dy*dy);
    
    // Calcular ángulo del enemigo relativo al jugador
    const enemyAngle = Math.atan2(dy, dx);
    let relativeAngle = enemyAngle - player.angle;
    
    // Normalizar ángulo
    while (relativeAngle > Math.PI) relativeAngle -= 2 * Math.PI;
    while (relativeAngle < -Math.PI) relativeAngle += 2 * Math.PI;
    
    const inFOV = Math.abs(relativeAngle) <= window.GAME.fov/2;
    const inRange = distance <= window.GAME.maxDistance;
    const shouldRender = inFOV && inRange && enemy.active;
    
    // Calcular posición en pantalla
    const screenX = window.GAME.width/2 + (relativeAngle/(window.GAME.fov/2))*(window.GAME.width/2);
    const projPlaneDist = (window.GAME.width / 2) / Math.tan(window.GAME.fov / 2);
    const spriteScale = (window.GAME.tileSize / distance) * projPlaneDist;
    
    console.log(`\n   ${i+1}. ${enemy.type.toUpperCase()} [${enemy.id}]`);
    console.log(`      📍 Posición: (${enemy.x.toFixed(1)}, ${enemy.y.toFixed(1)})`);
    console.log(`      📏 Distancia: ${distance.toFixed(1)} (límite: ${window.GAME.maxDistance})`);
    console.log(`      🎯 Ángulo relativo: ${(relativeAngle * 180 / Math.PI).toFixed(1)}° (FOV: ±${(window.GAME.fov/2 * 180 / Math.PI).toFixed(1)}°)`);
    console.log(`      📺 Pantalla X: ${screenX.toFixed(1)} | Escala: ${spriteScale.toFixed(1)}`);
    console.log(`      ✅ En FOV: ${inFOV} | En rango: ${inRange} | Activo: ${enemy.active}`);
    console.log(`      🎬 DEBE RENDERIZAR: ${shouldRender ? '✅ SÍ' : '❌ NO'}`);
    
    if (shouldRender) {
      console.log(`      🖼️ Sprite disponible: ${!!window.GAME.enemySprites[enemy.type]}`);
    }
  });
  
  // Estadísticas de renderizado
  const visibleEnemies = window.GAME.enemies.filter(enemy => {
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const distance = Math.sqrt(dx*dx + dy*dy);
    const angle = Math.atan2(dy, dx) - player.angle;
    let normalizedAngle = angle;
    while (normalizedAngle > Math.PI) normalizedAngle -= 2 * Math.PI;
    while (normalizedAngle < -Math.PI) normalizedAngle += 2 * Math.PI;
    return Math.abs(normalizedAngle) <= window.GAME.fov/2 && distance <= window.GAME.maxDistance && enemy.active;
  });
  
  console.log(`\n📊 RESUMEN:`);
  console.log(`   Total enemigos: ${window.GAME.enemies.length}`);
  console.log(`   Deberían ser visibles: ${visibleEnemies.length}`);
  console.log(`   Canvas: ${window.GAME.width}x${window.GAME.height}`);
};

// Comando de prueba: renderizar enemigos como círculos para debugging
window.testEnemyRender = () => {
  if (!window.GAME) {
    console.log('⚠️ Juego no inicializado');
    return;
  }
  
  console.log('🔴 MODO TEST: Renderizando enemigos como círculos rojos...');
  
  // Interceptar la función de renderizado para mostrar círculos
  const originalRender = window.renderSpritesOptimized;
  
  window.renderSpritesOptimized = function() {
    if (!GAME.enemies || GAME.enemies.length === 0) {
      console.log('⚠️ No hay enemigos para test render');
      return;
    }
    
    const maxRenderDistance = GAME.maxDistance;
    let testRendered = 0;
    
    GAME.enemies.forEach(function(enemy, index) {
      if (!enemy.active) return;
      
      var dx = enemy.x - GAME.player.x;
      var dy = enemy.y - GAME.player.y;
      var distance = Math.sqrt(dx*dx + dy*dy);
      
      if (distance > maxRenderDistance) return;
      
      var angle = Math.atan2(dy, dx) - GAME.player.angle;
      
      // Normalizar ángulo
      while (angle > Math.PI) angle -= 2 * Math.PI;
      while (angle < -Math.PI) angle += 2 * Math.PI;
      
      // Filtrar por FOV
      if (Math.abs(angle) > GAME.fov/2) return;
      
      var screenX = GAME.width/2 + (angle/(GAME.fov/2))*(GAME.width/2);
      
      // Dibujar círculo rojo grande en lugar de sprite
      const circleSize = Math.max(20, 100 - distance/10); // Tamaño basado en distancia
      const screenY = GAME.height / 2;
      
      // Dibujar círculo rojo
      GAME.ctx.fillStyle = '#ff0000';
      GAME.ctx.beginPath();
      GAME.ctx.arc(screenX, screenY, circleSize, 0, 2 * Math.PI);
      GAME.ctx.fill();
      
      // Dibujar texto identificador
      GAME.ctx.fillStyle = '#ffffff';
      GAME.ctx.font = 'bold 14px Arial';
      GAME.ctx.fillText(`${enemy.type}`, screenX - 20, screenY + 5);
      GAME.ctx.fillText(`${Math.round(distance)}`, screenX - 15, screenY + 20);
      
      testRendered++;
    });
    
    console.log(`🔴 TEST RENDER: ${testRendered} círculos rojos dibujados`);
    
    // overlays originales
    if (GAME.textOverlays) {
      GAME.textOverlays = GAME.textOverlays.filter(function(o){
        if (o.timer > 0) {
          GAME.ctx.fillStyle = 'red';
          GAME.ctx.font = 'bold 16px Arial';
          GAME.ctx.fillText(o.text, o.x, o.y);
          o.timer--;
          return true;
        }
        return false;
      });
    }
  };
  
  console.log('🔴 TEST ACTIVADO: Los enemigos ahora aparecen como círculos rojos');
  console.log('💡 Para revertir, ejecuta: restoreNormalRender()');
};

// Comando para restaurar renderizado normal
window.restoreNormalRender = () => {
  // Aquí necesitaríamos restaurar la función original
  console.log('🔄 Para restaurar el renderizado normal, recarga la página');
};

console.log('✅ Sistema unificado de inicialización cargado correctamente');
