---
task: "Find and Rank News"
order: 1
input:
  - research_focus: Tema e período de pesquisa do usuário (lido de output/research-focus.md)
  - company_context: Perfil da empresa em _opensquad/_memory/company.md
output:
  - ranked_stories: Lista de 5-7 notícias ranqueadas por potencial viral, salva em output/ranked-stories.yaml
---

# Find and Rank News

Recebe o tema e período de pesquisa e encontra as notícias mais interessantes e com maior potencial de engajamento para o público da empresa. Entrega uma lista ranqueada para o usuário escolher.

## Process

1. **Ler o research-focus.md.** Identificar o tema exato e o período de pesquisa. Esta é a âncora de toda a busca.

2. **Fazer pelo menos 3 buscas com ângulos diferentes.** Exemplos de ângulos de busca para o tema "IA":
   - Notícias recentes: "IA inteligência artificial notícias [período]"
   - Dados e pesquisas: "IA relatório estudo dados [período]"
   - Eventos e lançamentos: "IA ferramenta lançamento novidade [período]"
   - Adaptar os ângulos conforme o tema específico.

3. **Coletar 10-15 candidatos.** Para cada resultado relevante, registrar: título, fonte, URL, data, e um resumo de 1-2 linhas. Focar em fontes verificáveis (veículos de mídia, pesquisas, comunicados oficiais).

4. **Avaliar cada candidato pelo potencial viral.** Para cada notícia, atribuir um `viral_potential_score` de 1-10 baseado em:
   - **Surpresa/contraintuitivo** (0-3 pts): o dado ou fato vai surpreender o leitor?
   - **Relevância para o público** (0-3 pts): o público No-Code/IA vai se importar?
   - **Acionabilidade** (0-2 pts): dá para transformar em conselho prático?
   - **Atualidade** (0-2 pts): está dentro do período solicitado e é recente?

5. **Selecionar as 5-7 melhores.** Ordenar por `viral_potential_score` decrescente. Se houver empate, preferir a mais recente e a que tem dado numérico verificável.

6. **Salvar o resultado.** Escrever `output/ranked-stories.yaml` com as notícias ranqueadas.

## Output Format

```yaml
research_topic: "Tema pesquisado"
time_range: "Período pesquisado"
search_date: "YYYY-MM-DD"
total_found: 12

stories:
  - rank: 1
    title: "Título exato da notícia"
    source: "Nome do veículo ou publicação"
    url: "https://url-da-noticia.com"
    date: "YYYY-MM-DD"
    summary: "Resumo em 2-3 linhas explicando o que é a notícia e por que importa"
    viral_potential_score: 9
    why_interesting: "Frase explicando por que essa notícia vai engajar o público"
    key_data: "Dado ou número mais forte da notícia (se houver)"

  - rank: 2
    title: "..."
```

## Output Example

```yaml
research_topic: "IA para empreendedores"
time_range: "Últimas 24 horas"
search_date: "2026-03-03"
total_found: 11

stories:
  - rank: 1
    title: "OpenAI lança GPT-5 com capacidade de raciocínio 10x superior"
    source: "TechCrunch"
    url: "https://techcrunch.com/2026/03/03/openai-gpt5"
    date: "2026-03-03"
    summary: "OpenAI lançou o GPT-5 com benchmark de raciocínio matemático 10x acima do GPT-4. O modelo já está disponível via API e no ChatGPT Plus."
    viral_potential_score: 9
    why_interesting: "Lançamento de produto com dado concreto (10x) + relevante para quem usa IA no dia a dia"
    key_data: "10x superior em raciocínio matemático"

  - rank: 2
    title: "Pesquisa: 67% dos freelancers brasileiros usam IA mas cobram como se não usassem"
    source: "Exame"
    url: "https://exame.com/carreira/freelancers-ia-2026"
    date: "2026-03-02"
    summary: "Levantamento com 2.400 freelancers mostra que 67% já usam IA para produzir trabalho, mas apenas 12% ajustaram seus preços para cima."
    viral_potential_score: 8
    why_interesting: "Dado surpreendente (67%) + implicação prática direta para freelancers + dissonância cognitiva"
    key_data: "67% usam IA, só 12% aumentaram preços"
```

## Quality Criteria

- [ ] Pelo menos 3 buscas realizadas com termos diferentes
- [ ] Todas as URLs foram verificadas (acessíveis e com data dentro do período)
- [ ] Cada notícia tem viral_potential_score com justificativa coerente
- [ ] As 5-7 notícias selecionadas são claramente distintas entre si
- [ ] Pelo menos uma notícia tem dado numérico verificável em key_data
- [ ] Notícias estão ordenadas por viral_potential_score decrescente

## Veto Conditions

Rejeitar e refazer se:
1. Menos de 5 notícias encontradas — refazer com termos de busca mais amplos
2. Todas as notícias são do mesmo veículo ou mesma fonte — diversificar
3. Alguma URL não está acessível — substituir por notícia verificada
4. Notícias fora do período solicitado — refazer com filtro de data mais rigoroso
