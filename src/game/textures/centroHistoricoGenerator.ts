import * as THREE from 'three'

function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('No se pudo crear canvas 2D')
  ctx.imageSmoothingEnabled = false
  return { canvas, ctx }
}

function setPixelTextureFilters(tex: THREE.Texture) {
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.magFilter = THREE.NearestFilter
  tex.minFilter = THREE.NearestMipmapNearestFilter
  tex.generateMipmaps = true
  tex.anisotropy = 1
  tex.needsUpdate = true
}

export type CentroHistoricoTextures = {
  sky: THREE.CanvasTexture
  wallColonial: THREE.CanvasTexture
  wallArchway: THREE.CanvasTexture
  floorStones: THREE.CanvasTexture
  mountainDetail: THREE.CanvasTexture
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function lerpColor(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
}

function fillRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rgb: [number, number, number], a = 1) {
  ctx.fillStyle = `rgba(${rgb[0] | 0}, ${rgb[1] | 0}, ${rgb[2] | 0}, ${a})`
  ctx.fillRect(x, y, w, h)
}

function buildSky(width = 1024, height = 512) {
  const { canvas, ctx } = createCanvas(width, height)

  // Amanecer andino: gradiente vertical.
  const topA: [number, number, number] = [32, 20, 54]
  const topB: [number, number, number] = [74, 52, 118]
  const botA: [number, number, number] = [98, 74, 154]
  const botB: [number, number, number] = [242, 182, 121]

  for (let y = 0; y < height; y++) {
    const t = y / height
    const cTop = lerpColor(topA, topB, Math.min(1, t * 0.6))
    const cBot = lerpColor(botA, botB, Math.max(0, t - 0.35))
    const c = lerpColor(cTop, cBot, t)
    fillRect(ctx, 0, y, width, 1, c, 1)
  }

  // Cordillera alta.
  ctx.fillStyle = '#2f1f45'
  ctx.beginPath()
  ctx.moveTo(0, height)
  const peaks = [
    { x: -80, h: 320 },
    { x: 120, h: 380 },
    { x: 320, h: 340 },
    { x: 580, h: 410 },
    { x: 840, h: 330 },
    { x: 1100, h: 390 }
  ]
  peaks.forEach((p, i) => {
    const xx = p.x
    const yy = height - p.h
    if (i === 0) ctx.lineTo(xx, yy)
    else ctx.lineTo(xx, yy)
  })
  ctx.lineTo(width, height)
  ctx.closePath()
  ctx.fill()

  // Skyline Centro Histórico.
  const skylineY = Math.floor(height * 0.62)
  ctx.fillStyle = '#241b34'
  ctx.fillRect(0, skylineY, width, height - skylineY)

  ctx.fillStyle = '#362447'
  const structures = [
    { x: 40, w: 110, h: 88 },
    { x: 200, w: 120, h: 108 },
    { x: 360, w: 140, h: 100 },
    { x: 520, w: 130, h: 120 },
    { x: 700, w: 120, h: 110 },
    { x: 860, w: 130, h: 95 },
    { x: 1000, w: 120, h: 105 }
  ]
  for (const s of structures) {
    ctx.fillRect(s.x, skylineY - s.h, s.w, s.h)
  }

  // Cúpulas/torres.
  ctx.fillStyle = '#4c3b63'
  const circle = (cx: number, cy: number, r: number) => {
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
  }
  circle(520, skylineY - 72, 34)
  circle(685, skylineY - 62, 26)
  circle(310, skylineY - 58, 20)
  ctx.fillRect(105, skylineY - 170, 24, 170)
  ctx.fillRect(128, skylineY - 150, 20, 150)

  // Nubes pixel.
  const clouds = [
    { x: 120, y: 110, w: 140 },
    { x: 420, y: 80, w: 110 },
    { x: 720, y: 130, w: 150 },
    { x: 900, y: 95, w: 120 }
  ]
  ctx.fillStyle = 'rgba(216,212,236,0.95)'
  for (const c of clouds) {
    const rowH = 12
    for (let ry = 0; ry < 3; ry++) {
      const segments = 3 + ((Math.random() * 2) | 0)
      for (let s = 0; s < segments; s++) {
        const w = (c.w / segments) * 0.9
        const off = (c.w / segments) * s
        ctx.fillRect(c.x + off, c.y + ry * rowH, w, rowH - 2)
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  setPixelTextureFilters(tex)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

function buildFacade(tile = 128) {
  const size = Math.max(160, tile * 1.3)
  const { canvas, ctx } = createCanvas(size, size)

  ctx.fillStyle = '#3b2a45'
  ctx.fillRect(0, 0, size, size)

  // Base ladrillo visible (para que no parezca estante bajo).
  ctx.strokeStyle = 'rgba(22, 10, 26, 0.8)'
  ctx.lineWidth = 1
  const brickH = 14
  const brickW = 26
  for (let y = 12; y < size; y += brickH) {
    const offset = (y / brickH) % 2 === 0 ? 0 : brickW / 2
    for (let x = offset; x < size; x += brickW) {
      ctx.fillStyle = 'rgba(92, 68, 92, 0.35)'
      ctx.fillRect(x, y, brickW - 2, brickH - 2)
      ctx.strokeRect(x + 0.5, y + 0.5, brickW - 3, brickH - 3)
    }
  }

  // Ventanas con balcones (más altas).
  for (let y = 28; y < size - 48; y += 60) {
    for (let x = 14; x < size - 36; x += 48) {
      ctx.fillStyle = '#c9b07a'
      ctx.fillRect(x, y, 26, 32)
      ctx.fillStyle = '#20132e'
      ctx.fillRect(x + 4, y + 5, 18, 16)
      // Barandal
      ctx.fillStyle = '#bca16f'
      ctx.fillRect(x - 2, y + 28, 30, 7)
      ctx.fillStyle = '#8c734d'
      ctx.fillRect(x - 2, y + 34, 30, 2)
    }
  }

  // Cornisa y base.
  ctx.fillStyle = '#c7b27d'
  ctx.fillRect(0, 0, size, 12)
  ctx.fillRect(0, size - 14, size, 14)
  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  ctx.fillRect(0, size - 24, size, 4)

  const tex = new THREE.CanvasTexture(canvas)
  setPixelTextureFilters(tex)
  tex.repeat.set(1.4, 1.0)
  return tex
}

function buildArchway(tile = 128) {
  const { canvas, ctx } = createCanvas(tile, tile)
  ctx.fillStyle = '#352c46'
  ctx.fillRect(0, 0, tile, tile)

  // Arco simple (aprox).
  ctx.fillStyle = '#b59663'
  const centerX = tile / 2
  const centerY = tile * 0.75
  const rx = tile * 0.42
  const ry = tile * 0.6

  ctx.beginPath()
  ctx.moveTo(centerX - rx, centerY)
  for (let a = Math.PI; a <= 2 * Math.PI + 0.001; a += Math.PI / 40) {
    ctx.lineTo(centerX + Math.cos(a) * rx, centerY + Math.sin(a) * ry)
  }
  ctx.lineTo(centerX + rx, centerY + ry)
  ctx.lineTo(centerX - rx, centerY + ry)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#211731'
  ctx.fillRect(centerX - rx * 0.6, centerY - ry * 0.3, rx * 1.2, ry * 0.9)

  const tex = new THREE.CanvasTexture(canvas)
  setPixelTextureFilters(tex)
  tex.repeat.set(2, 2)
  return tex
}

function buildStoneFloor(tile = 128) {
  const { canvas, ctx } = createCanvas(tile, tile)
  ctx.fillStyle = '#2b212c'
  ctx.fillRect(0, 0, tile, tile)

  ctx.strokeStyle = '#211924'
  ctx.lineWidth = 1
  ctx.fillStyle = '#3b313d'

  for (let y = 0; y < tile; y += 32) {
    for (let x = 0; x < tile; x += 32) {
      const offset = ((y / 32) | 0) % 2 === 0 ? 0 : 16
      const jx = Math.random() * 3
      const jy = Math.random() * 3
      ctx.fillRect(x + offset + 2 + jx, y + 2 + jy, 28, 28)
    }
  }

  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  for (let i = 0; i < 40; i++) {
    const px = Math.random() * tile
    const py = Math.random() * tile
    ctx.fillRect(px, py, 2, 2)
  }

  const tex = new THREE.CanvasTexture(canvas)
  setPixelTextureFilters(tex)
  tex.repeat.set(8, 8)
  return tex
}

export function generateCentroHistoricoTextures(options?: { lowRes?: boolean }): CentroHistoricoTextures {
  const low = Boolean(options?.lowRes)
  const sky = buildSky(low ? 768 : 1024, low ? 384 : 512)
  const wallColonial = buildFacade(low ? 112 : 128)
  const wallArchway = buildArchway(low ? 112 : 128)
  const floorStones = buildStoneFloor(low ? 112 : 128)
  const mountainDetail = buildSky(low ? 384 : 512, low ? 192 : 256)
  return { sky, wallColonial, wallArchway, floorStones, mountainDetail }
}
