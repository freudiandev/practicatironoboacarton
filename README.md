# DOOM: Noboa de Cartón (practicatironoboacarton)

FPS estilo DOOM hecho en HTML/JavaScript (Canvas 2D + raycasting), con sprites de enemigos, HUD completo (vida, munición, minimapa) y soporte desktop/móvil.

## Ejecutar en local

Por temas de seguridad del navegador (Pointer Lock, `fetch` de `auto-version.js`, etc.) es mejor usar un servidor local en vez de abrir `index.html` como `file://`.

```bash
python3 -m http.server 8080
# luego abre http://localhost:8080/
```

## Documentación

- Documentación completa del proyecto: `DOCUMENTACION.md`
- Notas técnicas de raycasting: `MEJORAS-RAYCASTING-VISUAL.md`
- Concepto “Centro Histórico” (p5.js): `CONCEPTO-CENTRO-HISTORICO-P5.md`
- Guía para contribuir (dev/debug/assets/deploy): `CONTRIBUTING.md`
