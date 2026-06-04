---
execution: inline
agent: "squads/prospeccao-b2b-sp/agents/georgia-gerente"
inputFile: "squads/prospeccao-b2b-sp/output/scripts-finais-aprovados.md"
outputFile: "squads/prospeccao-b2b-sp/output/relatorio-semanal.md"
---

# Step 09: Georgia Gerente — Relatório Semanal Growth & Prospecção

## Objetivo
Georgia compila o relatório semanal completo da Aline Dev, unificando a produção de conteúdo (Criador de Conteúdo — terça/quinta) com a prospecção B2B (sexta), e envia via Telegram.

## Processo

1. **Leia os outputs do Criador de Conteúdo** (da última terça e quinta):
   - `squads/criador-de-conteudo/output/growth-report.md`

2. **Leia todos os outputs** da run de prospecção:
   - `squads/prospeccao-b2b-sp/output/leads-formatados.md`
   - `squads/prospeccao-b2b-sp/output/leads-diagnosticados.md`
   - `squads/prospeccao-b2b-sp/output/mensagens-geradas.md`
   - `squads/prospeccao-b2b-sp/output/scripts-finais-aprovados.md`

3. **Compile o relatório semanal** seguindo a estrutura definida no perfil da Georgia.

4. **Envie para o Telegram** no grupo geral (thread_id: 1) usando `telegram-bridge`.

## Formato de Saída

Salve em `squads/prospeccao-b2b-sp/output/relatorio-semanal.md`:

```markdown
# 📊 Relatório Semanal Growth & Prospecção — [Data]

## 1. Produção de Conteúdo
- **Posts:** [N] no LinkedIn | [N] no Twitter
- **Engajamento:** [N] likes | [N] comentários | [N] compartilhamentos
- **Post Destaque:** [título] — [motivo do destaque]

## 2. Prospecção B2B
- **Leads extraídos:** [N]
- **Leads contatados:** [N]
- **Fit:** [N] Alto | [N] Médio | [N] Baixo

## 3. Pipeline
- **Novos leads:** [N]
- **Reuniões/Ofertas:** [N]
- **Blueprints:** [N]

## 4. Próximos Passos
- **Follow-up:** [N] leads
- **Ajustes:** [insights]
- **Próximo alvo:** [sugestão]
```

## Notificação Telegram
Após salvar o relatório, publique no grupo geral do Telegram:
- Use `thread_id: 1` (geral)
- Formate em Markdown com seções numeradas
- Se houver falhas, destaque no início: "⚠️ Falhas detectadas: [lista]"

## Veto Conditions
- O relatório não pode ser enviado vazio
- Se faltarem dados do Criador de Conteúdo, indique como "N/D" mas não omita a seção
