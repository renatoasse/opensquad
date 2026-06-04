---
task: "Render and Export"
order: 3
input:
  - slide_html_files: output/slides/slide-0*.html (todos os arquivos HTML gerados)
  - image_creator_skill: skills/image-creator/SKILL.md
output:
  - rendered_images: Imagens PNG renderizadas de cada slide em output/slides/rendered/
  - export_manifest: output/slides/rendered/manifest.json com lista de imagens prontas
---

# Render and Export

Renderiza todos os slides HTML como imagens PNG usando a skill image-creator via Playwright. Verifica cada imagem renderizada e produz o manifesto final pronto para o Publisher.

## Process

1. **Ler a skill image-creator.** Carregar `skills/image-creator/SKILL.md` para entender o protocolo exato de chamada. Seguir as instruções da skill ao pé da letra.

2. **Criar diretório de output.** Garantir que `output/slides/rendered/` existe. Se não existir, criar.

3. **Renderizar slide 1 primeiro.** Chamar a skill image-creator para renderizar `output/slides/slide-01.html` → `output/slides/rendered/slide-01.png`. 
   - Verificar o resultado visualmente após o primeiro render
   - Confirmar: dimensões corretas (1080×1440), texto legível, sem overflow
   - Se houver problema, identificar a causa no HTML e corrigir antes de continuar

4. **Renderizar todos os slides em sequência.** Após confirmar que o slide 1 está correto, renderizar todos os demais:
   - slide-02.html → slide-02.png
   - slide-03.html → slide-03.png
   - ... (todos os slides)

5. **Verificação de qualidade do batch.** Para cada imagem renderizada:
   - Arquivo existe e não está corrompido?
   - Dimensões: 1080×1440px?
   - Tamanho do arquivo: abaixo de 30MB (limite da API Instagram)?
   - Visualmente: texto legível, sem elementos cortados?

6. **Gerar manifest.json.** Criar o arquivo de manifesto que o Publisher vai ler para executar o upload.

## Manifest Format

Salvar em `output/slides/rendered/manifest.json`:

```json
{
  "carousel_title": "[Título do carrossel]",
  "render_date": "YYYY-MM-DD",
  "slide_count": 7,
  "format": "PNG",
  "dimensions": "1080x1440px",
  "aspect_ratio": "3:4",
  "total_size_mb": 12.4,
  "slides": [
    {
      "order": 1,
      "filename": "slide-01.png",
      "path": "output/slides/rendered/slide-01.png",
      "size_kb": 1240,
      "status": "OK"
    },
    {
      "order": 2,
      "filename": "slide-02.png",
      "path": "output/slides/rendered/slide-02.png",
      "size_kb": 980,
      "status": "OK"
    }
  ],
  "caption_path": "output/carousel-draft.md",
  "ready_to_publish": true,
  "notes": ""
}
```

## Critical Notes

1. **A skill image-creator é o mecanismo de rendering.** Ler e seguir EXATAMENTE o protocolo descrito em `skills/image-creator/SKILL.md`. Não tentar fazer rendering de outra forma.

2. **O slide 1 é a validação antes do batch.** Um erro sistêmico (como falta de fonte ou overflow de container) vai aparecer no slide 1. Corrigi-lo antes de renderizar os demais economiza tempo.

3. **Arquivo acima de 30MB é erro crítico para o Publisher.** Se qualquer slide PNG estiver acima de 30MB, reportar imediatamente — a API do Instagram rejeita o upload.

4. **⚠️ Atenção ao aspect ratio para a API:*** O formato 1080×1440px (3:4) pode precisar ser validado contra o Instagram Graph API. Se o Publisher reportar problema de aspect ratio, informar que o slide pode precisar ser reexportado em 1080×1350px (4:5). Registrar este ponto no campo "notes" do manifest.

## Quality Criteria

- [ ] Todos os slides renderizados com dimensões corretas
- [ ] Nenhum arquivo de slide acima de 30MB
- [ ] Manifest.json gerado com lista completa e status de cada slide
- [ ] ready_to_publish: true somente se TODOS os slides passaram na verificação
- [ ] Slide 1 verificado visualmente antes do batch completo

## Error Handling

| Erro | Ação |
|------|------|
| Fonte não carregada (texto sistema) | Verificar @import no HTML, corrigir e rerenderizar |
| Texto fora do container | Corrigir CSS do slide problemático e rerenderizar |
| Arquivo acima de 30MB | Comprimir ou converter para JPEG antes de continuar |
| Render falha completamente | Verificar se Playwright/image-creator está disponível |
