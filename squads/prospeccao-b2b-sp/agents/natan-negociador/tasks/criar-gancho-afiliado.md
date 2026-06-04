---
task: "Criar Gancho Afiliado"
order: 1
input: |
  - mensagens_geradas: Copys iniciais do Caio
output: |
  - ofertas_afiliados: Variantes com foco no downsell de comissão
---

# Criar Gancho Afiliado

Gera a versão "Plano B" ou follow-up, que utiliza o gatilho de Risco Zero e a margem de afiliação de 75% da Hotmart para fechar negócios onde o cliente esbarra em verba inicial.

## Processo

1. Lê a dor original tratada na copy do Caio.
2. Cria uma transição baseada em remover a objeção financeira inicial.
3. Aplica o framework 4Ps (Promise, Picture, Proof, Push) na variante de afiliação.
4. Destaca a taxa de "75% de comissão" e o termo "Risco Zero".

## Output Format

```yaml
ofertas_afiliados:
  - lead: "..."
    texto_followup: |
      ...
```

## Output Example

```yaml
ofertas_afiliados:
  - lead: "Odonto Clean Moema"
    texto_followup: |
      Dr. João, se o investimento do Agente for uma barreira, que tal uma parceria risco-zero?

      Nós implementamos a automação na clínica e dividimos os lucros gerados por ela. Você fica com 75% da comissão no nosso sistema de afiliados para cada fechamento.

      Podemos avançar nesse modelo risco-zero até semana que vem?
```

## Quality Criteria
- [ ] "75%" e "Risco Zero" estão explicitamente na copy.
- [ ] A oferta é apresentada claramente como uma parceria de ganha-ganha.
- [ ] O tamanho do follow-up é menor que o e-mail original (ideal para repique).

## Veto Conditions
Reject and redo if ANY are true:
1. O texto omitir a taxa de 75% ou o gatilho de risco zero.
2. A linguagem soar como "esmolando" parceria (deve ser proposta confiante de negócios).
