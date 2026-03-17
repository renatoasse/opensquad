---
execution: inline
agent: seo
inputFile: squads/insta-mvp/output/selected-news.md
outputFile: squads/insta-mvp/output/seo-brief.md
format: instagram-feed
---

# Step 04: Brief de SEO (triangulação + hashtags)

## Context Loading

- Notícia escolhida (do step 03): título, fonte, url, relevance — pode estar em `squads/insta-mvp/output/{run_id}/selected-news.md` ou no estado do pipeline
- `squads/insta-mvp/pipeline/data/triangulation-guide.md`
- `squads/insta-mvp/pipeline/data/hashtag-map.yaml`
- `squads/insta-mvp/agents/seo.agent.md` e tarefas triangulation-brief + build-hashtag-map

## Instructions

1. Carregar a notícia escolhida e os arquivos de triangulação e hashtag-map.
2. Executar agente **Sérgio SEO**: tarefas build-hashtag-map (se necessário) e triangulation-brief.
3. Produzir caption_brief (sugestão primeiros 125, keywords, como triangular) e hashtag_set (5–15 hashtags para este post).
4. Gravar output em `squads/insta-mvp/output/{run_id}/seo-brief.md` (ou outputFile com run_id). A Carla usará este brief no step 08.

## Output Format

YAML com caption_brief (first_125_suggestion, keywords, triangulation_instruction), hashtag_set (lista), algorithm_notes.

## Veto Conditions

- Falha se notícia escolhida não estiver disponível.
- Falha se hashtag_set tiver mais de 15 ou hashtag banido.

## Quality Criteria

- [ ] caption_brief acionável para a Carla.
- [ ] hashtag_set entre 5 e 15; mix de categorias.
