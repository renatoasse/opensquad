---
task: "Definir Parâmetros"
order: 1
input: |
  - growth_report: Relatório Growth do Criador de Conteúdo
output: |
  - parametros_busca: Lista de perfis e palavras-chave para extração
---

# Definir Parâmetros

Analisa o relatório de engajamento do Criador de Conteúdo e define quais perfis de LinkedIn/Twitter devem ser investigados como leads B2B.

## Processo

1. Leia o `growth-report.md` e identifique os posts publicados na semana.
2. Extraia os nomes/perfis de pessoas que comentaram ou interagiram.
3. Filtre por perfis com potencial B2B: empresários, donos de clínica, advogados, imobiliárias, agências.
4. Gere a lista de perfis-alvo com palavras-chave de busca para enriquecimento.

## Output Format

```yaml
parametros:
  posts_origem:
    - plataforma: "LinkedIn"
      titulo: "..."
      data: "..."
  perfis_alvo:
    - nome: "..."
      plataforma: "LinkedIn/Twitter"
      url_perfil: "..."
      potencial: "Alto/Médio/Baixo"
  strings_busca:
    - "site {nome} {empresa}"
    - "contato {nome} {cargo}"
```

## Output Example

```yaml
parametros:
  posts_origem:
    - plataforma: "LinkedIn"
      titulo: "Por que programar do zero em 2026 é queimar dinheiro"
      data: "2026-06-02"
  perfis_alvo:
    - nome: "Dr. Carlos Silva"
      plataforma: "LinkedIn"
      url_perfil: "linkedin.com/in/carlos-silva"
      potencial: "Alto"
  strings_busca:
    - "site Clínica OdontoCare São Paulo"
    - "contato Dr. Carlos Silva OdontoCare"
```

## Quality Criteria
- [ ] Perfis filtrados têm potencial B2B real (decisores empresariais).
- [ ] As strings de busca são específicas para encontrar contato profissional.
- [ ] Foco em São Paulo / Região Metropolitana quando identificável.

## Veto Conditions
Reject and redo if ANY are true:
1. Nenhum perfil com potencial B2B foi identificado.
2. Os parâmetros não incluem dados do relatório de engajamento.
