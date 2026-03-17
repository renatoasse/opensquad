# Resultado da publicação — nao-e-mais-sobre-qual-modelo-usar_2026-03-17

success: false
post_url: null
post_id: null
error: "Error validating access token: Session has expired on Monday, 16-Mar-26 22:00:00 PDT. The current time is Tuesday, 17-Mar-26 02:04:43 PDT. (OAuthException 190, subcode 463)"

## O que foi feito

- **Legenda:** Usada a descrição SEO de `v1/caption-final.md` (texto + hashtags), gravada em `caption-publish.txt` para uso no script.
- **Imagens:** 8 JPEGs em `images/01.jpg` … `08.jpg` enviados com sucesso para o imgbb.
- **Instagram:** A chamada à API falhou porque o **token de acesso expirou** (válido até 16-Mar-26). Tokens de longa duração do Facebook/Instagram duram 60 dias e precisam ser renovados.

## Como publicar depois de renovar o token

1. **Renovar o token** no [Graph API Explorer](https://developers.facebook.com/tools/explorer/), trocando o token de curta duração por um de longa duração (60 dias) e atualizar o `.env` na raiz do projeto com o novo `INSTAGRAM_ACCESS_TOKEN`.

2. **Rodar de novo o script** (na raiz do projeto):
   ```powershell
   $imgDir = "squads/insta-mvp/output/nao-e-mais-sobre-qual-modelo-usar_2026-03-17/images"
   $imgs = (1..8) | ForEach-Object { "$imgDir/0$_.jpg" }
   $imgList = $imgs -join ","
   node --env-file=.env skills/instagram-publisher/scripts/publish.js --images $imgList --caption-file "squads/insta-mvp/output/nao-e-mais-sobre-qual-modelo-usar_2026-03-17/caption-publish.txt"
   ```

A legenda já está pronta com a descrição SEO (gancho, corpo, CTA e hashtags).
