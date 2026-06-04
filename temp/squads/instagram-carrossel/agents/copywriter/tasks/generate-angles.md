---
task: "Generate Angles"
order: 1
input:
  - selected_story: Notícia escolhida pelo usuário (lida de output/selected-story.yaml)
  - domain_framework: pipeline/data/domain-framework.md (framework de ângulos)
  - company_context: _opensquad/_memory/company.md
  - tone_of_voice: pipeline/data/tone-of-voice.md
output:
  - insights_brief: Fatos e tensão central extraídos da notícia (output/insights-brief.yaml)
  - angles_brief: 5 ângulos virais distintos com hook rascunho (output/angles-brief.yaml)
---

# Generate Angles

Lê a notícia selecionada, extrai os insights mais fortes e gera 5 ângulos virais distintos para o carrossel de Instagram. Esta task combina pesquisa e criatividade editorial — o Copywriter sabe quais fatos extrair porque já sabe como vai enquadrá-los.

## Process

### Parte 1: Extrair Insights da Notícia

1. **Acessar a notícia.** Usar web_fetch na URL de `output/selected-story.yaml` para ler o conteúdo completo. Se a URL não estiver acessível, usar o summary do selected-story.yaml como base.

2. **Inventariar todos os dados concretos.** Extrair: estatísticas, percentuais, datas, nomes, empresas, quantidades, prazos, resultados. Registrar cada um com contexto.

3. **Identificar o fato central (core tension).** O fato mais surpreendente, contraintuitivo ou revelador. É a "virada" que pode mudar a perspectiva do leitor.

4. **Selecionar hook candidates.** Os 3-5 dados mais fortes para o slide 1. Priorizar: números impactantes, revelações contraintuitivas, paradoxos.

5. **Salvar em `output/insights-brief.yaml`.**

### Parte 2: Gerar 5 Ângulos Virais

6. **Consultar o angle framework.** Ler `pipeline/data/domain-framework.md` para os tipos de ângulo disponíveis.

7. **Construir exatamente 5 ângulos distintos.** Cada ângulo é a MESMA notícia contada com uma lente emocional diferente. Para cada um:
   - Título (2-4 palavras que capturam a lente emocional)
   - Tipo (Revelador / Comparativo / Pergunta Incômoda / Tendência / Passo a Passo)
   - Hook rascunho para slide 1 (usando o dado âncora mais adequado para esse ângulo)
   - Estrutura sugerida de slides (slide 2 a slide N)
   - Trigger emocional primário
   - Força e risco do ângulo

8. **Selecionar o ângulo recomendado.** Com base na audiência da empresa, indicar qual tem maior potencial. Justificar.

9. **Salvar em `output/angles-brief.yaml`.**

## Output Format — insights-brief.yaml

```yaml
source_title: "Título da notícia"
source_url: "URL"
source_date: "YYYY-MM-DD"

key_facts:
  - fact: "Afirmação factual exata"
    data: "Número ou dado específico"
    source: "Nome da fonte"
    confidence: "HIGH | MEDIUM | LOW"

core_tension: "A revelação ou conflito central — a 'virada' do conteúdo"

hook_candidates:
  - data: "Dado específico"
    hook_draft: "Rascunho de como poderia aparecer no slide 1"
    emotional_trigger: "SURPRESA | FOMO | DISSONÂNCIA | URGÊNCIA | CURIOSIDADE"
```

## Output Format — angles-brief.yaml

```yaml
content_summary: "Resumo da notícia em 1 linha"

angles:
  - id: 1
    title: "Nome do ângulo"
    type: "Revelador | Comparativo | Pergunta Incômoda | Tendência | Passo a Passo"
    emotional_trigger: "SURPRESA | FOMO | DISSONÂNCIA | URGÊNCIA"
    hook_draft: |
      [Rascunho completo do slide 1 — 2-4 linhas]
    slide_structure:
      - slide_2: "Tema do slide 2"
      - slide_3: "Tema do slide 3"
      - slide_4: "Tema do slide 4"
      - slide_5: "Tema do slide 5"
      - slide_6: "Reflexão"
      - slide_7: "CTA"
    strength: "Por que esse ângulo funciona para essa audiência"
    weakness: "Risco ou limitação desse ângulo"

recommended_angle: 1
recommendation_reason: "Justificativa baseada na audiência da empresa"
```

## Quality Criteria

- [ ] insights-brief.yaml tem pelo menos 3 key_facts com dados concretos
- [ ] core_tension captura a "virada" mais impactante, não é paráfrase genérica
- [ ] angles-brief.yaml tem exatamente 5 ângulos
- [ ] Os 5 ângulos são tipos distintos — não dois "Reveladores" com palavras diferentes
- [ ] Cada hook_draft usa dado específico do brief (nunca afirmação vaga)
- [ ] Ângulo recomendado tem justificativa baseada na audiência da empresa
- [ ] Strengths e weaknesses são honestos — não todos perfeitos sem risco

## Veto Conditions

Rejeitar e refazer se:
1. Dois ou mais ângulos são essencialmente o mesmo com redação diferente
2. Algum hook_draft não usa dado específico do brief
3. O core_tension é uma paráfrase genérica, não a tensão real
4. Menos de 5 ângulos gerados
