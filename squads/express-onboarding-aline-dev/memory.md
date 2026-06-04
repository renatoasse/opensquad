# Memory Log: express-onboarding-aline-dev

## Objetivo
Registrar cada etapa do onboarding expresso acionado por webhook para auditoria operacional.

## Regras de Log
- Registrar um item por etapa concluida ou falha.
- Incluir `run_id`, timestamp ISO 8601, agente, etapa, status e resumo.
- Nunca apagar historico anterior; apenas acrescentar novas entradas.

## Template de Entrada
```markdown
### [RUN_ID]
- timestamp: 2026-01-15T14:10:00Z
- trigger: hotmart_webhook
- agent: keeper
- etapa: provisionamento
- status: success
- detalhes: repositorio privado criado e email de boas-vindas enviado
```

## Historico
