# OpenSquad Services — Stop
Write-Host "`n  🛑 Stopping OpenSquad Services...`n" -ForegroundColor Red

$servicesDir = Join-Path $PSScriptRoot ".." ".opensquad-services"

if (-not (Test-Path (Join-Path $servicesDir "docker-compose.yml"))) {
    Write-Host "  ❌ No services configured." -ForegroundColor Red
    exit 1
}

docker compose -f (Join-Path $servicesDir "docker-compose.yml") down
Write-Host "`n  ✅ All services stopped.`n" -ForegroundColor Green
