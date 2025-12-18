import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../store/useGameStore'

export function MuzzleFlashLight() {
  const lightRef = useRef<THREE.PointLight>(null)
  const { camera } = useThree()
  const dir = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const light = lightRef.current
    if (!light) return

    const { muzzleUntil, blackoutUntil } = useGameStore.getState()
    const now = Date.now()
    const active = muzzleUntil > now
    const blackout = blackoutUntil > now

    // Follow camera (un poco adelante, como flash del arma).
    camera.getWorldDirection(dir)
    light.position.copy(camera.position).addScaledVector(dir, 0.35)

    // En blackout el flash es el “único” key light momentáneo.
    light.intensity = active ? (blackout ? 18 : 12) : 0
    light.distance = active ? 8.5 : 0
  })

  return (
    <pointLight
      ref={lightRef}
      color={'#ffd300'}
      distance={6.5}
      decay={2}
      intensity={0}
    />
  )
}
