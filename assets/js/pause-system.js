// Sistema de pausa del juego

window.PauseSystem = {
  isPaused: false,
  pauseReason: null,
  pauseStartTime: null,
  gameStateBeforePause: null,
  
  init() {
    this.setupPauseControls();
    this.setupAutoResume();
    console.log('⏸️ Sistema de pausa inicializado');
  },
  
  setupPauseControls() {
    // Pausa manual con ESC
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && window.MenuManager && window.MenuManager.isGameActive()) {
        e.preventDefault();
        if (this.isPaused) {
          this.resume('manual');
        } else {
          this.pause('manual');
        }
      }
    });
    
    // Pausa automática al perder foco
    window.addEventListener('blur', () => {
      if (window.MenuManager && window.MenuManager.isGameActive() && !this.isPaused) {
        this.pause('focus-lost');
      }
    });
    
    // Resumir al recuperar foco (opcional)
    window.addEventListener('focus', () => {
      if (this.isPaused && this.pauseReason === 'focus-lost') {
        // Dar una pausa antes de resumir para evitar acciones accidentales
        setTimeout(() => {
          if (this.isPaused && this.pauseReason === 'focus-lost') {
            this.resume('focus-recovered');
          }
        }, 500);
      }
    });
    
    // Detectar cuando el usuario cambia de pestaña
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (window.MenuManager && window.MenuManager.isGameActive() && !this.isPaused) {
          this.pause('tab-hidden');
        }
      } else {
        if (this.isPaused && this.pauseReason === 'tab-hidden') {
          // Auto-resumir después de un breve delay
          setTimeout(() => {
            if (this.isPaused && this.pauseReason === 'tab-hidden') {
              this.resume('tab-visible');
            }
          }, 300);
        }
      }
    });
  },
  
  setupAutoResume() {
    // Detectar clicks en el canvas para resumir rápidamente
    document.addEventListener('click', (e) => {
      if (this.isPaused && this.pauseReason !== 'manual') {
        const gameContainer = document.getElementById('game-container');
        if (gameContainer && gameContainer.contains(e.target)) {
          this.resume('click-resume');
        }
      }
    });
  },
  
  pause(reason = 'unknown') {
    if (this.isPaused) return;
    
    this.isPaused = true;
    this.pauseReason = reason;
    this.pauseStartTime = Date.now();
    
    console.log(`⏸️ Juego pausado: ${reason}`);
    
    // Guardar estado del juego
    this.saveGameState();
    
    // Pausar sistemas del juego
    this.pauseGameSystems();
    
    // Mostrar overlay de pausa
    this.showPauseOverlay();
    
    // Emitir evento personalizado
    window.dispatchEvent(new CustomEvent('gamePaused', { detail: { reason } }));
  },
  
  resume(reason = 'unknown') {
    if (!this.isPaused) return;
    
    const pauseDuration = Date.now() - this.pauseStartTime;
    console.log(`▶️ Juego resumido: ${reason} (pausado por ${pauseDuration}ms)`);
    
    this.isPaused = false;
    this.pauseReason = null;
    this.pauseStartTime = null;
    
    // Restaurar sistemas del juego
    this.resumeGameSystems();
    
    // Ocultar overlay de pausa
    this.hidePauseOverlay();
    
    // Emitir evento personalizado
    window.dispatchEvent(new CustomEvent('gameResumed', { detail: { reason, pauseDuration } }));
  },
  
  saveGameState() {
    this.gameStateBeforePause = {
      playerPosition: window.player ? { x: window.player.x, z: window.player.z } : null,
      playerHealth: window.player ? window.player.health : null,
      enemyCount: window.enemies ? window.enemies.length : 0,
      timestamp: Date.now()
    };
  },
  
  pauseGameSystems() {
    // Pausar el loop principal del juego
    if (window.Game && typeof window.Game.pause === 'function') {
      window.Game.pause();
    }
    
    // Pausar animaciones
    if (window.DoomEngine && typeof window.DoomEngine.pause === 'function') {
      window.DoomEngine.pause();
    }
    
    // Pausar enemigos
    if (window.EnemyManager && typeof window.EnemyManager.pause === 'function') {
      window.EnemyManager.pause();
    }
    
    // Desactivar controles temporalmente
    if (window.Player && typeof window.Player.disableControls === 'function') {
      window.Player.disableControls();
    }
  },
  
  resumeGameSystems() {
    // Resumir el loop principal del juego
    if (window.Game && typeof window.Game.resume === 'function') {
      window.Game.resume();
    }
    
    // Resumir animaciones
    if (window.DoomEngine && typeof window.DoomEngine.resume === 'function') {
      window.DoomEngine.resume();
    }
    
    // Resumir enemigos
    if (window.EnemyManager && typeof window.EnemyManager.resume === 'function') {
      window.EnemyManager.resume();
    }
    
    // Reactivar controles
    if (window.Player && typeof window.Player.enableControls === 'function') {
      window.Player.enableControls();
    }
  },
  
  showPauseOverlay() {
    // Remover overlay existente si lo hay
    this.hidePauseOverlay();
    
    const overlay = document.createElement('div');
    overlay.id = 'pause-overlay';
    overlay.className = 'pause-overlay';
    
    const content = document.createElement('div');
    content.className = 'pause-content';
    
    let title = 'JUEGO PAUSADO';
    let subtitle = '';
    let instructions = 'Presiona ESC para continuar';
    
    switch (this.pauseReason) {
      case 'focus-lost':
        title = 'JUEGO PAUSADO';
        subtitle = 'Ventana perdió el foco';
        instructions = 'Haz clic aquí o presiona ESC para continuar';
        break;
      case 'tab-hidden':
        title = 'JUEGO PAUSADO';
        subtitle = 'Pestaña en segundo plano';
        instructions = 'Regresa a esta pestaña para continuar';
        break;
      case 'manual':
        title = 'PAUSA';
        subtitle = 'Juego pausado manualmente';
        instructions = 'Presiona ESC para continuar';
        break;
    }
    
    content.innerHTML = `
      <h1 class="pause-title">${title}</h1>
      ${subtitle ? `<p class="pause-subtitle">${subtitle}</p>` : ''}
      <p class="pause-instructions">${instructions}</p>
      <div class="pause-buttons">
        <button id="resume-btn" class="menu-btn">CONTINUAR</button>
        <button id="menu-btn" class="menu-btn">MENÚ PRINCIPAL</button>
      </div>
    `;
    
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    
    // Event listeners para los botones
    const resumeBtn = content.querySelector('#resume-btn');
    const menuBtn = content.querySelector('#menu-btn');
    
    if (resumeBtn) {
      resumeBtn.addEventListener('click', () => this.resume('button'));
    }
    
    if (menuBtn) {
      menuBtn.addEventListener('click', () => {
        this.resume('menu-exit');
        if (window.MenuManager) {
          window.MenuManager.showMainMenu();
        }
      });
    }
    
    // Click en overlay para resumir (excepto pausa manual)
    if (this.pauseReason !== 'manual') {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.resume('overlay-click');
        }
      });
    }
  },
  
  hidePauseOverlay() {
    const overlay = document.getElementById('pause-overlay');
    if (overlay) {
      overlay.remove();
    }
  },
  
  // Métodos de utilidad
  getPauseState() {
    return {
      isPaused: this.isPaused,
      reason: this.pauseReason,
      duration: this.pauseStartTime ? Date.now() - this.pauseStartTime : 0
    };
  },
  
  isPauseActive() {
    return this.isPaused;
  },
  
  forcePause(reason = 'forced') {
    this.pause(reason);
  },
  
  forceResume(reason = 'forced') {
    this.resume(reason);
  }
};

console.log('⏸️ Pause System cargado');
