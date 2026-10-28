# Token Cost in Performance Mode Question — Design

**Date:** 2026-02-26
**Status:** Approved

## Problem

When the Architect asks the user about quality level (Performance Mode), the token cost implications are not explicit enough. Users need to understand the financial trade-off clearly before choosing.

## Solution

Update the Performance Mode question (question 6 in Phase 1: Discovery) to:

1. **Make token cost the primary differentiator** in the option descriptions
2. **Rename "Rápido" → "Econômico"** to better communicate the cost vs. quality trade-off
3. **Add internal instructions** for the Architect about token cost implications

### Updated AskUserQuestion Options

- **Alta Performance (Recommended)** — Pipeline completo com análise profunda, múltiplos formatos por plataforma, tarefas dedicadas de otimização e revisão completa. **Custo de tokens elevado** — mais processos de otimização e revisão do conteúdo. Produz resultados premium com variantes A/B.
- **Econômico** — Pipeline enxuto com análise básica, formato principal apenas e revisão leve. **Custo de tokens reduzido** — menos etapas de otimização e revisão. Execução mais rápida, qualidade ainda boa.

### Updated Internal Instructions

Add explicit token cost context:

```
Token cost implications (explain to user when presenting options):
- Alta Performance: higher token consumption due to multiple optimization passes,
  dedicated review tasks with separate scoring and feedback, and A/B variant generation.
  Expect ~3-5x more tokens per run.
- Econômico: reduced token consumption with single-pass creation and lightweight review.
  Baseline token usage (~1x).
```

## Files Affected

1. `_opensquad/core/architect.agent.yaml` — lines 101-113
2. `templates/_opensquad/core/architect.agent.yaml` — lines 101-113

## Scope

- Rename all references to "Rápido" → "Econômico" within the Performance Mode question block
- No other files reference the mode names directly
