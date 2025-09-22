/**
 * SISTEMA DE VERSIONADO AUTOMÁTICO
 * Se ejecuta cada vez que se carga la página para evitar problemas de caché
 */

(function() {
  'use strict';
  
  console.log('🔄 Auto-versioning system iniciado');
  
  // Generar nueva versión basada en timestamp
  function generateVersion() {
    const now = new Date();
    return now.getFullYear().toString() + 
           (now.getMonth() + 1).toString().padStart(2, '0') + 
           now.getDate().toString().padStart(2, '0') + 
           now.getHours().toString().padStart(2, '0') + 
           now.getMinutes().toString().padStart(2, '0');
  }
  
  // Obtener versión actual o generar nueva
  function getCurrentVersion() {
    // Intentar obtener versión de localStorage (persiste por sesión)
    let version = localStorage.getItem('asset_version');
    const lastUpdate = localStorage.getItem('asset_version_timestamp');
    const now = Date.now();
    
    // Regenerar versión cada 5 minutos o si no existe
    if (!version || !lastUpdate || (now - parseInt(lastUpdate)) > 300000) {
      version = generateVersion();
      localStorage.setItem('asset_version', version);
      localStorage.setItem('asset_version_timestamp', now.toString());
      console.log('🆕 Nueva versión generada:', version);
    } else {
      console.log('♻️ Usando versión existente:', version);
    }
    
    return version;
  }
  
  // Actualizar URLs de archivos con nueva versión
  function updateAssetVersions() {
    const version = getCurrentVersion();
    
    // Actualizar variable global
    window.__ASSET_VERSION__ = version;
    
    let updatedCount = 0;
    
    // Actualizar enlaces CSS
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    cssLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href.includes('.css') || href.includes('css/'))) {
        let newHref = href.replace(/\?v=\d+/, '').replace(/\?.*/, '');
        newHref += `?v=${version}`;
        if (link.getAttribute('href') !== newHref) {
          link.setAttribute('href', newHref);
          updatedCount++;
          console.log(`📝 CSS actualizado: ${newHref}`);
        }
      }
    });
    
    // Actualizar scripts JS
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src && src.includes('.js') && !src.includes('auto-version.js')) {
        let newSrc = src.replace(/\?v=\d+/, '').replace(/\?.*/, '');
        newSrc += `?v=${version}`;
        if (script.getAttribute('src') !== newSrc) {
          // Para scripts ya cargados, crear uno nuevo
          const newScript = document.createElement('script');
          newScript.src = newSrc;
          newScript.async = script.async;
          newScript.defer = script.defer;
          
          // Insertar antes del script original
          script.parentNode.insertBefore(newScript, script);
          
          // Remover el script original después de que se cargue el nuevo
          newScript.onload = () => {
            script.remove();
            updatedCount++;
            console.log(`📝 JS actualizado: ${newSrc}`);
          };
        }
      }
    });
    
    // Actualizar imágenes precargadas
    const preloadImages = document.querySelectorAll('#sprite-preload img');
    preloadImages.forEach(img => {
      const src = img.getAttribute('src');
      if (src && src.includes('.png')) {
        let newSrc = src.replace(/\?v=\d+/, '').replace(/\?.*/, '');
        newSrc += `?v=${version}`;
        if (img.getAttribute('src') !== newSrc) {
          img.setAttribute('src', newSrc);
          updatedCount++;
          console.log(`📝 IMG actualizado: ${newSrc}`);
        }
      }
    });
    
    if (updatedCount > 0) {
      console.log(`✅ ${updatedCount} recursos actualizados con versión ${version}`);
    }
    
    return version;
  }
  
  // Funciones para forzar actualización manual
  window.forceAssetUpdate = function() {
    localStorage.removeItem('asset_version');
    localStorage.removeItem('asset_version_timestamp');
    location.reload();
  };
  
  window.clearAssetCache = function() {
    localStorage.removeItem('asset_version');
    localStorage.removeItem('asset_version_timestamp');
    console.log('🗑️ Caché de versiones limpiado');
  };
  
  // Auto-ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateAssetVersions);
  } else {
    updateAssetVersions();
  }
  
  // Actualizar periódicamente si la página permanece abierta
  setInterval(() => {
    const lastUpdate = localStorage.getItem('asset_version_timestamp');
    const now = Date.now();
    
    // Actualizar cada 10 minutos si la página sigue abierta
    if (lastUpdate && (now - parseInt(lastUpdate)) > 600000) {
      console.log('⏰ Actualizando versiones por tiempo...');
      localStorage.removeItem('asset_version');
      updateAssetVersions();
    }
  }, 60000); // Verificar cada minuto
  
  // Funciones de debug
  window.getAssetVersion = () => getCurrentVersion();
  window.debugAssetVersioning = function() {
    console.log('📊 Estado del sistema de versionado:');
    console.log('- Versión actual:', getCurrentVersion());
    console.log('- Timestamp:', new Date(parseInt(localStorage.getItem('asset_version_timestamp'))));
    console.log('- Variable global:', window.__ASSET_VERSION__);
    
    console.log('📋 Recursos versionados:');
    document.querySelectorAll('link[href*="?v="], script[src*="?v="], img[src*="?v="]').forEach(el => {
      const attr = el.href || el.src;
      console.log(`  - ${el.tagName}: ${attr}`);
    });
  };
  
  console.log('✅ Auto-versioning system listo');
  console.log('💡 Usa forceAssetUpdate() para forzar actualización');
  console.log('💡 Usa debugAssetVersioning() para ver estado');
  
})();
