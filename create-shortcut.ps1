$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$desktop = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop '上車易 EasyBoard.lnk'
$vbsPath = Join-Path $scriptDir 'run-widget.vbs'
$customIcon = Join-Path $scriptDir 'public\icon.ico'
$buildIcon = Join-Path $scriptDir 'build\icon.ico'
$fallbackIcon = Join-Path $scriptDir 'node_modules\electron\dist\electron.exe'
$iconPath = if (Test-Path $customIcon) { $customIcon } elseif (Test-Path $buildIcon) { $buildIcon } else { $fallbackIcon }

$ws = New-Object -ComObject WScript.Shell
$shortcut = $ws.CreateShortcut($shortcutPath)
$shortcut.TargetPath = 'wscript.exe'
$shortcut.Arguments = "`"$vbsPath`""
$shortcut.WorkingDirectory = $scriptDir
if (Test-Path $iconPath) {
    $shortcut.IconLocation = "$iconPath,0"
}
$shortcut.Description = '上車易 EasyBoard - 香港交通小工具 (快捷鍵: Ctrl+Shift+W)'
$shortcut.Save()

Write-Host "[SUCCESS] Desktop shortcut created successfully!" -ForegroundColor Green
Write-Host "Location: $shortcutPath" -ForegroundColor Green
