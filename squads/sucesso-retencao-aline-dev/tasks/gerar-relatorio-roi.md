---
task: "Gerar Relatorio de ROI"
order: 2
input: |
  - resumo_operacional
output: |
  - relatorio_roi
---

# Gerar Relatorio de ROI

Calcule `Horas Humanas Economizadas` e envie um email via `email_sender` com o assunto exato `Seu lucro da semana com a Aline Dev Agentics`.

## Regras

1. Converter uso em horas economizadas.
2. Converter horas em valor financeiro.
3. Comparar o valor com a mensalidade de `R$ 563,00`.
4. Usar tom de parceria estrategica.
