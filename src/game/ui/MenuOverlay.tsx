import { useCallback, useEffect, useMemo } from 'react'
import type { CSSProperties } from 'react'
import { useGameStore } from '../store/useGameStore'
import './menu.css'
import { MultiplayerPanel } from './MultiplayerPanel'
import { SupportPanel } from './SupportPanel'

function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

export function MenuOverlay() {
  const gameState = useGameStore((s) => s.gameState)
  const startRun = useGameStore((s) => s.startRun)
  const highscores = useGameStore((s) => s.highscores)
  const score = useGameStore((s) => s.score)
  const kills = useGameStore((s) => s.kills)
  const headshots = useGameStore((s) => s.headshots)
  const timeSeconds = useGameStore((s) => s.timeSeconds)
  const addHighscore = useGameStore((s) => s.addHighscore)
  const toggleHelp = useGameStore((s) => s.toggleHelp)
  const setHelpOpen = useGameStore((s) => s.setHelpOpen)

  const menuBgUrl = `${import.meta.env.BASE_URL || '/'}menu-bg.jpeg`
  const rootStyle = { ['--menu-bg-url' as string]: `url(${menuBgUrl})` } as CSSProperties

  const isEnd = gameState === 'win' || gameState === 'gameover'

  const title = useMemo(() => {
    if (gameState === 'win') return 'VICTORIA'
    if (gameState === 'gameover') return 'GAME OVER'
    return 'DOOM: Noboa de Cartón'
  }, [gameState])

  const subtitle = useMemo(() => {
    if (isEnd) return `Score ${score} · Kills ${kills} · Head ${headshots} · ${formatTime(timeSeconds)}`
    return 'Cardboard Cyberpunk · R3F Edition'
  }, [headshots, isEnd, kills, score, timeSeconds])

  const onStart = useCallback(() => {
    startRun()
  }, [startRun])

  const onSaveScore = useCallback(() => {
    const name = prompt('Nombre para registrar puntaje:', 'Corredor Ciber') || 'Anónimo'
    const outcome = gameState === 'win' ? 'win' : 'loss'
    addHighscore({ name: name.slice(0, 24), score, kills, time: timeSeconds, outcome })
    startRun()
  }, [addHighscore, gameState, kills, score, startRun, timeSeconds])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'playing') return
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault()
        if (isEnd) onSaveScore()
        else onStart()
      }
      if (e.code === 'KeyH') toggleHelp()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [gameState, isEnd, onSaveScore, onStart, toggleHelp])

  if (gameState === 'playing') return null

  return (
    <div className="menu-root" role="dialog" aria-modal="false" style={rootStyle}>
      <div className="menu-card">
        <div className="menu-title">{title}</div>
        <div className="menu-sub">{subtitle}</div>

        <div className="menu-actions">
          {!isEnd && (
            <button type="button" className="menu-btn" onClick={onStart}>
              Iniciar partida
            </button>
          )}
          {isEnd && (
            <button type="button" className="menu-btn" onClick={onSaveScore}>
              Guardar y jugar otra vez
            </button>
          )}
          {isEnd && (
            <button type="button" className="menu-btn secondary" onClick={onStart}>
              Jugar otra vez (sin guardar)
            </button>
          )}
          <button type="button" className="menu-btn secondary" onClick={() => setHelpOpen(true)}>
            Ayuda / Controles
          </button>
        </div>

        <MultiplayerPanel />
        <SupportPanel />

        <div className="menu-scores">
          <h3>Highscores</h3>
          {highscores.length === 0 ? (
            <div className="menu-footer">Aún no hay puntajes guardados.</div>
          ) : (
            <ol>
              {highscores.slice(0, 10).map((h, idx) => (
                <li key={`${h.savedAt}-${idx}`}>
                  <strong>{h.name}</strong> — {h.score} pts · {h.kills} kills · {formatTime(h.time)} ·{' '}
                  {h.outcome === 'win' ? 'Victoria' : 'Caída'}
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="menu-footer">
          Tip: en desktop haz click para capturar mouse · en móvil usa joystick + swipe.
        </div>
      </div>
    </div>
  )
}
