---
task: "Manter mapa de hashtags"
order: 1
input: |
  - pipeline/data/hashtag-map.yaml (existente)
  - topic: tema da notícia escolhida (opcional, para sugerir novos conjuntos)
output: |
  - hashtag_map_updated: se houver alteração; senão referência ao arquivo existente
---

# Manter mapa de hashtags

Garantir que pipeline/data/hashtag-map.yaml existe e está atualizado com categorias (brand, programação_ia_nicho, educação_produto, medio_alcance, broad). Se o tema do post sugerir hashtags novas relevantes, propor adição ao mapa (sem duplicar). Esta tarefa é usada no step-04 junto com triangulation-brief; o conjunto concreto para o post sai em triangulation-brief / optimize-caption-hashtags.

## Process

1. Ler pipeline/data/hashtag-map.yaml.
2. Verificar se há categorias vazias ou desatualizadas; propor preenchimento se necessário.
3. Se topic for passado e houver hashtags relevantes não listadas, sugerir adição em categoria apropriada.
4. Entregar referência ao arquivo ou patch (YAML) em output.

## Output Format

```yaml
hashtag_map_updated: false  # ou true
changes: []  # ou lista de "add X to category Y"
```

## Quality Criteria

- [ ] Nenhum hashtag banido ou genérico demais (ex.: #sucesso).
- [ ] Rotação possível: múltiplos conjuntos por categoria para variar entre posts.

## Veto Conditions

Rejeitar se: (1) sugerir hashtag conhecidamente banido; (2) encher uma categoria com 50+ tags sem critério.
