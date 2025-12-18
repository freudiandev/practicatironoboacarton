import { useEffect, useMemo } from 'react'
import { useGameStore } from '../store/useGameStore'
import './help.css'

export function HelpOverlay() {
  const open = useGameStore((s) => s.helpOpen)
  const setHelpOpen = useGameStore((s) => s.setHelpOpen)
  const toggleHelp = useGameStore((s) => s.toggleHelp)
  const gameState = useGameStore((s) => s.gameState)
  const isTouch = useGameStore((s) => s.isTouch)
  const gamepadActive = useGameStore((s) => s.gamepadActive)

  const title = useMemo(() => {
    if (gameState !== 'playing') return 'CONTROLES'
    return 'AYUDA'
  }, [gameState])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && open) setHelpOpen(false)
      if (e.code === 'KeyH') toggleHelp()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, setHelpOpen, toggleHelp])

  if (!open) return null

  return (
    <div className="help-root" role="dialog" aria-modal="true" aria-label="Ayuda y controles">
      <button type="button" className="help-bg" onClick={() => setHelpOpen(false)} aria-label="Cerrar ayuda" />
      <div className="help-card">
        <div className="help-title">{title}</div>
        <div className="help-sub">DOOM: Noboa de Cartón · Cardboard Cyberpunk</div>

        <div className="help-grid">
          <div className="help-section">
            <div className="help-section-title">PC (Teclado/Mouse)</div>
            <ul>
              <li>
                <span className="k">Click</span> capturar mouse
              </li>
              <li>
                <span className="k">WASD</span> moverse · <span className="k">Shift</span> correr
              </li>
              <li>
                <span className="k">Mouse</span> mirar · <span className="k">LMB</span> disparar (mantener)
              </li>
              <li>
                <span className="k">R</span> recargar · <span className="k">H</span> ayuda
              </li>
              <li>
                <span className="k">ESC</span> liberar cursor / cerrar
              </li>
            </ul>
          </div>

          <div className="help-section">
            <div className="help-section-title">Móvil/Tablet (Touch)</div>
            <ul>
              <li>
                <span className="k">Joystick</span> (izq) moverse
              </li>
              <li>
                <span className="k">Swipe</span> (der) mirar
              </li>
              <li>
                <span className="k">FIRE</span> disparar (mantener)
              </li>
              <li>
                <span className="k">RLD</span> recargar
              </li>
              <li>Recomendado: horizontal (más visión)</li>
            </ul>
          </div>

          <div className="help-section">
            <div className="help-section-title">Gamepad / Smart TV</div>
            <ul>
              <li>
                <span className="k">Stick izq</span> moverse
              </li>
              <li>
                <span className="k">Stick der</span> mirar
              </li>
              <li>
                <span className="k">RT/R2</span> disparar · <span className="k">X/□</span> recargar
              </li>
              <li>
                <span className="k">Start</span> iniciar en menú / cerrar overlays
              </li>
              <li>
                <span className="k">H</span> (teclado) abre/cierra ayuda
              </li>
            </ul>
          </div>
        </div>

        <div className="help-footer">
          {isTouch && <span>Tip móvil: si algo tapa la vista, esconde ayuda con “Cerrar”.</span>}
          {gamepadActive && <span>Tip TV: usa Start/A para iniciar partida.</span>}
        </div>

        <div className="help-actions">
          <button type="button" className="menu-btn secondary" onClick={() => setHelpOpen(false)}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

