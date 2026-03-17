---
task: "Renderizar carrossel"
order: 1
input: |
  - slides: copy dos slides (title, headline, supporting_text, photo_direction, background, accent_keywords)
  - format: nome do formato (Editorial, Listicle, etc.)
output: |
  - images: lista de caminhos das imagens (squads/insta-mvp/output/{run_id}/images/01.jpg ...)
  - design_system: cores (hex), fonte principal, viewport 1080x1440
---

# Renderizar carrossel

Transformar o copy dos slides em imagens 1080x1440 (3:4) para Instagram. Gerar um HTML self-contained por slide, aplicar design system consistente (cores, tipografia mínima Hero 58px, Heading 43px, Body 34px, Caption 24px), renderizar para JPEG e salvar em squads/insta-mvp/output/{run_id}/images/. Playwright MCP pode ser usado para renderização (navegar para HTML local, screenshot).

## Process

1. **Se existir** `squads/insta-mvp/output/{run_id}/design-review.md` com **verdict: REJECT**, ler `slides_to_redo` e `correction_brief` e refazer **apenas** esses slides conforme o briefing; manter os demais arquivos/imagens.
2. **Capa (slide 1):** Se existir `squads/insta-mvp/output/{run_id}/slides/slide-01.html` (criado pelo Carlos Capa no step 11b), **não gerar** slide-01; usar esse HTML. Caso contrário, gerar a capa (com mascote + degradê conforme design-system-carousel-cover.md e mascote-reference-guide).
3. **Fechamento (imagem do mascote):** Para o último slide (e para a capa só se não houver slide-01 do step 11b): ler `pipeline/data/mascote-reference-guide.md` e escolher uma imagem em `pipeline/data/mascote-references/` conforme o guia; usar como fundo/cutout (coluna direita ou base; não cobrir texto).
4. **Obrigatório:** Ler, **nesta ordem:** (1) `pipeline/data/design-system-instagram-regras-gerais.md` (safe zones 100px, hierarquia um ponto de entrada/máx 3 níveis/razão 1,5x, respiro 60–80px entre seções, máx 2 fontes, 60-30-10); (2) `pipeline/data/design-system-carousel-cover-USER.md` e estrutura de `pipeline/data/reference-capa-padrao-usuario.html` (para consistência com a capa: badge, headline, subtitle, dots, margens); (3) `pipeline/data/design-system-carousel-instagram.md` (hierarquia em 4 níveis, camadas z-index, CAPA/CONTEÚDO/FECHAMENTO, badge pill, número decorativo atrás do título, seta orgânica, um box por slide, dots); (4) `pipeline/data/design-reference-profiles.md`, `pipeline/data/reference-carousel-hyeser-laminas.md` e `pipeline/data/brand-mvp-flow-colors.md`. Definir design system alinhado às regras gerais, ao padrão do usuário e à paleta MVP Flow.
5. Ler slides e format; ler company context e **brand-mvp-flow-colors.md** (insta-mvp): paleta obrigatória = branco, preto, roxo + complementares; não usar laranja/azul como acento.
6. Definir design system: aplicar regras gerais (safe zones 100px, hierarquia, respiro 60–80px, máx 2 fontes, 60-30-10); cores = MVP Flow (preto #0a0a0a, branco #FFF, roxo #8B5CF6/#7C3AED, lavanda #A78BFA, fundo claro #FAFAFA); fonte Sora ou par display+funcional (conforme reference-capa-padrao-usuario quando possível); viewport 1080x1440; refletir design-system-carousel-cover-USER e identidade MVP Flow.
7. **Gerar HTMLs:** Se slide-01.html já existir (step 11b), gerar apenas slide-02.html … slide-N.html; senão, gerar slide-01.html … slide-N.html. Inline CSS; body 1080x1440; **respeitar safe zone** (conteúdo crítico fora da margem 100px); alternar backgrounds conforme copy; no fechamento (e na capa só se a Diana estiver gerando a capa), incluir mascote quando disponível em mascote-references/.
8. Renderizar **todos** os HTML (01..N) em imagem (Playwright screenshot 1080x1440).
9. Salvar como 01.jpg … 0N.jpg em squads/insta-mvp/output/{run_id}/images/.
10. Entregar lista de caminhos e design_system.

## Output Format

```yaml
images:
  - squads/insta-mvp/output/{run_id}/images/01.jpg
  - ...
design_system:
  primary_color: "#..."
  viewport: "1080x1440"
  font: "..."
```

## Quality Criteria

- [ ] Todas as imagens 1080x1440; JPEG.
- [ ] Texto legível; tamanhos mínimos respeitados; contraste WCAG AA.
- [ ] Número de imagens = número de slides; ordem preservada.

## Veto Conditions

Rejeitar se: (1) texto ilegível ou cortado; (2) número de imagens diferente do número de slides; (3) dimensões erradas.
