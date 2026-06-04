---
task: "Analisar Logs Semanais"
order: 1
input: |
  - logs_engine: leads gerados, mensagens enviadas, tarefas concluidas
output: |
  - resumo_operacional
---

# Analisar Logs Semanais

Consolide os logs da semana do cliente em uma visao unica de produtividade.

## Output Format

```yaml
resumo_operacional:
  leads_gerados: 0
  mensagens_enviadas: 0
  tarefas_concluidas: 0
```
