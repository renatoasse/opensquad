---
execution: inline
agent: creator
inputFile: squads/insta-mvp/output/selected-news.md
outputFile: squads/insta-mvp/output/angles.md
format: instagram-feed
---

# Step 05: Gerar ângulos

## Context Loading

- Notícia escolhida (step 03)
- `squads/insta-mvp/agents/creator.agent.md` e tarefa generate-angles

## Instructions

1. Carregar a notícia escolhida.
2. Executar agente **Carla Carrossel**: tarefa generate-angles.
3. Produzir 5 ângulos (label, hook_suggestion, emotional_driver).
4. Gravar em `squads/insta-mvp/output/{run_id}/angles.md`. O checkpoint step-06 apresentará esses ângulos ao usuário para escolha.

## Output Format

YAML com angles: lista de 5 itens (label, hook_suggestion, emotional_driver).

## Veto Conditions

- Falha se não houver 5 ângulos distintos.
- Falha se hook_suggestion estiver vazio.

## Quality Criteria

- [ ] 5 ângulos; hooks utilizáveis na capa do carrossel.
