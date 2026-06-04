# Research Brief — Instagram Carousel Squad
**Squad:** instagram-carrossel
**Prepared:** 2026-03-03
**Domains researched:** 4

---

## Domain 1: Copywriting para Carrossel de Instagram

### Key Findings

1. **O primeiro slide decide tudo.** Carrosséis que param o scroll usam headlines provocativas, perguntas desafiadoras ou estatísticas surpreendentes nos primeiros 125 caracteres. A promessa de valor deve ser clara e imediata.
   - Confidence: HIGH | Sources: Hootsuite, Planoly, Sked Social, 2024-2025

2. **Carrosséis educacionais são os que mais geram saves.** Posts que ensinam algo concreto (passo a passo, mitos vs. fatos, dados reveladores) acumulam saves — o sinal mais importante para o algoritmo do Instagram em 2025.
   - Confidence: HIGH | Sources: Growth Curve, Full Stop Social Media, 2025

3. **Estrutura PAS (Problem-Agitate-Solution) é a mais eficaz para conteúdo tech/IA.** Slide 1 apresenta o problema, slides 2-3 aprofundam a dor ou revelam o dado surpreendente, slides 4-6 entregam a solução, slide final tem CTA claro.
   - Confidence: HIGH | Sources: Octospark, Thistle Media, 2025

4. **Cada slide deve ter UMA ideia.** Densidade excessiva por slide reduz o tempo de permanência. Máximo de 3-4 linhas de texto visível por slide.
   - Confidence: HIGH | Sources: Avramify, Hootsuite, 2025

5. **CTA final deve ser específico e orientado a ação.** "Salva pra não perder", "Comenta X" e "Compartilha com alguém que precisa ver isso" superam CTAs genéricos como "Segue a gente".
   - Confidence: HIGH | Sources: Buffer, Resont, 2025

### Frameworks Found
- **PAS** (Problem-Agitate-Solution): Mais eficaz para conteúdo de awareness em tech/IA
- **AIDA** (Attention-Interest-Desire-Action): Ideal para primeira exposição à marca
- **Myth vs. Fact**: Performa excepcionalmente bem em nichos de tecnologia e IA
- **Data-first storytelling**: Dado → Contexto → Implicação → Ação

### Trending Angles for Tech/AI Carousels
- "Você está fazendo X errado e nem sabe" — Lifecycle: Growth
- "Os dados que a mídia não te mostra" — Lifecycle: Growth
- "O que acontece quando você compara A vs. B" — Lifecycle: Emerging
- "Passo a passo de como fazer X sem saber programar" — Lifecycle: Mature but effective

---

## Domain 2: Design Visual Bold e Colorido para Tech/IA no Instagram

### Key Findings

1. **Hyper-brights e gradientes digitais dominam o feed tech em 2025.** Paletas neon, contrastes extremos e gradientes inspirados em UI de IA são a tendência predominante para marcas de tecnologia e educação digital.
   - Confidence: HIGH | Sources: AZ Media Maven, Versa Creative, 2025

2. **Tipografia chunky e bold como protagonista visual.** Fontes sem serifa pesadas (700+ weight) em tamanho grande com muito espaço ao redor criam impacto visual imediato. Inter, Montserrat e Poppins lideram as escolhas para tech.
   - Confidence: HIGH | Sources: Accio, Font Fabric, Aesthetic Speaking, 2025

3. **Uma ideia visual por slide, sem poluição.** O design bold funciona com poucas cores (3-5 max) e muito contraste. Fundos sólidos ou gradientes simples superam backgrounds complexos para slides educacionais.
   - Confidence: HIGH | Sources: Avramify, Hootsuite, 2025

4. **Ratio WCAG AA (4.5:1) é mínimo obrigatório.** Texto branco em fundo escuro ou texto escuro em fundo claro. Nunca texto sobre imagem sem overlay de proteção.
   - Confidence: HIGH | Source: Image Designer agent spec

5. **Carrosséis verticais (1080×1440px ou 1080×1350px) ocupam mais tela e geram mais engajamento.** Instagram atualizou para privilegiar 4:5 ratio em feeds. Proporção 3:4 (1080×1440) também funciona bem.
   - Confidence: HIGH | Sources: Hootsuite, Social Media Today, 2025

### Design System Recommendations for Sem Codar
- **Primary color:** Dark navy ou preto profundo (fundo que faz cores vibrantes saltarem)
- **Accent:** Cor vibrante única por série (coral, electric blue, neon green) para consistência visual
- **Text:** Branco puro (#FFFFFF) em fundos escuros — contraste máximo
- **Highlight:** Amarelo ouro ou verde neon para números e dados importantes
- **Font:** Inter ou Poppins — profissional, legível, tech-friendly

---

## Domain 3: Psicologia de Engajamento no Instagram (Carrosséis)

### Key Findings

1. **"Saves" e "shares" têm peso 5x maior que likes no algoritmo de 2025.** Conteúdo que gera salvamentos (checklists, dados, tutoriais) é priorizadopelo feed algorítmico.
   - Confidence: HIGH | Sources: Growth Curve, Buffer, Social Media Today, 2025

2. **Instagram re-exibe carrosséis para usuários que scrollaram sem engajar.** Se o usuário passou pelo slide 1 sem interagir, o Instagram pode reapresentar o carrossel começando por um slide diferente. Isso significa que cada slide precisa ser forte o suficiente para ser uma "porta de entrada".
   - Confidence: HIGH | Sources: Buffer, Growthcurve, 2025

3. **Tempo médio de retenção em carrosséis (6-8 slides) é 3x maior que posts simples.** O swipe cria comprometimento progressivo — cada slide gera um micro-investimento do leitor que o engaja mais.
   - Confidence: HIGH | Source: Sked Social, Hootsuite, 2025

4. **Carrosséis com música têm alcance ampliado (elegíveis para aba de Reels).** Adicionar faixa de áudio aumenta distribuição sem necessidade de produzir vídeo.
   - Confidence: MEDIUM | Source: YouTube creators, Instagram updates, 2025

5. **A pergunta na legenda aumenta comentários em 40%.** Uma pergunta direta ao final da caption ("Você já passou por isso?", "Qual foi sua reação?") é o gatilho mais eficaz para comentários.
   - Confidence: MEDIUM | Sources: Nextleveldata, Fullstop Social, 2025

### Psychological Triggers that Drive Carousel Engagement
- **Curiosity gap**: Mostrar que existe uma resposta sem revelar ela no slide 1 (open loop)
- **Social proof + FOMO**: Dados que revelam que outros já estão fazendo algo
- **Cognitive dissonance**: Afirmação contrária ao que o leitor acredita
- **Completeness drive**: "Swipe para ver os 5 passos" ativa o desejo de completar a sequência
- **Identity-based content**: "Se você usa IA, precisa saber isso" — faz parte da identidade do leitor

---

## Domain 4: Instagram Graph API — Publicação de Carrosséis

### Key Findings

1. **Carrosséis suportam 2 a 10 imagens ou vídeos.** Cada post de carrossel conta como 1 item no limite de 100 posts/24h via API.
   - Confidence: HIGH | Source: Meta for Developers, 2025

2. **Formato obrigatório: JPG ou PNG.** JPEG é o mais compatível. PNG é aceito mas recomenda-se converter para JPEG para melhor compatibilidade.
   - Confidence: HIGH | Source: Meta for Developers, Sprout Social, 2025

3. **Todas as imagens do carrossel devem ter o mesmo aspect ratio.** A API default para 1:1 se não especificado. Para feed vertical (4:5): 1080×1350px. Para o formato 3:4 usado no squad: 1080×1440px precisa ser validado.
   - Confidence: HIGH | Source: Meta for Developers, AdManage, 2025

4. **As imagens devem estar em servidor público acessível.** O Instagram faz curl das URLs durante criação dos media containers. Ferramentas como imgbb são usadas para hosting temporário antes do publish.
   - Confidence: HIGH | Source: Meta for Developers, Stack Overflow, 2025

5. **Processo em 3 etapas: containers individuais → container de carrossel → publicar.** O instagram-publisher skill já abstrai todo esse processo.
   - Confidence: HIGH | Source: Meta for Developers, instagram-publisher skill, 2025

6. **IMPORTANTE — Deprecação em 2025:** A partir de maio de 2025, o Graph API exige uso dos novos objetos (IG User, IG Media) em lugar dos legados (Instagram User, Instagram Media). O instagram-publisher skill precisa estar atualizado para usar os novos endpoints.
   - Confidence: HIGH | Source: Meta for Developers, 2025

### API Specs Summary
| Campo | Valor |
|-------|-------|
| Formato | JPG / PNG |
| Imagens por carrossel | 2-10 |
| Aspect ratio | Consistente entre slides |
| Tamanho máximo por arquivo | 30MB |
| Caption máximo | 2.200 caracteres |
| Hashtags recomendados | 5-8 |
| Limite de posts | 100 / 24h |

---

## Gaps Identified
- Não encontramos dados específicos sobre CTR médio de carrosséis para nicho de No-Code/IA no Brasil
- O formato exato 1080×1440 (3:4) precisa ser validado contra a API — o formato oficial suportado é 4:5 (1080×1350). Pode ser necessário ajustar para 1080×1350px
- Não há dados sobre melhor horário de publicação específico para audiência tech no Brasil (recomendação geral: terça a sexta, 7-9h ou 18-20h horário de Brasília)
