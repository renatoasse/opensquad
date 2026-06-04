---
step: "03"
name: "Seleção de Notícia"
type: checkpoint
depends_on: step-02
---

# 🛑 Checkpoint: Seleção de Notícia

## Para o Pipeline Runner

Apresentar ao usuário as notícias encontradas pelo Pesquisador e aguardar seleção antes de avançar para o Copywriter.

## Formato de Apresentação ao Usuário

Ler `output/ranked-stories.yaml` e apresentar no formato:

```
🔍 Pesquisador encontrou [N] notícias sobre [tema].

Aqui estão as mais interessantes, ranqueadas por potencial de engajamento:

---
1️⃣ [Título da notícia 1]
📰 [Fonte] — [Data]
🔗 [URL]
📝 [Resumo em 1-2 linhas]
⚡ Por que é viral: [why_interesting]

---
2️⃣ [Título da notícia 2]
...

---
Qual notícia quer transformar em carrossel? (responda com o número)
Ou: "busca mais" se nenhuma te interessou
```

## Ação do Pipeline Runner após Seleção

1. Registrar a notícia escolhida
2. Salvar em `output/selected-story.yaml`:

```yaml
story_id: 1
title: "Título exato da notícia"
source: "Nome da fonte"
url: "URL da notícia"
date: "Data da notícia"
summary: "Resumo de 2-3 linhas"
selected_at: "YYYY-MM-DD HH:MM"
```

3. Avançar para Step 04 (Copywriter — Geração de Ângulos)

## Opções Especiais

- **"busca mais"** → Solicitar que o Pesquisador faça novas buscas com perspectivas diferentes. Voltar ao Step 02.
- **"[número] + ajuste"** → Registrar o ajuste junto com a seleção em `user_notes` no selected-story.yaml
