---
type: checkpoint
---

# Step 13: Aprovação para publicar

## Contexto

O carrossel foi renderizado (imagens em `squads/insta-mvp/output/{run_id}/images/`) e a legenda está em `caption-final.md`. O skill instagram-publisher será usado no step 14. O usuário deve confirmar que deseja publicar.

## Instruções

1. Apresentar preview: número de imagens, legenda completa (texto + hashtags), conta (Instagram Business configurada no .env).
2. Lembrar: dry-run pode ser feito no step 14 antes de publicar de verdade.
3. Perguntar: "Publicar este carrossel no Instagram? (1. Sim, publicar / 2. Fazer dry-run primeiro / 3. Não, cancelar)"
4. Se Sim ou Dry-run: seguir para step 14. Se Não: encerrar sem publicar.

## Output

Escolha do usuário. Runner avança para step-14 com flag dry-run ou publish.
