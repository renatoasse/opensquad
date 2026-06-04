---
step: "11"
name: "Aprovação das Imagens"
type: checkpoint
depends_on: step-10
---

# 🛑 Checkpoint: Aprovação das Imagens

## Para o Pipeline Runner

Apresentar ao usuário as imagens renderizadas e aguardar aprovação explícita antes de publicar.

## Formato de Apresentação ao Usuário

```
🎨 Davi Design concluiu os slides!

🖼️ SLIDES RENDERIZADOS
[Mostrar/listar as imagens em output/slides/rendered/]:
- slide-01.png
- slide-02.png
- ... (total: N slides)

📝 TEXTO APROVADO
Slide 1: [headline do slide 1]
...

📱 LEGENDA
[Mostrar os primeiros 200 chars da legenda]...

---
As imagens estão aprovadas para publicação?

1. ✅ Aprovar e publicar
2. 🔄 Pedir ajustes nas imagens → Davi refaz o solicitado
3. 📝 Pedir ajustes no texto → Carlos refaz, depois Davi recria os slides
4. ↩️ Mudar identidade visual → Voltar para seleção de visual
```

## Ação do Pipeline Runner após Decisão

### Se opção 1 (Aprovar):
- Avançar para Step 12 (Revisor — opcional) ou Step 13 (Publisher) se Revisor for pulado

### Se opção 2 (Ajustes visuais):
- Coletar instruções específicas do usuário
- Retornar ao Step 10 com contexto das correções
- O Davi Design refaz apenas os slides/elementos indicados e re-renderiza
- Após correções, retornar ao Step 11

### Se opção 3 (Ajustes de texto):
- Coletar instruções específicas
- Retornar ao Step 06 com contexto das correções
- Após correções de copy, retornar ao Step 10 para re-renderizar
- Após nova renderização, retornar ao Step 11

### Se opção 4 (Nova identidade visual):
- Retornar ao Step 09 (seleção de identidade visual)
- Preservar carousel-draft.md existente
