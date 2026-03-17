---
execution: inline
agent: design-reviewer
inputFile: squads/insta-mvp/output/{run_id}/images/
outputFile: squads/insta-mvp/output/{run_id}/design-review.md
on_reject: step-12-designer-render
---

# Step 12b: Revisão visual do carrossel (Vicente Visual)

## Context Loading

- `squads/insta-mvp/output/{run_id}/images/` — imagens 01.jpg … 0N.jpg (geradas no step 12)
- `squads/insta-mvp/pipeline/data/design-system-carousel-instagram.md` — **obrigatório:** critérios de hierarquia, camadas, CAPA/CONTEÚDO/FECHAMENTO, box único, dots, número atrás do título
- `squads/insta-mvp/pipeline/data/brand-mvp-flow-colors.md` — **obrigatório:** paleta e tipografia MVP Flow
- `squads/insta-mvp/agents/design-reviewer.agent.md` e tarefa review-carousel-visual

## Instructions

1. Listar as imagens em output/{run_id}/images/ (01.jpg … 0N.jpg).
2. Executar agente **Vicente Visual**: tarefa review-carousel-visual. Passar os caminhos das imagens, design-system e brand. O agente deve **visualizar cada imagem** e avaliar contra o sistema de design (sobreposição sem sentido, leitura difícil, violações de regras).
3. Vicente escreve `squads/insta-mvp/output/{run_id}/design-review.md` com:
   - **verdict:** APPROVE | REJECT
   - **slides_to_redo:** array de números dos slides a refazer (só se REJECT)
   - **reasons:** motivo por slide
   - **correction_brief:** texto para a Diana corrigir
4. Se **APPROVE:** seguir para step 13 (publish-approval).
5. Se **REJECT:** o runner aplica `on_reject: step-12-designer-render`. Voltar ao step 12 passando o design-review.md; a Diana deve ler esse arquivo e **refazer apenas os slides listados em slides_to_redo** conforme correction_brief, mantendo os demais; depois regerar JPEGs e o step 12b será executado novamente. Limite de ciclos (ex.: 2) conforme runner; após isso, escalar para o usuário.

## Output Format

Arquivo design-review.md no run. Conteúdo estruturado (YAML ou markdown) com verdict, slides_to_redo, reasons, correction_brief.

## Veto Conditions

- Falha se não houver imagens em output/{run_id}/images/.
- Falha se o agente não conseguir avaliar (ex.: arquivos inacessíveis).

## Quality Criteria

- [ ] Todas as imagens do carrossel avaliadas contra o design system.
- [ ] REJECT só quando houver slides com sobreposição sem sentido, leitura difícil ou violação clara de regras.
- [ ] correction_brief acionável para a Diana.
