---
execution: inline
agent: "squads/express-onboarding-aline-dev/agents/helena-eng"
outputFile: "squads/express-onboarding-aline-dev/output/marketplace-log.md"
model_tier: powerful
---

# Step 03: Helena Eng — Entrega Marketplace de Códigos (R$ 4.210)

## Context Loading
- `squads/express-onboarding-aline-dev/_build/discovery.yaml`
- `squads/express-onboarding-aline-dev/memory.md`

## Instructions
1. Validar payload Hotmart (pagamento aprovado R$ 4.210 — Marketplace de Códigos)
2. Extrair nome do cliente, email, produto adquirido, transaction_id
3. Disparar acessos automáticos ao repositório GitHub do código adquirido
4. Provisionar ambiente Replit "AS-IS" com o código do Marketplace
5. Gerar e registrar links de acesso do cliente
6. Notificar no Telegram (thread_id: 11)

## Output
Salve em `squads/express-onboarding-aline-dev/output/marketplace-log.md`:
- run_id, cliente, produto
- Repositório GitHub: url + status
- Ambiente Replit: url + status
- Links de acesso enviados

## Notificação Telegram
Use `telegram-bridge` para enviar ao thread_id 11:
"⚙️ Helena Eng: Marketplace [produto] → [cliente] — Repo ✅ — Replit ✅ — Links ✅"

## Quality Criteria
- [ ] Repositório GitHub criado como privado com o código do Marketplace
- [ ] Ambiente Replit provisionado e acessível
- [ ] Links de acesso gerados e registrados no log

## Veto Conditions
1. Links de acesso enviados antes do ambiente estar pronto
2. Log sem registrar URLs finais
