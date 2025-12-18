import { useEffect, useMemo, useState } from 'react'
import { useGameStore } from '../store/useGameStore'
import './hud.css'

export function HudOverlay() {
  const pointerLocked = useGameStore((s) => s.pointerLocked)
  const isTouch = useGameStore((s) => s.isTouch)
  const gameState = useGameStore((s) => s.gameState)
  const health = useGameStore((s) => s.health)
  const ammo = useGameStore((s) => s.ammo)
  const headshots = useGameStore((s) => s.headshots)
  const score = useGameStore((s) => s.score)
  const kills = useGameStore((s) => s.kills)
  const [showTouchHint, setShowTouchHint] = useState(false)
  const blackoutUntil = useGameStore((s) => s.blackoutUntil)
  const ivaUntil = useGameStore((s) => s.ivaUntil)
  const banner = useGameStore((s) => s.banner)

  const hintSubtitle = useMemo(() => {
    if (isTouch) return 'Toca para jugar (controles táctiles)'
    return 'Haz clic para capturar el mouse'
  }, [isTouch])

  useEffect(() => {
    if (!isTouch) return
    const key = 'doomNoboa_touchHint_v1'
    try {
      const already = localStorage.getItem(key)
      if (already) return
      localStorage.setItem(key, '1')
    } catch {
      // ignore
    }
    setShowTouchHint(true)
    const t = window.setTimeout(() => setShowTouchHint(false), 3800)
    return () => window.clearTimeout(t)
  }, [isTouch])

  return (
    <div className="hud-root" aria-hidden={false}>
      {!pointerLocked && !isTouch && (
        <div className="hud-hint" role="dialog" aria-label="Instrucciones">
          <div className="hud-title">DOOM: Noboa de Cartón (R3F)</div>
          <div className="hud-subtitle">{hintSubtitle}</div>
          <div className="hud-keys">
            <span>WASD</span> moverse · <span>Mouse</span> mirar · <span>Shift</span> correr ·{' '}
            <span>ESC</span> liberar cursor
          </div>
        </div>
      )}

      {gameState === 'playing' && (pointerLocked || isTouch) && <div className="hud-crosshair" aria-hidden />}

      {gameState === 'playing' && isTouch && showTouchHint && (
        <div className="hud-toast" role="status" aria-live="polite">
          <strong>Joystick</strong> (izq) para moverte · <strong>Arrastra</strong> (der) para mirar
        </div>
      )}

      {gameState === 'playing' && banner.until > Date.now() && banner.text && (
        <div className="hud-toast" role="status" aria-live="polite">
          {banner.text}
        </div>
      )}

      {gameState === 'playing' && (
      <div className="hud-panel" aria-label="HUD">
        <div className="hud-item">
          <span className="hud-label">VIDA</span>
          <span className="hud-value">{health}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">AMMO</span>
          <span className="hud-value">{ammo}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">SCORE</span>
          <span className="hud-value">{score}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">KILLS</span>
          <span className="hud-value">{kills}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">HEAD</span>
          <span className="hud-value">{headshots}</span>
        </div>
        {blackoutUntil > Date.now() && (
          <div className="hud-item">
            <span className="hud-label">APAGÓN</span>
            <span className="hud-value">ON</span>
          </div>
        )}
        {ivaUntil > Date.now() && (
          <div className="hud-item">
            <span className="hud-label">IVA</span>
            <span className="hud-value">15%</span>
          </div>
        )}
      </div>
      )}
    </div>
  )
}
