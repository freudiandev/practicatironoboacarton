# 🧹 PLAN DE LIMPIEZA RADICAL - DOOM NOBOA

## SITUACIÓN ACTUAL
- **86 archivos JavaScript** detectados (¡EXCESO!)
- Múltiples sistemas duplicados y obsoletos
- DOOM renderizado funciona pero con baja resolución
- Necesidad urgente de simplificación

## ARCHIVOS ESENCIALES (SOLO ESTOS MANTENER):
1. **DOOM-INTERMEDIO.js** - Motor raycasting principal
2. **WorldPhysics.js** - Física del mundo
3. **game-initialization.js** - Inicialización del juego
4. **menu-system.js** - Sistema de menús
5. **audio.js** - Sistema de audio

## ARCHIVOS ELIMINAR (70+ archivos):
### Carpeta `/correctors` - ELIMINAR COMPLETA (7 archivos)
- CORRECTOR-MAESTRO-UNIFICADO.js
- CORRECTOR-CAMARA-VERTICAL-AVANZADO.js
- CORRECTOR-BUCLES-SPAM.js
- CORRECTOR-CRITICO-LEARNING-MEMORY.js
- SISTEMA-BALA-UNIFICADO-DEFINITIVO.js
- SISTEMA-EMERGENCIA-DISPARO.js
- INICIALIZADOR-CONTROLES-POST-DOOM.js

### Carpeta `/debug` - ELIMINAR COMPLETA (5 archivos)
- debug-system.js
- movimiento-debug.js
- VALIDADOR-POST-CORRECCION.js
- test-castle-map.js
- verify-game-ready.js

### Carpeta `/systems` - ELIMINAR COMPLETA (8 archivos)
- CONSTRUCCION-DEFINITIVA-LABERINTO.js
- DIAGNOSTICO-RAPIDO-CONTROLES.js
- SISTEMA-CARTESIANO-ENEMIGOS.js
- sistema-controles-unificado.js
- SISTEMA-MOVIMIENTO-UNIFICADO.js
- sistema-renderizado-unificado.js
- sistema-spawn-unificado.js
- SpawnManager.js
- VALIDADOR-ARCHIVOS.js

### Carpeta `/ai` - MANTENER SOLO 1 ARCHIVO
- ELIMINAR: learning-machine-advanced.js
- ELIMINAR: CLASIFICADOR-INTELIGENTE-JS.js
- ELIMINAR: LearningMemoryRestoration.js
- MANTENER: learning-memory-advanced.js

### Carpeta `/core` - LIMPIAR RADICALMENTE
- ELIMINAR: MovementSystem.js (70+ archivos eliminan la necesidad)
- ELIMINAR: SpawnSystem.js
- ELIMINAR: RenderSystem.js
- ELIMINAR: CorrectionSystem.js
- ELIMINAR: DebugSystem.js
- ELIMINAR: ModuleManager.js
- ELIMINAR: MapCartographer.js
- ELIMINAR: mapa-sync.js
- ELIMINAR: SISTEMA-DOOM-UNIFICADO.js

### Otros archivos obsoletos
- ELIMINAR: optimization/SISTEMA-OPTIMIZACION-RENDIMIENTO.js
- ELIMINAR: ui/enemy-html-render.js
- ELIMINAR: ui/panel-manager.js

## MEJORAS DOOM RENDERIZADO:
1. **Aumentar resolución raycast** - de 320x200 a 1280x800
2. **Mejorar calidad texturas** - filtrado bilineal
3. **Optimizar distancia renderizado** - fog distance mejorado
4. **Framerate estable** - 60 FPS garantizado

## RESULTADO ESPERADO:
- **De 86 archivos → 5 archivos esenciales**
- **Reducción del 94% en complejidad**
- **DOOM renderizado HD mejorado**
- **Código limpio y mantenible**
