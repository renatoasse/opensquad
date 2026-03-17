---
type: checkpoint
outputFile: squads/insta-mvp/output/selected-news.md
---

# Step 03: Escolha da notícia

## Contexto

Pedro Pesquisa entregou um ranking de notícias em `squads/insta-mvp/output/{run_id}/research-ranking.md`. Uma notícia será usada para gerar ângulos e o carrossel.

## Instruções

1. Ler o arquivo de ranking do step 02 (research-ranking.md no run_id atual).
2. Apresentar ao usuário a lista numerada (título + fonte + uma linha de relevância).
3. Pedir que responda com o **número** da notícia escolhida (1 a N).
4. Gravar a notícia escolhida (título, fonte, url, relevance) para os próximos steps (ex.: em pipeline/data/ ou em estado do pipeline). O step 04 (Sérgio) e o step 05 (Carla) usarão essa notícia.

## Output

A escolha do usuário (número) e os dados da notícia correspondente ficam disponíveis para step-04 e step-05. Não é necessário escrever arquivo de step; o Runner registra a resposta e segue para step-04.
