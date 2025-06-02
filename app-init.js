// Inicialización principal de la aplicación

window.AppInit = {
  initialized: false,
  
  async init() {
    console.log('🚀 Inicializando aplicación...');
    
    try {
      // Esperar a que el DOM esté listo
      await this.waitForDOM();
      
      // Inicializar sistemas principales
      this.initializeSystems();
      
      // Configurar la aplicación
      this.setupApplication();
      
      this.initialized = true;
      console.log('✅ Aplicación inicializada correctamente');
      
    } catch (error) {
      console.error('❌ Error inicializando aplicación:', error);
      this.showErrorScreen(error);
    }
  },
  
  waitForDOM() {
    return new Promise((resolve) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve();
      }
    });
  },

  initializeSystems() {
    console.log('🔧 Inicializando sistemas...');
    
    // NO inicializar MenuManager aquí porque ya se auto-inicializa
    // Verificar que esté disponible
    if (window.MenuManager) {
      console.log('✅ MenuManager disponible');
    } else {
      console.warn('⚠️ MenuManager no disponible');
    }
    
    // Configurar controles globales
    this.setupGlobalControls();
    
    console.log('✅ Sistemas inicializados');
  },
  
  setupGlobalControls() {
    // Prevenir contexto derecho
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
    
    // Prevenir F5 accidental durante el juego
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F5' && window.MenuManager && window.MenuManager.isGameActive()) {
        e.preventDefault();
        console.log('F5 bloqueado durante el juego');
      }
    });
  },
  
  setupApplication() {
    // Verificar compatibilidad del navegador
    this.checkBrowserCompatibility();
  },
  
  checkBrowserCompatibility() {
    const features = {
      canvas: !!document.createElement('canvas').getContext,
      localStorage: !!window.localStorage
    };
    
    const unsupported = Object.keys(features).filter(key => !features[key]);
    
    if (unsupported.length > 0) {
      console.warn('⚠️ Características no soportadas:', unsupported);
    } else {
      console.log('✅ Navegador completamente compatible');
    }
  },
  
  showErrorScreen(error) {
    console.error('💥 Error crítico:', error);
    
    // Mostrar pantalla de error amigable
    document.body.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background: linear-gradient(135deg, #1e3c72, #2a5298);
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        font-family: Arial, sans-serif;
        text-align: center;
        z-index: 9999;
      ">
        <div>
          <h1 style="color: #ff6b6b; margin-bottom: 20px;">¡Oops! Algo salió mal</h1>
          <p>Ha ocurrido un error inesperado.</p>
          <p style="font-size: 14px; opacity: 0.8;">Intenta recargar la página (F5)</p>
          <button onclick="location.reload()" style="
            background: #ff6b6b;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            color: white;
            font-size: 16px;
            cursor: pointer;
            margin-top: 20px;
          ">Recargar Página</button>
        </div>
      </div>
    `;
  }
};

// Auto-inicializar cuando se carga el script
window.AppInit.init();

console.log('🚀 AppInit cargado');
    // Cargar configuración guardada
    this.loadSettings();
    
    // Verificar compatibilidad del navegador
    this.checkBrowserCompatibility();
    
    // Configurar manejo de errores específico de la aplicación
    this.setupErrorHandling();
  },
  
  loadSettings() {
    try {
      const settings = localStorage.getItem('doomGameSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        console.log('⚙️ Configuración cargada:', parsed);
      }
    } catch (error) {
      console.warn('No se pudieron cargar las configuraciones:', error);
    }
  },
  
  checkBrowserCompatibility() {
    const features = {
      canvas: !!document.createElement('canvas').getContext,
      localStorage: !!window.localStorage,
      pointerLock: !!document.body.requestPointerLock
    };
    
    const unsupported = Object.keys(features).filter(key => !features[key]);
    
    if (unsupported.length > 0) {
      console.warn('⚠️ Características no soportadas:', unsupported);
    } else {
      console.log('✅ Navegador completamente compatible');
    }
  },
  
  setupErrorHandling() {
    // Manejo específico de errores de la aplicación
    window.addEventListener('error', (e) => {
      // Ignorar errores de extensiones ya manejados por error-protection.js
      if (e.defaultPrevented) return;
      
      if (e.filename && (e.filename.includes('game') || e.filename.includes('doom'))) {
        console.error('🎮 Error crítico en el juego:', {
          message: e.message,
          file: e.filename,
          line: e.lineno,
          column: e.colno,
          stack: e.error?.stack
        });
        
        // Intentar recuperación automática solo para errores críticos
        if (e.message.includes('Cannot read') || e.message.includes('undefined')) {
          this.attemptRecovery();
        }
      }
    }, false);
    
    // Manejar errores de recursos (imágenes, scripts, etc.)
    window.addEventListener('error', (e) => {
      if (e.target && e.target !== window) {
        const elementType = e.target.tagName?.toLowerCase();
        const src = e.target.src || e.target.href;
        
        console.warn(`⚠️ Error cargando ${elementType}:`, src);
        
        // Intentar recargar recursos críticos
        if (elementType === 'script' && src && src.includes('game')) {
          console.log('🔄 Intentando recargar script crítico...');
          setTimeout(() => {
            const script = document.createElement('script');
            script.src = src;
            script.onerror = () => console.error('❌ Falló recarga de script:', src);
            document.head.appendChild(script);
          }, 1000);
        }
      }
    }, true);
  },
  
  attemptRecovery() {
    console.log('🔧 Intentando recuperación automática...');
    
    // Volver al menú principal
    if (window.MenuManager) {
      window.MenuManager.showMainMenu();
    }
    
    // Reinicializar sistemas si es necesario
    setTimeout(() => {
      if (window.Game && !window.Game.initialized) {
        console.log('🔄 Reinicializando sistemas...');
      }
    }, 1000);
  },
  
  showErrorScreen(error) {
    console.error('💥 Error crítico:', error);
    
    // Mostrar pantalla de error amigable
    document.body.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background: linear-gradient(135deg, #1e3c72, #2a5298);
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        font-family: Arial, sans-serif;
        text-align: center;
        z-index: 9999;
      ">
        <div>
          <h1 style="color: #ff6b6b; margin-bottom: 20px;">¡Oops! Algo salió mal</h1>
          <p>Ha ocurrido un error inesperado.</p>
          <p style="font-size: 14px; opacity: 0.8;">Intenta recargar la página (F5)</p>
          <button onclick="location.reload()" style="
            background: #ff6b6b;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            color: white;
            font-size: 16px;
            cursor: pointer;
            margin-top: 20px;
          ">Recargar Página</button>
        </div>
      </div>
    `;
  }
};

// Auto-inicializar cuando se carga el script
window.AppInit.init();

console.log('🚀 AppInit cargado');
  }
};

// Auto-inicializar cuando se carga el script
window.AppInit.init();

console.log('🚀 AppInit cargado');
      </div>
    `;
  }
};

// Auto-inicializar cuando se carga el script
window.AppInit.init();

console.log('🚀 AppInit cargado');
