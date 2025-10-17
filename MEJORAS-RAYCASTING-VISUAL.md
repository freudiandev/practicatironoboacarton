# Plan incremental para mejoras de raycasting y estilo visual

## Foto actual
- El raycaster principal de `game-all-in-one.js` calcula una columna por "ray" y pinta franjas sólidas derivadas de la textura de pared.
- El horizonte permanece a media pantalla independientemente de la elevación, limitando la sensación de profundidad.
- Las texturas existentes mezclan resoluciones y se escalan linealmente, creando efectos borrosos cuando la cámara se acerca.
- La iluminación es uniforme; sólo se atenúa por distancia (`distanceFade`), lo que deja las escenas planas.

## Objetivos
1. Aumentar nitidez y estabilidad del raycasting sin sacrificar FPS en navegadores de gama media.
2. Integrar un estilo híbrido: raycaster limpio con pixel art consistente (16-32 colores base) y sombreado suave.
3. Abrir el campo visual para mostrar más del entorno (pasar de \~60° a 80° configurables) y añadir cuevas de altura.
4. Mantener compatibilidad con los sistemas actuales (HUD, minimapa, IA) y permitir degradaciones progresivas para móviles.

## Roadmap técnico

### 1. Núcleo de raycasting
- **Column doubling:** Renderizar el doble de rayos por frame pero combinar dos columnas en un único píxel horizontal (supersampling ×2) para reducir aliasing sin duplicar coste de fill-rate.
- **Temporal jitter opcional:** desfasar el ángulo de inicio en ±0.25° frame a frame para suavizar bordes; acumular en un framebuffer secundario con blending leve.
- **Buffer de altura:** almacenar `wallHeight` en un mapa 1D para reutilizar la información al dibujar sprites/floor casting.
- **FOV dinámico:** exponer `player.fov` (grados) en `config.js` y permitir transición entre 60°, 75° y 85° según velocidad (close combat vs. exploración). Ajustar minimapa para compensar.

### 2. Texturizado y pixel art
- **Atlas pixel art:** crear un atlas a 64×64 por textura, con paleta común inspirada en Quito colonial (ocre, terracota, celeste, verde musgo). Guardar en `/assets/textures/quito-atlas.png` más JSON de regiones.
- **Filtro nearest-neighbour:** forzar `ctx.imageSmoothingEnabled = false` sólo en la fase de texturizado. Para paredes lejanas aplicar mix: `lerp(sampleColor, skyColor, fogFactor)` para niebla suave.
- **Dithering Disney/BlueNoise:** precalcular patrón 8×8 y aplicarlo cuando `fogFactor` > 0.6 para evitar bandas.
- **Sprites coherentes:** reutilizar el mismo atlas para props (faroles, balcones) y mantener ratio 1:1, apoyándose en el nuevo pipeline de sprites sin distorsión.

### 3. Horizonte y planos adicionales
- **Floor & ceiling casting:** reutilizar el buffer de altura para pintar adoquines y cielo tipo "amanecer andino". Optimizar saltando de a 2 filas en baja calidad.
- **Skybox panorámico:** añadir textura `sky-quito.png` de 1024×256 y mapearla con wrap. Incorporar parámetro `skyRotation` para animar nubes lentas.
- **Parallax bajo:** introducir segunda capa de edificios lejanos (bitmap 512×128) desplazada en función del ángulo del jugador.

### 4. Iluminación y atmósfera
- **Puntos de luz:** crear arreglo `LIGHT_SOURCES` (posición, radio, color) y mezclarlo con `distanceFade`. Para interiores, tonos cálidos; para exteriores, faroles azul frío.
- **Sombras suaves:** para cada pared, si el ángulo entre normal y vector de luz < 90°, aplicar multiplicador `0.6 + 0.4*cos(theta)`.
- **Eventos climáticos:** shader 2D simple que agrega lluvia fina (líneas diagonales semitransparentes) o neblina (ruido Perlin) según estado global.

### 5. Rendimiento
- **Quality tiers:** definir `renderQuality = ['ultra', 'high', 'medium', 'low']` en `config.js`.
  - *Ultra:* supersampling ×2, floor casting completo, luces activas.
  - *High:* supersampling ×1.5 (alternar columnas), luces a media resolución.
  - *Medium:* sin jitter, floor casting lite, sin dithering.
  - *Low:* rayos tradicionales, sólo colores planos y niebla lineal.
- **Batching draw calls:** usar `ImageData` para pintar paredes en bloques de 8 columnas para navegadores antiguos.
- **Medición interna:** exponer `window.__raycastStats__` con `lastFrameMs` y `avgFrameMs` para monitorear.

## Próximos pasos sugeridos
1. Refactorizar el bucle de raycasting en `game-all-in-one.js` separando `castRay`, `drawWallColumn`, `drawFloorColumn` y `applyLighting` para testear individualmente.
2. Crear módulo `textures/atlas-loader.js` que cargue atlas + paleta y devuelva `sample(u, v)` sin suavizado.
3. Implementar `QualityProfile` (auto o manual) que ajuste FOV, número de rayos y efectos.
4. Elaborar set inicial de texturas Quito (muros encalados, piedras, madera tallada) y definir guide de paleta (esquema 24 colores).
5. Documentar comandos debug (ej. `debugSystem.toggleRaycastHeatmap()`) para verificar rendimiento por columna.

## Métricas de validación
- Apple M1/Chrome: ≥ 55 FPS en High con mapa actual.
- Intel i5 8va + iGPU/Edge: ≥ 45 FPS en Medium.
- Moto G Power 2020/Chrome Android: ≥ 30 FPS en Low (resolution scale 0.75).
- Varianza de color (ΔE) < 3 entre texturas pixel art para asegurar coherencia visual.

Con este plan podemos iterar desde un raycaster funcional hacia una experiencia visualmente más rica y temática, sin perder control sobre el coste computacional.

## Estado al 15-10-2025
- **Estabilidad de cámara:** se deshabilitó el jitter temporal por defecto en todos los perfiles de calidad para evitar vibraciones laterales al apuntar.
- **Raycaster optimizado:** `castMultipleRays` ahora reutiliza cálculos trigonométricos, reduce saltos innecesarios y expone coordenadas UV consistentes para texturizado.
- **Supersampling configurable:** `renderWalls` respeta los perfiles (`ultra` → `low`) y mantiene `imageSmoothing` desactivado al proyectar texturas pixel art.
- **Atlas integrado:** `texture-atlas.js` provee ladrillo, piedra y adoquines con paleta colonial; el motor hace fallback a patrones procedurales si el atlas no carga.
- **Auto quality:** el sistema monitorea frame time promedio y ajusta `renderQuality` entre *ultra/high/medium/low* según el rendimiento detectado, sin intervención del jugador.
- **Siguiente validación sugerida:** probar en desktop (Chrome/Edge) y un móvil Android para verificar que el auto scaler efectivamente converge en ≤ 16 ms (60 FPS) o degrade a niveles aceptables.