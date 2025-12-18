import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { EnemyBillboard } from '../entities/EnemyBillboard'
import { SETTINGS } from '../config/settings'
import { WORLD } from '../config/world'
import { MAZE } from '../config/maze'
import { moveWithGridCollision } from '../physics/gridCollision'
import { useGameStore } from '../store/useGameStore'
import { spawnInitialEnemies } from './spawn'

export function EnemySystem() {
  const gameState = useGameStore((s) => s.gameState)
  const enemies = useGameStore((s) => s.enemies)
  const setEnemies = useGameStore((s) => s.setEnemies)
  const updateEnemy = useGameStore((s) => s.updateEnemy)
  const removeEnemy = useGameStore((s) => s.removeEnemy)
  const endRun = useGameStore((s) => s.endRun)
  const playerPose = useGameStore((s) => s.playerPose)

  const meleeCooldown = useRef<Record<string, number>>({})

  useEffect(() => {
    if (gameState !== 'playing') return
    if (enemies.length > 0) return
    const initial = spawnInitialEnemies({
      count: 4,
      playerX: playerPose.x,
      playerZ: playerPose.z
    })
    setEnemies(initial)
  }, [enemies.length, gameState, playerPose.x, playerPose.z, setEnemies])

  useFrame((_, delta) => {
    if (gameState !== 'playing') return

    // Win: si ya no queda ningún enemigo vivo.
    if (enemies.length > 0 && enemies.every((e) => !e.alive)) {
      endRun('win')
      return
    }

    const now = performance.now()
    const damagePlayer = useGameStore.getState().damage
    const health = useGameStore.getState().health

    enemies.forEach((enemy) => {
      // Disolución (si murió)
      if (!enemy.alive) {
        if (enemy.dissolve < 1) {
          updateEnemy(enemy.id, { dissolve: Math.min(1, enemy.dissolve + delta * 0.9) })
        }
        return
      }

      // Movimiento simple: avanzar hacia jugador con “separación” mínima.
      const dx = playerPose.x - enemy.position.x
      const dz = playerPose.z - enemy.position.z
      const dist = Math.hypot(dx, dz) || 1

      const minDist = 2.2
      const speed = enemy.type === 'deportivo' ? 1.35 : enemy.type === 'presidencial' ? 1.0 : 1.1

      let moveX = 0
      let moveZ = 0

      // Si está lejos, se acerca.
      if (dist > minDist) {
        moveX = (dx / dist) * speed * delta
        moveZ = (dz / dist) * speed * delta
      } else {
        // Cerca: strafe lateral (blanco de tiro) sin pegarse demasiado.
        const lateralX = -dz / dist
        const lateralZ = dx / dist
        const phase = (now * 0.001 + enemy.position.x + enemy.position.z) * 1.2
        const strafe = Math.sin(phase) * 0.9
        moveX = lateralX * strafe * speed * delta
        moveZ = lateralZ * strafe * speed * delta
      }

      const next = moveWithGridCollision({
        maze: MAZE,
        cellSize: WORLD.cellSize,
        position: { x: enemy.position.x, z: enemy.position.z },
        delta: { x: moveX, z: moveZ },
        radius: SETTINGS.player.radius * 0.9
      })

      updateEnemy(enemy.id, {
        position: {
          x: next.x,
          y: enemy.position.y,
          z: next.z
        }
      })

      // Melee básico.
      const hitRange = 0.9
      const last = meleeCooldown.current[enemy.id] ?? 0
      if (dist < hitRange && now - last > 1250) {
        meleeCooldown.current[enemy.id] = now
        damagePlayer(12)
        if (health - 12 <= 0) {
          useGameStore.getState().endRun('loss')
        }
      }
    })
  })

  return (
    <group name="enemies">
      {enemies.map((enemy) => (
        <EnemyBillboard
          key={enemy.id}
          id={enemy.id}
          type={enemy.type}
          position={enemy.position}
          alive={enemy.alive}
          dissolve={enemy.dissolve}
          onDissolveDone={removeEnemy}
        />
      ))}
    </group>
  )
}
