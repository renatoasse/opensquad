---
execution: inline
agent: "squads/prospeccao-b2b-sp/agents/leo-logica"
inputFile: "squads/prospeccao-b2b-sp/output/leads-formatados.md"
outputFile: "squads/prospeccao-b2b-sp/output/leads-diagnosticados.md"
---

# Step 03: Diagnóstico de Oportunidade

## Context Loading

Load these files before executing:
- `squads/prospeccao-b2b-sp/output/leads-formatados.md` — Lista de leads validados.
- `_opensquad/core/best-practices/strategist.md` — Framework para análise estratégica e diagnóstico de posicionamento.

## Instructions

### Process
1. Execute a task `analisar-maturidade.md` em cada lead da tabela, avaliando sua presença digital.
2. Identifique o gargalo (ex: sem automação no WhatsApp para agendamento noturno).
3. Execute a task `gerar-diagnostico.md` calculando o Custo de Oportunidade financeiro.
4. Finalize entregando um dossiê com o contraste entre R$ 50 mil (software tradicional) e a Validação de 7 dias do Aline Builds.

## Output Format

A saída DEVE seguir esta estrutura exata:
```markdown
# Dossiês de Diagnóstico

## Lead: [Empresa]
- **Dor**: [Dor identificada]
- **Custo de Oportunidade**: [Impacto em % ou R$]
- **Âncora e Contraste**: [50k vs 7 dias]
- **Ângulo de Venda**: [Como a copy deve atacar]

*(Repetir para todos os leads)*
```

## Output Example

# Dossiês de Diagnóstico

## Lead: Odonto Clean Moema
- **Dor**: Processo de agendamento 100% manual via WhatsApp (fechado à noite).
- **Custo de Oportunidade**: Perda de 30% dos leads noturnos (R$ 15.000 mensais perdidos).
- **Âncora e Contraste**: R$ 50k / 6 meses em dev tradicional vs. Automação IA validada em 7 dias pela Aline Builds.
- **Ângulo de Venda**: Urgência em fechar a torneira de dinheiro perdido de madrugada.

## Notificação Telegram
Após salvar o output, notifique no seu tópico do Telegram:
- Leia `pipeline/data/telegram-config.yaml` para seu `thread_id` (leo-logica: 8)
- Envie: `🧠 *Léo Lógica:* Diagnósticos concluídos! {N} leads analisados — Custo de Oportunidade mapeado`
- Use a skill `telegram-bridge` para enviar a mensagem

## Veto Conditions

Reject and redo if ANY of these are true:
1. O diagnóstico não calculou/estimou uma perda (dinheiro ou tempo).
2. O contraste de "Validação em 7 dias" não foi ancorado.

## Quality Criteria

- [ ] Todos os leads aprovados ganharam um dossiê.
- [ ] O argumento financeiro soa realista e impactante.
- [ ] O serviço (Arquiteto MVP/Automação) se encaixa na dor apresentada.
