/**
 * Layout inspirado en el Centro Histórico (estilo “manzanas” + Plaza central).
 * 0 = walkable, 1 = wall.
 *
 * Nota: mantener un borde de paredes para evitar out-of-bounds.
 */
export const MAZE: number[][] = (() => {
  const cols = 28
  const rows = 20
  const g = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0))

  const fill = (x0: number, z0: number, w: number, h: number, v: number) => {
    for (let z = z0; z < z0 + h; z++) {
      if (z < 0 || z >= rows) continue
      for (let x = x0; x < x0 + w; x++) {
        if (x < 0 || x >= cols) continue
        g[z][x] = v
      }
    }
  }

  // Borde.
  for (let x = 0; x < cols; x++) {
    g[0][x] = 1
    g[rows - 1][x] = 1
  }
  for (let z = 0; z < rows; z++) {
    g[z][0] = 1
    g[z][cols - 1] = 1
  }

  // Manzanas (bloques) en las esquinas (simula calles y patios internos).
  fill(2, 2, 8, 5, 1) // NW
  fill(18, 2, 8, 5, 1) // NE
  fill(2, 13, 8, 5, 1) // SW
  fill(18, 13, 8, 5, 1) // SE

  // Patios internos (vacíos dentro de manzanas).
  fill(4, 3, 4, 3, 0)
  fill(20, 3, 4, 3, 0)
  fill(4, 14, 4, 3, 0)
  fill(20, 14, 4, 3, 0)

  // Plaza central: anillo + interior abierto.
  fill(9, 6, 10, 8, 1) // ring
  fill(10, 7, 8, 6, 0) // plaza interior

  // Aberturas de la plaza (calles).
  g[6][13] = 0 // norte
  g[13][14] = 0 // sur
  g[9][9] = 0 // oeste
  g[10][18] = 0 // este

  // Calles principales (carve) en cruz.
  for (let z = 1; z < rows - 1; z++) g[z][13] = 0
  for (let x = 1; x < cols - 1; x++) g[10][x] = 0

  // Callejones secundarios (un poco de irregularidad).
  for (let z = 2; z <= 8; z++) g[z][6] = 0
  for (let z = 11; z <= 17; z++) g[z][21] = 0
  for (let x = 3; x <= 12; x++) g[4][x] = 0
  for (let x = 14; x <= 24; x++) g[15][x] = 0

  // Pequeños “pasajes” para que no sea demasiado ortogonal.
  fill(11, 2, 2, 2, 1)
  fill(14, 2, 2, 2, 1)
  fill(11, 16, 2, 2, 1)
  fill(14, 16, 2, 2, 1)

  // Asegurar que el spawn quede libre (cerca de la plaza).
  g[10][13] = 0

  return g
})()

export const GRID_ROWS = MAZE.length
export const GRID_COLS = MAZE[0]?.length ?? 0
