---
task: "Testar Webhooks e Integracoes"
order: 1
input: |
  - endpoints: stripe, whatsapp, instagram
output: |
  - healthcheck
---

# Testar Webhooks e Integracoes

Use `web_fetch` e automacao de testes para verificar se os endpoints criticos respondem com `status 200`.

## Output Format

```yaml
healthcheck:
  - endpoint: "stripe"
    status_code: 200
    status: "ok"
```
