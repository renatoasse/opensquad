---
task: "Escrever WhatsApp"
order: 1
input: |
  - diagnosticos_financeiros: Dossiê financeiro gerado pelo Léo
output: |
  - copy_whatsapp: Scripts rápidos e segmentados para WhatsApp
---

# Escrever WhatsApp

Gera mensagens extremamente curtas e conversacionais para disparo via WhatsApp, utilizando o framework PAS e o Método CLAUDE.

## Processo

1. Opciona o "Hook-first": usa a dor extraída no diagnóstico logo na primeira linha, após a saudação.
2. Agita a dor usando o "Custo de Oportunidade" levantado.
3. Insere a solução ancorada: Validação de 7 dias vs 50k.
4. Adiciona a CTA ("Call to Action") perguntando se podem fazer uma ligação rápida de 10 min.

## Output Format

```yaml
scripts:
  - lead: "..."
    texto_whatsapp: |
      ...
```

## Output Example

```yaml
scripts:
  - lead: "Odonto Clean Moema"
    texto_whatsapp: |
      Oi, Dr. João.

      Notei que a clínica ainda faz o agendamento todo manual pelo WhatsApp. Clínicas aqui na região perdem cerca de 30% de pacientes que mandam mensagem à noite e não têm resposta.

      Em vez de gastar R$ 50 mil em sistemas complexos, no Aline Builds nós validamos um Agente de IA para agendamento 24h em apenas 7 dias.

      Faz sentido fazermos uma ligação de 10 min para eu te mostrar?
```

## Quality Criteria
- [ ] O texto tem no máximo 4 blocos curtos, respeitando a leitura vertical do WhatsApp.
- [ ] Não há jargões de tecnologia (LLM, Prompt).
- [ ] A CTA é clara e pede uma micro-decisão (uma call rápida de 10 min).

## Veto Conditions
Reject and redo if ANY are true:
1. O texto ultrapassa 500 caracteres totais (textão).
2. O texto não contiver o contraste "7 dias".
