---
task: "Validate and Publish"
order: 1
input:
  - manifest: output/slides/rendered/manifest.json
  - carousel_draft: output/carousel-draft.md (para ler a legenda final)
  - review_final: output/review-final.md (confirmar que passou pela revisão)
  - instagram_publisher_skill: skills/instagram-publisher/SKILL.md
output:
  - publish_report: Relatório de publicação com URL do post em output/publish-report.md
  - post_url: URL do post publicado no Instagram
---

# Validate and Publish

Valida todos os requisitos técnicos antes de publicar e executa a publicação no Instagram via a skill instagram-publisher. Nunca publica sem confirmação explícita do usuário.

## Process

1. **Ler a skill instagram-publisher.** Carregar `skills/instagram-publisher/SKILL.md` e entender o protocolo EXATO de chamada. Seguir as instruções da skill ao pé da letra.

2. **Confirmar que o conteúdo foi aprovado.** Ler output/review-final.md e verificar que o veredicto é "APPROVE". Se não houver arquivo de review ou o veredicto for "REJECT", PARAR e reportar — nunca publicar conteúdo não aprovado.

3. **Ler o manifest.json.** Carregar output/slides/rendered/manifest.json. Verificar:
   - ready_to_publish: true?
   - slide_count: entre 2 e 10?
   - Nenhum arquivo com tamanho acima de 30MB?
   - Todos os slides com status "OK"?

4. **Ler a legenda do carousel-draft.md.** Extrair a legenda otimizada completa. Verificar:
   - Abaixo de 2.200 caracteres?
   - Hashtags no final (não no meio do texto)?
   - Abertura forte nos primeiros 125 caracteres?

5. **Apresentar preview completo ao usuário.** ANTES de qualquer publish:
   - Listar todas as imagens com dimensões e tamanho
   - Mostrar as primeiras 200 chars da legenda
   - Mostrar os hashtags
   - Mostrar contagem de slides
   - Aguardar confirmação explícita: "confirmar publicação" ou equivalente

6. **Executar a publicação via instagram-publisher skill.** Após confirmação do usuário:
   - Seguir o protocolo da skill para upload dos containers individuais
   - Montar o container de carrossel
   - Publicar o container
   - Capturar a URL e ID do post

7. **Reportar resultado.** Sucesso ou falha, sempre com detalhes completos.

## confirmation_gate

**NUNCA executar o passo 6 sem ter recebido confirmação explícita do usuário no passo 5.**

Exemplos de confirmação válida:
- "confirma"
- "pode publicar"
- "yes"
- "publicar"
- "vai lá"

Exemplos de NÃO confirmação:
- Silêncio/ausência de resposta
- "ok" (ambíguo — pedir esclarecimento)
- "quase" / "acho que sim" (pedir confirmação firme)

## Instagram Graph API Requirements (2025)

| Requisito | Valor | Status Check |
|-----------|-------|-------------|
| Formato | JPEG ou PNG | Verificar no manifest |
| Slides por carrossel | 2-10 | Verificar no manifest |
| Caption máximo | 2.200 chars | Contar chars na legenda |
| Hashtags recomendados | 5-8 | Contar hashtags |
| Tamanho máximo/arquivo | 30MB | Verificar no manifest |
| Aspect ratio | Consistente em todos | Verificar no manifest |
| ⚠️ API Objects (2025) | Usar IG User, IG Media (não os legados) | Garantir na skill |

## Output Format

Salvar em `output/publish-report.md`:

```markdown
# Publish Report — [Título do Carrossel]
**Publisher:** Paula Post
**Data:** YYYY-MM-DD HH:MM (horário de Brasília)
**Status:** SUCCESS ✅ | FAILED ❌

## Post Details
- **Post URL:** https://www.instagram.com/p/[post_id]/
- **Post ID:** [id]
- **Account:** @[handle]
- **Publicado em:** YYYY-MM-DD HH:MM BRT

## Content Published
- Slides: X imagens
- Caption length: X caracteres
- Hashtags: [lista]

## Validation Summary
- [ ] Aprovado pela Vera Veredito: SIM
- [ ] Manifest ready_to_publish: SIM
- [ ] Specs Instagram validadas: SIM
- [ ] Confirmação do usuário recebida: SIM

## Error Log (se FAILED)
- Erro: [mensagem exata]
- Causa provável: [análise]
- Próximo passo sugerido: [ação]
```

## Quality Criteria for This Task

- [ ] Review final lido e veredicto APPROVE confirmado ANTES de qualquer publish
- [ ] Preview apresentado ao usuário com confirmação recebida ANTES do publish
- [ ] Publish report inclui URL real do post (não placeholder)
- [ ] Em caso de falha, erro reportado com detalhes suficientes para diagnóstico

## Error Handling

| Erro | Ação |
|------|------|
| ready_to_publish: false no manifest | Parar e alertar — não publicar |
| Caption acima de 2.200 chars | Truncar apenas com aprovação do usuário |
| Erro 400 da API (formato inválido) | Verificar specs do manifest, sugerir reconversão |
| Erro 401 (autenticação) | Alertar sobre token expirado — não tentar novamente sem novo token |
| Erro de aspect ratio | Verificar se 1080×1440 foi aceito; sugerir reconversão para 1080×1350px |
