---
agent: leo-logica
step: mentor_diagnosis
execution: inline
model_tier: powerful
inputFile: "squads/criador-de-conteudo/output/saas-brief.md"
outputFile: "squads/criador-de-conteudo/output/diagnostico-leo.md"
---

# Step 02 — Diagnóstico Mentor Léo

## Objetivo
Léo Lógica analisa o SaaS identificado pelo Ricardo e gera o diagnóstico estratégico completo, base para todo o conteúdo de LinkedIn.

## Processo

1. **Leia o brief** em `squads/mentor-leo-linkedin/output/saas-brief.md`.

2. **Valuation 24h (ARR Multiple):**
   - Calcule o intervalo de valuation justo (2x a 6x ARR)
   - Compare com o asking price do fundador
   - Avalie: está caro, barato ou justo? Por quê?

3. **Fator Arquiteto MVP (Aline Builds):**
   - Como a Aline Builds poderia reconstruir ou escalar este produto?
   - Qual feature seria o diferencial que o fundador não enxerga?
   - Quanto tempo economizaria usando o Arquiteto MVP?

4. **Draft de Impacto — 3 Pontos:**
   - **O Buraco:** O erro fatal do fundador atual (você pode ser cruel, mas preciso).
   - **A Alavanca:** Como a Aline Builds resolve isso de forma elegante e escalável.
   - **A Pele no Jogo:** O conselho ácido e direto para quem quer comprar ou investir neste SaaS.

5. **Gancho de Conteúdo:** Sugira 3 possíveis hooks de LinkedIn baseados no Research Brief.

## Formato de Saída

Salve em `squads/mentor-leo-linkedin/output/diagnostico-leo.md`:

```markdown
# Diagnóstico Mentor Léo — [Nome do SaaS]
**Data:** [data]

## Valuation Analysis
- **ARR/MRR declarado:** ...
- **Range justo (2x-6x):** R$X a R$Y
- **Asking Price:** R$Z
- **Veredito:** [Justificado / Caro / Barato] — [motivo em 1 frase]

## Fator Arquiteto MVP
[Como a Aline Builds resolveria em 1/4 do tempo]

## Os 3 Pontos
### 🕳️ O Buraco
[O erro que o fundador está cometendo — direto e sem piedade]

### 🚀 A Alavanca
[Como a Aline Builds resolve, exemplificando com Arquiteto MVP ou White Label]

### 🩸 A Pele no Jogo
[Conselho ácido para investidor ou comprador potencial]

## Hooks Sugeridos para LinkedIn
1. "..."
2. "..."
3. "..."
```

## Notificação Telegram
Após salvar o output, notifique no seu tópico do Telegram:
- Leia `pipeline/data/telegram-config.yaml` para seu `thread_id` (leo-logica)
- Envie: `🧠 *Léo Lógica:* Diagnóstico concluído! {nome} — Veredito: {caro/justo/barato}`
- Use a skill `telegram-bridge` para enviar a mensagem

## Veto Conditions
- O diagnóstico NÃO pode ser genérico ("bom produto, mas precisa melhorar"). Deve citar métricas concretas.
- Os 3 pontos devem referenciar especificamente a Aline Builds como solução.
- O tom deve soar como Ícaro de Carvalho falando sobre negócios — provocador e preciso.
