---
task: gerar-relatorio-patrimonial
order: 3
agent: fabio-financeiro
input: Tasks 1 e 2 concluídas
output: output/relatorio-patrimonial.md — relatório patrimonial completo
---

## Process

1. Consolidar análises de renda declarada e triangulação de ativos
2. Criar tabela de incompatibilidade patrimonial por investigado
3. Descrever estruturas de blindagem identificadas com critérios e evidências
4. Listar bens passíveis de constrição por investigado
5. Formular tipologias criminais suspeitas com base nos achados
6. Listar o que requer aprofundamento (quebra bancária, INFOJUD, cooperação jurídica)
7. Salvar em output/relatorio-patrimonial.md

## Output Format

Consultar pipeline/data/output-examples.md — exemplos de análise patrimonial.

Estrutura do relatório:
```markdown
# Relatório Patrimonial
[...]
## Tabela de Incompatibilidade por Investigado
| Investigado | Renda Acumulada Est. | Patrimônio Real | Incompatibilidade |
[...]
## Estruturas de Blindagem Identificadas
[...]
## Bens Passíveis de Constrição
[...]
## Tipologias Criminais Suspeitas
[...]
## Próximas Diligências Necessárias
[...]
```

## Quality Criteria

- [ ] Tabela de incompatibilidade para todos os investigados principais
- [ ] Estruturas de blindagem descritas com critérios
- [ ] Bens para constrição com medida cabível
- [ ] Tipologias criminais indicadas
- [ ] Próximas diligências listadas
- [ ] Salvo em output/relatorio-patrimonial.md

## Veto Conditions

- Relatório sem tabela de incompatibilidade → refazer
- Investigado principal ausente da tabela → refazer
