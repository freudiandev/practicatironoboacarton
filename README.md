# DOOM: Noboa de Cartón (practicatironoboacarton)

Repo con 2 variantes del juego:

- **Legacy**: FPS estilo DOOM hecho en HTML/JavaScript (Canvas 2D + raycasting manual) con sprites 2D, HUD y soporte desktop/móvil.
- **Nueva (WIP)**: migración a **Vite + React + React Three Fiber (R3F) + Zustand** para render GPU (InstancedMesh) y arquitectura moderna.

## Ejecutar en local (Legacy)

Por temas de seguridad del navegador (Pointer Lock, `fetch` de `auto-version.js`, etc.) es mejor usar un servidor local en vez de abrir `index.html` como `file://`.

```bash
python3 -m http.server 8080
# luego abre http://localhost:8080/
```

## Ejecutar en local (Migración R3F)

El subproyecto vive en `doom-noboa/`.

```bash
cd doom-noboa
npm install
npm run dev
```

## Documentación

- Documentación completa del proyecto: `DOCUMENTACION.md`
- Notas técnicas de raycasting: `MEJORAS-RAYCASTING-VISUAL.md`
- Concepto “Centro Histórico” (p5.js): `CONCEPTO-CENTRO-HISTORICO-P5.md`
- Guía para contribuir (dev/debug/assets/deploy): `CONTRIBUTING.md`

## Migración R3F (nuevo)

- Nueva base Vite + React + R3F + Zustand: `doom-noboa/README.md`
- Roadmap completo (render, shaders, power-ups, P2P, gamepad): `MIGRACION-R3F.md`
