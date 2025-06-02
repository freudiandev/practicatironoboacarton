// Gestión de menús y navegación

window.MenuManager = {
  currentScreen: 'main-menu',
  
  init() {
    console.log('🎮 MenuManager inicializando...');
    this.setupEventListeners();
    this.showMainMenu();
  },
  
  setupEventListeners() {
    console.log('📝 Configurando event listeners...');
    
    // Botón iniciar partida
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      console.log('✅ Botón iniciar encontrado');
      startBtn.addEventListener('click', () => {
        console.log('🎯 Click en botón iniciar detectado');
        this.startGame();
      });
    } else {
      console.error('❌ Botón iniciar NO encontrado');
    }
    
    // Botón puntajes
    const highscoresBtn = document.getElementById('highscores-btn');
    if (highscoresBtn) {
      console.log('✅ Botón puntajes encontrado');
      highscoresBtn.addEventListener('click', () => {
        console.log('🎯 Click en botón puntajes detectado');
        this.showHighscores();
      });
    } else {
      console.warn('⚠️ Botón puntajes NO encontrado');
    }
    
    // Botón donaciones
    const donateBtn = document.getElementById('donate-btn');
    if (donateBtn) {
      console.log('✅ Botón donaciones encontrado');
      donateBtn.addEventListener('click', () => {
        console.log('🎯 Click en botón donaciones detectado');
        window.open('donaciones.html', '_blank');
      });
    } else {
      console.warn('⚠️ Botón donaciones NO encontrado');
    }
    
    // Botón volver al menú
    const backBtn = document.getElementById('back-to-menu-btn');
    if (backBtn) {
      console.log('✅ Botón volver encontrado');
      backBtn.addEventListener('click', () => {
        console.log('🎯 Click en botón volver detectado');
        this.showMainMenu();
      });
    } else {
      console.warn('⚠️ Botón volver NO encontrado');
    }
    
    // Tecla ESC para volver al menú
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && this.currentScreen === 'game-screen') {
        console.log('🎯 ESC presionado, volviendo al menú');
        this.showMainMenu();
      }
    });
    
    console.log('📝 Event listeners configurados completamente');
  },
  
  hideAllScreens() {
    const screens = ['main-menu', 'highscores-screen', 'game-screen'];
    screens.forEach(screenId => {
      const screen = document.getElementById(screenId);
      if (screen) {
        screen.classList.add('hidden');
      }
    });
  },
  
  showScreen(screenId) {
    console.log(`📺 Intentando mostrar pantalla: ${screenId}`);
    this.hideAllScreens();
    const screen = document.getElementById(screenId);
    if (screen) {
      screen.classList.remove('hidden');
      this.currentScreen = screenId;
      console.log(`✅ Pantalla mostrada: ${screenId}`);
    } else {
      console.error(`❌ Pantalla no encontrada: ${screenId}`);
    }
  },
  
  showMainMenu() {
    console.log('🏠 Mostrando menú principal');
    this.showScreen('main-menu');
    
    // Detener el juego si está corriendo
    if (window.DoomGame && window.DoomGame.running) {
      console.log('🛑 Deteniendo juego...');
      window.DoomGame.stop();
    }
  },
  
  showHighscores() {
    console.log('🏆 Mostrando puntajes');
    this.showScreen('highscores-screen');
    this.loadHighscores();
  },
  
  startGame() {
    console.log('🎮 INICIANDO JUEGO...');
    this.showScreen('game-screen');
    
    // Aumentar timeout y añadir más verificaciones
    setTimeout(() => {
      console.log('🔧 Verificando sistemas antes de inicializar...');
      
      // Debug detallado
      console.log('🔍 window.DoomGame:', window.DoomGame);
      console.log('🔍 typeof window.DoomGame:', typeof window.DoomGame);
      if (window.DoomGame) {
        console.log('🔍 DoomGame.init:', typeof window.DoomGame.init);
        console.log('🔍 Métodos disponibles:', Object.keys(window.DoomGame));
      }
      
      try {
        if (window.DoomGame && typeof window.DoomGame.init === 'function') {
          console.log('✅ DoomGame encontrado, inicializando...');
          
          const initResult = window.DoomGame.init();
          console.log('🔧 Resultado de init:', initResult);
          
          window.DoomGame.start();
          console.log('🚀 Juego iniciado exitosamente');
          
        } else {
          console.error('❌ DoomGame no disponible');
          console.log('🔍 window objeto keys:', Object.keys(window).filter(key => key.includes('Doom') || key.includes('Game')));
          
          // Intentar una segunda vez después de más tiempo
          console.log('🔄 Intentando nuevamente en 1 segundo...');
          setTimeout(() => {
            if (window.DoomGame && typeof window.DoomGame.init === 'function') {
              console.log('✅ Segunda oportunidad: DoomGame encontrado');
              window.DoomGame.init();
              window.DoomGame.start();
            } else {
              alert('Error: Sistema de juego no disponible. Verifica que game-all-in-one.js se haya cargado correctamente.');
              this.showMainMenu();
            }
          }, 1000);
        }
      } catch (error) {
        console.error('❌ Error crítico:', error);
        alert('Error crítico: ' + error.message);
        this.showMainMenu();
      }
    }, 500); // Aumentado a 500ms
  },
  
  loadHighscores() {
    const highscoresList = document.getElementById('highscores-list');
    if (!highscoresList) return;
    
    // Cargar puntajes del localStorage
    let highscores = [];
    try {
      const saved = localStorage.getItem('doomHighscores');
      if (saved) {
        highscores = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Error cargando puntajes:', error);
    }
    
    // Mostrar puntajes
    if (highscores.length === 0) {
      highscoresList.innerHTML = '<p>No hay puntajes registrados</p>';
    } else {
      let html = '<h3>Top 10 Jugadores</h3><ol>';
      highscores.slice(0, 10).forEach(score => {
        html += `<li>${score.name}: ${score.score} puntos (${score.date})</li>`;
      });
      html += '</ol>';
      highscoresList.innerHTML = html;
    }
  },
  
  getCurrentScreen() {
    return this.currentScreen;
  },
  
  isGameActive() {
    return this.currentScreen === 'game-screen';
  }
};

// Debug: Verificar si se está cargando
console.log('🎮 MenuManager cargado - esperando DOM...');

// Asegurar que se inicialice cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM listo, inicializando MenuManager...');
    window.MenuManager.init();
  });
} else {
  console.log('📄 DOM ya listo, inicializando MenuManager inmediatamente...');
  window.MenuManager.init();
}
