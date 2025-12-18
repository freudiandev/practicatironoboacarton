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
  const topA: [number, number, number] = [45, 27, 76]
  const topB: [number, number, number] = [81, 59, 130]
  const botA: [number, number, number] = [81, 59, 130]
  const botB: [number, number, number] = [241, 178, 107]

  for (let y = 0; y < height; y++) {
    const t = y / height
    const cTop = lerpColor(topA, topB, Math.min(1, t * 0.6))
    const cBot = lerpColor(botA, botB, Math.max(0, t - 0.35))
    const c = lerpColor(cTop, cBot, t)
    fillRect(ctx, 0, y, width, 1, c, 1)
  }

  // Cordillera.
  ctx.fillStyle = '#3d2a5e'
  ctx.beginPath()
  ctx.moveTo(0, height)
  const peaks = [
    { x: -120, h: 220 },
    { x: 60, h: 280 },
    { x: 280, h: 260 },
    { x: 600, h: 320 },
    { x: 860, h: 240 },
    { x: 1080, h: 280 }
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
    { x: 70, w: 120, h: 90 },
    { x: 230, w: 80, h: 70 },
    { x: 340, w: 100, h: 80 },
    { x: 470, w: 140, h: 110 },
    { x: 650, w: 110, h: 95 },
    { x: 800, w: 90, h: 75 },
    { x: 920, w: 120, h: 85 }
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
  circle(520, skylineY - 65, 30)
  circle(685, skylineY - 55, 24)
  ctx.fillRect(105, skylineY - 160, 24, 160)
  ctx.fillRect(128, skylineY - 140, 20, 140)

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
  const { canvas, ctx } = createCanvas(tile, tile)

  ctx.fillStyle = '#3b2a45'
  ctx.fillRect(0, 0, tile, tile)

  // Grilla de estuco/azulejo.
  ctx.strokeStyle = '#24162e'
  ctx.lineWidth = 1
  const tileH = 16
  const tileW = 32
  for (let y = tileH; y < tile; y += tileH) {
    ctx.beginPath()
    ctx.moveTo(0, y + 0.5)
    ctx.lineTo(tile, y + 0.5)
    ctx.stroke()
  }
  for (let x = tileW; x < tile; x += tileW) {
    ctx.beginPath()
    ctx.moveTo(x + 0.5, 0)
    ctx.lineTo(x + 0.5, tile)
    ctx.stroke()
  }

  // Ventanas con balcones.
  for (let y = 24; y < tile - 32; y += 48) {
    for (let x = 12; x < tile - 24; x += 40) {
      ctx.fillStyle = '#bca16f'
      ctx.fillRect(x, y, 20, 26)
      ctx.fillStyle = '#20132e'
      ctx.fillRect(x + 3, y + 4, 14, 12)
      ctx.fillStyle = '#bca16f'
      ctx.fillRect(x - 2, y + 22, 24, 6)
      ctx.fillStyle = '#d8b879'
    }
  }

  // Cornisa.
  ctx.fillStyle = '#c7b27d'
  ctx.fillRect(0, 0, tile, 10)
  ctx.fillRect(0, tile - 10, tile, 10)

  const tex = new THREE.CanvasTexture(canvas)
  setPixelTextureFilters(tex)
  tex.repeat.set(2, 2)
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

export function generateCentroHistoricoTextures(): CentroHistoricoTextures {
  const sky = buildSky(1024, 512)
  const wallColonial = buildFacade(128)
  const wallArchway = buildArchway(128)
  const floorStones = buildStoneFloor(128)
  return { sky, wallColonial, wallArchway, floorStones }
}

