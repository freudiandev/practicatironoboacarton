class MenuManager {
  constructor() {
    this.currentMenu = 'main';
    this.menu = document.getElementById('menu');
    this.canvas = document.getElementById('gameCanvas');
    this.gameInfo = document.getElementById('gameInfo');
    this.game = null;
    this.setupEvents();
  }

  setupEvents() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('menu-button')) {
        const action = e.target.dataset.action;
        switch(action) {
          case 'start': this.startGame(); break;
          case 'instructions': this.showInstructions(); break;
          case 'credits': this.showCredits(); break;
        }
      }
    });
  }

  showMainMenu() {
    this.currentMenu = 'main';
    this.menu.style.display = 'block';
    this.canvas.style.display = 'none';
    this.gameInfo.style.display = 'none';
    
    this.menu.innerHTML = `
      <h1>🎯 DOOM NOBOA</h1>
      <p>¡Practica tu puntería contra Noboa de cartón!</p>
      <button class="menu-button" data-action="start">🚀 Iniciar Juego</button>
      <button class="menu-button" data-action="instructions">📖 Instrucciones</button>
      <button class="menu-button" data-action="credits">👨‍💻 Créditos</button>
    `;
  }

  startGame() {
    this.menu.style.display = 'none';
    this.canvas.style.display = 'block';
    this.gameInfo.style.display = 'block';
    
    setTimeout(() => {
      try {
        this.game = new DoomGame();
        if (this.game.init()) {
          this.game.start();
          console.log('✅ Juego iniciado correctamente');
        } else {
          throw new Error('Error en la inicialización del juego');
        }
      } catch (error) {
        console.error('❌ Error al iniciar el juego:', error);
        this.showMainMenu();
      }
    }, 100);
  }

  showInstructions() {
    this.menu.innerHTML = `
      <h1>📖 INSTRUCCIONES</h1>
      <div style="text-align: left; max-width: 500px; margin: 0 auto;">
        <h3>🎯 Objetivo:</h3>
        <p>Dispara a todos los Noboas de cartón.</p>
        <h3>🕹️ Controles:</h3>
        <p>• WASD - Mover</p>
        <p>• Mouse - Apuntar y mover crosshair</p>
        <p>• Click/Espacio - Disparar</p>
        <p>• ESC - Menú</p>
        <h3>💀 Combate:</h3>
        <p>• Cabeza: 75 puntos de daño</p>
        <p>• Cuerpo: 25 puntos de daño</p>
        <p>• Enemigos tienen 100 HP</p>
      </div>
      <button class="menu-button" onclick="menuManager.showMainMenu()">🔙 Volver</button>
    `;
  }

  showCredits() {
    this.menu.innerHTML = `
      <h1>👨‍💻 CRÉDITOS</h1>
      <p>Desarrollado por: Samy y Álex</p>
      <p>Motor: JavaScript + Canvas</p>
      <p>Con asistencia de: GitHub Copilot</p>
      <button class="menu-button" onclick="menuManager.showMainMenu()">🔙 Volver</button>
    `;
  }
}

window.MenuManager = MenuManager;
