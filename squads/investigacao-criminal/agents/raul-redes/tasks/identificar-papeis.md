---
task: identificar-papeis
order: 2
agent: raul-redes
input: Mapa de vínculos (task 1)
output: Papéis suspeitos identificados + centralidade calculada
---

## Process

1. Para cada ator no mapa, calcular centralidade:
   - Contar número de vínculos diretos
   - Verificar se conecta diferentes partes da rede (betweenness)
   - Classificar: Alta (5+ vínculos ou posição estratégica) / Média (3-4) / Baixa (1-2)
2. Identificar papel suspeito para cada ator com base nos padrões:
   - Líder: alta centralidade + controle societário + menor exposição operacional
   - Operacional Financeiro: alto volume de transações financeiras + centralidade alta
   - Laranja: vínculo por procuração ampla + bens em nome + sem atividade econômica compatível
   - Facilitador: profissional liberal (contador, advogado) com múltiplos vínculos com a rede
   - Desconhecido: precisa de mais investigação
3. Para cada papel atribuído: listar as 2-3 principais evidências
4. Identificar o "núcleo duro" (atores de alta centralidade que formam o centro da rede)
5. Identificar pontos de vulnerabilidade (atores cuja remoção fragmentaria a rede)
6. Sinalizar atores que precisam de mais investigação

## Output Format

```yaml
nucleoduro:
  - nome: "[Nome]"
    centralidade: "Alta"
    papel_suspeito: "[Líder/Operacional/etc]"
    evidencias:
      - "[evidência 1]"
      - "[evidência 2]"

perifericos:
  - nome: "[Nome]"
    centralidade: "[Média/Baixa]"
    papel_suspeito: "[Laranja/Facilitador/Desconhecido]"
    evidencias:
      - "[evidência 1]"

pontos_vulnerabilidade:
  - nome: "[Nome]"
    razao: "[por que a remoção desse ator impacta a rede]"

atores_a_investigar_mais:
  - nome: "[Nome]"
    lacuna: "[o que falta saber]"
```

## Quality Criteria

- [ ] Centralidade calculada para todos os atores
- [ ] Papel atribuído a todos os atores com pelo menos 1 evidência
- [ ] Núcleo duro explicitado
- [ ] Pontos de vulnerabilidade identificados
- [ ] Atores que precisam de mais investigação sinalizados

## Veto Conditions

- Papel atribuído sem nenhuma evidência listada → refazer
- Nenhum ator de centralidade Alta identificado numa rede com 5+ atores → revisar
