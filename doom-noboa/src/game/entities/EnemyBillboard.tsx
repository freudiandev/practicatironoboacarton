import { Billboard, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { createDissolveSpriteMaterial } from '../render/dissolveMaterial'
import { getEnemySpriteUrl } from './enemySprites'

export type EnemyBillboardProps = {
  id: string
  type: 'casual' | 'deportivo' | 'presidencial'
  position: { x: number; y: number; z: number }
  alive: boolean
  dissolve: number // 0..1
  onDissolveDone?: (id: string) => void
}

export function EnemyBillboard({ id, type, position, alive, dissolve, onDissolveDone }: EnemyBillboardProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const shaderRef = useRef<THREE.ShaderMaterial | null>(null)

  const texture = useTexture(getEnemySpriteUrl(type))

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.magFilter = THREE.NearestFilter
    texture.minFilter = THREE.NearestMipmapNearestFilter
    texture.generateMipmaps = true
    texture.needsUpdate = true
  }, [texture])

  const { baseMaterial, dyingMaterial } = useMemo(() => {
    const base = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.1,
      depthWrite: false
    })
    const dying = createDissolveSpriteMaterial({ map: texture })
    shaderRef.current = dying
    return { baseMaterial: base, dyingMaterial: dying }
  }, [texture])

  useEffect(() => {
    return () => {
      baseMaterial.dispose()
      dyingMaterial.dispose()
    }
  }, [baseMaterial, dyingMaterial])

  useFrame(({ clock }) => {
    if (!shaderRef.current) return
    shaderRef.current.uniforms.uTime.value = clock.getElapsedTime()
    shaderRef.current.uniforms.uDissolve.value = dissolve
    if (!alive && dissolve >= 1 && onDissolveDone) {
      onDissolveDone(id)
    }
  })

  // Tamaño aproximado humano (retro DOOM).
  const width = type === 'deportivo' ? 0.75 : type === 'presidencial' ? 0.82 : 0.86
  const height = 1.65

  return (
    <Billboard follow position={[position.x, position.y, position.z]}>
      <mesh
        ref={meshRef}
        userData={{ enemyId: id, enemyType: type }}
        renderOrder={5}
      >
        <planeGeometry args={[width, height]} />
        <primitive object={alive ? baseMaterial : dyingMaterial} attach="material" />
      </mesh>
    </Billboard>
  )
}
