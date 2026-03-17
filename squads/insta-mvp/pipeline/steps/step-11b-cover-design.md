---
execution: inline
agent: cover-designer
inputFile: squads/insta-mvp/output/{run_id}/carousel-draft.md
outputFile: squads/insta-mvp/output/{run_id}/slides/slide-01.html
---

# Step 11b: Criar capa do carrossel (Carlos Capa)

## Context Loading

- `squads/insta-mvp/output/{run_id}/carousel-draft.md` — título da capa, micro-copy, ângulo, tom, accent keywords (slide 1)
- `squads/insta-mvp/pipeline/data/design-system-carousel-instagram.md` — **obrigatório:** seção CAPA (elementos, hierarquia, camadas)
- `squads/insta-mvp/pipeline/data/design-system-carousel-cover.md` — **obrigatório:** medidas em %, tipografia em px, mascote como fundo, degradê, posicionamento
- `squads/insta-mvp/pipeline/data/brand-mvp-flow-colors.md` — **obrigatório:** paleta MVP Flow
- `squads/insta-mvp/pipeline/data/mascote-reference-guide.md` — escolha do mascote por contexto
- `squads/insta-mvp/pipeline/data/mascote-references/` — imagens do mascote (mascote_estressado.png, mascote_alegre.png, etc.)
- `squads/insta-mvp/agents/cover-designer.agent.md` e tarefa design-cover

## Instructions

1. Carregar o carousel-draft (slide 1: título, tema, ângulo, tom, palavras-chave).
2. Executar agente **Carlos Capa**: tarefa design-cover. O agente deve **ao início** aplicar os padrões e regras de design-system-carousel-instagram.md (CAPA) e design-system-carousel-cover.md (medidas, mascote, degradê). Criar capa **chamativa** com:
   - Mascote escolhido como fundo (via guia de mascotes).
   - Degradê sutil por cima do mascote para facilitar a legibilidade dos textos.
   - Mascote posicionado de forma que **não seja cortado** e **não atrapalhe** a leitura (zona de texto livre).
   - Todos os elementos obrigatórios: badge pill, nav →, micro-copy, título, badge secundário, anotação manuscrita, dots.
3. Salvar `slide-01.html` em `squads/insta-mvp/output/{run_id}/slides/slide-01.html`.
4. Salvar metadado (mascote_escolhido, justificativa) em `output/{run_id}/cover-meta.md` ou em comentário no HTML.
5. Entregar o path do HTML e do metadado. O step 12 (Diana) usará esse slide-01 e gerará apenas os slides 2..N; em seguida renderizará todos para JPEG.

## Output Format

- `output/{run_id}/slides/slide-01.html` — HTML self-contained, 1080×1440.
- `output/{run_id}/cover-meta.md` (opcional) — mascote_escolhido, justificativa.

## Veto Conditions

- Falha se slide-01.html não for gerado ou não contiver degradê sobre o mascote.
- Falha se o título ou micro-copy ficar ilegível por falta de overlay.

## Quality Criteria

- [ ] Capa segue medidas e hierarquia do design-system-carousel-cover.md.
- [ ] Mascote em fundo com degradê; texto legível; mascote não cortado nem atrapalhando leitura.
