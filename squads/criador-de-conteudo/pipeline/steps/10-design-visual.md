---
agent: daniel-design
step: design_visual
execution: inline
model_tier: powerful
inputFile: "squads/criador-de-conteudo/output/content-pack.md"
outputFile: "squads/criador-de-conteudo/output/design-brief.md"
---

# Step 10 — Daniel Design: Infográfico e Artes

## Objetivo
Davi Design cria a identidade visual para o conteúdo da semana: um infográfico premium no estilo Aline Builds.

## Processo

1. **Leia** o Content Pack em `squads/criador-de-conteudo/output/content-pack.md`.
2. **Extraia** o texto do infográfico (dado central, título, legenda).
3. **Gere a imagem** do infográfico usando a skill `canva-automation` com as especificações abaixo:

### Especificações para Canva

```
Formato: 1080x1350px (LinkedIn Portrait)
Fundo: #0C0C0C (preto profundo)
Destaque principal: [dado central do content-pack]
Título: [título do content-pack]
Subtexto: [legenda do content-pack]
Branding sutil: "Aline Builds" no rodapé em cinza claro
Tipografia: Inter Bold para o dado, Roboto Regular para o subtexto
Cores de destaque: gradiente roxo-azul vibrante (#7C3AED a #2563EB)
Estilo: Glassmorphism leve, sem stock photos, visual tech/futurista
```

4. **Workflow no Canva:**
   - Buscar template: "SaaS dark infographic" no Canva via `canva-automation`
   - Substituir o dado central com o texto do Caio
   - Ajustar cores para a paleta Aline Builds
   - Exportar como PNG de alta qualidade

5. **Salve o brief de design** com as especificações e confirmação de geração.

## Formato de Saída

Salve em `squads/criador-de-conteudo/output/design-brief.md`:

```markdown
# Design Brief — [Nome do SaaS]
**Criado por:** Davi Design | **Data:** [data]

## Infográfico (1080x1350)

### Prompt Gerado para canva-automation
[especificações completas do design]

### Especificações de Design
- Fundo: #0C0C0C
- Fonte título: Inter Bold 72px
- Fonte dado: Inter ExtraBold 96px
- Cor destaque: #7C3AED → #2563EB (gradiente)
- Logo Aline Builds: rodapé, 12pt, cinza #888

### Dados de Conteúdo
- **Dado principal:** [do content-pack]
- **Título:** [do content-pack]
- **Legenda:** [do content-pack]

### Instruções para Canva (opcional)
[passo-a-passo para a Aline customizar manualmente]

### Status
☐ Imagem gerada via AI
☐ Aprovada pela Vera
☐ Pronta para post
```

## Notificação Telegram
Após salvar o output, notifique no seu tópico do Telegram:
- Leia `pipeline/data/telegram-config.yaml` para seu `thread_id` (daniel-design)
- Envie: `🎨 *Daniel Design:* Infográfico gerado! Tema: {tema} — Formato 1080x1350`
- Use a skill `telegram-bridge` para enviar a mensagem

## Veto Conditions
- O infográfico deve ser legível em tela de celular (mínimo 24pt para texto secundário).
- O branding da Aline Builds deve aparecer discretamente mas visivelmente.
- Sem cores vibrantes sobre fundo claro — apenas dark mode.
