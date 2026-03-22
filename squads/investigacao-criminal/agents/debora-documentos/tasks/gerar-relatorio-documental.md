---
task: gerar-relatorio-documental
order: 3
agent: debora-documentos
input: Tasks 1 e 2 concluídas (RIFs + documentos cartoriais)
output: output/relatorio-documental.md — relatório consolidado documental
---

## Process

1. Consolidar análises de RIFs e documentos cartoriais
2. Criar seção de matriz de achados: [Documento] → [Partes] → [Ato/Valor] → [Anomalia]
3. Criar seção de novos atores identificados (partes não listadas inicialmente)
4. Criar seção de achados críticos (anomalias de maior relevância para a investigação)
5. Criar seção de lacunas documentais (documentos mencionados mas não entregues, dados que requerem autorização judicial)
6. Salvar em output/relatorio-documental.md

## Output Format

```markdown
# Relatório de Análise Documental
Procedimento: [PIC n. X/AAAA]
Data: [YYYY-MM-DD]
Documentos analisados: [N]

---

## RIFs Analisados
[achados por RIF]

## Documentos Cartoriais
[achados por documento]

## Relatórios Policiais
[achados]

## Matriz de Achados
| Documento | Partes | Ato/Valor | Anomalia |
|-----------|--------|-----------|---------|
[tabela]

## Novos Atores Identificados
[lista]

## Achados Críticos
[anomalias mais relevantes com ⚠️ CRÍTICO]

## Lacunas Documentais
[lista do que está faltando]
```

## Quality Criteria

- [ ] Matriz de achados presente e completa
- [ ] Seção de achados críticos com as principais anomalias
- [ ] Novos atores identificados listados
- [ ] Lacunas documentais declaradas
- [ ] Salvo em output/relatorio-documental.md

## Veto Conditions

- Relatório sem matriz de achados → refazer
- Anomalia crítica não presente na seção de achados críticos → refazer
