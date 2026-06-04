---
task: "Registrar Log do Keeper"
order: 3
input: |
  - run_id
  - cliente
  - repositorio
  - email_status
  - resultado
output: |
  - memory_entry
---

# Registrar Log do Keeper

Adicione uma nova entrada em `memory.md` com o resultado da etapa de provisionamento.

## Requisitos

1. Incluir timestamp ISO 8601.
2. Definir `trigger: hotmart_webhook`.
3. Definir `agent: keeper`.
4. Descrever se o repo foi criado e se o email foi enviado.

## Output Example

```markdown
### HM-2026-0001
- timestamp: 2026-01-15T14:10:00Z
- trigger: hotmart_webhook
- agent: keeper
- etapa: provisionamento
- status: success
- detalhes: repositorio privado criado e email de boas-vindas enviado
```
