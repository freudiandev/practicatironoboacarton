export type Maze = number[][]

export function getMazeMetrics(maze: Maze, cellSize: number) {
  const rows = maze.length
  const cols = maze[0]?.length ?? 0

  // El laberinto se centra en el mundo, igual que en MazeInstanced.tsx.
  const width = cols * cellSize
  const depth = rows * cellSize
  const minX = -width / 2
  const minZ = -depth / 2
  const originX = minX + cellSize / 2
  const originZ = minZ + cellSize / 2

  return { rows, cols, width, depth, minX, minZ, originX, originZ }
}

export function isWallCell(maze: Maze, cx: number, cz: number) {
  if (cz < 0 || cz >= maze.length) return true
  const row = maze[cz]
  if (!row) return true
  if (cx < 0 || cx >= row.length) return true
  return row[cx] === 1
}

export function worldToCell(maze: Maze, cellSize: number, x: number, z: number) {
  const { minX, minZ } = getMazeMetrics(maze, cellSize)
  const cx = Math.floor((x - minX) / cellSize)
  const cz = Math.floor((z - minZ) / cellSize)
  return { cx, cz }
}

export function cellToWorldCenter(maze: Maze, cellSize: number, cx: number, cz: number) {
  const { originX, originZ } = getMazeMetrics(maze, cellSize)
  return {
    x: originX + cx * cellSize,
    z: originZ + cz * cellSize
  }
}

