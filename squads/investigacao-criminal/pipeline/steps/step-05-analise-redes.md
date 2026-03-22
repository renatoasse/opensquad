---
type: agent
agent: raul-redes
execution: inline
parallel_group: analise
inputFile: squads/investigacao-criminal/output/relatorio-osint.md
outputFile: squads/investigacao-criminal/output/relatorio-rede-criminal.md
---

# Análise de Redes Criminais — Raul Redes

**Agente:** Raul Redes — Analista de Vínculos e Redes Criminais

Raul está mapeando as conexões entre todos os atores identificados.

**O que está sendo feito:**
- Consolidação de todos os atores (investigados + novos identificados)
- Mapeamento de vínculos por categoria (familiar, societário, financeiro, documental)
- Cálculo de centralidade de cada ator
- Identificação de papéis (líder, operacional, laranja, facilitador)
- Formulação de hipótese de modus operandi
- Geração do grafo de vínculos

**Execução:** inline (aguarda OSINT e Documentos; paralelo com Fábio Financeiro)

**Output:** output/relatorio-rede-criminal.md
