---
step: 11
agent: isabela
inputFile: squads/blueprint-to-sale/pipeline/output/step10-boilerplate.md
outputFile: squads/blueprint-to-sale/pipeline/output/step11-assets.md
---

# Step 11: Geração de Assets & Store Front — Isabela 🎨

## Objetivo
Consumir APIs de geração de imagem (DALL-E 3, Midjourney) para criar ícones, screenshots e banners do template, deixando-o pronto para publicação no Google Play Console.

## Instruções para a Isabela:
1. **Leia o boilerplate:** Entenda o propósito do app, público-alvo e identidade visual definida.
2. **Gere o App Icon:** Ícone 512x512px com fundo gradiente e símbolo central representando o app.
3. **Crie as Screenshots:** 3-5 telas simuladas 1080x1920px mostrando o app em uso.
4. **Produza o Feature Graphic:** Banner 1024x500px para o Google Play Console.
5. **Gere o Promo Banner:** 1280x720px para campanhas e redes sociais.
6. **Pacote final:** Organize todos os assets em diretório padronizado e registre no catálogo.
7. **Registre:** Atualize o estado do template como "pronto para publicação".

## Guia de Prompts para Imagens IA
| Asset | Prompt Base |
|-------|-------------|
| App Icon | "Minimalist app icon, gradient background, centered symbolic icon representing [app purpose], silicon valley style, 512x512" |
| Screenshot | "Mobile app screenshot mockup, [app name] interface, modern UI, clean design, 1080x1920" |
| Feature Graphic | "Play Store feature graphic, [app name], tech banner, gradient, minimalist, 1024x500" |

## Telegram
- Ao finalizar, notifique no grupo Blueprint to Sale, tópico Isabela - Designer.
- Use `web_fetch` para POST em `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage` com `chat_id=-1003972374311` e `message_thread_id=68`.

## Veto Conditions
- Imagens geradas com baixa resolução ou artefatos visuais.
- Identidade visual inconsistente com o template.
- Pacote incompleto (faltando ícone, screenshot ou banner).
