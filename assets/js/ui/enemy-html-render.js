// assets/js/ui/enemy-html-render.js
// Renderizado HTML de enemigos Noboa y debug de sprites PNG


function renderEnemiesHTML() {
  const layer = document.getElementById('enemyLayer');
  if (!layer) {
    console.warn('[ENEMY HTML] No se encontró la capa enemyLayer');
    return;
  }
  if (!window.GAME) {
    console.warn('[ENEMY HTML] window.GAME no existe');
    return;
  }
  // Usar el sistema cartesiano si existe
  let enemies = [];
  if (window.enemyPhysics && typeof window.enemyPhysics.getEnemyStates === 'function') {
    enemies = window.enemyPhysics.enemies;
  } else if (window.GAME.enemies && Array.isArray(window.GAME.enemies)) {
    enemies = window.GAME.enemies;
  }
  if (enemies.length === 0) {
    console.warn('[ENEMY HTML] No hay enemigos activos para renderizar');
  }
  // Ajustar tamaño/canvas
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    console.warn('[ENEMY HTML] No se encontró el canvas gameCanvas');
    return;
  }
  layer.style.width = canvas.width + 'px';
  layer.style.height = canvas.height + 'px';
  layer.style.position = 'absolute';
  layer.style.left = canvas.offsetLeft + 'px';
  layer.style.top = canvas.offsetTop + 'px';
  // Limpiar capa
  layer.innerHTML = '';
  // Renderizar cada enemigo activo
  let renderizados = 0;
  const player = window.GAME && window.GAME.player;
  const fov = Math.PI / 3; // 60 grados
  const canvasW = canvas.width;
  const canvasH = canvas.height;
  const size = 144; // Tamaño triplicado para todos (mantiene proporción)
  enemies.forEach((enemy, idx) => {
    if (enemy.active === false) return;
    const tipo = enemy.type || enemy.tipo || 'casual';
    const imgObj = window.GAME.enemySprites && window.GAME.enemySprites[tipo];
    if (!imgObj || !imgObj.src || !imgObj.complete || imgObj.naturalWidth === 0) return;
    if (!player) return;
    // Vector del enemigo relativo al jugador
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    // Ángulo relativo al jugador
    let angleToEnemy = Math.atan2(dy, dx);
    let relAngle = angleToEnemy - player.angle;
    while (relAngle < -Math.PI) relAngle += 2*Math.PI;
    while (relAngle > Math.PI) relAngle -= 2*Math.PI;
    if (Math.abs(relAngle) > fov/1.5) return;
    // Proyección horizontal (pantalla)
    const screenX = (canvasW/2) + Math.tan(relAngle) * (canvasW/2) / Math.tan(fov/2);
    const spriteW = size;
    const spriteH = size;
    // Proyección vertical: simula la altura del suelo en el canvas
    let floorY = canvasH - (canvasH * 0.18);
    const screenY = floorY - spriteH - (enemy.z || 0);
    if (screenX < -spriteW || screenX > canvasW+spriteW) return;
    // Borde rojo para depuración
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = (screenX - spriteW/2) + 'px';
    div.style.top = screenY + 'px';
    div.style.width = spriteW + 'px';
    div.style.height = spriteH + 'px';
    div.style.border = '3px solid red';
    div.style.zIndex = '9';
    layer.appendChild(div);
    const img = document.createElement('img');
    img.src = imgObj.src;
    img.alt = tipo;
    img.style.position = 'absolute';
    img.style.left = (screenX - spriteW/2) + 'px';
    img.style.top = screenY + 'px';
    img.style.width = spriteW + 'px';
    img.style.height = spriteH + 'px';
    img.style.objectFit = 'contain';
    img.style.pointerEvents = 'none';
    img.style.zIndex = '10';
    layer.appendChild(img);
    renderizados++;
  });
  if (renderizados === 0) {
    console.warn('[ENEMY HTML] Ningún enemigo fue renderizado en HTML');
  } else {
    console.log(`[ENEMY HTML] Renderizados ${renderizados} enemigos en HTML`);
  }
}

// Hook al bucle principal para renderizar enemigos HTML
document.addEventListener('DOMContentLoaded', function() {
  const oldRender3D = window.render3D;
  window.render3D = function() {
    if (typeof oldRender3D === 'function') oldRender3D();
    renderEnemiesHTML();
  };

  // Botón debug para reinicializar enemigos desde el menú principal
  var btn = document.getElementById('respawnEnemiesBtn');
  if (btn) {
    btn.addEventListener('click', function() {
      if (window.doomGame && typeof window.doomGame.initEnemies === 'function') {
        window.doomGame.initEnemies();
        alert('Enemigos reinicializados (DEBUG)');
      } else {
        alert('No se pudo reinicializar enemigos. ¿El motor está cargado?');
      }
    });
  }

  // Botón debug para verificar sprites PNG
  var btnSprites = document.getElementById('checkSpritesBtn');
  if (btnSprites) {
    btnSprites.addEventListener('click', function() {
      if (window.GAME && window.GAME.enemySprites) {
        let resumen = '=== DIAGNÓSTICO DE SPRITES PNG ===\n';
        let errores = 0;
        let pendientes = 0;
        let ok = 0;
        const tipos = ['casual','deportivo','presidencial'];
        tipos.forEach(function(tipo) {
          var img = window.GAME.enemySprites[tipo];
          if (!img) {
            resumen += `❌ Sprite no existe en memoria: ${tipo}\n`;
            errores++;
            return;
          }
          resumen += `Sprite ${tipo}: src = ${img.src}\n`;
          if (img.complete) {
            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
              resumen += `✅ Cargado correctamente: ${img.naturalWidth}x${img.naturalHeight}\n`;
              ok++;
            } else {
              resumen += `❌ Error: Sprite no cargado o corrupto (naturalWidth=0)\n`;
              errores++;
            }
          } else {
            resumen += `⏳ Sprite aún no ha terminado de cargar\n`;
            pendientes++;
          }
        });
        // Diagnóstico HTTP extra
        tipos.forEach(function(tipo) {
          var img = window.GAME.enemySprites[tipo];
          if (img && (!img.complete || img.naturalWidth === 0)) {
            fetch(img.src, {method:'HEAD'}).then(resp => {
              if (!resp.ok) {
                console.error(`❌ HTTP ERROR al cargar ${tipo}:`, resp.status, resp.statusText, img.src);
              } else {
                console.log(`HTTP OK para ${tipo}:`, img.src);
              }
            }).catch(err => {
              console.error(`❌ Error de red al intentar HEAD para ${tipo}:`, err);
            });
          }
        });
        // Mostrar resumen en pantalla
        let mensaje = resumen + '\n';
        if (errores > 0) {
          mensaje += '⚠️ Hay sprites que no cargaron.\n';
          mensaje += 'Causas comunes: ruta incorrecta, archivo faltante, permisos, error de red, extensión PNG inválida.\n';
          mensaje += 'Abre la consola para ver detalles HTTP y errores exactos.\n';
        } else if (pendientes > 0) {
          mensaje += '⏳ Hay sprites aún cargando. Espera unos segundos y vuelve a probar.\n';
        } else {
          mensaje += '✅ Todos los sprites PNG cargaron correctamente.\n';
        }
        alert(mensaje);
        console.log(resumen);
      } else {
        alert('Sprites no inicializados. Inicia el juego primero.');
      }
    });
  }
});
