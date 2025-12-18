import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore, type PowerUpPickup, type PowerUpType } from '../store/useGameStore'
import { MAZE } from '../config/maze'
import { WORLD } from '../config/world'
import { SETTINGS } from '../config/settings'
import { cellToWorldCenter, getMazeMetrics, isWallCell } from '../config/mazeMath'
import { powerupBanner } from '../satire/powerupCopy'

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let x = Math.imul(t ^ (t >>> 15), 1 | t)
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

function pickType(i: number): PowerUpType {
  const list: PowerUpType[] = ['consulta_popular', 'iva_15', 'apagon_nacional', 'iva_trampa', 'capsula_salud']
  return list[i % list.length]
}

function spawnPickups(seed = Date.now(), count = 3): PowerUpPickup[] {
  const rand = mulberry32(seed)
  const { rows, cols } = getMazeMetrics(MAZE, WORLD.cellSize)

  const candidates: { cx: number; cz: number }[] = []
  for (let z = 0; z < rows; z++) {
    for (let x = 0; x < cols; x++) {
      if (isWallCell(MAZE, x, z)) continue
      // evitar paredes “casi encerradas”
      const freeN = !isWallCell(MAZE, x, z - 1)
      const freeS = !isWallCell(MAZE, x, z + 1)
      const freeE = !isWallCell(MAZE, x + 1, z)
      const freeW = !isWallCell(MAZE, x - 1, z)
      const open = [freeN, freeS, freeE, freeW].filter(Boolean).length
      if (open < 2) continue
      candidates.push({ cx: x, cz: z })
    }
  }

  const picks: PowerUpPickup[] = []
  for (let i = 0; i < count && candidates.length; i++) {
    const idx = Math.floor(rand() * candidates.length)
    const c = candidates.splice(idx, 1)[0]
    const w = cellToWorldCenter(MAZE, WORLD.cellSize, c.cx, c.cz)
    picks.push({
      id: `p_${Date.now()}_${i}_${Math.floor(rand() * 1e6)}`,
      type: pickType(i),
      position: { x: w.x, y: SETTINGS.player.eyeHeight * 0.35, z: w.z },
      active: true
    })
  }
  return picks
}

function applyPowerup(type: PowerUpType) {
  const now = Date.now()
  const state = useGameStore.getState()
  state.showBanner(powerupBanner(type), 2400)

  if (type === 'consulta_popular') {
    // Smart bomb: elimina a todos los enemigos vivos.
    state.enemies.forEach((e) => {
      if (e.alive) state.updateEnemy(e.id, { alive: false, health: 0 })
    })
    state.addScore(500)
    return
  }

  if (type === 'iva_15') {
    // Trampa: más puntos por kill, pero HP drena.
    useGameStore.setState({ ivaUntil: now + 20000, scoreMultiplier: 2.0 })
    return
  }

  if (type === 'apagon_nacional') {
    // Apagón: blackout por un rato.
    useGameStore.setState({ blackoutUntil: now + 12000 })
    return
  }

  if (type === 'iva_trampa') {
    state.damage(15)
    state.showBanner('El gobierno sube el IVA 15% y te cuesta 15 HP.', 2800)
    if (state.health <= 0) state.endRun('loss')
    return
  }

  if (type === 'capsula_salud') {
    // 50/50: cura 30 o daña 10.
    if (Math.random() < 0.5) {
      state.heal(30)
      state.showBanner('Milagro: una cápsula sí cura (+30 HP).', 2400)
    } else {
      state.damage(10)
      state.showBanner('Recorte en salud: pierdes 10 HP.', 2600)
      if (state.health <= 0) state.endRun('loss')
    }
    return
  }
}

export function PowerUpSystem() {
  const gameState = useGameStore((s) => s.gameState)
  const pickups = useGameStore((s) => s.pickups)
  const setPickups = useGameStore((s) => s.setPickups)
  const pickupPowerup = useGameStore((s) => s.pickupPowerup)
  const playerPose = useGameStore((s) => s.playerPose)

  const pickupRadius = 0.55
  const tmp = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    if (gameState !== 'playing') return
    if (pickups.length > 0) return
    setPickups(spawnPickups(Date.now(), 3))
  }, [gameState, pickups.length, setPickups])

  useFrame(() => {
    if (gameState !== 'playing') return

    const now = Date.now()
    const state = useGameStore.getState()

    // IVA mode drain
    if (state.ivaUntil && now < state.ivaUntil) {
      // drain suave: ~1.2 HP/s
      const drain = 1.2 / 60
      state.damage(drain)
      if (state.health <= 0) state.endRun('loss')
    } else if (state.ivaUntil && now >= state.ivaUntil) {
      if (state.scoreMultiplier !== 1) {
        useGameStore.setState({ ivaUntil: 0, scoreMultiplier: 1 })
      }
    }

    // Blackout end
    if (state.blackoutUntil && now >= state.blackoutUntil) {
      if (state.blackoutUntil !== 0) useGameStore.setState({ blackoutUntil: 0 })
    }

    // Evento apagón aleatorio más frecuente (tensión política).
    if (!state.blackoutUntil || now >= state.blackoutUntil) {
      if (rand() < 0.0009) {
        const until = now + 9000
        useGameStore.setState({ blackoutUntil: until })
        state.showBanner('Apagón: el gobierno de Daniel Noboa otra vez deja sin luz.', 3200)
      }
    }

    // Pickup collisions
    for (const p of pickups) {
      if (!p.active) continue
      tmp.set(p.position.x - playerPose.x, 0, p.position.z - playerPose.z)
      if (tmp.length() <= pickupRadius) {
        pickupPowerup(p.id)
        applyPowerup(p.type)
      }
    }
  })

  // Render simple de pickups (orbes)
  if (gameState !== 'playing') return null

  return (
    <group name="powerups">
      {pickups
        .filter((p) => p.active)
        .map((p) => {
          const color =
            p.type === 'consulta_popular'
              ? '#ffd700'
              : p.type === 'iva_15'
              ? '#ff00aa'
              : p.type === 'apagon_nacional'
              ? '#00fff0'
              : p.type === 'iva_trampa'
              ? '#ff3300'
              : '#00c8ff'
          return (
            <group key={p.id} position={[p.position.x, p.position.y, p.position.z]}>
              {p.type === 'capsula_salud' ? (
                <mesh>
                  <capsuleGeometry args={[0.16, 0.3, 8, 12]} />
                  <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.8}
                    roughness={0.3}
                    metalness={0.1}
                  />
                </mesh>
              ) : p.type === 'iva_trampa' ? (
                <mesh>
                  <torusGeometry args={[0.22, 0.08, 10, 28]} />
                  <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={1.2}
                    roughness={0.25}
                    metalness={0.15}
                  />
                </mesh>
              ) : (
                <mesh>
                  <sphereGeometry args={[0.18, 12, 12]} />
                  <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={1.1}
                    roughness={0.2}
                    metalness={0.1}
                  />
                </mesh>
              )}
            </group>
          )
        })}
    </group>
  )
}
