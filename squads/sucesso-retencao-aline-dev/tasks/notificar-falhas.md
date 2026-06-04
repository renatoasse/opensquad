---
task: "Notificar Falhas"
order: 2
input: |
  - healthcheck
output: |
  - alerta
---

# Notificar Falhas

Se qualquer endpoint retornar diferente de `200`, notifique o admin imediatamente via `slack_notifier` ou canal operacional equivalente de WhatsApp.

## Requisitos

1. Informar cliente, endpoint, codigo HTTP e timestamp.
2. Marcar o incidente como critico.
