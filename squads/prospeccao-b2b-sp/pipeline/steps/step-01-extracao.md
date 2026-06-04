---
execution: subagent
agent: "squads/prospeccao-b2b-sp/agents/tati-tracker"
outputFile: "squads/prospeccao-b2b-sp/output/leads-formatados.md"
model_tier: fast
---

# Step 01: Extração de Leads B2B de Engajamento Social

## Context Loading

Load these files before executing:
- `squads/criador-de-conteudo/output/growth-report.md` — Relatório Growth do squad Criador de Conteúdo (contém dados de engajamento dos posts de terça/quinta).
- `_opensquad/core/best-practices/researching.md` — Framework de pesquisa e validação de fontes.

## Instructions

### Process
1. **Leia o relatório da Geórgia** em `squads/criador-de-conteudo/output/growth-report.md` para identificar os posts publicados e o engajamento gerado.
2. **Execute `definir-parametros.md`** para definir os critérios de busca: foco em perfis de LinkedIn/Twitter que interagiram com os posts (comentários, likes, compartilhamentos).
3. **Execute `extrair-leads.md`** usando `web_search` e `web_fetch` para:
   - Visitar os perfis de quem comentou/curtiu nos posts
   - Identificar se são potenciais leads B2B (empresários, donos de clínica, advogados, imobiliárias)
   - Extrair contato (site, e-mail, telefone) do perfil ou da empresa deles
4. **Execute `formatar-lista.md`** para gerar a tabela de leads classificados por fit B2B.

## Output Format

A saída DEVE seguir esta estrutura exata:
```markdown
# Leads B2B Extraídos de Engajamento Social

## Post de Origem
- **Plataforma:** [LinkedIn / Twitter]
- **Título do Post:** [título]
- **Data:** [data]
- **Engajamento Total:** [likes + comentários + compartilhamentos]

## Critérios de Extração
- Perfis de empresários, donos de negócio, profissionais liberais (advogados, médicos)
- Foco em São Paulo / Região Metropolitana (quando identificável)

## Lista de Leads

| Nome | Perfil | Empresa | Cargo | Contato | Fit B2B |
|------|--------|---------|-------|---------|---------|
| [Nome] | [URL LinkedIn/Twitter] | [Empresa] | [Cargo] | [Email/Tel] | [Alto/Médio/Baixo] |
```

## Output Example

# Leads B2B Extraídos de Engajamento Social

## Post de Origem
- **Plataforma:** LinkedIn
- **Título do Post:** "Por que programar do zero em 2026 é queimar dinheiro"
- **Data:** 2026-06-02
- **Engajamento Total:** 45 likes, 12 comentários, 8 compartilhamentos

## Lista de Leads

| Nome | Perfil | Empresa | Cargo | Contato | Fit B2B |
|------|--------|---------|-------|---------|---------|
| Dr. Carlos Silva | linkedin.com/in/carlos-silva | Clínica OdontoCare | Diretor | carlos@odontocare.com.br | Alto |
| Ana Beatriz | linkedin.com/in/ana-beatriz | Escritório Silva Adv | Sócia | ana@silvaadv.com.br | Alto |
| João Mendes | twitter.com/@joaomendes | Agência Mendes Digital | CEO | joao@mendes.digital | Médio |

## Veto Conditions

Reject and redo if ANY of these are true:
1. A tabela não foi gerada em Markdown válido.
2. Menos de 3 leads foram encontrados.
3. Leads foram inventados sem verificação de perfil real.

## Notificação Telegram
Após salvar o output, notifique no seu tópico do Telegram:
- Leia `pipeline/data/telegram-config.yaml` para seu `thread_id` (tati-tracker: 7)
- Envie: `🕵️‍♀️ *Tati Tracker:* Leads extraídos! {N} leads encontrados a partir de {N} posts do Criador de Conteúdo`
- Use a skill `telegram-bridge` para enviar a mensagem

## Quality Criteria

- [ ] Pelo menos 3 leads válidos com informações de contato úteis.
- [ ] Leads são provenientes de interações reais nos posts (não inventados).
- [ ] Cada lead tem o link do perfil de origem registrado.
- [ ] Classificação de Fit B2B está coerente (Alto = decisor, Médio = influenciador, Baixo = não encontrado).
