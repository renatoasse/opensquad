---
agent: teresa-tendencias
step: trend_analysis
execution: inline
model_tier: powerful
inputFile: "squads/criador-de-conteudo/output/diagnostico-leo.md"
outputFile: "squads/criador-de-conteudo/output/trend-analysis.md"
---

# Step 04 — Teresa Tendências: Análise de Tendências e Definição do Tema da Semana

## Objetivo
Teresa monitora o mercado de IA, tendências de dev 2026 e atualizações do Gemini, cruza com o Ranking de Ideias de Apps Pagos e o diagnóstico do Léo, e define qual micro-SaaS ou automação será o tema de conteúdo da semana.

## Processo

1. **Pesquise tendências atuais** usando `web_search`:
   - "AI micro SaaS trends 2026"
   - "Gemini API updates 2026"  
   - "automation tools trending 2026"
   - "b2b AI solutions validation"
   - "no-code low-code business tools 2026"

2. **Leia o Ranking de Ideias** em `_opensquad/_memory/ranking-ideias.md` (se existir)

3. **Leia o diagnóstico do Léo** em `squads/criador-de-conteudo/output/diagnostico-leo.md`

4. **Cruze tudo** e defina:
   - O micro-SaaS ou automação mais promissor da semana
   - Por que agora é o momento certo (evidência de tendência)
   - Como o tópico se encaixa no Ranking de Ideias

5. **Salve** o output estruturado.

6. **Notifique no Telegram** no tópico `teresa-tendencias` (thread_id: 12).

## Formato de Saída

Salve em `squads/criador-de-conteudo/output/trend-analysis.md`:

```markdown
# 🔮 Análise de Tendências — [Data]

## Tema da Semana
[Título do micro-SaaS ou automação escolhido]

## Evidências
- **Tendência:** [descrição da tendência]
- **Fonte:** [link da referência]
- **Relevância:** [por que isso importa para o público B2B]

## Encaixe no Ranking
- **Posição no Ranking:** [# / N]
- **Potencial de validação:** [argumento]

## Conexão com Diagnóstico
- **Cliente ideal:** [perfil do lead]
- **Ângulo de conteúdo:** [como abordar o tema]
```

## Notificação Telegram
Use `telegram-bridge` para enviar ao thread_id 12:
```markdown
🔮 *Teresa Tendências — Tema da Semana*

📌 **[título do tema]**

📈 Tendência: [evidência curta]
🎯 Ranking: #[posição]

👉 Próximo: Elias Estratégia prepara o briefing
```
