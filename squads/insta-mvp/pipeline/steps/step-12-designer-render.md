---
execution: inline
agent: designer
inputFile: squads/insta-mvp/output/carousel-draft.md
outputFile: squads/insta-mvp/output/images/
format: instagram-feed
---

# Step 12: Renderizar carrossel (Diana)

## Context Loading

- `squads/insta-mvp/output/{run_id}/carousel-draft.md` — slides (copy)
- `squads/insta-mvp/output/{run_id}/slides/slide-01.html` — **se existir:** capa criada pelo Carlos Capa (step 11b); usar e **não** regerar a capa; gerar apenas slides 2..N.
- `squads/insta-mvp/output/{run_id}/cover-meta.md` — opcional: mascote_escolhido e justificativa da capa.
- `squads/insta-mvp/output/{run_id}/design-review.md` — **se existir e verdict = REJECT:** lista de slides a refazer (slides_to_redo) e correction_brief; refazer apenas esses slides e manter os demais; depois regerar JPEGs e o step 12b será executado de novo
- `squads/insta-mvp/pipeline/data/design-reference-profiles.md` — **obrigatório:** (1) links de posts e, se existir, o carrossel de referência em 12 lâminas; (2) `squads/insta-mvp/pipeline/data/reference-carousel-hyeser-laminas.md` — descrição do design de cada lâmina para consulta de padrões; (3) perfis hyeser, rafaelkiso, pedrosobral, agenciadebolso__, thiagofinch; (4) padrão visual sintetizado. Alinhar o design às lâminas descritas e às imagens de referência (assets), depois aos perfis.
- `_opensquad/core/best-practices/image-design.md` (referência)
- `_opensquad/_memory/company.md` — cores/marca se disponível
- `squads/insta-mvp/pipeline/data/brand-mvp-flow-colors.md` — **obrigatório:** paleta branco, preto, roxo.
- `squads/insta-mvp/pipeline/data/design-system-carousel-instagram.md` — **obrigatório:** hierarquia em 4 níveis, camadas (z-index), elementos por tipo (CAPA / CONTEÚDO / FECHAMENTO), badge pill, número decorativo atrás do título, seta orgânica, um box de destaque por slide, dots bottom.
- `squads/insta-mvp/pipeline/data/mascote-reference-guide.md` — **para capa/fechamento:** guia para escolher a imagem do mascote por reação (estressado, alegre, perplexo, nervoso, analítico, pensativo, surpreso); analisar título, ângulo, tom e CTA e retornar mascote_escolhido + onde (capa/fechamento).
- `squads/insta-mvp/pipeline/data/mascote-references/` — imagens nomeadas por reação: mascote_estressado.png, mascote_alegre.png, mascote_perplexo.png, mascote_nervoso.png, mascote_analitico.png, mascote_pensativo.png, mascote_surpreso.png.
- `squads/insta-mvp/agents/designer.agent.md` e tarefa render-carousel

## Instructions

1. **Se existir** `output/{run_id}/design-review.md` com **verdict: REJECT:** ler `slides_to_redo` e `correction_brief`. Refazer **apenas** os slides cujo número está em slides_to_redo, conforme correction_brief; manter os demais slides e imagens. Depois regerar JPEGs dos slides refeitos e seguir para o step 12b (revisão visual) novamente.
2. Carregar **design-reference-profiles.md** e pesquisar (web_search ou similar) os perfis de referência para entender estilo visual (cores, tipografia, layout de carrossel). Definir design system alinhado a esse estilo.
3. **Capa (slide 1):** Se existir `output/{run_id}/slides/slide-01.html` (criado no step 11b pelo Carlos Capa), **usar esse arquivo** e não regerar a capa. Caso contrário, gerar a capa na tarefa render-carousel (com mascote e degradê conforme guia).
4. Carregar slides do carousel-draft (formato + conteúdo de cada slide). Para **fechamento** (e capa só se não houver slide-01 do step 11b): ler `mascote-reference-guide.md` se for usar mascote; escolher imagem em `mascote-references/` conforme o guia.
5. Executar agente **Diana Design**: tarefa render-carousel. **Se slide-01.html já existir:** gerar apenas slide-02.html … slide-N.html; senão, gerar todos. Design system consistente; Playwright para screenshot. Se design-review.md (REJECT) existir, refazer só os slides em slides_to_redo conforme correction_brief.
6. Renderizar **todos** os HTML (01..N) para JPEG em `squads/insta-mvp/output/{run_id}/images/01.jpg` … `0N.jpg`.
7. Entregar lista de caminhos e design_system. O step 14 (publish) usará essas imagens e a legenda de caption-final.md.

## Output Format

Lista de paths das imagens; design_system (cores, fonte). Imagens em JPEG, 1080x1440.

## Veto Conditions

- Falha se alguma imagem não for 1080x1440 ou texto ilegível.
- Falha se número de imagens ≠ número de slides.

## Quality Criteria

- [ ] Todas as imagens em output/{run_id}/images/; formato adequado para instagram-publisher (JPEG, 2–10 imagens).
