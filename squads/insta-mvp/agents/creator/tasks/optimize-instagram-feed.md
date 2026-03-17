---
task: "Otimizar carrossel e legenda"
order: 3
input: |
  - carousel_draft: output da tarefa create-instagram-feed
  - quality_criteria: pipeline/data/quality-criteria.md
output: |
  - slides: versão revisada dos slides (ajustes de headline/texto se necessário)
  - caption_draft: versão revisada da legenda (ainda sem hashtags)
---

# Otimizar carrossel e legenda

Revisar o rascunho do carrossel e da legenda contra os critérios de qualidade: hierarquia, 40–80 palavras por slide, gancho nos 125 caracteres, CTA claro, triangulação. Ajustar apenas o necessário; não reescrever do zero sem motivo.

## Process

1. Ler carousel_draft e quality_criteria.
2. Verificar cada slide: headline + supporting text, contagem de palavras, alternância de background, CTA no último.
3. Verificar caption_draft: primeiros 125, corpo, pergunta/CTA, triangulação.
4. Aplicar correções pontuais; manter tom e ângulo.
5. Entregar slides e caption_draft revisados (sem hashtags).

## Output Format

Mesmo estrutura da tarefa create-instagram-feed: format, slides[], caption_draft.

## Quality Criteria

- [ ] Todos os critérios de quality-criteria atendidos ou justificada exceção.
- [ ] Nenhuma regressão (ex.: slide que tinha 50 palavras e passou a 30).

## Veto Conditions

Rejeitar se: (1) algum slide ficar com menos de 40 palavras sem justificativa; (2) gancho dos 125 caracteres removido ou enfraquecido.
