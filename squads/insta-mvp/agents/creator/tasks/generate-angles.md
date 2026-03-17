---
task: "Gerar ângulos"
order: 1
input: |
  - noticia_escolhida: título, fonte, url, relevance (do checkpoint news-selection)
output: |
  - angles: lista de 5 ângulos com label, hook_suggestion, emotional_driver
---

# Gerar ângulos

A partir da notícia escolhida pelo usuário, gerar 5 ângulos emocionais diferentes (medo, oportunidade, educacional, contrário, inspiracional, etc.) para o mesmo fato. Cada ângulo vira uma sugestão de "lente" para o carrossel.

## Process

1. Ler a notícia escolhida (título, contexto, URL se disponível).
2. Definir 5 ângulos distintos (ex.: Medo, Oportunidade, Educacional, Contrário, Inspiracional).
3. Para cada ângulo: label curto, sugestão de hook (1 frase) e driver emocional em uma linha.
4. Entregar lista numerada para o checkpoint de escolha do usuário.

## Output Format

```yaml
angles:
  - label: "..."
    hook_suggestion: "..."
    emotional_driver: "..."
```

## Output Example

```yaml
angles:
  - label: "Oportunidade"
    hook_suggestion: "A janela para devs que usam IA está abrindo agora."
    emotional_driver: "Quem age primeiro ganha vantagem."
  - label: "Educacional"
    hook_suggestion: "Testei o novo recurso X — aqui está o que mudou na prática."
    emotional_driver: "Curiosidade e aprendizado."
```

## Quality Criteria

- [ ] Exatamente 5 ângulos; labels distintos.
- [ ] hook_suggestion utilizável como base para a capa do carrossel.
- [ ] emotional_driver claro em uma linha.

## Veto Conditions

Rejeitar se: (1) dois ângulos praticamente iguais; (2) hook_suggestion vazio ou genérico.
