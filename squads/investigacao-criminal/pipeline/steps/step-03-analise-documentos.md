---
type: agent
agent: debora-documentos
execution: subagent
parallel_group: coleta
inputFile: squads/investigacao-criminal/output/research-focus.md
outputFile: squads/investigacao-criminal/output/relatorio-documental.md
---

# Análise de Documentos — Débora Documentos

**Agente:** Débora Documentos — Analista de Documentos Investigativos

Débora está analisando todos os documentos fornecidos pelo usuário.

**O que está sendo feito:**
- Análise de RIFs (tipologias COAF, contrapartes, anomalias)
- Análise de escrituras, matrículas e procurações
- Análise de relatórios policiais
- Cruzamento de partes com lista de investigados
- Sinalização de anomalias

**Execução:** subagent (paralelo com Orlando OSINT)

**Output:** output/relatorio-documental.md
