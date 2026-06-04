---
task: "Gerar Roadmap MVP"
order: 3
input: |
  - briefing_normalizado
  - engine-config.json
output: |
  - roadmap-mvp.md
---

# Gerar Roadmap MVP

Escreva um roadmap em Markdown para a entrega inicial do cliente.

## Requisitos

1. Limitar a no maximo 4 epicos.
2. Usar checkboxes Markdown (`[ ]`).
3. Separar explicitamente o que entra no MVP do que vai para Fase 2.
4. Manter linguagem em pt-BR, clara para cliente e time tecnico.

## Estrutura Esperada

```markdown
# Roadmap MVP

## Epico 1
- [ ] Item

## Fase 2
- [ ] Item fora do MVP
```
