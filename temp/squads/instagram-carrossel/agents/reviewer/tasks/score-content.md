---
task: "Score Content"
order: 1
input:
  - carousel_draft: output/carousel-draft.md (copy final otimizado)
  - rendered_slides: output/slides/rendered/*.png (imagens renderizadas)
  - quality_criteria: pipeline/data/quality-criteria.md
  - tone_guide: pipeline/data/tone-of-voice.md
  - anti_patterns: pipeline/data/anti-patterns.md
output:
  - score_report: Relatório com notas por critério e média ponderada
  - verdict: APPROVE | REJECT com justificativa
---

# Score Content

Avalia a qualidade do carrossel completo (copy + visual) usando a rubrica de critérios definida em quality-criteria.md. Entrega um score estruturado e um veredicto claro com feedback acionável.

## Process

1. **Scroll-stop test PRIMEIRO.** Antes de qualquer outro critério, abrir o slide-01.png e fazer a pergunta: "Se eu estivesse scrollando meu Instagram sem saber o que é a Sem Codar, eu pararia nesse slide?" Se a resposta for NÃO, o carrossel é REJEITADO imediatamente — escrever o feedback específico de por que o hook não funciona e o que precisa mudar.

2. **Ler o copy completo.** Ler o carousel-draft.md do início ao fim como leitor de Instagram (não como revisor). Marcar: pontos de perda de atenção, afirmações sem fonte, transições fracas, slides com texto excessivo.

3. **Verificar as imagens renderizadas.** Abrir cada PNG em output/slides/rendered/ e verificar:
   - Legibilidade em tamanho de celular (mentalmente "zoom out" para 375px width)
   - Consistência visual entre slides
   - Tratamento especial do slide de reflexão
   - Impacto do slide 1 vs slides de conteúdo

4. **Aplicar a rubrica de critérios.** Para cada critério em quality-criteria.md (C1-C6 para copy, V1-V3 para visual), atribuir uma nota de 1 a 10 com justificativa.
   - C1 (Scroll-Stop) tem peso 1.5× no cálculo final
   - Todos os outros têm peso 1.0×

5. **Calcular a média ponderada.** Formula:
   - Score ponderado = (C1×1.5 + C2×1.0 + C3×1.0 + C4×1.0 + C5×1.0 + C6×1.0 + V1×1.0 + V2×1.0 + V3×1.0) / 9.5
   - APPROVE: média ≥ 7.0 E nenhum critério < 4.0
   - REJECT: média < 7.0 OU pelo menos 1 critério < 4.0

6. **Verificar veto conditions.** Independente do score, verificar as veto conditions listadas em quality-criteria.md. Se qualquer veto condition for detectada → REJECT automático.

7. **Escrever o score report.** Salvar em output/review-score.md.

## Output Format

Salvar em `output/review-score.md`:

```markdown
# Review Score — [Título do Carrossel]
**Reviewer:** Vera Veredito
**Date:** YYYY-MM-DD
**Verdict:** APPROVE ✅ | REJECT ❌

## Scroll-Stop Test (Gate)
**Status:** PASS | FAIL
**Slide 1 análise:** [análise detalhada do hook + visual do slide 1]

## Score por Critério

| Critério | Descrição | Score | Peso | Score Ponderado | Notas |
|----------|-----------|-------|------|-----------------|-------|
| C1: Scroll-Stop | Primeiro impacto | /10 | 1.5× | | |
| C2: Data Integrity | Dados e fontes | /10 | 1.0× | | |
| C3: Story Coherence | Coerência narrativa | /10 | 1.0× | | |
| C4: Reflexão Final | Impacto emocional | /10 | 1.0× | | |
| C5: CTA Specificity | Qualidade do CTA | /10 | 1.0× | | |
| C6: Brand Voice | Tom da marca | /10 | 1.0× | | |
| V1: Design Consistency | Consistência visual | /10 | 1.0× | | |
| V2: Readability | Legibilidade | /10 | 1.0× | | |
| V3: Visual Impact | Impacto bold/colorido | /10 | 1.0× | | |

**Média ponderada:** X.X/10

## Strengths
- [O que está funcionando bem — específico, não genérico]

## Issues Found
- [Problema específico] — [Slide ou elemento afetado] — [Impacto no score]

## Veto Conditions Checked
- [ ] Slide 1 com nome da marca ou meta-apresentação: SIM/NÃO
- [ ] Afirmação factual sem evidência: SIM/NÃO
- [ ] Carrossel fora de 6-10 slides: SIM/NÃO
- [ ] Caption acima de 2.200 chars: SIM/NÃO
- [ ] HTML não renderizável: SIM/NÃO

## Final Verdict
**APPROVE ✅ / REJECT ❌**
[Justificativa em 1-3 linhas]

## Rejection Instructions (se REJECT)
Para ser aprovado, corrigir:
1. [Correção específica e acionável]
2. [Correção específica e acionável]
```

## Quality Criteria for This Task

- [ ] O scroll-stop test foi aplicado ANTES de qualquer outro critério
- [ ] Notas são honestas — nenhuma nota 9-10 sem evidência de excelência real
- [ ] Issues Found são específicos e acionáveis (não "o texto poderia ser melhor")
- [ ] Se APPROVE, o score justifica objetivamente a aprovação
- [ ] Se REJECT, as Rejection Instructions são claras e suficientes para o agente corrigir sem dúvida
