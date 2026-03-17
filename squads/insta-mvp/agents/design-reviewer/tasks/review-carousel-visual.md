---
task: "Revisar carrossel visual"
order: 1
input: |
  - images: lista de caminhos das imagens (squads/insta-mvp/output/{run_id}/images/01.jpg … 0N.jpg)
  - pipeline/data/design-system-carousel-instagram.md
  - pipeline/data/brand-mvp-flow-colors.md
output: |
  - design-review.md em output/{run_id}/ com: verdict (APPROVE | REJECT), slides_to_redo (array), reasons (por slide), correction_brief (texto para Diana)
---

# Revisar carrossel visual

Avaliar cada imagem do carrossel contra o sistema de design e a identidade de marca. Identificar sobreposições sem sentido, leitura difícil e violações de regras (hierarquia, camadas, um box por slide, dots, número atrás do título). Emitir APPROVE ou REJECT; se REJECT, listar slides a refazer com motivo e briefing de correção para a Diana.

## Process

1. Ler design-system-carousel-instagram.md e brand-mvp-flow-colors.md (critérios obrigatórios).
2. Para cada imagem em `images`: abrir/visualizar a imagem e verificar:
   - **Tipo do slide:** CAPA (1), CONTEÚDO (2…N-1), FECHAMENTO (N) — elementos obrigatórios presentes?
   - **Hierarquia:** 4 níveis visuais distintos; título sobrepõe número decorativo (número atrás).
   - **Camadas:** fundo → número → título → corpo → seta → box/badge; sem sobreposição sem sentido (ex.: texto sobre rosto, dois boxes no mesmo slide).
   - **Legibilidade:** contraste, tamanho de fonte, texto não cortado; paleta MVP Flow (branco, preto, roxo).
   - **Regras “nunca”:** número na frente do título, seta reta, mais de um box de destaque por slide, badge em posição errada por tipo.
3. Decidir verdict: APPROVE se tudo aderente e legível; REJECT se algum slide falhar.
4. Se REJECT: preencher slides_to_redo (números dos slides, ex. [2, 5]), reasons (um motivo por slide) e correction_brief (texto acionável para Diana).
5. Escrever design-review.md em squads/insta-mvp/output/{run_id}/design-review.md.

## Output Format (design-review.md)

```yaml
verdict: APPROVE | REJECT
slides_to_redo: []   # ex.: [2, 5, 7] — só se REJECT
reasons:             # só se REJECT
  "2": "número decorativo na frente do título; título não sobrepõe"
  "5": "texto do box de destaque ilegível por contraste"
correction_brief: |
  Slide 2: Garantir que o título está em z-index acima do número e o corta visualmente.
  Slide 5: Aumentar contraste do texto no box (fundo escuro + texto branco ou inversão).
```

(Em markdown, pode ser um bloco YAML no topo e correction_brief em parágrafo abaixo.)

## Quality Criteria

- [ ] Todas as imagens do run avaliadas.
- [ ] Veredito coerente com os motivos (REJECT só se houver slides_to_redo e reasons).
- [ ] correction_brief referindo regras do design system e acionável.

## Veto Conditions

Rejeitar a execução da task se: (1) lista de imagens vazia; (2) design-system ou brand docs inacessíveis.
