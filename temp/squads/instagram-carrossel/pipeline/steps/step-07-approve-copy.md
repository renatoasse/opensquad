---
step: "07"
name: "Aprovação do Texto"
type: checkpoint
depends_on: step-06
---

# 🛑 Checkpoint: Aprovação do Texto

## Para o Pipeline Runner

Apresentar ao usuário o copy completo (todos os slides + legenda) e aguardar aprovação antes de passar para o Designer.

## Formato de Apresentação ao Usuário

Ler `output/carousel-draft.md` e apresentar no formato:

```
✍️ Carlos Carrossel concluiu o texto do carrossel!

📝 **SLIDE 1 (Hook):**
[Mostrar o copy completo do slide 1]

📝 **SLIDES 2-N (Resumo):**
[Listar um bullet por slide com o headline ou ponto central]

📝 **LEGENDA:**
[Mostrar os primeiros 150 chars]...
[Hashtags]

---
O texto está bom para o Designer criar as imagens?

1. ✅ Aprovar e avançar para o Designer
2. 🔄 Pedir ajustes no texto → Carlos refaz apenas o solicitado
3. ↩️ Voltar ao ângulo → Escolher um ângulo diferente
```

## Ação do Pipeline Runner após Decisão

### Se opção 1 (Aprovar):
- Avançar para Step 08 (Davi Design — Proposta Visual)

### Se opção 2 (Ajustes de texto):
- Coletar as instruções específicas do usuário
- Retornar ao Step 06 com contexto das correções solicitadas
- O Carlos Carrossel refaz APENAS as partes indicadas
- Após correções, retornar ao Step 07

### Se opção 3 (Novo ângulo):
- Retornar ao Step 05 (seleção de ângulo)
- Preservar o insights-brief.yaml existente
