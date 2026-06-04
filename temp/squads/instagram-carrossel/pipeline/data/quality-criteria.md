# Quality Criteria — Instagram Carousel Squad
**Squad:** instagram-carrossel
**Updated:** 2026-03-03

---

## Scoring System

Cada critério é avaliado em escala 1-10.
- **APPROVE**: Média ≥ 7/10 e nenhum critério abaixo de 4/10
- **REJECT**: Média < 7/10 OU qualquer critério abaixo de 4/10
- **Critério com peso 1.5×**: Scroll-Stop Test (critério prioritário definido na calibração)

---

## Copy Quality Criteria

### C1: Scroll-Stop Test ⭐ (PESO 1.5×)
**Pergunta:** O slide 1 faria uma pessoa parar de scrollar no feed?
- 9-10: Dado surpreendente + visual impactante. Para qualquer scroll sem esforço.
- 7-8: Hook forte, mas pode ser melhorado. Para a maioria dos scrolls.
- 5-6: Hook mediano. Apenas pessoas já interessadas no tema parariam.
- 3-4: Hook genérico. Não para scroll. Começa com apresentação ou "hoje vamos falar".
- 1-2: Nenhum hook. Slide 1 é decorativo ou apenas nome/logo.

**Veto condition**: Score ≤ 3 → REJECT automático independente das demais notas.

### C2: Data Integrity
**Pergunta:** Todas as afirmações factuais têm dado concreto ou fonte identificável?
- 9-10: Todos os dados têm fonte clara. Números específicos (não "a maioria" ou "muitos").
- 7-8: Maioria dos dados tem fonte. Um ou dois pontos são opinião claramente marcada.
- 5-6: Mix de dados e afirmações não verificadas, mas a essência é correta.
- 3-4: Afirmações factuais sem evidência. "Todo mundo sabe que..." ou "É fato que..."
- 1-2: Dados inventados ou absolutamente não verificáveis.

### C3: Story Coherence
**Pergunta:** Os slides contam uma história coerente do início ao fim?
- 9-10: Cada slide é consequência do anterior. Narrativa clara com começo, meio e fim.
- 7-8: Boa progressão com uma ou duas transições que poderiam ser mais suaves.
- 5-6: Maioria dos slides conectados, mas alguns parecem isolados.
- 3-4: Slides desconectados. Poderiam ser embaralhados sem perda de sentido.
- 1-2: Slides aleatórios. Nenhuma narrativa identificável.

### C4: Reflexão Final
**Pergunta:** O penúltimo ou último slide de conteúdo entrega uma reflexão memorável?
- 9-10: Reflexão que "toca na alma" — provoca o leitor de forma construtiva e memorável.
- 7-8: Reflexão presente e relevante, mas poderia ser mais impactante.
- 5-6: Tentativa de reflexão mas vaga ou previsível.
- 3-4: Sem momento de reflexão. O carrossel termina o conteúdo sem impacto emocional.
- 1-2: O carrossel vai direto para o CTA sem entrega emocional.

### C5: CTA Specificity
**Pergunta:** O CTA é específico, acionável e conectado ao conteúdo?
- 9-10: CTA específico e inteligente. "Salva pra aplicar amanhã" / "Comenta o número do passo que você vai começar"
- 7-8: CTA presente e específico, mas poderia ser mais criativo ou conectado ao conteúdo.
- 5-6: CTA genérico mas existente. "Salve este post" sem contextualização.
- 3-4: CTA de auto-promoção desconectada. "Nos siga para mais".
- 1-2: Sem CTA.

### C6: Brand Voice Alignment
**Pergunta:** O copy está no tom aprovado (didático, dados reais, reflexão profunda)?
- 9-10: Tom perfeitamente alinhado. Lê exatamente como Sem Codar soa.
- 7-8: Majoritariamente alinhado. Um ou dois momentos poderiam ser mais "Sem Codar".
- 5-6: Tom correto mas escrita genérica. Poderia ser de qualquer marca.
- 3-4: Tom errado. Muito formal, muito casual, ou copy vazia sem substância.
- 1-2: Tom completamente fora do padrão da marca.

---

## Visual Quality Criteria

### V1: Design System Consistency
**Pergunta:** Todos os slides usam o mesmo sistema de design (cores, fontes, espaçamento)?
- 9-10: Sistema perfeitamente consistente. Qualquer slide reconhecível como parte do carrossel.
- 7-8: Consistência alta com uma ou duas pequenas variações aceitáveis.
- 5-6: Maioria consistente mas alguns slides "fogem" do sistema.
- 3-4: Inconsistências visíveis. Fontes ou cores diferentes sem justificativa.
- 1-2: Sem sistema de design. Cada slide parece de um carrossel diferente.

### V2: Readability
**Pergunta:** O texto é legível em tela de celular (tamanho mínimo de fonte respeitado)?
- 9-10: Todos os textos ≥ 28px body, ≥ 56px hero. Contraste WCAG AA em todos os slides.
- 7-8: Maioria dentro dos limites. Um ou dois elementos borderline mas legíveis.
- 5-6: Alguns textos abaixo do mínimo mas ainda legíveis em telas maiores.
- 3-4: Textos claramente muito pequenos para tela de celular.
- 1-2: Ilegível em mobile.

### V3: Visual Impact (Bold & Colorful)
**Pergunta:** O visual é bold, colorido e impactante — adequado para audiência tech/IA?
- 9-10: Visual que para o scroll. Alto contraste, energia visual, slides memoráveis.
- 7-8: Visual forte e coerente com a identidade definida.
- 5-6: Visual mediano. Nem fraco nem impactante.
- 3-4: Visual fraco ou sem identidade. Genérico e sem personalidade.
- 1-2: Visual que ativamente prejudica o conteúdo.

---

## Technical Quality Criteria (Publishing)

### T1: Image Specs
- [ ] Formato: JPEG (ou PNG aceito)
- [ ] Dimensões consistentes entre todos os slides
- [ ] Tamanho máximo: 30MB por arquivo
- [ ] Número de slides: 2-10

### T2: Caption
- [ ] Comprimento: máximo 2.200 caracteres
- [ ] Hashtags: 5-8 ao final (nunca na legenda principal)
- [ ] Abertura: primeiras 125 chars devem incluir o hook principal

---

## Veto Conditions (Auto-REJECT)

1. **Slide 1 começa com o nome da marca ou "Hoje vamos falar sobre"** — destruição garantida do scroll-stop test
2. **Afirmação factual central sem dado ou fonte** — falha de integridade editorial
3. **Menos de 6 slides ou mais de 10 slides** — fora do range de performance ótima
4. **Caption com mais de 2.200 caracteres** — falha técnica de API
5. **HTML não renderizável ou texto cortado nos slides** — falha de design técnica
6. **Todos os slides com mesmo layout sem variação** — carrossel visualmente monótono
