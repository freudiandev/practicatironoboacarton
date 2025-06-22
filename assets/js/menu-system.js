/**
 * SISTEMA DE MENÚ PRINCIPAL
 * Maneja navegación, paneles de información y inicio del juego
 */

console.log('🎮 === SISTEMA DE MENÚ PRINCIPAL CARGADO ===');

class GameMenuSystem {
  constructor() {
    this.menuActive = true;
    this.gameStarted = false;
    this.currentPanel = null;
    
    this.initializeMenu();
    this.setupEventListeners();
    
    console.log('✅ Sistema de menú inicializado');
  }
  
  initializeMenu() {
    // Asegurar que el menú esté visible al cargar
    const mainMenu = document.getElementById('mainMenu');
    const gameCanvas = document.getElementById('gameCanvas');
    
    if (mainMenu) {
      mainMenu.style.display = 'flex';
    }
    
    if (gameCanvas) {
      gameCanvas.style.display = 'none';
      gameCanvas.classList.remove('active');
    }
    
    // Ocultar panel de debug inicialmente
    const debugPanel = document.getElementById('debugPanel');
    if (debugPanel) {
      debugPanel.style.display = 'none';
    }
  }
  
  setupEventListeners() {
    // Botón Iniciar Juego
    document.getElementById('startGame')?.addEventListener('click', () => {
      this.startGame();
    });
    
    // Botón Controles
    document.getElementById('showControls')?.addEventListener('click', () => {
      this.showPanel('controlsPanel');
    });
    
    // Botón Donaciones
    document.getElementById('showDonations')?.addEventListener('click', () => {
      this.showPanel('donationsPanel');
    });
    
    // Botón Créditos
    document.getElementById('showCredits')?.addEventListener('click', () => {
      this.showPanel('creditsPanel');
    });
    
    // Botones de cerrar paneles
    document.getElementById('closeControls')?.addEventListener('click', () => {
      this.closePanel('controlsPanel');
    });
    
    document.getElementById('closeDonations')?.addEventListener('click', () => {
      this.closePanel('donationsPanel');
    });
    
    document.getElementById('closeCredits')?.addEventListener('click', () => {
      this.closePanel('creditsPanel');
    });
    
    // Cerrar paneles con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.currentPanel) {
          this.closePanel(this.currentPanel);
        } else if (!this.menuActive && this.gameStarted) {
          this.showMenu();
        }
      }
    });
    
    // Cerrar paneles haciendo clic fuera
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('info-panel')) {
        this.closePanel(this.currentPanel);
      }
    });
  }
  
  startGame() {
    console.log('🚀 Iniciando juego...');
    
    // Ocultar menú principal
    const mainMenu = document.getElementById('mainMenu');
    if (mainMenu) {
      mainMenu.style.display = 'none';
    }
    
    // Mostrar canvas del juego
    const gameCanvas = document.getElementById('gameCanvas');
    if (gameCanvas) {
      gameCanvas.style.display = 'block';
      gameCanvas.classList.add('active');
    }
    
    // Mostrar panel de debug
    const debugPanel = document.getElementById('debugPanel');
    if (debugPanel) {
      debugPanel.style.display = 'block';
    }
    
    this.menuActive = false;
    this.gameStarted = true;
    
    // Inicializar el juego si no está iniciado
    this.initializeGameEngine();
    
    // Registrar en learning memory
    if (window.learningMemory) {
      window.learningMemory.logEvent('GAME_STARTED_FROM_MENU', {
        timestamp: Date.now(),
        menuSystem: 'active'
      });
    }
    
    console.log('✅ Juego iniciado desde menú');
  }
  
  showMenu() {
    console.log('🎮 Mostrando menú principal...');
    
    // Mostrar menú
    const mainMenu = document.getElementById('mainMenu');
    if (mainMenu) {
      mainMenu.style.display = 'flex';
    }
    
    // Ocultar canvas del juego
    const gameCanvas = document.getElementById('gameCanvas');
    if (gameCanvas) {
      gameCanvas.style.display = 'none';
      gameCanvas.classList.remove('active');
    }
    
    // Ocultar panel de debug
    const debugPanel = document.getElementById('debugPanel');
    if (debugPanel) {
      debugPanel.style.display = 'none';
    }
    
    this.menuActive = true;
    
    // Liberar pointer lock si está activo
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }
  
  showPanel(panelId) {
    console.log(`📱 Mostrando panel: ${panelId}`);
    
    const panel = document.getElementById(panelId);
    if (panel) {
      panel.classList.add('active');
      this.currentPanel = panelId;
    }
  }
  
  closePanel(panelId) {
    if (!panelId) return;
    
    console.log(`❌ Cerrando panel: ${panelId}`);
    
    const panel = document.getElementById(panelId);
    if (panel) {
      panel.classList.remove('active');
    }
    
    this.currentPanel = null;
  }
  
  initializeGameEngine() {
    // Esperar a que el motor del juego esté disponible
    const tryInitialize = () => {
      if (typeof UnifiedGame !== 'undefined' && !window.unifiedGame) {
        try {
          console.log('🎯 Inicializando motor del juego...');
          window.unifiedGame = new UnifiedGame();
          window.unifiedGame.start();
          console.log('✅ Motor del juego inicializado exitosamente');
        } catch (error) {
          console.error('❌ Error al inicializar motor del juego:', error);
        }
      } else if (window.unifiedGame) {
        console.log('✅ Motor del juego ya estaba inicializado');
      } else {
        console.log('⏳ Esperando motor del juego...');
        setTimeout(tryInitialize, 500);
      }
    };
    
    tryInitialize();
  }
  
  // Método para alternar entre menú y juego
  toggleGameMenu() {
    if (this.menuActive) {
      this.startGame();
    } else {
      this.showMenu();
    }
  }
  
  // Getter para estado del menú
  isMenuActive() {
    return this.menuActive;
  }
  
  isGameStarted() {
    return this.gameStarted;
  }
}

// Función para copiar texto al portapapeles (para donaciones)
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      console.log('📋 Copiado al portapapeles:', text);
      
      // Mostrar notificación visual
      showNotification(`📋 Copiado: ${text}`);
    }).catch(err => {
      console.error('❌ Error al copiar:', err);
      // Fallback para navegadores más antiguos
      fallbackCopyTextToClipboard(text);
    });
  } else {
    fallbackCopyTextToClipboard(text);
  }
}

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Evitar scroll hacia abajo en iOS
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      console.log('📋 Copiado al portapapeles (fallback):', text);
      showNotification(`📋 Copiado: ${text}`);
    } else {
      console.error('❌ No se pudo copiar al portapapeles');
      showNotification('❌ Error al copiar');
    }
  } catch (err) {
    console.error('❌ Error al copiar:', err);
    showNotification('❌ Error al copiar');
  }
  
  document.body.removeChild(textArea);
}

function showNotification(message) {
  // Crear notificación temporal
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 140, 0, 0.95);
    color: #000;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    z-index: 9999;
    animation: notificationSlide 0.3s ease-out;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  `;
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Agregar animación CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes notificationSlide {
      from {
        transform: translateX(-50%) translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Eliminar después de 3 segundos
  setTimeout(() => {
    notification.style.animation = 'notificationSlide 0.3s ease-out reverse';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    }, 300);
  }, 3000);
}

// Inicializar sistema de menú cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.gameMenuSystem = new GameMenuSystem();
  });
} else {
  window.gameMenuSystem = new GameMenuSystem();
}

// Hacer disponible globalmente
window.GameMenuSystem = GameMenuSystem;

console.log('🎮 Sistema de menú cargado y listo');
console.log('📞 Comandos disponibles:');
console.log('  window.gameMenuSystem.startGame() - Iniciar juego');
console.log('  window.gameMenuSystem.showMenu() - Mostrar menú');
console.log('  window.gameMenuSystem.toggleGameMenu() - Alternar menú/juego');
