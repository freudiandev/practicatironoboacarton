// mobile-controls.js - Mando táctil que mapea a las teclas existentes
(function(){
  if (!('ontouchstart' in window) && (navigator.maxTouchPoints || 0) === 0) return;

  const mobileControls = document.getElementById('mobile-controls');
  const shotBtn = document.getElementById('mc-shot');
  if (!mobileControls) return;

  // Generar y despachar eventos de teclado falsos para integrarse con input existente
  const pressKey = (code) => {
    try {
      const eDown = new KeyboardEvent('keydown', { code, key: codeToKey(code), bubbles: true });
      document.dispatchEvent(eDown);
    } catch (_) {}
  };
  const releaseKey = (code) => {
    try {
      const eUp = new KeyboardEvent('keyup', { code, key: codeToKey(code), bubbles: true });
      document.dispatchEvent(eUp);
    } catch (_) {}
  };
  const codeToKey = (code) => ({
    'KeyW':'w','KeyA':'a','KeyS':'s','KeyD':'d',
    'ArrowUp':'ArrowUp','ArrowDown':'ArrowDown','ArrowLeft':'ArrowLeft','ArrowRight':'ArrowRight'
  }[code] || code);

  function bindButtonHold(el, code) {
    if (!el) return;
    const activate = (evt) => {
      evt.preventDefault();
      el.classList.add('is-active');
      pressKey(code);
    };
    const deactivate = (evt) => {
      evt && evt.preventDefault();
      el.classList.remove('is-active');
      releaseKey(code);
    };
    el.addEventListener('touchstart', activate, { passive: false });
    el.addEventListener('touchend', deactivate, { passive: false });
    el.addEventListener('touchcancel', deactivate, { passive: false });
    // También permitir click como fallback
    el.addEventListener('mousedown', activate);
    el.addEventListener('mouseup', deactivate);
    el.addEventListener('mouseleave', deactivate);
  }

  mobileControls.querySelectorAll('.mc-btn[data-key]').forEach(btn => {
    bindButtonHold(btn, btn.getAttribute('data-key'));
  });

  // Disparo: invocar DoomGame.shoot directamente para menor latencia
  function doShot(evt) {
    evt.preventDefault();
    try {
      if (window.DoomGame && typeof window.DoomGame.shoot === 'function') {
        window.DoomGame.shoot();
      } else {
        // fallback: click simula disparo
        document.body.click();
      }
    } catch(_) {}
  }
  if (shotBtn) {
    shotBtn.addEventListener('touchstart', doShot, { passive: false });
    shotBtn.addEventListener('click', doShot);
  }

  // Evitar gestos de scroll/zoom no deseados sobre los controles
  mobileControls.addEventListener('touchmove', (e) => {
    if (e.target.closest('#mobile-controls')) e.preventDefault();
  }, { passive: false });
})();
