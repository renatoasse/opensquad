---
task: redigir-cautelares
order: 2
agent: paula-penal
input: Relatórios consolidados + instrução do usuário sobre quais cautelares solicitar
output: Medidas cautelares diversas da prisão e/ou pedido de prisão preventiva
---

## Process

1. Avaliar se os indícios justificam medidas cautelares diversas ou prisão preventiva:
   - Prisão preventiva: fumus comissi delicti + periculum libertatis (ordem pública, econômica, instrução ou aplicação da lei)
   - Cautelares diversas: quando a prisão for desproporcional mas houver necessidade de restrição
2. Para prisão preventiva: verificar requisito de crime com pena > 4 anos (regra geral)
3. Para cada medida cautelar: demonstrar necessidade e proporcionalidade
4. Redigir a(s) peça(s) conforme necessidade:
   - Representação por prisão preventiva (art. 311, CPP)
   - Pedido de medidas cautelares diversas (art. 319, CPP)
5. Informar ao usuário se os indícios são insuficientes para a medida pretendida

**Para prisão preventiva, demonstrar:**
- Fumus comissi delicti: indícios de autoria + materialidade (resumo das provas)
- Periculum libertatis: ao menos UM dos fundamentos:
  * Garantia da ordem pública: reiteração, gravidade concreta, clamor social fundamentado
  * Garantia da ordem econômica: continuidade da atividade criminosa que impacta a economia
  * Conveniência da instrução: risco de destruição de provas ou intimidação de testemunhas
  * Assegurar aplicação da lei penal: indícios de fuga ou ocultação

## Output Format

Seção no arquivo output/pecas-juridicas.md:

```markdown
## Representação por Prisão Preventiva — [Investigado(s)]
[peça completa]

## Pedido de Medidas Cautelares Diversas — [Investigado(s)]
[peça completa]
```

## Quality Criteria

- [ ] Fumus comissi delicti demonstrado com referência às provas concretas
- [ ] Periculum libertatis demonstrado com fundamento específico (não genérico)
- [ ] Proporcionalidade avaliada (prisão como última opção quando cautelares são suficientes)
- [ ] Tipificação correta dos crimes (artigos + incisos)
- [ ] Informado ao usuário quando indícios são insuficientes

## Veto Conditions

- Prisão preventiva pedida apenas com "gravidade abstrata do crime" sem fundamento concreto → refazer
- Periculum libertatis não demonstrado → refazer
