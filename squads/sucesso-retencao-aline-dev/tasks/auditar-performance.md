---
task: "Auditar Performance"
order: 1
input: |
  - metricas_web: LCP, FID, CLS
  - consumo_llm: tokens, custo
output: |
  - auditoria_tecnica
---

# Auditar Performance

Faça uma auditoria mensal de `LCP`, `FID`, `CLS` e consumo de tokens do cliente.

## Output Format

```yaml
auditoria_tecnica:
  lcp: "2.8s"
  fid: "80ms"
  cls: "0.06"
  tokens_mes: 0
  custo_estimado: 0
```
