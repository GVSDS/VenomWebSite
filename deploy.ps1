# VenomWebSite deploy script: build and sync dist to production dir (TempLate/Venom)
#
# IMPORTANT: keep this file pure ASCII. PS 5.1 parses BOM-less UTF-8 files
# using the ANSI codepage, so non-ASCII text would be garbled.
#
# Usage:
#   1. Clean old artifacts (dist and TempLate/Venom) so no stale hashes remain
#   2. Full rebuild (vue-tsc type check + vite build)
#   3. Sync dist to TempLate/Venom (index.html + assets)
#   4. Verify TempLate/Venom matches dist exactly
#
#   Run:  .\deploy.ps1
#   (if execution policy blocks:  Set-ExecutionPolicy -Scope Process Bypass)

$ErrorActionPreference = 'Stop'

$ProjectRoot   = Split-Path -Parent $MyInvocation.MyCommand.Path
$DistDir       = Join-Path $ProjectRoot 'dist'
$ProdRoot      = Join-Path (Split-Path -Parent $ProjectRoot) 'TempLate\Venom'
$ProdAssetsDir = Join-Path $ProdRoot 'assets'
$IndexHtml     = Join-Path $ProdRoot 'index.html'

Write-Host "`n===== VENOM DEPLOY START =====" -ForegroundColor Cyan
Write-Host "Project dir : $ProjectRoot"
Write-Host "Prod dir    : $ProdRoot"
Write-Host ""

# 1. Clean old artifacts
Write-Host '[1/4] Cleaning old build artifacts...' -ForegroundColor Yellow
if (Test-Path $DistDir) {
    Remove-Item -Recurse -Force $DistDir
    Write-Host "  removed: $DistDir"
}
if (Test-Path $ProdAssetsDir) {
    Remove-Item -Recurse -Force $ProdAssetsDir
    Write-Host "  removed: $ProdAssetsDir"
}
if (Test-Path $IndexHtml) {
    Remove-Item -Force $IndexHtml
    Write-Host "  removed: $IndexHtml"
}
Write-Host ''

# 2. Full build (vue-tsc type check + vite build)
Write-Host '[2/4] Running npm run build (type check + full build)...' -ForegroundColor Yellow
Push-Location $ProjectRoot
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed, exit code = $LASTEXITCODE"
    }
} finally {
    Pop-Location
}
Write-Host '  Build OK'
Write-Host ''

# 3. Sync artifacts to prod dir
Write-Host '[3/4] Syncing artifacts to prod dir...' -ForegroundColor Yellow
if (-not (Test-Path $ProdRoot)) {
    New-Item -ItemType Directory -Path $ProdRoot -Force | Out-Null
}
Copy-Item -Recurse -Force (Join-Path $DistDir '*') $ProdRoot
Write-Host '  Sync done'
Write-Host ''

# 4. Verify prod dir matches dist (file name sets)
Write-Host '[4/4] Verifying artifact consistency...' -ForegroundColor Yellow
function Get-AssetNames([string]$dir) {
    if (-not (Test-Path $dir)) { return @() }
    return @(Get-ChildItem -Path $dir -Recurse -File | ForEach-Object { $_.FullName.Substring($dir.Length) })
}
$distNames = Get-AssetNames (Join-Path $DistDir 'assets')
$prodNames = Get-AssetNames $ProdAssetsDir
$distSet   = @($distNames | Sort-Object -Unique)
$prodSet   = @($prodNames | Sort-Object -Unique)

$onlyDist = @($distSet | Where-Object { $_ -notin $prodSet })
$onlyProd = @($prodSet | Where-Object { $_ -notin $distSet })

if ($onlyDist.Count -eq 0 -and $onlyProd.Count -eq 0) {
    Write-Host "  OK: $($distSet.Count) assets, prod matches dist exactly" -ForegroundColor Green
} else {
    Write-Host '  MISMATCH:' -ForegroundColor Red
    if ($onlyDist.Count) { Write-Host "    only in dist: $onlyDist" -ForegroundColor Red }
    if ($onlyProd.Count) { Write-Host "    only in prod: $onlyProd" -ForegroundColor Red }
    throw 'Artifact verification failed!'
}

# Verify the entry JS referenced by index.html exists
$indexContent = Get-Content $IndexHtml -Raw
$entryMatch = [regex]::Match($indexContent, 'src="([^"]+\.js)"')
if ($entryMatch.Success) {
    $entryPath = Join-Path $ProdRoot ($entryMatch.Groups[1].Value.TrimStart('/'))
    if (Test-Path $entryPath) {
        Write-Host "  entry JS OK: $($entryMatch.Groups[1].Value)" -ForegroundColor Green
    } else {
        throw "index.html entry JS not found: $entryPath"
    }
} else {
    throw 'No entry JS reference found in index.html'
}

Write-Host ''
Write-Host "===== VENOM DEPLOY DONE =====" -ForegroundColor Cyan
Write-Host 'Please hard-refresh the browser (Ctrl+F5) to load the new build.' -ForegroundColor Cyan
