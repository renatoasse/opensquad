# SISTEMA DE DESIGN — CARROSSEL INSTAGRAM
> Cole este documento no seu agente de IA antes de pedir para ele criar slides.

---

## CONTEXTO

Você é um especialista em design de carrosséis para Instagram.
Ao criar qualquer slide, siga estritamente as regras abaixo de hierarquia, camadas e montagem de elementos.
Não invente padrões novos. Use apenas o que está descrito aqui.

---

## ESTRUTURA GERAL

Todo carrossel tem 3 tipos de slide. Cada um tem regras próprias:

| Tipo | Posição | Função |
|------|---------|--------|
| CAPA | Slide 1 | Capturar atenção, apresentar o tema |
| CONTEÚDO | Slides 2 até N-1 | Desenvolver cada ponto com profundidade |
| OUTRO (fechamento) | Último slide | CTA + ação do usuário |

---

## REGRA DE HIERARQUIA TIPOGRÁFICA

Todo slide deve ter exatamente 4 níveis de peso visual. Nunca dois elementos no mesmo nível.

```
NÍVEL 1 — Elemento decorativo (número, ícone gigante)
  Tamanho: máximo da tela
  Peso: extra-bold / black
  Opacidade: 30–60% (fica "atrás" visualmente)
  Cor: variação da cor de destaque, sem saturação total

NÍVEL 2 — Título principal
  Tamanho: grande (ocupa 2–3 linhas)
  Peso: bold
  Cor: branco ou cor clara máxima
  Posição: sobrepõe o elemento decorativo (z-index acima)

NÍVEL 3 — Corpo / texto de apoio
  Tamanho: médio (menor que o título, maior que labels)
  Peso: regular
  Cor: branco com opacidade reduzida ou cinza claro
  Posição: abaixo do título, espaço generoso entre eles

NÍVEL 4 — Labels, tags, badges, micro-copy
  Tamanho: pequeno
  Peso: medium ou bold (mas tamanho pequeno compensa)
  Cor: cor de destaque ou neutro
```

---

## REGRA DAS CAMADAS (Z-INDEX)

Monte os elementos sempre nesta ordem, de baixo para cima:

```
CAMADA 1 (fundo)    → background sólido escuro
CAMADA 2            → imagem de pessoa (cutout, sem fundo)
CAMADA 3            → número / ícone decorativo gigante (baixa opacidade)
CAMADA 4            → título principal (sobrepõe o número)
CAMADA 5            → texto de corpo
CAMADA 6            → seta manuscrita / orgânica
CAMADA 7 (topo)     → box de destaque + badge/pill
```

**Regra absoluta:** o título DEVE sobrepor o número decorativo. O número fica "cortado" pelo título — isso cria profundidade.

---

## ELEMENTOS OBRIGATÓRIOS POR TIPO DE SLIDE

### CAPA (Slide 1)

```
[BADGE/PILL — top left]
  Formato: pílula (border-radius alto)
  Conteúdo: nome do autor ou categoria
  Cor de fundo: cor de destaque (amarelo, laranja etc.)
  Cor do texto: escuro (contraste alto)

[ÍCONE DE NAVEGAÇÃO — top right]
  Formato: círculo com seta →
  Estilo: outline, sem preenchimento
  Função: indicar que há próximo slide

[MICRO-COPY — acima do título]
  Texto pequeno e leve
  Serve como "tema do carrossel" ou número de itens
  Ex: "4 habilidades que você"

[TÍTULO — centro-esquerdo]
  Ocupa 60–70% da largura
  2 a 3 linhas
  Peso máximo (bold/black)
  Tamanho grande

[BADGE SECUNDÁRIO — sobreposto ao título]
  Pill colorido que "interrompe" o título visualmente
  Ex: "antes do ano acabar" cortando o texto grande
  Posição: dentro ou imediatamente abaixo da segunda linha do título

[ANOTAÇÃO MANUSCRITA — ao lado do título ou abaixo]
  Texto em estilo cursivo/handwritten
  Cor de destaque (diferente do corpo)
  Ex: "Para se desenvolver na área da programação!"
  Com pequena seta apontando para o CTA ou destaque

[IMAGEM HUMANA — base ou lado direito]
  Cutout (fundo removido)
  Sangra até a borda do card (sem container, sem borda)
  Nunca cobre o texto principal
  Posição: coluna direita OU base centralizada

[DOTS DE NAVEGAÇÃO — bottom center]
  Pontinhos de progresso
  Dot ativo: branco cheio
  Dots inativos: branco com opacidade baixa
```

---

### SLIDE DE CONTEÚDO (Slides internos)

```
[BADGE AUTOR — top left]
  Mesmo pill da capa (consistência de marca)
  Conteúdo: nome do autor

[ÍCONE DE NAVEGAÇÃO — top right]
  Círculo com seta → (igual à capa)

[NÚMERO DECORATIVO — início do conteúdo]
  Formato: #1, #2, #3 etc.
  Tamanho: enorme (ocupa 1/3 da altura do slide)
  Peso: extra-bold / black
  Cor: variação dourada/âmbar em baixa opacidade (30–55%)
  Posição: top-left da área de conteúdo
  Z-index: ABAIXO do título

[TÍTULO — sobrepondo o número]
  Bold, grande
  Começa onde o número está — sobrepõe ele
  2 a 3 linhas
  Cor: branco ou quase-branco

[CORPO — abaixo do título]
  Regular, tamanho médio
  1 a 2 parágrafos curtos (máx 3 linhas cada)
  Cor: cinza claro ou branco com opacidade

[SETA ORGÂNICA — entre o corpo e o box]
  Curva manuscrita (não é uma seta reta)
  Direção: do final do texto para o box de destaque
  Cor: branco ou cor de destaque
  Peso: fino (1–1.5px)
  Função: conduzir o olho do corpo para o box

[BOX DE DESTAQUE — bottom]
  Fundo: cor sólida de máximo contraste (ex: amarelo sobre escuro)
  Border-radius: moderado (8–12px)
  Padding: generoso
  Conteúdo: o insight principal OU o dado mais impactante do slide
  Peso do texto: bold
  Cor do texto: escuro (máximo contraste)
  REGRA: apenas UM box por slide. Se tiver dois, você perdeu o ponto.

[DOTS DE NAVEGAÇÃO — bottom center]
  Dot do slide atual: ativo (cheio)
  Restantes: inativos
```

---

### OUTRO / FECHAMENTO (Último slide)

```
[BADGE AUTOR — top CENTER]
  Mesmo pill, mas agora CENTRALIZADO (não à esquerda)
  Isso sinaliza encerramento e simetria

[HEADLINE EMOCIONAL — top-left da área de conteúdo]
  Tom de urgência ou motivação
  Grande, bold
  Ocupa coluna esquerda (deixa direita para imagem)

[TEXTO DE APOIO — abaixo do headline]
  Regular, menor
  Contextualiza ou quantifica ("57 dias são suficientes para...")

[BOX CTA — abaixo do texto de apoio]
  Cor sólida de destaque (mesmo amarelo/laranja dos outros slides)
  Ação concreta e específica
  Ex: "Comenta QUERO e receba um guia..."
  Peso: bold
  REGRA: este box é o objetivo de todo o carrossel. Deve ser claro e direto.

[IMAGEM HUMANA — coluna direita ou fundo]
  Cutout sem fundo
  Coluna direita, altura total
  Nunca interfere na leitura do headline ou do CTA

[DOTS — bottom center]
  Último dot ativo
```

---

## REGRAS DE COMPOSIÇÃO (VALEM PARA TODOS OS SLIDES)

### Sobre o BOX DE DESTAQUE
- Aparece apenas uma vez por slide
- Sempre carrega o insight mais denso ou o CTA
- Cor sólida de máximo contraste com o fundo
- Nunca use para informação secundária

### Sobre a IMAGEM HUMANA
- Sempre em coluna separada do texto (direita) OU sangrando pela base
- NUNCA texto por cima da face ou do torso
- Sem container, sem borda, sem sombra — a imagem simplesmente existe no slide
- Se não houver imagem, o layout funciona do mesmo jeito

### Sobre a SETA ORGÂNICA
- É curva, não reta
- Tem personalidade "hand-made"
- Conecta sempre dois elementos de importância diferente
- Nunca use seta reta ou seta com pontilhado técnico — quebraria o estilo

### Sobre os BADGES/PILLS
- Border-radius alto (pill shape)
- No slide de capa e conteúdo: top-left
- No slide de fechamento: top-center
- Mesma cor e formato em todos os slides (consistência)

### Sobre os DOTS DE NAVEGAÇÃO
- Sempre bottom-center
- Dot ativo = preenchido / maior
- Inativos = opacidade baixa
- Não decorativo — é informação de progresso

---

## O QUE NUNCA FAZER

```
❌ Dois elementos no mesmo peso e tamanho no mesmo slide
❌ Box de destaque em dois lugares no mesmo slide
❌ Texto sobreposto à face da pessoa na imagem
❌ Seta reta (use sempre curva orgânica)
❌ Badge em posição diferente sem motivo narrativo
❌ Número decorativo na frente do título (ele SEMPRE fica atrás)
❌ Mais de 3 linhas de corpo sem separação visual
❌ Slide sem nenhum elemento de cor sólida de destaque
❌ Mudar a cor do box de destaque entre slides (consistência)
```

---

## EXEMPLO DE BRIEFING PARA PEDIR UM SLIDE

Quando for pedir um slide ao agente, use este formato:

```
Tipo: [CAPA | CONTEÚDO | FECHAMENTO]
Tema: [assunto do slide]
Número: [#1, #2 etc — apenas para slides de conteúdo]
Título: [o que vai no headline grande]
Corpo: [texto de apoio, 1–2 frases]
Destaque (box): [o insight principal ou CTA]
Anotação manuscrita: [frase curta em estilo cursivo, opcional]
Tem imagem de pessoa: [sim | não]
```

---

## RESUMO EM UMA FRASE

> Todo slide tem um único ponto de máxima tensão visual (o box de destaque),
> e todas as outras camadas existem para conduzir o olho até ele.

---

## APLICAÇÃO NO INSTA-MVP

- **Cor de destaque:** roxo MVP Flow (`#7C3AED`, `#A78BFA`) — substituir amarelo/laranja do doc por roxo/lavanda.
- **Tipografia:** títulos = Permanent Marker (handwritten); corpo = Inter; manter riscos e círculos em palavras-chave quando couber no nível 2/4.
- **Step 12 (Diana):** carregar este arquivo junto com `brand-mvp-flow-colors.md` e `reference-carousel-hyeser-laminas.md`.
