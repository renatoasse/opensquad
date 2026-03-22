---
task: pesquisar-bases-abertas
order: 2
agent: orlando-osint
input: Lista de investigados com CPF/CNPJ
output: Dados de bases abertas (Receita, cartório, DETRAN)
---

## Process

1. Para cada investigado, buscar CPF na Receita Federal: situação + endereços vinculados
2. Buscar CNPJs vinculados ao CPF: empresas como sócio, administrador, representante
3. Para cada CNPJ encontrado: verificar situação cadastral, endereço, quadro societário
4. Buscar veículos: DETRAN (quando disponível via consulta pública) ou via Google "CPF placa"
5. Buscar imóveis: pesquisa em cartórios via nome + cidade (quando disponível publicamente)
6. Buscar via Google: "[Nome] CPF [cidade]", "[Nome] empresa", "[apelido] [cidade]"
7. Documentar todos os resultados com fonte + data de acesso

## Output Format

```yaml
investigado: "[Nome]"
cpf: "[CPF]"
receita_federal:
  situacao: "[Regular/Irregular/Suspenso]"
  enderecos_vinculados:
    - "[endereço 1]"
cnjps_vinculados:
  - cnpj: "[CNPJ]"
    razao_social: "[Nome da empresa]"
    funcao: "[Sócio/Administrador/Representante]"
    participacao: "[%]"
    situacao: "[Ativa/Baixada]"
    endereco: "[endereço]"
    acessado: "[YYYY-MM-DD]"
veiculos:
  - descricao: "[modelo + ano]"
    placa: "[placa]"
    proprietario: "[nome/CNPJ]"
    fonte: "[DETRAN/outra]"
    acessado: "[YYYY-MM-DD]"
imoveis:
  - descricao: "[endereço]"
    matricula: "[número]"
    proprietario: "[nome]"
    valor_declarado: "[R$ X]"
    fonte: "[cartório]"
    acessado: "[YYYY-MM-DD]"
lacunas:
  - "[o que não foi possível verificar]"
```

## Output Example

```yaml
investigado: "João Silva Santos"
cpf: "000.000.000-00"
receita_federal:
  situacao: Regular
  enderecos_vinculados:
    - "Rua das Acácias, 450, São Paulo/SP"
    - "Av. Beira-Mar, 1800, apt 801, Balneário Camboriú/SC"
cnpjs_vinculados:
  - cnpj: "00.000.000/0001-00"
    razao_social: "JS Construções Ltda"
    funcao: "Sócio administrador"
    participacao: "85%"
    situacao: "Ativa"
    endereco: "Rua das Acácias, 450, São Paulo/SP"
    acessado: "2026-03-22"
veiculos:
  - descricao: "Toyota Land Cruiser 2024"
    placa: "ABC-0001"
    proprietario: "João Silva Santos"
    fonte: "DETRAN/SP (consulta pública)"
    acessado: "2026-03-22"
imoveis:
  - descricao: "Rua das Acácias, 450, São Paulo/SP"
    matricula: "00001"
    proprietario: "João Silva Santos"
    valor_declarado: "R$ 850.000"
    fonte: "1º Cartório de Registro de Imóveis de SP (consulta pública)"
    acessado: "2026-03-22"
lacunas:
  - "Contas bancárias específicas: requer quebra de sigilo bancário"
  - "IRPF declarado: requer INFOJUD/autorização judicial"
```

## Quality Criteria

- [ ] CPF verificado na Receita Federal
- [ ] Todos os CNPJs vinculados pesquisados
- [ ] Veículos pesquisados (ou lacuna declarada)
- [ ] Imóveis pesquisados (ou lacuna declarada)
- [ ] Lacunas explicitamente declaradas

## Veto Conditions

- Investigado sem consulta à Receita Federal → refazer
- CNPJ encontrado mas não detalhado → refazer
