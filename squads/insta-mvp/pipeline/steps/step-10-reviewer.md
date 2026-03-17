---
execution: inline
agent: reviewer
inputFile: squads/insta-mvp/output/caption-final.md
outputFile: squads/insta-mvp/output/review.md
format: instagram-feed
---

# Step 10: Revisão (Renata)

## Context Loading

- `squads/insta-mvp/output/{run_id}/carousel-draft.md` — slides
- `squads/insta-mvp/output/{run_id}/caption-final.md` — legenda final (Sérgio + Carla)
- `squads/insta-mvp/pipeline/data/quality-criteria.md`
- `squads/insta-mvp/pipeline/data/anti-patterns.md`
- `squads/insta-mvp/agents/reviewer.agent.md` e tarefas score-content, generate-feedback

## Instructions

1. Carregar carrossel (slides) e legenda final. A **legenda** foi definida por Sérgio + Carla e deve ser **revisada** por Renata junto com o restante do conteúdo.
2. Executar agente **Renata Revisão**: tarefas score-content e generate-feedback.
3. Avaliar todos os critérios de quality-criteria (carrossel + legenda); emitir APPROVE ou REJECT; listar required_changes e suggestions.
4. Gravar em `squads/insta-mvp/output/{run_id}/review.md`. No step 11 (checkpoint content-approval), o usuário vê o veredito e aprova ou pede correção (volta para Carla/Sérgio conforme necessário).

## Output Format

Veredito, scores, required_changes, suggestions, summary. Em REJECT, o pipeline pode voltar ao step 08 (Carla) ou 09 (Sérgio) conforme o tipo de correção.

## Veto Conditions

- APPROVE só se média ≥ 7 e nenhum critério &lt; 4.
- REJECT deve incluir mudanças obrigatórias acionáveis.

## Quality Criteria

- [ ] Legenda explicitamente revisada (não só os slides).
- [ ] Feedback acionável para o criador e para o SEO quando aplicável.
