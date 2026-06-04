---
step: "04"
name: "Geração de Ângulos"
type: agent
agent: copywriter
tasks:
  - generate-angles
depends_on: step-03
---

# Step 04: Carlos Carrossel — Geração de Ângulos Virais

## Para o Pipeline Runner

Executar a task generate-angles do Carlos Carrossel.

O Copywriter lê a notícia selecionada, extrai os insights mais fortes e gera **exatamente 5 ângulos virais distintos** para o carrossel.

## Inputs para este Step

- `output/selected-story.yaml` → notícia escolhida pelo usuário (URL e contexto)
- `pipeline/data/domain-framework.md` → framework de ângulos e construção de carrossel
- `_opensquad/_memory/company.md` → contexto da empresa e público-alvo
- `pipeline/data/tone-of-voice.md` → tom de voz aprovado

## Expected Outputs

- `output/insights-brief.yaml` → fatos e tensão central extraídos da notícia
- `output/angles-brief.yaml` → 5 ângulos virais distintos com hook rascunho e estrutura

## Execution Mode

- **Modo:** Subagente
- **Skills permitidas:** web_search, web_fetch (para acessar e ler a notícia selecionada)

## Quality Gate

Antes de avançar para o Step 05, verificar:
- [ ] insights-brief.yaml existe com `core_tension` preenchido
- [ ] angles-brief.yaml existe com exatamente 5 ângulos
- [ ] Cada ângulo tem: title, type, hook_draft, slide_structure, strength, weakness
- [ ] Os 5 ângulos são claramente distintos entre si (não variações da mesma ideia)
- [ ] Pelo menos um ângulo usa um dado numérico verificável no hook_draft

Se qualquer verificação falhar, solicitar que Carlos Carrossel refaça a task específica.
