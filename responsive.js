// responsive.js - Manejo de responsive, canvas y orientación
(function(){
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  const mc = () => document.getElementById('mobile-controls');
  const rotateOverlay = () => document.getElementById('rotate-overlay');

  function fitCanvasToContainer() {
    try {
      const container = document.getElementById('game-container');
      const canvas = container && container.querySelector('canvas');
      if (!container || !canvas) return;

      // Mantener 16:9 dentro del container visible
      const rect = container.getBoundingClientRect();
      const targetAspect = 16/9;
      let w = rect.width;
      let h = rect.height || (w / targetAspect);
      const aspect = w / h;
      if (aspect > targetAspect) {
        w = h * targetAspect;
      } else {
        h = w / targetAspect;
      }
      // CSS size
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';

      // Internal resolution with DPR
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.floor(w * dpr);
      const targetH = Math.floor(h * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        if (window.DoomGame) {
          window.DoomGame.width = targetW;
          window.DoomGame.height = targetH;
          // Re-render si está activo
          if (window.DoomGame.running && typeof window.DoomGame.render === 'function') {
            try { window.DoomGame.render(); } catch(_) {}
          }
        }
      }
    } catch (e) {
      console.warn('fitCanvasToContainer error:', e);
    }
  }

  function updateOrientationUI() {
    const mobileControls = mc();
    const overlay = rotateOverlay();
    const isLandscape = window.matchMedia('(orientation: landscape)').matches || (window.innerWidth > window.innerHeight);

    // Mostrar gamepad en móvil táctil cuando el juego está en pantalla de juego
    const onGame = document.getElementById('game-screen') && !document.getElementById('game-screen').classList.contains('hidden');

    if (isTouch && onGame) {
      mobileControls && mobileControls.classList.remove('hidden');
      // Si está en portrait, sugerir rotar
      if (!isLandscape) {
        overlay && overlay.classList.remove('hidden');
      } else {
        overlay && overlay.classList.add('hidden');
      }
    } else {
      mobileControls && mobileControls.classList.add('hidden');
      overlay && overlay.classList.add('hidden');
    }
  }

  function lockOrientationOnMobile() {
    // Intento de orientación; no todos los navegadores lo permiten sin fullscreen
    const tryLock = async () => {
      try {
        // Intenta fullscreen para mejorar probabilidad de lock
        const root = document.getElementById('game-screen') || document.documentElement;
        if (root && root.requestFullscreen && !document.fullscreenElement) {
          await root.requestFullscreen().catch(()=>{});
        }
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock('landscape');
        }
      } catch (_) { /* ignore */ }
    };
    document.addEventListener('click', tryLock, { once: true });
  }

  // Observa cambios de tamaño
  window.addEventListener('resize', () => {
    fitCanvasToContainer();
    updateOrientationUI();
  });
  window.addEventListener('orientationchange', updateOrientationUI);

  // Integración con menú/juego para reaccionar al entrar al juego
  const originalShowGame = (window.MenuManager && window.MenuManager.showGame) ? window.MenuManager.showGame.bind(window.MenuManager) : null;
  if (originalShowGame) {
    window.MenuManager.showGame = function() {
      originalShowGame();
      setTimeout(() => {
        fitCanvasToContainer();
        updateOrientationUI();
        lockOrientationOnMobile();
      }, 50);
    };
  } else {
    // fallback: cuando DoomGame inicia
    const origInit = window.DoomGame && window.DoomGame.init ? window.DoomGame.init.bind(window.DoomGame) : null;
    if (origInit) {
      window.DoomGame.init = function() {
        const res = origInit();
        setTimeout(() => {
          fitCanvasToContainer();
          updateOrientationUI();
          lockOrientationOnMobile();
        }, 50);
        return res;
      };
    }
  }

  // Primer ajuste al cargar
  window.addEventListener('load', () => {
    fitCanvasToContainer();
    updateOrientationUI();
  });
})();
