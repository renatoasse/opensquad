---
execution: inline
agent: "squads/prospeccao-b2b-sp/agents/caio-copy"
format: "email-sales"
inputFile: "squads/prospeccao-b2b-sp/output/leads-diagnosticados.md"
outputFile: "squads/prospeccao-b2b-sp/output/copys-claude.md"
---

# Step 04: Criação de Copy (CLAUDE)

## Context Loading

Load these files before executing:
- `squads/prospeccao-b2b-sp/output/leads-diagnosticados.md` — Diagnósticos com Custo de Oportunidade.
- `_opensquad/core/best-practices/copywriting.md` — PAS, Hook-first, métodos persuasivos.
- `_opensquad/core/best-practices/email-sales.md` — Regras para e-mail frio (menor que 150 palavras, 1 CTA).

## Instructions

### Process
1. Leia o diagnóstico de cada lead.
2. Execute a task `escrever-email-frio.md` usando o Método CLAUDE. Garanta que o assunto tem o nome da empresa e no máximo 6 palavras.
3. Execute a task `escrever-whatsapp.md` para criar uma variante ainda mais curta.
4. Use sempre uma CTA fechada de atrito mínimo ("Falamos 10 min?").

## Output Format

A saída DEVE seguir esta estrutura exata:
```markdown
# Copys Geradas (PAS + CLAUDE)

## [Empresa]

### E-mail
**Assunto:** [Até 6 palavras]
[Corpo do e-mail em parágrafos curtos, máx 150 palavras, focando em Custo de Oportunidade e Validacao em 7 dias]

### WhatsApp
[Corpo curto do whatsapp em até 4 blocos. Máximo 500 caracteres]
```

## Output Example

# Copys Geradas (PAS + CLAUDE)

## Odonto Clean Moema

### E-mail
**Assunto:** O agendamento noturno da Odonto Clean

Oi, Dr. João.

Notei que o agendamento da clínica ainda é manual. Clínicas na Zona Sul perdem cerca de 30% dos pacientes que tentam agendar após as 19h.

Você não precisa gastar R$ 50 mil e perder 6 meses com sistemas de gestão lentos. No Aline Builds, validamos um Agente de WhatsApp 24h em apenas 7 dias para fechar sua agenda automática.

Faz sentido fazermos uma ligação de 10 min amanhã?

### WhatsApp
Dr. João, tudo bem? Notei que a Odonto Clean não agenda à noite.

Vocês devem estar perdendo uns 30% dos pacientes que tentam falar após 19h.

Em vez de gastar R$ 50 mil num software, nós no Aline Builds validamos um Agente IA para você em 7 dias.

Podemos falar 10 min esta tarde para eu te mostrar?

## Notificação Telegram
Após salvar o output, notifique no seu tópico do Telegram:
- Leia `pipeline/data/telegram-config.yaml` para seu `thread_id` (caio-copy: 9)
- Envie: `✍️ *Caio Copy:* Copys geradas! {N} e-mails + {N} WhatsApp prontos para {N} leads`
- Use a skill `telegram-bridge` para enviar a mensagem

## Veto Conditions

Reject and redo if ANY of these are true:
1. O E-mail excede 150 palavras.
2. Existe mais de UMA pergunta (CTA) no final do texto.

## Quality Criteria

- [ ] A copy não contém o clichê "Espero que este e-mail o encontre bem".
- [ ] O problema é focado no negócio (perda de clientes), não apenas em tecnologia ("IA").
- [ ] O CTA é de baixo atrito (vender a reunião, não o produto).
