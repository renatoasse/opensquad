# Critérios de Qualidade — Investigação Criminal (GAECO)

---

## Critérios Globais (aplicam-se a todos os agentes)

- [ ] Todos os dados estão documentados com fonte identificada e data de acesso
- [ ] Cada achado tem nível de confiança atribuído (Alta / Média / Baixa)
- [ ] Nenhuma suposição é apresentada como fato estabelecido
- [ ] Lacunas de informação são declaradas explicitamente
- [ ] Dados contraditórios são apresentados com ambos os lados, sem escolher um

---

## Orlando OSINT — Critérios de Qualidade

### Score mínimo para aprovação: 7/10

- [ ] **Cobertura de plataformas** (peso 2): Investigado pesquisado em ao menos 3 plataformas sociais diferentes
- [ ] **Fontes documentadas** (peso 2): Cada achado inclui URL, nome da plataforma e data de acesso
- [ ] **Nível de confiança** (peso 1): Atribuído a cada informação (Alta/Média/Baixa)
- [ ] **Cruzamento de dados** (peso 2): Informações corroboradas por fontes independentes
- [ ] **Ausência de suposições** (peso 1): Nenhum dado inferido apresentado como confirmado
- [ ] **Completude** (peso 2): Todos os investigados listados foram pesquisados

**Gatilhos de rejeição automática (qualquer um desses = REJEITAR):**
- Achado sem URL de fonte
- Investigado principal ausente do relatório
- Dado apresentado como confirmado sem corroboração

---

## Débora Documentos — Critérios de Qualidade

### Score mínimo para aprovação: 7/10

- [ ] **Extração completa** (peso 2): Todos os documentos entregues foram processados
- [ ] **Identificação de partes** (peso 2): Nome, CPF/CNPJ de todas as partes identificadas em cada documento
- [ ] **Sinalização de suspeitas** (peso 2): Inconsistências documentadas com explicação clara
- [ ] **Matriz de achados** (peso 2): Achados estruturados em formato tabular/lista
- [ ] **Cruzamento** (peso 2): Partes dos documentos cruzadas com lista de investigados

**Gatilhos de rejeição automática:**
- Documento entregue sem processamento (ignorado)
- Inconsistência grave não sinalizada

---

## Raul Redes — Critérios de Qualidade

### Score mínimo para aprovação: 7/10

- [ ] **Completude do mapa** (peso 2): Todos os atores identificados (OSINT + Docs) incluídos no mapa
- [ ] **Papéis documentados** (peso 2): Cada ator tem papel suspeito identificado (Líder/Operacional/Financeiro/Laranja/Facilitador) com justificativa
- [ ] **Vínculos com evidências** (peso 2): Cada vínculo tem pelo menos uma evidência/fonte citada
- [ ] **Narrativa da estrutura** (peso 2): Descrição textual da organização criminosa produzida
- [ ] **Identificação de núcleo duro** (peso 2): Distinção clara entre atores centrais e periféricos

**Gatilhos de rejeição automática:**
- Investigado principal ausente do mapa
- Papel atribuído sem qualquer evidência

---

## Fábio Financeiro — Critérios de Qualidade

### Score mínimo para aprovação: 7/10

- [ ] **Patrimônio declarado mapeado** (peso 2): IRPF/IRPJ de todos os investigados analisados
- [ ] **Patrimônio real identificado** (peso 2): Imóveis, veículos, empresas mapeados via bases abertas
- [ ] **Incompatibilidade quantificada** (peso 3): Diferença entre renda declarada e patrimônio real calculada
- [ ] **Empresas de fachada** (peso 1): Identificadas com critérios explícitos
- [ ] **Tipologia criminal** (peso 2): Possíveis crimes identificados (lavagem, sonegação, etc.) com base nos achados

**Gatilhos de rejeição automática:**
- Nenhum cruzamento entre renda declarada e patrimônio real feito
- Empresa de fachada suspeita não sinalizada

---

## Paula Penal — Critérios de Qualidade

### Score mínimo para aprovação: 8/10 (peças jurídicas têm padrão elevado)

- [ ] **Indícios suficientes** (peso 3): Cada pedido demonstra indícios concretos de autoria e materialidade
- [ ] **Imprescindibilidade** (peso 2): Necessidade da medida justificada (não bastam outros meios)
- [ ] **Especificidade** (peso 2): Pedido delimitado por titulares específicos e período temporal
- [ ] **Fundamentação legal** (peso 2): Artigos de lei e jurisprudência citados corretamente
- [ ] **Estrutura formal** (peso 1): Cabeçalho, qualificação, fatos, tipificação, pedido — todos presentes

**Gatilhos de rejeição automática:**
- Fishing expedition detectada (pedido genérico sem indícios específicos)
- Ausência de fundamentação legal
- Investigado não qualificado na peça

---

## Victor Veredito — Critérios de Qualidade

### Score mínimo para aprovação: 8/10

- [ ] **Todos os requisitos legais verificados** (peso 3): Checklist STJ/STF aplicado a cada peça
- [ ] **Coerência entre indícios e pedido** (peso 2): O que foi pedido é proporcional ao que foi provado
- [ ] **Ausência de fishing expedition** (peso 3): Nenhum pedido exploratório sem base
- [ ] **Estrutura formal completa** (peso 1): Todos os elementos obrigatórios presentes
- [ ] **Feedback acionável** (peso 1): Cada rejeição inclui o que mudar e como

**Gatilhos de rejeição automática:**
- Peça aprovada com fishing expedition evidente
- Peça com fundamentação jurídica incorreta aprovada

---

## Tabela Resumo de Aprovação

| Agente | Score Mínimo | Gatilhos de Rejeição |
|--------|-------------|----------------------|
| Orlando OSINT | 7/10 | Achado sem fonte, investigado ausente |
| Débora Documentos | 7/10 | Documento ignorado, inconsistência grave |
| Raul Redes | 7/10 | Investigado principal ausente, papel sem evidência |
| Fábio Financeiro | 7/10 | Nenhum cruzamento patrimonial |
| Paula Penal | 8/10 | Fishing expedition, ausência de fundamentação |
| Victor Veredito | 8/10 | Fishing expedition aprovada, erro jurídico aprovado |
