---
task: "Escrever Email Frio"
order: 2
input: |
  - diagnosticos_financeiros: Dossiê financeiro gerado pelo Léo
output: |
  - copy_email: E-mails frios estruturados para disparo B2B
---

# Escrever Email Frio

Cria a versão para e-mail da estratégia PAS, mantendo a regra vital de ser direto (abaixo de 150 palavras) e personalizado para evitar filtros de spam.

## Processo

1. Cria um Assunto de e-mail focado na operação do cliente (Curiosidade Direta).
2. Na introdução, quebra o gelo usando um fato observado (ex: "notei que não há site").
3. Apresenta o Custo de Oportunidade e o contraste de solução (7 dias vs 50k).
4. Finaliza com CTA de baixo atrito ("Vale a pena falarmos?").

## Output Format

```yaml
emails:
  - lead: "..."
    assunto: "..."
    corpo_email: |
      ...
```

## Output Example

```yaml
emails:
  - lead: "Odonto Clean Moema"
    assunto: "O agendamento noturno da clínica"
    corpo_email: |
      Oi, Dr. João.

      Notei que a clínica não possui agendamento via site/bot. Hoje, clínicas em SP perdem cerca de 30% dos pacientes que tentam marcar consultas após as 19h.

      Não faz sentido gastar R$ 50 mil e meses em um software de gestão. Com o Aline Builds, validamos um Agente de WhatsApp para sua clínica rodar 24h em apenas 7 dias.

      Faz sentido falarmos por 10 minutos esta semana?
```

## Quality Criteria
- [ ] Assunto do e-mail é curto (máximo de 6 palavras) e sem tom comercial.
- [ ] A contagem de palavras do corpo do e-mail é inferior a 150 palavras.
- [ ] A transição entre problema e solução é natural e lógica.

## Veto Conditions
Reject and redo if ANY are true:
1. O assunto contiver "oferta", "parceria", ou cara de mala-direta de marketing.
2. A primeira frase for "Espero que este e-mail o encontre bem".
