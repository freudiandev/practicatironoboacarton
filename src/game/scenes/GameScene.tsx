import { useEffect, useMemo, useRef } from 'react'
import { Grid } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GRID_COLS, GRID_ROWS } from '../config/maze'
import { WORLD } from '../config/world'
import { PlayerController } from '../entities/PlayerController'
import { RemotePlayerGhost } from '../entities/RemotePlayerGhost'
import { MazeInstanced } from '../render/MazeInstanced'
import { MuzzleFlashLight } from '../render/MuzzleFlashLight'
import { PostersInstanced } from '../render/PostersInstanced'
import { LampPosts } from '../render/LampPosts'
import { createCardboardWallMaterial } from '../textures/cardboardCyberpunk'
import { EnemySystem } from '../systems/EnemySystem'
import { CombatSystem } from '../systems/CombatSystem'
import { TimeSystem } from '../systems/TimeSystem'
import { GamepadController } from '../input/useGamepad'
import { useCentroHistoricoTextures } from '../textures/useCentroHistoricoTextures'
import { useGameStore } from '../store/useGameStore'
import { PowerUpSystem } from '../systems/PowerUpSystem'
import { PeerSystem } from '../net/PeerSystem'

export function GameScene() {
  const ambientRef = useRef<THREE.AmbientLight>(null)
  const neonKeyLight = useRef<THREE.PointLight>(null)
  const neonFillLight = useRef<THREE.PointLight>(null)
  const skyRef = useRef<THREE.Mesh>(null)

  const centro = useCentroHistoricoTextures()

  const { wallMaterial, wallTextures } = useMemo(() => {
    // Base "cartón" (normal corrugado + emissive neon), pero con albedo colonial.
    const { material, textures } = createCardboardWallMaterial()
    material.map = centro.wallColonial
    material.emissiveIntensity = 0.28
    material.needsUpdate = true
    return { wallMaterial: material, wallTextures: textures }
  }, [centro.wallColonial])

  const floorMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1a0b20'),
      map: centro.floorStones,
      roughness: 0.95,
      metalness: 0.05,
      emissive: new THREE.Color('#13001a'),
      emissiveIntensity: 0.2
    })
    return mat
  }, [centro.floorStones])

  const mountainMaterial = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      map: centro.mountainDetail,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.95
    })
    if (mat.map) {
      mat.map.wrapS = THREE.RepeatWrapping
      mat.map.repeat.set(2.5, 1)
    }
    return mat
  }, [centro.mountainDetail])

  useEffect(() => {
    return () => {
      wallMaterial.dispose()
      wallTextures.map.dispose()
      wallTextures.normalMap.dispose()
      wallTextures.emissiveMap.dispose()
      floorMaterial.dispose()
      mountainMaterial.dispose()
    }
  }, [floorMaterial, mountainMaterial, wallMaterial, wallTextures])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const pulse = 0.55 + Math.sin(t * 1.8) * 0.25
    const blackoutUntil = useGameStore.getState().blackoutUntil
    const blackout = blackoutUntil && Date.now() < blackoutUntil

    // Blackout: apagar luces, dejar algo de emissive en paredes (neón “residual”).
    if (ambientRef.current) ambientRef.current.intensity = blackout ? 0.02 : 0.18
    if (neonKeyLight.current) neonKeyLight.current.intensity = blackout ? 0.15 : 10 * pulse
    if (neonFillLight.current) neonFillLight.current.intensity = blackout ? 0.1 : 7 * (0.65 + Math.cos(t * 1.3) * 0.25)
    wallMaterial.emissiveIntensity = blackout ? 0.06 : (0.18 + pulse * 0.45)

    // Mantener skybox centrado en el jugador (sin parallax al caminar).
    if (skyRef.current) {
      const pose = useGameStore.getState().playerPose
      skyRef.current.position.set(pose.x, 6.2, pose.z)
      // Rotar skybox con yaw para un feel DOOM.
      skyRef.current.rotation.set(0, pose.yaw, 0)
    }
  })

  const levelWidth = GRID_COLS * WORLD.cellSize
  const levelDepth = GRID_ROWS * WORLD.cellSize

  return (
    <>
      <PlayerController />
      <RemotePlayerGhost />
      <GamepadController />
      <PeerSystem />
      <EnemySystem />
      <CombatSystem />
      <TimeSystem />
      <PowerUpSystem />

      <fogExp2 attach="fog" args={['#070012', 0.065]} />
      <color attach="background" args={['#070012']} />

      <ambientLight ref={ambientRef} intensity={0.18} />
      <MuzzleFlashLight />
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

      {/* Skybox Centro Histórico: cilindro invertido que sigue al jugador */}
      <mesh ref={skyRef} position={[0, 0, 0]} renderOrder={-10}>
        <cylinderGeometry args={[45, 45, 18, 48, 1, true]} />
        <meshBasicMaterial map={centro.sky} side={THREE.BackSide} fog={false} />
      </mesh>
      <mesh position={[0, 0, 0]} renderOrder={-9}>
        <cylinderGeometry args={[38, 38, 14, 48, 1, true]} />
        <primitive attach="material" object={mountainMaterial} />
      </mesh>

      <MazeInstanced material={wallMaterial} />
      <LampPosts
        cells={[
          { x: 14, z: 5 },
          { x: 14, z: 17 },
          { x: 7, z: 11 },
          { x: 21, z: 11 },
          { x: 10, z: 4 },
          { x: 18, z: 4 },
          { x: 10, z: 18 },
          { x: 18, z: 18 }
        ]}
      />
      <PostersInstanced />

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

      {/* Nota: EnemySystem ya renderiza enemigos Billboard reales con sprites. */}
    </>
  )
}
