# REGRAS GERAIS — DESIGN INSTAGRAM (CARROSSEL)

> Documento de referência para **Carlos Capa** (capa) e **Diana Design** (slides). Use junto com design-system-carousel-cover.md, design-system-carousel-cover-USER.md e reference-capa-padrao-usuario.html.

---

## 01 — SAFE ZONES (Zonas de segurança)

- **Formato vertical:** 1080×1350px (4:5) ou 1080×1440px (3:4). Instagram pode cortar bordas e pré-visualiza em **1:1** no feed.
- **Zona de risco:** 100px em todos os lados — **nunca** colocar logo, texto ou CTA dentro dessa margem.
- **Zona segura:** Todo conteúdo importante deve ficar **dentro** da área delimitada (após os 100px).
- **Preview 1:1 no feed:** A área central quadrada (1:1) é o que aparece antes do clique. **Logo e gancho devem aparecer nessa área** para a capa funcionar em ambos os formatos.
- **Regra:** Nunca posicione elementos críticos fora da zona segura; mantenha margem mínima de 100px das bordas.

---

## 02 — PESO VISUAL (Hierarquia)

- **Um único ponto de entrada** por slide. O olhar do leitor deve saber exatamente onde começar.
- **Máximo 3 níveis de hierarquia** por slide (ex.: enorme → médio → micro → CTA).
- **Escala recomendada (base 1080px de largura):**
  - Título: 80–120px
  - Subtítulo: 36–48px
  - Corpo: 24–30px
  - Rodapé: 18–22px
- **Razão mínima entre níveis: 1,5x** — nunca use dois tamanhos com menos de 50% de diferença entre si.
- Evitar "pesos iguais": todos os textos do mesmo tamanho = olhar sem ponto de entrada. Preferir contraste claro (ex.: número enorme ancora tudo).

---

## 03 — RESPIRAÇÃO (Espaçamento)

- **Margem de borda:** Nada a menos de **100px** das bordas laterais.
- **Entre seções:** Entre título → corpo, corpo → CTA: **60–80px**. Grupos separados, leitura clara.
- **Line-height título:** 0,95–1,2 para títulos grandes. Nunca line-height = 1 em corpo.
- **Line-height corpo:** 1,4–1,6.
- **Máximo de elementos por slide:** 4–5. Mais que isso = poluição. Um slide, uma ideia.
- **Regra dos terços (posicionamento):**
  - ⅓ superior: tag, número do slide, logo da marca
  - ⅓ central: título principal, imagem hero, dado de impacto
  - ⅓ inferior: corpo, CTA, @handle, setas de próximo slide

---

## 04 — COMBINAÇÃO DE FONTES (Type pairing)

- **Máximo 2 famílias tipográficas** por carrossel.
- **Uma fonte display, uma funcional.** A combinação deve criar contraste de personalidade — não conflito.
- **Mapa de pesos (qual weight usar onde):**
  - **900:** capa e headlines de impacto
  - **700:** títulos de slides internos
  - **500:** subtítulos e destaques
  - **400:** corpo, legendas e rodapés
- Exemplos de par: Playfair Display + Inter (editorial), Bebas Neue + Montserrat (impacto), Space Grotesk + DM Sans (tech/SaaS), Sora para UI/capa moderna.

---

## 05 — TEORIA DE COR (60-30-10)

- **60%** cor dominante (fundo)
- **30%** cor secundária (elementos e texto)
- **10%** cor de acento (CTA, destaques, números)
- Aplicar em todos os slides para consistência e profissionalismo.

---

## APLICAÇÃO NO INSTA-MVP

- **Carlos Capa:** Ao criar a capa, seguir estas regras + `design-system-carousel-cover-USER.md` + estrutura de `reference-capa-padrao-usuario.html` (safe zone 1:1, swipe hint, badge, headline, subtitle).
- **Diana Design:** Ao gerar ou redesenhar slides 2..N, aplicar as mesmas regras (safe zones, hierarquia, respiro, 2 fontes no máximo, 60-30-10) e manter consistência visual com a capa.
