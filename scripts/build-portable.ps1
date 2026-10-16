$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$tempOut = Join-Path $env:TEMP 'easyboard-build'

Write-Host "1. Building frontend and electron main..." -ForegroundColor Cyan
& npm run build

Write-Host "2. Building portable executable in isolated temp directory..." -ForegroundColor Cyan
if (Test-Path $tempOut) {
    try { Remove-Item -Recurse -Force $tempOut -ErrorAction SilentlyContinue } catch {}
}
& npx electron-builder --win --config.directories.output="$tempOut"

$distApp = Join-Path $projectRoot 'dist-app'
if (-not (Test-Path $distApp)) { New-Item -ItemType Directory -Path $distApp -Force | Out-Null }

Write-Host "3. Copying generated portable executable to dist-app..." -ForegroundColor Cyan
$exes = Get-ChildItem -Path $tempOut -Filter "EasyBoard*.exe"
foreach ($exe in $exes) {
    Copy-Item $exe.FullName -Destination (Join-Path $distApp $exe.Name) -Force
    Write-Host "[SUCCESS] Portable executable generated: $(Join-Path $distApp $exe.Name)" -ForegroundColor Green
}
