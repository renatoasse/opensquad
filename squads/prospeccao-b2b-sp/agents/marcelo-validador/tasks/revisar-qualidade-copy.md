---
task: "Revisar Qualidade Copy"
order: 1
input: |
  - mensagens: As copys geradas pelo Caio
  - ofertas: Os ganchos gerados pelo Natan
output: |
  - reviews: Avaliação estruturada com notas e aprovação/rejeição
---

# Revisar Qualidade Copy

Analisa duramente cada mensagem gerada com base nos critérios de qualidade e emite um veredito final: APPROVE ou REJECT, solicitando refação imediata caso necessário.

## Processo

1. Conta o tamanho do texto (limite de 150 palavras para email).
2. Verifica se a âncora "7 dias" (para Caio) ou "75%" (para Natan) foi usada.
3. Lê atentamente em busca de jargões ocos ou "Eu acho que".
4. Gera uma tabela de pontuação com veredito obrigatório e feedback específico de melhoria ou correção (fix).

## Output Format

```yaml
reviews:
  - lead: "..."
    verdict: "APPROVE/REJECT"
    score: "0-10"
    feedback_detalhado: |
      [Tabela ou texto explicativo com Required Changes e Strengths]
```

## Output Example

```yaml
reviews:
  - lead: "Odonto Clean Moema"
    verdict: "REJECT"
    score: "6"
    feedback_detalhado: |
      Required change: A copy atingiu 180 palavras. Está muito longa para um cold email efetivo. Reduza cortando a explicação de como funciona a LLM.
      Required change: Faltou a ancoragem de Custo de Oportunidade.
      Strength: O assunto está perfeito e curto (5 palavras).
```

## Quality Criteria
- [ ] A nota e o veredito são inequivocamente claros logo no início.
- [ ] Toda dedução de nota traz uma solução acoplada (Required change).
- [ ] Critérios cruciais (limite de palavras, CTA) geram rejeição sumária se falharem.

## Veto Conditions
Reject and redo if ANY are true:
1. O Reviewer aprovou um e-mail com mais de 150 palavras ou sem CTA.
2. O feedback foi genérico como "Dá para melhorar o tom".
