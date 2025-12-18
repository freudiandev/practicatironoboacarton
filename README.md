# DOOM: Noboa de Cartón (R3F)

FPS retro “Cardboard Cyberpunk” ambientado en el Centro Histórico de Quito, migrado a una arquitectura moderna:

- **Vite** (SPA estático)
- **React + React Three Fiber (R3F)** (render GPU)
- **Zustand** (estado + `persist` para highscores)
- **InstancedMesh** para el laberinto (1 draw call para paredes)
- Enemigos **Billboard** (sprites 2D en mundo 3D) + **shader dissolve** al morir
- Texturas procedurales “Centro Histórico” (Canvas → `CanvasTexture`) + skybox panorámico

> El raycasting Canvas 2D quedó archivado en `legacy/raycast/` (ya no es la versión principal).

## Ejecutar en local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## GitHub Pages (deploy)

Este repo despliega con **GitHub Actions** (build de Vite y publish de `dist/`).

- Workflow: `.github/workflows/pages.yml`
- `vite.config.ts` ajusta `base` automáticamente a `/<repo>/` en producción (requerido por Pages).

## Controles

Desktop:
- Click: captura mouse (Pointer Lock)
- `W/A/S/D`: moverse · `Shift`: correr · `R`: recargar · `ESC`: liberar cursor

Móvil:
- Joystick (izq): moverse
- Swipe (der): mirar
- Botón `FIRE` (mantener) + `RLD` para recargar

## Documentación

- Documentación del proyecto: `DOCUMENTACION.md`
- Roadmap/arquitectura de migración: `MIGRACION-R3F.md`
- Concepto original “Centro Histórico” (p5.js legacy): `CONCEPTO-CENTRO-HISTORICO-P5.md`
- Guía para contribuir: `CONTRIBUTING.md`
