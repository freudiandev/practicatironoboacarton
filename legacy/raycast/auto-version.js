/**
 * SISTEMA DE VERSIONADO AUTOMÁTICO
 * Se ejecuta cada vez que se carga la página para evitar problemas de caché
 */

(function() {
  'use strict';

  const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos
  const STORAGE_KEY = 'asset_version_map_v1';

  const encoder = new TextEncoder();

  function bufferToHex(buffer, length = 8) {
    const bytes = new Uint8Array(buffer);
    let hex = '';
    for (let i = 0; i < bytes.length && hex.length < length * 2; i++) {
      hex += bytes[i].toString(16).padStart(2, '0');
    }
    return hex.slice(0, length * 2);
  }

  async function hashContent(content) {
    if (window.crypto?.subtle?.digest) {
      const data = typeof content === 'string' ? encoder.encode(content) : content;
      const digest = await crypto.subtle.digest('SHA-256', data);
      return bufferToHex(digest, 6); // 12 caracteres hex
    }

    // Fallback sencillo si SubtleCrypto no está disponible
    let hash = 0;
    const text = typeof content === 'string' ? content : String(content);
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }

  function getStoredMap() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return {};
      return parsed;
    } catch (error) {
      console.warn('No se pudo leer el mapa de versiones:', error);
      return {};
    }
  }

  function saveMap(map) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch (error) {
      console.warn('No se pudo guardar el mapa de versiones:', error);
    }
  }

  function buildCacheKey(url) {
    try {
      const u = new URL(url, window.location.href);
      return u.pathname + u.search;
    } catch (_) {
      return url;
    }
  }

  async function versionStylesheets(versionMap) {
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

    await Promise.all(links.map(async link => {
      const originalHref = link.getAttribute('data-original-href') || link.getAttribute('href') || '';
      const baseHref = originalHref.split('?')[0];
      if (!baseHref) return;

      const cacheKey = buildCacheKey(baseHref);
      const cached = versionMap[cacheKey];
      const now = Date.now();

      if (cached && cached.expires > now) {
        applyVersion(link, baseHref, cached.version);
        return;
      }

      try {
        const response = await fetch(baseHref, { cache: 'no-cache' });
        if (!response.ok) {
          throw new Error(`Respuesta ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const version = await hashContent(arrayBuffer);

        versionMap[cacheKey] = {
          version,
          expires: now + CACHE_TTL_MS,
          lastCheck: now
        };

        applyVersion(link, baseHref, version);
      } catch (error) {
        console.warn(`No se pudo versionar ${baseHref}:`, error);
      }
    }));
  }

  function applyVersion(link, baseHref, version) {
    const newHref = `${baseHref}?v=${version}`;
    if (!link.getAttribute('data-original-href')) {
      link.setAttribute('data-original-href', baseHref);
    }
    if (link.getAttribute('href') !== newHref) {
      link.setAttribute('href', newHref);
      console.log(`🆕 CSS versionado: ${newHref}`);
    }
  }

  function cleanStaleEntries(versionMap) {
    const now = Date.now();
    let dirty = false;
    for (const key of Object.keys(versionMap)) {
      if (!versionMap[key] || versionMap[key].expires < now - CACHE_TTL_MS) {
        delete versionMap[key];
        dirty = true;
      }
    }
    if (dirty) {
      saveMap(versionMap);
    }
  }

  async function run() {
    console.log('� Auto-versioning system iniciado');
    const versionMap = getStoredMap();
    cleanStaleEntries(versionMap);

    await versionStylesheets(versionMap);

    const aggregateVersion = Object.values(versionMap)
      .map(entry => entry?.version)
      .filter(Boolean)
      .join('-') || Date.now().toString(36);

    window.__ASSET_VERSION__ = aggregateVersion;

    saveMap(versionMap);
    console.log('✅ Versionado automático completado');
  }

  window.forceAssetUpdate = function() {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  };

  window.debugAssetVersioning = function() {
    console.log('📊 Version map:', getStoredMap());
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

})();
