---
task: analisar-documentos-cartoriais
order: 2
agent: debora-documentos
input: Escrituras, matrículas, procurações e relatórios policiais fornecidos pelo usuário
output: Análise estruturada dos documentos cartoriais e policiais
---

## Process

1. Catalogar todos os documentos recebidos (tipo, data, partes, notário/órgão)
2. Para cada escritura: identificar partes, bem transacionado, valor declarado, data
3. Para cada matrícula: extrair histórico de proprietários, ônus, hipotecas, penhoras
4. Para cada procuração: identificar outorgante, outorgado, poderes conferidos, prazo
5. Para cada relatório policial: extrair nomes, datas, locais, eventos relevantes
6. Cruzar todas as partes identificadas com lista de investigados
7. Sinalizar com ⚠️ anomalias: valores muito baixos/altos, poderes excessivos em procurações, transferências entre partes da rede
8. Registrar quando um documento menciona outro documento não entregue

## Output Format

```yaml
documentos_cartoriais:
  - tipo: "[Escritura/Matrícula/Procuração]"
    referencia: "[número/identificação]"
    data: "[YYYY-MM-DD]"
    partes:
      - nome: "[Nome]"
        cpf_cnpj: "[CPF/CNPJ]"
        papel: "[Comprador/Vendedor/Outorgante/Outorgado/etc]"
    ato: "[Compra e venda / Procuração / etc]"
    valor: "R$ X (quando aplicável)"
    anomalias:
      - "[⚠️ descrição da anomalia]"
    cruzamento_investigados:
      - "[Nome encontrado na lista de investigados]"

relatorios_policiais:
  - referencia: "[número/data]"
    orgao: "[delegacia/órgão]"
    nomes_identificados:
      - "[nome]"
    datas_eventos:
      - "[evento + data]"
    enderecos_identificados:
      - "[endereço]"
    documentos_referenciados_nao_entregues:
      - "[documento mencionado mas não disponível]"
```

## Quality Criteria

- [ ] Todos os documentos catalogados
- [ ] Partes qualificadas com nome + CPF/CNPJ
- [ ] Cruzamento com lista de investigados realizado
- [ ] Anomalias sinalizadas com ⚠️
- [ ] Documentos mencionados mas não entregues registrados

## Veto Conditions

- Documento recebido sem processamento → refazer
- Procuração ampla sem sinalização de anomalia → refazer
