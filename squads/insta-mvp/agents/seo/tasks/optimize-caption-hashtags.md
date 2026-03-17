---
task: "Otimizar legenda e hashtags"
order: 3
input: |
  - caption_draft: da Carla (create + optimize)
  - hashtag_set: do brief (step-04) ou ajustado para este post
  - pipeline/data/quality-criteria.md (limites de legenda)
output: |
  - caption_final: texto da legenda (máx 2200 caracteres)
  - hashtags_final: lista de 5–15 hashtags para anexar à legenda
  - optimization_notes: o que foi ajustado (primeiros 125, keywords, triangulação)
---

# Otimizar legenda e hashtags

Receber o caption_draft da Carla e o hashtag_set; produzir a versão final da legenda (texto + bloco de hashtags) pronta para publicação. Ajustar apenas o necessário: primeiros 125 caracteres (keywords/triangulação), quebra de linha, e anexar o bloco de hashtags. A legenda é definida em conjunto com a Carla; Sérgio finaliza para algoritmo e alcance. Renata revisa o conteúdo completo (incluindo esta legenda) no step-10.

## Process

1. Ler caption_draft e hashtag_set.
2. Verificar limite de 2200 caracteres; garantir primeiros 125 como gancho forte (ajustar keywords/triangulação se preciso sem mudar o tom da Carla).
3. Formatar quebras de linha para leitura no Instagram.
4. Anexar hashtags no final (5–15); sem repetir hashtag; nenhum banido.
5. Documentar em optimization_notes o que foi alterado em relação ao draft.
6. Entregar caption_final, hashtags_final e optimization_notes.

## Output Format

```yaml
caption_final: |
  [texto completo da legenda com quebras de linha]
  #hashtag1 #hashtag2 ...
hashtags_final: ["#a", "#b", ...]
optimization_notes: "..."
```

## Quality Criteria

- [ ] caption_final ≤ 2200 caracteres.
- [ ] 5–15 hashtags; nenhum banido; bloco no final da legenda.
- [ ] Primeiros 125 caracteres preservam ou melhoram o gancho.

## Veto Conditions

Rejeitar se: (1) ultrapassar 2200 caracteres; (2) incluir link clicável na legenda; (3) mais de 15 hashtags.
