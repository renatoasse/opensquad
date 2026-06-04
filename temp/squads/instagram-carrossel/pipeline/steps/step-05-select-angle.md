---
step: "05"
name: "Seleção de Ângulo"
type: checkpoint
depends_on: step-04
---

# 🛑 Checkpoint: Seleção de Ângulo

## Para o Pipeline Runner

Apresentar ao usuário os 5 ângulos gerados pelo Carlos Carrossel e aguardar seleção.

## Formato de Apresentação ao Usuário

Ler `output/angles-brief.yaml` e apresentar no formato:

```
✍️ Carlos Carrossel gerou 5 ângulos para o carrossel.
⭐ Ângulo recomendado: #[X] — [justificativa]

---
1️⃣ [Título] — [tipo: Revelador/Comparativo/etc.]
Hook: [hook_draft completo]
Estrutura: [slide_structure resumido]
✅ Força: [strength] | ⚠️ Risco: [weakness]

---
2️⃣ [Título] — [tipo]
...

---
Qual ângulo quer desenvolver? (responda com o número)
Ou: descreva ajustes que quer fazer em algum ângulo
```

## Ação do Pipeline Runner após Seleção

1. Registrar o ângulo selecionado e qualquer ajuste do usuário
2. Salvar em `output/selected-angle.yaml`:

```yaml
angle_id: 1
angle_title: "Nome do ângulo"
angle_type: "Revelador"
hook_draft: "[hook exato do ângulo selecionado]"
slide_structure:
  - slide_2: "Tema do slide 2"
  - slide_3: "Tema do slide 3"
  - slide_4: "Tema do slide 4"
  - slide_5: "Tema do slide 5"
  - slide_6: "Reflexão"
  - slide_7: "CTA"
user_adjustments: "[ajustes solicitados, ou vazio]"
selected_at: "YYYY-MM-DD HH:MM"
```

3. Avançar para Step 06 (Carlos Carrossel — Criação do Copy)

## Opções Especiais

- **"0" ou "nenhum"** → Solicitar que Carlos Carrossel gere novos ângulos com perspectivas diferentes. Voltar ao Step 04.
- **"ajustar [N]"** → Registrar o ajuste em `user_adjustments` antes de avançar
- **"combinar [N] e [M]"** → Pedir ao Carlos para criar um ângulo híbrido antes de avançar
