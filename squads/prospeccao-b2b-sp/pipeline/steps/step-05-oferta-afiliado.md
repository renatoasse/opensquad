---
execution: inline
agent: "squads/prospeccao-b2b-sp/agents/natan-negociador"
format: "whatsapp-broadcast"
inputFile: "squads/prospeccao-b2b-sp/output/copys-claude.md"
outputFile: "squads/prospeccao-b2b-sp/output/ofertas-afiliados.md"
---

# Step 05: Geração de Oferta Agressiva (Afiliados)

## Context Loading

Load these files before executing:
- `squads/prospeccao-b2b-sp/output/copys-claude.md` — Copys originais com o problema bem definido.
- `_opensquad/core/best-practices/whatsapp-broadcast.md` — Regras para copy curta de whatsapp (limite de 500 chars).

## Instructions

### Process
1. Leia a copy gerada no passo anterior.
2. Execute a task `criar-gancho-afiliado.md` para transformar a venda direta em uma oferta de parceira Risco Zero usando 4Ps.
3. Certifique-se de que a taxa de comissão ("75%") é o chamariz principal.

## Output Format

A saída DEVE seguir esta estrutura exata:
```markdown
# Ofertas de Afiliação (Plano B)

## [Empresa]
**Follow-up (WhatsApp):**
[Texto com foco em Risco Zero e 75%, menos de 500 caracteres, terminando com CTA fechada]
```

## Output Example

# Ofertas de Afiliação (Plano B)

## Odonto Clean Moema
**Follow-up (WhatsApp):**
Dr. João, se o investimento do Agente for uma barreira, que tal uma parceria risco-zero?

Nós implementamos a automação na clínica e dividimos os lucros gerados. Você fica com 75% da comissão no nosso sistema para cada novo paciente fechado pela IA.

Podemos avançar nesse modelo risco-zero até semana que vem?

## Notificação Telegram
Após salvar o output, notifique no seu tópico do Telegram:
- Leia `pipeline/data/telegram-config.yaml` para seu `thread_id` (natan-negociador: 10)
- Envie: `💸 *Natan Negociador:* Ofertas de afiliação geradas! {N} propostas Risco Zero com 75%`
- Use a skill `telegram-bridge` para enviar a mensagem

## Veto Conditions

Reject and redo if ANY of these are true:
1. O texto omitiu o termo "Risco Zero".
2. O texto omitiu a taxa "75%".

## Quality Criteria

- [ ] É um script curto e agressivo na conversão.
- [ ] Soou como uma oportunidade de negócios, não como um fornecedor barateando seu serviço.
