# Memory Log: sucesso-retencao-aline-dev

## Objetivo
Registrar evidencias recorrentes de ROI, confiabilidade tecnica e oportunidades de expansao para cada cliente licenciado.

## Regras de Log
- Registrar cada execucao semanal, mensal ou alerta critico.
- Incluir `run_id`, cliente, agente, etapa, status e resumo do impacto.
- Acrescentar entradas sem apagar historico.

## Template de Entrada
```markdown
### [RUN_ID]
- timestamp: 2026-01-20T10:00:00Z
- cliente: Cliente X
- trigger: weekly_roi
- agent: natan-numeros
- etapa: relatorio_roi
- status: success
- detalhes: 18 horas economizadas e email enviado ao cliente
```

## Historico
