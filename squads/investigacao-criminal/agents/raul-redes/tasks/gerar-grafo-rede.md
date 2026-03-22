---
task: gerar-grafo-rede
order: 3
agent: raul-redes
input: Mapa de vínculos (task 1) + Papéis (task 2)
output: output/relatorio-rede-criminal.md — relatório completo de rede
---

## Process

1. Criar tabela geral de atores com papel, centralidade e evidências-chave
2. Redigir descrição textual da estrutura da organização (nível 1: núcleo duro; nível 2: periferia)
3. Gerar representação em texto do grafo (lista de conexões que pode ser importada em ferramentas como Gephi, Maltego ou desenhada manualmente)
4. Formular hipótese de modus operandi com base nos vínculos financeiros e documentais
5. Identificar o que confirma a hipótese vs. o que ainda precisa ser investigado
6. Listar próximos passos investigativos recomendados
7. Salvar em output/relatorio-rede-criminal.md

## Output Format

Consultar pipeline/data/output-examples.md — Exemplo 2 (Relatório de Rede Criminal).

Adicionalmente, incluir seção de grafo textual:
```
GRAFO DE VÍNCULOS (formato: Nó A --[tipo]-- Nó B)
João Silva Santos --[Societário-85%]--> JS Construções Ltda
João Silva Santos --[Procuração]--> Ana Paula Torres
Carlos Menezes --[Societário-15%]--> JS Construções Ltda
[...]
```

## Quality Criteria

- [ ] Tabela de atores com papel + centralidade + evidências-chave
- [ ] Descrição textual da estrutura por nível (núcleo + periferia)
- [ ] Grafo textual de vínculos
- [ ] Hipótese de modus operandi formulada e sinalizada como hipótese
- [ ] O que confirma vs. o que falta investigar
- [ ] Próximos passos investigativos
- [ ] Salvo em output/relatorio-rede-criminal.md

## Veto Conditions

- Hipótese de modus operandi ausente → refazer
- Relatório sem distinção entre confirmado e hipotético → refazer
