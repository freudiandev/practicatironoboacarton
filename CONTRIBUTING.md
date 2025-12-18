# Contribuir a DOOM: Noboa de Cartón (R3F)

La versión principal del juego corre como **SPA Vite** (React + React Three Fiber).  
El motor original raycasting Canvas 2D quedó archivado en `legacy/raycast/`.

## Requisitos

- Node.js 20+
- Navegador moderno (Chrome/Edge/Firefox)

## Levantar en local

```bash
npm install
npm run dev
```

## Build / preview

```bash
npm run build
npm run preview
```

## Dónde tocar qué

- Render/escena: `src/game/scenes/GameScene.tsx`
- Laberinto (GPU instancing): `src/game/render/MazeInstanced.tsx`
- Pancartas/cárteles satíricos: `src/game/render/PostersInstanced.tsx`, `src/game/satire/powerupCopy.ts`
- Controles:
  - Player FPS: `src/game/entities/PlayerController.tsx`
  - Móvil: `src/game/ui/TouchControls.tsx`
  - Gamepad: `src/game/input/useGamepad.ts`
- Gameplay:
  - Combate: `src/game/systems/CombatSystem.tsx`
  - IA/spawn: `src/game/systems/EnemySystem.tsx`, `src/game/systems/spawn.ts`
  - Power-ups/blackout: `src/game/systems/PowerUpSystem.tsx`
- Estado (Zustand): `src/game/store/useGameStore.ts`

## Deploy (GitHub Pages)

- Workflow: `.github/workflows/pages.yml`
- Nota: `vite.config.ts` configura `base` para Pages (ruta `/<repo>/`).

## Legacy (opcional, histórico)

El código raycasting se mantiene solo como referencia en `legacy/raycast/`.  
No se publica como versión principal.
