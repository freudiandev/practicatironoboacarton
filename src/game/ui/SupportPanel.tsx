import { useMemo, useState } from 'react'

function baseUrl() {
  return import.meta.env.BASE_URL || '/'
}

function assetUrl(path: string) {
  const b = baseUrl()
  return `${b}${path.replace(/^\//, '')}`
}

export function SupportPanel() {
  const [showQr, setShowQr] = useState(false)

  const qrUrl = useMemo(() => assetUrl('donations/una-qr.jpg'), [])
  const donationsPageUrl = useMemo(() => assetUrl('donaciones.html'), [])
  const instagramUrl = useMemo(() => 'https://www.instagram.com/freudiandev/', [])
  const paypalEmail = useMemo(() => 'samantharueda91@gmail.com', [])

  const bank = useMemo(
    () => ({
      name: 'Banco Pichincha (De Una)',
      accountType: 'Cuenta de ahorro transaccional',
      accountNumber: '2206684682',
      id: '1723625032',
      owner: 'Samantha Ayleen Rueda Chamorro',
      reference: 'CiberPunk Ecuador · Videojuegos Sociales'
    }),
    []
  )

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // ignore
    }
  }

  return (
    <div className="menu-support">
      <h3>Donaciones</h3>

      <div className="menu-support-copy">
        Tu donación sostiene <strong>CiberPunk Ecuador</strong> y los <strong>Videojuegos Sociales</strong>: arte,
        programación y hosting. Si te gusta el juego y su crítica, aquí puedes apoyar.
      </div>

      <div className="menu-support-grid">
        <button type="button" className="menu-support-qr" onClick={() => setShowQr(true)}>
          <img src={qrUrl} alt="QR Banco Pichincha (De Una) — donaciones" />
          <div className="menu-support-qr-hint">Toca para ampliar</div>
        </button>

        <div className="menu-support-bank">
          <div className="menu-support-line">
            <strong>{bank.name}</strong> · {bank.accountType}
          </div>
          <div className="menu-support-line">
            Número: <span className="mono">{bank.accountNumber}</span>{' '}
            <button type="button" className="menu-btn tiny secondary" onClick={() => copy(bank.accountNumber)}>
              Copiar
            </button>
          </div>
          <div className="menu-support-line">
            Cédula: <span className="mono">{bank.id}</span>{' '}
            <button type="button" className="menu-btn tiny secondary" onClick={() => copy(bank.id)}>
              Copiar
            </button>
          </div>
          <div className="menu-support-line">
            Nombre: <strong>{bank.owner}</strong>
          </div>
          <div className="menu-support-line">
            Referencia: <span>{bank.reference}</span>
          </div>

          <div className="menu-support-line">
            PayPal (exterior): <span className="mono">{paypalEmail}</span>{' '}
            <button type="button" className="menu-btn tiny secondary" onClick={() => copy(paypalEmail)}>
              Copiar
            </button>
          </div>

          <div className="menu-support-actions">
            <a className="menu-btn secondary" href={donationsPageUrl} target="_blank" rel="noopener noreferrer">
              Abrir página de donaciones
            </a>
          </div>
        </div>
      </div>

      <div className="menu-support-credits">
        Creado por <strong>Alex Rafael Almeida Orellana</strong> (<strong>freudiandev</strong>) ·{' '}
        <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
          Instagram @freudiandev
        </a>
      </div>

      {showQr && (
        <div className="menu-support-modal" role="dialog" aria-modal="true" aria-label="QR de donaciones">
          <button type="button" className="menu-support-modal-bg" onClick={() => setShowQr(false)} aria-label="Cerrar" />
          <div className="menu-support-modal-card">
            <img src={qrUrl} alt="QR Banco Pichincha (De Una) — donaciones" />
            <div className="menu-support-modal-actions">
              <button type="button" className="menu-btn secondary" onClick={() => setShowQr(false)}>
                Cerrar
              </button>
              <button type="button" className="menu-btn secondary" onClick={() => copy(bank.accountNumber)}>
                Copiar cuenta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

