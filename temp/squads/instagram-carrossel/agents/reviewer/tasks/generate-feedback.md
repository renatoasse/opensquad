---
task: "Generate Feedback"
order: 2
input:
  - score_report: output/review-score.md (score e veredicto da tarefa anterior)
  - carousel_draft: output/carousel-draft.md
  - rendered_slides: output/slides/rendered/*.png
output:
  - final_review: Relatório de feedback completo consolidado em output/review-final.md
  - verdict: APPROVE (entrega ao checkpoint) | REJECT (retorna ao agente certo com instruções)
---

# Generate Feedback

Consolida o score em um relatório de feedback acionável e entrega o veredicto final para o Pipeline Runner. Se APPROVE, prepara o handoff para o checkpoint. Se REJECT, produz instruções precisas para o agente correto corrigir o problema.

## Process

1. **Ler o score report.** Carregar output/review-score.md. Confirmar o veredicto e entender cada issue identificado.

2. **Condensar o feedback em formato acionável.** O feedback nunca é só "está ruim porque X" — é sempre "está ruim porque X, e para corrigir faça Y especificamente em Z". Cada issue tem um caminho claro de resolução.

3. **Identificar qual agente deve receber o feedback de rejeição.** Problemas de copy → Carlos Carrossel. Problemas visuais (HTML, design) → Davi Design. Problemas de dados/ângulos → Ângela Ângulo. Nunca redirecionar ao agente errado.

4. **Formatar o relatório final.** Combinar score + feedback em output/review-final.md.

5. **Entregar o veredicto ao Pipeline Runner.** O veredicto determina o próximo step do pipeline:
   - APPROVE → Pipeline Runner apresenta ao usuário no checkpoint de aprovação final
   - REJECT → Pipeline Runner retorna ao agente específico com as instruções de correção

## Output Format

Salvar em `output/review-final.md`:

```markdown
# Review Final — [Título do Carrossel]
**Reviewer:** Vera Veredito
**Data:** YYYY-MM-DD

## Veredicto Final: APPROVE ✅ | REJECT ❌

## Score Summary
- **Scroll-Stop Test:** X/10 (peso 1.5×)
- **Data Integrity:** X/10
- **Story Coherence:** X/10
- **Reflexão Final:** X/10
- **CTA Specificity:** X/10
- **Brand Voice:** X/10
- **Design Consistency:** X/10
- **Readability:** X/10
- **Visual Impact:** X/10
- **Média ponderada:** X.X/10

## ✅ O que está funcionando bem
- [Ponto forte específico #1]
- [Ponto forte específico #2]
- [Ponto forte específico #3]

## 🔧 Itens para corrigir (se REJECT)
### Carlos Carrossel — Correções de Copy
- **[Issue específico]**: [Onde está, o que está errado, como corrigir]

### Davi Design — Correções Visuais
- **[Issue específico]**: [Onde está, o que está errado, como corrigir]

## 📋 Aprovação Condicional (se score ≥ 7.0 com issues menores)
Se aprovado com ressalvas, listar os melhorias recomendadas (não obrigatórias):
- [Sugestão de melhoria opcional]

## Próximo Passo
- Se APPROVE → Checkpoint de aprovação final com o usuário
- Se REJECT → [Agente X] deve corrigir [itens Y] antes de nova revisão
```

## Feedback Quality Rules

1. **Strengths são obrigatórios em todo feedback.** Mesmo em rejeições. Isso é cultura de qualidade, não educação — reforçar o que funciona mantém consistência ao longo das execuções.

2. **Issues são precisos e localizáveis.** "O slide 2 tem afirmação sem fonte na linha 3 — substituir 'muitos profissionais' pelo dado exato do brief: '71% dos trabalhadores (Microsoft, 2024)'" é feedback acionável. "O texto poderia ser melhor" não é.

3. **Rejeições não são fracasso — são ciclos de melhoria.** O tom do feedback é construtivo, nunca punitivo ou passivo-agressivo.

4. **Aprovações com ressalvas são válidas.** Se o score é ≥ 7.0 mas há pontos de melhoria menores, aprovar com as sugestões documentadas como "recomendadas, não obrigatórias".

## Quality Criteria for This Task

- [ ] Relatório final consolida score + feedback em documento único e legível
- [ ] Se REJECT, instruções são específicas o suficiente para o agente corrigir sem pedir esclarecimentos
- [ ] Se REJECT, o agente correto está identificado para cada tipo de correção
- [ ] Strengths estão presentes mesmo em rejeições
- [ ] Veredicto está claramente comunicado ao Pipeline Runner como APPROVE ou REJECT
