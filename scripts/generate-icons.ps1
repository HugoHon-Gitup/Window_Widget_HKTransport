$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$sourcePath = 'C:\Users\hugoh\.gemini\antigravity\brain\30fada1b-8105-413b-8b4f-0f116472e760\.user_uploaded\media_1792132758718_be7533d9.png'
if (-not (Test-Path $sourcePath)) {
    throw "Source image not found at $sourcePath"
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$publicDir = Join-Path $projectRoot 'public'
$buildDir = Join-Path $projectRoot 'build'
$distDir = Join-Path $projectRoot 'dist'
$srcAssetsDir = Join-Path $projectRoot 'src\assets'

if (-not (Test-Path $publicDir)) { New-Item -ItemType Directory -Path $publicDir -Force | Out-Null }
if (-not (Test-Path $buildDir)) { New-Item -ItemType Directory -Path $buildDir -Force | Out-Null }
if (-not (Test-Path $distDir)) { New-Item -ItemType Directory -Path $distDir -Force | Out-Null }
if (-not (Test-Path $srcAssetsDir)) { New-Item -ItemType Directory -Path $srcAssetsDir -Force | Out-Null }

Write-Host "Loading source image..."
$srcBmp = [System.Drawing.Bitmap]::FromFile($sourcePath)

$cropX = 300
$cropY = 70
$cropSize = 424
$radius = 94.0

# 1. Create a transparent bitmap of size 424x424 with squircle clipping path
$squircleBmp = New-Object System.Drawing.Bitmap($cropSize, $cropSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($squircleBmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.Clear([System.Drawing.Color]::Transparent)

# Create rounded rectangle path for squircle
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$d = $radius * 2.0
$rect = New-Object System.Drawing.RectangleF(0, 0, $cropSize, $cropSize)

$path.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
$path.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
$path.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90)
$path.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
$path.CloseFigure()

$g.SetClip($path)
$srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropSize, $cropSize)
$destRect = New-Object System.Drawing.Rectangle(0, 0, $cropSize, $cropSize)
$g.DrawImage($srcBmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.ResetClip()
$g.Dispose()
$srcBmp.Dispose()

# Helper to resize bitmap
function Resize-Bitmap($source, $targetWidth, $targetHeight) {
    $target = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($target)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.DrawImage($source, 0, 0, $targetWidth, $targetHeight)
    $graphics.Dispose()
    return $target
}

# Helper to save bitmap to PNG byte array
function Convert-ToPngBytes($bmp) {
    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $bytes = $ms.ToArray()
    $ms.Dispose()
    return $bytes
}

# 2. Generate PNG images of various sizes
$sizes = @(256, 128, 64, 48, 32, 16)
$pngDataMap = @{}

foreach ($s in $sizes) {
    $resized = Resize-Bitmap $squircleBmp $s $s
    $bytes = Convert-ToPngBytes $resized
    $pngDataMap[$s] = $bytes
    
    if ($s -eq 256) {
        $resized.Save((Join-Path $publicDir 'icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
        $resized.Save((Join-Path $distDir 'icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
        $resized.Save((Join-Path $srcAssetsDir 'icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Host "Saved 256x256 PNG to public/icon.png, dist/icon.png, and src/assets/icon.png"
    } elseif ($s -eq 32) {
        $resized.Save((Join-Path $publicDir 'icon-32.png'), [System.Drawing.Imaging.ImageFormat]::Png)
        $resized.Save((Join-Path $distDir 'icon-32.png'), [System.Drawing.Imaging.ImageFormat]::Png)
    } elseif ($s -eq 16) {
        $resized.Save((Join-Path $publicDir 'icon-16.png'), [System.Drawing.Imaging.ImageFormat]::Png)
        $resized.Save((Join-Path $distDir 'icon-16.png'), [System.Drawing.Imaging.ImageFormat]::Png)
    }
    $resized.Dispose()
}

$squircleBmp.Dispose()

# 3. Pack PNG images into a standard multi-resolution ICO file
function Save-IcoFile($outputPath, $sizes, $pngDataMap) {
    $fs = New-Object System.IO.FileStream($outputPath, [System.IO.FileMode]::Create)
    $bw = New-Object System.IO.BinaryWriter($fs)

    # ICONDIR
    $bw.Write([uint16]0)          # Reserved, must be 0
    $bw.Write([uint16]1)          # Resource type: 1 for icon
    $bw.Write([uint16]$sizes.Count) # Number of images

    $offset = 6 + ($sizes.Count * 16)

    # Write ICONDIRENTRY for each size
    foreach ($s in $sizes) {
        $pngBytes = $pngDataMap[$s]
        $w = if ($s -ge 256) { 0 } else { [byte]$s }
        $h = if ($s -ge 256) { 0 } else { [byte]$s }

        $bw.Write([byte]$w)                    # Width
        $bw.Write([byte]$h)                    # Height
        $bw.Write([byte]0)                     # Color count
        $bw.Write([byte]0)                     # Reserved
        $bw.Write([uint16]1)                   # Color planes
        $bw.Write([uint16]32)                  # Bits per pixel
        $bw.Write([uint32]$pngBytes.Length)    # Image data size
        $bw.Write([uint32]$offset)             # Offset to image data
        $offset += $pngBytes.Length
    }

    # Write Image Data (PNG streams)
    foreach ($s in $sizes) {
        $pngBytes = $pngDataMap[$s]
        $bw.Write($pngBytes, 0, $pngBytes.Length)
    }

    $bw.Flush()
    $bw.Close()
    $fs.Close()
}

Save-IcoFile (Join-Path $buildDir 'icon.ico') $sizes $pngDataMap
Save-IcoFile (Join-Path $publicDir 'icon.ico') $sizes $pngDataMap
Save-IcoFile (Join-Path $publicDir 'favicon.ico') $sizes $pngDataMap
Save-IcoFile (Join-Path $distDir 'icon.ico') $sizes $pngDataMap

Write-Host "Successfully generated icon.ico in build/, public/, and dist/!" -ForegroundColor Green

