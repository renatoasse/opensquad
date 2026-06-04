---
agent: caio-copy
step: copy_craft
execution: inline
model_tier: powerful
inputFile: "squads/criador-de-conteudo/output/diagnostico-leo.md"
outputFile: "squads/criador-de-conteudo/output/content-pack.md"
---

# Step 09 — Caio Copy: Criação do Content Pack

## Objetivo
Caio Copy transforma o diagnóstico do Léo em 3 peças de conteúdo prontas para o LinkedIn da Aline Builds.

## Processo

1. **Leia** o diagnóstico em `squads/mentor-leo-linkedin/output/diagnostico-leo.md`.
2. **Consulte** o Research Brief em `squads/mentor-leo-linkedin/pipeline/data/research-brief.md` para métricas e ganchos.
3. **Crie as 3 peças** abaixo:

### Peça 1 — Artigo LinkedIn (PAS)
- **Extensão:** 800–1200 palavras
- **Estrutura PAS:**
  - **Problema:** O erro fatal identificado no diagnóstico (O Buraco)
  - **Agitação:** O custo financeiro e mental de ignorar isso (dê números reais)
  - **Solução:** Como o framework da Aline Builds (Arquiteto MVP + White Label) resolve e escala
- **CTA Final:** link para `https://hotm.io/alinebuilds`
- **Regra:** Zero bullet points no artigo — prosa corrida, parágrafos curtos, ritmo jornalístico.

### Peça 2 — Roteiro de Vídeo/Shorts (AIDA)
- **Extensão:** ~300 palavras (script de 60–90 segundos)
- **Estrutura AIDA:**
  - **Atenção (0–3s):** Gancho imediato usando um dos hooks do diagnóstico
  - **Interesse (3–30s):** 2 fatos surpreendentes do SaaS analisado
  - **Desejo (30–55s):** O benefício concreto da abordagem Aline Builds
  - **Ação (55–60s):** \"Confere o link na bio da Aline Builds\"
- **Formato:** Numerado por marcação de tempo. Ex: `[0:00]`, `[0:03]`...

### Peça 3 — Threads/Tweets para X (Twitter)
- **Estrutura:** 1 Thread Starter (Gancho) + 3-5 Tweets de conteúdo técnico + 1 CTA.
- **Formato:** Marcar como Tweet 1, Tweet 2...
- **Regra:** Linguagem mais afiada, direta e sem hashtags excessivas (máximo 2 por tweet).

### Peça 4 — Post de Atualização para Google Meu Negócio
- **headline:** Insight técnico ou notícia do mercado SaaS.
- **body:** Texto direto (máximo 1500 caracteres, recomendado 300).
- **CTA:** Link para Aline Builds.

### Peça 5 — Texto para Infográfico (80/20)
- **1 dado central:** O número mais impactante do diagnóstico.
- **1 título:** Máximo 8 palavras.
- **Hashtags:** #SaaS #AlineBuilds #ArquitetoMVP #X #GMB

## Formato de Saída

Salve tudo em `squads/criador-de-conteudo/output/content-pack.md`:

```markdown
# Content Pack — [Nome do SaaS]
**Criado por:** Caio Copy | **Data:** [data]

---

## 📄 Artigo LinkedIn
[texto completo]

---

## 🐦 Threads/Tweets (X)
[lista de tweets]

---

## 🏪 Google Meu Negócio
[post GMB]

---

## 🎬 Roteiro de Vídeo
[script]

---

## 🖼️ Texto para Infográfico
**Dado central:** ...
**Título:** ...
```

## Notificação Telegram
Após salvar o output, notifique no seu tópico do Telegram:
- Leia `pipeline/data/telegram-config.yaml` para seu `thread_id` (caio-copy)
- Envie: `✍️ *Caio Copy:* Content Pack completo! Artigo + Vídeo + Thread + GMB + Infográfico`
- Use a skill `telegram-bridge` para enviar a mensagem

## Veto Conditions
- O artigo NÃO pode começar com \"Você já se perguntou\" ou qualquer clichê de IA.
- TODOS os 3 conteúdos devem ter um CTA claro para a Aline Builds.
- O gancho do vídeo deve chocar nos primeiros 3 segundos — se não chocar, refaça.
- Não use as palavras \"certamente\", \"claro!\", \"ótimo\", \"fascinante\".
