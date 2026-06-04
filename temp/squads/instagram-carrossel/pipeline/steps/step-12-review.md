---
step: "12"
name: "Revisão de Qualidade"
type: agent
agent: reviewer
optional: true
tasks:
  - score-content
  - generate-feedback
depends_on: step-11
---

# Step 12: Vera Veredito — Revisão de Qualidade (Opcional)

## Para o Pipeline Runner

Este step é **opcional**. Executar apenas se não foi pulado pelo usuário ou pelo sistema.

Executar as duas tasks da Vera Veredito em sequência:

1. **score-content**: Avalia copy e visual usando a rubrica de qualidade, com scroll-stop test em peso 1.5×
2. **generate-feedback**: Consolida o score em feedback acionável e emite o veredicto (APPROVE ou REJECT)

## Inputs para este Step

- `output/carousel-draft.md` → copy final para revisão
- `output/slides/rendered/*.png` → imagens renderizadas para revisão visual
- `pipeline/data/quality-criteria.md` → rubrica de critérios com pesos
- `pipeline/data/tone-of-voice.md` → guia de tom para avaliar brand voice
- `pipeline/data/anti-patterns.md` → checklist de anti-padrões a verificar

## Expected Outputs

- `output/review-score.md` → notas por critério e média ponderada
- `output/review-final.md` → veredicto final + feedback acionável

## Execution Mode

- **Modo:** Inline
- **Skills:** Nenhuma

## Quality Gate

Antes de avançar para o Step 13:
- [ ] review-final.md existe
- [ ] Veredicto está claramente declarado como APPROVE ou REJECT

### Se APPROVE:
- Avançar para Step 13 (Publicação)

### Se REJECT:
- Analisar as Rejection Instructions em review-final.md
- Se problemas de copy → retornar ao Step 06 com instruções específicas
- Se problemas visuais → retornar ao Step 10 com instruções específicas
- Após correções, retornar ao Step 12 para nova revisão
