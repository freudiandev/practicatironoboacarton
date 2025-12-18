import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/useGameStore'
import { useWeaponAudio } from '../audio/useWeaponAudio'
import { SETTINGS } from '../config/settings'

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
  const pointerLocked = useGameStore((s) => s.pointerLocked)
  const gamepadActive = useGameStore((s) => s.gamepadActive)
  const ammo = useGameStore((s) => s.ammo)
  const spendAmmo = useGameStore((s) => s.spendAmmo)
  const reloadUntil = useGameStore((s) => s.reloadUntil)
  const requestReload = useGameStore((s) => s.requestReload)
  const reload = useGameStore((s) => s.reload)
  const setReloadUntil = useGameStore((s) => s.setReloadUntil)
  const updateEnemy = useGameStore((s) => s.updateEnemy)
  const addScore = useGameStore((s) => s.addScore)
  const addKill = useGameStore((s) => s.addKill)
  const weaponAudio = useWeaponAudio()
  const addRecoil = useGameStore((s) => s.addRecoil)
  const setMuzzleUntil = useGameStore((s) => s.setMuzzleUntil)
  const setHitMarkerUntil = useGameStore((s) => s.setHitMarkerUntil)
  const fireHeld = useGameStore((s) => s.fireHeld)
  const setFireHeld = useGameStore((s) => s.setFireHeld)
  const showBanner = useGameStore((s) => s.showBanner)

  const lastShotAt = useRef(0)
  const lastAutoReloadBannerAt = useRef(0)

  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const tmpUv = useMemo(() => new THREE.Vector2(), [])
  const screenCenter = useMemo(() => new THREE.Vector2(0, 0), [])

  useEffect(() => {
    if (isTouch) return
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      if (gameState !== 'playing') return
      setFireHeld(true)
    }
    const onMouseUp = (e: MouseEvent) => {
      if (e.button !== 0) return
      setFireHeld(false)
    }
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [gameState, isTouch, setFireHeld])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return
      if (e.code === SETTINGS.reload.key) {
        requestReload()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [gameState, requestReload])

  useEffect(() => {
    if (!isTouch && !pointerLocked && !gamepadActive) setFireHeld(false)
  }, [gamepadActive, isTouch, pointerLocked, setFireHeld])

  useFrame((_, delta) => {
    void delta
    if (gameState !== 'playing') return

    // Resolver reload si terminó.
    if (reloadUntil && Date.now() >= reloadUntil) {
      reload()
      setReloadUntil(0)
    }

    const canShoot = (pointerLocked || isTouch || gamepadActive)
    if (!canShoot) return

    const now = performance.now()
    const cooldownMs = SETTINGS.combat.fireRateMs
    if (reloadUntil && Date.now() < reloadUntil) return

    if (!fireHeld) return

    if (now - lastShotAt.current < cooldownMs) return

    if (ammo <= 0) {
      if (SETTINGS.reload.enabled) {
        requestReload()
        if (now - lastAutoReloadBannerAt.current > 900) {
          showBanner('Recargando…', SETTINGS.reload.reloadMs)
          lastAutoReloadBannerAt.current = now
        }
      }
      return
    }

    const ok = spendAmmo(1)
    if (!ok) return
    lastShotAt.current = now
    void weaponAudio.playShot()
    setMuzzleUntil(Date.now() + SETTINGS.combat.muzzleFlashMs)
    addRecoil(SETTINGS.combat.recoilKick)

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
    const damage = isHeadshot ? SETTINGS.combat.damageHead : SETTINGS.combat.damageBody

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
      setHitMarkerUntil(Date.now() + SETTINGS.combat.hitMarkerMs)
    } else {
      updateEnemy(enemyId, { health: nextHp })
      addScore(isHeadshot ? 30 : 10)
      void weaponAudio.playHit()
      setHitMarkerUntil(Date.now() + SETTINGS.combat.hitMarkerMs)
    }
  })

  return null
}
