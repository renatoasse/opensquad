---
step: "06"
name: "Criação do Copy"
type: agent
agent: copywriter
tasks:
  - create-slides
  - optimize-copy
depends_on: step-05
---

# Step 06: Carlos Carrossel — Criação e Otimização do Copy

## Para o Pipeline Runner

Executar as duas tasks do Carlos Carrossel em sequência:

1. **create-slides**: Cria o copy completo de todos os slides (7-9 slides) + legenda completa com hashtags
2. **optimize-copy**: Revisa e otimiza o rascunho, aplica a checklist de qualidade e documenta as mudanças

## Inputs para este Step

- `output/selected-angle.yaml` → ângulo selecionado e ajustes do usuário
- `output/insights-brief.yaml` → todos os dados verificados e fontes
- `pipeline/data/tone-of-voice.md` → guia de tom aprovado com amostra de referência
- `pipeline/data/output-examples.md` → exemplos de carrosséis de qualidade de referência
- `pipeline/data/anti-patterns.md` → erros a evitar

## Expected Outputs

- `output/carousel-draft.md` → copy completo de todos os slides + legenda + optimization log

## Execution Mode

- **Modo:** Inline
- **Skills permitidas:** web_search (para verificar dados adicionais se necessário)

## Quality Gate

Antes de avançar para o Step 07, verificar:
- [ ] carousel-draft.md existe e tem todos os slides numerados
- [ ] Slide 1 tem dado específico com fonte identificável
- [ ] Existe slide de Reflexão identificado
- [ ] Caption está presente com hashtags
- [ ] Optimization log documenta as revisões feitas

Se qualquer verificação falhar, solicitar que Carlos Carrossel revise o item específico antes de prosseguir.

## Nota Especial

O Carlos Carrossel tem instrução de auto-verificar contra a quality checklist antes de entregar. Se ele concluir que há itens a corrigir internamente, deve iterar autonomamente antes de declarar a task concluída. O Pipeline Runner deve aguardar a entrega final, não o primeiro rascunho.
