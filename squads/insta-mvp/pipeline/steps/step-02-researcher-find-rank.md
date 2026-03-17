---
execution: subagent
agent: researcher
inputFile: squads/insta-mvp/pipeline/data/research-focus.md
outputFile: squads/insta-mvp/output/research-ranking.md
model_tier: fast
format: instagram-feed
---

# Step 02: Pesquisa e ranqueamento

## Context Loading

- `squads/insta-mvp/pipeline/data/research-focus.md` — tema e janela de tempo
- `squads/insta-mvp/pipeline/data/research-brief.md` — referência de domínio
- `squads/insta-mvp/agents/researcher.agent.md` — persona e tarefas

## Instructions

1. Carregar research-focus.md (foco e janela).
2. Executar agente **Pedro Pesquisa**: tarefa find-news (web_search/web_fetch), depois rank-stories.
3. Gravar output em `squads/insta-mvp/output/{run_id}/research-ranking.md` (ou path definido no pipeline para este run).
4. O ranking (top 5–7 notícias) será usado no checkpoint step-03 para o usuário escolher uma notícia.

## Output Format

O agente researcher entrega YAML com `ranking:` (lista de itens com rank, title, source, date, url, relevance, rank_reason). Salvar esse conteúdo no outputFile substituindo `{run_id}` pelo run_id do pipeline.

## Veto Conditions

- Falha se research-focus.md estiver vazio ou inválido.
- Falha se o agente não entregar pelo menos 5 itens ranqueados.

## Quality Criteria

- [ ] Output gravado no path correto com run_id.
- [ ] Ranking utilizável no próximo step (checkpoint news-selection).
