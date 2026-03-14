# OpenSquad Services — Health Check
Write-Host "`n  🏥 Health Check`n" -ForegroundColor Cyan

$servicesDir = Join-Path $PSScriptRoot ".." ".opensquad-services"
$configPath = Join-Path $servicesDir "config.json"

$services = @(
    @{ Name = "SurrealDB";        Url = "http://localhost:8000/health" },
    @{ Name = "Open Notebook API"; Url = "http://localhost:5055/health" },
    @{ Name = "Open Notebook UI";  Url = "http://localhost:8502" }
)

# Add LM Studio only if enabled in config
if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
    if ($config.lmStudio -eq $true) {
        $services += @{ Name = "LM Studio API"; Url = "http://localhost:1234/v1/models"; Optional = $true }
    }
}

foreach ($svc in $services) {
    try {
        $r = Invoke-WebRequest -Uri $svc.Url -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        if ($r.StatusCode -le 299) {
            Write-Host "  [UP]   $($svc.Name)" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] $($svc.Name) — HTTP $($r.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        if ($svc.Optional) {
            Write-Host "  [DOWN] $($svc.Name) — optional" -ForegroundColor DarkGray
        } else {
            Write-Host "  [DOWN] $($svc.Name)" -ForegroundColor Red
        }
    }
}

Write-Host ""
try {
    docker ps --filter "label=com.docker.compose.project" --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}" 2>&1 |
        ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
} catch {
    Write-Host "  Docker not available" -ForegroundColor DarkGray
}
Write-Host ""
