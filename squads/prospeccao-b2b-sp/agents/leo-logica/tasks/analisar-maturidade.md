---
task: "Analisar Maturidade"
order: 1
input: |
  - lista_formatada: A tabela markdown de leads extraída
output: |
  - leads_avaliados: Análise detalhada do status digital de cada lead
---

# Analisar Maturidade

Avalia o status de cada lead da tabela, focando na sua capacidade tecnológica atual (se estão manuais ou já automatizados) e seleciona o "ponto de dor" principal.

## Processo

1. Percorre cada lead da tabela formatada.
2. Se não tem site, o diagnóstico inicial foca em processos analógicos (WhatsApp manual). Se tem site, foca na falta de funil/agentes 24h.
3. Determina qual serviço Aline Builds (Arquiteto MVP ou Agente de Automação) é mais aplicável para a situação do lead.

## Output Format

```yaml
analises:
  - empresa: "..."
    ponto_dor: "..."
    servico_sugerido: "..."
    status_maturidade: "Baixa/Média"
```

## Output Example

```yaml
analises:
  - empresa: "Odonto Clean Moema"
    ponto_dor: "Não possui site para captação automática, dependendo 100% de indicações e agendamento humano no WhatsApp comercial horário comercial."
    servico_sugerido: "Agente de Automação de Agendamento via WhatsApp 24/7"
    status_maturidade: "Baixa"
```

## Quality Criteria
- [ ] Cada análise aponta uma dor específica do nicho (ex: agendamento, captação).
- [ ] O serviço sugerido corresponde a uma oferta real da Aline Builds.
- [ ] A análise demonstra compreensão do impacto da "falta de site".

## Veto Conditions
Reject and redo if ANY are true:
1. A dor apontada for irrelevante para a oferta de tecnologia (ex: "localização ruim da clínica").
2. O serviço sugerido não fizer parte do portfólio especificado.
