---
task: revisar-estrutura-formal
order: 2
agent: victor-veredito
input: Task 1 concluída (análise de fundamentação) + peças originais
output: output/revisao-juridica.md — veredito final com feedback completo
---

## Process

1. Receber resultado da task 1 (análise de fundamentação)
2. Para cada peça, verificar estrutura formal:
   - Cabeçalho completo (vara, comarca, PIC)
   - Preâmbulo com identificação do MP e atribuições legais
   - Seções obrigatórias: Fatos, Direito, Pedido
   - Qualificação dos investigados/acusados com CPF
   - Fecho com data, comarca, assinatura
3. Verificar formatação jurídica: linguagem formal, tratamento correto do juízo, verbos no imperativo nos pedidos
4. Calcular score geral (média dos critérios de fundamentação da task 1 + critérios formais)
5. Aplicar regra de decisão:
   - APROVADO: score >= 8.0 E nenhum critério obrigatório falhou
   - APROVADO COM RESSALVAS: score >= 7.0 E nenhum crítico falhou, mas há melhorias
   - REJEITADO: score < 7.0 OU critério obrigatório falhou
6. Redigir veredito final com:
   - Pontos fortes (ao menos um por peça)
   - Críticas com localização + problema + como corrigir
   - Caminho para aprovação (se rejeitado)
7. Salvar em output/revisao-juridica.md

## Output Format

```markdown
# Revisão Jurídica — Victor Veredito
Procedimento: [PIC n. X/AAAA]
Data: [YYYY-MM-DD]

---

## [Tipo de peça] — [Investigado]

VEREDITO: [APROVADO / APROVADO COM RESSALVAS / REJEITADO]

SCORE GERAL: X.X/10

[Tabela de scores por critério]

PONTOS FORTES:
- [ponto forte específico]

OBRIGATÓRIO CORRIGIR: (se aplicável)
- [problema + onde + como corrigir]

SUGESTÕES (não bloqueantes):
- [sugestão]

CAMINHO PARA APROVAÇÃO: (se rejeitado)
1. [ação 1]
2. [ação 2]
```

## Quality Criteria

- [ ] Veredito emitido para cada peça
- [ ] Score calculado com critérios de fundamentação + formais
- [ ] Pontos fortes identificados em cada peça
- [ ] Feedback acionável em cada crítica
- [ ] Caminho para aprovação em caso de rejeição
- [ ] Salvo em output/revisao-juridica.md

## Veto Conditions

- Veredito sem score calculado → refazer
- Rejeição sem indicar o que corrigir → refazer
