---
execution: inline
agent: "squads/prospeccao-b2b-sp/agents/marcelo-validador"
on_reject: 4
inputFile: "squads/prospeccao-b2b-sp/output/ofertas-afiliados.md"
outputFile: "squads/prospeccao-b2b-sp/output/scripts-finais-aprovados.md"
---

# Step 07: Revisão e Setup de Disparo

## Context Loading

Load these files before executing:
- `squads/prospeccao-b2b-sp/output/copys-claude.md` — Mensagens primárias.
- `squads/prospeccao-b2b-sp/output/ofertas-afiliados.md` — Mensagens de afiliado.
- `_opensquad/core/best-practices/review.md` — Padrão de pontuação rigorosa.

## Instructions

### Process
1. Execute a task `revisar-qualidade-copy.md` em TODAS as copys geradas para cada lead. 
2. Retorne o "VERDICT: REJECT" se qualquer email passar de 150 palavras, ou WhatsApp não tiver CTA claro ou usar "Eu acho que".
3. Em caso de aprovação geral, execute a task `preparar-disparo.md` para formatar e entregar um documento limpo, inserindo um placeholder para `[Link de Afiliação/Agendamento]`.

## Output Format

A saída DEVE seguir esta estrutura exata:
```markdown
# Script Pronto: [Empresa]
**Canal**: [Canal]
**Veredito**: APPROVE (Score X/10)

[Mensagem Limpa]
```

*(Se houver REJECT, pare de compilar e retorne imediatamente o feedback de erro).*

## Output Example

# Script Pronto: Odonto Clean Moema
**Canal**: WhatsApp (Follow-up)
**Veredito**: APPROVE (Score 9/10)

Dr. João, se o investimento do Agente for uma barreira, que tal uma parceria risco-zero?

Nós implementamos a automação na clínica e dividimos os lucros gerados. Você fica com 75% da comissão para cada novo paciente.

Podemos avançar nesse modelo risco-zero?
*(Link:* `[INSERIR LINK HOTMART/AGENDA AQUI]` *)*

## Notificação Telegram
Após salvar o output, notifique no seu tópico do Telegram:
- Leia `pipeline/data/telegram-config.yaml` para seu `thread_id` (marcelo-validador: 11)
- Envie: `📤 *Marcelo Validador:* Scripts revisados! Veredito: {APPROVED/REJECTED} — {N} scripts prontos`
- Use a skill `telegram-bridge` para enviar a mensagem

## Veto Conditions

Reject and redo if ANY of these are true:
1. Uma copy foi formatada com anotações internas da IA.
2. O veredito aprovou um texto sem CTA explícita no final.

## Quality Criteria

- [ ] Saída pronta para o disparo manual ou via API, totalmente limpa.
- [ ] Veredito claro de Aprovação.
