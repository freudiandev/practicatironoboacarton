import { useMemo } from 'react'
import * as THREE from 'three'
import { cellToWorldCenter } from '../config/mazeMath'
import { MAZE } from '../config/maze'
import { WORLD } from '../config/world'

type LampPostsProps = {
  cells: Array<{ x: number; z: number }>
}

export function LampPosts({ cells }: LampPostsProps) {
  const { postGeo, headGeo, postMat, headMat } = useMemo(() => {
    const postGeo = new THREE.CylinderGeometry(0.07, 0.07, 2.4, 10)
    const headGeo = new THREE.SphereGeometry(0.18, 12, 12)
    const postMat = new THREE.MeshStandardMaterial({
      color: '#1a1a1a',
      metalness: 0.35,
      roughness: 0.62
    })
    const headMat = new THREE.MeshStandardMaterial({
      color: '#ffdd77',
      emissive: '#ffdd77',
      emissiveIntensity: 1.8,
      roughness: 0.35,
      metalness: 0.2
    })
    return { postGeo, headGeo, postMat, headMat }
  }, [])

  const positions = useMemo(
    () =>
      cells.map(({ x, z }) => {
        const w = cellToWorldCenter(MAZE, WORLD.cellSize, x, z)
        return { x: w.x, y: 0, z: w.z }
      }),
    [cells]
  )

  return (
    <group name="lamp-posts">
      {positions.map((p, idx) => (
        <group key={`lamp_${idx}`} position={[p.x, WORLD.floorY, p.z]}>
          <mesh geometry={postGeo} material={postMat} position={[0, 1.2, 0]} />
          <mesh geometry={headGeo} material={headMat} position={[0, 2.5, 0]} />
          <pointLight
            color={'#ffdd77'}
            intensity={0.9}
            distance={7.5}
            decay={2}
            position={[0, 2.5, 0]}
          />
        </group>
      ))}
    </group>
  )
}

