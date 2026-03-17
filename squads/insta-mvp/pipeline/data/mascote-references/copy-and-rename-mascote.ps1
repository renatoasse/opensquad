# Copia as imagens do mascote da pasta de origem para mascote-references com nomes por reação.
# Uso: .\copy-and-rename-mascote.ps1 -Source "C:\caminho\para\pasta\com\as\7\imagens"
# Os arquivos podem ter nomes do Cursor (ex.: image__1_-xxx.png). O script mapeia:
#   *__1_* -> mascote_estressado.png
#   *__2_* -> mascote_alegre.png
#   *__3_* -> mascote_perplexo.png
#   *__4_* -> mascote_nervoso.png
#   *__5_* -> mascote_analitico.png
#   *__6_* -> mascote_pensativo.png
#   *cdfa9644* -> mascote_surpreso.png

param(
    [Parameter(Mandatory=$true)]
    [string]$Source
)

$Dest = $PSScriptRoot
$map = @(
    @{ pattern = '__1_'; name = 'mascote_estressado.png' },
    @{ pattern = '__2_'; name = 'mascote_alegre.png' },
    @{ pattern = '__3_'; name = 'mascote_perplexo.png' },
    @{ pattern = '__4_'; name = 'mascote_nervoso.png' },
    @{ pattern = '__5_'; name = 'mascote_analitico.png' },
    @{ pattern = '__6_'; name = 'mascote_pensativo.png' },
    @{ pattern = 'cdfa9644'; name = 'mascote_surpreso.png' }
)

$files = Get-ChildItem -Path $Source -Filter "*.png" -File -ErrorAction SilentlyContinue
if (-not $files) {
    Write-Host "Nenhum PNG encontrado em: $Source"
    exit 1
}

foreach ($m in $map) {
    $found = $files | Where-Object { $_.Name -like "*$($m.pattern)*" } | Select-Object -First 1
    if ($found) {
        Copy-Item -Path $found.FullName -Destination (Join-Path $Dest $m.name) -Force
        Write-Host "OK: $($m.name) <- $($found.Name)"
    } else {
        Write-Host "AVISO: Nenhum arquivo contendo '$($m.pattern)' em $Source"
    }
}

Write-Host "Concluído. Destino: $Dest"
