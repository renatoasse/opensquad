---
agent: elias-estrategia
step: content_strategy
execution: inline
model_tier: powerful
inputFile: "squads/criador-de-conteudo/output/trend-analysis.md"
outputFile: "squads/criador-de-conteudo/output/content-strategy-brief.md"
---

# Step 05 — Elias Estratégia: Estratégia de Conteúdo

## Objetivo
Elias Estratégia analisa o tema definido pela Teresa (análise de tendências) e o diagnóstico do Léo, e produz um briefing estratégico de conteúdo, identificando os melhores ângulos e segmentos para atacar.

## Processo

1. **Leia** o diagnóstico em `squads/criador-de-conteudo/output/diagnostico-leo.md`.
2. **Pesquise tendências:** Use `web_search` para encontrar tendências atuais de IA, SaaS e tecnologia (2026) relacionadas ao tema do diagnóstico.
3. **Mapeie as dores:** Para cada segmento (empreendedores, freelancers, donos de agência), identifique a dor principal que se conecta ao diagnóstico.
4. **Selecione 3 pautas:** Cruze tendências + dores + Ranking 12 Ideias + cases da agência.
5. **Produza o briefing:** Para cada pauta: ângulo, público-alvo, CTA, formato ideal.

## Formato de Saída

Salve em `squads/criador-de-conteudo/output/content-strategy-brief.md`:

```markdown
# Briefing Estratégico — [Tema]
**Criado por:** Elias Estratégia | **Data:** [data]

---

## Pauta 1: [Título]
- **Ângulo:** ...
- **Público-alvo:** ...
- **Dor principal:** ...
- **Formato:** LinkedIn Post / Twitter Thread / Artigo
- **Case/Prova:** ...
- **CTA:** ...

## Pauta 2: [Título]
...
```

## Notificação Telegram
Após salvar o output, notifique no seu tópico do Telegram:
- Leia `pipeline/data/telegram-config.yaml` para seu `thread_id` (elias-estrategia)
- Envie: `🎯 *Elias Estratégia:* Briefing de pautas pronto! {N} pautas mapeadas para {segmento}`
- Use a skill `telegram-bridge` para enviar a mensagem

## Veto Conditions
- Nenhuma pauta pode ser genérica — todas devem ter um ângulo específico.
- Toda pauta deve ter CTA para Arquiteto MVP (R$ 52) ou Setup White-Label (R$ 7.100).
- Pelo menos 1 pauta deve ser direcionada a não-programadores (empreendedores, agências).
