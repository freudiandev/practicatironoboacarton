import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { WORLD } from '../config/world'
import { useGameStore } from '../store/useGameStore'

export function RemotePlayerGhost() {
  const remote = useGameStore((s) => s.netRemotePose)
  const mode = useGameStore((s) => s.netMode)
  const connected = useGameStore((s) => s.netConnected)
  const gameState = useGameStore((s) => s.gameState)

  const group = useRef<THREE.Group>(null)
  const smoothedPos = useRef(new THREE.Vector3())
  const targetPos = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    // Reset smoothing when se conecta o cambia el pose.
    if (!remote) return
    smoothedPos.current.set(remote.x, WORLD.floorY, remote.z)
  }, [remote])

  useFrame((_, delta) => {
    if (!remote) return
    if (!group.current) return

    targetPos.set(remote.x, WORLD.floorY, remote.z)
    smoothedPos.current.lerp(targetPos, 1 - Math.pow(0.001, delta))
    group.current.position.copy(smoothedPos.current)
    group.current.rotation.set(0, remote.yaw, 0)
  })

  if (mode === 'off' || !connected) return null
  if (gameState !== 'playing') return null
  if (!remote) return null

  return (
    <group ref={group} name="remotePlayer">
      {/* Cuerpo simple (capsule retro) */}
      <mesh position={[0, 0.9, 0]} castShadow={false} receiveShadow={false}>
        <capsuleGeometry args={[0.22, 1.0, 4, 8]} />
        <meshStandardMaterial
          color={'#0a0510'}
          roughness={0.85}
          metalness={0.05}
          emissive={'#00fff0'}
          emissiveIntensity={0.22}
        />
      </mesh>

      {/* Ojos “neón” (visibles incluso en blackout por emissive) */}
      <mesh position={[0, 1.35, 0.22]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color={'#ff00aa'} />
      </mesh>
      <mesh position={[0.12, 1.35, 0.22]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color={'#ff00aa'} />
      </mesh>
    </group>
  )
}

