import { useEffect, useMemo, useState } from 'react'
import * as QRCode from 'qrcode'
import { useGameStore } from '../store/useGameStore'

function currentBaseUrl() {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  return url.toString()
}

export function MultiplayerPanel() {
  const mode = useGameStore((s) => s.netMode)
  const setMode = useGameStore((s) => s.setNetMode)
  const peerId = useGameStore((s) => s.netPeerId)
  const joinId = useGameStore((s) => s.netJoinId)
  const setJoinId = useGameStore((s) => s.setNetJoinId)
  const connected = useGameStore((s) => s.netConnected)
  const status = useGameStore((s) => s.netStatus)

  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  const joinUrl = useMemo(() => {
    if (!peerId) return ''
    return `${currentBaseUrl()}?join=${encodeURIComponent(peerId)}`
  }, [peerId])

  useEffect(() => {
    let cancelled = false
    setQrDataUrl('')
    if (mode !== 'host') return
    if (!peerId) return
    const run = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(joinUrl, { margin: 1, width: 220 })
        if (!cancelled) setQrDataUrl(dataUrl)
      } catch {
        if (!cancelled) setQrDataUrl('')
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [joinUrl, mode, peerId])

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // ignore
    }
  }

  return (
    <div className="menu-net">
      <h3>Multijugador (P2P)</h3>
      <div className="menu-net-row">
        <button
          type="button"
          className={`menu-btn tiny ${mode === 'off' ? 'active' : ''}`}
          onClick={() => setMode('off')}
        >
          OFF
        </button>
        <button
          type="button"
          className={`menu-btn tiny ${mode === 'host' ? 'active' : ''}`}
          onClick={() => setMode('host')}
        >
          HOST
        </button>
        <button
          type="button"
          className={`menu-btn tiny ${mode === 'join' ? 'active' : ''}`}
          onClick={() => setMode('join')}
        >
          JOIN
        </button>
      </div>

      {mode === 'host' && (
        <div className="menu-net-card">
          <div className="menu-net-line">
            <strong>Código:</strong> <span className="mono">{peerId || '...'}</span>
          </div>
          <div className="menu-net-actions">
            <button type="button" className="menu-btn tiny secondary" onClick={() => copy(peerId)}>
              Copiar código
            </button>
            <button type="button" className="menu-btn tiny secondary" onClick={() => copy(joinUrl)}>
              Copiar link
            </button>
          </div>
          {qrDataUrl && (
            <div className="menu-net-qr">
              <img src={qrDataUrl} alt="QR para unirse" />
            </div>
          )}
          <div className="menu-net-hint">
            Pide a tu amigo que escanee el QR o abra el link. Luego ambos presionen “Iniciar partida”.
          </div>
        </div>
      )}

      {mode === 'join' && (
        <div className="menu-net-card">
          <label className="menu-net-line">
            <strong>Host:</strong>
            <input
              className="menu-net-input"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              placeholder="Pega el código del host"
              inputMode="text"
              autoCapitalize="none"
              autoCorrect="off"
            />
          </label>
          <div className="menu-net-hint">Tip: también puedes abrir un link con `?join=&lt;codigo&gt;`.</div>
        </div>
      )}

      {mode !== 'off' && (
        <div className="menu-net-status">
          <span className={`dot ${connected ? 'ok' : 'warn'}`} aria-hidden />
          <span>{status || (connected ? 'Conectado' : 'Sin conexión')}</span>
        </div>
      )}
    </div>
  )
}
