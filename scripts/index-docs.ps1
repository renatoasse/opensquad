# OpenSquad — Index .md files into Open Notebook
param(
    [string]$ProjectDir = (Split-Path $PSScriptRoot),
    [string]$NotebookName = "OpenSquad Docs",
    [string]$ApiUrl = "http://localhost:5055"
)

Write-Host "`n  📚 Indexing docs into Open Notebook...`n" -ForegroundColor Cyan

# Check API
try {
    Invoke-WebRequest -Uri "$ApiUrl/health" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop | Out-Null
} catch {
    Write-Host "  ❌ Open Notebook not reachable at $ApiUrl" -ForegroundColor Red
    Write-Host "  Run '.\scripts\start.ps1' first.`n" -ForegroundColor Yellow
    exit 1
}

# Create notebook
$body = @{ name = $NotebookName; description = "OpenSquad documentation — auto-indexed" } | ConvertTo-Json
try {
    $notebook = Invoke-RestMethod -Uri "$ApiUrl/api/notebooks" -Method Post -Body $body -ContentType "application/json"
    $notebookId = $notebook.id
    Write-Host "  ✅ Notebook: $NotebookName ($notebookId)" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Could not create notebook (may already exist)" -ForegroundColor Yellow
    $notebooks = Invoke-RestMethod -Uri "$ApiUrl/api/notebooks" -Method Get
    $existing = $notebooks | Where-Object { $_.name -eq $NotebookName } | Select-Object -First 1
    if ($existing) {
        $notebookId = $existing.id
        Write-Host "  Using existing: $notebookId" -ForegroundColor DarkGray
    } else {
        Write-Host "  ❌ Failed to create or find notebook" -ForegroundColor Red
        exit 1
    }
}

# Find .md files
$mdFiles = Get-ChildItem -Path $ProjectDir -Filter "*.md" -Recurse |
    Where-Object { $_.FullName -notmatch "(node_modules|\.git[/\\]|\.opensquad-services|surreal_data|notebook_data)" }

Write-Host "  Found $($mdFiles.Count) .md files`n" -ForegroundColor Yellow

$indexed = 0
$skipped = 0
$failed = 0

foreach ($file in $mdFiles) {
    $relativePath = $file.FullName.Substring($ProjectDir.Length + 1).Replace('\', '/')
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue

    $maxSize = 100MB
    if ($file.Length -gt $maxSize) {
        $skipped++
        continue
    }

    if (-not $content -or $content.Length -lt 100) {
        $skipped++
        continue
    }

    $sourceBody = @{
        notebook_id = $notebookId
        content = $content
        title = $relativePath
        source_type = "text"
    } | ConvertTo-Json -Depth 3 -EscapeHandling EscapeNonAscii

    try {
        Invoke-RestMethod -Uri "$ApiUrl/api/sources" -Method Post -Body $sourceBody -ContentType "application/json" | Out-Null
        $sizeKB = [math]::Round($file.Length / 1024, 1)
        Write-Host "  ✅ $relativePath ($sizeKB KB)" -ForegroundColor Green
        $indexed++
    } catch {
        Write-Host "  ❌ $relativePath — $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`n  ════════════════════════════════════════" -ForegroundColor Green
Write-Host "  Indexed: $indexed | Skipped: $skipped | Failed: $failed" -ForegroundColor White
Write-Host "  ════════════════════════════════════════`n" -ForegroundColor Green
Write-Host "  Embeddings will be generated automatically by Open Notebook."
Write-Host "  Check progress at: http://localhost:8502`n"
