---
task: "Extrair Leads"
order: 2
input: |
  - parametros_busca: Perfis-alvo e strings de busca
output: |
  - dados_brutos: Lista de leads encontrados com contatos
---

# Extrair Leads de Redes Sociais

Executa a varredura nos perfis identificados nas redes sociais e busca informações de contato profissional (site, e-mail, telefone) via web_search.

## Processo

1. Para cada perfil-alvo, visite o perfil do LinkedIn/Twitter e identifique a empresa de cada lead.
2. Use `web_search` para encontrar o site, e-mail de contato e telefone da empresa.
3. Registre o cargo e a relevância B2B do lead.
4. Repita até extrair dados de contato de pelo menos 3 leads.

## Output Format

```yaml
dados_brutos:
  - nome: "..."
    perfil_url: "..."
    empresa: "..."
    cargo: "..."
    site: "..."
    telefone: "..."
    email: "..."
    fit_b2b: "Alto/Médio/Baixo"
    origem: "LinkedIn/Twitter"
```

## Output Example

```yaml
dados_brutos:
  - nome: "Dr. Carlos Silva"
    perfil_url: "linkedin.com/in/carlos-silva"
    empresa: "Clínica OdontoCare"
    cargo: "Diretor Clínico"
    site: "https://odontocare.com.br"
    telefone: "(11) 99999-8888"
    email: "carlos@odontocare.com.br"
    fit_b2b: "Alto"
    origem: "LinkedIn"
```

## Quality Criteria
- [ ] Foram usados métodos de busca ativos (web_search) e não alucinação de dados.
- [ ] Pelo menos metade dos leads possui e-mail ou telefone preenchido.
- [ ] Cada lead tem o link do perfil de origem registrado.

## Veto Conditions
Reject and redo if ANY are true:
1. Mais de 50% dos dados gerados são nitidamente falsos.
2. Nenhum lead teve contato (e-mail ou telefone) encontrado.
