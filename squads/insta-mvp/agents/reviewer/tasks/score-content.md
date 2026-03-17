---
task: "Pontuar conteúdo"
order: 1
input: |
  - content: carrossel (slides) + legenda final (texto + hashtags)
  - pipeline/data/quality-criteria.md
output: |
  - scores: critério -> nota (1-10) + justificativa
  - overall: média numérica
---

# Pontuar conteúdo

Avaliar carrossel e legenda contra cada critério em quality-criteria.md. Atribuir nota de 1 a 10 e justificativa por critério; calcular média geral.

## Process

1. Ler content (slides + legenda final) e quality-criteria.md.
2. Para cada critério listado: dar nota 1–10 e uma frase de justificativa.
3. Calcular overall = média das notas.
4. Entregar scores e overall no formato definido.

## Output Format

```yaml
scores:
  - criterion: "..."
    score: 8
    justification: "..."
overall: 7.5
```

## Quality Criteria

- [ ] Todos os critérios de quality-criteria cobertos.
- [ ] Justificativa não vazia para nenhum critério.
- [ ] overall coerente com as notas individuais.

## Veto Conditions

Rejeitar se: (1) algum critério faltando; (2) justificativa vazia; (3) overall não bater com a média.
