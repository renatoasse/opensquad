---
step: "09"
name: "Seleção de Identidade Visual"
type: checkpoint
depends_on: step-08
---

# 🛑 Checkpoint: Seleção de Identidade Visual

## Para o Pipeline Runner

Apresentar ao usuário as 3 identidades visuais propostas pelo Davi Design e aguardar seleção.

## Formato de Apresentação ao Usuário

Ler `output/visual-identities.yaml` e apresentar no formato:

```
🎨 Davi Design propôs 3 identidades visuais para o carrossel.

---
1️⃣ [Nome da identidade 1] — [mood]
🎨 Fundo: [bg_color] | Acento: [accent_color] | Fonte: [font_family]
👁️ Visual: [preview_description — descreve como vai parecer]

---
2️⃣ [Nome da identidade 2] — [mood]
...

---
3️⃣ [Nome da identidade 3] — [mood]
...

---
Qual identidade visual prefere para este carrossel? (responda com o número)
Ou: descreva o que mudaria em alguma das opções
```

## Ação do Pipeline Runner após Seleção

1. Registrar a identidade selecionada e qualquer ajuste
2. Salvar em `output/selected-visual.yaml`:

```yaml
visual_id: 1
name: "Nome da identidade"
mood: "mood da identidade"
bg_color: "#000000"
accent_color: "#FF4757"
font_family: "Inter"
preview_description: "descrição do visual"
user_adjustments: "[ajustes solicitados, ou vazio]"
selected_at: "YYYY-MM-DD HH:MM"
```

3. Avançar para Step 10 (Davi Design — Criação dos Slides)

## Opções Especiais

- **"outra"** → Solicitar ao Davi Design que proponha 3 novas identidades. Voltar ao Step 08.
- **"[número] + ajuste"** → Registrar o ajuste em `user_adjustments` antes de avançar
