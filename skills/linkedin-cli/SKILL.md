---
name: linkedin-cli
description: "Agendamento e publicação no LinkedIn via CLI (@linkedapi/linkedin-cli)."
type: script
version: "1.0.0"
script:
  path: "scripts/linkedin-publisher.js"
  runtime: node
  dependencies: ["@linkedapi/linkedin-cli"]
categories: [social-media, content, marketing]
env: [LINKED_API_TOKEN, IDENTIFICATION_TOKEN]
---

# LinkedIn Publisher CLI

Use esta skill para agendar e publicar posts no LinkedIn.

## Instruções
- Use `linkedin setup` com os tokens fornecidos pelo usuário se falhar a autenticação.
- Use `linkedin post create '<text>'` para postagens simples.
- Use `--attachments "url:image"` para incluir imagens geradas pelo Davi Design.
- Sempre use `--json -q` para saída amigável à máquina.

## Exemplo de Comando (pelo agente Sofia Social)
`linkedin post create 'Conteúdo do artigo...' --attachments 'https://url-imagem.png:image' --json -q`
