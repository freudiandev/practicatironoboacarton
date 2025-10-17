# Concepto de entorno "Centro Histórico" con soporte p5.js

## Visión artística
- **Ambientación:** recrear el casco colonial de Quito al amanecer, con paleta cálida (ocres, terracotas, azules pastel) y detalles icónicos (balcones de madera tallada, faroles coloniales, adoquines húmedos).
- **Moodboard rápido:** Plaza Grande, cúpulas de iglesias, cielos con luz dorada filtrándose entre montañas, señalética histórica en español.
- **Coherencia gráfica:** híbrido entre pixel art limpio (sprites, props) y gradientes suaves para cielo y niebla; mantener resolución objetivo 320×200 upscale 3× para efecto retro nítido.

## Rol de p5.js en la escena
1. **Generador de fondos panorámicos**
   - Usar p5 para renderizar fuera de pantalla (offscreen canvas) el skyline dinámico: siluetas montañosas, cúpulas y nubes animadas.
   - Exportar el resultado como `ImageBitmap` reutilizable en el raycaster (skybox y plano parallax).
2. **Tooling de assets:** pequeños sketches p5 que produzcan patrones de balcones, ladrillos y cerámicas basadas en ruido y paletas definidas, luego rasterizarlas a 64×64 para el atlas.
3. **Efectos atmosféricos opcionales:** lluvia fina, neblina ascendente, fuegos artificiales festivos; renderizados en una capa transparente encima del canvas principal usando `p5.Graphics`.

## Integración técnica
- **Arquitectura:**
  - Crear módulo `lib/p5-backdrop.js` que inicialice p5 en modo instancia (`new p5(sketch, container)`), pero apunte a un canvas oculto (`display:none`).
  - Cada frame o en intervalos (ej. 500 ms) actualizar el `ImageBitmap` y entregarlo a `game-all-in-one.js` vía callback `setSkyBitmap(bitmap)`.
  - Para efectos en tiempo real (lluvia/neblina) exponer `getOverlayCanvas()` para que el motor principal lo dibuje como overlay.
- **Sincronización:**
  - Compartir estado de hora del día y clima mediante `GameState.environment` → p5 lee esta store para alterar colores/animaciones.
  - Para festividades, cargar presets (`sanFranciscoFiestas`, `independencia`, etc.).
- **Fallback:** si p5 no carga, mantener skybox estático pre-renderizado (`sky-quito.png`) y overlays desactivados.

## Pipeline de assets
1. **Referencias fotográficas** → ajustar en GIMP/Photoshop a 512×512.
2. **Sketch p5 `texture-maker.js`:**
   - Definir funciones `createBalconyPattern(seed)`, `createStoneWall()`, `createTileRoof()` que dibujan en un `p5.Graphics`.
   - Exportar PNG con `canvas.toDataURL()` o vía botón de descarga.
3. **Post-proceso:** pasar por `sprite-uniformizer.html` existente para asegurar paleta, bordes y transparencia.
4. **Atlas final:** compilar con `texture-atlas-builder` (puede ser un script Node/p5) → actualizar JSON de regiones.

## Diseño de niveles
- **Layouts:**
  - Calles en cuadrícula irregular con callejones estrechos, plazas abiertas y patios interiores.
  - Objetivos: proteger un convoy, recolectar reliquias, escoltar civiles.
  - Añadir landmarks: Catedral, Palacio de Carondelet, Arco de la Reina.
- **Verticalidad:**
  - Permitir balcones accesibles (trampas, francotiradores), escalinatas y desniveles.
  - Raycaster puede simularlo con diferencias de altura en el buffer y props escalonados.
- **Narrativa:**
  - Tono satírico/político manteniendo humor del juego; carteles propagandísticos de Noboa adaptados al estilo colonial.

## Optimización y performance
- **Render budgeting:**
  - p5 Offscreen update máximo 30 FPS; el motor principal toma snapshots cuando haya cambios.
  - Limitar overlay effects a 30% de pantalla con alpha 0.4 para no saturar fill-rate.
  - Usar `requestAnimationFrame` compartido para evitar bucles desincronizados.
- **Control de calidad:**
  - Integrar con `renderQuality` del plan de raycasting: en Low desactivar p5 y usar assets estáticos; en High mantener todo.
  - Medir tiempo de preparación (`bitmap.renderTimeMs`) y mostrar en panel debug.

## Roadmap sugerido
1. **Prototipo p5:** boceto mínimo que genera skybox dinámico y devuelve `ImageBitmap`.
2. **Atlas colonial:** producir 6 texturas base + props (farol, bandera, planta).
3. **Level blockout:** adaptar el mapa actual al patrón de calles coloniales, definir spawn points.
4. **Integración climática:** exponer toggles en HUD debug para activar neblina, llovizna, festividad.
5. **QA & ajustes:** testear en escritorio y móvil; preparar capturas para docs/marketing.

## Alternativas si p5 no es viable
- Utilizar **PixiJS** con renderizado a `RenderTexture` para overlays.
- Emplear **Canvas puro** con librería `rough.js` para estilos dibujados a mano.
- Generar fondos mediante scripts Node (`node-canvas`) durante build y servirlos como estáticos.

Este documento sirve como blueprint para la transformación estética del juego hacia el Centro Histórico, manteniendo control creativo y técnico sobre la integración de p5.js y asegurando degradación elegante en hardware menos potente.