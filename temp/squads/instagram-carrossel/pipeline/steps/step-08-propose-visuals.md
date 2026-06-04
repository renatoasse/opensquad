---
step: "08"
name: "Proposta Visual"
type: agent
agent: image-designer
tasks:
  - propose-visual-identities
depends_on: step-07
---

# Step 08: Davi Design — Proposta de Identidades Visuais

## Para o Pipeline Runner

Executar a task propose-visual-identities do Davi Design.

O Designer lê o copy final, entende o tom e o conteúdo, e propõe **3 identidades visuais distintas** para o carrossel. Não cria nenhum HTML ou imagem neste step — apenas define e documenta as propostas.

## Inputs para este Step

- `output/carousel-draft.md` → copy final dos slides (tom, conteúdo, momento emocional)
- `_opensquad/_memory/company.md` → contexto da empresa e direção visual aprovada
- `pipeline/data/anti-patterns.md` → padrões visuais a evitar

## Expected Outputs

- `output/visual-identities.yaml` → 3 propostas de identidade visual com paleta, tipografia, mood e preview textual

## Execution Mode

- **Modo:** Inline
- **Skills permitidas:** Nenhuma (esta task não renderiza imagens)

## Quality Gate

Antes de avançar para o Step 09, verificar:
- [ ] visual-identities.yaml existe com exatamente 3 propostas
- [ ] Cada proposta tem: name, mood, bg_color, accent_color, font_family, preview_description
- [ ] As 3 propostas são visualmente distintas entre si (não variações da mesma paleta)
- [ ] Nenhuma proposta usa paleta genérica corporate (azul claro + branco + cinza)

Se qualquer verificação falhar, solicitar que Davi Design refaça com mais distinção entre as propostas.
