---
step: "01"
name: "Entrada de Conteúdo"
type: checkpoint
description: O usuário define o tema e o período de pesquisa que será transformado em carrossel.
---

# 🛑 Checkpoint: Entrada de Conteúdo

## Para o Pipeline Runner

Este é o checkpoint de entrada do pipeline. Solicitar ao usuário o tema e o período de pesquisa.

## Solicitação ao Usuário

🎯 Vamos criar um carrossel de Instagram.

Qual é o **tema** que você quer explorar hoje?
Pode ser um tema geral (ex: "IA para empreendedores"), uma área específica (ex: "no-code", "automações") ou qualquer assunto relevante para sua audiência.

Qual é o **período de pesquisa**?
Exemplos: "últimas 24 horas", "última semana", "março de 2026".

## Ação do Pipeline Runner

1. Receber o tema e o período fornecidos pelo usuário
2. Salvar em `output/research-focus.md` no formato abaixo
3. Avançar para o Step 02 (Pesquisador — Busca de Notícias)

## Formato de Salvamento

```markdown
# Research Focus

**Topic:** [tema fornecido pelo usuário]
**Time Range:** [período fornecido pelo usuário]
**Date:** YYYY-MM-DD
```
