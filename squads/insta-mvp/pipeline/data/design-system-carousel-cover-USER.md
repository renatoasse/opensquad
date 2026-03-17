# Especificação de capa — padrão do usuário (PRIORIDADE)

> **Carlos Capa** e **Diana Design** devem usar este documento e o exemplo em `reference-capa-padrao-usuario.html`. Regras gerais (safe zones, hierarquia, respiro, tipo, cor) em `design-system-instagram-regras-gerais.md`.

Viewport do slide final: **1080×1440** (ou 1080×1350 para 4:5). Conteúdo crítico dentro da **safe zone 1:1** (preview do feed).

---

## Referência estrutural obrigatória

- **Arquivo:** `pipeline/data/reference-capa-padrao-usuario.html`
- **Fonte:** Sora (ou equivalente moderna: peso 400, 600, 700, 800).
- **Conceitos:** Safe zone 1:1 demarcada; swipe hint no topo (fora da safe zone); conteúdo (badge + headline + subtitle) **dentro** da safe zone, alinhado ao fim inferior da zona para máximo impacto no preview.
- **Cores de exemplo:** Badge #E8253C; highlight no título #E8714A; subtítulo rgba(255,255,255,.60). Ajustar para paleta MVP Flow (roxo/lavanda) quando aplicável.
- **Background:** Fundo escuro + overlay em degradê (linear-gradient to bottom) para legibilidade. Se houver mascote, colocá-lo atrás do degradê.

---

## Medidas (viewport 1080×1440)

| Elemento              | Topo %   | Lateral   | Largura   | Observação                          |
|-----------------------|----------|-----------|-----------|-------------------------------------|
| Logo / brand          | 3–5%     | esq 5–6%  | ~30%      | Menor texto do slide                |
| Nav / swipe hint      | topo     | centro    | auto      | Swipe hint ou círculo seta →        |
| Micro-copy            | 17–20%   | centralizado | livre  | Peso 400, não bold                  |
| Headline              | 22–23%   | centralizado | 80–90% | Maior elemento                      |
| Badge pill            | 40–44%   | centralizado | auto   | Logo abaixo headline                |
| Anotação manuscrita   | 49–55%   | dir 3–5%  | 35–40%   | Coluna direita                      |
| Imagem (mascote) topo | 47–50%   | centralizado | 70–90% | Começa aqui, sangra baixo           |
| Dots                 | bottom 2–3% | centralizado | auto   | Sempre no fundo                     |

---

## Tipografia (px, card 1080×1440)

- Logo/brand: 12–14px, 700, maiúsculo.
- Micro-copy: 16–18px, 400. 25–35% do tamanho do headline.
- Headline: 52–60px (ou 72–88px se mais impacto), 800–900, line-height 1.05–1.15.
- Badge: 14–16px, 700, padding 6px 16px, border-radius 999px.
- Anotação: 16–18px, 400, cursiva/destaque.
- Dots: 6–8px, gap 4–6px; ativo branco, inativos 25–30% opacidade.

---

## Regras de proporção

- Micro-copy e headline: espaço 4–8px (bloco unido).
- Badge: máx 16px abaixo da última linha do headline (não flutua).
- Imagem/mascote nunca acima de 50% do topo (headline em zona limpa).
- Headline: padding lateral 5–8% de cada lado (80–90% largura).
- Anotação manuscrita: coluna oposta ao rosto da pessoa (se houver).

---

## Safe zone e preview 1:1

- Margem de risco: **100px** das bordas — nada crítico dentro.
- Conteúdo importante apenas **dentro** da zona segura.
- No feed, o post aparece em **1:1** antes do clique: logo e gancho devem caber nessa área central.

---

## Uso pelos agentes

- **Carlos Capa:** Ao criar slide-01.html, seguir a estrutura de `reference-capa-padrao-usuario.html` (safe zone, swipe hint, .content com badge, headline, subtitle), aplicar `design-system-instagram-regras-gerais.md` e esta tabela de medidas. Manter degradê e paleta MVP Flow quando combinável.
- **Diana Design:** Ao gerar ou redesenhar slides, usar as mesmas regras gerais e manter consistência com a capa (fontes, hierarquia, respiro, 60-30-10).
