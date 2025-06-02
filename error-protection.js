// Protección contra errores de extensiones y manejo de errores globales

(function() {
  'use strict';
  
  // Lista expandida de errores de extensiones a ignorar
  const extensionErrorPatterns = [
    'message channel closed',
    'message port closed',
    'A listener indicated an asynchronous response by returning true',
    'Extension context invalidated',
    'chrome-extension://',
    'moz-extension://',
    'safari-extension://',
    'The message port closed before a response was received',
    'Could not establish connection',
    'Script context invalidated'
  ];
  
  // Función para detectar errores de extensiones
  function isExtensionError(message) {
    if (!message || typeof message !== 'string') return false;
    return extensionErrorPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );
  }
  
  // Prevenir errores de extensiones - MEJORADO
  window.addEventListener('error', function(e) {
    if (isExtensionError(e.message)) {
      console.warn('⚠️ Error de extensión ignorado:', e.message);
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // Log otros errores importantes del juego
    if (e.filename && (e.filename.includes('game') || e.filename.includes('doom'))) {
      console.error('🚨 Error del juego:', {
        message: e.message,
        file: e.filename,
        line: e.lineno,
        column: e.colno,
        stack: e.error?.stack
      });
    }
  }, true); // Usar capture para interceptar antes
  
  // Proteger promesas - MEJORADO
  window.addEventListener('unhandledrejection', function(e) {
    const reason = e.reason;
    let message = '';
    
    if (reason instanceof Error) {
      message = reason.message || reason.toString();
    } else if (typeof reason === 'string') {
      message = reason;
    } else if (reason && reason.message) {
      message = reason.message;
    }
    
    if (isExtensionError(message)) {
      console.warn('⚠️ Promise rejection de extensión ignorada:', message);
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // Log promesas rechazadas importantes
    console.error('🚨 Promise rejection del juego:', {
      reason: reason,
      type: typeof reason,
      stack: reason?.stack
    });
  }, true);
  
  // Protección adicional contra errores de Chrome Extensions
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    // Interceptar errores de chrome.runtime
    const originalSendMessage = chrome.runtime.sendMessage;
    if (originalSendMessage) {
      chrome.runtime.sendMessage = function(...args) {
        try {
          return originalSendMessage.apply(this, args);
        } catch (error) {
          if (isExtensionError(error.message)) {
            console.warn('⚠️ chrome.runtime.sendMessage error ignorado:', error.message);
            return Promise.resolve();
          }
          throw error;
        }
      };
    }
  }
  
  // Proteger console si es modificado por extensiones
  const originalConsole = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    info: console.info.bind(console),
    debug: console.debug.bind(console)
  };
  
  // Restaurar console si es necesario
  window.restoreConsole = function() {
    Object.assign(console, originalConsole);
    console.log('🔧 Console restaurado');
  };
  
  // Verificar si console ha sido modificado
  function checkConsoleIntegrity() {
    if (typeof console.log !== 'function') {
      console.warn('⚠️ Console modificado por extensión, restaurando...');
      window.restoreConsole();
    }
  }
  
  // Verificar console periódicamente
  setInterval(checkConsoleIntegrity, 5000);
  
  // Protección contra modificaciones del DOM por extensiones
  const protectDOM = function() {
    const gameElements = ['game-screen', 'game-container', 'main-menu'];
    
    gameElements.forEach(elementId => {
      const element = document.getElementById(elementId);
      if (element) {
        // Crear un observer para detectar cambios no autorizados
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            // Solo alertar si no es una modificación de nuestro juego Y no es una modificación autorizada
            if (!mutation.target.classList.contains('game-authorized-change') && 
                !mutation.target.classList.contains('hidden')) {
              // Silenciar logs para cambios normales del juego
              // console.warn('⚠️ Modificación detectada en elemento protegido:', elementId);
            }
          });
        });
        
        observer.observe(element, {
          childList: true,
          attributes: true,
          subtree: true
        });
      }
    });
  };
  
  // Función para marcar cambios autorizados
  window.markAuthorizedChange = function(element) {
    if (element) {
      element.classList.add('game-authorized-change');
      setTimeout(() => {
        element.classList.remove('game-authorized-change');
      }, 100);
    }
  };
  
  // Protección contra override de funciones críticas
  const protectCriticalFunctions = function() {
    const criticalFunctions = [
      'addEventListener',
      'removeEventListener',
      'requestAnimationFrame',
      'setTimeout',
      'setInterval'
    ];
    
    criticalFunctions.forEach(funcName => {
      const original = window[funcName];
      if (original) {
        Object.defineProperty(window, funcName, {
          value: original,
          writable: false,
          configurable: false
        });
      }
    });
  };
  
  // Ejecutar protecciones cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      protectDOM();
      protectCriticalFunctions();
    });
  } else {
    protectDOM();
    protectCriticalFunctions();
  }
  
  // Bloquear intentos de redirección no autorizados
  const originalLocation = window.location.href;
  Object.defineProperty(window, 'location', {
    get: () => window.location,
    set: (value) => {
      if (value !== originalLocation && !value.includes('donaciones.html')) {
        console.warn('⚠️ Intento de redirección bloqueado:', value);
        return false;
      }
      window.location = value;
    }
  });
  
  console.log('🛡️ Protección avanzada contra errores activada');
  
})();
