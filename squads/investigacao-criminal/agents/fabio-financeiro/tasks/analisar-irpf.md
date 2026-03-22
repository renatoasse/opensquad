---
task: analisar-irpf
order: 1
agent: fabio-financeiro
input: Dados do IRPF (se disponíveis nos documentos) + relatório OSINT + relatório documental
output: Perfil de renda declarada por investigado
---

## Process

1. Para cada investigado, extrair renda declarada dos documentos disponíveis (IRPF, contratos, extratos)
2. Se IRPF não estiver disponível: registrar como "não disponível — requer INFOJUD" e usar renda estimada com base em vínculos societários
3. Para empresas: extrair faturamento declarado (Simples/Lucro Presumido) dos documentos ou via pesquisa (quando público)
4. Calcular renda acumulada estimada nos últimos 5-10 anos
5. Comparar renda declarada com a posição societária (compatível? Sócio administrador de empresa milionária declarando renda de R$ 50.000/ano é incompatível)
6. Identificar discrepâncias entre rendimentos declarados e estilo de vida identificado no OSINT

## Output Format

```yaml
investigado: "[Nome]"
renda_declarada:
  disponivel: [true/false]
  fonte: "[IRPF entregue / estimativa / não disponível]"
  renda_anual: "R$ X (ou 'não disponível')"
  renda_acumulada_estimada_5anos: "R$ X"
  patrimonio_declarado_irpf: "R$ X (ou 'não disponível')"
empresas:
  - nome: "[Nome da empresa]"
    faturamento_declarado: "R$ X/ano"
    fonte: "[Simples Nacional / estimativa]"
    compatibilidade_com_rif: "[compatível / incompatível (X vezes maior)]"
discrepancias:
  - "[descrição da discrepância encontrada]"
```

## Quality Criteria

- [ ] Todos os investigados analisados
- [ ] Lacuna declarada quando IRPF não disponível
- [ ] Renda acumulada estimada calculada
- [ ] Discrepâncias com estilo de vida registradas

## Veto Conditions

- Investigado principal sem análise de renda → refazer
