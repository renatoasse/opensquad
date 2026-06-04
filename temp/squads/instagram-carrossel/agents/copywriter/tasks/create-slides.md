---
task: "Create Slides"
order: 1
input:
  - selected_angle: Ângulo escolhido pelo usuário no checkpoint (id + título)
  - insights_brief: Output completo de extract-insights.md com todos os fatos verificados
  - angle_structure: Estrutura de slides sugerida pelo ângulo selecionado em identify-angles.md
  - tone_guide: pipeline/data/tone-of-voice.md
  - examples: pipeline/data/output-examples.md
  - anti_patterns: pipeline/data/anti-patterns.md
output:
  - slides_copy: Copy completo de todos os slides (7-9 slides)
  - caption: Legenda completa com hashtags
  - carousel_draft_path: Salvo em output/carousel-draft.md
---

# Create Slides

Cria o copy completo de cada slide do carrossel com base no ângulo selecionado, usando dados verificados do brief e seguindo o tom aprovado da marca Sem Codar.

## Process

1. **Carregar todos os inputs.** Ler: ângulo selecionado + estrutura de slides + brief de insights + guia de tom. Ter toda informação disponível antes de escrever uma linha.

2. **Validar que o ângulo selecionado tem dados suficientes.** Confirmar que o brief contém dados verificados adequados para o hook e pelo menos 5 slides de conteúdo. Se não houver dados suficientes, reportar e sugerir busca complementar.

3. **Escrever slide 1 primeiro — isoladamente.** O slide 1 é o mais crítico. Escrever, revisar pela perspectiva do scroll-stop test, e só avançar quando o hook passar no teste.
   - Critério de aprovação: "Se eu visse isso no feed sem saber o que é a Sem Codar, eu pararia?"
   - Formato ideal: Dado/número em destaque + contexto de 1 linha + indicação de swipe implícita ou explícita

4. **Seguir a estrutura de slides do ângulo, slide a slide.** Para cada slide de conteúdo:
   - Uma ideia principal
   - Máximo 4-5 linhas visíveis
   - Conectar com o slide anterior (causa × efeito, dado → implicação, problema → agravamento)
   - Nunca repetir informação já dita em slide anterior

5. **Penúltimo slide de conteúdo = Reflexão.** Obrigatório. A reflexão não é um dado novo — é a síntese emocional do que foi apresentado. Uma pergunta, afirmação ou perspectiva que o leitor não tinha antes de ler o carrossel.

6. **Último slide = CTA específico.** O CTA menciona especificamente o conteúdo do carrossel. Inclui 2 ações: uma de save ("salva esse carrossel porque...") e uma de engajamento ("comenta...").

7. **Escrever a legenda.** A legenda é uma versão ampliada e conectada do hook do slide 1. Inclui: abertura (primeiros 125 chars = mais visíveis antes do "ver mais"), corpo, e hashtags ao final. Máximo: 2.000 chars (manter margem de segurança).

8. **Salvar em output/carousel-draft.md.** Formatar no padrão de output abaixo e salvar.

## Output Format

Salvar em `output/carousel-draft.md`:

```markdown
# Carrossel — [Título do Ângulo]
**Ângulo:** [tipo]
**Data:** YYYY-MM-DD
**Status:** Draft

## Slides

### Slide 1 — Hook
[Texto exato do slide 1 — código copy visual aqui]

### Slide 2 — [Tema]
[Texto do slide 2]

### Slide N — Reflexão
[Texto da reflexão]

### Slide Final — CTA
[Texto do CTA]

## Legenda
[Legenda completa com quebras de linha e hashtags ao final]

## Notas de Produção
- Dado âncora principal: [dado]
- Fonte principal: [fonte]
- Tom predominante: [ex: Revelador / Didático]
- Slide count: [N]
```

## Quality Checklist (Auto-Verify Before Delivering)

- [ ] Slide 1 tem dado específico com fonte — não afirmação vaga
- [ ] Nenhum slide tem mais de 5 linhas visíveis
- [ ] Cada slide conecta ao anterior com lógica clara
- [ ] Existe slide de reflexão (penúltimo de conteúdo)
- [ ] CTA menciona especificamente o conteúdo do carrossel
- [ ] Contagem de slides: entre 7 e 9
- [ ] Legenda abaixo de 2.000 caracteres
- [ ] Hashtags ao final da legenda, não misturadas ao texto

## Veto Conditions

Rejeitar e reescrever se:
1. Slide 1 começa com nome da marca, apresentação, ou "hoje vamos falar sobre"
2. Qualquer afirmação factual sem dado específico ou fonte (para textos com dados disponíveis no brief)
3. Nenhum slide de reflexão no carrossel
4. CTA é "nos siga para mais conteúdo" ou equivalente
