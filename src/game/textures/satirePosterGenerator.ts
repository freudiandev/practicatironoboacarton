import * as THREE from 'three'

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let x = Math.imul(t ^ (t >>> 15), 1 | t)
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/g).filter(Boolean)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const next = line ? `${line} ${w}` : w
    if (ctx.measureText(next).width <= maxWidth) {
      line = next
    } else {
      if (line) lines.push(line)
      line = w
    }
  }
  if (line) lines.push(line)
  return lines
}

export function createSatirePosterTexture(options: {
  seed: number
  headline: string
  subtitle?: string
  size?: number
}) {
  const size = options.size ?? 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas2D not available')

  const rand = mulberry32(options.seed)

  // Base “cartón” con ruido y manchas.
  ctx.fillStyle = '#2a1a12'
  ctx.fillRect(0, 0, size, size)

  for (let i = 0; i < 1200; i++) {
    const x = Math.floor(rand() * size)
    const y = Math.floor(rand() * size)
    const a = 0.06 + rand() * 0.08
    const c = rand() < 0.5 ? 20 : 255
    ctx.fillStyle = `rgba(${c}, ${Math.floor(170 + rand() * 60)}, ${Math.floor(120 + rand() * 40)}, ${a})`
    ctx.fillRect(x, y, 1, 1)
  }

  // Marco neon + “cinta” adhesiva.
  const neonA = rand() < 0.5 ? '#ff00aa' : '#00fff0'
  const neonB = neonA === '#ff00aa' ? '#00fff0' : '#ff00aa'

  ctx.strokeStyle = neonA
  ctx.lineWidth = 6
  ctx.strokeRect(10, 10, size - 20, size - 20)

  ctx.strokeStyle = neonB
  ctx.lineWidth = 2
  ctx.strokeRect(14, 14, size - 28, size - 28)

  ctx.save()
  ctx.globalAlpha = 0.22
  ctx.fillStyle = '#ffffff'
  ctx.translate(size * 0.52, size * 0.86)
  ctx.rotate((-12 + rand() * 24) * (Math.PI / 180))
  ctx.fillRect(-size * 0.26, -18, size * 0.52, 36)
  ctx.restore()

  // Texto: headline + subtitle (satírico, estilo pancarta)
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  ctx.font = `900 ${Math.floor(size * 0.088)}px system-ui, -apple-system, Segoe UI, Roboto, Arial`
  const headline = options.headline.trim()
  const headlineLines = wrapLines(ctx, headline, size * 0.78).slice(0, 4)

  let y = 34
  for (const line of headlineLines) {
    ctx.fillText(line, size / 2, y)
    y += Math.floor(size * 0.095)
  }

  if (options.subtitle) {
    ctx.fillStyle = 'rgba(0,255,240,0.9)'
    ctx.font = `700 ${Math.floor(size * 0.052)}px system-ui, -apple-system, Segoe UI, Roboto, Arial`
    const subLines = wrapLines(ctx, options.subtitle.trim(), size * 0.78).slice(0, 4)
    y += 6
    for (const line of subLines) {
      ctx.fillText(line, size / 2, y)
      y += Math.floor(size * 0.06)
    }
  }

  // “Sellito” de parodia para no venderlo como noticia.
  ctx.save()
  ctx.globalAlpha = 0.85
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.translate(size * 0.78, size * 0.2)
  ctx.rotate((18 + rand() * 12) * (Math.PI / 180))
  ctx.fillRect(-58, -18, 116, 36)
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.font = `800 ${Math.floor(size * 0.045)}px system-ui, -apple-system, Segoe UI, Roboto, Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('PARODIA', 0, 1)
  ctx.restore()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.NearestMipmapNearestFilter
  texture.generateMipmaps = true
  texture.needsUpdate = true
  return texture
}

