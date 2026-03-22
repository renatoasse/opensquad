# Exemplos de Output — Investigação Criminal (GAECO)

---

## Exemplo 1: Relatório OSINT — Investigado João Silva Santos

```
RELATÓRIO DE INTELIGÊNCIA OSINT
Investigado: João Silva Santos (CPF: 000.000.000-00)
Procedimento: PIC 001/2026-GAECO
Data de produção: 2026-03-22

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRESENÇA DIGITAL

Instagram: @joaosilva_js
  - Conta criada: 2018 (estimado)
  - Seguidores: 1.240
  - Posts analisados: 47
  - Localização frequente: São Paulo/SP, Balneário Camboriú/SC
  - Menções recorrentes: "JS Construções", "JS Participações"
  - Perfil aparentemente de vida social/ostentação (viagens, carros, restaurantes)
  - Fonte: https://instagram.com/joaosilva_js | Acessado: 2026-03-22
  - Confiança: ALTA (perfil verificado com foto cruzada com documentos)

Facebook: joao.silva.santos.342
  - Amigos listados: inclui Carlos Menezes (investigado) e Pedro Antunes (a verificar)
  - Vínculos declarados: "Dono — JS Construções"
  - Cidade natal: Campinas/SP
  - Fonte: facebook.com | Acessado: 2026-03-22
  - Confiança: ALTA

LinkedIn: Não localizado
  - Confiança: N/A

CONSULTAS EM BASES ABERTAS

CPF: 000.000.000-00
  - Situação: Regular
  - Endereços vinculados: Rua das Acácias, 450, São Paulo/SP | Av. Beira-Mar, 1800, apt 801, Balneário Camboriú/SC
  - Fonte: Receita Federal (consulta pública) | Acessado: 2026-03-22
  - Confiança: ALTA

CNPJs vinculados:
  - JS Construções Ltda (CNPJ: 00.000.000/0001-00) — Sócio administrador (85%)
  - JS Participações S.A. (CNPJ: 00.000.001/0001-00) — Sócio (30%)
  - Construtora Alfa Ltda (CNPJ: 00.000.002/0001-00) — Sócio oculto suspeito (via procuração)
  - Fonte: Receita Federal (CNPJ) | Acessado: 2026-03-22
  - Confiança: ALTA para primeiros dois; MÉDIA para Alfa (via inferência de procuração)

VEÍCULOS (DETRAN):
  - Toyota Land Cruiser 2024 (placa ABC-0001) — proprietário: João Silva Santos
  - Porsche Cayenne 2022 (placa DEF-0002) — proprietário: JS Construções Ltda
  - Confiança: ALTA

IMÓVEIS (CARTÓRIO):
  - Matrícula 00001 — Rua das Acácias, 450, São Paulo/SP — valor declarado R$ 850.000
  - Matrícula 00002 — Av. Beira-Mar, 1800, apt 801, Balneário Camboriú/SC — valor declarado R$ 1.200.000
  - Fonte: Cartório de Registro de Imóveis | Acessado: 2026-03-22
  - Confiança: ALTA

LACUNAS IDENTIFICADAS
  - Não foi possível verificar contas em bancos específicos (requer quebra de sigilo)
  - Nenhum perfil profissional no LinkedIn encontrado (ausência pode ser intencional)
  - Sócios da Construtora Alfa ainda não foram identificados completamente

SCORE DE CONFIANÇA GERAL: ALTO — dados confirmados por múltiplas fontes independentes
```

---

## Exemplo 2: Relatório de Rede Criminal

```
RELATÓRIO DE ANÁLISE DE REDE CRIMINAL
Organização: Suspeita de organização voltada a fraudes tributárias
Procedimento: PIC 001/2026-GAECO
Data: 2026-03-22

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ATORES IDENTIFICADOS

| # | Nome | CPF | Papel Suspeito | Centralidade |
|---|------|-----|----------------|-------------|
| 1 | João Silva Santos | 000.000.000-00 | LÍDER | Alta |
| 2 | Carlos Menezes | 000.000.001-00 | OPERACIONAL FINANCEIRO | Alta |
| 3 | Ana Paula Torres | 000.000.002-00 | LARANJA (sócia fachada) | Baixa |
| 4 | Roberto Cunha (contador) | 000.000.003-00 | FACILITADOR | Média |
| 5 | JS Construções Ltda | CNPJ: 00.000.000 | EMPRESA OPERACIONAL | Alta |
| 6 | Construtora Alfa Ltda | CNPJ: 00.000.002 | EMPRESA FACHADA | Média |

VÍNCULOS MAPEADOS

João (1) → Carlos (2): vínculo societário (JS Construções) + comunicação confirmada (fonte: RIF/COAF)
João (1) → Ana Paula (3): procuração ampla outorgada em 2023 (fonte: escritura cartorial)
João (1) → Roberto (4): relação profissional (serviços de contabilidade) (fonte: contratos)
Carlos (2) → JS Construções (5): sócio administrador 15% (fonte: Receita Federal)
Ana Paula (3) → Construtora Alfa (6): sócia majoritária 80% (fonte: Receita Federal)
Construtora Alfa (6) → João (1): suspeita de beneficiário real oculto (fonte: padrão de movimentação)

ESTRUTURA DA ORGANIZAÇÃO

A organização apresenta estrutura em dois níveis:

NÚCLEO DURO (alta centralidade):
  - João Silva Santos: líder, tomador de decisões, controla JS Construções diretamente
  - Carlos Menezes: braço financeiro, gerencia movimentações entre empresas

PERIFERIA (baixa exposição):
  - Ana Paula Torres: laranja, nome formal em empresas sem real atividade de gestão
  - Roberto Cunha: facilitador contábil, provê cobertura formal para movimentações
  - Construtora Alfa: empresa de fachada usada para triangulação fiscal

HIPÓTESE DE MODUS OPERANDI
JS Construções contrata serviços fictícios da Construtora Alfa (controlada via laranja por João), gerando
créditos fiscais indevidos e transferindo recursos para fora do alcance do fisco. Roberto Cunha provê
a documentação formal. Estimativa de prejuízo ao erário: a quantificar (requer quebra bancária).
```

---

## Exemplo 3: Pedido de Quebra de Sigilo Bancário

```
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA __ VARA CRIMINAL DA COMARCA DE SÃO PAULO

MINISTÉRIO PÚBLICO DO ESTADO DE SÃO PAULO, pelo Promotor de Justiça signatário, no exercício de suas
atribuições junto ao GAECO — Grupo de Atuação Especial de Combate ao Crime Organizado,
nos autos do PIC n. 001/2026, vem, respeitosamente, requerer a Vossa Excelência:

QUEBRA DE SIGILO BANCÁRIO

I — DOS FATOS

No curso do PIC n. 001/2026, instaurado em 15/01/2026, o Ministério Público apura a prática de crime
de organização criminosa (art. 2º, Lei 12.850/2013) e sonegação fiscal (art. 1º, Lei 8.137/1990) por
João Silva Santos (CPF: 000.000.000-00) e Carlos Menezes (CPF: 000.000.001-00).

As investigações revelaram:
(i) existência de organização criminosa voltada à prática sistemática de fraudes tributárias mediante
    emissão de notas fiscais fictícias entre empresas controladas pelos investigados;
(ii) incompatibilidade entre o patrimônio declarado pelos investigados (IRPF: R$ 280.000 anuais) e
    o patrimônio real identificado (imóveis e veículos: R$ 2.050.000);
(iii) relatório de inteligência financeira do COAF (RIF n. 0001/2026) apontando movimentações
    atípicas de R$ 1.200.000 em contas da JS Construções Ltda entre jan/2024 e dez/2025.

II — DO DIREITO

O direito ao sigilo bancário não é absoluto, podendo ser afastado quando demonstrada a necessidade para
apuração de ilícito penal (STJ, RMS 51.152/SP). A medida é cabível quando presentes:
(i) indícios concretos da prática de ilícito — presentes, nos termos acima;
(ii) imprescindibilidade da medida — os documentos obtidos até agora permitem identificar a existência
    da organização e o modus operandi, mas não quantificar o prejuízo ao erário nem rastrear a
    destinação dos recursos;
(iii) pertinência temática — os dados requeridos dizem respeito diretamente às contas utilizadas
    nas operações investigadas;
(iv) delimitação precisa — por titulares e período específicos.

III — DO PEDIDO

Ante o exposto, requer:
a) A quebra do sigilo bancário de João Silva Santos (CPF: 000.000.000-00), relativa às contas
   mantidas em qualquer instituição financeira no período de 01/01/2024 a 31/12/2025;
b) A quebra do sigilo bancário de JS Construções Ltda (CNPJ: 00.000.000/0001-00) no mesmo período;
c) O envio pela autoridade coatora ao BACEN/SISBAJUD da ordem de encaminhamento, por todas as
   instituições, dos extratos completos e posições de saldo no período requerido;
d) O sigilo da presente decisão e dos documentos obtidos em face dos investigados, até que a
   instrução processual o permita.

São Paulo, 22 de março de 2026.

Promotor de Justiça / GAECO
```
