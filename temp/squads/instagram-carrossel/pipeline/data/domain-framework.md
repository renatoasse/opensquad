# Domain Framework — Instagram Carousel Creation
**Squad:** instagram-carrossel
**Domain:** Instagram Carousel Educational Content for Tech/AI Audience
**Last Updated:** 2026-03-03

---

## Core Framework: Data-Driven Educational Carousel

Este framework define o processo operacional para transformar um texto/notícia em um carrossel de Instagram educacional que gera saves, shares e comentários.

### The 5-Phase Carousel Construction Method

#### Phase 1: Extraction (Ângela Ângulo)
1. **Read the source text completely** — identify all factual claims, statistics, names, dates, and entities
2. **Verify or flag unverified data** — mark claims that need source citation vs. claims that are stated as fact
3. **Extract the core tension** — every good carousel has a central conflict or revelation. Find it.
4. **Identify 3-5 angles** — an "ângulo" is the emotional perspective/lens to tell ONE piece of content
   - Each angle must produce a completely different emotional experience from the same source text
   - Angle types: Revelador, Comparativo, Perguntas Incômodas, Tendência, Passo a Passo

#### Phase 2: Copy Construction (Carlos Carrossel)
1. **Slide 1 — O Hook (Para o Scroll):** Dado real + o que ele revela. Máximo 2 linhas. Must pass scroll-stop test.
2. **Slide 2 — Contexto:** Por que esse dado importa? O que ele revela sobre a realidade do leitor?
3. **Slides 3-6 — Desenvolvimento:** Uma ideia por slide. Cada slide é um degrau de compreensão.
4. **Penúltimo Slide — Reflexão:** A pergunta ou afirmação que "toca na alma"
5. **Último Slide — CTA:** Ação específica que conecta ao próximo passo da jornada do leitor

**Slide Count:** 7-9 slides (hook + 5-7 conteúdo + CTA). Nunca menos de 6, nunca mais de 10.

#### Phase 3: Visual Design (Davi Design)
1. **Define design system first** — colors, fonts, spacing, grid for ALL slides before touching HTML
2. **Hook slide = máximo impacto visual** — tamanho de fonte hero (56px+), dado em destaque, cor de acento
3. **Content slides = leitura fácil** — hierarquia clara, uma ideia, espaço em branco generoso
4. **Reflection slide = visual diferente** — pode usar uma cor de fundo diferente para criar pausa
5. **CTA slide = ação clara** — botão visual ou elemento que direciona o próximo passo

#### Phase 4: Quality Review (Vera Veredito)
1. **Scroll-stop test** (peso 1.5×): Slide 1 pararia o scroll? Dado real? Visual impactante?
2. **Data integrity check**: Todas as afirmações factuais têm fonte ou são claramente opiniões?
3. **Story coherence**: Os slides contam uma história coerente ou são pontos desconectados?
4. **CTA specificity**: O CTA é específico e acionável ou genérico?
5. **Brand voice**: O tom está alinhado com "didático + dados reais + reflexão profunda"?

#### Phase 5: Publishing (Paula Post)
1. **Image format conversion**: HTML/CSS → PNG → JPEG se necessário para a API
2. **Caption assembly**: Copy da legenda com hashtags (5-8) no final
3. **Validation check**: Formato, dimensões, count de imagens, tamanho de arquivo
4. **Confirmation**: Apresentar preview completo + aguardar confirmação explícita
5. **Publish**: Executar via instagram-publisher skill + reportar URL e status

---

## Angle Identification Framework

### Definition
Um ângulo é a perspectiva emocional usada para contar UM conteúdo. A MESMA notícia produz carrosséis completamente diferentes por ângulo.

### The 5 Standard Angles for Tech/AI Content

| Ângulo | Emoção Primária | Hook Pattern | Ideal Para |
|--------|----------------|--------------|------------|
| Revelador | Surpresa + Curiosidade | "[Dado]% das pessoas não sabem que..." | Dados contraintuitivos |
| Comparativo | FOMO + Status | "A diferença entre quem usa X e quem não usa" | Mudanças de mercado |
| Pergunta Incômoda | Dissonância Cognitiva | "Por que você ainda acredita que...?" | Crenças desatualizadas |
| Tendência + Oportunidade | Urgência + Esperança | "Isso mudou em 18 meses. A maioria não percebeu." | Novidades e mudanças |
| Passo a Passo | Segurança + Competência | "São [N] passos. Você consegue hoje mesmo." | Tutoriais e métodos |

### Angle Selection Criteria
- **Match to audience awareness level**: Iniciantes → Revelador/Passo a Passo. Avançados → Comparativo/Pergunta
- **Match to content type**: Notícia factual → Revelador/Tendência. Metodologia → Passo a Passo. Debate → Pergunta Incômoda
- **Avoid overuse**: Não usar o mesmo ângulo em carrosséis consecutivos

---

## Quality Benchmarks

### Scroll-Stop Test (Primary Criterion)
- **Pass**: Slide 1 faria VOCÊ parar de scrollar se aparecesse no feed
- **Fail**: Slide 1 começa com "Hoje vamos falar sobre...", apresenta a marca/nome, ou não tem dado/hook concreto

### Save-Worthiness Test
- **Pass**: O carrossel ensina algo que o leitor vai querer rever. É um recurso, não apenas entretenimento.
- **Fail**: O carrossel é puro texto genérico sem dados, exemplos ou frameworks aplicáveis

### Coherence Test
- **Pass**: Cada slide é consequência do anterior. Retirar qualquer slide quebraria a narrativa.
- **Fail**: Os slides poderiam ser embaralhados e o sentido seria o mesmo.

### CTA Quality Test
- **Pass**: "Salva esse carrossel pra quando você precisar aplicar isso" / "Comenta qual passo você já faz"
- **Fail**: "Nos siga para mais conteúdo" / "Acesse o link na bio"
