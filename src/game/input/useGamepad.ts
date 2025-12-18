import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store/useGameStore'

function applyDeadzone(v: number, dz = 0.14) {
  const a = Math.abs(v)
  if (a < dz) return 0
  const scaled = (a - dz) / (1 - dz)
  return Math.sign(v) * scaled
}

export function GamepadController() {
  const setMoveAxis = useGameStore((s) => s.setMoveAxis)
  const setLookAxis = useGameStore((s) => s.setLookAxis)
  const setFireHeld = useGameStore((s) => s.setFireHeld)
  const requestReload = useGameStore((s) => s.requestReload)
  const setGamepadActive = useGameStore((s) => s.setGamepadActive)
  const isTouch = useGameStore((s) => s.isTouch)
  const gameState = useGameStore((s) => s.gameState)

  const lastReload = useRef(false)
  const lastActive = useRef(false)
  const lastStart = useRef(false)
  const lastHelp = useRef(false)

  useEffect(() => {
    // No-op. Sirve para que React monte el componente en cliente.
    void isTouch
  }, [isTouch])

  useFrame(() => {
    const pads = navigator.getGamepads ? navigator.getGamepads() : []
    const pad = pads && pads[0]
    const active = Boolean(pad)
    if (active !== lastActive.current) {
      setGamepadActive(active)
      lastActive.current = active
    }
    if (!pad) return

    // In menu/end screens: permitir iniciar con Start/A, y no mover cámara/axis.
    if (gameState !== 'playing') {
      setMoveAxis({ x: 0, z: 0 })
      setLookAxis({ x: 0, y: 0 })
      setFireHeld(false)

      const startPressed = Boolean(pad.buttons[9]?.pressed) || Boolean(pad.buttons[0]?.pressed)
      if (startPressed && !lastStart.current) {
        // startRun decide si puede iniciar (siempre que no esté jugando).
        useGameStore.getState().startRun()
      }
      lastStart.current = startPressed

      const helpPressed = Boolean(pad.buttons[8]?.pressed)
      if (helpPressed && !lastHelp.current) useGameStore.getState().toggleHelp()
      lastHelp.current = helpPressed
      return
    }

    const lx = applyDeadzone(pad.axes[0] || 0)
    const ly = applyDeadzone(pad.axes[1] || 0)
    const rx = applyDeadzone(pad.axes[2] || 0)
    const ry = applyDeadzone(pad.axes[3] || 0)

    setMoveAxis({ x: lx, z: -ly })

    // lookAxis es delta. Para gamepad lo convertimos en “delta artificial” por frame.
    setLookAxis({ x: rx * 8, y: ry * 8 })

    const trigger = (pad.buttons[7]?.value ?? 0) > 0.65 || Boolean(pad.buttons[7]?.pressed)
    setFireHeld(trigger)

    // Recargar con X (o equivalente).
    const reloadPressed = Boolean(pad.buttons[2]?.pressed)
    if (reloadPressed && !lastReload.current) requestReload()
    lastReload.current = reloadPressed

    // Ayuda con Select/Back.
    const helpPressed = Boolean(pad.buttons[8]?.pressed)
    if (helpPressed && !lastHelp.current) useGameStore.getState().toggleHelp()
    lastHelp.current = helpPressed
  })

  return null
}
