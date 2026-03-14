# OpenSquad Services — Start
Write-Host "`n  🚀 Starting OpenSquad Services...`n" -ForegroundColor Green

$servicesDir = Join-Path $PSScriptRoot ".." ".opensquad-services"

if (-not (Test-Path (Join-Path $servicesDir "docker-compose.yml"))) {
    Write-Host "  ❌ docker-compose.yml not found. Run 'npx opensquad init' first." -ForegroundColor Red
    exit 1
}

# Check Docker
try { docker info 2>&1 | Out-Null } catch {
    Write-Host "  ❌ Docker not running. Start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Start containers
Write-Host "  Starting Open Notebook + SurrealDB..." -ForegroundColor Cyan
docker compose -f (Join-Path $servicesDir "docker-compose.yml") up -d

# Health check with retry
Write-Host "  Waiting for services..." -ForegroundColor Yellow
$maxWait = 30
$elapsed = 0
$ready = $false

while ($elapsed -lt $maxWait -and -not $ready) {
    Start-Sleep -Seconds 3
    $elapsed += 3
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:5055/health" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        if ($r.StatusCode -le 299) { $ready = $true }
    } catch {}
    Write-Host "  ⏳ $elapsed/$maxWait`s..." -ForegroundColor DarkGray
}

if ($ready) {
    Write-Host "`n  ✅ Services running!" -ForegroundColor Green
} else {
    Write-Host "`n  ⚠️  Still starting... check in 10s" -ForegroundColor Yellow
}

# LM Studio check (only if enabled in config)
$configPath = Join-Path $servicesDir "config.json"
$lmEnabled = $false
if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
    $lmEnabled = $config.lmStudio -eq $true
}

if ($lmEnabled) {
    try {
        Invoke-WebRequest -Uri "http://localhost:1234/v1/models" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop | Out-Null
        Write-Host "  ✅ LM Studio: UP (port 1234)" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  LM Studio: not detected — start with: lms daemon up" -ForegroundColor Yellow
    }
}

Write-Host "`n  📋 Endpoints:" -ForegroundColor Cyan
Write-Host "     Open Notebook UI:  http://localhost:8502"
Write-Host "     Open Notebook API: http://localhost:5055"
Write-Host "     SurrealDB:         http://localhost:8000"
if ($lmEnabled) {
    Write-Host "     LM Studio:         http://localhost:1234"
}
Write-Host ""
