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
    
    
    this.menuActive = false;
    this.gameStarted = true;
    
    // Inicializar el juego si no está iniciado
    this.initializeGameEngine();
    
    
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
    // Intentar usar el nuevo sistema DOOM-INTERMEDIO
    const tryInitialize = () => {
      if (window.doomGame && typeof window.doomGame.start === 'function') {
        try {
          console.log('🎯 Iniciando DOOM Intermedio...');
          window.doomGame.start();
          console.log('✅ DOOM Intermedio iniciado exitosamente');
        } catch (error) {
          console.error('❌ Error al iniciar DOOM Intermedio:', error);
          // Fallback a otros sistemas
          this.tryAlternativeGameSystems();
        }
      } else if (typeof UnifiedGame !== 'undefined' && !window.unifiedGame) {
        try {
          console.log('🎯 Fallback: Inicializando motor unificado...');
          window.unifiedGame = new UnifiedGame();
          window.unifiedGame.start();
          console.log('✅ Motor unificado inicializado exitosamente');
        } catch (error) {
          console.error('❌ Error al inicializar motor unificado:', error);
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
  
  tryAlternativeGameSystems() {
    console.log('🔄 Intentando sistemas alternativos...');
    
    // Lista de sistemas de juego alternativos
    const alternatives = [
      () => window.unifiedGame && window.unifiedGame.start(),
      () => window.startGame && window.startGame(),
      () => window.init && window.init(),
      () => typeof gameLoop === 'function' && gameLoop()
    ];
    
    for (let alternative of alternatives) {
      try {
        alternative();
        console.log('✅ Sistema alternativo iniciado');
        return;
      } catch (error) {
        console.log('⚠️ Sistema alternativo falló, probando siguiente...');
      }
    }
    
    console.error('❌ No se pudo iniciar ningún sistema de juego');
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

// Inicializar sistema de menú cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.gameMenuSystem = new GameMenuSystem();
  });
} else {
  window.gameMenuSystem = new GameMenuSystem();
}

