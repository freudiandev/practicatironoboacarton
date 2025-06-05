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
