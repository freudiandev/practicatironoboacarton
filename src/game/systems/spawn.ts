import type { Enemy, EnemyType } from '../store/useGameStore'
import { MAZE } from '../config/maze'
import { SETTINGS } from '../config/settings'
import { WORLD } from '../config/world'
import { cellToWorldCenter, getMazeMetrics, isWallCell, worldToCell } from '../config/mazeMath'

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let x = Math.imul(t ^ (t >>> 15), 1 | t)
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

function pickEnemyType(i: number): EnemyType {
  const types: EnemyType[] = ['casual', 'deportivo', 'presidencial']
  return types[i % types.length]
}

export function spawnInitialEnemies(options: { count: number; seed?: number; playerX: number; playerZ: number }) {
  const rand = mulberry32(options.seed ?? Date.now())
  const { rows, cols } = getMazeMetrics(MAZE, WORLD.cellSize)
  const playerCell = worldToCell(MAZE, WORLD.cellSize, options.playerX, options.playerZ)
  const minCellDist = 6

  const candidates: { cx: number; cz: number; score: number }[] = []
  for (let z = 0; z < rows; z++) {
    for (let x = 0; x < cols; x++) {
      if (isWallCell(MAZE, x, z)) continue
      const dx = x - playerCell.cx
      const dz = z - playerCell.cz
      if (dx * dx + dz * dz < minCellDist * minCellDist) continue

      // Preferir pasillos (2 vecinos libres) similar al legacy.
      const freeL = !isWallCell(MAZE, x - 1, z)
      const freeR = !isWallCell(MAZE, x + 1, z)
      const freeU = !isWallCell(MAZE, x, z - 1)
      const freeD = !isWallCell(MAZE, x, z + 1)
      const openCount = [freeL, freeR, freeU, freeD].filter(Boolean).length
      const corridor = openCount === 2
      const score = (corridor ? 2 : 0) + Math.min(2, Math.sqrt(dx * dx + dz * dz) / 6)
      candidates.push({ cx: x, cz: z, score })
    }
  }

  candidates.sort((a, b) => b.score - a.score)
  const pool = candidates.slice(0, Math.min(140, candidates.length))

  const selected: { cx: number; cz: number }[] = []
  const minBetween = 7

  for (let attempt = 0; attempt < 6; attempt++) {
    selected.length = 0
    const shuffled = pool.slice().sort(() => rand() - 0.5)
    for (const c of shuffled) {
      const ok = selected.every((o) => {
        const dx = c.cx - o.cx
        const dz = c.cz - o.cz
        return dx * dx + dz * dz >= minBetween * minBetween
      })
      if (!ok) continue
      selected.push({ cx: c.cx, cz: c.cz })
      if (selected.length >= options.count) break
    }
    if (selected.length >= options.count) break
  }

  const enemies: Enemy[] = []
  for (let i = 0; i < Math.min(options.count, selected.length); i++) {
    const spot = selected[i]
    const w = cellToWorldCenter(MAZE, WORLD.cellSize, spot.cx, spot.cz)
    const axis = (() => {
      const freeL = !isWallCell(MAZE, spot.cx - 1, spot.cz)
      const freeR = !isWallCell(MAZE, spot.cx + 1, spot.cz)
      const freeU = !isWallCell(MAZE, spot.cx, spot.cz - 1)
      const freeD = !isWallCell(MAZE, spot.cx, spot.cz + 1)
      const horizontal = (freeL || freeR) && !(freeU || freeD)
      return horizontal ? 'x' : 'z'
    })()

    const bounds = (() => {
      // recorrer hasta pared y convertir a world.
      const walk = (dx: number, dz: number) => {
        let x = spot.cx
        let z = spot.cz
        let steps = 0
        while (!isWallCell(MAZE, x + dx, z + dz) && steps < 64) {
          x += dx
          z += dz
          steps++
        }
        return axis === 'x' ? x : z
      }
      if (axis === 'x') {
        const minCell = walk(-1, 0)
        const maxCell = walk(1, 0)
        const minW = cellToWorldCenter(MAZE, WORLD.cellSize, minCell, spot.cz).x
        const maxW = cellToWorldCenter(MAZE, WORLD.cellSize, maxCell, spot.cz).x
        return { min: Math.min(minW, maxW), max: Math.max(minW, maxW) }
      }
      const minCell = walk(0, -1)
      const maxCell = walk(0, 1)
      const minW = cellToWorldCenter(MAZE, WORLD.cellSize, spot.cx, minCell).z
      const maxW = cellToWorldCenter(MAZE, WORLD.cellSize, spot.cx, maxCell).z
      return { min: Math.min(minW, maxW), max: Math.max(minW, maxW) }
    })()

    enemies.push({
      id: `e_${Date.now()}_${i}_${Math.floor(rand() * 1e6)}`,
      type: pickEnemyType(i),
      position: { x: w.x, y: SETTINGS.player.eyeHeight * 0.65, z: w.z },
      health: 100,
      maxHealth: 100,
      alive: true,
      dissolve: 0,
      ai: {
        state: 'target',
        axis,
        dir: rand() < 0.5 ? -1 : 1,
        min: bounds.min,
        max: bounds.max,
        nextResumeAt: 0,
        nextMeleeAt: 0,
        chargeUntil: 0,
        retreatUntil: 0,
        hideUntil: 0
      }
    })
  }

  return enemies
}
