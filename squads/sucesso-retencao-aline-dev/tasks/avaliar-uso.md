---
task: "Avaliar Uso"
order: 1
input: |
  - consumo_cliente: leads, uso_ia, limites
output: |
  - analise_uso
---

# Avaliar Uso

Verifique se o cliente atingiu `80%` do limite de leads ou uso de IA.

## Output Format

```yaml
analise_uso:
  percentual_leads: 0
  percentual_ia: 0
  upsell_recomendado: false
```
