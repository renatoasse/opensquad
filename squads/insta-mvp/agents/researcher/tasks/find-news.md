---
task: "Encontrar notícias"
order: 1
input: |
  - research-focus: tema e janela de tempo (pipeline/data/research-focus.md)
output: |
  - candidates: lista de notícias/trends com título, fonte, data, URL, 1 linha de relevância
---

# Encontrar notícias

Buscar na web notícias e tendências em programação e IA conforme o foco definido no checkpoint. Entregar lista de candidatos com fonte, data e relevância em uma linha.

## Process

1. Ler `pipeline/data/research-focus.md` (tema e janela: 24h, 7 dias, mês, sem restrição).
2. Fazer buscas amplas (ex.: tema + "2025", tema + "tendência", tema + "notícia") com web_search/web_fetch.
3. Para cada resultado relevante: anotar título, URL, data de publicação, fonte e uma frase sobre por que é útil para um carrossel (público: alunos de programação/IA e empreendedores digitais).
4. Filtrar: preferir fontes com autoria e data; descartar duplicados e irrelevantes.
5. Montar lista de até 12 candidatos no formato definido em Output Format.

## Output Format

```yaml
candidates:
  - title: "..."
    source: "..."
    date: "YYYY-MM-DD ou s/d"
    url: "..."
    relevance: "Uma frase."
```

## Output Example

```yaml
candidates:
  - title: "OpenAI anuncia novo modelo para devs"
    source: "TechCrunch"
    date: "2025-03-10"
    url: "https://..."
    relevance: "Direto para quem usa IA no código no dia a dia."
  - title: "Python 3.13: o que muda para iniciantes"
    source: "Blog oficial Python"
    date: "2025-03-08"
    url: "https://..."
    relevance: "Educacional; bom para lista ou tutorial."
```

## Quality Criteria

- [ ] Cada item tem título, fonte, data (ou "s/d"), URL e relevance.
- [ ] No máximo 12 itens; janela de tempo respeitada.
- [ ] Linguagem objetiva; sem hype.

## Veto Conditions

Rejeitar e refazer se: (1) mais da metade dos itens sem data ou fonte identificável; (2) tema do foco não coberto pela lista.
