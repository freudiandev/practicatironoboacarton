# Contribuir a DOOM: Noboa de Cartón

Esta guía describe cómo correr el proyecto en local, cómo depurar, cómo tocar assets (sprites/texturas) y cómo mantener el versionado/cache busting.

## Requisitos

- Navegador moderno (Chrome/Edge/Firefox).
- Opcional: Python 3 para servidor local.
- Opcional: Node.js (solo si quieres usar `update-versions.js`).

## Levantar en local (recomendado)

Evita abrir `index.html` como `file://` (Pointer Lock, `fetch` y algunos assets pueden fallar).

```bash
python3 -m http.server 8080
```

Abrir:
- `http://localhost:8080/` (juego)
- `http://localhost:8080/test-minimal.html` (prueba aislada de armas/efectos)

## Flujo de desarrollo sugerido

1. Cambios rápidos: edita JS/CSS/HTML y refresca.
2. Cuando notes caché raro:
   - abre consola y ejecuta `forceAssetUpdate()` (definido en `auto-version.js`), o
   - usa modo incógnito / hard reload.
3. Si estás versionando para deploy, usa el script Node (`update-versions.js`).

## Debugging

### Activar modo debug

En `index.html` hay un flag:
- `window.__DEBUG_MODE__ = false;`

Cámbialo a `true` para cargar utilidades de diagnóstico:
- `debug-system.js` (estado general)
- `doom-inspector.js` (diagnóstico del motor/sprites)
- `sprite-loader.js` (loader de emergencia)
- `sprite-fixer.js`, `sprite-tester.js` (herramientas de sprites)

### Logs útiles

En consola verás verificaciones de:
- Disponibilidad de `window.DoomGame`, `window.MenuManager`, `window.EnemySpriteSystem`.
- Estado de sprites: `loadedCount/totalSprites`.
- Métodos críticos (init/start/update/render).

### Problemas típicos

**1) Pointer Lock / no aparece la mira**
- Haz click dentro del canvas para capturar el mouse.
- En algunos navegadores, Pointer Lock requiere `localhost` o HTTPS.

**2) Sprites no cargan**
- Confirmar que existen en raíz:
  - `noboa-casual.png`
  - `noboa-deportivo.png`
  - `noboa-presidencial.png`
- Revisa el estado de `EnemySpriteSystem`.
- Activa debug y usa `doom-inspector.js` para diagnóstico.

**3) Audio no suena**
- El navegador bloquea audio hasta interacción del usuario.
- El juego intenta reanudar audio al capturar mouse. Si falla, prueba clickear una vez y reintentar.

## Controles (para pruebas)

Desktop:
- `W/A/S/D` mover
- Mouse: rotación horizontal + vertical
- `R` recargar
- `ESC` libera cursor

Móvil:
- Botonera en pantalla (`mobile-controls.js`) + botón `SHOT`.
- Recomendada orientación horizontal (hay overlay de rotación).

## Modificar gameplay

### Ajustar constantes

En `game-all-in-one.js` (inicio):
- `window.GAME_CONFIG`: velocidad, FOV, calidad, melee, spawn, etc.
- `window.MAZE`: layout del mapa (0 libre, 1 pared).

Recomendación al tocar `MAZE`:
- Mantener un borde de paredes (1s).
- Ajustar `gridCols`/`gridRows` coherentes con la matriz.

### Añadir un nuevo tipo de enemigo (sprite)

1. Agrega el PNG a la raíz (idealmente) con nombre consistente.
2. En `enemy-sprites.js`, añade una entrada en `SPRITE_CONFIG.ENEMY_TYPES`.
3. Asegura que el spawner (`spawnInitialEnemies()` / `spawnEnemyInCorridor()`) pueda elegir ese tipo.

Nota: el sistema asume que `enemy.type` corresponde a una key de `ENEMY_TYPES`.

## Modificar arte / assets

### Texturas (Atlas)

- `texture-atlas.js` genera texturas procedurales tipo pixel art.
- `assets/js/p5-centro-historico.js` genera skybox y tiles “Centro Histórico”.

El motor integra esto en:
- `DoomGame.attachCentroHistoricoTextures()` dentro de `game-all-in-one.js`.

### Sprites

Herramientas locales (HTML):
- `sprite-uniformizer.html`: inspección y normalización de dimensiones.
- `auto-sprite-uniformizer.html`: utilitario automático (si aplica al flujo).

Consejo: mantener transparencia y recortes consistentes para que el bounding box proyectado sea estable.

## Cache busting / versionado

Hay dos sistemas coexistiendo:

1. **Versión fija en `index.html`**: referencias con `?v=...` (ej. `20250818`).
2. **Auto versionado CSS**: `auto-version.js` calcula hash del CSS y reescribe `href` con `?v=<hash>`.

### Actualizar versiones con Node

```bash
node update-versions.js
```

Esto:
- actualiza `?v=<timestamp>` en `index.html`
- crea/actualiza `version-info.json`

## Deploy

El proyecto es estático (ideal para GitHub Pages).
- `robots.txt` y `sitemap.xml` ya apuntan al site del repo.

Checklist antes de publicar:
- Probar en `localhost`.
- Verificar consola sin errores críticos.
- Confirmar que sprites cargan (especialmente en deploy path).
- Si cambiaste assets, actualizar `?v=` o limpiar caché via `forceAssetUpdate()`.

