---
task: "Processar Formulario Tecnico"
order: 1
input: |
  - formulario_aline_builds: nicho, cores, funcionalidades, observacoes
output: |
  - briefing_normalizado
---

# Processar Formulario Tecnico

Converta a submissao do app Aline Builds em um briefing tecnico enxuto e padronizado.

## Processo

1. Extrair nicho, nome do cliente, cores desejadas e funcionalidades pedidas.
2. Normalizar cores para HEX quando possivel.
3. Separar funcionalidades em `MVP` e `Fase 2` caso excedam o escopo.
4. Identificar riscos de escopo ou informacoes ausentes.

## Output Format

```yaml
briefing_normalizado:
  client: "Nome"
  niche: "Nicho"
  branding:
    primary: "#000000"
    secondary: "#FFFFFF"
  mvp_features:
    - "feature_a"
  phase_2_features:
    - "feature_b"
```
