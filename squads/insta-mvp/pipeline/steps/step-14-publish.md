---
execution: inline
agent: null
inputFile: squads/insta-mvp/output/caption-final.md
outputFile: squads/insta-mvp/output/publish-result.md
---

# Step 14: Publicação no Instagram

## Context Loading

- `squads/insta-mvp/output/{run_id}/images/` — JPEGs do carrossel (01.jpg … 0N.jpg)
- `squads/insta-mvp/output/{run_id}/caption-final.md` — legenda completa (texto + hashtags)
- `skills/instagram-publisher/SKILL.md` — instruções do skill

## Instructions

1. Listar imagens em `squads/insta-mvp/output/{run_id}/images/` (JPEG, ordenadas por nome).
2. Extrair caption de caption-final.md (texto + hashtags; máx 2200 caracteres).
3. Se o usuário escolheu dry-run no step 13: executar o script do skill com `--dry-run`. Caso contrário: apresentar preview final e pedir confirmação explícita ("publicar" ou "pode publicar"), então executar sem --dry-run.
4. Invocar skill instagram-publisher conforme SKILL.md:
   - `node --env-file=.env squads/insta-mvp/tools/publish.js --images "<paths>" --caption "<caption>"` (ou path do skill conforme instalação)
   - Adicionar `--dry-run` se for teste.
5. Gravar resultado (post URL, post ID ou erro) em `squads/insta-mvp/output/{run_id}/publish-result.md`.
6. Informar o usuário: sucesso (link do post) ou falha (mensagem e sugestão).

## Output Format

Arquivo publish-result.md com: success (boolean), post_url (se sucesso), post_id (se sucesso), error (se falha).

## Veto Conditions

- Nunca publicar sem confirmação explícita do usuário (exceto em dry-run).
- Validar: 2–10 imagens JPEG; caption ≤ 2200 caracteres.

## Quality Criteria

- [ ] Skill invocado com parâmetros corretos.
- [ ] Resultado registrado e reportado ao usuário.
