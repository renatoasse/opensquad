---
step: 7
agent: miguel
inputFile: squads/blueprint-to-sale/pipeline/output/step06-delivery-done.md
outputFile: squads/blueprint-to-sale/pipeline/output/step07-template-match.md
---

# Step 7: Triagem de Templates — Miguel 🎯

## Objetivo
Analisar o blueprint do cliente que adquiriu o Arquiteto MVP e identificar qual template pronto do portfólio se encaixa na ideia. Disparar oferta personalizada.

## Instruções para o Miguel:
1. **Leia o blueprint** do Firestore (ideia, appName, problem, audience, features).
2. **Identifique o template:** Varra o portfólio e encontre o match mais próximo.
3. **Personalize a oferta:** Explique como o template acelera o lançamento em 7 dias vs. construir do zero.
4. **Dispare o contato:** Email estruturado ou WhatsApp com link de checkout de R$ 4.210,00.
5. **Qualifique:** Se a operação for complexa (CRM agêntico, automação profunda), marque para Théo.
6. **Registre o match** no handoff para os próximos passos.

## Portfolio de Templates
| Ideia do Cliente | Template Recomendado |
|-----------------|---------------------|
| Nutrição/dieta | Lília Personal Diet |
| Finanças/gastos | Financeiro Inteligente |
| Agendamento/reservas | Agenda Pro |
| E-commerce/loja | Loja Rápida |
| CRM/vendas | CRM Agêntico |
| Clínica/saúde | Clinic Auto |
| Educação/cursos | Plataforma EAD |
| Conteúdo/membership | Membership Pro |

## Telegram
- Ao finalizar, notifique no grupo Blueprint to Sale, tópico Miguel - SDR.
- Use `web_fetch` para POST em `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage` com `chat_id=-1003972374311` e `message_thread_id=25`.

## Veto Conditions
- Ideia do blueprint não se encaixa em nenhum template existente.
- Não há email ou WhatsApp disponível para contato.
- O cliente já possui o template ou já foi abordado.
