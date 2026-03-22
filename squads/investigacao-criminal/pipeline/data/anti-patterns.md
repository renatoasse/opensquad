# Anti-Patterns — Investigação Criminal (GAECO)

---

## Nunca Fazer

### 1. Fishing Expedition em Peças Jurídicas
**O que é:** Pedido de quebra de sigilo genérico, sem indícios concretos, na esperança de encontrar algo suspeito.
**Por que é perigoso:** O STJ invalida quebras de sigilo por ausência de fundamentação idônea. Prova obtida ilegalmente pode ser desentranhada do processo, comprometendo toda a investigação.
**Como evitar:** Só peça quebra de dados quando já houver indícios concretos que justifiquem aquela medida específica.

### 2. Apresentar Suposição como Fato
**O que é:** Afirmar que um investigado cometeu um crime sem ter evidência concreta, apenas inferência.
**Por que é perigoso:** Invalida o relatório investigativo, compromete a credibilidade do pedido e pode caracterizar constrangimento ilegal.
**Como evitar:** Distinguir sempre entre "indício" (grau de suspeita justificado) e "prova" (elemento comprobatório). Use linguagem de suspeita ("indícios de que", "presume-se que", "há elementos a indicar que").

### 3. Ignorar a Jurisprudência do STJ/STF
**O que é:** Redigir pedidos de quebra de sigilo sem verificar os requisitos exigidos pelos tribunais superiores.
**Por que é perigoso:** O juiz pode indeferir o pedido ou o tribunal pode anular a prova obtida.
**Como evitar:** Sempre verificar: RMS 51.152/SP (sigilo bancário), Tema 990/STF (Receita Federal → MP), e a jurisprudência mais recente sobre fundamentação idônea.

### 4. Quebra de Sigilo Fiscal Diretamente pelo MP
**O que é:** MP requerer diretamente à Receita Federal informações fiscais dos investigados sem autorização judicial.
**Por que é perigoso:** O STJ entende ser ilegal; a prova pode ser anulada.
**Como evitar:** Requerer ao juízo a quebra. Exceção: compartilhamento espontâneo de RIF/RFFP pela Receita após procedimento administrativo (constitucional pelo Tema 990/STF).

### 5. Mapa de Rede sem Evidências
**O que é:** Atribuir papéis (líder, laranja) a pessoas com base apenas em suposição, sem documentar as evidências.
**Por que é perigoso:** Em juízo, a defesa desmontará o argumento. Viola o contraditório e pode gerar responsabilização.
**Como evitar:** Cada vínculo e cada papel deve ter pelo menos uma evidência documentada (fonte, data, descrição).

### 6. Análise Patrimonial sem Cruzamento
**O que é:** Afirmar incompatibilidade patrimonial sem comparar o patrimônio declarado (IRPF) com o patrimônio real identificado.
**Por que é perigoso:** Sem o cruzamento quantificado, o argumento de enriquecimento ilícito perde força probatória.
**Como evitar:** Sempre calcular: Patrimônio Real identificado - Patrimônio Declarado = Diferença a explicar.

### 7. OSINT sem Documentação de Fonte
**O que é:** Usar informação de redes sociais ou bases abertas sem registrar a URL, data de acesso e plataforma.
**Por que é perigoso:** Conteúdo online pode ser deletado ou alterado. Sem documentação, o dado deixa de existir para fins probatórios.
**Como evitar:** Para cada achado: URL + plataforma + data de acesso + screenshot (quando possível).

### 8. Confundir Correlação com Causalidade
**O que é:** Afirmar que A causou B apenas porque A e B ocorreram no mesmo período.
**Por que é perigoso:** Em juízo, a defesa facilmente derruba o argumento. Desgasta a credibilidade das demais provas.
**Como evitar:** Use linguagem correlacional ("coincidiu com", "ocorreu simultaneamente a") exceto quando houver prova direta do nexo causal.

---

## Sempre Fazer

### 1. Documentar Todas as Fontes
Toda informação usada deve ter origem rastreável: URL, documento, base de dados, data de acesso, número da folha.

### 2. Atribuir Nível de Confiança
Toda afirmação deve ter confiança classificada: Alta (3+ fontes), Média (2 fontes), Baixa (1 fonte ou conflitante).

### 3. Declarar Lacunas
Se um dado não foi encontrado, dizer explicitamente. A lacuna documentada é mais honesta e útil do que o silêncio.

### 4. Delimitar Precisamente o Pedido
Toda peça jurídica deve especificar: quem (nome + CPF/CNPJ), o quê (tipo de dado), quando (período temporal), por quê (nexo com a investigação).

### 5. Verificar Proporcionalidade
A medida requerida deve ser proporcional à gravidade dos indícios. Indícios leves justificam medidas menos invasivas.

### 6. Usar Terminologia Técnica Correta
Usar os termos jurídicos precisos: "indícios de autoria e materialidade", "fumus comissi delicti", "periculum libertatis", "RFFP", "PIC", "medidas cautelares diversas da prisão".

---

## Vocabulário Proibido

Termos que enfraquecem a fundamentação jurídica:
- "Parece que..." → substituir por "os elementos indicam que..."
- "Provavelmente cometeu..." → substituir por "há indícios de que"
- "Todo mundo sabe que..." → substituir por citação de fonte específica
- "Claramente culpado" → nunca usar antes de sentença transitada em julgado
- "Fonte: internet" → sempre especificar URL e plataforma
- "Verificar depois" → nunca deixar lacuna sem sinalizar explicitamente
