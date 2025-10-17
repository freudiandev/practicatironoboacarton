(function () {
  const SKY_WIDTH = 1024;
  const SKY_HEIGHT = 512;
  const TILE_SIZE = 128;

  const listeners = [];
  let ready = false;
  let textureSet = null;

  function toCanvas(graphics, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(graphics.canvas || graphics.elt, 0, 0, width, height);
    return canvas;
  }

  function notify() {
    ready = true;
    while (listeners.length) {
      const cb = listeners.shift();
      try {
        cb(textureSet);
      } catch (err) {
        console.error('Error entregando texturas Centro Histórico:', err);
      }
    }
  }

  function buildSkyLayer(p, g) {
    g.noSmooth();

    // Amanecer andino: gradiente vertical
    for (let y = 0; y < g.height; y++) {
      const t = y / g.height;
      const top = p.lerpColor(p.color('#2d1b4c'), p.color('#513b82'), t * 0.6);
      const bottom = p.lerpColor(p.color('#513b82'), p.color('#f1b26b'), Math.max(0, t - 0.35));
      g.stroke(p.lerpColor(top, bottom, t));
      g.line(0, y, g.width, y);
    }

    // Cordillera al fondo
    g.noStroke();
    g.fill('#3d2a5e');
    const peaks = [
      { x: -120, h: 220 },
      { x: 60, h: 280 },
      { x: 280, h: 260 },
      { x: 600, h: 320 },
      { x: 860, h: 240 },
      { x: 1080, h: 280 }
    ];
    for (let i = 0; i < peaks.length - 1; i++) {
      const a = peaks[i];
      const b = peaks[i + 1];
      g.beginShape();
      g.vertex(a.x, g.height);
      g.vertex(a.x + 40, g.height - a.h);
      g.vertex(b.x - 40, g.height - b.h);
      g.vertex(b.x, g.height);
      g.endShape(p.CLOSE);
    }

    // Siluetas del Centro Histórico
    const skylineY = g.height * 0.62;
    g.fill('#241b34');
    g.rect(0, skylineY, g.width, g.height - skylineY);

    g.fill('#362447');
    const structures = [
      { x: 70, w: 120, h: 90 }, // Basílica
      { x: 230, w: 80, h: 70 }, // Palacio Arzobispal
      { x: 340, w: 100, h: 80 }, // Plaza Grande ala
      { x: 470, w: 140, h: 110 }, // El Sagrario
      { x: 650, w: 110, h: 95 }, // La Compañía
      { x: 800, w: 90, h: 75 },
      { x: 920, w: 120, h: 85 }
    ];

    structures.forEach((s) => {
      g.rect(s.x, skylineY - s.h, s.w, s.h);
    });

    // Cúpulas y torres
    g.fill('#4c3b63');
    g.circle(520, skylineY - 65, 60);
    g.circle(685, skylineY - 55, 48);
    g.rect(105, skylineY - 160, 24, 160);
    g.rect(128, skylineY - 140, 20, 140);

    // Nubes pixel art
    g.fill('#d8d4ec');
    const clouds = [
      { x: 120, y: 110, w: 140 },
      { x: 420, y: 80, w: 110 },
      { x: 720, y: 130, w: 150 },
      { x: 900, y: 95, w: 120 }
    ];

    clouds.forEach((cloud) => {
      const rowHeight = 12;
      for (let y = 0; y < 3; y++) {
        const segments = 3 + Math.floor(Math.random() * 2);
        for (let s = 0; s < segments; s++) {
          const w = (cloud.w / segments) * 0.9;
          const offset = (cloud.w / segments) * s;
          g.rect(cloud.x + offset, cloud.y + y * rowHeight, w, rowHeight - 2, 4);
        }
      }
    });
  }

  function buildFacade(g) {
    g.noSmooth();
    g.background('#2a1f33');
    g.stroke('#1b1424');
    g.fill('#3b2a45');
    g.rect(0, 0, g.width, g.height);

    const tileH = 16;
    const tileW = 32;
    g.stroke('#24162e');
    for (let y = tileH; y < g.height; y += tileH) {
      g.line(0, y, g.width, y);
    }
    for (let x = tileW; x < g.width; x += tileW) {
      g.line(x, 0, x, g.height);
    }

    // Ventanas con balcones
    g.noStroke();
    g.fill('#bca16f');
    for (let y = 24; y < g.height - 32; y += 48) {
      for (let x = 12; x < g.width - 24; x += 40) {
        g.rect(x, y, 20, 26, 4);
        g.fill('#20132e');
        g.rect(x + 3, y + 4, 14, 12, 3);
        g.fill('#bca16f');
        g.rect(x - 2, y + 22, 24, 6);
        g.fill('#d8b879');
      }
    }

    // Cornisa
    g.fill('#c7b27d');
    g.rect(0, 0, g.width, 10);
    g.rect(0, g.height - 10, g.width, 10);
  }

  function buildArchway(g) {
    g.noSmooth();
    g.background('#2c2539');
    g.stroke('#1c1727');
    g.fill('#352c46');
    g.rect(0, 0, g.width, g.height);

    g.noStroke();
    g.fill('#b59663');
    const centerX = g.width / 2;
    const centerY = g.height * 0.75;
    const radiusX = g.width * 0.42;
    const radiusY = g.height * 0.6;

    g.push();
    g.translate(centerX, centerY);
    g.beginShape();
    for (let angle = Math.PI; angle <= 2 * Math.PI; angle += Math.PI / 48) {
      const x = Math.cos(angle) * radiusX;
      const y = Math.sin(angle) * radiusY;
      g.vertex(x, y);
    }
    g.vertex(radiusX, radiusY);
    g.vertex(-radiusX, radiusY);
    g.endShape(p.CLOSE);
    g.pop();

    g.fill('#211731');
    g.rect(centerX - radiusX * 0.6, centerY - radiusY * 0.3, radiusX * 1.2, radiusY * 0.9, 6);
  }

  function buildStoneFloor(g) {
    g.noSmooth();
    g.background('#2b212c');

    g.stroke('#211924');
    g.fill('#3b313d');
    for (let y = 0; y < g.height; y += 32) {
      for (let x = 0; x < g.width; x += 32) {
        const offset = (y / 32) % 2 === 0 ? 0 : 16;
        const jitterX = Math.random() * 3;
        const jitterY = Math.random() * 3;
        g.rect(x + offset + jitterX, y + jitterY, 28, 28, 4);
      }
    }

    g.noStroke();
    g.fill('rgba(255,255,255,0.08)');
    for (let i = 0; i < 40; i++) {
      const px = Math.random() * g.width;
      const py = Math.random() * g.height;
      g.rect(px, py, 2, 2);
    }
  }

  const sketch = (p) => {
    let skyLayer;
    let facadeLayer;
    let archLayer;
    let floorLayer;

    p.setup = () => {
      p.pixelDensity(1);
      p.noCanvas();

      skyLayer = p.createGraphics(SKY_WIDTH, SKY_HEIGHT);
      facadeLayer = p.createGraphics(TILE_SIZE, TILE_SIZE);
      archLayer = p.createGraphics(TILE_SIZE, TILE_SIZE);
      floorLayer = p.createGraphics(TILE_SIZE, TILE_SIZE);

      buildSkyLayer(p, skyLayer);
      buildFacade(facadeLayer);
      buildArchway(archLayer);
      buildStoneFloor(floorLayer);

      textureSet = {
        sky: toCanvas(skyLayer, SKY_WIDTH, SKY_HEIGHT),
        wallColonial: toCanvas(facadeLayer, TILE_SIZE, TILE_SIZE),
        wallArchway: toCanvas(archLayer, TILE_SIZE, TILE_SIZE),
        floorStones: toCanvas(floorLayer, TILE_SIZE, TILE_SIZE)
      };

      notify();
    };
  };

  if (typeof window !== 'undefined' && window.p5) {
    new window.p5(sketch, document.body);
  } else {
    console.warn('p5.js no está disponible; se omite la generación del Centro Histórico.');
  }

  window.CentroHistoricoTextures = {
    isReady() {
      return ready;
    },
    getTextures() {
      return textureSet;
    },
    whenReady(callback) {
      if (typeof callback !== 'function') return;
      if (ready) {
        callback(textureSet);
      } else {
        listeners.push(callback);
      }
    }
  };
})();
