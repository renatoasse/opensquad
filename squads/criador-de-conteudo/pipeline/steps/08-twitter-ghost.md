---
agent: tulio-tuites
step: twitter_ghost
execution: inline
model_tier: powerful
inputFile: "squads/criador-de-conteudo/output/content-strategy-brief.md"
outputFile: "squads/criador-de-conteudo/output/twitter-thread.md"
---

# Step 08 — Túlio Tuítes: Ghostwriting Twitter/X

## Objetivo
Túlio Tuítes transforma o briefing estratégico em uma thread viral para o Twitter/X, quebrando conceitos complexos em tweets magnéticos.

## Processo

1. **Leia** o briefing em `squads/criador-de-conteudo/output/content-strategy-brief.md`.
2. **Escolha o ângulo técnico:** Selecione um conceito do diagnóstico que pode ser simplificado em analogia.
3. **Crie a thread:**
   - **Tweet 1 (Hook):** Máximo 280 caracteres. Deve causar curiosidade insaciável.
   - **Tweets 2-5 (Desenvolvimento):** Cada um revela uma camada do problema.
   - **Tweet 6 (CTA):** Direciona para o Arquiteto MVP (R$ 52,00).
4. **Analogia obrigatória:** Pelo menos 1 analogia do mundo real (engenharia, medicina, construção civil).

## Formato de Saída

Salve em `squads/criador-de-conteudo/output/twitter-thread.md`:

```markdown
# Twitter Thread — [Tema]
**Criado por:** Túlio Tuítes | **Data:** [data]

---

## Tweet 1 (Hook)
[280 chars max]

## Tweet 2
...

## Tweet 3
...

## Tweet 4
...

## Tweet 5 (CTA)
...
```

## Notificação Telegram
Após salvar o output, notifique no seu tópico do Telegram:
- Leia `pipeline/data/telegram-config.yaml` para seu `thread_id` (tulio-tuites)
- Envie: `🐦 *Túlio Tuítes:* Thread pronta! {N} tweets — Hook: {hook}`
- Use a skill `telegram-bridge` para enviar a mensagem

## Veto Conditions
- Hook deve ser compreensível em 1 segundo.
- Máximo 7 tweets no total.
- Máximo 2 emojis por tweet.
- CTA para Arquiteto MVP (R$ 52,00) obrigatório no último tweet.
