import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/useGameStore'
import { useWeaponAudio } from '../audio/useWeaponAudio'

type CombatSystemProps = {
  enemiesGroupName?: string
}

function getEnemyIdFromObject(obj: THREE.Object3D): string | null {
  let current: THREE.Object3D | null = obj
  while (current) {
    const id = (current as any).userData?.enemyId
    if (typeof id === 'string') return id
    current = current.parent
  }
  return null
}

export function CombatSystem({ enemiesGroupName = 'enemies' }: CombatSystemProps) {
  const { camera, scene } = useThree()
  const gameState = useGameStore((s) => s.gameState)
  const isTouch = useGameStore((s) => s.isTouch)
  const ammo = useGameStore((s) => s.ammo)
  const spendAmmo = useGameStore((s) => s.spendAmmo)
  const updateEnemy = useGameStore((s) => s.updateEnemy)
  const addScore = useGameStore((s) => s.addScore)
  const addKill = useGameStore((s) => s.addKill)
  const weaponAudio = useWeaponAudio()

  const fireRequested = useRef(false)
  const lastShotAt = useRef(0)

  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const tmpUv = useMemo(() => new THREE.Vector2(), [])
  const screenCenter = useMemo(() => new THREE.Vector2(0, 0), [])

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      if (gameState !== 'playing') return
      if (!isTouch && !document.pointerLockElement) return
      fireRequested.current = true
    }
    window.addEventListener('mousedown', onMouseDown)
    return () => window.removeEventListener('mousedown', onMouseDown)
  }, [gameState, isTouch])

  // Hook del botón táctil FIRE (TouchControls) todavía no dispara por sí mismo:
  // usamos la misma variable de estado para poder conectarlo luego sin reescribir el sistema.
  useFrame((_, delta) => {
    void delta
    if (gameState !== 'playing') return
    if (!fireRequested.current) return
    fireRequested.current = false

    const now = performance.now()
    const cooldownMs = 300
    if (now - lastShotAt.current < cooldownMs) return
    if (ammo <= 0) return

    const ok = spendAmmo(1)
    if (!ok) return
    lastShotAt.current = now
    void weaponAudio.playShot()

    // Raycast desde centro de pantalla.
    raycaster.setFromCamera(screenCenter, camera)

    const group = scene.getObjectByName(enemiesGroupName)
    if (!group) return

    const hits = raycaster.intersectObjects(group.children, true)
    if (!hits.length) return

    const hit = hits[0]
    const enemyId = getEnemyIdFromObject(hit.object)
    if (!enemyId) return

    // Headshot por UV: top 22% (v > 0.78) del sprite.
    const uv = hit.uv ? tmpUv.copy(hit.uv) : null
    const isHeadshot = Boolean(uv && uv.y > 0.78)
    const damage = isHeadshot ? 100 : 20

    // Leer enemigo actual desde store (evita race).
    const state = useGameStore.getState()
    const enemy = state.enemies.find((e) => e.id === enemyId)
    if (!enemy || !enemy.alive) return

    const nextHp = enemy.health - damage
    if (nextHp <= 0) {
      updateEnemy(enemyId, { alive: false, health: 0 })
      addKill()
      addScore(isHeadshot ? 160 : 100)
      if (isHeadshot) {
        useGameStore.setState((s) => ({ headshots: s.headshots + 1 }))
        void weaponAudio.playHeadshot()
      } else {
        void weaponAudio.playHit()
      }
    } else {
      updateEnemy(enemyId, { health: nextHp })
      addScore(isHeadshot ? 30 : 10)
      void weaponAudio.playHit()
    }
  })

  return null
}
