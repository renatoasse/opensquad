---
agent: gustavo-gestor
step: recrutamento_afiliados
execution: inline
model_tier: powerful
inputFile: ""
outputFile: "squads/vendas-lucrativas/output/afiliados-recrutados.md"
---

# Step 04 — Gustavo Gestor: Recrutamento de Afiliados

## Objetivo
Gustavo recruta influenciadores de tecnologia e parceiros de tráfego para venderem como afiliados com 75% de comissão.

## Processo
1. Pesquise potenciais afiliados (influenciadores de tecnologia, infoprodutores)
2. Entre em contato com a oferta de 75% de comissão líquida
3. Prove matematicamente o potencial de ganho vs cursos de programação
4. Registre cada prospecção e resultado
5. Salve o relatório de recrutamento
6. Notifique no Telegram (thread_id: 9)

## Formato de Saída
Salve em `squads/vendas-lucrativas/output/afiliados-recrutados.md`:
- Total de prospecções realizadas
- Por parceiro: nome, contato, resultado
- Novos afiliados ativos

## Notificação Telegram
Use `telegram-bridge` para enviar ao thread_id 9:
"🤝 Gustavo Gestor: [N] prospecções — [N] novos afiliados — [N] ativos"
