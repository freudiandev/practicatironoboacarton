# Migración a Vite + React + R3F + Zustand — Roadmap “hasta acabar”

Este documento es el plan maestro para migrar **DOOM: Noboa de Cartón** (raycasting Canvas 2D) a un FPS retro moderno basado en **React Three Fiber** con rendimiento extremo y nuevas mecánicas/innovaciones.

## Objetivos (del brief)

1. **Eliminar raycasting CPU** y usar render **GPU** (Three.js/R3F).
2. Render de nivel con **InstancedMesh** (un mesh instanciado para paredes) desde la matriz `MAZE`.
3. Enemigos como **sprites 2D en mundo 3D** (billboards).
4. Estado global con **Zustand**:
   - `health`, `ammo`, `score`, `enemiesList`, `gameState`
   - persist de highscores en LocalStorage
5. Portar:
   - Audio sintético (WebAudio) → hook `useWeaponAudio`
   - Texturas procedurales (p5 / canvas) → `CanvasTexture` para materiales de Three
6. Innovación:
   - A) “Cardboard Cyberpunk” con shaders/normal maps y disintegración
   - B) Power-ups satíricos (Consulta Popular, IVA 15%, Apagón Nacional)
   - C) Multiplayer P2P sin servidor (PeerJS/WebRTC)
   - D) Gamepad API (PS/Xbox/Bluetooth)

## Estado actual (ya implementado)

En `doom-noboa/` ya existe:
- Vite + React TS + `three`, `@react-three/fiber`, `@react-three/drei`, `zustand`, `@react-three/rapier`
- `MAZE` y render instanciado:
  - `doom-noboa/src/game/config/maze.ts`
  - `doom-noboa/src/game/render/MazeInstanced.tsx`
- Escena base con fog y luces neon:
  - `doom-noboa/src/game/scenes/GameScene.tsx`
- Material base “cartón cyberpunk” con normal corrugado procedimental:
  - `doom-noboa/src/game/textures/cardboardCyberpunk.ts`
- Settings/tuning inicial:
  - `doom-noboa/src/game/config/settings.ts`
- Store Zustand con persist de highscores (inicial):
  - `doom-noboa/src/game/store/useGameStore.ts`
- FPS Controller (desktop + touch):
  - Pointer lock + WASD + colisión grid: `doom-noboa/src/game/entities/PlayerController.tsx`
  - Joystick + lookpad táctil: `doom-noboa/src/game/ui/TouchControls.tsx`
- HUD mínimo responsive (crosshair + stats + hints) con safe areas:
  - `doom-noboa/src/game/ui/HudOverlay.tsx`

## Arquitectura objetivo (propuesta)

Carpetas (la base ya está creada):

```
doom-noboa/src/
  game/
    config/              # settings y data (MAZE, tuning)
    store/               # Zustand: slices y persist
    input/               # teclado, mouse, gamepad
    physics/             # colisiones (grid / rapier)
    net/                 # PeerJS/WebRTC sync
    audio/               # hooks WebAudio (weapon, ambience)
    textures/            # generadores y loaders (CanvasTexture, atlas)
    render/              # instancing, shaders, post, billboards
    entities/            # player/enemy/powerups
    systems/             # loop (useFrame), spawn, combat, blackout
    ui/                  # HUD React (health/ammo/minimap)
```

Principios:
- **Separar “datos/estado” vs “render” vs “sistemas”**. R3F renderiza; los sistemas actualizan estado/physics; la UI lee estado.
- **Evitar allocations por frame** (GC stutter). Reusar `Vector3`, `Quaternion`, `Matrix4`.
- **Autoridad local primero**: single-player sólido antes de meter P2P.

## Decisiones clave de rendering

### Nivel: InstancedMesh

- Paredes: `InstancedMesh<BoxGeometry, MeshStandardMaterial>` (ya).
- Piso/techo: 1–2 `PlaneGeometry` con textura repetida.
- Texturas: `NearestFilter` para look pixel art.

Mejoras próximas:
- Hacer instancing también para props repetibles (faroles, columnas, etc.).
- Separar materiales por tipo de celda (si `MAZE` evoluciona a IDs, ej. 1=cartón, 2=piedra).

### Enemigos: Billboards

Usar `@react-three/drei`:
- `<Billboard follow />` con `mesh` plano y textura PNG (`CanvasTexture` o `TextureLoader`).
- Para retro: `meshBasicMaterial` (sin sombras) o `meshStandardMaterial` (si queremos afectar por luces).

### Estética “Cardboard Cyberpunk”

**MVP (ya)**:
- albedo canvas + normal corrugado + emissive map (procedural) + fog + luces neon pulsantes.

**Siguiente nivel**:
- ShaderMaterial “cartón” con:
  - normal map + “edge wear” (oscurecer bordes por curvatura/UV)
  - flicker de neón y micro-ruido
  - dither/fog retro (8×8 Bayer) para look DOOM-like

## Lista de tareas (hasta terminar)

> Notación: `[x]` hecho, `[ ]` pendiente. Orden sugerido para minimizar re-trabajo.

## Milestones (recomendado)

1. **M1 — Core Loop Singleplayer**: moverse + disparar + matar + ganar/perder + highscores.
2. **M2 — Visual “Cardboard Cyberpunk” PRO**: shader walls + disolve enemigo + blackout.
3. **M3 — Power-ups Satíricos**: Consulta Popular / IVA 15% / Apagón Nacional.
4. **M4 — Multiplayer P2P MVP**: host/join + sync player poses + disparos.
5. **M5 — Gamepad**: mapeo completo + remapeo básico.
6. **M6 — Paridad + Polishing**: balance, UX, performance, QA, deploy.

### 0) Base del proyecto
- [x] Crear subproyecto Vite + React TS (`doom-noboa/`)
- [x] Instalar deps R3F + drei + zustand + rapier
- [x] Implementar `MAZE` → `InstancedMesh`
- [x] Material base “Cardboard Cyberpunk” (canvas textures + normal corrugado)
- [ ] Mover sprites PNG legacy a `doom-noboa/public/` o `doom-noboa/src/assets/` (decidir estrategia)
- [x] Añadir un `Settings` central (`game/config/settings.ts`) para tuning (FOV, speed, sens, fireRate)
- [ ] Centralizar “world scale” y cámara (FOV/near/far) en settings y evitar magic numbers en `App.tsx`/`GameScene.tsx`

### 1) Control y cámara FPS (single player)
- [x] Implementar Pointer Lock + mouse look (desktop)
- [x] Movimiento WASD (feel base)
- [x] Colisiones contra paredes (grid collision) usando `MAZE`
- [ ] Movement polish: aceleración/fricción + “camera bob” sutil (opcional)
- [ ] Colisiones robustas con Rapier (cápsula + colliders) (opcional, upgrade)
- [x] Soporte móvil básico (joystick/drag look) manteniendo teclado/mouse
- [x] Añadir crosshair y “capture hint” (equivalente al popup legacy)
- [ ] Conectar botón táctil `FIRE` a disparo (y añadir “tap to shoot” opcional en lookpad)
- [ ] Añadir control de sensibilidad y toggles (invert Y, sens) en settings + UI

### 2) Estado de juego (Zustand)
- [x] Store inicial con highscores persistidos
- [ ] Completar `useGameStore` con gameplay real:
  - `health/ammo/score/kills/gameTime` (ya parcial)
  - `inventory/powerUps`
  - `events: blackoutActive, blackoutUntil`
- [ ] Separar store en slices (player/combat/enemies/ui/net) para escalar sin monolito
- [ ] Persist selectivo:
  - highscores + settings
  - NO persist de estado de partida en curso

### 3) Enemigos (billboards) + combate
- [ ] `EnemyEntity` con `<Billboard>` y textura según `type` (`casual/deportivo/presidencial`)
- [ ] Spawner (distribuido) basado en `MAZE` (portar idea del legacy):
  - distancia mínima al player
  - distancia mínima entre enemigos
- [ ] IA MVP:
  - target tracking lateral (tipo “blanco de tiro”)
  - charge + melee + retreat
- [ ] Sistema de disparo:
  - hitscan (raycast) desde cámara al centro (retro FPS) (recomendado)
  - proyectil simple (opcional; útil si quieres balística visible)
- [ ] Headshot/bodyshot:
  - bounding box “en mundo” + zonas relativas (cabeza = 20–25% superior del billboard)
  - opcional: máscara de colisión con 2 colliders (head/body) si usas Rapier
- [ ] Knockback y feedback de hit
- [ ] Condiciones de victoria/derrota (paridad legacy): win si no quedan enemigos; loss si HP=0

### 4) Audio (hook `useWeaponAudio`) + música
- [ ] Portar `weapon-audio.js` a `doom-noboa/src/game/audio/useWeaponAudio.ts`
- [ ] Unificar política de “audio unlock” (primer input desbloquea AudioContext)
- [ ] Voces headshot:
  - SpeechSynthesis si existe
  - fallback WebAudio (formantes) si no
- [ ] Ambience/music loop (el “himno”/secuencia) con control en settings

### 5) Texturas procedurales (p5 → CanvasTexture)
- [ ] Decidir estrategia:
  - A) mantener p5 solo como generador offscreen (bundle grande)
  - B) portar a Canvas 2D puro (recomendado para performance/bundle)
- [x] Generar (Canvas 2D puro → CanvasTexture):
  - skybox panorámico (canvas → `CanvasTexture`)
  - wall tiles colonial / archway
  - floor stones
- [x] Aplicación:
  - paredes instanciadas usan `map/normal/emissive`
  - skybox como esfera/cilindro invertido o “big quad” con UV wrap

### 6) UI/HUD (React)
- [x] HUD mínimo responsive (stats + crosshair + hints) (hecho)
- [ ] HUD completo (paridad legacy) con:
  - vida (bar)
  - ammo + cargadores/reserva (si aplica)
  - timer
  - kills/headshots
- [ ] Minimapa:
  - opción A: Canvas 2D HUD reusando MAZE (rápido)
  - opción B: render-to-texture (R3F) (más complejo)
- [ ] Menú principal + highscores (persistidos) + pantalla de donaciones link

### 7) Innovación A — Shaders “Cardboard Cyberpunk”
- [ ] Material de paredes con ShaderMaterial:
  - dither retro + fog retro
  - “edge wear” (cartón gastado)
  - neón procedural (scanlines + flicker)
- [ ] “Disintegración” de enemigo al morir:
  - Shader de fragmento con threshold animado (burn/ash)
  - confeti/partículas (GPU particles o instanced quads)
  - mantener billboard pero con material animado por uniform `uDissolve`
- [ ] Iluminación:
  - fog volumétrica “barata” (fogExp2 + luces)
  - faroles coloniales (point lights) + flicker
  - [x] “apagón” MVP: apaga luces y baja emissive, con flag HUD (mejorable a “ojos”)

### 8) Innovación B — “La Política del Power-Up”
- [x] Reemplazar ítems genéricos por 3 power-ups (MVP):
  - `ConsultaPopular` (Smart Bomb): elimina enemigos visibles / en rango
  - `IVA15` (trampa): +puntos por kill pero drain de vida por segundo
  - `ApagonNacional` (evento): blackout periódico con ventana de tensión
- [x] Spawns + UI mínima (MVP): pickups en mapa + banner/flags HUD + efectos base
- [ ] Balance: definir duración y contras para que no rompa el loop

### 9) Innovación C — Multiplayer P2P sin servidor (PeerJS/WebRTC)
- [ ] Añadir dependencia `peerjs`
- [ ] UI host/join:
  - host crea `peerId`
  - join ingresa code / escanea QR (móvil)
- [ ] Protocolo de red (mensajes):
  - `playerState` (pos/rot/vel + inputs)
  - `shots` (timestamp + seed)
  - `enemyEvents` (spawn/kill/disintegrate)
  - `powerupEvents`
- [ ] Autoridad:
  - MVP: host autoritativo (enemigos y daño)
  - cliente envía input, host simula y replica snapshots
- [ ] Interpolación/reconciliación:
  - smoothing para remoto
  - buffer temporal (100–150ms)
- [ ] Anti-desync:
  - seed de RNG compartida
  - snapshots periódicos

### 10) Innovación D — Gamepad API
- [ ] Hook `useGamepad()`:
  - polling con `navigator.getGamepads()`
  - deadzones y curvas (stick)
- [ ] Mapeo:
  - stick izq: move
  - stick der: look
  - R2: shoot
  - L2: aim/slow
  - A/X: interact/pickup
- [ ] UI de detección de mando y remapeo básico

### 11) Optimización y calidad
- [ ] Evitar per-frame allocations (reusar math objects)
- [ ] Ajustar `dpr` y `antialias` para look retro/perf
- [ ] Culling y límites:
  - distancia max de enemigos
  - pooling de entidades/partículas
- [ ] Separar chunk de `three` si aplica (code splitting)
- [ ] Medición:
  - stats FPS (solo dev)
  - frame budget (ms) y degradación de calidad

### 12) Paridad con legacy + polishing
- [ ] Igualar “feel” del juego legacy (sensibilidad, fov, velocidad, fireRate)
- [ ] Mantener donaciones/hyperlinks y meta de proyecto
- [ ] QA en:
  - desktop mouse/keyboard
  - Android touch
  - Gamepad
  - 2 navegadores P2P

## Entregables finales esperados

- `doom-noboa/` como SPA jugable, con:
  - nivel instanciado + texturas retro
  - enemigos billboard + combate + disintegración
  - HUD/menús + highscores persistidos
  - power-ups satíricos + evento apagón
  - P2P host/join + sincronización estable (MVP)
  - soporte gamepad
