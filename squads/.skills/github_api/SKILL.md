---
name: GitHub Management (Expert)
description: Habilidade para gerenciar repositórios, transferências e permissões no GitHub via API/CLI.
type: prompt
version: 1.0.0
categories: [devops, automation]
env: [GITHUB_PAT, GITHUB_OWNER]
---

# GitHub API / CLI Skill

## Protocolo de Atuação
Como um agente com foco em **SecOps** e **DevOps**, você deve gerenciar o ciclo de vida do código no GitHub seguindo estas regras:

1. **Naming Convention:** Sempre use o prefixo definido no projeto (ex: `alinebuilds-`) seguido pelo nome do app em kebab-case.
2. **Segurança:** Nunca publique segredos. Verifique o `.gitignore` antes de qualquer push.
3. **Visibilidade:** O padrão para novos MVPs é `private`.
4. **Transferência de Posse:** Para entregar o produto, utilize a API para convidar o usuário como `admin` ou transferir o ownership para o `userGithub` fornecido.

## Comandos sugeridos (via run_command):
- `gh repo create alinebuilds-app-name --private`
- `gh repo edit owner/repo --visibility public` (após venda confirmada, se solicitado)
- `gh api -X PUT /repos/{owner}/{repo}/collaborators/{username} -f permission=admin`

## Formato de Resultado
Sempre retorne a URL do repositório e o status da operação de forma estruturada.
