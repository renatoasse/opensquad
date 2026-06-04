---
task: "Enviar Email de Boas-Vindas"
order: 2
input: |
  - cliente: nome e email
  - repositorio: url privada criada
  - formulario_onboarding: url do formulario tecnico
output: |
  - email_status: sent ou failed
---

# Enviar Email de Boas-Vindas

Envie um email premium e curto via `email_sender` com o link do repositorio e o formulario de onboarding tecnico.

## Requisitos

1. Assunto sugerido: `Seu setup Aline Dev ja foi iniciado`.
2. Citar explicitamente que o pagamento foi confirmado.
3. Mostrar o link do repositorio privado.
4. Mostrar apenas um CTA principal: preencher o formulario tecnico.

## Output Format

```markdown
# Email Boas-Vindas

- to: cliente@email.com
- subject: Seu setup Aline Dev ja foi iniciado
- status: sent
```

## Quality Criteria

- [ ] O email inclui a URL do repositorio.
- [ ] O email inclui a URL do formulario.
- [ ] O texto mantem tom premium e objetivo.
