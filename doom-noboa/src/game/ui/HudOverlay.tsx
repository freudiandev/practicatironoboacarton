import { useGameStore } from '../store/useGameStore'

export function HudOverlay() {
  const pointerLocked = useGameStore((s) => s.pointerLocked)
  const health = useGameStore((s) => s.health)
  const ammo = useGameStore((s) => s.ammo)
  const score = useGameStore((s) => s.score)
  const kills = useGameStore((s) => s.kills)

  return (
    <div className="hud-root" aria-hidden={false}>
      {!pointerLocked && (
        <div className="hud-hint" role="dialog" aria-label="Instrucciones">
          <div className="hud-title">DOOM: Noboa de Cartón (R3F)</div>
          <div className="hud-subtitle">Haz clic para capturar el mouse</div>
          <div className="hud-keys">
            <span>WASD</span> moverse · <span>Mouse</span> mirar · <span>Shift</span> correr ·{' '}
            <span>ESC</span> liberar cursor
          </div>
        </div>
      )}

      {pointerLocked && <div className="hud-crosshair" aria-hidden />}

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
      </div>
    </div>
  )
}

