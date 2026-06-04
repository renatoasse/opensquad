---
step: "02"
name: "Pesquisa de Notícias"
type: agent
agent: researcher
tasks:
  - find-and-rank-news
depends_on: step-01
---

# Step 02: Pesquisador — Busca e Ranqueamento de Notícias

## Para o Pipeline Runner

Executar a task find-and-rank-news do Pesquisador.

O Pesquisador deve fazer **pelo menos 3 buscas** com ângulos diferentes sobre o tema e retornar as 5-7 notícias mais relevantes e interessantes, ranqueadas por potencial de engajamento.

## Inputs para este Step

- `output/research-focus.md` → tema e período definidos pelo usuário no Step 01
- `_opensquad/_memory/company.md` → contexto da empresa (público-alvo, nicho, tom)

## Expected Outputs

- `output/ranked-stories.yaml` → lista de 5-7 notícias ranqueadas com título, resumo, fonte, URL e score de potencial viral

## Execution Mode

- **Modo:** Subagente
- **Skills permitidas:** web_search, web_fetch

## Quality Gate

Antes de avançar para o Step 03, verificar:
- [ ] ranked-stories.yaml existe
- [ ] Contém entre 5 e 7 notícias
- [ ] Cada notícia tem: title, summary, source, url, date, viral_potential_score, why_interesting
- [ ] As notícias são do período solicitado pelo usuário
- [ ] Notícias estão ordenadas por viral_potential_score (decrescente)

Se qualquer verificação falhar, solicitar que o Pesquisador refaça a busca.
