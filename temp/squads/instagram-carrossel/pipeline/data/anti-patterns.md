# Anti-Patterns — Instagram Carousel Squad
**Squad:** instagram-carrossel
**Updated:** 2026-03-03

Este arquivo documenta os erros mais comuns na criação de carrosséis para audiência de tech/IA.
Cada agente deve consultar este arquivo antes de entregar seu output.

---

## NEVER DO — Copy Anti-Patterns

### 1. Começar o slide 1 com apresentação ou meta-comentário
❌ "Hoje vamos falar sobre inteligência artificial..."
❌ "Conteúdo: Como usar IA no trabalho"
❌ "Sem Codar apresenta: 5 dicas de IA"

**Por quê é prejudicial:** O leitor está em modo de scroll rápido. A primeira fração de segundo decide se ele para ou continua. Apresentações e anúncios de intenção não param scroll — dados e hooks concretos param.

✅ "67% dos CEOs já tomam decisões com apoio de IA. O seu chefe também. E você?"

---

### 2. Afirmações factuais sem dado ou fonte
❌ "A IA está mudando tudo no mercado de trabalho."
❌ "Todo mundo está usando ferramentas de automação agora."
❌ "A maioria das empresas já adotou IA."

**Por quê é prejudicial:** Afirmações vagas não convencem ninguém. A audiência da Sem Codar é educada e cética — copy sem evidência é descartada como marketing genérico. Cada afirmação factual precisa de número específico ou fonte identificável.

✅ "85% dos executivos afirmam que IA já é critério de promoção. (LinkedIn, 2024)"

---

### 3. Copy vazia que fala muito e diz pouco
❌ "A inteligência artificial está transformando a forma como trabalhamos de maneiras que nunca vimos antes, criando novas oportunidades e desafios que precisamos entender para prosperar neste novo mundo digital."

**Por quê é prejudicial:** Esse tipo de copy pode ser escrita por qualquer marca sobre qualquer tema — ela não diz nada específico. Cada frase deve carregar uma informação ou insight real. Se uma frase pode ser aplicada a qualquer contexto sem modificação, ela não pertence aqui.

✅ "Em 2024, profissionais que usam IA completaram 40% mais tarefas por semana. (MIT Study, 2024)"

---

### 4. Carrossel sem reflexão — só informação
❌ Slide 1 dado → Slide 2 dado → Slide 3 dado → CTA

**Por quê é prejudicial:** Dados sem impacto emocional são esquecidos em minutos. A memória é emocional — a reflexão que "toca na alma" é o que faz o leitor salvar, compartilhar e lembrar. Todo carrossel precisa de um momento de pausa reflexiva antes do CTA.

✅ Inclua sempre um slide de "O que isso significa pra você na prática" antes do CTA.

---

### 5. CTA genérico desconectado do conteúdo
❌ "Nos siga para mais conteúdo!"
❌ "Acesse o link na bio pra saber mais."
❌ "Salve este post." (sem contexto)

**Por quê é prejudicial:** CTAs genéricos revelam que o criador não pensou no próximo passo do leitor. Um bom CTA conecta o conteúdo do carrossel a uma ação específica e relevante para aquele leitor naquele momento.

✅ "Salva esse carrossel. Da próxima vez que alguém te disser que IA vai te substituir, você vai saber exatamente o que responder."

---

### 6. Mais de 3 linhas de texto visível por slide
❌ Parágrafos completos em slides de carrossel
❌ Mais de 4 pontos por slide
❌ Notas de rodapé e referências densas dentro do slide

**Por quê é prejudicial:** Carrosséis são consumidos em mobile, em movimento. Slides densos frustram o leitor e reduzem o tempo de swipe. Uma ideia por slide, expressa na menor quantidade de palavras possível.

✅ Máximo de 4-5 linhas visíveis. Uma ideia. Um impacto.

---

## NEVER DO — Design Anti-Patterns

### 7. Texto sem contraste suficiente sobre imagens ou fundos complexos
❌ Texto claro sobre foto sem overlay
❌ Texto de cor similar ao fundo
❌ Sombra de texto como única proteção de contraste

**Por quê é prejudicial:** A legibilidade em mobile com brilho variável exige contraste mínimo de 4.5:1 (WCAG AA). Texto ilegível = slide ignorado = carrossel abandonado antes do fim.

---

### 8. Sistema de design inconsistente entre slides
❌ Fonte diferente no slide 3
❌ Cor diferente no slide 5 sem justificativa narrativa
❌ Espaçamento diferente que parece erro não erro intencional

**Por quê é prejudicial:** Inconsistência visual cria a percepção de falta de profissionalismo. Cada slide deve ser imediatamente reconhecível como parte do mesmo carrossel.

---

### 9. Slide 1 sem elemento visual de ancoragem
❌ Apenas texto no slide 1 sem nenhum destaque visual
❌ Fonte muito pequena no slide 1 para dar mais texto
❌ Layout idêntico ao slide 2 — sem diferenciação do hook

**Por quê é prejudicial:** O slide 1 precisa ser visualmente diferente dos demais. Deve ter o maior destaque tipográfico (56px+ para o dado principal) e o máximo de impacto visual. É o único slide que compete contra todo o feed do Instagram.

---

### 10. Dependências externas no HTML além de Google Fonts
❌ Bootstrap, Tailwind, ou qualquer CDN de CSS
❌ Imagens externas sem caminho absoluto verificado
❌ JavaScript de qualquer tipo
❌ Fontes locais referenciadas por caminho relativo

**Por quê é prejudicial:** O rendering via Playwright não tem acesso a dependências externas não carregadas no momento da captura. Qualquer dependência não resolvida quebra o slide silenciosamente sem erro visível.

---

## ALWAYS DO

1. **Verifique o slide 1 como se você fosse um estranho no feed** — Você pararia de scrollar SEM saber o que é a Sem Codar? Se não, reescreva o hook.

2. **Inclua pelo menos um dado com fonte em cada carrossel** — Dados verificáveis são a diferença entre autoridade e opinião. Uma fonte real transforma o carrossel em referência.

3. **Renderize e verifique o slide 1 antes de renderizar todos os demais** — Um erro de espaçamento ou fonte no slide 1 se propaga por todo o carrossel se não for detectado cedo.

4. **Mantenha a legenda abaixo de 2.000 caracteres** — Mesmo o limite sendo 2.200, hashtags ocupam espaço e a legenda precisa respirar. Mire em 1.500-1.800 caracteres.

5. **Documente o sistema de design antes de criar o primeiro slide HTML** — Cores, fontes, espaçamento. Esse documento é o contrato visual entre todos os slides.

6. **Garanta que o penúltimo slide de conteúdo tenha uma reflexão** — Não apenas informação. Uma pergunta, uma afirmação que incomodar, ou uma perspectiva que o leitor não tinha antes.
