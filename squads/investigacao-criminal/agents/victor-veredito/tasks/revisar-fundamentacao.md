---
task: revisar-fundamentacao
order: 1
agent: victor-veredito
input: output/pecas-juridicas.md — peças produzidas por Paula Penal
output: Análise de fundamentação jurídica por peça
---

## Process

1. Para cada peça, verificar os critérios obrigatórios (qualquer falha = REJEITAR imediatamente):
   - Fishing expedition ausente?
   - Indícios concretos de autoria e materialidade presentes?
   - Imprescindibilidade da medida demonstrada?
   - Titulares identificados e período delimitado?
   - Fundamentação jurídica correta (lei + jurisprudência do STJ/STF)?

2. Para cada peça, avaliar qualidade da fundamentação (escala 1-10):
   - Clareza dos fatos narrados (cronologia, datas, valores)
   - Nexo entre indícios e pedido (o pedido segue logicamente dos fatos)
   - Proporcionalidade da medida
   - Correta identificação dos fundamentos legais
   - Coerência interna (sem contradições dentro da peça)

3. Verificar jurisprudência citada:
   - STJ RMS 51.152/SP para quebra bancária
   - STF Tema 990 quando relevante (Receita/COAF → MP)
   - Precedente de fundamentação idônea (STJ, Sexta Turma)

4. Para prisão preventiva: verificar fumus comissi delicti + periculum libertatis individualmente

5. Para denúncia: verificar justa causa por acusado

## Output Format

Por peça analisada:
```markdown
### [Tipo de peça] — [Investigado]

CRITÉRIOS OBRIGATÓRIOS:
- [✓/✗] Fishing expedition ausente
- [✓/✗] Indícios concretos presentes
- [✓/✗] Imprescindibilidade demonstrada
- [✓/✗] Delimitação (titular + período)
- [✓/✗] Fundamentação jurídica correta

SCORES DE QUALIDADE:
| Critério | Score | Observação |
[tabela]

Resultado da análise de fundamentação: [APROVADA/REJEITADA para a próxima task]
```

## Quality Criteria

- [ ] Todos os critérios obrigatórios verificados para cada peça
- [ ] Score atribuído a cada critério de qualidade com justificativa
- [ ] Fishing expedition verificada explicitamente
- [ ] Jurisprudência validada (citada corretamente)

## Veto Conditions

- Fishing expedition detectada e não sinalizada → refazer
- Peça aprovada com fundamentação jurídica incorreta → refazer
