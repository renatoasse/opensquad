# Research Brief — Investigação Criminal (GAECO)
## Squad: investigacao-criminal
## Data: 2026-03-22

---

## Domínio 1: OSINT e Análise de Redes Sociais

### Frameworks e Metodologias

**SOCMINT (Social Media Intelligence):**
- Subdisciplina do OSINT focada em plataformas sociais (Instagram, Facebook, X, TikTok, LinkedIn)
- Técnicas: busca por username cruzado entre plataformas, reverse image search, análise de metadados geoespaciais, monitoramento de hashtags
- AI/ML está sendo usado por agências governamentais para filtrar ruído e priorizar dados

**Técnicas-chave de OSINT para investigação criminal:**
1. Busca por username consistente entre plataformas para descobrir contas vinculadas
2. Reverse image search (Google Images) para rastrear fotos a suas origens
3. Geotags do Instagram cruzados com dados de localização do Twitter/X
4. Análise comportamental e preditiva a partir de padrões históricos
5. Pesquisa em registros públicos: CNPJ, CPF, cartório, DETRAN
6. Monitoramento de dark web e aplicativos de mensagens (Telegram, WhatsApp)

**Ferramentas de referência:**
- Maltego: conecta email/CPF a contas sociais, sites, registros empresariais
- Crimewall (Social Links): coleta de 500+ fontes abertas
- SNIPER (CNJ): vínculos patrimoniais, societários e financeiros em grafos

**Considerações legais:**
- OSINT não dispensa cumprimento de procedimentos judiciais para dados protegidos
- Dados públicos são coletáveis livremente; dados protegidos exigem autorização judicial
- Tudo deve ser documentado com fonte, data de acesso e nível de confiança

---

## Domínio 2: Análise de Vínculos e Redes Criminais

### Frameworks e Metodologias

**Social Network Analysis (SNA):**
- Métricas-chave: degree (quantidade de conexões), betweenness (importância para fluxo de informação), closeness (velocidade de acesso à informação)
- Nós são classificados por centralidade para identificar os mais influentes
- Permite simular cenários de desmantelamento: "o que acontece se removemos o nó X?"

**Estrutura de organizações criminosas modernas:**
- Migraram de hierarquias rígidas para estruturas em rede fluidas
- Atores mais relevantes: empreendedores criminais bem conectados (não necessariamente os líderes formais)
- Diferentes papéis: líder, operacional, financeiro, "laranja", facilitador

**Metodologia de mapeamento:**
1. Identificar todos os atores (pessoas físicas e jurídicas)
2. Mapear vínculos: familiares, societários, financeiros, comunicação
3. Calcular métricas de centralidade para cada ator
4. Identificar núcleos (clusters) e pontos de vulnerabilidade
5. Documentar todos os vínculos com evidências (fonte + confiança)

**Fonte de dados para mapeamento:**
- Documentos judiciais, relatórios institucionais
- Dados de comunicação (telemáticos)
- Registros de reuniões, chamadas telefônicas
- Registros empresariais, societários
- Dados de OSINT (redes sociais)

---

## Domínio 3: Análise Patrimonial e Financeira

### Frameworks e Metodologias

**Triangulação de ativos:**
- Cruzamento entre patrimônio declarado (IRPF/IRPJ) e patrimônio real identificado
- Fontes: matrículas de imóveis, DETRAN, SISBAJUD (contas bancárias), RENAJUD, INFOJUD
- Técnica de triangulação: notas fiscais emitidas em locais diferentes do indicado, subfaturamento, exportações fictícias

**Tipologias de blindagem patrimonial:**
- Empresas de fachada com simulação de atividade operacional
- Interposição de laranjas (alaranjamento corporativo)
- Uso de paraísos fiscais e cooperação jurídica internacional
- Reestruturação societária fraudulenta para ruptura do rastro financeiro

**Ferramentas de investigação patrimonial:**
- SISBAJUD: constrição judicial de ativos bancários
- RENAJUD: bloqueio de veículos
- INFOJUD: acesso a declarações fiscais via Receita Federal
- SNIPER (CNJ): grafos de vínculos patrimoniais e societários
- SIMBA e SISCOAF: análise de movimentações suspeitas (COAF)

**RIF (Relatório de Inteligência Financeira — COAF):**
- Gerado a partir de análise de movimentações enquadradas em tipologias de lavagem
- Base legal: Lei nº 9.613/1998
- Compartilhamento com MP e Polícia: constitucional sem autorização judicial prévia (STF, Tema 990)

---

## Domínio 4: Redação de Peças Jurídicas Penais

### Requisitos para Pedido de Quebra de Sigilo

**Elementos obrigatórios (STJ/STF):**
1. Indícios concretos de autoria e materialidade (não bastam suposições)
2. Demonstração de imprescindibilidade da medida (outros meios são insuficientes)
3. Pertinência temática e especificidade do objeto
4. Identificação precisa dos titulares e delimitação temporal
5. Fundamentação judicial robusta e individualizada

**Vedações:**
- "Fishing expedition": investigação exploratória sem indícios concretos é vedada
- MP não pode requisitar diretamente dados fiscais da Receita sem autorização judicial (STJ)
- Exceção: compartilhamento de RIF/RFFP da Receita → MP é constitucional (STF Tema 990)

**Tipos de quebra:**
- Cadastral: dados identificativos de titulares de contas/linhas
- Bancária: movimentação de contas, saldos, extratos
- Fiscal: declarações de IR, informações tributárias
- Telemática: registros de comunicações (chamadas, mensagens)

**Estrutura de uma boa peça:**
- Identificação do procedimento investigatório
- Qualificação dos investigados
- Narração dos fatos com cronologia
- Indicação dos crimes suspeitos com tipificação
- Indícios que fundamentam o pedido
- Especificidade e proporcionalidade da medida requerida
- Pedido final claro e delimitado
- Requerimento de sigilo e prazo

**Jurisprudência-chave:**
- STF RE 1.055.941/SP (Tema 990): compartilhamento COAF/Receita → MP sem autorização judicial
- STJ RMS 51.152/SP: requisitos para quebra de sigilo bancário
- STJ (Sexta Turma): invalidade por falta de fundamentação idônea
