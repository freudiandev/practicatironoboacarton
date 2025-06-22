/**
 * LIMPIEZA DE INDICADORES DUPLICADOS
 * Elimina indicadores visuales duplicados y asegura que solo haya uno
 */

console.log('🧹 === LIMPIEZA DE INDICADORES DUPLICADOS ===');

class DuplicateIndicatorCleaner {
  constructor() {
    this.cleanupAttempts = 0;
    this.maxAttempts = 5;
    
    console.log('🧹 Iniciando limpieza de indicadores duplicados...');
    this.startCleanup();
  }
  
  startCleanup() {
    // Ejecutar limpieza inmediata
    this.cleanDuplicateIndicators();
    
    // Configurar limpieza periódica para prevenir duplicados futuros
    this.setupPeriodicCleanup();
    
    // Configurar observer para detectar nuevos duplicados
    this.setupDuplicateDetection();
  }
  
  cleanDuplicateIndicators() {
    this.cleanupAttempts++;
    
    console.log(`🔍 Buscando indicadores duplicados (intento ${this.cleanupAttempts})...`);
    
    // Buscar todos los elementos con ID o clase relacionada con learning memory
    const indicators = document.querySelectorAll('[id*="learning-memory"], [class*="learning-memory"]');
    const voiceIndicators = document.querySelectorAll('[id*="memory-voice"], [class*="memory-voice"]');
    
    // Combinar ambas búsquedas
    const allIndicators = [...indicators, ...voiceIndicators];
    
    if (allIndicators.length === 0) {
      console.log('✅ No se encontraron indicadores para limpiar');
      return;
    }
    
    if (allIndicators.length === 1) {
      console.log('✅ Solo hay un indicador (correcto)');
      this.optimizeExistingIndicator(allIndicators[0]);
      return;
    }
    
    console.log(`🧹 Encontrados ${allIndicators.length} indicadores, limpiando duplicados...`);
    
    // Mantener solo el mejor indicador
    const bestIndicator = this.selectBestIndicator(allIndicators);
    
    // Eliminar todos los demás
    allIndicators.forEach(indicator => {
      if (indicator !== bestIndicator) {
        console.log(`🗑️ Eliminando indicador duplicado: ${indicator.id || indicator.className}`);
        indicator.remove();
      }
    });
    
    // Optimizar el indicador que quedó
    if (bestIndicator) {
      this.optimizeExistingIndicator(bestIndicator);
      console.log('✅ Limpieza completada, indicador único optimizado');
    }
  }
  
  selectBestIndicator(indicators) {
    // Criterios para seleccionar el mejor indicador:
    // 1. Que tenga ID 'learning-memory-voice'
    // 2. Que tenga mayor contenido
    // 3. Que esté posicionado correctamente
    // 4. Que tenga estilos más avanzados
    
    let bestIndicator = null;
    let bestScore = -1;
    
    indicators.forEach(indicator => {
      let score = 0;
      
      // Preferir ID específico
      if (indicator.id === 'learning-memory-voice') score += 10;
      
      // Preferir indicadores con más contenido
      if (indicator.innerHTML.length > 100) score += 5;
      
      // Preferir indicadores posicionados
      const styles = window.getComputedStyle(indicator);
      if (styles.position === 'fixed') score += 3;
      if (styles.zIndex && parseInt(styles.zIndex) > 1000) score += 2;
      
      // Preferir indicadores con animación
      if (styles.animation && styles.animation !== 'none') score += 2;
      
      // Preferir indicadores visibles
      if (styles.display !== 'none' && styles.visibility !== 'hidden') score += 1;
      
      console.log(`📊 Indicador ${indicator.id || 'sin-id'}: puntuación ${score}`);
      
      if (score > bestScore) {
        bestScore = score;
        bestIndicator = indicator;
      }
    });
    
    console.log(`🏆 Mejor indicador seleccionado: ${bestIndicador?.id || 'sin-id'} (puntuación: ${bestScore})`);
    
    return bestIndicator;
  }
  
  optimizeExistingIndicator(indicator) {
    console.log('🔧 Optimizando indicador seleccionado...');
    
    // Asegurar ID correcto
    if (!indicator.id) {
      indicator.id = 'learning-memory-voice';
    }
    
    // Optimizar estilos
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 50, 0, 0.95);
      color: #00ff00;
      padding: 12px;
      border-radius: 10px;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      max-width: 320px;
      z-index: 9999;
      border: 3px solid #00ff00;
      box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
      animation: pulse 2s infinite;
    `;
    
    // Asegurar animación CSS
    if (!document.querySelector('#voice-indicator-animation')) {
      const style = document.createElement('style');
      style.id = 'voice-indicator-animation';
      style.textContent = `
        @keyframes pulse {
          0% { box-shadow: 0 0 15px rgba(0, 255, 0, 0.5); }
          50% { box-shadow: 0 0 25px rgba(0, 255, 0, 0.8); }
          100% { box-shadow: 0 0 15px rgba(0, 255, 0, 0.5); }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Optimizar contenido si está vacío o es básico
    if (indicator.innerHTML.length < 50 || !indicator.innerHTML.includes('LEARNING MEMORY')) {
      indicator.innerHTML = `
        🤖🛡️ <strong>LEARNING MEMORY</strong><br>
        <span style="color: #00ffff;">SISTEMA UNIFICADO ACTIVO</span><br>
        <span id="memory-status">🔍 Monitoreando sistemas...</span>
      `;
    }
    
    // Asegurar que el elemento de estado existe
    if (!indicator.querySelector('#memory-status')) {
      const statusSpan = document.createElement('span');
      statusSpan.id = 'memory-status';
      statusSpan.textContent = '🔍 Monitoreando sistemas...';
      indicator.appendChild(document.createElement('br'));
      indicator.appendChild(statusSpan);
    }
    
    console.log('✅ Indicador optimizado correctamente');
  }
  
  setupPeriodicCleanup() {
    // Ejecutar limpieza cada 10 segundos para prevenir duplicados
    setInterval(() => {
      const indicators = document.querySelectorAll('[id*="learning-memory"], [class*="learning-memory"]');
      if (indicators.length > 1) {
        console.log('🧹 Detectados duplicados, ejecutando limpieza periódica...');
        this.cleanDuplicateIndicators();
      }
    }, 10000);
    
    console.log('⏰ Limpieza periódica configurada (cada 10 segundos)');
  }
  
  setupDuplicateDetection() {
    // Observar cambios en el DOM para detectar nuevos indicadores
    const observer = new MutationObserver((mutations) => {
      let newIndicatorAdded = false;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            if (node.id && node.id.includes('learning-memory')) {
              newIndicatorAdded = true;
            }
            // También verificar descendientes
            const descendants = node.querySelectorAll ? node.querySelectorAll('[id*="learning-memory"]') : [];
            if (descendants.length > 0) {
              newIndicatorAdded = true;
            }
          }
        });
      });
      
      if (newIndicatorAdded) {
        console.log('🔍 Nuevo indicador detectado, verificando duplicados...');
        setTimeout(() => {
          this.cleanDuplicateIndicators();
        }, 500); // Pequeño delay para permitir que se complete la adición
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('👁️ Observer de duplicados configurado');
  }
  
  // Método público para limpieza manual
  forceCleanup() {
    console.log('🧹 Limpieza forzada solicitada...');
    this.cleanDuplicateIndicators();
  }
  
  // Método para obtener estadísticas
  getCleanupStats() {
    const indicators = document.querySelectorAll('[id*="learning-memory"], [class*="learning-memory"]');
    return {
      currentIndicators: indicators.length,
      cleanupAttempts: this.cleanupAttempts,
      timestamp: Date.now()
    };
  }
}

// Inicializar limpiador inmediatamente
const duplicateCleaner = new DuplicateIndicatorCleaner();

// Hacer disponible globalmente
window.duplicateCleaner = duplicateCleaner;

// También ejecutar después de que todos los scripts se hayan cargado
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    duplicateCleaner.forceCleanup();
  }, 2000);
});

// Y otra limpieza después de que todo esté completamente cargado
window.addEventListener('load', () => {
  setTimeout(() => {
    duplicateCleaner.forceCleanup();
  }, 1000);
});

console.log('🧹 Sistema de limpieza de duplicados cargado');
console.log('📞 Comando manual: window.duplicateCleaner.forceCleanup()');
