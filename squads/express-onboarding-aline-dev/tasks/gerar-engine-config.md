---
task: "Gerar Engine Config"
order: 2
input: |
  - briefing_normalizado
output: |
  - engine-config.json
---

# Gerar Engine Config

Produza o arquivo `engine-config.json` da nova White-Label Engine do cliente.

## Requisitos

1. Gerar JSON valido e parseavel.
2. Incluir cliente, nicho, branding, modulos e origem do formulario.
3. Mapear apenas os modulos necessarios ao MVP.
4. Preservar nomes tecnicos em ingles nas chaves da config.

## Output Example

```json
{
  "client": "Aline Cliente",
  "niche": "clinica odontologica",
  "branding": {
    "primary": "#0F172A",
    "secondary": "#F8FAFC"
  },
  "modules": ["crm", "lead_capture", "whatsapp"],
  "source": {
    "trigger": "aline_builds_form"
  }
}
```
