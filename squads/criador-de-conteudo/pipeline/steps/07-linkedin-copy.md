---
agent: lucia-linkedin
step: linkedin_copy
execution: inline
model_tier: powerful
inputFile: "squads/criador-de-conteudo/output/content-strategy-brief.md"
outputFile: "squads/criador-de-conteudo/output/linkedin-post.md"
---

# Step 07 — Lúcia Linkedin: Copywriting LinkedIn

## Objetivo
Lúcia Linkedin transforma o briefing estratégico do Elias em um post de alto impacto para o LinkedIn da Aline Builds.

## Processo

1. **Leia** o briefing em `squads/criador-de-conteudo/output/content-strategy-brief.md`.
2. **Identifique o segmento-alvo** da pauta selecionada (corporativo, nutricionistas, médicos, advogados).
3. **Pesquise a linguagem do segmento:** Use `web_search` se necessário para entender o vocabulário e as dores específicas.
4. **Escreva o post** seguindo:
   - **Hook** (máx 2 linhas) — uma verdade desconfortável ou revelação
   - **Contexto** (3-4 linhas) — quem é o protagonista da história
   - **Problema** (5-6 linhas) — o erro de programar sem planejar com consequências reais
   - **Virada** (case Aline Builds) — como o framework resolveu
   - **CTA** — link para Aline Builds
5. **Formato:** Máximo 1.500 caracteres. Parágrafos de no máximo 3 linhas.

## Formato de Saída

Salve em `squads/criador-de-conteudo/output/linkedin-post.md`:

```markdown
# LinkedIn Post — [Tema]
**Criado por:** Lúcia Linkedin | **Data:** [data] | **Segmento:** [segmento]

---

[texto completo do post]
```

## Notificação Telegram
Após salvar o output, notifique no seu tópico do Telegram:
- Leia `pipeline/data/telegram-config.yaml` para seu `thread_id` (lucia-linkedin)
- Envie: `✍️ *Lúcia Linkedin:* Post LinkedIn pronto! Segmento: {segmento} — {hook_resumido}`
- Use a skill `telegram-bridge` para enviar a mensagem

## Veto Conditions
- O post não pode conter jargão técnico para público não-técnico.
- O CTA deve estar presente e natural.
- Máximo 1.500 caracteres.
- O case Lília deve aparecer se o segmento for profissionais de saúde.
