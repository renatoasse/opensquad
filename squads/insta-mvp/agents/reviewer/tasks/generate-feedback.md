---
task: "Gerar feedback"
order: 2
input: |
  - scores: output da tarefa score-content
  - content: carrossel + legenda
output: |
  - verdict: APPROVE | REJECT
  - required_changes: lista de correções obrigatórias (se REJECT)
  - suggestions: melhorias não bloqueantes
  - summary: um parágrafo
---

# Gerar feedback

Com base nas notas e nos critérios, emitir veredito (APPROVE se média ≥ 7 e nenhum critério < 4; REJECT caso contrário), listar mudanças obrigatórias (para REJECT) e sugestões opcionais. Incluir um resumo em um parágrafo.

## Process

1. Ler scores e content.
2. Aplicar regra: APPROVE se overall ≥ 7 e nenhum score < 4; senão REJECT.
3. Para REJECT: listar required_changes com critério, problema e como corrigir.
4. Listar suggestions (melhorias que não bloqueiam aprovação).
5. Escrever summary (um parágrafo); em APPROVE, destacar um ponto forte; em REJECT, destacar o que mais impacta.
6. Entregar verdict, required_changes, suggestions, summary.

## Output Format

```yaml
verdict: APPROVE | REJECT
required_changes: []
suggestions: []
summary: "..."
```

## Quality Criteria

- [ ] verdict coerente com scores (regra 7 e 4).
- [ ] required_changes acionáveis (onde, o quê, como).
- [ ] summary claro e curto.

## Veto Conditions

Rejeitar se: (1) verdict APPROVE com algum score < 4; (2) REJECT sem required_changes quando há scores < 7.
