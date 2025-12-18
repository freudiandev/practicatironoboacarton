# doom-noboa (Vite + React + R3F + Zustand)

Subproyecto de migración del juego legacy (raycasting Canvas 2D) hacia una arquitectura moderna:

- **Vite** (SPA estático)
- **React + React Three Fiber (R3F)** para render GPU
- **Zustand** para estado (con persist de highscores)
- **InstancedMesh** para paredes del laberinto (un solo draw call para todo el nivel)

## Ejecutar

```bash
npm install
npm run dev
```

## Mobile / responsive

- La UI es responsive y respeta safe-areas (`env(safe-area-inset-*)`).
- En dispositivos táctiles aparece un **joystick virtual** (izq) + **área de swipe** (der) para mirar.
- En portrait se muestra una sugerencia para rotar a horizontal (no bloqueante).

## Estructura recomendada

```
src/
  game/
    config/
      maze.ts                # matriz MAZE (0/1) + GRID_COLS/ROWS
      world.ts               # escala del mundo (cellSize, wallHeight)
    render/
      MazeInstanced.tsx      # convierte MAZE en InstancedMesh
    scenes/
      GameScene.tsx          # escena principal (fog, luces, piso, maze)
    textures/
      cardboardCyberpunk.ts  # albedo/normal/emissive procedurales (pixel art)
    store/
      useGameStore.ts        # Zustand (highscores persistidos)
```

## Punto de entrada

- `src/App.tsx`: crea el `<Canvas />` de R3F y monta `<GameScene />`.
- `src/game/scenes/GameScene.tsx`: renderiza nivel + look & feel “Cardboard Cyberpunk”.

## Maze → InstancedMesh

El corazón del render de nivel es `src/game/render/MazeInstanced.tsx`, que:

1. Recorre la matriz `MAZE`.
2. Por cada celda con valor `1`, crea una `Matrix4` (posición/escala).
3. Pinta todas las paredes en un `InstancedMesh` (boxGeometry reutilizada).

Esto elimina el coste CPU del raycasting y lo reemplaza por draw calls estables en GPU.
