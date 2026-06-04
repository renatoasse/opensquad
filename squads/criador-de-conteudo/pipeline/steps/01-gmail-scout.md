---
agent: ricardo-rastreador
step: gmail_scout
execution: inline
model_tier: powerful
outputFile: "squads/criador-de-conteudo/output/saas-brief.md"
---

# Step 01 — Gmail Scout: Buscar SaaS da Semana

## Objetivo
Ricardo Rastreador acessa o Gmail da Aline e encontra a oportunidade de SaaS mais recente da pasta **"Ideia de SaaS"** (e-mails vindos do Acquire.com).

## Processo

1. **Listar Labels:** Use a skill `gmail-automation` para listar as labels do Gmail. Identifique a label correspondente à pasta "Ideia de SaaS" ou "Acquire".

2. **Buscar e-mails:** Use `GMAIL_FETCH_EMAILS` com a query da label identificada, ordenado por data decrescente. Pegue o e-mail mais recente.

3. **Extrair dados críticos:** Do corpo do e-mail, extraia:
   - **Nome do SaaS**
   - **Descrição do produto** (o que faz, para quem)
   - **Receita (ARR/MRR)** se mencionada
   - **Preço de venda pedido** (asking price)
   - **URL da listagem** no Acquire.com (se houver)

4. **Enriquecer via web_fetch:** Se houver URL de listagem, use `web_fetch` para complementar os dados com informações do Acquire.com.

5. **Apresentar dados** para confirmação da Aline antes de prosseguir.

## Formato de Saída

Salve o brief em `squads/criador-de-conteudo/output/saas-brief.md` com este formato:

```markdown
# SaaS Brief — [Nome do SaaS]
**Data de captura:** [data]
**Fonte:** Acquire.com

## Dados Básicos
- **Nome:** ...
- **Categoria:** ...
- **Descrição:** ...
- **ARR/MRR:** ...
- **Asking Price:** ...
- **URL Listagem:** ...

## Dados Complementares
[informações extras extraídas via web_fetch]
```

## Notificação Telegram
Após salvar o output, notifique no seu tópico do Telegram:
- Leia `pipeline/data/telegram-config.yaml` para seu `thread_id` (ricardo-rastreador)
- Envie: `🔍 *Ricardo Rastreador:* SaaS encontrado! {nome} — ARR: {valor}`
- Use a skill `telegram-bridge` para enviar a mensagem

## Veto Conditions
- Se nenhu e-mail relevante for encontrado, informe a Aline e peça que encaminhe manualmente.
- Não avance se o brief estiver vazio ou incompleto demais para análise.
