import type { Maze } from '../config/mazeMath'
import { getMazeMetrics, isWallCell, worldToCell } from '../config/mazeMath'

type Vec2 = { x: number; z: number }

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function circleIntersectsCell(
  cellSize: number,
  cellMinX: number,
  cellMinZ: number,
  centerX: number,
  centerZ: number,
  radius: number
) {
  const closestX = clamp(centerX, cellMinX, cellMinX + cellSize)
  const closestZ = clamp(centerZ, cellMinZ, cellMinZ + cellSize)
  const dx = centerX - closestX
  const dz = centerZ - closestZ
  return dx * dx + dz * dz < radius * radius
}

function canOccupy(maze: Maze, cellSize: number, pos: Vec2, radius: number) {
  const { cx, cz } = worldToCell(maze, cellSize, pos.x, pos.z)
  const { minX, minZ } = getMazeMetrics(maze, cellSize)

  // Chequear las celdas vecinas para evitar “tunneling” contra esquinas.
  for (let z = cz - 1; z <= cz + 1; z++) {
    for (let x = cx - 1; x <= cx + 1; x++) {
      if (!isWallCell(maze, x, z)) continue

      // Convertir celda a AABB en mundo (min corner).
      const cellMinX = minX + x * cellSize
      const cellMinZ = minZ + z * cellSize

      if (circleIntersectsCell(cellSize, cellMinX, cellMinZ, pos.x, pos.z, radius)) {
        return false
      }
    }
  }

  return true
}

/**
 * Movimiento con “sliding”: intenta X y Z por separado.
 * Similar al approach del legacy (`canMoveTo` por ejes).
 */
export function moveWithGridCollision(options: {
  maze: Maze
  cellSize: number
  position: Vec2
  delta: Vec2
  radius: number
}) {
  const { maze, cellSize, position, delta, radius } = options

  const nextX: Vec2 = { x: position.x + delta.x, z: position.z }
  const movedX = canOccupy(maze, cellSize, nextX, radius) ? nextX : position

  const nextZ: Vec2 = { x: movedX.x, z: position.z + delta.z }
  const movedXZ = canOccupy(maze, cellSize, nextZ, radius) ? nextZ : movedX

  return movedXZ
}
