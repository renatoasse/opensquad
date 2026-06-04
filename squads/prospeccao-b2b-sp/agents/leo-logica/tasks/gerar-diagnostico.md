---
task: "Gerar Diagnóstico"
order: 2
input: |
  - leads_avaliados: A análise de maturidade
output: |
  - diagnosticos_financeiros: Os cálculos de Custo de Oportunidade
---

# Gerar Diagnóstico

Transforma a análise de maturidade em um argumento financeiro pesado: o "Custo de Oportunidade". Calcula valores estimados ou percentuais perdidos.

## Processo

1. Pega o ponto de dor do lead e converte em estimativa de perda.
2. Utiliza a âncora de mercado "Software Tradicional (50 mil e meses de dev)" como o inimigo.
3. Insere a salvação "Validação em 7 dias" com IA.
4. Entrega um dossiê curto por lead para a equipe de Copy usar.

## Output Format

```markdown
## Lead: [Empresa]
- **Dor**: [Resumo da dor]
- **Custo de Oportunidade**: [Cálculo/Estimativa de Perda R$ ou %]
- **Âncora e Contraste**: [R$ 50k vs. 7 dias]
- **Ângulo de Venda**: [Como abordar na copy]
```

## Output Example

## Lead: Odonto Clean Moema
- **Dor**: Processo de agendamento 100% manual e sem site.
- **Custo de Oportunidade**: Perda estimada de 30% dos pacientes noturnos (aqueles que tentam contato após as 19h e não recebem resposta).
- **Âncora e Contraste**: Gasto de agências tradicionais (R$ 50 mil / 6 meses) vs. Engine Aline Builds validando um Agente WhatsApp em 7 dias.
- **Ângulo de Venda**: Urgência em parar de sangrar caixa à noite através da nossa automação rápida.

## Quality Criteria
- [ ] O Custo de Oportunidade está monetizado ou parametrizado em % realista.
- [ ] A âncora de 50 mil e 6 meses está presente.
- [ ] O termo "Validação em 7 dias" está explícito no diagnóstico.

## Veto Conditions
Reject and redo if ANY are true:
1. O diagnóstico não citar impacto financeiro/perda de tempo (dor vazia).
2. O contraste (50 mil/6 meses x 7 dias) estiver faltando, pois sem ele a copy não terá força persuasiva.
