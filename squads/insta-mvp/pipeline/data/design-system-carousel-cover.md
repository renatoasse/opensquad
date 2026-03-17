# SISTEMA DE DESIGN — CAPA DO CARROSSEL (Slide 1)

> Documento exclusivo para o agente de capa. Use em conjunto com design-system-carousel-instagram.md (seção CAPA) e brand-mvp-flow-colors.md.

---

## OBJETIVO DA CAPA

Criar uma capa **chamativa** que pare o scroll: hierarquia clara, texto legível e um único ponto de tensão visual. A capa usa **mascote como fundo** + **degradê sutil** para garantir leitura.

---

## REGRAS OBRIGATÓRIAS DO SISTEMA GERAL (resumo)

- **4 níveis** de peso visual (decorativo → título → corpo → labels). Nunca dois no mesmo nível.
- **Camadas (z-index):** fundo → imagem (mascote) → degradê overlay → título → micro-copy/badge → nav → dots.
- **Elementos da CAPA:** badge/pill top-left, ícone navegação top-right, micro-copy, título, badge secundário sobre o título, anotação manuscrita, imagem (mascote), dots bottom-center.
- **Paleta MVP Flow:** preto #0a0a0a, branco #FFF, roxo #7C3AED, lavanda #A78BFA. Badge com contraste máximo (roxo ou preto; texto branco ou escuro conforme fundo).
- **Tipografia do carrossel (usar na capa):** A capa usa **a mesma** tipografia escolhida para o carrossel (ex.: Permanent Marker para impacto). Na capa, **alternar** título e subtítulo entre duas fontes:
  - **Fonte tipográfica do carrossel** (ex.: Permanent Marker) — para um dos blocos (título OU micro-copy/subtítulo).
  - **Fonte clara e sem serifa** (ex.: Inter) — para o outro bloco.
  - Regra: nunca os dois com a mesma fonte; sempre um em “marker”/impacto e o outro em sans-serif legível. Ex.: título = Permanent Marker, micro-copy = Inter; ou título = Inter, anotação manuscrita = Permanent Marker. Palavras-chave com underline e/ou círculo (border-radius pill).

---

## MASCOTE COMO FUNDO DA CAPA

1. **Escolha do mascote:** Usar o guia `mascote-reference-guide.md` e o título/ângulo/tom do carrossel para escolher uma imagem em `mascote-references/` (ex.: mascote_alegre.png, mascote_estressado.png).
2. **Posicionamento do mascote:**
   - O mascote é a **camada de fundo** (ou logo acima do fundo sólido). Deve aparecer **inteiro** ou em enquadramento que **não o corte** de forma estranha (evitar cortar cabeça ou expressão).
   - Posicionar de forma que **não atrapalhe a leitura**: texto (título, micro-copy, badge, anotação) deve ficar em zonas de boa legibilidade. Preferir mascote deslocado para **coluna direita** ou **base** do card, deixando a **esquerda e o centro-superior** livres para título e micro-copy.
   - A **face do mascote** não deve ficar por baixo do título principal; se o mascote estiver à direita, o título ocupa a esquerda; se o mascote estiver na base, o título fica acima.
3. **Degradê sobre o mascote (obrigatório):**
   - Aplicar um **overlay em degradê** por cima da imagem do mascote para garantir **legibilidade dos textos**. Ex.: `linear-gradient(to bottom, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.4) 45%, rgba(10,10,10,0.7) 100%)` ou similar, escurecendo a área onde ficam título e micro-copy.
   - O degradê deve ser **sutil** (não apagar o mascote), mas **suficiente** para que branco e roxo sobre ele tenham contraste legível (WCAG AA).
4. **Ordem das camadas (z-index):**
   - Camada 1: fundo sólido (ex. #0a0a0a).
   - Camada 2: imagem do mascote (background-image ou `<img>` com object-fit cover/contain e posicionamento que não corte o mascote).
   - Camada 3: degradê (div com gradient, position absolute, full width/height).
   - Camadas 4–7: conforme sistema geral (título, micro-copy, badge, nav, dots).

---

## MEDIDAS EXATAS — CAPA (% da altura/largura do slide)

Viewport do card: **1080×1440** (3:4). Proporções em relação ao tamanho total (100% × 100%).

```
ELEMENTO              TOPO %    LATERAL %       LARGURA %   OBSERVAÇÃO
──────────────────────────────────────────────────────────────────────────
Logo / brand          3–5%      esq 5–6%        ~30%        Menor texto do slide
Nav arrow             3–5%      dir 4–6%        ~8%         Círculo outline
Micro-copy            17–20%    centralizado    livre       Peso regular, não bold
Headline (bloco)      22–23%    centralizado    80–90%      Maior elemento
Badge pill            40–44%    centralizado    auto        Logo abaixo headline
Anotação manuscrita   49–55%    dir 3–5%        35–40%      Coluna direita
Imagem mascote (topo) 47–50%    centralizado    70–90%      Começa aqui, sangra baixo
Dots navegação        bottom 2–3%  centralizado  auto       Sempre no fundo
```

---

## TAMANHOS TIPOGRÁFICOS (px, card 1080×1440)

Escala proporcional para 1080×1440. **Alternar fontes:** headline OU micro-copy em fonte do carrossel (Permanent Marker); o outro em sans-serif (Inter).

```
ELEMENTO              TAMANHO     PESO      FONTE                    COR
──────────────────────────────────────────────────────────────────────────────
Logo / brand          22–26px    700       sans-serif (Inter)       branco
Micro-copy            28–32px    400       1.2  Inter OU Marker*     branco 85% opacidade
Headline              72–88px    800–900   1.05–1.15  Marker OU Inter*  branco puro
Badge text            24–28px    700       sans-serif               escuro (contraste máximo)
Anotação manuscrita   26–30px    400       1.4  Marker ou Inter*     cor de destaque (roxo/lavanda)
```
* Um dos dois (headline vs micro-copy) = fonte do carrossel (Permanent Marker); o outro = Inter. Anotação pode seguir a fonte de impacto ou a sans-serif para contraste.

---

## REGRAS DE PROPORÇÃO ENTRE ELEMENTOS

- Micro-copy = 30–35% do tamanho do headline.
- Espaço entre micro-copy e headline: 4–8px apenas (bloco unido).
- Badge: máx 16px abaixo da última linha do headline (não flutua).
- A **face do mascote** NUNCA ultrapassa 50% do topo (headline fica em zona limpa).
- Headline: padding lateral de 5–8% de cada lado (quase borda a borda).
- Anotação manuscrita: sempre na coluna oposta ao rosto do mascote (se mascote à direita, anotação à esquerda ou centralizada abaixo do título).

---

## BADGE PILL (comportamento)

- Funciona como "ponto final visual" do título; interrompe o fluxo do headline.
- Border-radius: 999px (pill perfeito).
- Padding horizontal: 16–20px, vertical: 6–8px.
- Cor de fundo: contraste máximo com o slide (MVP Flow: roxo #7C3AED ou preto #0a0a0a; texto branco).
- Centralizado horizontalmente em relação ao bloco do headline; alinhado logo abaixo da última linha do headline.

---

## ANOTAÇÃO MANUSCRITA

- Fonte cursiva ou italic + handwriting (ex.: Caveat, Permanent Marker em tamanho menor).
- Cor de destaque (roxo/lavanda MVP Flow).
- Acompanha uma **seta orgânica** (curva, 1–1.5px, mesma cor), apontando para o mascote OU para o badge — nunca para o headline.
- Posição: coluna direita ou abaixo do headline, sem sobrepor o título.

---

## O QUE NUNCA FAZER NA CAPA

- Texto sobre a face do mascote sem degradê suficiente (legibilidade).
- Mascote cortado de forma que perca a expressão (corte no meio do rosto).
- Mascote ocupando toda a área de título (impossibilitando leitura).
- Dois elementos no mesmo peso (ex.: dois headlines do mesmo tamanho).
- Badge ou anotação em posição que quebre a hierarquia (headline sempre o maior bloco de texto).

---

## RESUMO EM UMA FRASE

> A capa tem um único ponto de máxima tensão (o título + badge); o mascote em fundo + degradê sustenta a atmosfera sem atrapalhar a leitura.
