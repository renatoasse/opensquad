---
task: redigir-pedidos-quebra
order: 1
agent: paula-penal
input: Todos os relatórios consolidados + instrução do usuário sobre quais quebras solicitar
output: Pedidos de quebra de dados (cadastral, bancária, fiscal, telemática)
---

## Process

1. Identificar quais tipos de quebra são necessários com base nos relatórios e na instrução do usuário
2. Para cada tipo de quebra, verificar se há indícios suficientes:
   - Cadastral: basta saber que o investigado tem conta/linha (baixo limiar)
   - Bancária: requer indícios de movimentação suspeita (RIF ou incompatibilidade patrimonial)
   - Fiscal: requer incompatibilidade patrimonial documentada
   - Telemática: requer indícios de comunicação relacionada ao crime
3. Para cada quebra que tem indícios suficientes: redigir a peça com estrutura completa
4. Para cada quebra que NÃO tem indícios suficientes: informar ao usuário o que falta

**Estrutura de cada pedido:**
- Cabeçalho (vara, comarca, PIC)
- Preâmbulo (identificação do MP, atribuições, procedimento)
- I — DOS FATOS (narrativa cronológica com fontes)
- II — DO DIREITO (fundamentação legal + jurisprudência)
- III — DO PEDIDO (delimitado: titular + tipo de dado + período)

5. Verificar: nenhum pedido é "fishing expedition" — todo pedido tem nexo específico com o crime

## Output Format

Cada peça em seção separada no arquivo output/pecas-juridicas.md:

```markdown
## [Tipo de Quebra] — [Investigado]

EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO
[...]

I — DOS FATOS
[...]

II — DO DIREITO
[...]

III — DO PEDIDO
[...]
```

## Quality Criteria

- [ ] Todos os investigados com indícios suficientes incluídos
- [ ] Cada pedido tem fundamentação específica (não copiada/colada sem adaptação)
- [ ] Período temporal delimitado em todos os pedidos
- [ ] Jurisprudência do STJ/STF citada
- [ ] Nenhum fishing expedition detectado
- [ ] Informado ao usuário quando indícios são insuficientes para alguma quebra

## Veto Conditions

- Pedido de quebra sem indícios concretos → não redigir, informar usuário
- Período não delimitado → refazer
- Investigado não qualificado → refazer
