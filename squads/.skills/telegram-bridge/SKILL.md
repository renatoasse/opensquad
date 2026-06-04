---
name: telegram-bridge
description: "Interface de comunicação entre o Opensquad e grupos/tópicos do Telegram. Permite enviar mensagens, ler atualizações e interagir em tópicos por squad."
type: prompt
version: "1.0.0"
env: [TELEGRAM_BOT_TOKEN]
categories: [communication, messaging, integration]
---

# Telegram Bridge

Use esta skill para comunicar os agentes do squad com o usuário através do Telegram.

## Arquitetura

- **1 grupo por squad** — cada squad tem seu próprio grupo no Telegram
- **1 tópico por agente** — dentro de cada grupo, cada agente tem um tópico (thread)
- **O usuário envia mensagens** nos tópicos para dar instruções, feedback ou aprovações
- **Os agentes respondem** nos tópicos com resultados, dúvidas ou notificações

## Configuração

O token do bot está na variável de ambiente `TELEGRAM_BOT_TOKEN`.

Base URL da API:
```
https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/
```

## Mapeamento Grupos → Squads

| Grupo Telegram | Squad | Chat ID |
|----------------|-------|---------|
| `{nome do grupo}` | `{código do squad}` | `{chat_id}` |

O `chat_id` de cada grupo deve ser descoberto uma vez (via `getUpdates`) e armazenado na memória do squad ou no arquivo de dados.

## Tópicos → Agentes

Para usar tópicos em grupos do Telegram:
- `message_thread_id`: Identificador do tópico dentro do grupo
- Cada agente tem seu próprio `message_thread_id` dentro do grupo do squad

## Operações

### 1. Enviar mensagem para grupo/tópico

```
POST /sendMessage
Content-Type: application/json

{
  "chat_id": "{chat_id_do_grupo}",
  "text": "{mensagem}",
  "message_thread_id": "{thread_id_do_agente}",
  "parse_mode": "Markdown"
}
```

Use `web_fetch` para chamar esta API:
- URL: `https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage`
- Method: POST
- Headers: `Content-Type: application/json`
- Body: JSON com `chat_id`, `text`, `message_thread_id`

### 2. Enviar mensagem sem tópico (grupo geral)

Omita `message_thread_id` para enviar para o grupo geral (não um tópico específico).

### 3. Ler mensagens recebidas

```
GET /getUpdates?timeout=30
```

Use `web_fetch` para chamar esta API:
- URL: `https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates?timeout=30`
- Method: GET

A resposta contém um array de `update` objetos. Cada `update` tem:
- `message.message_id`: ID da mensagem
- `message.chat.id`: Chat ID do grupo
- `message.message_thread_id`: Topic ID (se for um tópico)
- `message.text`: Texto da mensagem
- `message.from.id`: ID do usuário que enviou
- `message.from.first_name`: Nome do usuário

### 4. Offsets para leitura incremental

Use `offset` para marcar mensagens já lidas:
```
GET /getUpdates?offset={last_update_id + 1}&timeout=30
```

## Formatação Markdown

Use `parse_mode: "Markdown"` para enviar mensagens formatadas:
- **Negrito**: `**texto**`
- *Itálico*: `*texto*`
- `Código`: `` `código` ``
- Links: `[texto](url)`

## Boas Práticas

- Sempre identifique o agente que está falando no início da mensagem, ex: `🎨 *Daniel Design:* Infográfico pronto!`
- Use o `message_thread_id` correto para cada agente — mensagem no tópico errado causa confusão.
- Para notificações importantes, marque a mensagem no grupo geral também.
- Prefira mensagens curtas e diretas — o usuário está no celular.
- Inclua emojis de identificação do agente no início da mensagem.
