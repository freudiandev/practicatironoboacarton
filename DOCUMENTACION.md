# Documentación del proyecto — DOOM: Noboa de Cartón

## 1) Qué es este proyecto

**DOOM: Noboa de Cartón** es un juego web estilo FPS retro, inspirado en DOOM, construido sobre un **motor de raycasting 2D** (pseudo-3D) dibujado en un **Canvas 2D**. Incluye:

- Menú, pantalla de juego y pantalla de puntajes (highscores).
- HUD lateral con vida, munición, minimapa/radar, tiempo, kills y headshots.
- Enemigos renderizados como sprites PNG con “hitbox” proyectada para headshot/bodyshot.
- Sistema de disparos con efectos (balas, chispas, humo, sangre) y audio sintético.
- Soporte responsive + controles móviles (botonera táctil).
- Generación procedural de texturas/skybox vía `p5.js` (Centro Histórico).

## 2) Tecnologías y APIs usadas

### Frontend
- **HTML5** (`index.html`, `donaciones.html`)
- **CSS** (estilos divididos por dominio: layout, menús, HUD, efectos, mobile)
- **JavaScript Vanilla** (sin bundler ni framework)

### Render y gráficos
- **Canvas 2D**: render principal del mundo (raycasting, sprites, HUD visual dentro del canvas).
- **p5.js (CDN)**: se usa para generar assets/overlays:
  - Generador de texturas “Centro Histórico”: `assets/js/p5-centro-historico.js`
  - Overlay opcional de efectos de disparo (p5 canvas encima del juego): dentro de `bullet-effects.js`

### Audio
- **Web Audio API**:
  - Sonidos simples de fallback (`DoomGame.initSounds()` en `game-all-in-one.js`)
  - Sonido “escopeta” sintetizado + impactos + recarga (`weapon-audio.js`)
- **SpeechSynthesis API** (si está disponible): voz “headshot” (fallback a síntesis por formantes si no hay voces).

### Navegador / platform
- **Pointer Lock API** para capturar mouse y mostrar la mira (crosshair).
- **LocalStorage** para:
  - `doomHighscores` (tabla de puntajes)
  - `doomLastPlayerName` (último nombre)
  - `asset_version_map_v1` (cache-busting de CSS, ver `auto-version.js`)

## 3) Estructura del proyecto

### Archivos principales
- `index.html`: layout del juego, HUD, menús, orden de carga de scripts y verificación de sistemas.
- `game-all-in-one.js`: motor principal (estado del juego, update/render, raycasting, IA, HUD, colisiones).
- `enemy-sprites.js`: carga/procesado/render de sprites de enemigos (PNG) + hitbox proyectada.
- `bullet-effects.js`: sistema de balas/partículas/impactos; incluye overlay p5 opcional.
- `weapon-audio.js`: audio sintético para disparo e “headshot”.
- `texture-atlas.js`: atlas procedural de texturas (ladrillo/piedra/adoquín) con paleta.
- `menu-manager.js`: navegación entre pantallas + highscores.
- `responsive.js`: ajuste del canvas a contenedor (16:9) + DPR + overlay rotación + fullscreen/orientación.
- `mobile-controls.js`: mando táctil que emite eventos `keydown/keyup` o llama `DoomGame.shoot()`.
- `assets/js/p5-centro-historico.js`: genera skybox y texturas coloniales (offscreen) y expone `window.CentroHistoricoTextures`.

### Mapa de módulos y dependencias

> Este proyecto no usa bundler: el “sistema de módulos” es el **orden de `<script>`** en `index.html`.

```mermaid
flowchart LR
  subgraph Boot["Carga en index.html (orden clave)"]
    AV[auto-version.js]
    ES[enemy-sprites.js]
    BE[bullet-effects.js]
    WA[weapon-audio.js]
    TA[texture-atlas.js]
    P5[p5.js (CDN)]
    CH[assets/js/p5-centro-historico.js]
    GAME[game-all-in-one.js]
    MENU[menu-manager.js]
    RESP[responsive.js]
    MC[mobile-controls.js]
  end

  AV --> ES --> BE --> WA --> TA --> P5 --> CH --> GAME --> MENU --> RESP --> MC
```

#### Dependencias runtime (quién llama a quién)

```mermaid
flowchart TD
  subgraph Global["Globales expuestos en window"]
    DG[window.DoomGame]
    MM[window.MenuManager]
    ESS[window.EnemySpriteSystem]
    CHX[window.CentroHistoricoTextures]
    BES[window.BulletEffectsSystem]
    WAS[window.WeaponAudioSystem]
    TAX[window.TextureAtlas]
  end

  MM -->|startGame()| DG
  DG -->|renderSprites()| ESS
  DG -->|initWeaponSystems()| BES
  DG -->|initWeaponSystems()| WAS
  DG -->|initTextures()| TAX
  DG -->|attachCentroHistoricoTextures()| CHX
  DG -->|shoot() crea visuales| BES
  DG -->|shoot() audio| WAS
  BES -->|registerEnemyHit()| DG
```

#### Capas de render (pipeline)

```mermaid
flowchart LR
  R[render()] --> SKY[renderSky()]
  SKY --> FLOOR[renderFloor()]
  FLOOR --> WALLS[renderWalls() raycasting]
  WALLS --> SPR[renderSprites() enemigos/ítems]
  SPR --> BUL[renderBullets()]
  BUL --> FX[bulletEffects.render() + overlay p5]
  FX --> UI[renderCrosshair + renderWeapon + damage overlay]
```

### Utilidades / herramientas
- `update-versions.js`: script Node para reemplazar `?v=TIMESTAMP` en referencias (cache busting).
- `auto-version.js`: versionado runtime de CSS (hash SHA-256 → `?v=`) y memoización en localStorage.
- `debug-system.js`, `doom-inspector.js`, `sprite-loader.js`, `sprite-fixer.js`, `sprite-tester.js`: herramientas de diagnóstico (carga condicional en `index.html`).
- `sprite-uniformizer.html`, `auto-sprite-uniformizer.html`, `sprite-tester.js`, `create-icons.html`, `create-favicon.html`: tooling manual para assets.
- `donaciones.html`, `qrPichincha.jpg`: página de donaciones.
- `robots.txt`, `sitemap.xml`: SEO (apunta a GitHub Pages).

### Assets
- Sprites enemigos: `noboa-casual.png`, `noboa-deportivo.png`, `noboa-presidencial.png`
- Thumbnail/OG image: `thumbnail.jpeg`
- QR: `qrPichincha.jpg`

## 4) Cómo se ejecuta (arranque)

### Recomendación
Ejecutar con servidor local por compatibilidad:

```bash
python3 -m http.server 8080
# abre http://localhost:8080/
```

Motivos:
- Pointer Lock suele requerir contexto seguro / `localhost`.
- `auto-version.js` usa `fetch()` para leer CSS y hashearlo; `file://` puede bloquearlo.
- `p5.js` se carga desde CDN.

### Orden de carga crítico (en `index.html`)
1. `auto-version.js` (versionado CSS runtime).
2. CSS (`styles.css` + `css/*.css`).
3. `window.__ASSET_VERSION__ = '20250818'` (versión fija usada por sprites y scripts).
4. `enemy-sprites.js` → `bullet-effects.js` → `weapon-audio.js` → `texture-atlas.js`.
5. (opcional) scripts de debug si `window.__DEBUG_MODE__ = true`.
6. `p5.js` (CDN) + `assets/js/p5-centro-historico.js`.
7. `game-all-in-one.js` (define `window.DoomGame`).
8. `menu-manager.js` (inicializa menús; al iniciar partida llama `DoomGame.init()` + `DoomGame.start()`).
9. `responsive.js` + `mobile-controls.js`.

## 5) Configuración del juego (GAME_CONFIG + MAZE)

### `window.GAME_CONFIG` (motor y gameplay)
Se define al inicio de `game-all-in-one.js`. Campos relevantes:

- Mundo:
  - `cellSize`: tamaño de celda del mapa (px). Actual: `128`.
  - `gridCols`, `gridRows`: tamaño del grid.
  - `MAZE`: matriz 0/1 donde `1 = pared`, `0 = espacio`.
- Cámara / render:
  - `defaultFov`, `fov`
  - `renderDistance`
  - `renderQuality`: `ultra | high | medium | low` (perfiles con `columnStep`, `samplesPerColumn`, etc.)
  - `autoQuality`: ajusta calidad en runtime según `avgFrameMs`.
  - `qualityProfiles`: define step de columnas, samples, `maxDistance`, `stepSize`, `maxLayers`…
- Player:
  - `playerSpeed`, `rotationSpeed`, `mouseSensitivity`, `playerRadius`
  - `verticalLookSensitivity`
- Combate:
  - `fireRate`, `maxAmmo`, `damage`, `bulletSpeed`
- Enemigos:
  - `maxEnemies`, `enemySpeed`, `enemyHealth`
  - “blanco de tiro” (movimiento rítmico): `targetTrack.*`
  - separación (push-back): `separation.*`
  - melee: `enemyMeleeRange`, `enemyMeleeCooldown`, `enemyMeleeDamage`, `enemyBackstabAngle`

### `window.MAZE`
Matriz 2D (20×15) incrustada en `game-all-in-one.js`. Cambiar el layout implica:
- Mantener el borde de paredes (1s) para evitar “out of bounds”.
- Ajustar `gridCols/gridRows` coherentes con la matriz.

## 6) Controles

### Desktop
- Movimiento: `W/A/S/D`
- Girar: mouse (Pointer Lock) o `←/→`
- Mirar arriba/abajo: mouse (vertical) o `↑/↓`
- Disparar: click sobre el canvas (primero captura el mouse, luego dispara)
- Recargar: `R`
- Liberar mouse: `ESC` (sale de Pointer Lock)

### Móvil / táctil
- Botones en pantalla (`#mobile-controls`) que emiten eventos de teclado para integrarse con el input existente.
- Botón `SHOT`: llama directamente a `window.DoomGame.shoot()` para menor latencia.
- Overlay de rotación sugiere jugar en horizontal (`#rotate-overlay`).

## 7) Lógica de juego (arquitectura y flujo)

### Visión de alto nivel
El “motor” es un singleton en `window.DoomGame`, con estado y métodos. La partida corre con un bucle `requestAnimationFrame`:

```mermaid
flowchart TD
  A[MenuManager.startGame()] --> B[DoomGame.init()]
  B --> C[DoomGame.start()]
  C --> D[gameLoop()]
  D --> E[update()]
  D --> F[render()]
  F --> D
```

### `DoomGame.init()`
Responsabilidades principales:
- Crear y montar `canvas#gameCanvas` en `#game-container`.
- Detectar si es touch (`isTouchDevice()`).
- Inicializar:
  - Audio (`initSounds()` + `initBackgroundMusic()`)
  - Texturas (`initTextures()` + integración p5 “Centro Histórico”)
  - Sistemas de armas (`initWeaponSystems()` → `BulletEffectsSystem`, `WeaponAudioSystem`)
  - Input (`setupControls()` + pointer lock)
  - HUD (`initHUDPanel()`)
  - Enemigos (`spawnInitialEnemies()`) e ítems (`spawnItems()`)
  - Raycaster según perfil (`configureRaycaster()`)

### `update()` (gameplay frame)
Se ejecuta una vez por frame:
1. Calcula `deltaMs`, `gameTime`, incrementa `frameId`.
2. Ajuste de calidad automático (`updatePerformanceStats()`).
3. Player (`updatePlayer()`): movimiento con colisiones + rotación H/V.
4. Enemigos (`updateEnemies(currentTime)`): IA de “blanco de tiro” + melee.
5. Spawn gradual si faltan enemigos (`spawnEnemyInCorridor()`).
6. Balas:
   - Sistema básico (`this.bullets`) y
   - Sistema avanzado (`this.bulletEffects.updateBullets(this)`).
7. Colisiones (`checkCollisions()`): balas vs enemigos + jugador vs ítems.
8. Ítems (`updateItems()`): bobbing.
9. Feedback de daño (overlay + shake) (`updateDamageFeedback()`).
10. HUD (`updateHUD()` + minimapa).
11. Win/Lose (`checkGameState()`).

### `render()` (pipeline visual)
Orden de dibujado (importante para entender capas):
1. Clear pantalla + camera shake.
2. `renderSky()` (skybox se mueve con el ángulo; responde a `verticalLook`).
3. `renderFloor()`
4. `renderWalls()` (raycasting por columnas, con calidad configurable).
5. `renderSprites()`:
   - Enemigos via `EnemySpriteSystem.renderEnemySprite(ctx, enemy, player)`
   - Ítems como UI simples en pseudo-3D
6. `renderBullets()`
7. Overlay de efectos (`bulletEffects.render(...)`) + overlay p5 si está activo.
8. Crosshair (solo si Pointer Lock activo), debug (si `__DEBUG_MODE__`), arma UI y overlay de daño.

## 8) Sistema de enemigos

### Tipos de enemigos (sprites)
Definidos en `enemy-sprites.js` (`SPRITE_CONFIG.ENEMY_TYPES`):
- `casual` → `noboa-casual.png`
- `deportivo` → `noboa-deportivo.png`
- `presidencial` → `noboa-presidencial.png`

Cada tipo define ancho/alto relativo y velocidad (`walkSpeed`), y el sistema:
- Carga sprites probando múltiples rutas (y un modo estricto que fuerza `/noboa-*.png`).
- Procesa el PNG para render (normalmente a canvas interno).
- Renderiza con escala “humana” y calcula un **bounding box proyectado** para hit detection.

### Spawn y distribución
- `spawnInitialEnemies()` genera puntos distribuidos (`generateDistributedSpawnPoints`) para evitar spawns pegados.
- Respeta distancia mínima al jugador (`enemyMinDistanceFromPlayer` / `separation.minDistance`).
- Si no puede distribuir, usa fallback a pasillos (`spawnEnemyInCorridor()`).

### IA: “blanco de tiro” + melee
En `game-all-in-one.js`:
- Estado base: `state = 'target'` → movimiento lateral rítmico sobre un eje (x o z), con:
  - pausas en bordes (`edgePauseMs`)
  - posibilidad de ocultarse (`hideAtEdgesChance` → `enemy.hidden`)
  - empuje para mantener distancia (separation “push-back”)
- Cuando entra en rango:
  - `charging`: el enemigo hace “rush” (velocidad alta) hacia el jugador.
  - Si llega a `enemyMeleeRange`, ejecuta `enemyAttack()` y pasa a `retreating`.
  - `retreating`: se aleja unos milisegundos y vuelve a `target`.

### Backstab
`isEnemyBehindPlayer(enemy)` calcula producto punto con el forward del jugador; si el enemigo está detrás, el feedback visual indica “por la espalda”.

## 9) Sistema de disparo, daño y headshots

### Disparo (`DoomGame.shoot()`)
Reglas:
- Respeta `fireRate` (cooldown).
- Consume `player.ammo`.
- Calcula `shootAngle` apuntando al centro del crosshair (`computeAimTowardsCrosshair()`), usando `player.fov`.
- Crea bala en:
  - Sistema visual (`bulletEffects.createBullet(...)`) si existe.
  - Sistema lógico base (`this.bullets.push(...)`) siempre (garantiza colisiones).
- Audio:
  - Preferente: `weaponAudio.playShotgunSound()` (síntesis avanzada).
  - Fallback: `sounds.shoot()`.

### Hit detection (enemigos)
`checkCollisions()` usa dos filtros:
1. Distancia en mundo (umbral derivado de `enemy.renderBounds.width`).
2. Zona de impacto por UI: `getEnemyHitZone(enemy, tolerance)` compara el crosshair contra el bounding box proyectado:
   - `zone = 'head'` si cae en `headTop..headBottom`
   - `zone = 'body'` en caso contrario

Daño aplicado:
- Head: `100` (kill instant típico).
- Body: `20`.

### Efectos por hit
En `registerEnemyHit()`:
- Sonido de impacto.
- Sangre (burst/blood) vía `BulletEffectsSystem` si está disponible.
- Knockback (`applyKnockbackFromHit()`).
- Si headshot:
  - Incrementa contador (`headshots`)
  - Dispara voz “headshot” (`WeaponAudioSystem.playHeadshotSound()`)

## 10) Ítems / pickups

Definidos en `spawnItems()` (posiciones fijas):
- `ammo`: suma munición.
- `health`: recupera vida.

Recolección:
- Si la distancia jugador–ítem es `< 30`, se marca como `collected` y se aplica efecto.
- Puntaje: +50 por ítem.

## 11) Puntaje, highscores y fin de partida

- `score`: suma por kills (+100) e ítems (+50).
- `kills`: cuenta enemigos eliminados.
- Win: cuando no quedan enemigos vivos (`aliveEnemies === 0`).
- Loss: cuando `player.health <= 0`.

Al finalizar:
- Solicita nombre (`promptForPlayerName()`), recuerda en `doomLastPlayerName`.
- Guarda en `doomHighscores` (top 20), y el menú muestra top 10.
- Muestra resumen con `alert()` y vuelve al menú.

## 12) Raycasting y texturas

### Motor de raycasting (pseudo-3D)
`renderWalls()` recorre columnas de pantalla (`columnStep`) y puede supersamplear (`samplesPerColumn`).

Para cada muestra:
- Calcula ángulo de rayo según FOV.
- `castMultipleRays(...)` avanza en pasos (`stepSize`) hasta:
  - encontrar pared (`MAZE[z][x] === 1`), o
  - `maxDistance`.
- Soporta “capas” (`maxLayers`): al chocar, intenta “saltar” a una apertura para detectar más paredes detrás.
- Proyecta altura de pared: `wallHeight ~ (height * wallConstant) / distance`.
- Texturiza por “slice” vertical:
  - Preferente: `TextureAtlas.getSlice(textureId, u)` (atlas procedural).
  - Fallback: texturas canvas (`textures.fallback.*`) o colores planos.

### Centro Histórico (p5.js)
`assets/js/p5-centro-historico.js` genera:
- `sky` (panorámico 1024×512)
- `wallColonial`, `wallArchway` (tiles 128×128)
- `floorStones` (tile 128×128)

El juego lo consume vía `attachCentroHistoricoTextures()` y actualiza:
- `this.skyBackdrop`
- `this.wallTextureIds` (prioriza colonial/archway)
- `this.floorTextureId`

## 13) Overlay de efectos (balas) con p5

`bullet-effects.js` mantiene un contexto compartido global:
- `window.__BulletEffectsP5Overlay = { state, container, instance, viewportWidth, viewportHeight }`

Cuando p5 está disponible:
- Se crea un canvas overlay (`div.bullet-effects-overlay`) encima de `#game-container`.
- Se dibujan “tracers” desde el muzzle a la mira y partículas (humo/chispas).

Si p5 no está:
- El sistema igual renderiza efectos 2D (partículas, orificios) en el canvas principal.

## 14) Responsive y móvil

`responsive.js`:
- Ajusta el tamaño CSS del canvas para mantener 16:9 dentro del contenedor.
- Ajusta resolución interna con DPR (tope 2).
- En móvil: muestra mando táctil y overlay de rotación; intenta fullscreen + lock landscape (si el navegador permite).

## 15) Versionado y caché

Hay dos enfoques coexistiendo:

1. **Versionado fijo** en `index.html` con `?v=20250818` (manual/por script).
2. **Auto-versioning de CSS** (`auto-version.js`):
   - Hace `fetch()` a cada stylesheet.
   - Calcula hash (SHA-256, 12 hex).
   - Reescribe el `href` a `?v=<hash>`.
   - Cachea el mapa por 10 min en localStorage (`asset_version_map_v1`).

Además existe `update-versions.js` (Node) para actualizar referencias y generar `version-info.json`.

## 16) Debug y herramientas de diagnóstico

### Modo debug
En `index.html`:
- `window.__DEBUG_MODE__ = false` (por defecto).
- Si se activa, carga scripts como:
  - `debug-system.js`: imprime estado de `DoomGame`, `MenuManager`, etc.
  - `doom-inspector.js`: diagnósticos de sprites y parches temporales.
  - `sprite-loader.js`: loader de emergencia y carga manual.

### Páginas utilitarias
- `test-minimal.html`: prueba de `BulletEffectsSystem` + `WeaponAudioSystem` aislada.
- `debug-weapons.html`: debug de armas (si se usa).
- `sprite-uniformizer.html` / `auto-sprite-uniformizer.html`: inspección/uniformización de sprites.
- `create-icons.html` / `create-favicon.html`: generación de íconos.

## 17) Deploy / SEO

El proyecto está preparado para hosting estático (ej. GitHub Pages).
- `robots.txt` permite indexación y apunta a `sitemap.xml`.
- `sitemap.xml` incluye `/` y `/donaciones.html`.

## 18) Puntos importantes / decisiones del diseño

- **Motor “todo-en-uno”**: `game-all-in-one.js` concentra estado y rendering. Simplifica despliegue (sin build), pero hace más difícil modularizar.
- **Dos sistemas de “balas”**:
  - `this.bullets` = colisión/lógica mínima.
  - `BulletEffectsSystem` = visuales + overlay p5 (y puede registrar hits vía `registerEnemyHit`).
- **Hit detection híbrida**:
  - distancia en mundo + bounding box en pantalla; esto permite headshots “visuales”.
- **Auto quality**: intenta mantener frame time razonable degradando `renderQuality`.

## 19) Troubleshooting rápido

- “No aparece la mira / no rota con mouse”:
  - Haz click dentro del canvas para activar Pointer Lock.
  - Si estás en `file://`, prueba con servidor local (`python3 -m http.server`).
- “No aparecen sprites / aparecen fallbacks”:
  - Verifica que `noboa-*.png` estén en la raíz.
  - Revisa consola: `EnemySpriteSystem.loadedCount/totalSprites`.
  - Activa `window.__DEBUG_MODE__ = true` para usar diagnósticos.
- “No suena nada”:
  - Los navegadores bloquean audio hasta interacción; el juego intenta `resumeAudioContext()` al capturar mouse.
  - Verifica permisos/volumen y que no esté en modo silent.

## 20) Lecturas complementarias incluidas

- `MEJORAS-RAYCASTING-VISUAL.md`: roadmap + estado de optimizaciones del raycaster.
- `CONCEPTO-CENTRO-HISTORICO-P5.md`: guía conceptual/artística para el entorno colonial (p5).

## 21) Contribución

Hay una guía práctica de desarrollo, debug y pipeline de assets en: `CONTRIBUTING.md`

## 22) Migración a Vite + React + R3F + Zustand (WIP)

Este repo contiene una migración en curso hacia un render 100% GPU y una arquitectura moderna, con estos objetivos (del brief):

- Eliminar el raycasting CPU (Canvas 2D) y reemplazarlo por **Three.js/R3F**.
- Convertir `MAZE` en **InstancedMesh** (cubos) para render del nivel con draw calls mínimos.
- Mantener enemigos como “sprites” 2D en mundo 3D usando **Billboards**.
- Mover el estado global a **Zustand** (incluye persist de highscores).
- Portar audio a hooks (`useWeaponAudio`) y texturas procedurales a **CanvasTexture**.
- Agregar innovaciones: estética “Cardboard Cyberpunk”, power-ups satíricos, P2P sin servidor (WebRTC/PeerJS) y soporte Gamepad.

### Estado actual

La base del proyecto nuevo está en `doom-noboa/` y ya incluye:

- Render R3F con escena inicial y niebla: `doom-noboa/src/game/scenes/GameScene.tsx`
- Laberinto `MAZE` → `InstancedMesh` (paredes): `doom-noboa/src/game/render/MazeInstanced.tsx`
- Texturas procedurales “cartón” (albedo + normal corrugado + emissive): `doom-noboa/src/game/textures/cardboardCyberpunk.ts`
- Store inicial Zustand (highscores persistidos): `doom-noboa/src/game/store/useGameStore.ts`
- UX móvil (WIP): HUD responsive + joystick/lookpad táctil: `doom-noboa/src/game/ui/TouchControls.tsx`

### Qué falta (alto nivel)

Todavía no se implementó (entre otros):
- Player controller FPS (PointerLock + movimiento) y colisiones/physics.
- Enemigos reales como billboards con sprites Noboa, AI, daño y “disintegración” shader.
- Sistema de armas, hitscan/proyectiles, VFX (muzzle flash) y HUD (React).
- Power-ups “política del power-up”, evento “apagón nacional”.
- Multiplayer P2P (PeerJS) y control por Gamepad API.

El plan completo de tareas está en: `MIGRACION-R3F.md`
