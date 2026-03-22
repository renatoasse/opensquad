---
task: coletar-perfis-sociais
order: 1
agent: orlando-osint
input: Lista de investigados (nomes, CPFs, apelidos) — de research-focus.md
output: Relatório de perfis sociais por investigado
---

## Process

1. Para cada investigado na lista, buscar em: Instagram, Facebook, X/Twitter, TikTok, LinkedIn, YouTube
2. Usar WebSearch com variações: nome completo, nome + cidade, apelido, username comum
3. Para cada perfil encontrado: coletar URL, username, seguidores, bio, posts relevantes, vínculos declarados, empresas mencionadas
4. Aplicar reverse image search na foto de perfil principal
5. Verificar se o mesmo username aparece em múltiplas plataformas
6. Cruzar geolocalização de posts públicos com endereços conhecidos

## Output Format

```yaml
investigado: "[Nome Completo]"
cpf: "[CPF]"
perfis:
  - plataforma: "[Instagram/Facebook/etc]"
    username: "[username]"
    url: "[URL]"
    acessado: "[YYYY-MM-DD]"
    seguidores: [número]
    observacoes: "[achados relevantes]"
    confianca: "[Alta/Média/Baixa]"
nao_localizado:
  - "[plataforma não encontrada]"
```

## Output Example

```yaml
investigado: "João Silva Santos"
cpf: "000.000.000-00"
perfis:
  - plataforma: Instagram
    username: "@joaosilva_js"
    url: "https://instagram.com/joaosilva_js"
    acessado: "2026-03-22"
    seguidores: 1240
    observacoes: "Localização frequente SP/SC. Fotos com veículos de luxo. Menciona JS Construções."
    confianca: "Alta"
  - plataforma: Facebook
    username: "joao.silva.santos.342"
    url: "https://facebook.com/joao.silva.santos.342"
    acessado: "2026-03-22"
    seguidores: 450
    observacoes: "Vínculos com Carlos Menezes e Pedro Antunes. Cidade natal Campinas/SP."
    confianca: "Alta"
nao_localizado:
  - LinkedIn
  - TikTok
  - YouTube
```

## Quality Criteria

- [ ] Todas as plataformas verificadas (incluindo "Não localizado")
- [ ] URL e data de acesso registrados para cada perfil
- [ ] Nível de confiança atribuído
- [ ] Observações com achados específicos

## Veto Conditions

- Investigado principal sem nenhuma busca realizada → refazer
- Achado sem URL registrado → refazer
