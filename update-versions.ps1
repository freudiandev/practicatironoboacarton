# Script de PowerShell para actualizar versiones automáticamente
# Actualiza todas las referencias a archivos CSS, JS y PNG con una nueva versión

Write-Host "🚀 === ACTUALIZADOR DE VERSIONES AUTOMÁTICO ===" -ForegroundColor Green
Write-Host ""

# Generar nueva versión basada en timestamp
$version = Get-Date -Format "yyyyMMddHHmmss"
Write-Host "🔄 Generando nueva versión: $version" -ForegroundColor Yellow

# Función para actualizar versiones en un archivo
function Update-FileVersions {
    param($filePath)
    
    if (-not (Test-Path $filePath)) {
        Write-Host "⚠️  Archivo no encontrado: $filePath" -ForegroundColor Yellow
        return 0
    }
    
    Write-Host "📝 Actualizando: $filePath" -ForegroundColor Cyan
    
    try {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        $changes = 0
        
        # Actualizar referencias a CSS
        $newContent = $content -replace '\.css\?v=\d+', ".css?v=$version"
        if ($newContent -ne $content) {
            $changes += ($content.Split('.css?v=') | Measure-Object).Count - 1
            $content = $newContent
        }
        
        # Actualizar referencias a JS
        $newContent = $content -replace '\.js\?v=\d+', ".js?v=$version"
        if ($newContent -ne $content) {
            $changes += ($content.Split('.js?v=') | Measure-Object).Count - 1
            $content = $newContent
        }
        
        # Actualizar referencias a PNG
        $newContent = $content -replace '\.png\?v=\d+', ".png?v=$version"
        if ($newContent -ne $content) {
            $changes += ($content.Split('.png?v=') | Measure-Object).Count - 1
            $content = $newContent
        }
        
        # Actualizar variable global de versión
        $newContent = $content -replace "window\.__ASSET_VERSION__\s*=\s*['\x22`]\d+['\x22`]", "window.__ASSET_VERSION__ = '$version'"
        if ($newContent -ne $content) {
            $changes++
            $content = $newContent
        }
        
        # Escribir archivo actualizado
        Set-Content $filePath -Value $content -Encoding UTF8
        Write-Host "   ✅ $changes referencias actualizadas" -ForegroundColor Green
        
        return $changes
    }
    catch {
        Write-Host "   ❌ Error actualizando $filePath : $($_.Exception.Message)" -ForegroundColor Red
        return 0
    }
}

# Función para listar archivos del proyecto
function Get-ProjectFiles {
    Write-Host "📂 Escaneando archivos del proyecto..." -ForegroundColor Cyan
    
    $cssFiles = Get-ChildItem -Path . -Filter "*.css" -Recurse | Where-Object { $_.FullName -notlike "*node_modules*" } | ForEach-Object { $_.Name }
    $jsFiles = Get-ChildItem -Path . -Filter "*.js" -Recurse | Where-Object { $_.FullName -notlike "*node_modules*" -and $_.Name -ne "update-versions.js" } | ForEach-Object { $_.Name }
    
    Write-Host "   CSS encontrados: $($cssFiles.Count)" -ForegroundColor White
    $cssFiles | ForEach-Object { Write-Host "     - $_" -ForegroundColor Gray }
    
    Write-Host "   JS encontrados: $($jsFiles.Count)" -ForegroundColor White  
    $jsFiles | ForEach-Object { Write-Host "     - $_" -ForegroundColor Gray }
    
    Write-Host ""
}

# EJECUCIÓN PRINCIPAL
Get-ProjectFiles

Write-Host "🔄 Iniciando actualización con versión: $version" -ForegroundColor Yellow
Write-Host ""

# Archivos a actualizar
$filesToUpdate = @("index.html")
$totalChanges = 0

foreach ($file in $filesToUpdate) {
    $totalChanges += Update-FileVersions $file
}

Write-Host ""
Write-Host "✅ === ACTUALIZACIÓN COMPLETADA ===" -ForegroundColor Green
Write-Host "📊 Total de cambios: $totalChanges" -ForegroundColor White
Write-Host "🔖 Nueva versión: $version" -ForegroundColor White
Write-Host ""
Write-Host "💡 Los navegadores ahora cargarán las versiones más recientes de todos los archivos." -ForegroundColor Cyan

# Crear archivo de información de versión
$versionInfo = @{
    version = $version
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    totalChanges = $totalChanges
} | ConvertTo-Json -Depth 2

Set-Content "version-info.json" -Value $versionInfo -Encoding UTF8
Write-Host "📄 Información de versión guardada en: version-info.json" -ForegroundColor Gray

Write-Host ""
Write-Host "🎯 Para usar este script:" -ForegroundColor Yellow
Write-Host "   PowerShell: .\update-versions.ps1" -ForegroundColor White
Write-Host "   O hacer doble clic en update-versions.bat" -ForegroundColor White

# Pausa si se ejecuta haciendo doble clic
if ($Host.Name -eq "ConsoleHost") {
    Write-Host ""
    Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
