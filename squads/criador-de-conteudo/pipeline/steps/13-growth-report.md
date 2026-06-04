---
agent: georgia-gerente
step: growth_report
execution: inline
model_tier: powerful
inputFile: "squads/criador-de-conteudo/output/publish-report.md"
outputFile: "squads/criador-de-conteudo/output/growth-report.md"
---

# Step 13 — Geórgia Gerente: Relatório Growth & Social Selling

## Objetivo
Geórgia compila todo o conteúdo produzido na run em um relatório executivo de Growth & Social Selling e envia via Telegram para a Aline.

## Processo

1. **Leia todos os outputs** da run atual:
   - `squads/criador-de-conteudo/output/saas-brief.md`
   - `squads/criador-de-conteudo/output/diagnostico-leo.md`
   - `squads/criador-de-conteudo/output/content-strategy-brief.md`
   - `squads/criador-de-conteudo/output/linkedin-post.md`
   - `squads/criador-de-conteudo/output/twitter-thread.md`
   - `squads/criador-de-conteudo/output/content-pack.md`
   - `squads/criador-de-conteudo/output/design-brief.md`
   - `squads/criador-de-conteudo/output/veredito-final.md`
   - `squads/criador-de-conteudo/output/publish-report.md`

2. **Identifique o Post Campeão**: Analise qual conteúdo teve maior potencial de engajamento com base no diagnóstico e veredito da Vera.

3. **Compile as métricas disponíveis**:
   - Se a Sofia reportou dados de alcance/impressões no publish-report, inclua
   - Se o Caio mencionou CTAs clicáveis, estime potencial de cliques
   - Se há dados de blueprints (Firestore), mencione

4. **Formate o relatório** no padrão definido no seu perfil de agente.

5. **Envie para o Telegram** no grupo geral (thread_id: 1) usando `telegram-bridge`.

## Formato de Saída

Salve em `squads/criador-de-conteudo/output/growth-report.md`:

```markdown
# 📊 Relatório Growth & Social Selling — [Data]
**Gerado por:** Geórgia Gerente

---

## 1. Tração nas Redes
**LinkedIn:** [impressões] impressões | [seguidores] novos seguidores
**Twitter (X):** [impressões] impressões | [seguidores] novos seguidores
**Post Destaque:** [link/análise]

## 2. Conversão Comercial
**Cliques na LP:** [acessos]
**Blueprints Gerados:** [quantidade] novos (R$ [valor] de faturamento)
**Leads Qualificados:** [destaques]

## 3. Planejamento Próximos Passos
**Próximo alvo:** [tema/saas da próxima run]
**Ajuste de discurso:** [insight da audiência]
```

## Notificação Telegram
Após salvar o relatório, publique no grupo geral do Telegram:
- Use `thread_id: 1` (geral)
- Envie o relatório completo formatado em Markdown
- Se houver falhas em steps anteriores, destaque no início: "⚠️ Falhas detectadas: [lista]"

## Veto Conditions
- O relatório não pode ser enviado vazio — se faltarem dados, indique "N/D" com justificativa.
- Se o veredito da Vera foi REPROVADO, o relatório deve refletir que o conteúdo não foi publicado.
