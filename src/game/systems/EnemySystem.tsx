import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { EnemyBillboard } from '../entities/EnemyBillboard'
import { SETTINGS } from '../config/settings'
import { WORLD } from '../config/world'
import { MAZE } from '../config/maze'
import { moveWithGridCollision } from '../physics/gridCollision'
import { useGameStore } from '../store/useGameStore'
import { spawnInitialEnemies } from './spawn'
import { usePlayerAudio } from '../audio/usePlayerAudio'

export function EnemySystem() {
  const gameState = useGameStore((s) => s.gameState)
  const enemies = useGameStore((s) => s.enemies)
  const setEnemies = useGameStore((s) => s.setEnemies)
  const updateEnemy = useGameStore((s) => s.updateEnemy)
  const removeEnemy = useGameStore((s) => s.removeEnemy)
  const endRun = useGameStore((s) => s.endRun)
  const playerPose = useGameStore((s) => s.playerPose)
  const showBanner = useGameStore((s) => s.showBanner)
  const playerAudio = usePlayerAudio()

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

    const now = Date.now()
    const damagePlayer = useGameStore.getState().damage

    enemies.forEach((enemy) => {
      // Disolución (si murió)
      if (!enemy.alive) {
        if (enemy.dissolve < 1) {
          updateEnemy(enemy.id, { dissolve: Math.min(1, enemy.dissolve + delta * 0.9) })
        }
        return
      }

      const dx = playerPose.x - enemy.position.x
      const dz = playerPose.z - enemy.position.z
      const dist = Math.hypot(dx, dz) || 1

      const baseSpeed = enemy.type === 'deportivo' ? 1.35 : enemy.type === 'presidencial' ? 1.0 : 1.1
      const minDist = SETTINGS.enemyAI.separation.minDistance
      const meleeRange = SETTINGS.enemyAI.melee.range
      const chargeRange = SETTINGS.enemyAI.charge.range
      const meleeCooldownMs = SETTINGS.enemyAI.melee.cooldownMs
      const edgePause = SETTINGS.enemyAI.targetTrack.edgePauseMs
      const hideChance = SETTINGS.enemyAI.targetTrack.hideAtEdgesChance
      const hideMs = SETTINGS.enemyAI.targetTrack.hideMs

      const ai = enemy.ai
        ? { ...enemy.ai, hideUntil: enemy.ai.hideUntil ?? 0 }
        : {
            state: 'target' as const,
            axis: 'x' as const,
            dir: 1 as const,
            min: enemy.position.x - 1,
            max: enemy.position.x + 1,
            nextResumeAt: 0,
            nextMeleeAt: 0,
            chargeUntil: 0,
            retreatUntil: 0,
            hideUntil: 0
          }

      const jitter01 = () =>
        Math.abs(Math.sin(enemy.position.x * 12.33 + enemy.position.z * 9.7 + now * 0.001)) % 1

      const schedulePause = () => {
        const jitter = jitter01()
        const pause = edgePause[0] + jitter * (edgePause[1] - edgePause[0])
        ai.nextResumeAt = now + pause
      }

      const scheduleHide = () => {
        const jitter = jitter01()
        const ms = hideMs[0] + jitter * (hideMs[1] - hideMs[0])
        ai.hideUntil = now + ms
      }

      if (ai.nextResumeAt && now < ai.nextResumeAt) {
        updateEnemy(enemy.id, { ai: { ...ai } })
        return
      }

      // “Hide at edges”: desaparece un ratito para forzar reacquisición de blanco.
      if (ai.hideUntil && now < ai.hideUntil) {
        updateEnemy(enemy.id, { ai: { ...ai } })
        return
      }

      // Melee si está en rango y cooldown listo.
      if (dist < meleeRange && now >= ai.nextMeleeAt) {
        ai.nextMeleeAt = now + meleeCooldownMs

        // Backstab: más daño si el jugador mira hacia otro lado.
        const playerYaw = playerPose.yaw
        const enemyYaw = Math.atan2(dz, dx)
        let yawDiff = playerYaw - enemyYaw
        while (yawDiff > Math.PI) yawDiff -= Math.PI * 2
        while (yawDiff < -Math.PI) yawDiff += Math.PI * 2
        const facingAway = Math.abs(yawDiff) < Math.PI * 0.4

        const dmg = facingAway ? 18 : SETTINGS.enemyAI.melee.damage
        damagePlayer(dmg)
        void playerAudio.playHurt()
        showBanner(`Golpe enemigo (-${dmg} HP)`, 1100)
        if (useGameStore.getState().health <= 0) {
          useGameStore.getState().endRun('loss')
        }
        // Retreat breve
        ai.state = 'retreat'
        ai.retreatUntil = now + SETTINGS.enemyAI.retreat.durationMs
      }

      let moveX = 0
      let moveZ = 0

      if (ai.state === 'charging') {
        const speed = baseSpeed * SETTINGS.enemyAI.charge.speedMultiplier
        moveX = (dx / dist) * speed * delta
        moveZ = (dz / dist) * speed * delta
        if (now >= ai.chargeUntil || dist < meleeRange * 1.05) {
          ai.state = 'retreat'
          ai.retreatUntil = now + SETTINGS.enemyAI.retreat.durationMs
        }
      } else if (ai.state === 'retreat') {
        const speed = baseSpeed * SETTINGS.enemyAI.retreat.speedMultiplier
        moveX = (-dx / dist) * speed * delta
        moveZ = (-dz / dist) * speed * delta
        if (now >= ai.retreatUntil || dist > minDist * 1.45) {
          ai.state = 'target'
        }
      } else {
        // target-track (blanco de tiro): movimiento por eje en corredor.
        const rhythm = Math.sin((now * 0.0012 + enemy.position.x * 0.7 + enemy.position.z * 0.9) * 2.2)
        const speed = baseSpeed * (0.25 + 0.75 * Math.abs(rhythm))
        const step = ai.dir * speed * delta

        if (ai.axis === 'x') {
          // Evitar acercarse demasiado: elegir dir que aumente distancia si está cerca.
          if (dist < minDist + 0.25) {
            const dPlus = Math.hypot((enemy.position.x + Math.abs(step)) - playerPose.x, enemy.position.z - playerPose.z)
            const dMinus = Math.hypot((enemy.position.x - Math.abs(step)) - playerPose.x, enemy.position.z - playerPose.z)
            ai.dir = (dPlus >= dMinus ? 1 : -1) as 1 | -1
          }
          moveX = step
          // clamp en bounds; si toca borde, invierte y pausa
          const nextX = enemy.position.x + moveX
          if (nextX <= ai.min) {
            ai.dir = 1
            schedulePause()
            if (jitter01() < hideChance) scheduleHide()
          } else if (nextX >= ai.max) {
            ai.dir = -1
            schedulePause()
            if (jitter01() < hideChance) scheduleHide()
          }
        } else {
          if (dist < minDist + 0.25) {
            const dPlus = Math.hypot(enemy.position.x - playerPose.x, (enemy.position.z + Math.abs(step)) - playerPose.z)
            const dMinus = Math.hypot(enemy.position.x - playerPose.x, (enemy.position.z - Math.abs(step)) - playerPose.z)
            ai.dir = (dPlus >= dMinus ? 1 : -1) as 1 | -1
          }
          moveZ = step
          const nextZ = enemy.position.z + moveZ
          if (nextZ <= ai.min) {
            ai.dir = 1
            schedulePause()
            if (jitter01() < hideChance) scheduleHide()
          } else if (nextZ >= ai.max) {
            ai.dir = -1
            schedulePause()
            if (jitter01() < hideChance) scheduleHide()
          }
        }

        // Charge si está lo suficientemente cerca y cooldown listo.
        if (dist < chargeRange && now >= ai.nextMeleeAt) {
          ai.state = 'charging'
          ai.chargeUntil = now + SETTINGS.enemyAI.charge.durationMs
        }
      }

      const next = moveWithGridCollision({
        maze: MAZE,
        cellSize: WORLD.cellSize,
        position: { x: enemy.position.x, z: enemy.position.z },
        delta: { x: moveX, z: moveZ },
        radius: SETTINGS.player.radius * 0.92
      })

      updateEnemy(enemy.id, {
        position: {
          x: next.x,
          y: enemy.position.y,
          z: next.z
        },
        ai: { ...ai }
      })
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
          hidden={Boolean(enemy.ai && enemy.ai.hideUntil && Date.now() < enemy.ai.hideUntil)}
          dissolve={enemy.dissolve}
          onDissolveDone={removeEnemy}
        />
      ))}
    </group>
  )
}
