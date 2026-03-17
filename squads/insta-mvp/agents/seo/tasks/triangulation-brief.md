---
task: "Brief de triangulação e hashtags"
order: 2
input: |
  - noticia_escolhida: título e contexto
  - pipeline/data/triangulation-guide.md
  - pipeline/data/hashtag-map.yaml
output: |
  - caption_brief: sugestão primeiros 125 caracteres, palavras-chave, como triangular (LuanPDD/In100tiva/MVP Flow)
  - hashtag_set: lista de 5–15 hashtags para este post (do mapa, rotacionados)
  - algorithm_notes: uma linha sobre foco para alcance/descoberta
---

# Brief de triangulação e hashtags

Produzir o brief que a Carla usará para escrever o carrossel e a legenda: sugestão para os primeiros 125 caracteres, palavras-chave, como incluir LuanPDD/In100tiva/MVP Flow neste post, e o conjunto de hashtags (do mapa) para este tema. Não escrever a legenda completa; apenas o brief para a Carla.

## Process

1. Ler notícia escolhida, triangulation-guide e hashtag-map.
2. Definir 1–2 palavras-chave principais para o tema (ex.: "IA para devs", "MVP", "programação").
3. Sugerir direção para os primeiros 125 caracteres (gancho + keyword ou triangulação).
4. Indicar como triangular neste post (ex.: "mencionar MVP Flow no CTA"; "In100tiva na assinatura").
5. Escolher 5–15 hashtags do mapa (nicho + médio + broad; 0–1 brand); evitar repetir o mesmo bloco do último post se houver memória.
6. Entregar caption_brief, hashtag_set e algorithm_notes.

## Output Format

```yaml
caption_brief:
  first_125_suggestion: "..."
  keywords: ["...", "..."]
  triangulation_instruction: "..."
hashtag_set: ["#a", "#b", ...]
algorithm_notes: "..."
```

## Quality Criteria

- [ ] 5–15 hashtags; nenhum banido; mix de categorias.
- [ ] caption_brief acionável para a Carla (não vago).
- [ ] triangulation_instruction alinhada ao triangulation-guide.

## Veto Conditions

Rejeitar se: (1) hashtag_set com mais de 15 ou com hashtag banido; (2) first_125_suggestion vazio.
