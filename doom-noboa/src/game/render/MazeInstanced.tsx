import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { GRID_COLS, GRID_ROWS, MAZE } from '../config/maze'
import { WORLD } from '../config/world'

type MazeInstancedProps = {
  maze?: number[][]
  cellSize?: number
  wallHeight?: number
  material: THREE.Material
}

export function MazeInstanced({
  maze = MAZE,
  cellSize = WORLD.cellSize,
  wallHeight = WORLD.wallHeight,
  material
}: MazeInstancedProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const { instanceCount, matrices } = useMemo(() => {
    const m = new THREE.Matrix4()
    const pos = new THREE.Vector3()
    const quat = new THREE.Quaternion()
    const scale = new THREE.Vector3(1, 1, 1)

    const cols = maze[0]?.length ?? GRID_COLS
    const rows = maze.length ?? GRID_ROWS
    const originX = -((cols * cellSize) / 2) + cellSize / 2
    const originZ = -((rows * cellSize) / 2) + cellSize / 2

    const transforms: THREE.Matrix4[] = []

    for (let z = 0; z < rows; z++) {
      const row = maze[z]
      if (!row) continue
      for (let x = 0; x < cols; x++) {
        if (row[x] !== 1) continue
        pos.set(originX + x * cellSize, wallHeight / 2 + WORLD.floorY, originZ + z * cellSize)
        scale.set(cellSize, wallHeight, cellSize)
        m.compose(pos, quat, scale)
        transforms.push(m.clone())
      }
    }

    return { instanceCount: transforms.length, matrices: transforms }
  }, [cellSize, maze, wallHeight])

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    for (let i = 0; i < instanceCount; i++) {
      mesh.setMatrixAt(i, matrices[i])
    }
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [instanceCount, matrices])

  return (
    <instancedMesh ref={meshRef} args={[undefined, material, instanceCount]} frustumCulled>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  )
}

