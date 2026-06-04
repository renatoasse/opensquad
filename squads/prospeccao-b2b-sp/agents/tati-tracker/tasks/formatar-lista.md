---
task: "Formatar Lista"
order: 3
input: |
  - dados_brutos: Lista bruta extraída no passo 2
output: |
  - lista_formatada: Markdown estruturado dos leads limpos
---

# Formatar Lista de Leads Sociais

Limpa e padroniza os dados brutos de leads extraídos de engajamento social, classificando por fit B2B e formatando para o próximo agente da pipeline.

## Processo

1. Remove leads sem informação de contato (incontatáveis).
2. Classifica o "Fit B2B" como Alto (decisor com contato), Médio (influenciador com contato parcial), Baixo (sem contato).
3. Gera uma tabela em Markdown com os campos do novo formato.

## Output Format

```markdown
| Nome | Perfil | Empresa | Cargo | Contato | Fit B2B |
|------|--------|---------|-------|---------|---------|
| [Nome] | [URL] | [Empresa] | [Cargo] | [Email/Tel] | [Alto/Médio/Baixo] |
```

## Output Example

| Nome | Perfil | Empresa | Cargo | Contato | Fit B2B |
|------|--------|---------|-------|---------|---------|
| Dr. Carlos Silva | linkedin.com/in/carlos-silva | Clínica OdontoCare | Diretor | carlos@odontocare.com.br | Alto |
| Ana Beatriz | linkedin.com/in/ana-beatriz | Escritório Silva Adv | Sócia | ana@silvaadv.com.br | Alto |

## Quality Criteria
- [ ] Tabela em markdown perfeitamente formatada.
- [ ] Todos os leads listados possuem ao menos um canal de contato.
- [ ] A classificação de "Fit B2B" está coerente com os dados encontrados.

## Veto Conditions
Reject and redo if ANY are true:
1. A saída não está em formato Markdown Table válido.
2. A tabela contém leads sem nenhum meio de comunicação.
