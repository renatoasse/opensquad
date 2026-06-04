---
task: "Criar Repositorio Privado"
order: 1
input: |
  - payload_hotmart: nome do cliente, email e transaction_id
output: |
  - repositorio: url, owner, name, visibility
---

# Criar Repositorio Privado

Crie um repositorio privado para o cliente usando `github_api`. O slug deve ser previsivel, legivel e auditavel, preferindo o padrao `engine-[nome-cliente]`.

## Processo

1. Normalizar o nome do cliente para slug.
2. Criar o repositorio como `private`.
3. Registrar URL final e identificadores do repo.
4. Se a criacao falhar, retornar erro estruturado para impedir o envio do email.

## Output Format

```yaml
repositorio:
  name: "engine-nome-cliente"
  visibility: "private"
  url: "https://github.com/org/engine-nome-cliente"
  status: "created"
```

## Quality Criteria

- [ ] O repositorio foi criado com visibilidade `private`.
- [ ] O nome do repo e derivado do cliente ou pedido.
