---
task: "Preparar Disparo"
order: 2
input: |
  - reviews: Saída da revisão (apenas blocos APPROVE)
output: |
  - scripts_finais: Markdown limpo com links e placeholders corretos
---

# Preparar Disparo

Pega as copys aprovadas, limpa quaisquer marcações de rascunho, adiciona os links apropriados (como links de checkout ou calendário) e formata um documento final pronto para uso.

## Processo

1. Filtra apenas as mensagens que receberam o VERDICT: APPROVE.
2. Se a copy for a de "Oferta Afiliado", garante que haja a menção explícita de inserir o link do checkout Hotmart no lugar do CTA.
3. Compila as saídas num Markdown de fácil "Copiar e Colar" para operação.

## Output Format

```markdown
# Script Pronto: [Empresa]
**Canal**: [Email/WhatsApp]

[Texto Limpo da Copy]

---
```

## Output Example

# Script Pronto: Odonto Clean Moema
**Canal**: WhatsApp (Follow-up Afiliado)

Dr. João, se o investimento do Agente for uma barreira, que tal uma parceria risco-zero?

Nós implementamos a automação na clínica e dividimos os lucros gerados por ela. Você fica com 75% da comissão no nosso sistema para cada fechamento.

Podemos avançar nesse modelo risco-zero até semana que vem?

*Link a ser enviado em caso de aceite:* `[Link Hotmart Aline Builds]`
---

## Quality Criteria
- [ ] Documento contém apenas copys aprovadas e sem anotações de revisão.
- [ ] Formatação está perfeitamente limpa para um CTRL+C sem retrabalho humano.

## Veto Conditions
Reject and redo if ANY are true:
1. Uma copy REJECTED passou para o script final.
2. Marcações internas da IA (como `Aqui está a sua copy:`) foram mantidas no texto final.
