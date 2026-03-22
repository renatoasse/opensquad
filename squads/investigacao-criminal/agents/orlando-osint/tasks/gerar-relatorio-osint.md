---
task: gerar-relatorio-osint
order: 3
agent: orlando-osint
input: Tasks 1 e 2 concluídas (perfis sociais + bases abertas)
output: output/relatorio-osint.md — relatório consolidado de OSINT
---

## Process

1. Consolidar todos os dados de perfis sociais e bases abertas por investigado
2. Para cada investigado, montar seção com: presença digital, dados cartoriais, empresas vinculadas, veículos, imóveis
3. Identificar pessoas/entidades novas encontradas (não listadas inicialmente) — adicionar à seção "Novos Atores Identificados"
4. Listar lacunas: dados que não foi possível verificar sem autorização judicial
5. Atribuir nível de confiança geral por investigado
6. Salvar em output/relatorio-osint.md

## Output Format

```markdown
# Relatório de Inteligência OSINT
Procedimento: [PIC n. X/AAAA]
Data: [YYYY-MM-DD]
Investigados: [N investigados analisados]

---

## [Nome do Investigado 1] (CPF: XXX)

### Presença Digital
[dados de perfis sociais]

### Dados em Bases Abertas
[Receita, CNPJs, veículos, imóveis]

### Nível de Confiança Geral: [Alta/Média/Baixa]

---

## [Nome do Investigado 2] (CPF: XXX)
[...]

---

## Novos Atores Identificados
[pessoas não listadas inicialmente mas encontradas na pesquisa]

## Lacunas
[lista do que requer autorização judicial]
```

## Output Example

Consultar pipeline/data/output-examples.md — Exemplo 1.

## Quality Criteria

- [ ] Seção para cada investigado da lista original
- [ ] Seção "Novos Atores Identificados" presente (mesmo que vazia)
- [ ] Seção "Lacunas" presente com itens específicos
- [ ] Nível de confiança geral por investigado
- [ ] Salvo em output/relatorio-osint.md

## Veto Conditions

- Investigado da lista original ausente do relatório → refazer
- Relatório sem seção de lacunas → refazer
