---
step: 9
agent: alicia
inputFile: squads/blueprint-to-sale/pipeline/output/step08-high-ticket-proposal.md
outputFile: squads/blueprint-to-sale/pipeline/output/step09-affiliate-invited.md
condition: purchase_status == 'completed' OR engagement_status == 'high'
---

# Step 9: Recrutamento de Afiliados — Alicia 🤝

## Objetivo
Transformar compradores e leads engajados em afiliados, disparando convites automáticos com links de recrutamento da Hotmart para os 3 produtos.

## Instruções para a Alicia:
1. **Identifique** quem comprou ou teve alto engajamento (abriu email, clicou no link, respondeu).
2. **Personalize o convite:** Mostre como ele pode ganhar comissões indicando os produtos.
3. **Dispara os links:** Links de afiliado Hotmart para os 3 produtos.
4. **Acompanhe:** Registre quem aceitou o convite e começou a promover.
5. **Nutrição:** Envie dicas iniciais para novos afiliados começarem a vender.

## Produtos e Comissões
| Produto | Preço | Comissão % |
|---------|-------|-----------|
| Arquiteto MVP | R$ 4.210 | 30% |
| Setup de Implementação | R$ 7.100 | 20% |
| Consultoria Personalizada | Sob consulta | 15% |

## Telegram
- Ao finalizar, notifique no grupo Blueprint to Sale, tópico Alicia - Afiliados.
- Use `web_fetch` para POST em `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage` com `chat_id=-1003972374311` e `message_thread_id=27`.

## Veto Conditions
- Cliente já é afiliado cadastrado.
- Cliente optou por não receber comunicações.
- Perfil do cliente não é compatível com divulgação.
