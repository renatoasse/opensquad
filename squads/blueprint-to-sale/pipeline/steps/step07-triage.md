---
step: 7
agent: miguel
inputFile: squads/blueprint-to-sale/pipeline/output/step06-delivery-done.md
outputFile: squads/blueprint-to-sale/pipeline/output/step07-template-match.md
---

# Step 7: Triagem de Templates — Miguel 🎯

## Objetivo
Analisar o blueprint do cliente e identificar qual produto se encaixa: template app (R$ 4.210) ou agente de automação (R$ 7.100 + R$ 520/mês).

## Instruções para o Miguel:
1. **Leia o blueprint** do Firestore (ideia, appName, problem, audience, features).
2. **Classifique o blueprint:**
   - `app` → Varra o portfólio de templates e encontre o match mais próximo. Dispare oferta de R$ 4.210,00.
   - `agente` → Pule a triagem de templates. Dispare oferta de Agente de Automação (R$ 7.100,00 + R$ 520,00/mês) explicando o valor da automação contínua.
3. **Personalize a oferta:**
   - `app`: Explique como o template acelera o lançamento em 7 dias vs. construir do zero.
   - `agente`: Apresente o agente como um funcionário virtual que trabalha 24/7 — setup de R$ 7.100 + manutenção de R$ 520/mês.
4. **Dispare o contato:** Email estruturado ou WhatsApp com link de checkout apropriado.
5. **Qualifique:** Se a operação for complexa demais para template simples (múltiplas integrações, automação profunda), marque para Théo.
6. **Registre o match** no handoff para os próximos passos.

## Portfolio de Produtos
| Tipo | Produto | Preço |
|------|---------|-------|
| app | Lília Personal Diet | R$ 4.210 |
| app | Financeiro Inteligente | R$ 4.210 |
| app | Agenda Pro | R$ 4.210 |
| app | Loja Rápida | R$ 4.210 |
| app | CRM Agêntico | R$ 4.210 |
| app | Clinic Auto | R$ 4.210 |
| app | Plataforma EAD | R$ 4.210 |
| app | Membership Pro | R$ 4.210 |
| agente | Assistente Virtual IA | R$ 7.100 + R$ 520/mês |
| agente | Chatbot Inteligente | R$ 7.100 + R$ 520/mês |
| agente | Automatizador de Processos | R$ 7.100 + R$ 520/mês |
| agente | Triador Inteligente de Leads | R$ 7.100 + R$ 520/mês |
| agente | Agente de Suporte Autônomo | R$ 7.100 + R$ 520/mês |

## Telegram
- Ao finalizar, notifique no grupo Blueprint to Sale, tópico Miguel - SDR.
- Use `web_fetch` para POST em `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage` com `chat_id=-1003972374311` e `message_thread_id=25`.

## Veto Conditions
- Ideia do blueprint não se encaixa em nenhum produto do portfólio.
- Não há email ou WhatsApp disponível para contato.
- O cliente já possui o produto ou já foi abordado.
