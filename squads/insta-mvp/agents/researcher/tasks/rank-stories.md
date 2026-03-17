---
task: "Ranquear notícias"
order: 2
input: |
  - candidates: lista da tarefa find-news
output: |
  - ranking: lista ordenada (top 5–7) com título, fonte, data, url, relevance, rank_reason
---

# Ranquear notícias

A partir da lista de candidatos, ranquear por relevância para o público (alunos programação/IA, empreendedores digitais) e potencial de ângulo para carrossel. Entregar top 5–7 com justificativa curta do rank.

## Process

1. Ler o output da tarefa find-news (candidates).
2. Aplicar critérios: relevância para programação/IA/educação, clareza da notícia, potencial de hooks/ângulos (controvérsia, tutorial, lista, mito vs realidade).
3. Ordenar do mais forte para o mais fraco; manter 5–7 itens.
4. Para cada item do ranking: adicionar rank_reason (uma frase).
5. Entregar no formato definido em Output Format.

## Output Format

```yaml
ranking:
  - rank: 1
    title: "..."
    source: "..."
    date: "..."
    url: "..."
    relevance: "..."
    rank_reason: "..."
```

## Quality Criteria

- [ ] 5–7 itens; ordem consistente com os critérios.
- [ ] rank_reason presente e específico por item.
- [ ] Nenhum item sem URL ou título.

## Veto Conditions

Rejeitar se: (1) menos de 5 itens sem justificativa; (2) rank_reason vazio em algum item.
