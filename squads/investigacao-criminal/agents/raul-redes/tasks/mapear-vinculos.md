---
task: mapear-vinculos
order: 1
agent: raul-redes
input: output/relatorio-osint.md + output/relatorio-documental.md
output: Mapa completo de vínculos entre todos os atores
---

## Process

1. Extrair lista completa de atores: todos os nomes/entidades de ambos os relatórios
2. Remover duplicatas e padronizar nomes
3. Categorizar cada ator: PF investigado principal / PF investigado secundário / PF familiar / PJ operacional / PJ suspeita de fachada
4. Para cada ator, listar todos os vínculos com outros atores, categorizados por tipo:
   - Familiar (cônjuge, filho, pai, irmão, etc.)
   - Societário (sócios na mesma empresa)
   - Financeiro (transferências no RIF, procuração bancária)
   - Documental (aparece no mesmo documento)
   - Digital (mencionado ou conectado em redes sociais)
   - Residencial (mesmo endereço)
5. Para cada vínculo: indicar fonte + nível de certeza (confirmado/suspeito)

## Output Format

```yaml
atores:
  - id: [número]
    nome: "[Nome]"
    tipo: "[PF-Principal/PF-Secundário/PF-Familiar/PJ-Operacional/PJ-Fachada]"
    cpf_cnpj: "[CPF/CNPJ]"
    vinculos:
      - com: "[Nome do outro ator]"
        tipo: "[Familiar/Societário/Financeiro/Documental/Digital/Residencial]"
        descricao: "[descrição do vínculo]"
        fonte: "[documento/relatório]"
        certeza: "[Confirmado/Suspeito]"
```

## Quality Criteria

- [ ] Todos os atores de ambos os relatórios incluídos
- [ ] Tipos de vínculos categorizados corretamente
- [ ] Fonte indicada para cada vínculo
- [ ] Certeza atribuída (Confirmado/Suspeito)

## Veto Conditions

- Investigado principal ausente da lista → refazer
- Vínculo listado sem fonte → refazer
