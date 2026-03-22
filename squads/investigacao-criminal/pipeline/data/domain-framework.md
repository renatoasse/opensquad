# Framework Operacional — Investigação Criminal (GAECO)

---

## Visão Geral do Processo Investigativo

O squad de Investigação Criminal opera em ciclos estruturados, desde a chegada de uma denúncia até a geração de peças jurídicas fundamentadas. O framework é baseado nas melhores práticas do GAECO, COAF e metodologias internacionais de OSINT e análise de redes.

---

## Fase 1: Coleta de Inteligência

### 1.1 OSINT — Fontes Abertas

**Processo:**
1. Identificar todos os investigados com nome completo, apelidos, CPF (quando disponível)
2. Buscar perfis em: Instagram, Facebook, X/Twitter, TikTok, LinkedIn, YouTube
3. Verificar usernames consistentes entre plataformas
4. Coletar: fotos, localização, vínculos declarados, grupos, empresas mencionadas
5. Realizar reverse image search nas principais fotos
6. Cruzar geolocalização de posts com endereços conhecidos
7. Pesquisar CPF/CNPJ em bases abertas (Receita, JUCESP/JUCEMG, cartórios)
8. Documentar todas as fontes com URL + data de acesso + nível de confiança

**Confiança:**
- Alta: 3+ fontes independentes confirmam o mesmo dado
- Média: 2 fontes
- Baixa: fonte única ou dados conflitantes

### 1.2 Análise de Documentos

**Processo:**
1. Receber e catalogar documentos: RIFs, escrituras, matrículas, procurações, relatórios policiais
2. Extrair de cada documento: partes envolvidas, datas, valores, localidades, atos jurídicos
3. Identificar laranjas: pessoas com procurações amplas sem razão aparente
4. Cruzar titularidades (imóveis, veículos, empresas) com o quadro de investigados
5. Sinalizar inconsistências: datas suspeitas, valores incompatíveis, partes recorrentes
6. Estruturar achados em matriz: [Documento] → [Partes] → [Valor/Ato] → [Suspeita]

---

## Fase 2: Análise e Síntese

### 2.1 Análise de Redes Criminais

**Processo:**
1. Listar todos os atores identificados (PF + PJ) com seus papéis suspeitos
2. Mapear todos os vínculos: familiar, societário, financeiro, comunicação, residência
3. Calcular centralidade para cada ator (quantas conexões tem / qual posição na rede)
4. Identificar o núcleo duro (líderes + operacionais) x a periferia (laranjas + facilitadores)
5. Documentar todos os vínculos com fonte e evidência
6. Gerar narrativa descritiva da estrutura da organização

**Papéis típicos numa organização criminosa:**
- **Líder**: toma decisões, controla a rede, menor exposição direta
- **Operacional**: executa as atividades criminosas, alta exposição
- **Financeiro/Lavador**: gerencia os recursos ilícitos
- **Laranja**: detém formalmente bens ou contas sem ser o beneficiário real
- **Facilitador**: provê serviços (contador, advogado, despachante)

### 2.2 Análise Patrimonial

**Processo:**
1. Mapear todo o patrimônio declarado (IRPF/IRPJ) dos investigados e sua rede próxima
2. Identificar patrimônio real (imóveis, veículos, empresas, participações societárias)
3. Calcular compatibilidade entre renda declarada e patrimônio acumulado
4. Verificar transferências de ativos nos últimos anos (alienações, doações, cessões)
5. Identificar empresas de fachada: sem faturamento real, atividade incompatível, sócios laranjas
6. Documentar incompatibilidades com indicação de possível crime (sonegação, lavagem, etc.)

---

## Fase 3: Geração de Peças Jurídicas

### 3.1 Pedidos de Quebra de Dados

**Sequência de elaboração:**
1. Identificar qual tipo de quebra é necessário (cadastral, bancária, fiscal, telemática)
2. Nomear os titulares com precisão (nome, CPF/CNPJ, banco/operadora)
3. Delimitar o período temporal da quebra
4. Narrar os fatos com indicação dos indícios que justificam a medida
5. Demonstrar a imprescindibilidade (por que outros meios são insuficientes)
6. Formular o pedido de forma específica e proporcional
7. Adicionar fundamentos legais e jurisprudência pertinente

### 3.2 Medidas Cautelares Diversas

**Tipos e requisitos:**
- Proibição de ausentar-se do país: risco de fuga + gravidade do crime
- Suspensão do exercício de função: risco de obstrução via cargo
- Monitoração eletrônica: como alternativa à prisão preventiva
- Fiança: compatível com a capacidade econômica

### 3.3 Prisão Preventiva

**Requisitos cumulativos:**
- Fumus comissi delicti: indícios suficientes de autoria e materialidade
- Periculum libertatis: ao menos um de: garantia da ordem pública, garantia da ordem econômica, conveniência da instrução criminal, assegurar aplicação da lei penal

### 3.4 Denúncia

**Estrutura obrigatória:**
1. Cabeçalho (promotor, vara, número do procedimento)
2. Qualificação dos acusados
3. Narrativa dos fatos (cronológica, com datas, valores, locais)
4. Tipificação legal (artigos, incisos, qualificadoras)
5. Indicação das provas (documentais, telemáticas, depoimentos)
6. Rol de testemunhas
7. Requerimentos finais
8. Pedido de recebimento da denúncia

---

## Critérios de Qualidade por Fase

| Fase | Critério de Sucesso |
|------|---------------------|
| OSINT | Todos os investigados mapeados em pelo menos 2 plataformas |
| Docs | Todos os documentos catalogados com achados estruturados |
| Redes | Grafo documentado com papéis identificados para cada ator |
| Patrimonial | Incompatibilidade patrimonial quantificada (se houver) |
| Peças | Todos os requisitos legais atendidos, sem fishing expedition |
| Revisão | Fundamentação idônea validada por critérios STJ/STF |
