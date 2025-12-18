import { useEffect, useMemo, useRef, useState } from 'react'
import { useGameStore } from '../store/useGameStore'
import { SETTINGS } from '../config/settings'
import './touch.css'

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export function TouchControls() {
  const isTouch = useGameStore((s) => s.isTouch)
  const setMoveAxis = useGameStore((s) => s.setMoveAxis)
  const setLookAxis = useGameStore((s) => s.setLookAxis)
  const setFireHeld = useGameStore((s) => s.setFireHeld)
  const requestReload = useGameStore((s) => s.requestReload)
  const gameState = useGameStore((s) => s.gameState)
  const ammo = useGameStore((s) => s.ammo)
  const maxAmmo = useGameStore((s) => s.maxAmmo)
  const reloadUntil = useGameStore((s) => s.reloadUntil)
  const [portrait, setPortrait] = useState(false)

  const joyRef = useRef<HTMLDivElement | null>(null)
  const stickRef = useRef<HTMLDivElement | null>(null)
  const joyPointerId = useRef<number | null>(null)
  const joyCenter = useRef({ x: 0, y: 0 })
  const joyRadius = useRef(60)

  const lookPointerId = useRef<number | null>(null)
  const lastLook = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const update = () => {
      const isPortrait = window.innerHeight > window.innerWidth * 1.1
      setPortrait(isPortrait)
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  const onJoyDown = (e: React.PointerEvent) => {
    if (!joyRef.current) return
    joyPointerId.current = e.pointerId
    joyRef.current.setPointerCapture(e.pointerId)
    const rect = joyRef.current.getBoundingClientRect()
    joyCenter.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    joyRadius.current = Math.min(rect.width, rect.height) * 0.35
    if (stickRef.current) stickRef.current.style.transform = 'translate3d(0px, 0px, 0px)'
  }

  const onJoyMove = (e: React.PointerEvent) => {
    if (joyPointerId.current !== e.pointerId) return
    const dx = e.clientX - joyCenter.current.x
    const dy = e.clientY - joyCenter.current.y
    const r = Math.max(10, joyRadius.current)
    const nx = clamp(dx / r, -1, 1)
    const nz = clamp(-dy / r, -1, 1)

    // UI feedback: knob sigue el dedo (limitado).
    const kx = clamp(dx, -r, r)
    const ky = clamp(dy, -r, r)
    if (stickRef.current) {
      stickRef.current.style.transform = `translate3d(${kx}px, ${ky}px, 0px)`
    }

    setMoveAxis({ x: nx, z: nz })
  }

  const onJoyUp = (e: React.PointerEvent) => {
    if (joyPointerId.current !== e.pointerId) return
    joyPointerId.current = null
    setMoveAxis({ x: 0, z: 0 })
    if (stickRef.current) stickRef.current.style.transform = 'translate3d(0px, 0px, 0px)'
  }

  const onLookDown = (e: React.PointerEvent) => {
    lookPointerId.current = e.pointerId
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    lastLook.current = { x: e.clientX, y: e.clientY }
  }

  const onLookMove = (e: React.PointerEvent) => {
    if (lookPointerId.current !== e.pointerId) return
    const dx = e.clientX - lastLook.current.x
    const dy = e.clientY - lastLook.current.y
    lastLook.current = { x: e.clientX, y: e.clientY }

    // lookAxis se interpreta como delta por frame; PlayerController lo “consume” y resetea.
    setLookAxis({ x: dx, y: dy })
  }

  const onLookUp = (e: React.PointerEvent) => {
    if (lookPointerId.current !== e.pointerId) return
    lookPointerId.current = null
    setLookAxis({ x: 0, y: 0 })
  }

  const shootLabel = useMemo(() => 'FIRE', [])
  const reloadLabel = useMemo(() => 'RLD', [])

  if (!isTouch || gameState !== 'playing') return null

  return (
    <div className="tc-root" aria-label="Controles táctiles">
      <div
        className="tc-lookpad"
        onPointerDown={onLookDown}
        onPointerMove={onLookMove}
        onPointerUp={onLookUp}
        onPointerCancel={onLookUp}
        aria-label="Área de mirada"
      />

      <div
        ref={joyRef}
        className="tc-joystick"
        onPointerDown={onJoyDown}
        onPointerMove={onJoyMove}
        onPointerUp={onJoyUp}
        onPointerCancel={onJoyUp}
        aria-label="Joystick de movimiento"
      >
        <div ref={stickRef} className="tc-stick" />
      </div>

      {/* Botón de disparo (mantener presionado para auto-fire). */}
      <div
        className="tc-shoot"
        aria-label="Disparar"
        onPointerDown={(e) => {
          e.preventDefault()
          if (gameState !== 'playing') return
          setFireHeld(true)
        }}
        onPointerUp={(e) => {
          e.preventDefault()
          setFireHeld(false)
        }}
        onPointerCancel={(e) => {
          e.preventDefault()
          setFireHeld(false)
        }}
        onPointerLeave={(e) => {
          e.preventDefault()
          setFireHeld(false)
        }}
      >
        {shootLabel}
      </div>

      {SETTINGS.reload.enabled && (
        <button
          className="tc-reload"
          type="button"
          aria-label="Recargar"
          disabled={reloadUntil > Date.now() || ammo >= maxAmmo}
          onPointerDown={(e) => {
            e.preventDefault()
            requestReload()
          }}
        >
          {reloadLabel}
        </button>
      )}

      {portrait && (
        <div className="tc-rotate" aria-hidden>
          <div className="tc-rotate-card">
            <div className="tc-rotate-title">Mejor en horizontal</div>
            <div className="tc-rotate-sub">Gira tu dispositivo para ver más pantalla.</div>
          </div>
        </div>
      )}
    </div>
  )
}
