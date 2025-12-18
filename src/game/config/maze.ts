/**
 * Nuevo layout “Centro Histórico”: calles empedradas, plazas y patios coloniales.
 * 0 = caminable, 1 = pared/bloque.
 */
export const MAZE: number[][] = (() => {
  const cols = 30
  const rows = 22
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

  // Borde de murallas.
  for (let x = 0; x < cols; x++) {
    g[0][x] = 1
    g[rows - 1][x] = 1
  }
  for (let z = 0; z < rows; z++) {
    g[z][0] = 1
    g[z][cols - 1] = 1
  }

  // Plazas y manzanas.
  fill(3, 3, 7, 6, 1) // San Francisco
  fill(20, 3, 7, 6, 1) // San Agustin
  fill(3, 13, 7, 5, 1) // San Blas
  fill(20, 14, 7, 5, 1) // Plaza Grande sur

  // Patio interiores (vacíos).
  fill(5, 4, 3, 3, 0)
  fill(22, 4, 3, 3, 0)
  fill(5, 14, 3, 2, 0)
  fill(22, 15, 3, 2, 0)

  // Plaza central (anillo).
  fill(10, 7, 10, 8, 1)
  fill(11, 8, 8, 6, 0)

  // Ejes principales (Gran Colombia / 24 de Mayo).
  for (let z = 1; z < rows - 1; z++) g[z][14] = 0
  for (let x = 1; x < cols - 1; x++) g[11][x] = 0

  // Aberturas hacia la plaza.
  g[7][14] = 0
  g[14][14] = 0
  g[11][9] = 0
  g[11][19] = 0

  // Callejones y diagonales pequeñas.
  for (let z = 4; z <= 10; z++) g[z][7] = 0
  for (let z = 12; z <= 18; z++) g[z][23] = 0
  for (let x = 6; x <= 13; x++) g[4][x] = 0
  for (let x = 16; x <= 26; x++) g[16][x] = 0
  g[9][20] = 0
  g[10][21] = 0
  g[13][6] = 0
  g[14][7] = 0

  // Placitas y atrios pequeños.
  fill(9, 2, 2, 2, 1)
  fill(18, 2, 2, 2, 1)
  fill(9, 18, 2, 2, 1)
  fill(18, 18, 2, 2, 1)

  // Asegurar spawn despejado (cerca del cruce central).
  g[11][14] = 0
  g[10][14] = 0

  return g
})()

export const GRID_ROWS = MAZE.length
export const GRID_COLS = MAZE[0]?.length ?? 0
