---
task: analisar-rifs
order: 1
agent: debora-documentos
input: RIFs (Relatórios de Inteligência Financeira do COAF) fornecidos pelo usuário
output: Análise estruturada dos RIFs
---

## Process

1. Catalogar todos os RIFs recebidos (número, data, entidade analisada)
2. Para cada RIF: extrair titular das contas, período coberto, volumes totais (entradas + saídas)
3. Identificar tipologias de suspeita apontadas pelo COAF
4. Extrair e listar as contrapartes mais frequentes (quem enviou/recebeu recursos)
5. Calcular a razão entre faturamento declarado (se informado) e movimentação real
6. Identificar operações em espécie acima de R$ 50.000
7. Identificar transferências internacionais
8. Sinalizar com ⚠️ todas as anomalias detectadas

## Output Format

```yaml
rif:
  numero: "[n. X/AAAA]"
  titular: "[Nome — CPF/CNPJ]"
  periodo: "[DD/MM/AAAA a DD/MM/AAAA]"
  total_creditos: "R$ X"
  total_debitos: "R$ X"
  tipologias_coaf:
    - "[Tipologia 1]"
    - "[Tipologia 2]"
  contrapartes_recorrentes:
    - entidade: "[Nome — CPF/CNPJ]"
      operacoes: [N]
      total: "R$ X"
  anomalias:
    - descricao: "[descrição da anomalia]"
      valor: "R$ X"
      nivel: "[⚠️ CRÍTICO / ⚠️ RELEVANTE]"
```

## Quality Criteria

- [ ] Todos os RIFs catalogados
- [ ] Tipologias COAF identificadas para cada RIF
- [ ] Contrapartes recorrentes listadas
- [ ] Anomalias sinalizadas com ⚠️
- [ ] Razão faturamento declarado / movimentação real calculada (quando possível)

## Veto Conditions

- RIF recebido sem análise → refazer
- Anomalia grave (operações em espécie > R$ 100.000) sem sinalização → refazer
