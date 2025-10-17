(function(global) {
  'use strict';

  class TextureAtlas {
    constructor(options = {}) {
      const width = options.width || 256;
      const height = options.height || 256;

      this.canvas = document.createElement('canvas');
      this.canvas.width = width;
      this.canvas.height = height;
      this.ctx = this.canvas.getContext('2d');
      this.ctx.imageSmoothingEnabled = false;

      this.regions = new Map();
      this.palette = Object.assign({
        deepTerracotta: '#7b2d21',
        warmClay: '#b84c2f',
        paleStucco: '#f2d3b3',
        basaltStone: '#4a3d3a',
        mossGreen: '#6c7b3b',
        nightSky: '#1e2a45',
        dawnBlue: '#8ea6c1',
        brassAccent: '#c9a14a',
        darkGrout: '#30231f'
      }, options.palette || {});

      this.cellSize = options.cellSize || 64;
      this.ready = false;

      if (options.generateDefault !== false) {
        this.generateDefaultAtlas();
      }
    }

    clearRegion(x, y, width, height) {
      this.ctx.save();
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(x, y, width, height);
      this.ctx.restore();
    }

    registerRegion(name, x, y, width, height, drawFn) {
      const region = { name, x, y, width, height };
      this.regions.set(name, region);

      this.clearRegion(x, y, width, height);

      if (typeof drawFn === 'function') {
        this.ctx.save();
        this.ctx.translate(x, y);
        drawFn(this.ctx, width, height, this.palette);
        this.ctx.restore();
      }

      return region;
    }

    generateDefaultAtlas() {
      const size = this.cellSize;
      const doubleSize = size * 2;

      this.canvas.width = doubleSize;
      this.canvas.height = doubleSize;
      this.ctx.imageSmoothingEnabled = false;

      // Región 1: ladrillo terracota
      this.registerRegion('wall_brick', 0, 0, size, size, (ctx, w, h, palette) => {
        ctx.fillStyle = palette.deepTerracotta;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = palette.warmClay;
        const brickHeight = Math.floor(h / 4);
        const brickWidth = Math.floor(w / 4);
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 4; col++) {
            const offset = row % 2 === 0 ? 0 : brickWidth / 2;
            const x = Math.floor((col * brickWidth + offset) % w);
            const y = row * brickHeight;
            ctx.fillRect(x, y + 1, brickWidth - 2, brickHeight - 2);
          }
        }

        ctx.fillStyle = palette.darkGrout;
        ctx.globalAlpha = 0.5;
        for (let y = brickHeight; y < h; y += brickHeight) {
          ctx.fillRect(0, y, w, 1);
        }
        for (let x = brickWidth / 2; x < w; x += brickWidth) {
          ctx.fillRect(Math.floor(x), 0, 1, h);
        }
        ctx.globalAlpha = 1;
      });

      // Región 2: piedra volcánica
      this.registerRegion('wall_stone', size, 0, size, size, (ctx, w, h, palette) => {
        ctx.fillStyle = palette.basaltStone;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#3b302e';
        for (let i = 0; i < 18; i++) {
          const rw = Math.floor(w / 4 + Math.random() * (w / 3));
          const rh = Math.floor(h / 4 + Math.random() * (h / 3));
          const rx = Math.floor(Math.random() * (w - rw));
          const ry = Math.floor(Math.random() * (h - rh));
          ctx.fillRect(rx, ry, rw, rh);
        }

        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        for (let i = 0; i < 12; i++) {
          const rw = Math.floor(w / 5);
          const rh = Math.floor(h / 5);
          const rx = Math.floor(Math.random() * (w - rw));
          const ry = Math.floor(Math.random() * (h - rh));
          ctx.fillRect(rx, ry, rw, rh);
        }
      });

      // Región 3: adoquines coloniales
      this.registerRegion('floor_cobble', 0, size, size, size, (ctx, w, h, palette) => {
        ctx.fillStyle = '#3d2f2b';
        ctx.fillRect(0, 0, w, h);

        const cobbleWidth = Math.floor(w / 6);
        const cobbleHeight = Math.floor(h / 3.5);
        for (let row = 0; row < Math.ceil(h / cobbleHeight); row++) {
          for (let col = 0; col < Math.ceil(w / cobbleWidth); col++) {
            const offset = row % 2 === 0 ? 0 : cobbleWidth / 2;
            const x = Math.floor((col * cobbleWidth + offset) % w);
            const y = row * cobbleHeight;
            ctx.fillStyle = ['#5a4a45', '#4f3f3a', '#6a5851'][Math.floor(Math.random() * 3)];
            ctx.fillRect(x + 1, y + 1, cobbleWidth - 2, cobbleHeight - 2);
          }
        }

        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#000';
        for (let y = cobbleHeight; y < h; y += cobbleHeight) {
          ctx.fillRect(0, y, w, 1);
        }
        for (let x = cobbleWidth / 2; x < w; x += cobbleWidth) {
          ctx.fillRect(Math.floor(x), 0, 1, h);
        }
        ctx.globalAlpha = 1;
      });

      // Región 4: azulejo ornamental (por si se necesita)
      this.registerRegion('wall_tile', size, size, size, size, (ctx, w, h, palette) => {
        ctx.fillStyle = palette.paleStucco;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = palette.dawnBlue;
        const tile = Math.floor(w / 4);
        for (let x = 0; x < w; x += tile) {
          for (let y = 0; y < h; y += tile) {
            ctx.fillRect(x + 1, y + 1, tile - 2, tile - 2);
            ctx.fillStyle = palette.brassAccent;
            ctx.fillRect(x + tile / 2 - 1, y + 2, 2, tile - 4);
            ctx.fillRect(x + 2, y + tile / 2 - 1, tile - 4, 2);
            ctx.fillStyle = palette.dawnBlue;
          }
        }
      });

      this.ready = true;
    }

    getRegion(name) {
      return this.regions.get(name) || null;
    }

    getSlice(name, u = 0) {
      const region = this.getRegion(name);
      if (!region) return null;

      const clampedU = ((u % 1) + 1) % 1;
      const sx = region.x + Math.min(region.width - 1, Math.max(0, Math.floor(clampedU * region.width)));
      return {
        sx,
        sy: region.y,
        sw: 1,
        sh: region.height,
        region
      };
    }

    createPattern(name, repeat = 'repeat') {
      const region = this.getRegion(name);
      if (!region) return null;

      const temp = document.createElement('canvas');
      temp.width = region.width;
      temp.height = region.height;
      const tempCtx = temp.getContext('2d');
      tempCtx.imageSmoothingEnabled = false;
      tempCtx.drawImage(
        this.canvas,
        region.x,
        region.y,
        region.width,
        region.height,
        0,
        0,
        region.width,
        region.height
      );

      return tempCtx.createPattern(temp, repeat);
    }
  }

  global.TextureAtlas = TextureAtlas;
})(typeof window !== 'undefined' ? window : globalThis);
