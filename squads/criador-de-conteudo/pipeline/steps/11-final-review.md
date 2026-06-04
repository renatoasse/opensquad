---
agent: vera-veredito
step: final_review
execution: inline
model_tier: powerful
inputFile: "squads/criador-de-conteudo/output/content-pack.md"
outputFile: "squads/criador-de-conteudo/output/veredito-final.md"
on_reject: copy_craft
on_reject_alt: linkedin_copy
max_review_cycles: 2
---

# Step 11 — Vera Veredito: Revisão Final

## Objetivo
Vera Veredito faz o controle de qualidade total do content pack antes da publicação. Nada passa sem o seu aval.

## Processo

1. **Leia** o LinkedIn Post em `squads/criador-de-conteudo/output/linkedin-post.md`.
2. **Leia** a Twitter Thread em `squads/criador-de-conteudo/output/twitter-thread.md`.
3. **Leia** o Content Pack em `squads/criador-de-conteudo/output/content-pack.md`.
4. **Leia** o Design Brief em `squads/criador-de-conteudo/output/design-brief.md`.
3. **Revise** com rigor em 4 dimensões:

### Dimensão 1 — DNA Mentor Léo
- O tom está provocador o suficiente? Parece humano ou parece IA?
- Tem a acidez de Ícaro de Carvalho e a precisão analítica de Moacir Moda?
- Algum parágrafo começa com clichê? ("Você já se perguntou...", "Em um mundo onde...")

### Dimensão 2 — CTAs e Funil
- Todos os conteúdos (LinkedIn, Twitter, Content Pack) têm CTA claro para a Aline Builds?
- Os links estão corretos? (`https://hotm.io/alinebuilds`)
- O leitor sabe exatamente qual passo dar depois de ler?

### Dimensão 3 — Precisão de Dados
- Os cálculos de ARR múltiple fazem sentido (2x–6x)?
- Os números citados são plausíveis para o mercado SaaS brasileiro?
- Nenhuma afirmação sem base real?

### Dimensão 4 — Design Visual
- O infográfico é compreensível em 3 segundos?
- O dado central é impactante o suficiente para parar o scroll?
- O branding Aline Builds está presente?

## Formato de Saída

Salve o veredito em `squads/criador-de-conteudo/output/veredito-final.md`:

```markdown
# Veredito Final — [Nome do SaaS]
**Revisado por:** Vera Veredito | **Data:** [data]

## Status: [✅ APROVADO / ❌ REPROVADO]

## Revisão por Dimensão

### DNA Mentor Léo
**Status:** [OK / AJUSTAR]
[comentários específicos — seja severa]

### CTAs e Funil
**Status:** [OK / AJUSTAR]
[comentários]

### Precisão de Dados
**Status:** [OK / AJUSTAR]
[comentários]

### Design Visual
**Status:** [OK / AJUSTAR]
[comentários]

## Pontuação Final
| Dimensão | Nota |
|----------|------|
| DNA Mentor Léo | /10 |
| CTAs e Funil | /10 |
| Dados | /10 |
| Design | /10 |
| **Média** | **/10** |

## Ajustes Obrigatórios (se REPROVADO)
1. [Ajuste específico 1]
2. [Ajuste específico 2]

## Mensagem para o Caio Copy (se reprovado)
[feedback direto e específico para refação]
```

## Notificação Telegram
Após salvar o veredito, notifique no seu tópico do Telegram:
- Leia `pipeline/data/telegram-config.yaml` para seu `thread_id` (vera-veredito)
- Envie: `⚖️ *Vera Veredito:* Revisão concluída! Status: {APROVADO/REPROVADO} — Nota: {X}/10`
- Use a skill `telegram-bridge` para enviar a mensagem
- Se aprovado, também marque no tópico da Sofia: "📣 @SofiaSocial conteúdo liberado para publicação!"

## Veto Conditions
- Se a nota média for abaixo de 7.5/10, o veredito é REPROVADO e o conteúdo volta para o Caio.
- Se qualquer Link estiver errado, REPROVAR imediatamente.
- Se o artigo tiver parágrafos maiores que 5 linhas, REPROVAR (violação de formato LinkedIn).
