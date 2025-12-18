import { useEffect, useMemo, useRef } from 'react'
import { Billboard, Grid } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GRID_COLS, GRID_ROWS } from '../config/maze'
import { WORLD } from '../config/world'
import { PlayerController } from '../entities/PlayerController'
import { MazeInstanced } from '../render/MazeInstanced'
import { createCardboardWallMaterial } from '../textures/cardboardCyberpunk'

export function GameScene() {
  const neonKeyLight = useRef<THREE.PointLight>(null)
  const neonFillLight = useRef<THREE.PointLight>(null)

  const { wallMaterial, wallTextures } = useMemo(() => {
    const { material, textures } = createCardboardWallMaterial()
    return { wallMaterial: material, wallTextures: textures }
  }, [])

  const floorMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1a0b20'),
      roughness: 0.95,
      metalness: 0.05,
      emissive: new THREE.Color('#13001a'),
      emissiveIntensity: 0.2
    })
    return mat
  }, [])

  useEffect(() => {
    return () => {
      wallMaterial.dispose()
      wallTextures.map.dispose()
      wallTextures.normalMap.dispose()
      wallTextures.emissiveMap.dispose()
      floorMaterial.dispose()
    }
  }, [floorMaterial, wallMaterial, wallTextures])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const pulse = 0.55 + Math.sin(t * 1.8) * 0.25
    if (neonKeyLight.current) neonKeyLight.current.intensity = 10 * pulse
    if (neonFillLight.current) neonFillLight.current.intensity = 7 * (0.65 + Math.cos(t * 1.3) * 0.25)
    wallMaterial.emissiveIntensity = 0.18 + pulse * 0.45
  })

  const levelWidth = GRID_COLS * WORLD.cellSize
  const levelDepth = GRID_ROWS * WORLD.cellSize

  return (
    <>
      <PlayerController />

      <fogExp2 attach="fog" args={['#070012', 0.065]} />
      <color attach="background" args={['#070012']} />

      <ambientLight intensity={0.18} />
      <pointLight
        ref={neonKeyLight}
        position={[levelWidth * 0.15, 3.6, levelDepth * 0.15]}
        distance={24}
        intensity={9}
        color={'#ff00aa'}
      />
      <pointLight
        ref={neonFillLight}
        position={[-levelWidth * 0.18, 2.8, -levelDepth * 0.2]}
        distance={22}
        intensity={6.5}
        color={'#00fff0'}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, WORLD.floorY, 0]} receiveShadow={false}>
        <planeGeometry args={[levelWidth + 2, levelDepth + 2]} />
        <primitive object={floorMaterial} attach="material" />
      </mesh>

      <MazeInstanced material={wallMaterial} />

      <Grid
        position={[0, 0.001, 0]}
        args={[levelWidth + 2, levelDepth + 2]}
        cellSize={WORLD.cellSize}
        cellThickness={0.0}
        cellColor={'#11051a'}
        sectionSize={WORLD.cellSize * 4}
        sectionThickness={0.0}
        sectionColor={'#1e0630'}
        fadeDistance={22}
        fadeStrength={1.2}
        infiniteGrid={false}
      />

      {/* Placeholder visual para enemigos “sprite” (billboard). */}
      <Billboard position={[0, 1, 0]} follow>
        <mesh>
          <planeGeometry args={[0.9, 1.6]} />
          <meshStandardMaterial color="#ffffff" emissive="#ff00aa" emissiveIntensity={0.8} />
        </mesh>
      </Billboard>
    </>
  )
}
