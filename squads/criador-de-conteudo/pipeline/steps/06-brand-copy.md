---
agent: aurora-autoridade
step: brand_copy
execution: inline
model_tier: powerful
inputFile: "squads/criador-de-conteudo/output/content-strategy-brief.md"
outputFile: "squads/criador-de-conteudo/output/brand-copy-posts.md"
---

# Step 06 — Aurora Autoridade: Posts de Impacto LinkedIn + Twitter

## Objetivo
Aurora cria posts de impacto para LinkedIn e Twitter usando storytelling, atacando o "Inimigo Comum" (gastar meses e milhares programando do zero sem validar) e finalizando com CTA direta para o Arquiteto MVP (R$ 52).

## Processo

1. **Leia o briefing estratégico** em `squads/criador-de-conteudo/output/content-strategy-brief.md`

2. **Leia a análise de tendências** em `squads/criador-de-conteudo/output/trend-analysis.md` (tema da semana)

3. **Crie 1 post para LinkedIn**:
   - Gancho forte nos primeiros 3 segundos
   - Storytelling com o "Inimigo Comum" (devs/empreendedores que gastam rios de dinheiro codando do zero)
   - Virada: como o Arquiteto MVP resolve por R$ 52
   - CTA final: "👉 Valide sua ideia no Arquiteto MVP por R$ 52"

4. **Crie 1 thread para Twitter/X** (3-5 tweets):
   - Tweet 1: Gancho/questionamento
   - Tweet 2-4: Desenvolvimento com dados e história
   - Tweet 5: CTA Arquiteto MVP

5. **Salve** o output estruturado.

6. **Notifique no Telegram** no tópico `aurora-autoridade` (thread_id: 13).

## Formato de Saída

Salve em `squads/criador-de-conteudo/output/brand-copy-posts.md`:

```markdown
# 🌟 Posts de Impacto — Aurora Autoridade

## 📌 LinkedIn Post

[Post completo em markdown]

## 🐦 Twitter/X Thread

1/5 [tweet 1]
2/5 [tweet 2]
3/5 [tweet 3]
4/5 [tweet 4]
5/5 [tweet 5 com CTA]

---

**CTA Padrão:** 👉 Valide sua ideia no Arquiteto MVP por R$ 52 — [link]
```

## Notificação Telegram
Use `telegram-bridge` para enviar ao thread_id 13:
```markdown
🌟 *Aurora Autoridade — Posts Criados*

📌 LinkedIn: [hook do post]
🐦 Twitter: [hook da thread]

🎯 CTA: Arquiteto MVP R$ 52

👉 Próximo: Lúcia Linkedin segmenta para nichos
```
