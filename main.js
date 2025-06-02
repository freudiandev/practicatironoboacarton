// Variables de control del juego (JavaScript puro)
let gameInitialized = false;
let gameReady = false;
let gameCanvas = null;
let gameLoop = null;

// Protección contra errores de extensiones
const originalConsoleError = console.error;
console.error = function(...args) {
  const message = args.join(' ');
  if (message.includes('message channel closed') || 
      message.includes('listener indicated an asynchronous response')) {
    console.warn('⚠️ Error de extensión ignorado:', message);
    return;
  }
  originalConsoleError.apply(console, args);
};

// === INICIALIZACIÓN DEL JUEGO (SIN P5.JS) ===
function initGame() {
  console.log('🎮 Inicializando juego con JavaScript puro (sin P5.js)');
  
  try {
    // Verificar que CanvasSystem esté disponible
    if (!window.CanvasSystem) {
      console.error('❌ CanvasSystem no disponible');
      return false;
    }
    
    // Inicializar canvas
    gameCanvas = window.CanvasSystem.init('game-container');
    if (!gameCanvas) {
      console.error('❌ No se pudo crear el canvas');
      return false;
    }
    console.log('✅ Canvas nativo inicializado');
    
    // Configurar canvas inicial
    window.CanvasSystem.background(30, 30, 40);
    window.CanvasSystem.fill(255);
    window.CanvasSystem.textAlign('center', 'middle');
    window.CanvasSystem.textSize(24);
    window.CanvasSystem.text('Cargando recursos...', window.CanvasSystem.width/2, window.CanvasSystem.height/2);
    
    // Cargar recursos con protección
    loadGameAssets()
      .then(() => {
        console.log('✅ Recursos cargados, inicializando sistemas...');
        
        // Inicializar sistemas del juego
        if (window.GameCore) {
          window.GameCore.init();
        }
        
        gameReady = true;
        gameInitialized = true;
        console.log('✅ Juego completamente inicializado (JavaScript puro)');
        
        // Actualizar UI y empezar directamente
        window.CanvasSystem.background(30, 30, 40);
        window.CanvasSystem.fill(0, 255, 0);
        window.CanvasSystem.textAlign('center', 'middle');
        window.CanvasSystem.textSize(20);
        window.CanvasSystem.text('¡Presiona cualquier tecla para comenzar!', window.CanvasSystem.width/2, window.CanvasSystem.height/2);
        
        // Auto-iniciar después de un momento
        setTimeout(() => {
          if (window.GameCore) {
            window.GameCore.startGame();
            startGameLoop();
          }
        }, 2000);
        
      })
      .catch(error => {
        console.error('❌ Error cargando recursos:', error);
        
        // Continuar sin recursos
        gameReady = true;
        gameInitialized = true;
        
        window.CanvasSystem.background(60, 30, 30);
        window.CanvasSystem.fill(255, 255, 100);
        window.CanvasSystem.textAlign('center', 'middle');
        window.CanvasSystem.textSize(18);
        window.CanvasSystem.text('Recursos no encontrados - Iniciando con gráficos básicos', window.CanvasSystem.width/2, window.CanvasSystem.height/2);
        
        // Auto-iniciar de todos modos
        setTimeout(() => {
          if (window.GameCore) {
            window.GameCore.init();
            window.GameCore.startGame();
            startGameLoop();
          }
        }, 3000);
      });
    
    return true;
    
  } catch (error) {
    console.error('Error en initGame:', error);
    return false;
  }
}

// === CARGA DE RECURSOS ===
async function loadGameAssets() {
  console.log('📦 Cargando recursos del juego...');
  
  try {
    if (window.AssetManager) {
      window.AssetManager.init();
      
      // Usar forcePreload que maneja fallbacks
      await window.AssetManager.forcePreload();
      console.log('✅ Recursos cargados (con placeholders si es necesario)');
      
      // Verificar carga
      window.AssetManager.reportStatus();
    } else {
      console.error('❌ AssetManager no disponible');
      throw new Error('AssetManager no disponible');
    }
  } catch (error) {
    console.warn('⚠️ Error cargando recursos, continuando:', error);
    // No lanzar error, continuar de todos modos
  }
}

// === LOOP DEL JUEGO ===
function startGameLoop() {
  if (gameLoop) {
    cancelAnimationFrame(gameLoop);
  }
  
  function loop() {
    if (!gameInitialized || !window.GameCore) return;
    
    try {
      // Actualizar controles primero
      if (window.Controls) {
        window.Controls.handleInput();
      }
      
      // Actualizar juego
      if (window.GameCore.update) {
        window.GameCore.update();
      }
      
      // Renderizar
      if (window.GameCore.render) {
        window.GameCore.render();
      }
      
    } catch (error) {
      console.error('Error en loop:', error);
    }
    
    requestAnimationFrame(loop);
  }
  
  loop();
}

function stopGameLoop() {
  if (gameLoop) {
    cancelAnimationFrame(gameLoop);
    gameLoop = null;
  }
}

// === EVENT HANDLERS ===
function setupEventHandlers() {
  if (!gameCanvas) return;
  
  // Eventos de teclado
  document.addEventListener('keydown', (e) => {
    if (window.Controls) {
      window.Controls.keyPressed(e.key, e.keyCode);
    }
  });
  
  document.addEventListener('keyup', (e) => {
    if (window.Controls) {
      window.Controls.keyReleased(e.key, e.keyCode);
    }
  });
  
  // Eventos de mouse
  if (gameCanvas) {
    gameCanvas.addEventListener('mousedown', (e) => {
      if (window.Controls) {
        window.Controls.mousePressed(e.button);
      }
    });
    
    gameCanvas.addEventListener('mousemove', (e) => {
      const rect = gameCanvas.getBoundingClientRect();
      window.mouseX = e.clientX - rect.left;
      window.mouseY = e.clientY - rect.top;
    });
  }
  
  console.log('✅ Event handlers configurados');
}

// === FUNCIONES PÚBLICAS (SIN P5.JS) ===
function startNativeGame() {
  console.log('=== INICIANDO JUEGO (JAVASCRIPT PURO) ===');
  
  if (!gameInitialized) {
    console.log('🔄 Juego no inicializado, iniciando ahora...');
    return initGame();
  }
  
  if (!gameReady) {
    console.warn('⚠️ Juego aún no está completamente listo, forzando inicio...');
  }
  
  if (!window.GameCore) {
    console.error('❌ GameCore no disponible');
    alert('Error: Módulo GameCore no se cargó. Recarga la página.');
    return false;
  }
  
  console.log('✅ Iniciando juego nativo...');
  
  // Forzar inicio inmediato
  if (!window.GameCore.initialized) {
    window.GameCore.init();
  }
  
  window.GameCore.startGame();
  startGameLoop();
  
  return true;
}

function stopNativeGame() {
  console.log('=== DETENIENDO JUEGO ===');
  
  stopGameLoop();
  
  if (window.GameCore) {
    window.GameCore.stopGame();
  }
  
  // Pantalla de pausa
  if (window.CanvasSystem) {
    window.CanvasSystem.background(30, 30, 40);
    window.CanvasSystem.fill(255);
    window.CanvasSystem.textAlign('center', 'middle');
    window.CanvasSystem.textSize(24);
    window.CanvasSystem.text('Juego pausado', window.CanvasSystem.width/2, window.CanvasSystem.height/2);
  }
}

// === EXPORTAR FUNCIONES GLOBALES (SIN P5.JS) ===
window.startNativeGame = startNativeGame;
window.stopNativeGame = stopNativeGame;
window.initGame = initGame;
window.startP5Game = startNativeGame; // Alias para compatibilidad
window.stopP5Game = stopNativeGame; // Alias para compatibilidad
window.mouseX = 0;
window.mouseY = 0;

// === INICIALIZACIÓN AUTOMÁTICA ===
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM cargado, preparando juego JavaScript puro...');
  
  // Esperar a que todos los módulos se carguen
  setTimeout(() => {
    try {
      setupEventHandlers();
      console.log('✅ Juego JavaScript puro preparado para inicialización');
    } catch (error) {
      console.error('Error en inicialización automática:', error);
    }
  }, 100);
});

console.log('main.js (JavaScript puro - sin P5.js) cargado');