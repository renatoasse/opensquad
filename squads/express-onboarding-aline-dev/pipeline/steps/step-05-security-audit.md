---
execution: inline
agent: "squads/express-onboarding-aline-dev/agents/gael-auditor"
outputFile: "squads/express-onboarding-aline-dev/output/audit-log.md"
model_tier: fast
---

# Step 05: Gael Auditor — Auditoria de Segurança

## Context Loading
- `squads/express-onboarding-aline-dev/_build/discovery.yaml`
- `squads/express-onboarding-aline-dev/memory.md`

## Instructions
1. Verificar Firestore Security Rules em busca de violações recentes
2. Analisar logs de requisições para padrões suspeitos
3. Identificar requisições sem licença ativa ou tentativas de acesso administrativo
4. Bloquear requisições suspeitas
5. Notificar a equipe no Telegram sobre cada incidente
6. Salvar registro de auditoria

## Output
Salve em `squads/express-onboarding-aline-dev/output/audit-log.md`:
- Requisições verificadas: total
- Incidentes detectados: quantidade e tipo
- Bloqueios realizados: quantidade
- Status geral: ✅ Seguro / ⚠️ Atenção / 🚨 Crítico

## Notificação Telegram
Use `telegram-bridge` para enviar ao thread_id 12:
- Sem incidentes: "🛡️ Gael Auditor: ✅ Auditoria — [N] reqs verificadas — 0 incidentes"
- Com incidentes: "🛡️ Gael Auditor: 🚨 [N] bloqueios — [tipo] — [detalhes]"

## Quality Criteria
- [ ] Logs de requisição analisados
- [ ] Incidentes registrados com timestamp
- [ ] Bloqueios aplicados quando necessário

## Veto Conditions
1. Incidente detectado mas não registrado no log
2. Bloqueio necessário mas não aplicado
