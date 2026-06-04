---
step: "13"
name: "Publicação no Instagram"
type: agent
agent: publisher
tasks:
  - validate-publish
depends_on: step-12
---

# Step 13: Paula Post — Publicação no Instagram

## Para o Pipeline Runner

Executar a task validate-publish da Paula Post para publicar o carrossel no Instagram.

**ATENÇÃO: Este step só é executado após aprovação explícita do usuário no Step 11.**

## Inputs para este Step

- `output/slides/rendered/manifest.json` → lista de imagens prontas para upload
- `output/carousel-draft.md` → legenda final e hashtags
- `output/review-final.md` → confirmação de aprovação da qualidade (se Step 12 foi executado)
- `skills/instagram-publisher/SKILL.md` → protocolo de publicação

## Expected Outputs

- `output/publish-report.md` → relatório completo da publicação com URL do post

## Execution Mode

- **Modo:** Inline
- **Skills:** instagram-publisher (principal), sem outras skills

## Quality Gate

Antes de iniciar o processo de publicação:
- [ ] manifest.json tem ready_to_publish: true
- [ ] Aprovação do usuário no Step 11 foi registrada
- [ ] Se Step 12 foi executado: review-final.md tem veredicto APPROVE

Se qualquer gate falhar, PARAR e reportar ao usuário. Nunca publicar sem todos os gates passando.

## Após a Publicação

### Sucesso:
```
🎉 Carrossel publicado no Instagram!

📱 URL do post: https://www.instagram.com/p/[id]/
⏰ Publicado em: YYYY-MM-DD HH:MM (horário de Brasília)
📊 Slides publicados: N

O relatório completo está salvo em output/publish-report.md.

Quer criar um novo carrossel?
```

### Falha:
```
❌ Falha na publicação.

Erro: [mensagem exata da API]
Causa provável: [análise]
O que fazer agora: [próximo passo específico]

Os arquivos estão salvos em output/ e podem ser publicados
manualmente ou após corrigir o problema.
```

## Post-Execution: Memory Update

Após publicação bem-sucedida, registrar em `_memory/memories.md`:
- Data e título do carrossel publicado
- Notícia fonte + ângulo utilizado
- Score da revisão (se Step 12 foi executado)
- URL do post
- Observações sobre o que funcionou bem
