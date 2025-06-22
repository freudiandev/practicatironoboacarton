# 🎯 Tiro con Noboa de Cartón - Versión Limpia y Optimizada

## 📋 Descripción
Juego de tiro en primera persona estilo DOOM desarrollado en JavaScript puro con Canvas 2D. Después de una limpieza completa y refactorización, el proyecto ahora cuenta con código optimizado y sin duplicaciones.

## 🎮 Características del Juego
- ✅ Movimiento en primera persona (WASD)
- ✅ Rotación con mouse
- ✅ Sistema de disparo con balas físicas
- ✅ Enemigos con IA básica
- ✅ Raycasting para renderizado 3D
- ✅ Sistema de laberinto/mapa
- ✅ Sprites de Noboa personalizados
- ✅ Sistema de audio
- ✅ Efectos decorativos
- ✅ UI de información (FPS, estado, etc.)

## 📁 Estructura del Proyecto (Optimizada)

```
Tiro con Noboa de Cartón/
├── index.html                     # HTML principal optimizado
├── DOOM-UNIFICADO.js              # Motor del juego unificado
├── REFACTORIZACION-COMPLETA.js    # Análisis y limpieza
├── LIMPIEZA-DEFINITIVA.js         # Script de limpieza
├── robots.txt                     # SEO
├── sitemap.xml                    # SEO
├── .htaccess                      # Configuración servidor
└── assets/
    ├── css/
    │   └── game-main.css          # Estilos principales
    ├── js/
    │   ├── learning-memory.js     # Sistema de memoria IA
    │   ├── audio.js               # Sistema de audio
    │   ├── ai-safe-system.js      # Sistema de IA seguro
    │   ├── decorative-system.js   # Sistema decorativo
    │   ├── noboa-sprites.js       # Sprites de Noboa
    │   ├── bullets-optimized.js   # Sistema de balas optimizado
    │   └── enemies-optimized.js   # Sistema de enemigos optimizado
    └── images/
        ├── favicon.ico
        ├── apple-touch-icon.png
        ├── noboa-*.png            # Sprites de Noboa
        └── decorative/            # Imágenes decorativas
```

## 🚀 Optimizaciones Realizadas

### ❌ Archivos Eliminados (~85% del código):
- **60+ archivos JavaScript duplicados** (core.js, game.js, renderer.js, etc.)
- **8+ archivos HTML obsoletos** (chat-memoria.html, demo-sistema-memoria.html, etc.)
- **8+ archivos CSS duplicados** (styles.css, main.css, effects.css, etc.)
- **15+ scripts de emergencia** (DIAGNOSTICO-COMPLETO.js, REPARACION-AUTOMATICA.js, etc.)
- **10+ archivos de documentación obsoletos** (README múltiples, SOLUCION-*.md, etc.)

### ✅ Sistemas Unificados:
1. **DOOM-UNIFICADO.js** - Motor principal que incluye:
   - Core del juego
   - Sistema de input
   - Renderizado raycasting
   - Lógica de jugador
   - Gestión de estado

2. **Sistemas auxiliares optimizados**:
   - learning-memory.js (protección IA)
   - audio.js (sonidos)
   - *-optimized.js (balas y enemigos)

## 🎯 Cómo Jugar

### Controles:
- **WASD** - Movimiento
- **Mouse** - Rotar cámara
- **Click** - Disparar
- **F5** - Reiniciar juego

### Objetivo:
Dispara a los enemigos Noboa mientras navegas por el laberinto.

## 🛠️ Instalación y Ejecución

### Opción 1: Servidor Local Simple
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

### Opción 2: Abrir Directamente
- Abrir `index.html` en cualquier navegador moderno
- Chrome, Firefox, Safari, Edge (todos compatibles)

## 🔧 Desarrollo y Debug

### Comandos de Consola Disponibles:
- `game.restart()` - Reiniciar juego
- `game.debug()` - Modo debug
- `audio.mute()` - Silenciar audio

### Sistemas Críticos Protegidos:
El sistema `learning-memory.js` protege automáticamente los componentes críticos del juego.

## 📊 Métricas de Optimización

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Archivos totales** | ~80 | ~15 | 85% reducción |
| **Archivos JS** | ~45 | ~7 | 84% reducción |
| **Archivos CSS** | ~9 | ~1 | 89% reducción |
| **Archivos HTML** | ~8 | ~1 | 87% reducción |
| **Documentación** | ~15 | ~1 | 93% reducción |
| **Funcionalidad** | 100% | 100% | ✅ Preservada |

## 🎨 Características Técnicas

### Motor de Juego:
- **Raycasting** para renderizado pseudo-3D
- **Canvas 2D** para gráficos
- **JavaScript puro** (sin dependencias externas)
- **Sistema de memoria IA** para auto-protección

### Compatibilidad:
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ Móviles (táctil adaptativo)

## 🐛 Resolución de Problemas

### Problemas Comunes:
1. **Pantalla en blanco**: Verificar consola del navegador
2. **No se mueve**: Verificar que el canvas tiene foco
3. **Sin sonido**: Verificar permisos de audio del navegador

### Auto-reparación:
El sistema incluye mecanismos de auto-reparación que se activan automáticamente.

## 👨‍💻 Desarrolladores

**Samy y Álex**
- 📧 Contacto: A través del repositorio
- 🎯 Proyecto: Práctica de programación de juegos
- 📅 Fecha: Junio 2025

## 🎉 ¡Resultados!

✨ **Proyecto completamente limpio y optimizado**  
🚀 **85% menos código, 100% de funcionalidad**  
🛡️ **Sistemas críticos protegidos por IA**  
🎮 **Experiencia de juego mejorada**  

¡Disfruta del juego! 🎯
